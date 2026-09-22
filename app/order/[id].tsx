import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, ScreenHeader, StatusBadge, uiStyles } from '@/components/AppUI';
import { DetailsSkeleton } from '@/components/Skeletons';
import { useApp } from '@/context/AppContext';
import { type Job } from '@/data/mock';
import { useColors } from '@/hooks/useColors';
import { api } from '@/services/api';

type OrderHistoryItem = {
  id: string;
  status: string;
  action: string;
  description: string;
  created_at: string;
};

type OrderNoteItem = {
  id: string;
  note: string;
  name?: string;
  admin_name?: string;
  created_at: string;
};

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobs, updateJobStatus } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [notes, setNotes] = useState<OrderNoteItem[]>([]);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const [statusOpen, setStatusOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [updatingFilmApplied, setUpdatingFilmApplied] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const [res, statusesRes, notesRes] = await Promise.all([
      api.getOrderDetails(id),
      api.getStatuses(),
      api.getOrderNotes(id),
    ]);

    if (statusesRes.success && Array.isArray(statusesRes.data)) {
      setAvailableStatuses(statusesRes.data);
    }

    if (notesRes.success && Array.isArray(notesRes.data)) {
      setNotes(notesRes.data);
    }

    if (res.success && res.data) {
      const rawData = res.data;
      setJob({
        ...rawData,
        filmApplied: Boolean(rawData.film_applied ?? rawData.filmApplied ?? false),
      });
      if (Array.isArray(res.data.history)) {
        setHistory(res.data.history);
      }
      if (Array.isArray(res.data.notes) && res.data.notes.length > 0) {
        setNotes(res.data.notes);
      }
    } else {
      const localMatch = jobs.find((item) => item.id === id);
      if (localMatch) {
        setJob(localMatch);
      } else {
        setError(res.message || 'Order not found');
      }
    }
    setLoading(false);
  };

  const handleToggleFilmApplied = async (newValue: boolean) => {
    if (!id || !job || updatingFilmApplied) return;
    setUpdatingFilmApplied(true);
    setJob((prev) => (prev ? { ...prev, filmApplied: newValue } : null));

    const res = await api.updateFilmApplied(id, newValue);
    setUpdatingFilmApplied(false);

    if (res.success) {
      const updatedRes = await api.getOrderDetails(id);
      if (updatedRes.success && updatedRes.data) {
        setJob({
          ...updatedRes.data,
          filmApplied: Boolean(updatedRes.data.film_applied ?? updatedRes.data.filmApplied ?? newValue),
        });
        if (Array.isArray(updatedRes.data.history)) {
          setHistory(updatedRes.data.history);
        }
      }
    } else {
      setJob((prev) => (prev ? { ...prev, filmApplied: !newValue } : null));
    }
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim() || submittingNote) return;
    setSubmittingNote(true);
    const res = await api.addOrderNote(id, newNote.trim());
    setSubmittingNote(false);
    if (res.success) {
      setNewNote('');
      setNoteModalOpen(false);
      const updatedNotes = await api.getOrderNotes(id);
      if (updatedNotes.success && Array.isArray(updatedNotes.data)) {
        setNotes(updatedNotes.data);
      } else {
        fetchDetail();
      }
    }
  };

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editQtyModalOpen, setEditQtyModalOpen] = useState(false);
  const [editLaunchQty, setEditLaunchQty] = useState('');
  const [editFinalQty, setEditFinalQty] = useState('');
  const [editFailedQty, setEditFailedQty] = useState('');
  const [updatingQuantities, setUpdatingQuantities] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
        <View style={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}>
          <ScreenHeader title="Order Detail" subtitle="Loading..." onBack={() => router.back()} />
          <DetailsSkeleton />
        </View>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={styles.notFoundTitle}>Order not found</Text>
        <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginHorizontal: 24 }}>
          {error || "The requested manufacturing order could not be loaded."}
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.link, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const confirmStatus = async () => {
    if (!pending) return;
    setUpdating(true);
    const success = await updateJobStatus(job.id, pending as any);
    setUpdating(false);
    if (success) {
      setJob((prev) => (prev ? { ...prev, status: pending as any, lastUpdate: 'Just now' } : null));
      fetchDetail();
    }
    setPending(null);
    setStatusOpen(false);
  };

  const statusListOptions = availableStatuses.length ? availableStatuses : [
    'Traveler',
    'Move',
    'Etching',
    'HAL/Tin',
    'DH Exposer',
    'Outside Drill',
    'VGroove',
    'Etch QC',
    'Rout Done',
    'Silk',
    'Final QC',
    'Masking Exposer',
    'FPT',
    'Rout',
    'Drilling',
    'Developing',
    'Ready to Ship',
    'Completed',
    'Cancelled'
  ];

  const maskColorStr = (job.maskColor || '').toLowerCase();
  const cardBgColor =
    maskColorStr.includes('green')
      ? '#f0fdf4'
      : maskColorStr.includes('blue')
        ? '#eff6ff'
        : maskColorStr.includes('white')
          ? '#f9fafb'
          : maskColorStr.includes('black')
            ? '#f3f4f6'
            : maskColorStr.includes('red')
              ? '#fef2f2'
              : maskColorStr.includes('yellow')
                ? '#fffbeb'
                : '#f0fdf4';

  const cardBorderColor =
    maskColorStr.includes('green')
      ? '#bbf7d0'
      : maskColorStr.includes('blue')
        ? '#bfdbfe'
        : maskColorStr.includes('white')
          ? '#e5e7eb'
          : maskColorStr.includes('black')
            ? '#d1d5db'
            : maskColorStr.includes('red')
              ? '#fecaca'
              : maskColorStr.includes('yellow')
                ? '#fde68a'
                : '#bbf7d0';

  const openEditQuantities = () => {
    if (!job) return;
    setEditLaunchQty(String(job.launchQty ?? job.quantity ?? 0));
    setEditFinalQty(String(job.finalQty ?? job.quantity ?? 0));
    setEditFailedQty(String(job.failedQty ?? 0));
    setEditQtyModalOpen(true);
  };

  const saveQuantities = async () => {
    if (!id || !job || updatingQuantities) return;
    setUpdatingQuantities(true);
    const res = await api.updateQuantities(id, {
      launch_qty: parseInt(editLaunchQty, 10) || 0,
      final_qty: parseInt(editFinalQty, 10) || 0,
      failed_qty: parseInt(editFailedQty, 10) || 0,
    });
    setUpdatingQuantities(false);
    if (res.success) {
      setEditQtyModalOpen(false);
      fetchDetail();
    }
  };

  return (
    <View style={[uiStyles.screen, { backgroundColor: cardBgColor }]}>
      <ScrollView contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4, paddingBottom: 100 }]}>
        <ScreenHeader
          title={job.tool}
          subtitle=""
          onBack={() => router.back()}
          right={
            <View style={styles.statusRight}>
              <StatusBadge status={job.status} />
            </View>
          }
        />

        {/* Hero Details Card with Mask Color Accent */}
        <View style={[styles.heroCard, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
          {/* QTY Summary Cards matching Admin Panel (Ordered, Launched, Final, Failed) */}
          <View style={styles.qtyHeaderRow}>
            <Text style={styles.qtySectionHeading}>Quantity Breakdown</Text>
            <Pressable onPress={openEditQuantities} style={[styles.editQtyBtn, { borderColor: colors.primary }]}>
              <Feather name="edit-2" size={12} color={colors.primary} />
              <Text style={[styles.editQtyBtnText, { color: colors.primary }]}>Edit Quantities</Text>
            </Pressable>
          </View>
          <View style={styles.qtyStatGrid}>
            <View style={[styles.qtyStatCard, { backgroundColor: '#f0f4ff', borderColor: '#dbeafe' }]}>
              <Text style={styles.qtyStatLabel}>ORDERED QTY</Text>
              <Text style={[styles.qtyStatValue, { color: '#1e40af' }]}>{job.quantity ?? 0} <Text style={styles.qtyUnit}>Pcs</Text></Text>
            </View>
            <View style={[styles.qtyStatCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <Text style={styles.qtyStatLabel}>LAUNCHED QTY</Text>
              <Text style={[styles.qtyStatValue, { color: '#1d4ed8' }]}>{job.launchQty ?? job.quantity ?? 0} <Text style={styles.qtyUnit}>Pcs</Text></Text>
            </View>
            <View style={[styles.qtyStatCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
              <Text style={styles.qtyStatLabel}>FINAL QTY</Text>
              <Text style={[styles.qtyStatValue, { color: '#047857' }]}>{job.finalQty ?? job.quantity ?? 0} <Text style={styles.qtyUnit}>Pcs</Text></Text>
            </View>
            <View style={[styles.qtyStatCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <Text style={styles.qtyStatLabel}>FAILED QTY</Text>
              <Text style={[styles.qtyStatValue, { color: '#b91c1c' }]}>{job.failedQty ?? 0} <Text style={styles.qtyUnit}>Pcs</Text></Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            {[
              ['Due date', job.dueDate],
              ['Layers', `${job.layers}-layer`],
              ['Mask color', job.maskColor],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoCell}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Film Applied Toggle Box */}
          <View style={[styles.filmToggleCard, { backgroundColor: job.filmApplied ? '#f0fdf4' : '#f8faf9', borderColor: job.filmApplied ? '#bbf7d0' : colors.border }]}>
            <View style={styles.filmToggleRow}>
              <View style={styles.filmToggleLeft}>
                <View style={[styles.filmIconBox, { backgroundColor: job.filmApplied ? '#dcfce7' : colors.secondary }]}>
                  <Feather name="film" size={18} color={job.filmApplied ? '#15803d' : colors.mutedForeground} />
                </View>
                <View style={styles.filmToggleTextGroup}>
                  <Text style={[styles.filmToggleTitle, { color: colors.foreground }]}>Film Applied</Text>
                </View>
              </View>
              <View style={styles.filmToggleRight}>
                {updatingFilmApplied ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Switch
                    value={Boolean(job.filmApplied)}
                    onValueChange={handleToggleFilmApplied}
                    trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
                    thumbColor="#ffffff"
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Order Notes Section (Listing Only) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Order Notes</Text>
          <Text style={styles.noteBadgeCount}>{notes.length} notes</Text>
        </View>
        <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* List of Notes */}
          {notes.length > 0 ? (
            <View style={styles.notesList}>
              {notes.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[
                    styles.noteItem,
                    { borderBottomColor: colors.border },
                    index === notes.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.noteHeader}>
                    <View style={styles.authorRow}>
                      <View style={[styles.authorAvatar, { backgroundColor: colors.accent }]}>
                        <Feather name="user" size={12} color={colors.primary} />
                      </View>
                      <Text style={[styles.authorName, { color: colors.foreground }]}>
                        {item.name || item.admin_name || 'System / Employee'}
                      </Text>
                    </View>
                    {item.created_at ? <Text style={styles.noteDate}>{item.created_at}</Text> : null}
                  </View>
                  <Text style={[styles.noteBody, { color: colors.foreground }]}>{item.note}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Feather name="file-text" size={22} color={colors.mutedForeground} />
              <Text style={styles.emptyHistoryText}>No internal notes added yet.</Text>
            </View>
          )}
        </View>

        {/* Order History Section at the Bottom */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 18 }]}>Order History</Text>
        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {history.length > 0 ? (
            history.map((item, index) => (
              <View key={item.id || index} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                    <Feather name="check" size={11} color={colors.primaryForeground} />
                  </View>
                  {index < history.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                  )}
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={[styles.stageText, { color: colors.foreground, fontWeight: '700' }]}>
                    {item.action || item.status}
                  </Text>
                  {item.description ? <Text style={styles.currentLabel}>{item.description}</Text> : null}
                  {item.created_at ? <Text style={styles.timeLabel}>{item.created_at}</Text> : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Feather name="clock" size={24} color={colors.mutedForeground} />
              <Text style={styles.emptyHistoryText}>No status history recorded yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View style={[styles.stickyBottomBar, { backgroundColor: cardBgColor, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={() => setStatusOpen(true)}
          style={[styles.stickyBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="refresh-cw" size={16} color={colors.primaryForeground} />
          <Text style={[styles.stickyBtnText, { color: colors.primaryForeground }]}>Change status</Text>
        </Pressable>
        <Pressable
          onPress={() => setNoteModalOpen(true)}
          style={[styles.stickyBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="plus-circle" size={16} color={colors.primary} />
          <Text style={[styles.stickyBtnText, { color: colors.primary }]}>Add Note</Text>
        </Pressable>
      </View>

      {/* Change Status Modal */}
      <Modal visible={statusOpen} transparent animationType="slide" onRequestClose={() => setStatusOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setStatusOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Change Order Status</Text>
                <Text style={styles.sheetSubtitle}>Update current stage for Order #{job.orderNumber} ({job.tool})</Text>
              </View>
              <Pressable onPress={() => setStatusOpen(false)}>
                <Feather name="x" size={23} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.chips}>
                {statusListOptions.map((statusItem) => {
                  const active = (pending ?? job.status) === statusItem;
                  return (
                    <Pressable
                      key={statusItem}
                      onPress={() => setPending(statusItem)}
                      style={[
                        styles.modalChip,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.accent : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.modalChipText, active && { color: colors.primary, fontWeight: '800' }]}>
                        {statusItem}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => {
                  setPending(null);
                  setStatusOpen(false);
                }}
                style={[styles.resetButton, { borderColor: colors.border }]}
              >
                <Text style={styles.resetText}>Cancel</Text>
              </Pressable>
              <View style={styles.applyButton}>
                <PrimaryButton title={updating ? 'Saving…' : 'Apply Status'} onPress={confirmStatus} disabled={updating || !pending || pending === job.status} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={noteModalOpen} transparent animationType="slide" onRequestClose={() => setNoteModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={() => setNoteModalOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Add Order Note</Text>
                  <Text style={styles.sheetSubtitle}>Post an internal production note for Order #{job.orderNumber}</Text>
                </View>
                <Pressable onPress={() => setNoteModalOpen(false)}>
                  <Feather name="x" size={23} color={colors.foreground} />
                </Pressable>
              </View>
              <View style={[styles.addNoteBox, { borderColor: colors.input, backgroundColor: 'transparent', marginBottom: 20 }]}>
                <TextInput
                  value={newNote}
                  onChangeText={setNewNote}
                  placeholder="Type internal production note here..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={4}
                  style={[styles.noteInput, { color: colors.foreground, minHeight: 90 }]}
                />
              </View>
              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => {
                    setNewNote('');
                    setNoteModalOpen(false);
                  }}
                  style={[styles.resetButton, { borderColor: colors.border }]}
                >
                  <Text style={styles.resetText}>Cancel</Text>
                </Pressable>
                <View style={styles.applyButton}>
                  <PrimaryButton
                    title={submittingNote ? 'Posting…' : 'Post Note'}
                    onPress={handleAddNote}
                    disabled={!newNote.trim() || submittingNote}
                  />
                </View>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={editQtyModalOpen} transparent animationType="slide" onRequestClose={() => setEditQtyModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setEditQtyModalOpen(false)}>
            <Pressable style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Edit Quantities</Text>
                  <Text style={styles.sheetSubtitle}>Update production quantities for Order #{job.orderNumber}</Text>
                </View>
                <Pressable onPress={() => setEditQtyModalOpen(false)}>
                  <Feather name="x" size={23} color={colors.foreground} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={{ gap: 14, marginVertical: 10 }}>
                  <View style={styles.qtyFieldGroup}>
                    <Text style={styles.qtyFieldLabel}>ORDERED QTY (Read Only)</Text>
                    <TextInput
                      value={String(job.quantity ?? 0)}
                      editable={false}
                      style={[styles.qtyInput, { backgroundColor: '#f1f5f9', color: '#94a3b8', borderColor: colors.border }]}
                    />
                  </View>

                  <View style={styles.qtyFieldGroup}>
                    <Text style={styles.qtyFieldLabel}>LAUNCHED QTY</Text>
                    <TextInput
                      value={editLaunchQty}
                      onChangeText={setEditLaunchQty}
                      keyboardType="number-pad"
                      style={[styles.qtyInput, { color: colors.foreground, borderColor: colors.input }]}
                    />
                  </View>

                  <View style={styles.qtyFieldGroup}>
                    <Text style={styles.qtyFieldLabel}>FINAL QTY</Text>
                    <TextInput
                      value={editFinalQty}
                      onChangeText={setEditFinalQty}
                      keyboardType="number-pad"
                      style={[styles.qtyInput, { color: colors.foreground, borderColor: colors.input }]}
                    />
                  </View>

                  <View style={styles.qtyFieldGroup}>
                    <Text style={styles.qtyFieldLabel}>FAILED QTY</Text>
                    <TextInput
                      value={editFailedQty}
                      onChangeText={setEditFailedQty}
                      keyboardType="number-pad"
                      style={[styles.qtyInput, { color: colors.foreground, borderColor: colors.input }]}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.sheetActions}>
                <Pressable
                  onPress={() => setEditQtyModalOpen(false)}
                  style={[styles.resetButton, { borderColor: colors.border }]}
                >
                  <Text style={styles.resetText}>Cancel</Text>
                </Pressable>
                <View style={styles.applyButton}>
                  <PrimaryButton
                    title={updatingQuantities ? 'Saving…' : 'Save Changes'}
                    onPress={saveQuantities}
                    disabled={updatingQuantities}
                  />
                </View>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  notFoundTitle: { color: '#173524', fontSize: 20, fontWeight: '800' },
  link: { fontWeight: '800' },
  statusRight: { alignSelf: 'center' },
  heroCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroKicker: { color: '#8b978d', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroClient: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  priorityPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 99 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  qtyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  qtySectionHeading: { fontSize: 13, fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  editQtyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  editQtyBtnText: { fontSize: 11, fontWeight: '700' },
  qtyStatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  qtyStatCard: { width: '48%', borderWidth: 1, borderRadius: 14, padding: 10, justifyContent: 'center' },
  qtyStatLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, color: '#6b7a6e' },
  qtyStatValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  qtyUnit: { fontSize: 11, fontWeight: '600' },
  qtyFieldGroup: { gap: 4 },
  qtyFieldLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  qtyInput: { height: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, borderTopWidth: 1, borderTopColor: '#edf2ed', marginTop: 16, paddingTop: 15 },
  infoCell: { width: '29%', gap: 4 },
  infoLabel: { color: '#8b978d', fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  infoValue: { color: '#314138', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  actionButton: { flex: 1 },
  scanButton: { width: 80, height: 52, borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  scanText: { fontSize: 13, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  timelineCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  timelineRow: { flexDirection: 'row', minHeight: 52 },
  timelineRail: { width: 26, alignItems: 'center' },
  timelineDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginVertical: -1 },
  timelineCopy: { paddingLeft: 12, paddingTop: 1, flex: 1 },
  stageText: { fontSize: 14, fontWeight: '600' },
  currentLabel: { color: '#536257', fontSize: 12, marginTop: 3, lineHeight: 17 },
  timeLabel: { color: '#8b978d', fontSize: 11, marginTop: 4 },
  emptyHistory: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  emptyHistoryText: { color: '#8b978d', fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(19, 35, 25, 0.34)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20 },
  sheetHandle: { backgroundColor: '#ccd7ce', width: 40, height: 4, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sheetTitle: { fontSize: 22, fontWeight: '800' },
  sheetSubtitle: { color: '#6b7a6e', fontSize: 12, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  modalChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalChipText: { color: '#536257', fontSize: 12, fontWeight: '600' },
  sheetActions: { flexDirection: 'row', gap: 10, paddingTop: 18 },
  resetButton: { height: 52, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', width: 94 },
  resetText: { color: '#536257', fontSize: 14, fontWeight: '800' },
  applyButton: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  noteBadgeCount: { color: '#6b7a6e', fontSize: 12, fontWeight: '700' },
  notesCard: { borderWidth: 1, borderRadius: 16, padding: 12 },
  addNoteBox: { borderWidth: 1, borderRadius: 14, padding: 10, marginBottom: 14 },
  noteInput: { minHeight: 60, fontSize: 13, textAlignVertical: 'top', padding: 0 },
  noteSubmitRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  addNoteBtn: { height: 32, paddingHorizontal: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  addNoteBtnText: { fontSize: 12, fontWeight: '700' },
  notesList: { gap: 8 },
  noteItem: { borderBottomWidth: 1, paddingBottom: 8, paddingTop: 2 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  authorAvatar: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 12, fontWeight: '700' },
  noteDate: { color: '#8b978d', fontSize: 10 },
  noteBody: { fontSize: 12, lineHeight: 16, paddingLeft: 23, marginTop: 1 },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  stickyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stickyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  filmToggleCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  filmToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filmToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  filmIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmToggleTextGroup: {
    flex: 1,
  },
  filmToggleTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  filmToggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  filmToggleRight: {
    marginLeft: 10,
  },
});