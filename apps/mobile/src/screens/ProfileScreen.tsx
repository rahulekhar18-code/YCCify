import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of YCCify?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name || 'Rahul Sharma'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'rahul.sharma@ycce.edu'}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
        </View>
      </View>

      {/* Academic Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Academic Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>College</Text>
          <Text style={styles.infoVal}>YCCE, Nagpur</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branch</Text>
          <Text style={styles.infoVal}>{user?.branchName || 'Information Technology'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Semester</Text>
          <Text style={styles.infoVal}>Semester {user?.semesterNumber || 7}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile Number</Text>
          <Text style={styles.infoVal}>{user?.phone || 'Not set'}</Text>
        </View>
      </View>

      {/* Account Settings & Sign Out */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account & Storage</Text>

        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="cloud-done-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.menuText}>InsForge Cloud Connected</Text>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.menuRow, { borderBottomWidth: 0, marginTop: 4 }]}
        >
          <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />
          <Text style={[styles.menuText, { color: theme.colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rolePill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

