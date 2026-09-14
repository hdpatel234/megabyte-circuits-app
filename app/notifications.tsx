import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ScreenHeader, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const iconByType = { assignment: 'user-plus', overdue: 'clock', status: 'refresh-cw', inventory: 'package', announcement: 'bell' } as const;
export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  return <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}><ScreenHeader title="Notifications" subtitle="Production updates for your shift" onBack={() => router.back()} right={<Pressable onPress={markAllNotificationsRead}><Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text></Pressable>} />{notifications.length ? <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>{notifications.map((notification) => <Pressable key={notification.id} onPress={() => markNotificationRead(notification.id)} style={[styles.row, notification.unread && { backgroundColor: colors.accent }]}><View style={[styles.icon, { backgroundColor: notification.unread ? colors.primary : colors.secondary }]}><Feather name={iconByType[notification.type]} size={17} color={notification.unread ? colors.primaryForeground : colors.primary} /></View><View style={styles.copy}><View style={styles.titleRow}><Text style={[styles.title, { color: colors.foreground }]}>{notification.title}</Text>{notification.unread && <View style={[styles.unread, { backgroundColor: colors.destructive }]} />}</View><Text style={styles.detail}>{notification.detail}</Text><Text style={styles.time}>{notification.time}</Text></View></Pressable>)}</View> : <EmptyState icon="bell-off" title="No notifications" detail="You’re all caught up for this shift." />}</ScrollView>;
}

const styles = StyleSheet.create({
  markAll: { fontSize: 11, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  row: { padding: 15, flexDirection: 'row', gap: 12, borderBottomWidth: 1, borderBottomColor: '#edf2ed' },
  icon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontSize: 14, fontWeight: '800' },
  unread: { width: 6, height: 6, borderRadius: 3 },
  detail: { color: '#536257', fontSize: 12, lineHeight: 17 },
  time: { color: '#8b978d', fontSize: 10, marginTop: 2 },
});