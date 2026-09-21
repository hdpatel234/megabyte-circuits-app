import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, InventoryCard, PrimaryButton, ScreenHeader, StatCard, uiStyles } from '@/components/AppUI';
import { InventorySkeleton } from '@/components/Skeletons';
import { useApp } from '@/context/AppContext';
import { type InventoryItem } from '@/data/mock';
import { useColors } from '@/hooks/useColors';
import { api } from '@/services/api';

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasPermission, refreshBootstrap } = useApp();

  const canViewInventory = hasPermission('inventory.view');

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [summaryCounts, setSummaryCounts] = useState({ components: 0, low_stock: 0, out_of_stock: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInventoryFromApi = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      if (!canViewInventory) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (pageNum === 1) setLoading(true);
      setError(null);

      const res = await api.getInventory({
        search: query,
        status: filter !== 'all' ? filter : undefined,
        page: pageNum,
        per_page: 15,
      });

      if (res.success && res.data) {
        if (pageNum === 1 || isRefresh) {
          setInventoryList(res.data);
        } else {
          setInventoryList((prev) => [...prev, ...res.data]);
        }
        if (res.summary) {
          setSummaryCounts(res.summary);
        }
        if (res.meta) {
          setTotalPages(res.meta.last_page || 1);
        }
      } else {
        if (!res.success && res.message) {
          setError(res.message);
        }
      }

      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    },
    [canViewInventory, query, filter]
  );

  useEffect(() => {
    fetchInventoryFromApi(1);
  }, [query, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchInventoryFromApi(1, true);
  };

  const loadMore = () => {
    if (page < totalPages && !loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInventoryFromApi(nextPage);
    }
  };

  // Route Permission Protection Fallback
  if (!canViewInventory) {
    return (
      <View style={[uiStyles.screen, { backgroundColor: colors.background, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.deniedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield-off" size={48} color={colors.destructive} />
          <Text style={[styles.deniedTitle, { color: colors.foreground }]}>Access Restricted</Text>
          <Text style={styles.deniedDetail}>You do not have the required "inventory.view" permission to access the Component Inventory module.</Text>
          <PrimaryButton title="Go to Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[uiStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 100) {
          loadMore();
        }
      }}
      scrollEventThrottle={400}
    >

      <View style={styles.statsRow}>
        <StatCard label="Components" value={summaryCounts.components || inventoryList.length} />
        <StatCard label="Low stock" value={summaryCounts.low_stock} tone="orange" />
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search component or SKU…"
          placeholderTextColor={colors.mutedForeground}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'in_stock', label: 'In stock' },
          { key: 'low_stock', label: 'Low stock' },
          { key: 'out_of_stock', label: 'Out of stock' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setFilter(tab.key as StockFilter)}
            style={[
              styles.tabPill,
              {
                borderColor: filter === tab.key ? colors.primary : colors.border,
                backgroundColor: filter === tab.key ? colors.accent : colors.card,
              },
            ]}
          >
            <Text style={[styles.tabText, filter === tab.key && { color: colors.primary, fontWeight: '800' }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={[styles.errorCard, { borderColor: colors.destructive, backgroundColor: colors.card }]}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          <Pressable onPress={() => fetchInventoryFromApi(1)} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 13 }}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.list}>
        {loading ? (
          <InventorySkeleton />
        ) : inventoryList.length ? (
          inventoryList.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onPress={() => router.push({ pathname: '/inventory/[id]', params: { id: item.id } })}
            />
          ))
        ) : (
          <EmptyState
            icon="package"
            title="No components found"
            detail="No stock items match your search query or selected stock filter."
            action="Reset filter"
            onPress={() => {
              setQuery('');
              setFilter('all');
            }}
          />
        )}
      </View>

      {loadingMore && (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 42, height: 42, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  searchWrap: { height: 52, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9, marginTop: 14 },
  searchInput: { flex: 1, color: '#173524', fontSize: 14 },
  tabRow: { flexDirection: 'row', gap: 8, marginVertical: 14, flexWrap: 'wrap' },
  tabPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  tabText: { color: '#536257', fontSize: 12, fontWeight: '600' },
  list: { marginTop: 4 },
  errorCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { fontSize: 13, flex: 1, marginRight: 10 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  deniedCard: { padding: 24, borderWidth: 1, borderRadius: 20, alignItems: 'center', gap: 16, maxWidth: 340, width: '100%' },
  deniedTitle: { fontSize: 20, fontWeight: '800' },
  deniedDetail: { color: '#6b7a6e', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});