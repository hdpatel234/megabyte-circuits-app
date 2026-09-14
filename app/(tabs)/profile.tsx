import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoLockup, ScreenHeader, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

const rows = [
  { icon: 'user' as const, title: 'Edit profile', detail: 'Name, email and phone' },
  { icon: 'lock' as const, title: 'Change password', detail: 'Update your sign-in details' },
  { icon: 'bell' as const, title: 'Notification settings', detail: 'Choose what reaches you' },
  { icon: 'info' as const, title: 'About the app', detail: 'Version 1.0.0' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useApp();
  const signOut = () => Alert.alert('Sign out?', 'You can sign back in with your employee account.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } }]);
  return <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}>
    <ScreenHeader title="Profile" subtitle="Your employee account" />
    <View style={[styles.profileCard, { backgroundColor: colors.primary }]}><View style={styles.avatar}><Text style={styles.avatarText}>JD</Text></View><View style={styles.profileText}><Text style={styles.profileName}>Jignesh Dave</Text><Text style={styles.profileRole}>Production operator · Employee #MCS-042</Text><View style={styles.profileTag}><Feather name="map-pin" size={12} color="#dff0e2" /><Text style={styles.profileTagText}>Production floor</Text></View></View></View>
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View><Text style={styles.infoLabel}>Department</Text><Text style={styles.infoValue}>PCB Production</Text></View><View><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>jignesh@megabyte.local</Text></View><View><Text style={styles.infoLabel}>Shift</Text><Text style={styles.infoValue}>A · 08:00–18:00</Text></View></View>
    <Text style={styles.groupLabel}>ACCOUNT & PREFERENCES</Text>
    <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{rows.map((row) => <Pressable key={row.title} style={styles.menuRow}><View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}><Feather name={row.icon} size={17} color={colors.primary} /></View><View style={styles.menuCopy}><Text style={styles.menuTitle}>{row.title}</Text><Text style={styles.menuDetail}>{row.detail}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>)}</View>
    <Text style={styles.groupLabel}>APP</Text>
    <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Pressable onPress={() => router.push('/notifications')} style={styles.menuRow}><View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}><Feather name="inbox" size={17} color={colors.primary} /></View><View style={styles.menuCopy}><Text style={styles.menuTitle}>Notification center</Text><Text style={styles.menuDetail}>Your latest production updates</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable><Pressable onPress={signOut} style={styles.menuRow}><View style={[styles.menuIcon, { backgroundColor: '#fbe8e6' }]}><Feather name="log-out" size={17} color={colors.destructive} /></View><View style={styles.menuCopy}><Text style={[styles.menuTitle, { color: colors.destructive }]}>Sign out</Text><Text style={styles.menuDetail}>End this session on this device</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable></View>
    <View style={styles.brandBottom}><LogoLockup compact /><Text style={styles.brandCaption}>Built for the manufacturing floor</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#e3f0e5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#2f7d45', fontSize: 20, fontWeight: '800' },
  profileText: { flex: 1 },
  profileName: { color: '#ffffff', fontSize: 19, fontWeight: '800' },
  profileRole: { color: '#d9ebdc', fontSize: 11, marginTop: 4 },
  profileTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  profileTagText: { color: '#dff0e2', fontSize: 10, fontWeight: '700' },
  infoCard: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#8b978d', fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  infoValue: { color: '#314138', fontSize: 12, fontWeight: '700', marginTop: 5 },
  groupLabel: { color: '#8b978d', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 25, marginBottom: 9 },
  menuCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14 },
  menuRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#edf2ed' },
  menuIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { color: '#314138', fontSize: 14, fontWeight: '700' },
  menuDetail: { color: '#8b978d', fontSize: 11, marginTop: 3 },
  brandBottom: { alignItems: 'center', marginTop: 30, gap: 6 },
  brandCaption: { color: '#8b978d', fontSize: 11 },
});