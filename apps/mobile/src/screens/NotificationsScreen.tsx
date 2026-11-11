import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const NotificationsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { notifications } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <View key={n.id} style={styles.notifCard}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={n.type === 'success' ? 'checkmark-circle' : 'information-circle'}
                  size={20}
                  color={n.type === 'success' ? theme.colors.success : theme.colors.primary}
                />
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMessage}>{n.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={36} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  notifMessage: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});

