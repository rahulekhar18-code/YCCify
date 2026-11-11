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
import { Branch, Semester, Course } from '@yccify/types';

export const ExploreScreen: React.FC<{
  onSelectCourse: (course: Course) => void;
}> = ({ onSelectCourse }) => {
  // Navigation step state: 1: Branch, 2: Semester, 3: Courses
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(7);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    api.academic
      .getBranches()
      .then((bList) => {
        setBranches(bList);
        if (bList.length > 0) setSelectedBranch(bList[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setSemesters([]);
    setLoadingSemesters(true);
    setStep(2);
    api.academic
      .getSemesters(branch.id)
      .then((sList) => setSemesters(sList))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSemesters(false));
  };

  const handleSelectSemester = (semNum: number) => {
    setSelectedSemester(semNum);
    if (selectedBranch) {
      api.academic
        .getCourses({
          branchId: selectedBranch.id,
          semesterNumber: semNum,
        })
        .then((cList) => {
          setCourses(cList);
          setStep(3);
        })
        .catch((err) => console.error(err));
    }
  };

  const getBranchIcon = (code: string) => {
    switch (code) {
      case 'IT':
        return 'hardware-chip-outline';
      case 'CSE':
        return 'code-slash-outline';
      case 'ETC':
        return 'radio-outline';
      case 'ME':
        return 'settings-outline';
      case 'CE':
        return 'business-outline';
      default:
        return 'layers-outline';
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.facultyName?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ================= STEP 1: SELECT BRANCH ================= */}
      {step === 1 && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Branch</Text>
            <Text style={styles.headerSubtitle}>
              Choose your department to explore courses
            </Text>
          </View>

          <View style={styles.branchList}>
            {branches.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => handleSelectBranch(b)}
                style={styles.branchCard}
              >
                <View style={styles.branchIconBox}>
                  <Ionicons name={getBranchIcon(b.code) as any} size={22} color={theme.colors.primary} />
                </View>

                <View style={styles.branchInfo}>
                  <Text style={styles.branchName}>{b.name}</Text>
                  <Text style={styles.branchMeta}>
                    {b.code} • {b.semestersCount ?? 0} {(b.semestersCount ?? 0) === 1 ? 'Semester' : 'Semesters'} • {b.coursesCount ?? 0} {(b.coursesCount ?? 0) === 1 ? 'Course' : 'Courses'}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {b.code === 'IT' ? '4.9 (148 reviews)' : b.code === 'CSE' ? '4.9 (162 reviews)' : '4.8 (94 reviews)'}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ================= STEP 2: SELECT SEMESTER ================= */}
      {step === 2 && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>{selectedBranch?.name || 'Department'}</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Semester</Text>
            <Text style={styles.headerSubtitle}>
              Access core courses and curriculum files
            </Text>
          </View>

          {/* Real-time Grid of Semesters from backend */}
          {loadingSemesters ? (
            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: 24 }}>
              Loading semesters...
            </Text>
          ) : (
            <View style={styles.semesterGrid}>
              {semesters.map((sem) => {
                const isSelected = selectedSemester === sem.semesterNumber;
                const count = sem.coursesCount ?? 0;
                return (
                  <TouchableOpacity
                    key={sem.id}
                    onPress={() => handleSelectSemester(sem.semesterNumber)}
                    style={[styles.semesterCard, isSelected && styles.semesterCardActive]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={22}
                      color={isSelected ? '#FFFFFF' : theme.colors.primary}
                    />
                    <Text style={[styles.semTitle, isSelected && styles.semTitleActive]}>
                      Sem {sem.semesterNumber}
                    </Text>
                    <Text style={[styles.semCourses, isSelected && styles.semCoursesActive]}>
                      {count} {count === 1 ? 'Course' : 'Courses'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ================= STEP 3: COURSE LISTING ================= */}
      {step === 3 && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>
              {selectedBranch?.code || 'IT'} • Sem {selectedSemester}
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={courseSearch}
              onChangeText={setCourseSearch}
              placeholder="Search course..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.courseList}>
            {filteredCourses.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => onSelectCourse(c)}
                style={styles.courseCard}
              >
                <View style={styles.courseIconBox}>
                  <Ionicons name="bulb-outline" size={22} color={theme.colors.primary} />
                </View>

                <View style={styles.courseInfo}>
                  <Text style={styles.courseName}>{c.name}</Text>
                  <Text style={styles.courseMeta}>
                    {c.code} • {c.facultyName || 'Department Faculty'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  branchList: {
    gap: 12,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  branchIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  branchMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  semesterCard: {
    width: '47%',
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  semesterCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  semTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  semTitleActive: {
    color: '#FFFFFF',
  },
  semCourses: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  semCoursesActive: {
    color: '#EFF4FF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  courseList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  courseMeta: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

