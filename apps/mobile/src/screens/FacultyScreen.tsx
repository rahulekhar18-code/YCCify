import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '@yccify/api';
import { Faculty } from '@yccify/types';

export const FacultyScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.academic
      .getFaculty()
      .then(setFaculty)
      .catch((err) => console.error(err));
  }, []);

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Phone', 'Office contact: +91 98220 12345 (YCCE IT Dept.)');
    }
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const filtered = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase()) ||
      f.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.topHeaderTitle}>Faculty Directory</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Faculty Input matching Screenshot */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search faculty..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Faculty Cards List matching Screenshot */}
        <View style={styles.facultyList}>
          {filtered.map((f) => (
            <View key={f.id} style={styles.facultyCard}>
              <Image
                source={{
                  uri: f.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                }}
                style={styles.facultyAvatar}
              />

              <View style={styles.facultyInfo}>
                <Text style={styles.facultyName}>{f.name}</Text>
                <Text style={styles.facultyDesignation}>
                  {f.designation} • {f.department.split(' ')[0]} Dept.
                </Text>
                <Text style={styles.facultySpecialization} numberOfLines={1}>
                  {f.specialization || 'Academic Professor'}
                </Text>
              </View>

              {/* Call & Email Buttons matching Screenshot */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleCall(f.phone)}
                  style={styles.iconCircle}
                >
                  <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleEmail(f.email)}
                  style={styles.iconCircle}
                >
                  <Ionicons name="mail-outline" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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
    paddingBottom: 40,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  facultyList: {
    gap: 12,
  },
  facultyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  facultyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  facultyDesignation: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  facultySpecialization: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

