import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, ProgressBar, ScreenHeader, StatusBadge, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { JOB_STATUSES, type JobStatus } from '@/data/mock';
import { useColors } from '@/hooks/useColors';

export default function OrderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobs, updateJobStatus } = useApp();
  const job = useMemo(() => jobs.find((item) => item.id === id), [jobs, id]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pending, setPending] = useState<JobStatus | null>(null);
  if (!job) return <View style={[styles.notFound, { backgroundColor: colors.background }]}><Text style={styles.notFoundTitle}>Job not found</Text><Pressable onPress={() => router.back()}><Text style={[styles.link, { color: colors.primary }]}>Go back</Text></Pressable></View>;
  const currentIndex = JOB_STATUSES.indexOf(job.status);
  const stages = ['Order Received', 'Traveler', 'Move', 'Etching', 'Drilling', 'Masking', 'Silk', 'Final QC', 'Ready to Ship'];
  const stageIndex = Math.max(1, Math.min(stages.length - 1, currentIndex + 1));
  const confirmStatus = () => { if (pending) updateJobStatus(job.id, pending); setPending(null); setStatusOpen(false); };
  return <View style={[uiStyles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}>
    <ScreenHeader title={job.tool} subtitle="Manufacturing job detail" onBack={() => router.back()} right={<View style={styles.statusRight}><StatusBadge status={job.status} /></View>} />
    <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.heroTop}><View><Text style={styles.heroKicker}>ORDER #{job.orderNumber}</Text><Text style={[styles.heroClient, { color: colors.foreground }]}>{job.client}</Text></View><View style={[styles.priorityPill, { backgroundColor: job.priority === 'Urgent' ? '#fbe8e6' : '#fff0dc' }]}><Text style={[styles.priorityText, { color: job.priority === 'Urgent' ? colors.destructive : '#9a5a16' }]}>{job.priority} priority</Text></View></View><View style={styles.infoGrid}>{[['Department', job.department], ['Due date', job.dueDate], ['Quantity', `${job.quantity} boards`], ['Layers', `${job.layers}-layer`], ['Film', job.film ? 'Yes' : 'No'], ['Mask color', job.maskColor]].map(([label, value]) => <View key={label} style={styles.infoCell}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>)}</View></View>
    <View style={styles.actionRow}><View style={styles.actionButton}><PrimaryButton title="Update status" icon="refresh-cw" onPress={() => setStatusOpen(true)} /></View><Pressable onPress={() => router.push('/scanner')} style={[styles.scanButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="maximize" size={18} color={colors.primary} /><Text style={[styles.scanText, { color: colors.primary }]}>Scan</Text></Pressable></View>
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Manufacturing progress</Text><View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{stages.map((stage, index) => { const complete = index < stageIndex; const current = index === stageIndex; return <View key={stage} style={styles.timelineRow}><View style={styles.timelineRail}><View style={[styles.timelineDot, { backgroundColor: complete || current ? colors.primary : colors.muted, borderColor: complete || current ? colors.primary : colors.border }]}>{complete && <Feather name="check" size={11} color={colors.primaryForeground} />}</View>{index < stages.length - 1 && <View style={[styles.timelineLine, { backgroundColor: index < stageIndex ? colors.primary : colors.border }]} />}</View><View style={styles.timelineCopy}><Text style={[styles.stageText, { color: current ? colors.primary : colors.foreground }, current && { fontWeight: '800' }]}>{stage}</Text>{current && <Text style={styles.currentLabel}>Current stage · in progress</Text>}</View></View>})}</View>
  </ScrollView>
  <Modal visible={statusOpen} transparent animationType="slide" onRequestClose={() => setStatusOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}><View style={styles.sheetHandle} /><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Update job status</Text><Text style={styles.sheetSubtitle}>Move {job.tool} to the next manufacturing stage.</Text><ScrollView style={styles.statusList}>{JOB_STATUSES.map((status) => <Pressable key={status} onPress={() => setPending(status)} style={[styles.statusOption, { borderColor: pending === status ? colors.primary : colors.border, backgroundColor: pending === status ? colors.accent : colors.card }]}><StatusBadge status={status} />{pending === status && <Feather name="check-circle" size={19} color={colors.primary} />}</Pressable>)}</ScrollView>{pending && <View style={styles.confirmBlock}><Text style={styles.confirmText}>Move {job.tool} to {pending}?</Text><View style={styles.confirmActions}><Pressable onPress={() => setPending(null)}><Text style={styles.cancelText}>Cancel</Text></Pressable><View style={styles.confirmButton}><PrimaryButton title="Confirm" onPress={confirmStatus} /></View></View></View>}</View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundTitle: { color: '#173524', fontSize: 20, fontWeight: '800' },
  link: { fontWeight: '800' },
  statusRight: { alignSelf: 'center' },
  heroCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroKicker: { color: '#8b978d', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroClient: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  priorityPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 99 },
  priorityText: { fontSize: 10, fontWeight: '800' },
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
  timelineRow: { flexDirection: 'row', minHeight: 49 },
  timelineRail: { width: 26, alignItems: 'center' },
  timelineDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginVertical: -1 },
  timelineCopy: { paddingLeft: 12, paddingTop: 1 },
  stageText: { fontSize: 14, fontWeight: '600' },
  currentLabel: { color: '#6b7a6e', fontSize: 11, marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(19, 35, 25, 0.34)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20 },
  sheetHandle: { backgroundColor: '#ccd7ce', width: 40, height: 4, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '800' },
  sheetSubtitle: { color: '#6b7a6e', fontSize: 12, marginTop: 4, marginBottom: 12 },
  statusList: { marginBottom: 4 },
  statusOption: { minHeight: 49, borderWidth: 1, borderRadius: 14, marginBottom: 8, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmBlock: { borderTopWidth: 1, borderTopColor: '#edf2ed', paddingTop: 14 },
  confirmText: { color: '#314138', fontSize: 14, fontWeight: '700' },
  confirmActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 20, marginTop: 12 },
  cancelText: { color: '#6b7a6e', fontWeight: '700' },
  confirmButton: { width: 130 },
});