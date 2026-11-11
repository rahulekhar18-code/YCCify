import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<{
  onSelectCategory: (cat: string) => void;
  onSelectResource: (resId: string) => void;
  onNavigateExplore: () => void;
  onNavigateNotifications: () => void;
}> = ({ onSelectCategory, onSelectResource, onNavigateExplore, onNavigateNotifications }) => {
  const { user, unreadCount } = useAuth();
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.resources
      .getResources({ status: 'approved' })
      .then((data) => setRecentResources(data.slice(0, 6)))
      .catch((err) => console.error(err));
  }, []);

  const categories = [
    { key: 'notes', label: 'Notes', icon: 'document-text', color: '#155EEF', bg: '#EFF4FF' },
    { key: 'pyqs', label: 'PYQs', icon: 'help-circle', color: '#D97706', bg: '#FEF3C7' },
    { key: 'practicals', label: 'Practicals', icon: 'flask', color: '#059669', bg: '#D1FAE5' },
    { key: 'assignments', label: 'Assignments', icon: 'clipboard', color: '#7C3AED', bg: '#EDE9FE' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Top Bar matching Mobile Screenshot */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={require('../../assets/icon.jpg')}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.greetingText}>
              Hi, {user?.name?.split(' ')[0] || 'Rahul'} 👋
            </Text>
            <Text style={styles.departmentText}>
              {user?.branchName?.split(' ')[0] || 'IT'} - Semester {user?.semesterNumber || 7}
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={onNavigateNotifications} style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
            {unreadCount > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>

          <Image
            source={{
              uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* 2. Search Bar matching Screenshot */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search courses, notes, faculty..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {/* 3. Hero Banner matching Mobile Reference */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Study · Share · Grow</Text>
          <Text style={styles.heroSubtitle}>
            All your academic resources in one place.
          </Text>
        </View>
        <View style={styles.heroIconBox}>
          <Ionicons name="school" size={44} color="#FFFFFF" />
        </View>
      </View>

      {/* 4. Quick Category Icons matching Screenshot */}
      <View style={styles.categoriesRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelectCategory(cat.key)}
            style={styles.categoryItem}
          >
            <View style={[styles.categoryIconCircle, { backgroundColor: cat.bg }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 5. Recently Uploaded Section matching Screenshot */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Uploaded</Text>
        <TouchableOpacity onPress={onNavigateExplore}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resourcesList}>
        {recentResources.map((res) => {
          const file = res.files[0];
          const sizeMb = file ? (file.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.4';
          return (
            <TouchableOpacity
              key={res.id}
              onPress={() => onSelectResource(res.id)}
              style={styles.resourceCard}
            >
              <View style={styles.pdfBadge}>
                <Ionicons name="document-text" size={20} color="#EF4444" />
              </View>

              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle} numberOfLines={1}>
                  {res.title}
                </Text>
                <Text style={styles.resourceSubtitle} numberOfLines={1}>
                  {res.courseName} • {res.branchCode || 'IT'} Sem {res.semesterNumber || 7}
                </Text>
                <Text style={styles.resourceMeta}>
                  {sizeMb} MB • 2 days ago
                </Text>
              </View>

              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  departmentText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 18,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  resourcesList: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  pdfBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  resourceSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  resourceMeta: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  moreButton: {
    padding: 6,
  },
});

