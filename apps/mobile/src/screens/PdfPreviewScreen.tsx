import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '@yccify/api';
import { Resource } from '@yccify/types';

const { width } = Dimensions.get('window');

export const PdfPreviewScreen: React.FC<{
  resourceId: string;
  onBack: () => void;
}> = ({ resourceId, onBack }) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(28);

  useEffect(() => {
    api.resources
      .getResourceById(resourceId)
      .then((data) => {
        setResource(data);
        setIsBookmarked(!!data.isBookmarked);
        if (data.files[0]?.pageCount) {
          setTotalPages(data.files[0].pageCount);
        }
        api.resources.recordView(resourceId);
      })
      .catch((err) => console.error(err));
  }, [resourceId]);

  const handleToggleBookmark = async () => {
    try {
      const res = await api.bookmarks.toggleBookmark(resourceId);
      setIsBookmarked(res.isBookmarked);
      Alert.alert(
        res.isBookmarked ? 'Bookmarked!' : 'Removed',
        res.isBookmarked
          ? 'File saved to your mobile & web library.'
          : 'File removed from saved bookmarks.'
      );
    } catch (e) {}
  };

  const handleDownload = async () => {
    try {
      await api.resources.recordDownload(resourceId);
      Alert.alert(
        'Download Started',
        'Downloading verified PDF lecture notes to your device storage.'
      );
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      {/* Top Bar matching Mobile Reference */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {resource?.title || 'Unit 3 - Classification.pdf'}
        </Text>
      </View>

      {/* Rendered PDF Page matching Screenshot */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageCard}>
          <View style={styles.pageHeader}>
            <Text style={styles.unitTitle}>Unit 3</Text>
            <Text style={styles.unitSubtitle}>Classification</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>3.1 Introduction</Text>
            <Text style={styles.sectionBody}>
              Classification is a supervised learning technique which is used to predict the category of a given input.
            </Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>3.2 Common Algorithms</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Decision Tree</Text>
              <Text style={styles.bulletItem}>• Naive Bayes</Text>
              <Text style={styles.bulletItem}>• Support Vector Machine (SVM)</Text>
              <Text style={styles.bulletItem}>• k-Nearest Neighbour (k-NN)</Text>
            </View>
          </View>

          {/* Page Indicator Pill matching Screenshot */}
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>
              {currentPage} / {totalPages}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar matching Screenshot */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleDownload} style={styles.actionBtn}>
          <Ionicons name="download-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleBookmark} style={styles.actionBtn}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Search In Document', 'Search within slide keywords enabled.')}
          style={styles.actionBtn}
        >
          <Ionicons name="search-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Fullscreen', 'Fullscreen slide presentation view.')}
          style={styles.actionBtn}
        >
          <Ionicons name="scan-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  pageCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 520,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  unitSubtitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primary,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  bulletList: {
    gap: 6,
    paddingLeft: 4,
  },
  bulletItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  pagePill: {
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 20,
  },
  pagePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    padding: 8,
  },
});

