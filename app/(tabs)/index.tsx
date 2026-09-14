import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobCard, LogoLockup, SectionHeading, StatCard, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { JOB_STATUSES } from '@/data/mock';
import { useColors } from '@/hooks/useColors';

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jobs, notifications } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);
  const total = jobs.length + 176;
  const ready = jobs.filter((job) => job.status === 'Ready to Ship').length + 101;
  const inProgress = total - ready;
  const overdue = jobs.filter((job) => job.dueDate === 'Today' && job.status !== 'Ready to Ship').length + 1;
  const dueToday = jobs.filter((job) => job.dueDate === 'Today').length;
  const loads = JOB_STATUSES.map((status, index) => ({ status, count: [103, 24, 13, 10, 5, 5, 5, 4, 4, 3, 3, 2, 1, 1, 1, 1, 1][index] ?? 1 })).slice(0, 6);
  const productionJobs = jobs.slice(0, 3);

  const refresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 650); };
  return <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 10 }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}>
    <View style={styles.topRow}><View><Text style={styles.eyebrow}>MONDAY · 14 SEP 2026</Text><Text style={[styles.greeting, { color: colors.foreground }]}>Good morning, Jignesh</Text><Text style={styles.subheading}>Here’s today’s production overview.</Text></View><Pressable onPress={() => router.push('/notifications')} style={[styles.bell, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="bell" size={20} color={colors.foreground} />{notifications.some((notification) => notification.unread) && <View style={[styles.bellDot, { backgroundColor: colors.destructive }]} />}</Pressable></View>
    <View style={styles.logoStrip}><LogoLockup compact /><Text style={styles.shiftText}>Shift A · Live floor</Text></View>
    <SectionHeading title="At a glance" action="See orders" onPress={() => router.push('/(tabs)/orders')} />
    <View style={styles.statsGrid}><StatCard label="Total jobs" value={total} /><StatCard label="Ready to ship" value={ready} tone="blue" /><StatCard label="In progress" value={inProgress} tone="orange" /><StatCard label="Overdue" value={overdue} tone="red" /><StatCard label="Due today" value={dueToday} tone="green" /></View>
    <SectionHeading title="Today’s production" action="View all" onPress={() => router.push('/(tabs)/orders')} />
    {productionJobs.map((job) => <JobCard key={job.id} job={job} onPress={() => router.push({ pathname: '/order/[id]', params: { id: job.id } })} />)}
    <SectionHeading title="Department load" action="Orders" onPress={() => router.push('/(tabs)/orders')} />
    <View style={[styles.loadCard, { borderColor: colors.border, backgroundColor: colors.card }]}>{loads.map((item, index) => <View key={item.status} style={styles.loadRow}><View style={styles.loadName}><View style={[styles.loadDot, { backgroundColor: index < 2 ? colors.primary : index < 4 ? '#e2a14b' : '#7a9ecb' }]} /><Text style={styles.loadText}>{item.status}</Text></View><Text style={[styles.loadCount, { color: colors.foreground }]}>{item.count}</Text></View>)}</View>
    <SectionHeading title="Mask colors" />
    <View style={[styles.maskCard, { borderColor: colors.border, backgroundColor: colors.card }]}>{[['Green', 171, '#2fa34a'], ['White', 3, '#d8d8d8'], ['Black', 9, '#1c2420'], ['Red', 2, '#dc5a52']].map(([label, value, tone]) => <View key={label as string} style={styles.maskRow}><View style={styles.maskLabel}><View style={[styles.loadDot, { backgroundColor: tone as string }]} /><Text style={styles.loadText}>{label as string}</Text></View><Text style={[styles.loadCount, { color: colors.foreground }]}>{value as number}</Text></View>)}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#6b7a6e', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  greeting: { fontSize: 25, fontWeight: '800', letterSpacing: -0.7, marginTop: 7 },
  subheading: { color: '#6b7a6e', fontSize: 13, marginTop: 5 },
  bell: { width: 44, height: 44, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bellDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 10, right: 10 },
  logoStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingVertical: 9 },
  shiftText: { color: '#6b7a6e', fontSize: 11, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  loadCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 15 },
  loadRow: { minHeight: 46, borderBottomWidth: 1, borderBottomColor: '#edf2ed', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loadName: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  loadDot: { width: 9, height: 9, borderRadius: 5 },
  loadText: { color: '#314138', fontSize: 13, fontWeight: '600' },
  loadCount: { fontSize: 14, fontWeight: '800' },
  maskCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 15 },
  maskRow: { minHeight: 46, borderBottomWidth: 1, borderBottomColor: '#edf2ed', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  maskLabel: { flexDirection: 'row', alignItems: 'center', gap: 9 },
});
