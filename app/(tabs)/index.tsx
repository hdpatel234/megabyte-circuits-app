import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobCard, LogoLockup, SectionHeading, StatCard, uiStyles } from '@/components/AppUI';
import { DashboardSkeleton } from '@/components/Skeletons';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { api } from '@/services/api';
import { getDynamicGreeting, getFormattedDate } from '@/utils/time';
import { Job } from '@/data/mock';

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, notificationCount, refreshBootstrap } = useApp();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentGreeting, setCurrentGreeting] = useState(() => getDynamicGreeting(user?.name));
  const [currentDateString, setCurrentDateString] = useState(() => getFormattedDate());

  // Interval timer for dynamic greeting & date updates
  useEffect(() => {
    setCurrentGreeting(getDynamicGreeting(user?.name));
    setCurrentDateString(getFormattedDate());

    const interval = setInterval(() => {
      setCurrentGreeting(getDynamicGreeting(user?.name));
      setCurrentDateString(getFormattedDate());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user?.name]);

  const [dashboardData, setDashboardData] = useState<{
    subheading: string;
    summary: { total_jobs: number; ready_to_ship: number; in_progress: number; overdue: number; due_today: number };
    today_production: Job[];
    department_load: { name: string; status: string; count: number }[];
    mask_colors: { name: string; count: number; color: string }[];
  }>({
    subheading: "Here’s today’s production overview.",
    summary: { total_jobs: 186, ready_to_ship: 103, in_progress: 83, overdue: 3, due_today: 3 },
    today_production: [],
    department_load: [],
    mask_colors: [],
  });

  const [allStatusesList, setAllStatusesList] = useState<string[]>([]);

  const loadDashboard = async () => {
    if (!isAuthenticated) return;
    setError(null);
    const [res, statusesRes] = await Promise.all([
      api.getDashboard(),
      api.getStatuses(),
    ]);

    if (statusesRes.success && Array.isArray(statusesRes.data)) {
      setAllStatusesList(statusesRes.data);
    }

    if (res.success && res.data) {
      setDashboardData(res.data);
    } else if (res.message && !res.success) {
      setError(res.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  return (
    <ScrollView
      style={[uiStyles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 10 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.eyebrow}>{currentDateString}</Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>{currentGreeting}</Text>
          <Text style={styles.subheading}>{dashboardData.subheading}</Text>
        </View>
      </View>

      {error ? (
        <View style={[styles.errorBox, { borderColor: colors.destructive, backgroundColor: colors.card }]}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          <Pressable onPress={loadDashboard} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: colors.primaryForeground, fontWeight: '700', fontSize: 13 }}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* At a glance section */}
      <SectionHeading
        title="At a glance"
        action="See orders"
        onPress={() => router.push('/(tabs)/orders')}
      />
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Total jobs" value={dashboardData.summary.total_jobs} />
            <StatCard label="Ready to ship" value={dashboardData.summary.ready_to_ship} tone="blue" />
            <StatCard label="In progress" value={dashboardData.summary.in_progress} tone="orange" />
            <StatCard label="Overdue" value={dashboardData.summary.overdue} tone="red" />
            <StatCard label="Due today" value={dashboardData.summary.due_today} tone="green" />
          </View>

          {/* Today's production section */}
          <SectionHeading title="Today’s production" action="View all" onPress={() => router.push('/(tabs)/orders')} />
              {dashboardData.today_production && dashboardData.today_production.length > 0 ? (
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
                    {dashboardData.today_production.map((job, index) => {
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
                      const isFilmApplied = Boolean(job.filmApplied ?? (job as any).film_applied ?? job.film ?? false);
                      const panelQtyValue = (job as any).panelQty ?? (job as any).panel_qty ?? (job as any).panel ?? 0;
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
                              {isFilmApplied ? 'TRUE' : 'FALSE'}
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
                              {panelQtyValue}
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
                <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No production scheduled for today.</Text>
                </View>
              )}

          {/* Department load section */}
          <SectionHeading
            title="Department load"
            action="Orders"
            onPress={() => router.push('/(tabs)/orders')}
          />
          <View style={[styles.loadCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {(() => {
              // Combine backend load data with all known production statuses
              const countMap = new Map<string, number>();
              (dashboardData.department_load || []).forEach((item) => {
                countMap.set(item.name, item.count);
              });

              // Base list of statuses to display
              const defaultStatuses = [
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

              const mergedStatusNames = Array.from(
                new Set([
                  ...defaultStatuses,
                  ...allStatusesList,
                  ...(dashboardData.department_load || []).map((d) => d.name),
                ])
              );

              return mergedStatusNames.map((statusName, index) => {
                const count = countMap.get(statusName) ?? 0;
                return (
                  <View key={statusName} style={styles.loadRow}>
                    <View style={styles.loadName}>
                      <View
                        style={[
                          styles.loadDot,
                          { backgroundColor: count > 0 ? (index < 3 ? colors.primary : '#e2a14b') : colors.mutedForeground },
                        ]}
                      />
                      <Text style={[styles.loadText, count === 0 && { color: colors.mutedForeground }]}>
                        {statusName}
                      </Text>
                    </View>
                    <Text style={[styles.loadCount, { color: count > 0 ? colors.foreground : colors.mutedForeground }]}>
                      {count}
                    </Text>
                  </View>
                );
              });
            })()}
          </View>

          {/* Mask colors section */}
          <SectionHeading title="Mask colors" />
          <View style={[styles.maskCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {(() => {
              const ALL_MASK_COLORS = [
                { name: 'Green', color: '#22c55e' },
                { name: 'Purple', color: '#9333ea' },
                { name: 'Red', color: '#ef4444' },
                { name: 'Yellow', color: '#eab308' },
                { name: 'Blue', color: '#3b82f6' },
                { name: 'White', color: '#ffffff', borderColor: '#d1d5db' },
                { name: 'Black', color: '#18181b' },
              ];

              const countMap = new Map<string, number>();
              const extraColors: { name: string; count: number; color: string }[] = [];

              (dashboardData.mask_colors || []).forEach((item) => {
                if (item && item.name) {
                  const key = item.name.trim().toLowerCase();
                  countMap.set(key, item.count || 0);
                  const isKnown = ALL_MASK_COLORS.some((c) => c.name.toLowerCase() === key);
                  if (!isKnown) {
                    extraColors.push(item);
                  }
                }
              });

              const listToRender = [
                ...ALL_MASK_COLORS.map((c) => ({
                  ...c,
                  count: countMap.get(c.name.toLowerCase()) ?? 0,
                })),
                ...extraColors.map((c) => ({
                  name: c.name,
                  color: c.color || '#2fa34a',
                  borderColor: c.name.toLowerCase() === 'white' ? '#d1d5db' : undefined,
                  count: c.count || 0,
                })),
              ];

              return listToRender.map((item, idx) => (
                <View
                  key={item.name}
                  style={[
                    styles.maskRow,
                    idx === listToRender.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.maskLabel}>
                    <View
                      style={[
                        styles.loadDot,
                        {
                          backgroundColor: item.color,
                          borderWidth: item.borderColor ? 1 : 0,
                          borderColor: item.borderColor || 'transparent',
                        },
                      ]}
                    />
                    <Text style={styles.loadText}>{item.name}</Text>
                  </View>
                  <Text style={[styles.loadCount, { color: colors.foreground }]}>{item.count}</Text>
                </View>
              ));
            })()}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#6b7a6e', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  greeting: { fontSize: 24, fontWeight: '800', letterSpacing: -0.7, marginTop: 5 },
  subheading: { color: '#6b7a6e', fontSize: 13, marginTop: 4 },
  bell: { width: 44, height: 44, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bellDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 10, right: 10 },
  logoStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, paddingVertical: 8 },
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
  errorBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { fontSize: 13, flex: 1, marginRight: 10 },
  retryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  emptyBox: { borderWidth: 1, borderRadius: 14, padding: 18, alignItems: 'center', marginVertical: 6 },
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
