import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { theme } from './src/theme';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CourseDetailsScreen } from './src/screens/CourseDetailsScreen';
import { PdfPreviewScreen } from './src/screens/PdfPreviewScreen';
import { UploadScreen } from './src/screens/UploadScreen';
import { SavedScreen } from './src/screens/SavedScreen';
import { FacultyScreen } from './src/screens/FacultyScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { Course } from '@yccify/types';

type TabName = 'Home' | 'Explore' | 'Upload' | 'Saved' | 'Profile';

const MainNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<TabName>('Home');

  // Subscreen navigation
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [previewResourceId, setPreviewResourceId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFaculty, setShowFaculty] = useState(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    if (authScreen === 'register') {
      return <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />;
    }
    return <LoginScreen onNavigateRegister={() => setAuthScreen('register')} />;
  }

  // Active Screen Selector
  const renderContent = () => {
    if (previewResourceId) {
      return (
        <PdfPreviewScreen
          resourceId={previewResourceId}
          onBack={() => setPreviewResourceId(null)}
        />
      );
    }

    if (showNotifications) {
      return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
    }

    if (showFaculty) {
      return <FacultyScreen onBack={() => setShowFaculty(false)} />;
    }

    if (activeCourse) {
      return (
        <CourseDetailsScreen
          course={activeCourse}
          onBack={() => setActiveCourse(null)}
          onSelectResource={(id) => setPreviewResourceId(id)}
        />
      );
    }

    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onSelectCategory={(cat) => setActiveTab('Explore')}
            onSelectResource={(id) => setPreviewResourceId(id)}
            onNavigateExplore={() => setActiveTab('Explore')}
            onNavigateNotifications={() => setShowNotifications(true)}
          />
        );
      case 'Explore':
        return (
          <ExploreScreen
            onSelectCourse={(c) => setActiveCourse(c)}
          />
        );
      case 'Upload':
        return (
          <UploadScreen
            onSuccess={() => setActiveTab('Home')}
          />
        );
      case 'Saved':
        return (
          <SavedScreen
            onSelectResource={(id) => setPreviewResourceId(id)}
          />
        );
      case 'Profile':
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  const tabs: Array<{ name: TabName; icon: string; activeIcon: string }> = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Explore', icon: 'search-outline', activeIcon: 'search' },
    { name: 'Upload', icon: 'add-circle-outline', activeIcon: 'add-circle' },
    { name: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Body */}
      <View style={styles.body}>{renderContent()}</View>

      {/* Exactly 5 Primary Tabs matching visual reference */}
      {!previewResourceId && !activeCourse && !showNotifications && !showFaculty && (
        <View style={styles.bottomTabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => {
                  setActiveTab(tab.name);
                  setActiveCourse(null);
                  setPreviewResourceId(null);
                  setShowNotifications(false);
                  setShowFaculty(false);
                }}
                style={styles.tabButton}
              >
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={22}
                  color={isActive ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  body: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 10 : 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
});

