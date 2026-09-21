import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, JobCard, PrimaryButton, ScreenHeader, uiStyles } from '@/components/AppUI';
import { OrdersSkeleton } from '@/components/Skeletons';
import { useApp } from '@/context/AppContext';
import { type Job } from '@/data/mock';
import { useColors } from '@/hooks/useColors';
import { api } from '@/services/api';

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasPermission, refreshBootstrap } = useApp();

  const canViewOrders = hasPermission('orders.view');

  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('In Production');
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch dynamic statuses from backend API
  useEffect(() => {
    let active = true;
    const fetchStatuses = async () => {
      const res = await api.getStatuses();
      if (active && res.success && Array.isArray(res.data)) {
        setAvailableStatuses(res.data);
      }
    };
    fetchStatuses();
    return () => {
      active = false;
    };
  }, []);

  const fetchOrdersFromApi = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (!canViewOrders) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (pageNum === 1) setLoading(true);
    setError(null);

    const filterStatusParam = !selectedStatus
      ? undefined
      : selectedStatus === 'All'
        ? 'all'
        : selectedStatus === 'In Production'
          ? 'in_production'
          : selectedStatus;

    const res = await api.getOrders({
      search: query,
      status: filterStatusParam,
      page: pageNum,
      per_page: 15,
    });

    if (res.success && res.data) {
      if (pageNum === 1 || isRefresh) {
        setJobsList(res.data);
      } else {
        setJobsList((prev) => [...prev, ...res.data]);
      }
      if (res.meta) {
        setTotalPages(res.meta.last_page || 1);
        setTotalCount(res.meta.total || res.data.length);
      }
    } else {
      if (!res.success && res.message) {
        setError(res.message);
      }
    }

    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  }, [canViewOrders, query, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchOrdersFromApi(1);
    }, [fetchOrdersFromApi])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchOrdersFromApi(1, true);
  };

  const loadMore = useCallback(() => {
    if (page < totalPages && !loadingMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrdersFromApi(nextPage);
    }
  }, [page, totalPages, loadingMore, loading, fetchOrdersFromApi]);

  const activeFilters = Number(Boolean(selectedStatus && selectedStatus !== 'In Production'));

  // Route Permission Protection Fallback
  if (!canViewOrders) {
    return (
      <View style={[uiStyles.screen, { backgroundColor: colors.background, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.deniedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield-off" size={48} color={colors.destructive} />
          <Text style={[styles.deniedTitle, { color: colors.foreground }]}>Access Restricted</Text>
          <Text style={styles.deniedDetail}>You do not have the required "orders.view" permission to access the Orders management module.</Text>
          <PrimaryButton title="Go to Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  const allStatusOptions = Array.from(new Set(['In Production', 'All', ...availableStatuses]));

  return (
    <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4, paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 300;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={16}
      >
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.input }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tool, client, order…"
            placeholderTextColor={colors.mutedForeground}
            style={styles.searchInput}
          />
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={[styles.filterButton, { backgroundColor: activeFilters ? colors.primary : colors.secondary }]}
          >
            <Feather name="sliders" size={17} color={activeFilters ? colors.primaryForeground : colors.primary} />
            {activeFilters > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilters}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {error ? (
          <View style={[styles.errorCard, { borderColor: colors.destructive, backgroundColor: colors.card }]}>
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            <Pressable onPress={() => fetchOrdersFromApi(1)} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 13 }}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Orders displayed in table layout format matching UI mockup */}
        {loading ? (
          <OrdersSkeleton />
        ) : jobsList.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollView}>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={[styles.tableHeaderRow, { backgroundColor: '#f8faf9', borderBottomColor: '#e5e7eb' }]}>
                <Text style={[styles.tableHeaderCell, { width: 120 }]}>Status</Text>
                <Text style={[styles.tableHeaderCell, { width: 130 }]}>Tool</Text>
                <Text style={[styles.tableHeaderCell, { width: 70 }]}>Film</Text>
                <Text style={[styles.tableHeaderCell, { width: 95 }]}>Order Date</Text>
                <Text style={[styles.tableHeaderCell, { width: 95 }]}>Due Date</Text>
                <Text style={[styles.tableHeaderCell, { width: 65 }]}>Layers</Text>
                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Order Qty</Text>
                <Text style={[styles.tableHeaderCell, { width: 75 }]}>Launch</Text>
                <Text style={[styles.tableHeaderCell, { width: 70 }]}>Panel</Text>
                <Text style={[styles.tableHeaderCell, { width: 75 }]}>Final Qty</Text>
                <Text style={[styles.tableHeaderCell, { width: 140 }]}>Notes</Text>
              </View>

              {/* Table Rows */}
              {jobsList.map((job, index) => {
                const maskStr = (job.maskColor || (job as any).mask || '').toLowerCase();
                const toolColor =
                  maskStr.includes('green') ? '#15803d' :
                    maskStr.includes('purple') ? '#7e22ce' :
                      maskStr.includes('red') ? '#dc2626' :
                        maskStr.includes('yellow') ? '#d97706' :
                          maskStr.includes('blue') ? '#2563eb' :
                            maskStr.includes('black') ? '#111827' :
                              maskStr.includes('white') ? '#6b7280' :
                                '#374151'; // Default text color if no valid mask color found
                return (
                  <Pressable
                    key={job.id}
                    onPress={() => router.push({ pathname: '/order/[id]', params: { id: job.id } })}
                    style={({ pressed }) => [
                      styles.tableRow,
                      { borderBottomColor: '#edf2ed' },
                      index % 2 === 1 && { backgroundColor: '#fbfdfb' },
                      pressed && { backgroundColor: '#f0fdf4' },
                    ]}
                  >
                    <View style={[styles.tableCell, { width: 120 }]}>
                      <Text style={styles.statusCellText} numberOfLines={1}>
                        {job.status}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, styles.toolCellRow, { width: 130 }]}>
                      <View style={[styles.toolDot, { backgroundColor: toolColor }]} />
                      <Text style={[styles.toolCellText, { color: toolColor }]} numberOfLines={1}>
                        {job.tool}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 70 }]}>
                      <Text style={styles.tableCellText}>
                        {job.film ? 'TRUE' : 'FALSE'}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 95 }]}>
                      <Text style={styles.tableCellText} numberOfLines={1}>
                        {job.orderDate || '—'}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 95 }]}>
                      <Text style={styles.tableCellText} numberOfLines={1}>
                        {job.dueDate || '—'}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 65 }]}>
                      <Text style={styles.tableCellText}>
                        {job.layers ?? 1}L
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 80 }]}>
                      <Text style={styles.tableCellText}>
                        {job.quantity ?? 0}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 75 }]}>
                      <Text style={styles.tableCellText}>
                        {job.launchQty ?? job.quantity ?? 0}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 70 }]}>
                      <Text style={styles.tableCellText}>
                        {(job as any).panelQty ?? (job as any).panel ?? 0}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 75 }]}>
                      <Text style={styles.tableCellText}>
                        {job.finalQty ?? job.quantity ?? 0}
                      </Text>
                    </View>

                    <View style={[styles.tableCell, { width: 140 }]}>
                      <Text style={styles.tableCellText} numberOfLines={1}>
                        {(job as any).notes || '—'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <EmptyState
            icon="search"
            title="No orders found"
            detail="There are no manufacturing orders matching your search or filter."
            action="Reset filter"
            onPress={() => {
              setQuery('');
              setSelectedStatus('All');
            }}
          />
        )}

        {loadingMore && (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterOpen} animationType="slide" transparent onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Filter orders</Text>
                <Text style={styles.sheetSubtitle}>Select status from backend API</Text>
              </View>
              <Pressable onPress={() => setFilterOpen(false)}>
                <Feather name="x" size={23} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterHeading}>Status</Text>
              <View style={styles.chips}>
                {allStatusOptions.map((statusItem) => (
                  <Pressable
                    key={statusItem}
                    onPress={() => setSelectedStatus(statusItem)}
                    style={[
                      styles.chip,
                      {
                        borderColor: selectedStatus === statusItem ? colors.primary : colors.border,
                        backgroundColor: selectedStatus === statusItem ? colors.accent : colors.card,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, selectedStatus === statusItem && { color: colors.primary, fontWeight: '800' }]}>
                      {statusItem}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => {
                  setSelectedStatus('All');
                }}
                style={[styles.resetButton, { borderColor: colors.border }]}
              >
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
              <View style={styles.applyButton}>
                <PrimaryButton title="Apply filter" onPress={() => setFilterOpen(false)} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { height: 52, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingLeft: 15, gap: 9, marginTop: 10 },
  searchInput: { flex: 1, color: '#173524', fontSize: 14 },
  filterButton: { height: 42, width: 44, marginRight: 5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterCount: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ffffff', minWidth: 13, height: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  filterCountText: { color: '#2f7d45', fontSize: 8, fontWeight: '800' },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  activeLabel: { color: '#6b7a6e', fontSize: 12, fontWeight: '600' },
  clearText: { fontSize: 12, fontWeight: '800' },
  list: { marginTop: 14 },
  errorCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { fontSize: 13, flex: 1, marginRight: 10 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
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
  sheetActions: { flexDirection: 'row', gap: 10, paddingTop: 18 },
  resetButton: { height: 52, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', width: 94 },
  resetText: { color: '#536257', fontSize: 14, fontWeight: '800' },
  applyButton: { flex: 1 },
  deniedCard: { padding: 24, borderWidth: 1, borderRadius: 20, alignItems: 'center', gap: 16, maxWidth: 340, width: '100%' },
  deniedTitle: { fontSize: 20, fontWeight: '800' },
  deniedDetail: { color: '#6b7a6e', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  tableScrollView: { marginTop: 14, marginHorizontal: -20 },
  tableContainer: { paddingHorizontal: 20, minWidth: 1010 },
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', height: 46, borderBottomWidth: 1, paddingHorizontal: 8 },
  tableHeaderCell: { fontSize: 13, fontWeight: '700', color: '#4b5563', paddingRight: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', height: 48, borderBottomWidth: 1, paddingHorizontal: 8 },
  tableCell: { paddingRight: 8, justifyContent: 'center' },
  statusCellText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  toolCellRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolDot: { width: 7, height: 7, borderRadius: 3.5 },
  toolCellText: { fontSize: 13, fontWeight: '700' },
  tableCellText: { fontSize: 13, fontWeight: '500', color: '#4b5563' },
});