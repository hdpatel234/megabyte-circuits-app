import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, ProgressBar, ScreenHeader, uiStyles } from '@/components/AppUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function InventoryDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inventory, adjustInventory } = useApp();
  const item = useMemo(() => inventory.find((entry) => entry.id === id), [inventory, id]);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('25');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  if (!item) return <View style={[styles.notFound, { backgroundColor: colors.background }]}><Text style={styles.notFoundTitle}>Component not found</Text><Pressable onPress={() => router.back()}><Text style={[styles.link, { color: colors.primary }]}>Go back</Text></Pressable></View>;
  const ratio = (item.quantity / item.maxStock) * 100;
  const openAdjust = (nextMode: 'add' | 'remove') => { setMode(nextMode); setModalOpen(true); };
  const saveAdjustment = () => { const value = Number(amount); if (Number.isFinite(value) && value > 0) adjustInventory(item.id, mode === 'add' ? value : -value); setModalOpen(false); };
  return <View style={[uiStyles.screen, { backgroundColor: colors.background }]}><ScrollView contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}>
    <ScreenHeader title={item.sku} subtitle="Inventory detail" onBack={() => router.back()} />
    <View style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.componentIcon, { backgroundColor: colors.secondary }]}><Feather name="cpu" size={25} color={colors.primary} /></View><View style={styles.titleCopy}><Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text><Text style={styles.category}>{item.category} · {item.supplier}</Text></View></View>
    <View style={[styles.stockCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.stockHeader}><View><Text style={styles.stockLabel}>Current stock</Text><Text style={[styles.stockValue, { color: colors.foreground }]}>{item.quantity} <Text style={styles.stockMax}>/ {item.maxStock}</Text></Text></View><View style={[styles.stockStatus, { backgroundColor: item.quantity === 0 ? '#fbe8e6' : item.quantity <= item.threshold ? '#fff0dc' : '#e2f3e5' }]}><Text style={{ color: item.quantity === 0 ? colors.destructive : item.quantity <= item.threshold ? '#9a5a16' : colors.primary, fontSize: 11, fontWeight: '800' }}>{item.quantity === 0 ? 'Out of stock' : item.quantity <= item.threshold ? 'Low stock' : 'In stock'}</Text></View></View><ProgressBar value={ratio} color={item.quantity <= item.threshold ? '#e2a14b' : colors.primary} /><Text style={styles.threshold}>Minimum threshold: {item.threshold} units</Text></View>
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Component information</Text><View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{[['Unit price', `$${item.unitPrice.toFixed(2)}`], ['Storage location', item.location], ['Last updated', item.lastUpdated], ['Maximum stock', `${item.maxStock} units`]].map(([label, value]) => <View key={label} style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>)}</View>
    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Inventory actions</Text><View style={styles.actions}><View style={styles.actionHalf}><PrimaryButton title="Add stock" icon="plus" onPress={() => openAdjust('add')} /></View><View style={styles.actionHalf}><Pressable onPress={() => openAdjust('remove')} style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="minus" size={18} color={colors.destructive} /><Text style={[styles.secondaryText, { color: colors.destructive }]}>Remove stock</Text></Pressable></View></View><Pressable style={[styles.historyButton, { borderColor: colors.border }]}><Feather name="clock" size={17} color={colors.primary} /><Text style={[styles.historyText, { color: colors.primary }]}>View transaction history</Text><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>
  </ScrollView>
  <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}><View style={styles.modalBackdrop}><View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}><View style={styles.sheetHandle} /><Text style={[styles.sheetTitle, { color: colors.foreground }]}>{mode === 'add' ? 'Add stock' : 'Remove stock'}</Text><Text style={styles.sheetSubtitle}>{mode === 'add' ? 'Record incoming components.' : 'Record components used or removed.'}</Text><Text style={styles.inputLabel}>Quantity</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={[styles.amountInput, { borderColor: colors.input, color: colors.foreground }]} /><View style={styles.sheetActions}><Pressable onPress={() => setModalOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable><View style={styles.saveButton}><PrimaryButton title="Save adjustment" onPress={saveAdjustment} /></View></View></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundTitle: { color: '#173524', fontSize: 20, fontWeight: '800' },
  link: { fontWeight: '800' },
  titleCard: { borderWidth: 1, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  componentIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  titleCopy: { flex: 1 },
  itemName: { fontSize: 19, fontWeight: '800' },
  category: { color: '#6b7a6e', fontSize: 12, marginTop: 5 },
  stockCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 12 },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  stockLabel: { color: '#8b978d', fontSize: 11, textTransform: 'uppercase', fontWeight: '800' },
  stockValue: { fontSize: 31, fontWeight: '800', marginTop: 3 },
  stockMax: { color: '#8b978d', fontSize: 17, fontWeight: '600' },
  stockStatus: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99 },
  threshold: { color: '#8b978d', fontSize: 11, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  infoCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 16 },
  infoRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#edf2ed' },
  infoLabel: { color: '#6b7a6e', fontSize: 13 },
  infoValue: { color: '#314138', fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  actionHalf: { flex: 1 },
  secondaryButton: { height: 52, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { fontSize: 14, fontWeight: '800' },
  historyButton: { borderWidth: 1, borderRadius: 15, height: 52, marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 },
  historyText: { flex: 1, fontSize: 13, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(19, 35, 25, 0.34)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20 },
  sheetHandle: { backgroundColor: '#ccd7ce', width: 40, height: 4, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '800' },
  sheetSubtitle: { color: '#6b7a6e', fontSize: 12, marginTop: 4, marginBottom: 18 },
  inputLabel: { color: '#314138', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  amountInput: { height: 54, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 18, fontWeight: '700' },
  sheetActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 18 },
  cancelButton: { height: 52, paddingHorizontal: 8, justifyContent: 'center' },
  cancelText: { color: '#6b7a6e', fontWeight: '800' },
  saveButton: { width: 160 },
});