import { Feather } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, JobCard, ScreenHeader, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function ScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { jobs, hydrated, isAuthenticated } = useApp();
  const [query, setQuery] = useState('');

  if (!hydrated) return null;
  if (!isAuthenticated) return <Redirect href="/" />;

  const match = query.trim() ? jobs.filter((job) => job.tool.toLowerCase().includes(query.toLowerCase()) || job.orderNumber.includes(query)) : [];
  return <ScrollView style={[uiStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}><ScreenHeader title="Scan a job" subtitle="Find a tool or order quickly" onBack={() => router.back()} /><View style={[styles.scanner, { backgroundColor: colors.primary }]}><View style={styles.cornerTL} /><View style={styles.cornerTR} /><View style={styles.cornerBL} /><View style={styles.cornerBR} /><Feather name="maximize" size={60} color="#dff0e2" /><Text style={styles.scannerTitle}>Scanner ready</Text><Text style={styles.scannerSub}>Camera support can be connected here later.</Text></View><Text style={styles.or}>or search manually</Text><View style={[styles.search, { borderColor: colors.input, backgroundColor: colors.card }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Tool number or order…" placeholderTextColor={colors.mutedForeground} style={styles.input} /></View>{query ? <View style={styles.results}>{match.length ? match.map((job) => <JobCard key={job.id} job={job} onPress={() => router.replace({ pathname: '/order/[id]', params: { id: job.id } })} />) : <EmptyState icon="search" title="No matching jobs" detail="Try a tool number such as M4802." />}</View> : <View style={styles.helper}><Feather name="info" size={17} color={colors.primary} /><Text style={styles.helperText}>Search by the tool number printed on the traveler or scan a barcode when a camera is connected.</Text></View>}</ScrollView>;
}

const styles = StyleSheet.create({
  scanner: { minHeight: 250, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 10, overflow: 'hidden' },
  cornerTL: { position: 'absolute', left: 30, top: 30, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#dff0e2', borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', right: 30, top: 30, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#dff0e2', borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', left: 30, bottom: 30, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#dff0e2', borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', right: 30, bottom: 30, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#dff0e2', borderBottomRightRadius: 8 },
  scannerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800', marginTop: 15 },
  scannerSub: { color: '#d9ebdc', fontSize: 12, marginTop: 5 },
  or: { color: '#8b978d', textAlign: 'center', fontSize: 12, fontWeight: '700', marginVertical: 18 },
  search: { height: 54, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15 },
  input: { flex: 1, color: '#173524', fontSize: 14 },
  results: { marginTop: 18 },
  helper: { flexDirection: 'row', gap: 9, padding: 15, marginTop: 18, borderRadius: 15, backgroundColor: '#e8f0e8' },
  helperText: { flex: 1, color: '#536257', fontSize: 12, lineHeight: 18 },
});