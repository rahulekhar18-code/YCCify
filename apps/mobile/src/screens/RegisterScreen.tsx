import React, { useState, useEffect } from 'react';
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
import { Branch } from '@yccify/types';

export const RegisterScreen: React.FC<{ onNavigateLogin: () => void }> = ({
  onNavigateLogin,
}) => {
  const { updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prn, setPrn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(7);
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

  // Dual OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [simulatedEmailOtp, setSimulatedEmailOtp] = useState('');
  const [simulatedMobileOtp, setSimulatedMobileOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    api.academic
      .getBranches()
      .then((bList) => {
        setBranches(bList);
        if (bList.length > 0) setSelectedBranchId(bList[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInitiateRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !prn.trim() || !password || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill in all mandatory registration fields.');
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm.endsWith('@ycce.in')) {
      Alert.alert('Invalid College Email', 'Only official student emails ending with @ycce.in are authorized.');
      return;
    }

    const phoneNorm = phone.replace(/\D/g, '').trim();
    if (phoneNorm.length !== 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.initiateRegistration({
        name: name.trim(),
        email: emailNorm,
        phone: phoneNorm,
        prn: prn.trim().toUpperCase(),
        branchId: selectedBranchId,
        semesterNumber: selectedSemester,
        password,
        confirmPassword,
      });

      if (res.simulatedEmailOtp) setSimulatedEmailOtp(res.simulatedEmailOtp);
      if (res.simulatedMobileOtp) setSimulatedMobileOtp(res.simulatedMobileOtp);

      setShowOtpModal(true);
    } catch (err: any) {
      Alert.alert('Registration Blocked', err.message || 'Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDualOtp = async () => {
    if (!emailOtp.trim() || !mobileOtp.trim()) {
      Alert.alert('Verification Required', 'Please enter both Email OTP and Mobile OTP.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.auth.verifyRegistration({
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').trim(),
        prn: prn.trim().toUpperCase(),
        emailOtp: emailOtp.trim(),
        mobileOtp: mobileOtp.trim(),
      });

      updateUser(res.user);
      setShowOtpModal(false);
      Alert.alert('Success', 'Student account verified and activated!');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid or expired OTPs.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.jpg')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandTitle}>YCCify</Text>
          <Text style={styles.welcomeText}>Create Account 🎓</Text>
          <Text style={styles.subText}>Join YCCE's unified academic network</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name *"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
            />
          </View>

          {/* College Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="College Email (@ycce.in only) *"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-Digit Mobile Number *"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
            />
          </View>

          {/* Student PRN / Roll Number */}
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={prn}
              onChangeText={(t) => setPrn(t.toUpperCase())}
              placeholder="Student PRN / Roll Number *"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 chars) *"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password *"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleInitiateRegister}
            disabled={loading}
            style={[styles.signUpButton, theme.shadow.button]}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Sending OTPs...' : 'Proceed to Dual OTP Verification'}
            </Text>
          </TouchableOpacity>

          {/* Google Sign Up Option */}
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

          {/* Back to Sign In Link */}
          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>Already registered? </Text>
            <TouchableOpacity onPress={onNavigateLogin}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Dual OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify Contact Details 📱</Text>
            <Text style={styles.modalSub}>
              Enter the OTPs sent to your @ycce.in college email and mobile number.
            </Text>

            {(simulatedEmailOtp || simulatedMobileOtp) && (
              <View style={styles.demoOtpBox}>
                <Text style={styles.demoOtpTitle}>Active Demo OTPs:</Text>
                <Text style={styles.demoOtpText}>Email OTP: {simulatedEmailOtp}</Text>
                <Text style={styles.demoOtpText}>Mobile OTP: {simulatedMobileOtp}</Text>
              </View>
            )}

            <View style={styles.otpInputGroup}>
              <Text style={styles.otpLabel}>1. College Email OTP</Text>
              <TextInput
                value={emailOtp}
                onChangeText={(t) => setEmailOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit Email OTP"
                keyboardType="numeric"
                maxLength={6}
                style={styles.otpInput}
              />
            </View>

            <View style={styles.otpInputGroup}>
              <Text style={styles.otpLabel}>2. Mobile OTP</Text>
              <TextInput
                value={mobileOtp}
                onChangeText={(t) => setMobileOtp(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit Mobile OTP"
                keyboardType="numeric"
                maxLength={6}
                style={styles.otpInput}
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setShowOtpModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerifyDualOtp}
                disabled={otpLoading || emailOtp.length !== 6 || mobileOtp.length !== 6}
                style={styles.verifyButton}
              >
                <Text style={styles.verifyButtonText}>
                  {otpLoading ? 'Activating...' : 'Verify & Activate'}
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
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.navy,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 6,
  },
  subText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  form: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  signUpButton: {
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signInPrompt: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  demoOtpBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 2,
  },
  demoOtpTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  demoOtpText: {
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  otpInputGroup: {
    gap: 4,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '700',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  verifyButton: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11,
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
});
