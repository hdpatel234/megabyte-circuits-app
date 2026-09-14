import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, JobCard, PrimaryButton, ScreenHeader, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { JOB_STATUSES, type JobStatus, type MaskColor } from '@/data/mock';
import { useColors } from '@/hooks/useColors';

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jobs } = useApp();
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null);
  const [selectedMask, setSelectedMask] = useState<MaskColor | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [job.tool, job.orderNumber, job.client, job.status, job.department].some((value) => value.toLowerCase().includes(needle));
    return matchesQuery && (!selectedStatus || job.status === selectedStatus) && (!selectedMask || job.maskColor === selectedMask);
  }), [jobs, query, selectedStatus, selectedMask]);
  const activeFilters = Number(Boolean(selectedStatus)) + Number(Boolean(selectedMask));
  return <View style={[uiStyles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} tintColor={colors.primary} />}>
    <ScreenHeader title="Orders" subtitle={`${filteredJobs.length} jobs in the live queue`} right={<Pressable onPress={() => router.push('/scanner')} style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="maximize" size={19} color={colors.foreground} /></Pressable>} />
    <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.input }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Search tool, client, order…" placeholderTextColor={colors.mutedForeground} style={styles.searchInput} /><Pressable onPress={() => setFilterOpen(true)} style={[styles.filterButton, { backgroundColor: activeFilters ? colors.primary : colors.secondary }]}><Feather name="sliders" size={17} color={activeFilters ? colors.primaryForeground : colors.primary} />{activeFilters > 0 && <View style={styles.filterCount}><Text style={styles.filterCountText}>{activeFilters}</Text></View>}</Pressable></View>
    {(selectedStatus || selectedMask) && <View style={styles.activeRow}><Text style={styles.activeLabel}>Filters applied</Text><Pressable onPress={() => { setSelectedStatus(null); setSelectedMask(null); }}><Text style={[styles.clearText, { color: colors.primary }]}>Clear all</Text></Pressable></View>}
    <View style={styles.list}>{filteredJobs.length ? filteredJobs.map((job) => <JobCard key={job.id} job={job} onPress={() => router.push({ pathname: '/order/[id]', params: { id: job.id } })} />) : <EmptyState icon="search" title="No orders found" detail="Try a different tool number, client, or filter." action="Clear filters" onPress={() => { setQuery(''); setSelectedStatus(null); setSelectedMask(null); }} />}</View>
  </ScrollView>
  <Modal visible={filterOpen} animationType="slide" transparent onRequestClose={() => setFilterOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><View><Text style={[styles.sheetTitle, { color: colors.foreground }]}>Filter orders</Text><Text style={styles.sheetSubtitle}>Narrow down the live production queue</Text></View><Pressable onPress={() => setFilterOpen(false)}><Feather name="x" size={23} color={colors.foreground} /></Pressable></View><ScrollView showsVerticalScrollIndicator={false}><Text style={styles.filterHeading}>Status</Text><View style={styles.chips}>{JOB_STATUSES.map((status) => <Pressable key={status} onPress={() => setSelectedStatus(selectedStatus === status ? null : status)} style={[styles.chip, { borderColor: selectedStatus === status ? colors.primary : colors.border, backgroundColor: selectedStatus === status ? colors.accent : colors.card }]}><Text style={[styles.chipText, selectedStatus === status && { color: colors.primary, fontWeight: '800' }]}>{status}</Text></Pressable>)}</View><Text style={styles.filterHeading}>Mask color</Text><View style={styles.chips}>{(['Green', 'White', 'Black', 'Red'] as MaskColor[]).map((mask) => <Pressable key={mask} onPress={() => setSelectedMask(selectedMask === mask ? null : mask)} style={[styles.chip, { borderColor: selectedMask === mask ? colors.primary : colors.border, backgroundColor: selectedMask === mask ? colors.accent : colors.card }]}><View style={[styles.maskDot, { backgroundColor: { Green: '#2fa34a', White: '#d8d8d8', Black: '#1c2420', Red: '#dc5a52' }[mask] }]} /><Text style={[styles.chipText, selectedMask === mask && { color: colors.primary, fontWeight: '800' }]}>{mask}</Text></Pressable>)}</View></ScrollView><View style={styles.sheetActions}><Pressable onPress={() => { setSelectedStatus(null); setSelectedMask(null); }} style={[styles.resetButton, { borderColor: colors.border }]}><Text style={styles.resetText}>Reset</Text></Pressable><View style={styles.applyButton}><PrimaryButton title="Apply filters" onPress={() => setFilterOpen(false)} /></View></View></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  iconButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { height: 52, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingLeft: 15, gap: 9 },
  searchInput: { flex: 1, color: '#173524', fontSize: 14 },
  filterButton: { height: 42, width: 44, marginRight: 5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterCount: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ffffff', minWidth: 13, height: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  filterCountText: { color: '#2f7d45', fontSize: 8, fontWeight: '800' },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  activeLabel: { color: '#6b7a6e', fontSize: 12, fontWeight: '600' },
  clearText: { fontSize: 12, fontWeight: '800' },
  list: { marginTop: 18 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(19, 35, 25, 0.34)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '88%', paddingHorizontal: 20 },
  sheetHandle: { backgroundColor: '#ccd7ce', width: 40, height: 4, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  sheetTitle: { fontSize: 22, fontWeight: '800' },
  sheetSubtitle: { color: '#6b7a6e', fontSize: 12, marginTop: 4 },
  filterHeading: { color: '#314138', fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { color: '#536257', fontSize: 12, fontWeight: '600' },
  maskDot: { width: 8, height: 8, borderRadius: 4 },
  sheetActions: { flexDirection: 'row', gap: 10, paddingTop: 18 },
  resetButton: { height: 52, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', width: 94 },
  resetText: { color: '#536257', fontSize: 14, fontWeight: '800' },
  applyButton: { flex: 1 },
});