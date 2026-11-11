import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '@yccify/api';
import { Course, Resource, ResourceCategory } from '@yccify/types';

export const CourseDetailsScreen: React.FC<{
  course: Course;
  onBack: () => void;
  onSelectResource: (resId: string) => void;
}> = ({ course, onBack, onSelectResource }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('notes');
  const [searchNotes, setSearchNotes] = useState('');
  const [viewingCategoryFiles, setViewingCategoryFiles] = useState(false);

  useEffect(() => {
    api.resources
      .getResources({ courseId: course.id, status: 'approved' })
      .then((data) => setResources(data))
      .catch((err) => console.error(err));
  }, [course]);

  const handleToggleBookmark = async (resourceId: string) => {
    try {
      const res = await api.bookmarks.toggleBookmark(resourceId);
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, isBookmarked: res.isBookmarked } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const categoryStats = {
    notes: resources.filter((r) => r.category === 'notes').length,
    pyqs: resources.filter((r) => r.category === 'pyqs').length,
    practicals: resources.filter((r) => r.category === 'practicals').length,
    assignments: resources.filter((r) => r.category === 'assignments').length,
  };

  const categoryCards = [
    { key: 'notes' as ResourceCategory, label: 'Notes', count: categoryStats.notes, icon: 'document-text', color: '#155EEF', bg: '#EFF4FF' },
    { key: 'pyqs' as ResourceCategory, label: 'PYQs', count: categoryStats.pyqs, icon: 'help-circle', color: '#D97706', bg: '#FEF3C7' },
    { key: 'practicals' as ResourceCategory, label: 'Practicals', count: categoryStats.practicals, icon: 'flask', color: '#059669', bg: '#D1FAE5' },
    { key: 'assignments' as ResourceCategory, label: 'Assignments', count: categoryStats.assignments, icon: 'clipboard', color: '#7C3AED', bg: '#EDE9FE' },
  ];

  const currentFiles = resources
    .filter((r) => r.category === selectedCategory)
    .filter((r) => r.title.toLowerCase().includes(searchNotes.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => {
            if (viewingCategoryFiles) {
              setViewingCategoryFiles(false);
            } else {
              onBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View>
          <Text style={styles.topHeaderTitle}>{course.name}</Text>
          <Text style={styles.topHeaderSub}>
            {course.code} • {viewingCategoryFiles ? selectedCategory.toUpperCase() : 'Sem 7'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!viewingCategoryFiles ? (
          <>
            {/* Course Card matching Screenshot */}
            <View style={styles.courseHeroCard}>
              <View style={styles.courseHeroIcon}>
                <Ionicons name="bulb-outline" size={32} color="#7C3AED" />
              </View>
              <Text style={styles.courseHeroTitle}>{course.name}</Text>
              <Text style={styles.courseHeroCode}>{course.code}</Text>
              <Text style={styles.courseHeroFaculty}>
                {course.facultyName || 'Department Faculty'}
              </Text>
            </View>

            {/* 4 Category Cards matching Mobile Screenshot */}
            <View style={styles.categoriesGrid}>
              {categoryCards.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => {
                    setSelectedCategory(cat.key);
                    setViewingCategoryFiles(true);
                  }}
                  style={styles.categoryCard}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: cat.bg }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <Text style={styles.categoryTitle}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>
                    {cat.count} {cat.count === 1 ? 'file' : 'files'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Course Details Box matching Screenshot */}
            <View style={styles.detailsBox}>
              <Text style={styles.detailsHeader}>Course Details</Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Course Code</Text>
                <Text style={styles.detailsValue}>{course.code}</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Credits</Text>
                <Text style={styles.detailsValue}>{course.credits || 3} Credits</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Faculty</Text>
                <Text style={styles.detailsValue}>
                  {course.facultyName || 'Department Faculty'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Notes Files Listing matching Mobile Screenshot */
          <View style={styles.filesSection}>
            <Text style={styles.filesHeader}>
              {course.name} - {selectedCategory.toUpperCase()} ({currentFiles.length} files)
            </Text>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
              <TextInput
                value={searchNotes}
                onChangeText={setSearchNotes}
                placeholder={`Search ${selectedCategory}...`}
                placeholderTextColor={theme.colors.textMuted}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filesList}>
              {currentFiles.map((res) => {
                const file = res.files[0];
                const sizeMb = file ? (file.fileSizeBytes / (1024 * 1024)).toFixed(1) : '2.1';
                return (
                  <TouchableOpacity
                    key={res.id}
                    onPress={() => onSelectResource(res.id)}
                    style={styles.fileItem}
                  >
                    <View style={styles.pdfIconBox}>
                      <Ionicons name="document-text" size={20} color="#EF4444" />
                    </View>

                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {res.title}
                      </Text>
                      <Text style={styles.fileMeta}>
                        {sizeMb} MB • 12 Aug 2025
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleToggleBookmark(res.id)}
                      style={styles.bookmarkButton}
                    >
                      <Ionicons
                        name={res.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={res.isBookmarked ? theme.colors.primary : theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  topHeaderSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  courseHeroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  courseHeroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  courseHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  courseHeroCode: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
  },
  courseHeroFaculty: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  categoryCount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 12,
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  detailsValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filesSection: {
    gap: 14,
  },
  filesHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
  },
  filesList: {
    gap: 10,
    marginTop: 6,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  pdfIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fileMeta: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 6,
  },
});

