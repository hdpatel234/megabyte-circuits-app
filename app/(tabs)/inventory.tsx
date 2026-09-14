import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, InventoryCard, ScreenHeader, StatCard, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inventory } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'In stock' | 'Low stock' | 'Out of stock'>('All');
  const filtered = useMemo(() => inventory.filter((item) => {
    const matchQuery = !query.trim() || [item.sku, item.name, item.category].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    const matchFilter = filter === 'All' || (filter === 'Out of stock' ? item.quantity === 0 : filter === 'Low stock' ? item.quantity > 0 && item.quantity <= item.threshold : filter === 'In stock' ? item.quantity > item.threshold : true);
    return matchQuery && matchFilter;
  }), [inventory, query, filter]);
  const low = inventory.filter((item) => item.quantity > 0 && item.quantity <= item.threshold).length;
  const out = inventory.filter((item) => item.quantity === 0).length;
  return <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]} refreshControl={<RefreshControl refreshing={false} onRefresh={() => undefined} tintColor={colors.primary} />}>
    <ScreenHeader title="Inventory" subtitle="Components and stock health" right={<Pressable onPress={() => router.push('/scanner')} style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.card }]}><Feather name="maximize" size={19} color={colors.foreground} /></Pressable>} />
    <View style={styles.statsRow}><StatCard label="Components" value={inventory.length + 42} /><StatCard label="Low stock" value={low + 7} tone="orange" /><StatCard label="Out of stock" value={out} tone="red" /></View>
    <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.input }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Search component or SKU…" placeholderTextColor={colors.mutedForeground} style={styles.searchInput} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{(['All', 'In stock', 'Low stock', 'Out of stock'] as const).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, { backgroundColor: filter === item ? colors.primary : colors.card, borderColor: filter === item ? colors.primary : colors.border }]}><Text style={[styles.filterText, filter === item && { color: colors.primaryForeground }]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.list}>{filtered.length ? filtered.map((item) => <InventoryCard key={item.id} item={item} onPress={() => router.push({ pathname: '/inventory/[id]', params: { id: item.id } })} />) : <EmptyState icon="package" title="No inventory found" detail="Try another component, SKU, or stock filter." action="Show all components" onPress={() => { setQuery(''); setFilter('All'); }} />}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  iconButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 18 },
  searchWrap: { height: 52, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 },
  searchInput: { flex: 1, color: '#173524', fontSize: 14 },
  filterRow: { gap: 8, paddingVertical: 16 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  filterText: { color: '#536257', fontSize: 12, fontWeight: '700' },
  list: { marginTop: 3 },
});