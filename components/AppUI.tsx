import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { InventoryItem, Job, JobStatus, MaskColor } from '@/data/mock';

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.logoRow}>
      <Image source={require('@/assets/images/company-logo.png')} style={compact ? styles.logoCompact : styles.logo} resizeMode="contain" />
      {!compact && <View style={styles.logoFallback}><Text style={[styles.logoTitle, { color: colors.primary }]}>MEGABYTE’S</Text><Text style={[styles.logoSub, { color: colors.mutedForeground }]}>CIRCUIT SYSTEMS</Text></View>}
    </View>
  );
}

const statusTone = (status: JobStatus) => {
  if (status === 'Ready to Ship') return { bg: '#e2f3e5', text: '#24713b', dot: '#2fa34a' };
  if (status === 'Traveler' || status === 'Final QC') return { bg: '#e4eefb', text: '#2c5f9e', dot: '#4187d4' };
  if (status === 'Move' || status === 'Etching' || status === 'Drilling' || status === 'Outside Drill') return { bg: '#fff0dc', text: '#9a5a16', dot: '#e6a23c' };
  return { bg: '#eee8f7', text: '#68518e', dot: '#8d6bbd' };
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const tone = statusTone(status);
  return <View style={[styles.badge, { backgroundColor: tone.bg }]}><View style={[styles.dot, { backgroundColor: tone.dot }]} /><Text style={[styles.badgeText, { color: tone.text }]}>{status}</Text></View>;
}

export function MaskDot({ color, label = true }: { color: MaskColor; label?: boolean }) {
  const values: Record<MaskColor, string> = { Green: '#2fa34a', White: '#d8d8d8', Black: '#1c2420', Red: '#dc5a52' };
  return <View style={styles.maskRow}><View style={[styles.dot, { backgroundColor: values[color] }]} />{label && <Text style={styles.maskText}>{color}</Text>}</View>;
}

export function ScreenHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  const colors = useColors();
  return <View style={styles.header}>
    {onBack && <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.headerBack}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable>}
    <View style={styles.headerCopy}><Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>{subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}</View>
    {right}
  </View>;
}

export function StatCard({ label, value, tone = 'green', onPress }: { label: string; value: string | number; tone?: 'green' | 'orange' | 'blue' | 'red'; onPress?: () => void }) {
  const colors = useColors();
  const accent = { green: colors.primary, orange: '#b96b1d', blue: '#3e75b4', red: '#bb4c46' }[tone];
  return <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.statCard, { borderColor: colors.border }, pressed && { opacity: 0.82 }]}>
    <Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, { color: accent }]}>{value}</Text>
  </Pressable>;
}

export function SectionHeading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>{action && <Pressable onPress={onPress}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable>}</View>;
}

export function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.jobCard, { borderColor: colors.border }, pressed && { transform: [{ scale: 0.985 }], opacity: 0.9 }]}>
    <View style={styles.jobTop}><View><Text style={[styles.jobTool, { color: colors.primary }]}>{job.tool}</Text><Text style={styles.jobClient}>{job.client} · #{job.orderNumber}</Text></View><StatusBadge status={job.status} /></View>
    <View style={styles.jobMeta}><View style={styles.metaCell}><Text style={styles.metaLabel}>Department</Text><Text style={styles.metaValue}>{job.department}</Text></View><View style={styles.metaCell}><Text style={styles.metaLabel}>Due</Text><Text style={[styles.metaValue, job.dueDate === 'Today' && { color: '#b96b1d' }]}>{job.dueDate}</Text></View><View style={styles.metaCell}><Text style={styles.metaLabel}>Mask</Text><MaskDot color={job.maskColor} /></View></View>
    <View style={styles.jobFooter}><Text style={styles.jobUpdate}>Updated {job.lastUpdate}</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View>
  </Pressable>;
}

export function InventoryCard({ item, onPress }: { item: InventoryItem; onPress: () => void }) {
  const colors = useColors();
  const out = item.quantity === 0;
  const low = item.quantity > 0 && item.quantity <= item.threshold;
  const label = out ? 'Out of stock' : low ? 'Low stock' : 'In stock';
  const tone = out ? '#bb4c46' : low ? '#b96b1d' : colors.primary;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.inventoryCard, { borderColor: colors.border }, pressed && { opacity: 0.86 }]}>
    <View style={styles.inventoryTop}><View><Text style={[styles.itemSku, { color: colors.primary }]}>{item.sku}</Text><Text style={styles.itemName}>{item.name}</Text></View><View style={[styles.stockPill, { backgroundColor: out ? '#fbe8e6' : low ? '#fff0dc' : '#e2f3e5' }]}><Text style={[styles.stockPillText, { color: tone }]}>{label}</Text></View></View>
    <View style={styles.inventoryBottom}><Text style={styles.inventoryQty}><Text style={styles.inventoryQtyStrong}>{item.quantity}</Text> available</Text><Text style={styles.inventoryThreshold}>Threshold {item.threshold}</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View>
  </Pressable>;
}

export function EmptyState({ icon = 'inbox', title, detail, action, onPress }: { icon?: keyof typeof Feather.glyphMap; title: string; detail: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={23} color={colors.primary} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action && <Pressable onPress={onPress}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable>}</View>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const colors = useColors();
  return <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color ?? colors.primary }]} /></View>;
}

export function PrimaryButton({ title, onPress, icon, destructive = false, disabled = false }: { title: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; destructive?: boolean; disabled?: boolean }) {
  const colors = useColors();
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: destructive ? colors.destructive : colors.primary }, disabled && { opacity: 0.5 }, pressed && { opacity: 0.82 }]}>{icon && <Feather name={icon} size={18} color={colors.primaryForeground} />}<Text style={styles.primaryButtonText}>{title}</Text></Pressable>;
}

export const uiStyles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  row: { flexDirection: 'row', alignItems: 'center' },
});

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 100, height: 42 },
  logoCompact: { width: 70, height: 32 },
  logoFallback: { gap: 1 },
  logoTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  logoSub: { fontSize: 7, fontWeight: '700', letterSpacing: 0.8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 12 },
  headerBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  headerSubtitle: { color: '#6b7a6e', fontSize: 13, marginTop: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, gap: 5 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  maskRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  maskText: { color: '#314138', fontSize: 13 },
  statCard: { backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 18, padding: 15, width: '48%', minHeight: 92, justifyContent: 'space-between', shadowColor: '#173524', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  statLabel: { color: '#6b7a6e', fontSize: 13, fontWeight: '600' },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionAction: { fontSize: 13, fontWeight: '700' },
  jobCard: { backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12, shadowColor: '#173524', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  jobTool: { fontSize: 19, fontWeight: '800' },
  jobClient: { color: '#6b7a6e', fontSize: 12, marginTop: 3 },
  jobMeta: { flexDirection: 'row', gap: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#edf2ed', paddingVertical: 13, marginTop: 14 },
  metaCell: { flex: 1, gap: 4 },
  metaLabel: { color: '#8b978d', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' },
  metaValue: { color: '#314138', fontSize: 13, fontWeight: '600' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 11 },
  jobUpdate: { color: '#8b978d', fontSize: 11 },
  inventoryCard: { backgroundColor: '#ffffff', borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12, shadowColor: '#173524', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  inventoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  itemSku: { fontSize: 14, fontWeight: '800' },
  itemName: { color: '#314138', fontSize: 14, marginTop: 4 },
  stockPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 },
  stockPillText: { fontSize: 10, fontWeight: '700' },
  inventoryBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderColor: '#edf2ed', marginTop: 14, paddingTop: 12 },
  inventoryQty: { color: '#6b7a6e', flex: 1, fontSize: 12 },
  inventoryQtyStrong: { color: '#173524', fontSize: 16, fontWeight: '800' },
  inventoryThreshold: { color: '#8b978d', fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 44, paddingHorizontal: 22 },
  emptyIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyDetail: { color: '#6b7a6e', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19, marginBottom: 13 },
  progressTrack: { height: 9, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: 9, borderRadius: 99 },
  primaryButton: { minHeight: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});