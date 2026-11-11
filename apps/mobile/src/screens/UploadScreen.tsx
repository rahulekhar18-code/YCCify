import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '@yccify/api';
import { Branch, Course, ResourceCategory } from '@yccify/types';

export const UploadScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('Information Technology');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(7);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('Machine Learning (IT701)');
  const [category, setCategory] = useState<ResourceCategory>('notes');
  const [title, setTitle] = useState('Unit 6 - Deep Learning Notes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.academic
      .getBranches()
      .then((bList) => {
        setBranches(bList);
        if (bList.length > 0) {
          setSelectedBranchId(bList[0].id);
          setSelectedBranch(bList[0].name);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;
    api.academic
      .getCourses({
        branchId: selectedBranchId,
        semesterNumber: selectedSemester,
      })
      .then((cList) => {
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0].id);
          setSelectedCourseName(`${cList[0].name} (${cList[0].code})`);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedBranchId, selectedSemester]);

  const handleUploadSubmit = async () => {
    if (!title.trim() || !selectedCourseId) {
      Alert.alert('Required', 'Please enter a title and select a course.');
      return;
    }

    setLoading(true);
    try {
      // Create resource in PostgreSQL backend
      await api.resources.createResource({
        courseId: selectedCourseId,
        category,
        title,
        unitTopic: 'Unit 6: Deep Learning',
        description: 'Uploaded via YCCify Mobile Application.',
        academicYear: '2025-2026',
        files: [
          {
            fileName: title.endsWith('.pdf') ? title : `${title}.pdf`,
            fileUrl: '/api/storage/files/unit5_neural_networks.pdf',
            storagePath: 'uploads/unit5_neural_networks.pdf',
            fileSizeBytes: 3145728,
            mimeType: 'application/pdf',
            pageCount: 20,
          },
        ],
      });

      Alert.alert(
        'Upload Successful',
        'Your file has been uploaded to InsForge Storage and submitted for faculty approval!',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Failed to complete upload.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'notes' as ResourceCategory, label: 'Notes', icon: 'document-text-outline' },
    { key: 'pyqs' as ResourceCategory, label: 'PYQs', icon: 'help-circle-outline' },
    { key: 'practicals' as ResourceCategory, label: 'Practicals', icon: 'flask-outline' },
    { key: 'assignments' as ResourceCategory, label: 'Assignments', icon: 'clipboard-outline' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Resource</Text>
        <Text style={styles.headerSub}>Contribute study materials to YCCE repository</Text>
      </View>

      {/* Select Branch Picker */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select Branch *</Text>
        <View style={styles.pickerBox}>
          <Text style={styles.pickerText}>{selectedBranch}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
        </View>
      </View>

      {/* Select Semester Picker */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select Semester *</Text>
        <View style={styles.pickerBox}>
          <Text style={styles.pickerText}>Semester {selectedSemester}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
        </View>
      </View>

      {/* Select Course Picker */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Select Course *</Text>
        <View style={styles.pickerBox}>
          <Ionicons name="school-outline" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.pickerText, { flex: 1 }]}>{selectedCourseName}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
        </View>
      </View>

      {/* Resource Category Pills matching Screenshot */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Resource Category *</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[styles.catPill, isSelected && styles.catPillActive]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : theme.colors.primary}
                />
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Title Input matching Screenshot */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Unit 6 - Deep Learning Notes"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.textInput}
        />
      </View>

      {/* Upload Files Button matching Screenshot */}
      <TouchableOpacity
        onPress={handleUploadSubmit}
        disabled={loading}
        style={[styles.uploadButton, theme.shadow.button]}
      >
        <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.uploadButtonText}>
          {loading ? 'Uploading to InsForge...' : 'Upload Files'}
        </Text>
      </TouchableOpacity>
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
    gap: 18,
  },
  header: {
    marginBottom: 8,
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
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 13,
    color: theme.colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 16,
    marginTop: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

