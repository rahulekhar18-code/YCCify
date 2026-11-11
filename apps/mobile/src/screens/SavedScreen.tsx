import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

export const SavedScreen: React.FC<{
  onSelectResource: (id: string) => void;
}> = ({ onSelectResource }) => {
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<'all' | 'notes' | 'pyqs' | 'practicals'>('all');

  const loadData = async () => {
    try {
      const data = await api.bookmarks.getBookmarks();
      setBookmarks(data);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.bookmarks.toggleBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {}
  };

  const filtered = bookmarks.filter((b) => (filter === 'all' ? true : b.category === filter));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Resources</Text>
        <Text style={styles.headerSub}>Quick access to your bookmarked study files</Text>
      </View>

      {/* Category Filter Pills matching Mobile Reference */}
      <View style={styles.filterRow}>
        {(['all', 'notes', 'pyqs', 'practicals'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilter(cat)}
            style={[styles.filterPill, filter === cat && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
              {cat === 'all' ? 'All' : cat === 'pyqs' ? 'PYQs' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookmarked Files List matching Mobile Screenshot */}
      <View style={styles.filesList}>
        {filtered.map((res) => {
          const file = res.files[0];
          const sizeMb = file ? (file.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.1';
          return (
            <TouchableOpacity
              key={res.id}
              onPress={() => onSelectResource(res.id)}
              style={styles.fileCard}
            >
              <View style={styles.pdfBadge}>
                <Ionicons name="document-text" size={20} color="#EF4444" />
              </View>

              <View style={styles.fileInfo}>
                <Text style={styles.fileTitle} numberOfLines={1}>
                  {res.title}
                </Text>
                <Text style={styles.fileSub}>
                  {res.courseName || 'Operating System'} • {res.branchCode || 'IT'}
                </Text>
                <Text style={styles.fileMeta}>
                  {sizeMb} MB • 5 days ago
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleRemove(res.id)}
                style={styles.bookmarkActiveButton}
              >
                <Ionicons name="bookmark" size={20} color={theme.colors.primary} />
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
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filesList: {
    gap: 12,
    marginTop: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
  fileInfo: {
    flex: 1,
  },
  fileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fileSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  fileMeta: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  bookmarkActiveButton: {
    padding: 6,
  },
});

