import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.glowCircle} />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.jpg')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.brandTitle}>YCCify</Text>
        <Text style={styles.tagline}>Everything Your Academics Need.</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.collegeText}>Yeshwantrao Chavan College of Engineering</Text>
        <Text style={styles.campusText}>Nagpur, Maharashtra</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  glowCircle: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#155EEF',
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 28,
    shadowColor: '#20C5F5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20C5F5',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  collegeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  campusText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

