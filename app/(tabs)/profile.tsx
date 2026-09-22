import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoLockup, PrimaryButton, ScreenHeader, uiStyles } from '@/components/AppUI';
import { ProfileSkeleton } from '@/components/Skeletons';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { api } from '@/services/api';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshBootstrap } = useApp();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Jignesh Dave',
    email: user?.email || 'jignesh@megabyte.local',
    mobile: '+91 98765 43210',
    role: user?.role || 'Production Operator',
    department: user?.department || 'PCB Production',
    employeeCode: user?.employeeCode || 'MCS-042',
    shift: 'Shift A · 08:00–18:00',
    location: 'Production floor, Bay 3',
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const res = await api.getProfile();
    if (res.success && res.data) {
      setProfileData((prev) => ({
        ...prev,
        ...res.data,
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    setEditName(profileData.name);
    setEditEmail(profileData.email);
    setEditMobile(profileData.mobile);
    setEditModalOpen(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Required', 'Name and email cannot be empty.');
      return;
    }
    setUpdating(true);
    const res = await api.updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      mobile: editMobile.trim(),
    });
    setUpdating(false);

    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
      }));
      setEditModalOpen(false);
      refreshBootstrap();
      Alert.alert('Success', 'Profile details updated successfully.');
    } else {
      Alert.alert('Error', res.message || 'Failed to update profile.');
    }
  };

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordModalOpen(true);
  };

  const savePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Please enter current and new password.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setUpdating(true);
    const res = await api.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setUpdating(false);

    if (res.success) {
      setPasswordModalOpen(false);
      Alert.alert('Success', 'Password changed successfully.');
    } else {
      setPasswordError(res.message || 'Failed to change password.');
    }
  };

  const signOut = () =>
    Alert.alert('Sign out?', 'Are you sure you want to sign out from your employee account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const initials = profileData.name
    ? profileData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
    : 'JD';

  return (
    <View style={[uiStyles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 4 }]}>
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{profileData.name}</Text>
                <Text style={styles.profileRole}>{profileData.role || 'Production Operator'}</Text>
              </View>
            </View>

            <Text style={styles.groupLabel}>ACCOUNT & PREFERENCES</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable onPress={openEditModal} style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="user" size={17} color={colors.primary} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>Edit profile</Text>
                  <Text style={styles.menuDetail}>Name, email and phone</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>

              <Pressable onPress={openPasswordModal} style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="lock" size={17} color={colors.primary} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>Change password</Text>
                  <Text style={styles.menuDetail}>Update your sign-in details</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>

              <View style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name="info" size={17} color={colors.primary} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>About the app</Text>
                  <Text style={styles.menuDetail}>Version {appVersion}</Text>
                </View>
              </View>
              <Pressable onPress={signOut} style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: '#fbe8e6' }]}>
                  <Feather name="log-out" size={17} color={colors.destructive} />
                </View>
                <View style={styles.menuCopy}>
                  <Text style={[styles.menuTitle, { color: colors.destructive }]}>Sign out</Text>
                  <Text style={styles.menuDetail}>End this session on this device</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={styles.brandBottom}>
              <LogoLockup compact />
              <Text>v{appVersion}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalOpen} animationType="slide" transparent onRequestClose={() => setEditModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Edit profile</Text>
              <Text style={styles.sheetSubtitle}>Update your personal and contact details.</Text>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              <Text style={styles.inputLabel}>Mobile Phone</Text>
              <TextInput
                value={editMobile}
                onChangeText={setEditMobile}
                keyboardType="phone-pad"
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              <View style={styles.sheetActions}>
                <Pressable onPress={() => setEditModalOpen(false)} style={styles.cancelButton} disabled={updating}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <View style={styles.saveButton}>
                  <PrimaryButton title={updating ? 'Saving…' : 'Save changes'} onPress={saveProfile} disabled={updating} />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalOpen} animationType="slide" transparent onRequestClose={() => setPasswordModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 18 }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Change password</Text>
              <Text style={styles.sheetSubtitle}>Set a new password for your employee account.</Text>

              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.input, color: colors.foreground }]}
              />

              {passwordError ? (
                <Text style={[styles.modalError, { color: colors.destructive }]}>{passwordError}</Text>
              ) : null}

              <View style={styles.sheetActions}>
                <Pressable onPress={() => setPasswordModalOpen(false)} style={styles.cancelButton} disabled={updating}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <View style={styles.saveButton}>
                  <PrimaryButton title={updating ? 'Updating…' : 'Update password'} onPress={savePassword} disabled={updating} />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(19, 35, 25, 0.34)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20 },
  sheetHandle: { backgroundColor: '#ccd7ce', width: 40, height: 4, borderRadius: 3, alignSelf: 'center', marginVertical: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '800' },
  sheetSubtitle: { color: '#6b7a6e', fontSize: 12, marginTop: 4, marginBottom: 16 },
  inputLabel: { color: '#314138', fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  modalInput: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  modalError: { fontSize: 12, marginTop: 8 },
  sheetActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelButton: { height: 52, paddingHorizontal: 8, justifyContent: 'center' },
  cancelText: { color: '#6b7a6e', fontWeight: '800' },
  saveButton: { width: 170 },
});