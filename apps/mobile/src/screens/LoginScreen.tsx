import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import api from '@yccify/api';

export const LoginScreen: React.FC<{ onNavigateRegister: () => void }> = ({
  onNavigateRegister,
}) => {
  const { login } = useAuth();
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = 'yccify://auth/callback';
      const res = await api.auth.signInWithGoogle(redirectUrl);
      if (res.url) {
        await Linking.openURL(res.url);
      }
    } catch (err: any) {
      Alert.alert('Google Sign-In Error', err.message || 'Failed to start Google Sign-In.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleRoleToggle = (selected: 'student' | 'admin') => {
    setRole(selected);
    if (selected === 'admin') {
      setIdentifier('admin@ycce.edu');
    } else {
      setIdentifier('');
    }
  };

  const handleSignIn = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter your college email (@ycce.in) or 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await login(identifier.trim().toLowerCase(), password, role);
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const emailNorm = forgotEmail.trim().toLowerCase();
    const phoneNorm = forgotPhone.replace(/\D/g, '').trim();

    if (!emailNorm.endsWith('@ycce.in') && !emailNorm.endsWith('@ycce.edu')) {
      Alert.alert('Invalid Email', 'Please enter your college email ending with @ycce.in');
      return;
    }
    if (phoneNorm.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please enter your 10-digit registered mobile number.');
      return;
    }
    if (forgotNewPass.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.auth.resetPassword({
        email: emailNorm,
        phone: phoneNorm,
        newPassword: forgotNewPass,
      });
      Alert.alert('Success', res.message || 'Password reset successfully! Please sign in.');
      setIdentifier(emailNorm);
      setPassword(forgotNewPass);
      setShowForgotModal(false);
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Verification failed. Please check your details.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Branding matching Screenshot */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.jpg')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandTitle}>YCCify</Text>
          <Text style={styles.welcomeText}>Welcome Back 👋</Text>
          <Text style={styles.subText}>Sign in to continue to YCCify</Text>
        </View>

        {/* Role Pill Switcher */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            onPress={() => handleRoleToggle('student')}
            style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleToggle('admin')}
            style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
          >
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={role === 'admin' ? 'admin@ycce.edu' : 'Email or 10-digit Mobile'}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setForgotEmail(identifier.includes('@') ? identifier.trim().toLowerCase() : '');
              setForgotPhone(/^\d{10}$/.test(identifier.trim()) ? identifier.trim() : '');
              setForgotNewPass('');
              setShowForgotModal(true);
            }}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            style={[styles.signInButton, theme.shadow.button]}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Google Sign In Option */}
          {role === 'student' && (
            <View>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
                style={styles.googleButton}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                <Text style={styles.googleButtonText}>
                  {googleLoading ? 'Connecting...' : 'Continue with Google (@ycce.in)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sign Up Link */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Enter your registered college email and 10-digit mobile number
            </Text>

            <View style={styles.modalForm}>
              <TextInput
                value={forgotEmail}
                onChangeText={setForgotEmail}
                placeholder="College Email (@ycce.in)"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                style={styles.modalInput}
              />
              <TextInput
                value={forgotPhone}
                onChangeText={(t) => setForgotPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-Digit Mobile Number"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
                style={styles.modalInput}
              />
              <TextInput
                value={forgotNewPass}
                onChangeText={setForgotNewPass}
                placeholder="New Password (min 6 chars)"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                style={styles.modalInput}
              />

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={forgotLoading}
                style={styles.resetSubmitBtn}
              >
                <Text style={styles.resetSubmitText}>
                  {forgotLoading ? 'Verifying...' : 'Set New Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 28,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.navy,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 8,
  },
  subText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  eyeButton: {
    padding: 6,
  },
  forgotContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpPrompt: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  modalForm: {
    gap: 12,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13,
    color: theme.colors.text,
  },
  resetSubmitBtn: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  resetSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

