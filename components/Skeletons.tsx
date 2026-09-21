import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.muted || '#e2e8e4',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width={120} height={12} borderRadius={4} />
          <SkeletonBox width={200} height={26} borderRadius={6} />
          <SkeletonBox width={160} height={14} borderRadius={4} />
        </View>
        <SkeletonBox width={44} height={44} borderRadius={15} />
      </View>

      {/* Shift strip */}
      <View style={styles.stripRow}>
        <SkeletonBox width={130} height={20} borderRadius={6} />
        <SkeletonBox width={100} height={16} borderRadius={4} />
      </View>

      {/* At a glance grid */}
      <View style={{ marginTop: 24, gap: 12 }}>
        <SkeletonBox width={100} height={16} borderRadius={4} />
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <SkeletonBox width={60} height={10} borderRadius={3} />
              <SkeletonBox width={40} height={24} borderRadius={6} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Today's production list */}
      <View style={{ marginTop: 28, gap: 12 }}>
        <SkeletonBox width={140} height={16} borderRadius={4} />
        {[1, 2].map((i) => (
          <View key={i} style={[styles.jobCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBox width={120} height={16} borderRadius={4} />
              <SkeletonBox width={180} height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={70} height={24} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function OrdersSkeleton() {
  const colors = useColors();

  return (
    <View style={{ gap: 14, marginTop: 12 }}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <SkeletonBox width="82%" height={52} borderRadius={16} />
        <SkeletonBox width={44} height={52} borderRadius={16} />
      </View>

      {/* Order list items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.jobCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={{ flex: 1, gap: 10 }}>
            <SkeletonBox width="50%" height={16} borderRadius={4} />
            <SkeletonBox width="75%" height={12} borderRadius={4} />
            <SkeletonBox width="40%" height={12} borderRadius={4} />
          </View>
          <SkeletonBox width={70} height={24} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

export function InventorySkeleton() {
  const colors = useColors();

  return (
    <View style={{ gap: 16, marginTop: 12 }}>
      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SkeletonBox width="31%" height={70} borderRadius={16} />
        <SkeletonBox width={100} height={70} borderRadius={16} />
        <SkeletonBox width={100} height={70} borderRadius={16} />
      </View>

      {/* Search */}
      <SkeletonBox width="100%" height={50} borderRadius={16} />

      {/* Inventory items */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.inventoryCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="60%" height={16} borderRadius={4} />
            <SkeletonBox width="40%" height={12} borderRadius={4} />
          </View>
          <SkeletonBox width={60} height={32} borderRadius={10} />
        </View>
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  const colors = useColors();

  return (
    <View style={{ gap: 18, marginTop: 12 }}>
      {/* Profile main card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SkeletonBox width={58} height={58} borderRadius={20} />
        <View style={{ flex: 1, gap: 8 }}>
          <SkeletonBox width={150} height={20} borderRadius={6} />
          <SkeletonBox width={180} height={12} borderRadius={4} />
          <SkeletonBox width={100} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Info card */}
      <View style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={{ gap: 6 }}>
          <SkeletonBox width={60} height={10} borderRadius={3} />
          <SkeletonBox width={90} height={14} borderRadius={4} />
        </View>
        <View style={{ gap: 6 }}>
          <SkeletonBox width={60} height={10} borderRadius={3} />
          <SkeletonBox width={110} height={14} borderRadius={4} />
        </View>
        <View style={{ gap: 6 }}>
          <SkeletonBox width={40} height={10} borderRadius={3} />
          <SkeletonBox width={70} height={14} borderRadius={4} />
        </View>
      </View>

      {/* Menu group */}
      <View style={[styles.menuCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.menuRow}>
            <SkeletonBox width={34} height={34} borderRadius={11} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBox width={110} height={14} borderRadius={4} />
              <SkeletonBox width={160} height={10} borderRadius={3} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function NotificationSkeleton() {
  const colors = useColors();

  return (
    <View style={{ gap: 12, marginTop: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.notificationCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <SkeletonBox width={36} height={36} borderRadius={12} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonBox width="80%" height={14} borderRadius={4} />
            <SkeletonBox width="95%" height={12} borderRadius={4} />
            <SkeletonBox width="30%" height={10} borderRadius={3} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DetailsSkeleton() {
  const colors = useColors();

  return (
    <View style={{ gap: 16, marginTop: 12 }}>
      {/* Hero Details Card */}
      <View style={[styles.jobCard, { borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch', padding: 16, borderRadius: 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonBox width={120} height={18} borderRadius={6} />
          <SkeletonBox width={70} height={24} borderRadius={12} />
        </View>

        {/* QTY 2x2 Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: '48%', height: 60, borderRadius: 14, backgroundColor: colors.muted || '#f1f5f9', padding: 10, justifyContent: 'center', gap: 6 }}>
              <SkeletonBox width={60} height={10} borderRadius={3} />
              <SkeletonBox width={80} height={18} borderRadius={4} />
            </View>
          ))}
        </View>

        {/* Info Cells Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, borderTopWidth: 1, borderTopColor: colors.border || '#edf2ed', marginTop: 16, paddingTop: 15 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ width: '29%', gap: 4 }}>
              <SkeletonBox width={45} height={10} borderRadius={3} />
              <SkeletonBox width={65} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* Order Notes Skeleton Card */}
      <View style={{ gap: 8 }}>
        <SkeletonBox width={110} height={18} borderRadius={4} />
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, backgroundColor: colors.card, gap: 12 }}>
          <SkeletonBox width="80%" height={14} borderRadius={4} />
          <SkeletonBox width="60%" height={14} borderRadius={4} />
        </View>
      </View>

      {/* Timeline Skeleton Card */}
      <View style={{ gap: 8, marginTop: 8 }}>
        <SkeletonBox width={120} height={18} borderRadius={4} />
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, backgroundColor: colors.card, gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <SkeletonBox width={20} height={20} borderRadius={10} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonBox width={100} height={14} borderRadius={4} />
                <SkeletonBox width={140} height={10} borderRadius={3} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stripRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  statCard: { width: '48%', height: 74, borderWidth: 1, borderRadius: 16, padding: 12 },
  jobCard: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inventoryCard: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileCard: { borderWidth: 1, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoCard: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  menuCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14 },
  menuRow: { height: 62, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  notificationCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
