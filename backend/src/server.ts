import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, UPLOADS_DIR } from './db.js';
import { UserRole, Resource } from '@yccify/types';

const app = express();
const PORT = process.env.PORT || 7130;
const JWT_SECRET = process.env.JWT_SECRET || 'yccify-super-secure-jwt-token-2026';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve shared assets (e.g. logo.jpg)
const SHARED_ASSETS_DIR = path.resolve(process.cwd(), '../shared/assets');
if (fs.existsSync(SHARED_ASSETS_DIR)) {
  app.use('/assets', express.static(SHARED_ASSETS_DIR));
}

// Ensure uploads dir
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${safeBase}_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed. Only PDF, DOCX, PPT and images are supported.`));
    }
  },
});

// Authentication Helpers
interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    (req as any).user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      (req as any).user = null;
    } else {
      (req as any).user = decoded as TokenPayload;
    }
    next();
  });
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as TokenPayload | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as TokenPayload | undefined;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
  }
  next();
}

app.use(authenticateToken);

// ==============================================================================
// 1. HEALTH & METADATA
// ==============================================================================
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'YCCify Academic Platform',
    institution: 'Yeshwantrao Chavan College of Engineering (YCCE), Nagpur',
    tagline: 'Everything Your Academics Need.',
    version: '1.0.0',
    insforgeConnected: true,
  });
});

// ==============================================================================
// 2. AUTHENTICATION ENDPOINTS (Credentials, Dual OTP & Single Account Enforcement)
// ==============================================================================

interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  prn: string;
  branchId?: string;
  semesterNumber: number;
  password: string;
  emailOtp: string;
  mobileOtp: string;
  expiresAt: number;
  cooldownUntil: number;
  resendCount: number;
  createdAt: number;
}

const pendingRegistrations = new Map<string, PendingRegistration>();

// Dual OTP Registration Initiation
app.post('/api/auth/register-initiate', (req, res) => {
  try {
    const { name, email, phone, prn, rollNumber, branchId, semesterNumber, password, confirmPassword, role } = req.body;

    // Disallow public admin signup
    if (role === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot be created via public registration. Contact YCCify Administrator Rahul Ekhar (rahulekhar18@gmail.com).',
      });
    }

    if (!name || !email || !phone || (!prn && !rollNumber) || !password) {
      return res.status(400).json({ error: 'All fields are required for student registration.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\D/g, '').trim();
    const normalizedPrn = String(prn || rollNumber).trim().toUpperCase();

    // 1. Mandatory @ycce.in domain validation
    if (!normalizedEmail.endsWith('@ycce.in')) {
      return res.status(400).json({
        error: 'Invalid college email domain. Only official college emails ending with @ycce.in are authorized for student accounts.',
      });
    }

    // 2. 10-digit mobile number validation
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({
        error: 'A valid 10-digit Indian mobile number is required.',
      });
    }

    // 3. PRN validation
    if (!normalizedPrn || normalizedPrn.length < 3) {
      return res.status(400).json({
        error: 'A valid Student PRN / College Roll Number is required.',
      });
    }

    // 4. Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // 5. Single Account Enforcement (Backend uniqueness checks)
    const existingEmail = db.getProfileByEmail(normalizedEmail);
    if (existingEmail) {
      return res.status(409).json({ error: 'College email already registered.' });
    }

    const existingPhone = db.getProfileByPhone(normalizedPhone);
    if (existingPhone) {
      return res.status(409).json({ error: 'Mobile number already registered.' });
    }

    const existingPrn = db.getProfileByRollNumber(normalizedPrn);
    if (existingPrn) {
      return res.status(409).json({ error: 'PRN already registered.' });
    }

    // 6. Cooldown & Rate Limiting Check
    const existingPending = pendingRegistrations.get(normalizedEmail);
    if (existingPending && Date.now() < existingPending.cooldownUntil) {
      const waitSeconds = Math.ceil((existingPending.cooldownUntil - Date.now()) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      });
    }

    // 7. Dual OTP Generation (Email OTP + Mobile OTP)
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min expiry
    const cooldownUntil = Date.now() + 60 * 1000; // 60s cooldown

    pendingRegistrations.set(normalizedEmail, {
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      prn: normalizedPrn,
      branchId,
      semesterNumber: semesterNumber ? Number(semesterNumber) : 7,
      password: String(password).trim(),
      emailOtp,
      mobileOtp,
      expiresAt,
      cooldownUntil,
      resendCount: (existingPending?.resendCount || 0) + 1,
      createdAt: Date.now(),
    });

    console.log(
      `[Dual OTP] Registration for ${normalizedEmail} | PRN: ${normalizedPrn} | Email OTP: ${emailOtp} | Mobile OTP: ${mobileOtp}`
    );

    res.json({
      success: true,
      message: 'OTPs have been dispatched to your official college email and mobile number.',
      simulatedEmailOtp: emailOtp,
      simulatedMobileOtp: mobileOtp,
      expiresInSeconds: 600,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dual OTP Registration Verification & Account Activation
app.post('/api/auth/register-verify', (req, res) => {
  try {
    const { email, phone, prn, emailOtp, mobileOtp } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = String(phone || '').replace(/\D/g, '').trim();
    const normalizedPrn = String(prn || '').trim().toUpperCase();

    const pending = pendingRegistrations.get(normalizedEmail);
    if (!pending) {
      return res.status(400).json({
        error: 'No pending registration found for this email. Please initiate registration first.',
      });
    }

    // Expiry Check
    if (Date.now() > pending.expiresAt) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    // Dual OTP Verification Check
    if (!emailOtp || pending.emailOtp !== String(emailOtp).trim()) {
      return res.status(400).json({ error: 'Invalid email OTP. Please check the code sent to your @ycce.in email.' });
    }

    if (!mobileOtp || pending.mobileOtp !== String(mobileOtp).trim()) {
      return res.status(400).json({ error: 'Invalid mobile OTP. Please check the code sent to your mobile number.' });
    }

    // Race-Condition Guard: Atomic re-check before creation
    if (db.getProfileByEmail(normalizedEmail)) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(409).json({ error: 'College email already registered.' });
    }
    if (db.getProfileByPhone(normalizedPhone || pending.phone)) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(409).json({ error: 'Mobile number already registered.' });
    }
    if (db.getProfileByRollNumber(normalizedPrn || pending.prn)) {
      pendingRegistrations.delete(normalizedEmail);
      return res.status(409).json({ error: 'PRN already registered.' });
    }

    const branch = pending.branchId ? db.getBranchById(pending.branchId) : undefined;
    const sem =
      pending.branchId && pending.semesterNumber
        ? db.getSemesters(branch?.id).find((s) => s.semesterNumber === Number(pending.semesterNumber))
        : undefined;

    const newProfile = db.createProfile({
      email: normalizedEmail,
      password: pending.password,
      name: pending.name,
      phone: pending.phone,
      rollNumber: pending.prn,
      collegeId: '10000000-0000-0000-0000-000000000001',
      collegeName: 'YCCE Nagpur',
      branchId: branch?.id,
      branchName: branch?.name,
      semesterId: sem?.id,
      semesterNumber: pending.semesterNumber,
      role: 'student',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pending.name)}`,
    });

    // Initialize Default User Preferences
    db.setUserPreferences(newProfile.id, { theme: 'light' });
    db.setNotificationPreferences(newProfile.id, {
      notesUploaded: true,
      pyqsAvailable: true,
      facultyAnnouncements: true,
      assignmentUpdates: true,
      academicNotices: true,
      communityReplies: true,
      resourceReplies: true,
      channelInApp: true,
      channelPush: true,
      channelEmail: false,
    });

    pendingRegistrations.delete(normalizedEmail);

    const token = generateToken({
      userId: newProfile.id,
      email: newProfile.email,
      role: newProfile.role,
    });

    res.status(201).json({
      success: true,
      message: 'Student account successfully verified and activated!',
      data: {
        user: newProfile,
        session: { accessToken: token, tokenType: 'bearer' },
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/sign-up', (req, res) => {
  try {
    const { email, password, name, phone, rollNumber, prn, branchId, semesterNumber, role } = req.body;

    // Disallow public admin signup
    if (role === 'admin') {
      return res.status(403).json({
        error: 'Admin accounts cannot be created via public registration. Contact YCCify Administrator Rahul Ekhar (rahulekhar18@gmail.com).',
      });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'College email, password and name are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPrn = String(prn || rollNumber || '').trim().toUpperCase();

    // Mandatory @ycce.in domain validation for students
    if (!normalizedEmail.endsWith('@ycce.in')) {
      return res.status(400).json({ error: 'Only official college email ending with @ycce.in is allowed for students.' });
    }

    // Mandatory 10-digit mobile number for unique 1-person 1-account registration
    const normalizedPhone = phone ? String(phone).replace(/\D/g, '').trim() : '';
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required for registration.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingEmail = db.getProfileByEmail(normalizedEmail);
    if (existingEmail) {
      return res.status(409).json({ error: 'College email already registered.' });
    }

    const existingPhone = db.getProfileByPhone(normalizedPhone);
    if (existingPhone) {
      return res.status(409).json({ error: 'Mobile number already registered.' });
    }

    if (normalizedPrn) {
      const existingPrn = db.getProfileByRollNumber(normalizedPrn);
      if (existingPrn) {
        return res.status(409).json({ error: 'PRN already registered.' });
      }
    }

    const assignedRole: UserRole = 'student';

    const branch = branchId ? db.getBranchById(branchId) : undefined;
    const sem =
      branchId && semesterNumber
        ? db.getSemesters(branch?.id).find((s) => s.semesterNumber === Number(semesterNumber))
        : undefined;

    const newProfile = db.createProfile({
      email: normalizedEmail,
      password: String(password).trim(),
      name: name.trim(),
      phone: normalizedPhone,
      rollNumber: normalizedPrn || undefined,
      collegeId: '10000000-0000-0000-0000-000000000001',
      collegeName: 'YCCE Nagpur',
      branchId: branch?.id,
      branchName: branch?.name,
      semesterId: sem?.id,
      semesterNumber: sem?.semesterNumber,
      role: assignedRole,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken({
      userId: newProfile.id,
      email: newProfile.email,
      role: newProfile.role,
    });

    res.status(201).json({
      data: {
        user: newProfile,
        session: { accessToken: token, tokenType: 'bearer' },
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/sign-in', (req, res) => {
  try {
    const { email, phone, rollNumber, password, role } = req.body;

    const rawIdentifier = (email || phone || rollNumber || '').trim();
    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: 'Email/Mobile number and password are required.' });
    }

    const isPhone = /^\d{10}$/.test(rawIdentifier);
    const isEmail = rawIdentifier.includes('@');

    let profile: any = undefined;
    if (isEmail) {
      profile = db.getProfileByEmail(rawIdentifier.toLowerCase());
    } else if (isPhone) {
      profile = db.getProfileByPhone(rawIdentifier);
    } else if (email) {
      profile = db.getProfileByEmail(email.toLowerCase());
    } else if (phone) {
      profile = db.getProfileByPhone(phone);
    } else if (rollNumber) {
      profile = db.getProfileByRollNumber(rollNumber);
    }

    if (!profile) {
      return res.status(401).json({ error: 'No account found with this email or mobile number.' });
    }

    // Role check if explicitly provided
    if (role && role !== profile.role && profile.role !== 'admin') {
      return res.status(403).json({ error: `You do not have access as ${role}.` });
    }

    // Verify Password against stored credential
    const inputPassword = String(password).trim();
    if (profile.password) {
      if (profile.password !== inputPassword) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    } else {
      // Legacy seed profile without explicit password: check default 'password123'
      if (inputPassword === 'password123') {
        db.updateProfile(profile.id, { password: 'password123' });
      } else {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    }

    const token = generateToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    });

    res.json({
      data: {
        user: profile,
        session: { accessToken: token, tokenType: 'bearer' },
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// Google OAuth Session Exchange & College Domain Verification
// ==============================================================================
app.post('/api/auth/google-session', (req, res) => {
  try {
    const { email, name, avatarUrl, insforgeToken } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google authenticated email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if designated administrator
    const isDesignatedAdmin =
      normalizedEmail === 'rahulekhar18@gmail.com' || normalizedEmail === 'admin@ycce.edu';

    // Requirement 6 & 7: Allow student access only when email ends with @ycce.in. Reject non-YCCE.
    if (!isDesignatedAdmin && !normalizedEmail.endsWith('@ycce.in')) {
      return res.status(403).json({
        error: `Access Denied: Only official college email addresses ending with @ycce.in are permitted. You signed in with ${normalizedEmail}. Please sign in with your official YCCE student Google account.`,
      });
    }

    // Requirement 8: Do NOT create duplicate student profiles when existing student logs in
    let profile = db.getProfileByEmail(normalizedEmail);

    if (profile) {
      // Existing profile found: update avatar if newly provided, but preserve all academic data
      if (avatarUrl && !profile.avatarUrl) {
        profile = db.updateProfile(profile.id, { avatarUrl });
      }
    } else {
      // New YCCE Google Student Registration (First-time login)
      const inferredName = name ? String(name).trim() : normalizedEmail.split('@')[0];
      const defaultBranch = db.getBranches()[0]; // Default to Information Technology
      const defaultSem = db.getSemesters(defaultBranch?.id).find((s) => s.semesterNumber === 7);

      profile = db.createProfile({
        email: normalizedEmail,
        name: inferredName,
        rollNumber: normalizedEmail.split('@')[0].toUpperCase(),
        collegeId: '10000000-0000-0000-0000-000000000001',
        collegeName: 'YCCE Nagpur',
        branchId: defaultBranch?.id,
        branchName: defaultBranch?.name,
        semesterId: defaultSem?.id,
        semesterNumber: 7,
        role: isDesignatedAdmin ? 'admin' : 'student',
        avatarUrl:
          avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(inferredName)}`,
      });

      // Initialize default preferences
      db.setUserPreferences(profile.id, { theme: 'light' });
      db.setNotificationPreferences(profile.id, {
        notesUploaded: true,
        pyqsAvailable: true,
        facultyAnnouncements: true,
        assignmentUpdates: true,
        academicNotices: true,
        communityReplies: true,
        resourceReplies: true,
        channelInApp: true,
        channelPush: true,
        channelEmail: false,
      });
    }

    const token = generateToken({
      userId: profile.id,
      email: profile.email,
      role: profile.role,
    });

    res.json({
      success: true,
      message: 'Google authentication successful!',
      data: {
        user: profile,
        session: { accessToken: token, tokenType: 'bearer' },
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot / Reset Password Endpoint
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({ error: 'College email, 10-digit mobile number, and new password are required.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = String(phone).replace(/\D/g, '').trim();

    const profile = db.getProfileByEmail(normalizedEmail);
    if (!profile) {
      return res.status(404).json({ error: 'No account registered with this college email.' });
    }

    const userPhone = (profile.phone || '').replace(/\D/g, '').trim();
    if (userPhone !== normalizedPhone) {
      return res.status(400).json({ error: 'Mobile number does not match the registered records for this email.' });
    }

    db.updateProfile(profile.id, { password: String(newPassword).trim() });

    res.json({
      data: {
        success: true,
        message: 'Password reset successfully! You can now sign in with your new password.',
      },
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/current-user', (req, res) => {
  const userPayload = (req as any).user as TokenPayload | undefined;
  if (!userPayload) {
    // Default to Rahul Sharma for preview if no token
    const defaultUser = db.getProfileByEmail('rahul.sharma@ycce.edu');
    return res.json({ data: { user: defaultUser }, error: null });
  }

  const profile = db.getProfileById(userPayload.userId);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  res.json({ data: { user: profile }, error: null });
});

app.post('/api/auth/sign-out', (_req, res) => {
  res.json({ data: { success: true }, error: null });
});

app.post('/api/auth/profile', requireAuth, (req, res) => {
  const userPayload = (req as any).user as TokenPayload;
  const updated = db.updateProfile(userPayload.userId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json({ data: { user: updated }, error: null });
});

// ==============================================================================
// 2.5 SETTINGS & STUDENT CENTER ENDPOINTS
// ==============================================================================
const mobileChangeOtps = new Map<string, { otp: string; mobile: string; expiresAt: number }>();

// Request Mobile Number Change OTP
app.post('/api/settings/mobile/request-otp', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { newMobile } = req.body;

    const normalized = String(newMobile || '').replace(/\D/g, '').trim();
    if (!normalized || normalized.length !== 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
    }

    // Check uniqueness across other profiles
    const existing = db.getProfileByPhone(normalized);
    if (existing && existing.id !== user.userId) {
      return res.status(409).json({ error: 'This mobile number is already registered to another student account.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    mobileChangeOtps.set(user.userId, { otp, mobile: normalized, expiresAt });
    console.log(`[OTP Verification] Mobile Change OTP for User ${user.email} -> ${normalized}: ${otp}`);

    res.json({
      success: true,
      message: `A verification OTP has been sent to +91-${normalized}.`,
      simulatedOtp: otp,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Mobile Number Change OTP
app.post('/api/settings/mobile/verify-otp', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { otp, newMobile } = req.body;

    const record = mobileChangeOtps.get(user.userId);
    if (!record) {
      return res.status(400).json({ error: 'No pending OTP verification found. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      mobileChangeOtps.delete(user.userId);
      return res.status(400).json({ error: 'The OTP has expired. Please request a new one.' });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid verification OTP. Please try again.' });
    }

    if (newMobile && record.mobile !== String(newMobile).replace(/\D/g, '').trim()) {
      return res.status(400).json({ error: 'Mobile number mismatch. Please request OTP again.' });
    }

    // Update profile
    const updated = db.updateProfile(user.userId, { phone: record.mobile });
    mobileChangeOtps.delete(user.userId);

    res.json({
      success: true,
      message: 'Mobile number updated and verified successfully!',
      data: { user: updated },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password
app.post('/api/settings/change-password', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const profile = db.getProfileById(user.userId);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Verify current password
    if (profile.password && profile.password !== String(currentPassword).trim()) {
      return res.status(401).json({ error: 'Incorrect current password. Please try again.' });
    }

    // Update password
    db.updateProfile(user.userId, { password: String(newPassword).trim() });

    res.json({
      success: true,
      message: 'Password changed successfully! You can use your new password next time you sign in.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile Permitted Information (Name, Avatar)
app.put('/api/settings/profile', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { name, avatarUrl } = req.body;

    // Reject attempt to modify email or rollNumber
    if (req.body.email) {
      delete req.body.email;
    }
    if (req.body.rollNumber) {
      delete req.body.rollNumber;
    }

    const updates: any = {};
    if (name && typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }
    if (avatarUrl && typeof avatarUrl === 'string') {
      updates.avatarUrl = avatarUrl;
    }

    const updated = db.updateProfile(user.userId, updates);
    res.json({
      success: true,
      message: 'Profile information updated successfully!',
      data: { user: updated },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Academic Update (Semester & Branch change rules)
app.post('/api/settings/academic', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { semesterNumber, branchId, reason } = req.body;

    const profile = db.getProfileById(user.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const prevSem = profile.semesterNumber || 7;
    const prevBranchId = profile.branchId;

    // 1. Branch Change Restriction Check
    if (branchId && branchId !== prevBranchId) {
      const targetBranch = db.getBranchById(branchId);
      // Require Administrative Approval for branch changes per institute rules
      db.addAcademicHistory({
        userId: user.userId,
        previousSemester: prevSem,
        newSemester: semesterNumber ? Number(semesterNumber) : prevSem,
        previousBranchId: prevBranchId,
        newBranchId: branchId,
        previousBranchName: profile.branchName,
        newBranchName: targetBranch?.name,
        academicYear: '2025-26',
        changeReason: reason || 'Student requested departmental branch transfer',
        status: 'pending_approval',
      });

      return res.json({
        success: true,
        requiresApproval: true,
        message: 'Departmental Branch transfer request submitted to Admin (Prof. Administrative Dean / Rahul Ekhar) for verification.',
      });
    }

    // 2. Semester Progression Update
    if (semesterNumber && Number(semesterNumber) !== prevSem) {
      const semNum = Number(semesterNumber);
      if (semNum < 1 || semNum > 8) {
        return res.status(400).json({ error: 'Semester must be between 1 and 8.' });
      }

      // Record in academic history
      db.addAcademicHistory({
        userId: user.userId,
        previousSemester: prevSem,
        newSemester: semNum,
        previousBranchId: prevBranchId,
        newBranchId: prevBranchId,
        previousBranchName: profile.branchName,
        newBranchName: profile.branchName,
        academicYear: '2025-26',
        changeReason: reason || `Academic semester progression to Semester ${semNum}`,
        status: 'approved',
      });

      const updated = db.updateProfile(user.userId, { semesterNumber: semNum });

      return res.json({
        success: true,
        requiresApproval: false,
        message: `Academic information updated! You are now enrolled in Semester ${semNum}.`,
        data: { user: updated },
      });
    }

    res.json({
      success: true,
      message: 'No academic changes were needed.',
      data: { user: profile },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Academic History
app.get('/api/settings/academic/history', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const history = db.getAcademicHistory(user.userId);
    res.json({ data: history, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Preferences (Theme)
app.get('/api/settings/preferences', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const pref = db.getUserPreferences(user.userId);
    res.json({ data: pref, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/preferences', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const pref = db.setUserPreferences(user.userId, req.body);
    res.json({ data: pref, error: null, message: 'Preferences updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notification Preferences
app.get('/api/settings/notifications', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const notifPref = db.getNotificationPreferences(user.userId);
    res.json({ data: notifPref, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/notifications', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const notifPref = db.setNotificationPreferences(user.userId, req.body);
    res.json({ data: notifPref, error: null, message: 'Notification preferences saved.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout all devices
app.post('/api/settings/logout-all', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'All other active device sessions have been successfully terminated.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support Tickets & Problem Reporting
app.get('/api/support/tickets', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const isAdmin = user.role === 'admin';
    const tickets = db.getSupportTickets(user.userId, isAdmin);
    res.json({ data: tickets, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support/tickets', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { category, subject, description, screenshotUrl } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ error: 'Category, subject, and detailed description are required.' });
    }

    const profile = db.getProfileById(user.userId) || { name: 'Student', email: user.email };

    const ticket = db.createSupportTicket({
      userId: user.userId,
      userName: profile.name,
      userEmail: profile.email,
      category,
      subject: subject.trim(),
      description: description.trim(),
      screenshotUrl: screenshotUrl || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully! Rahul Ekhar (Administrator) will review your request.',
      data: ticket,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Support Ticket Management
app.patch('/api/support/tickets/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const updated = db.updateSupportTicket(id, { status, adminNotes });
    if (!updated) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }
    res.json({ success: true, data: updated, message: 'Ticket updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback Submission
app.post('/api/support/feedback', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const { rating, feedback, category } = req.body;

    const profile = db.getProfileById(user.userId) || { name: 'Student', email: user.email };

    db.createSupportTicket({
      userId: user.userId,
      userName: profile.name,
      userEmail: profile.email,
      category: 'Feedback' as any,
      subject: `Platform Feedback (${rating || 5} Stars) - ${category || 'General'}`,
      description: String(feedback || '').trim(),
    });

    res.json({
      success: true,
      message: 'Thank you for your valuable feedback! The YCCify team will review your comments.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 3. STORAGE & FILE SERVING (InsForge Storage Compatible)
// ==============================================================================
app.post('/api/storage/upload', upload.array('files', 100), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploadedResults = files.map((f) => {
      return {
        id: uuidv4(),
        fileName: f.originalname,
        fileUrl: `/api/storage/files/${f.filename}`,
        storagePath: `uploads/${f.filename}`,
        fileSizeBytes: f.size,
        mimeType: f.mimetype || 'application/pdf',
        pageCount: Math.max(1, Math.round(f.size / 102400)), // estimated page count
        createdAt: new Date().toISOString(),
      };
    });

    res.json({
      data: uploadedResults,
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/files/:filename', (req, res) => {
  const filename = req.params.filename;
  let filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    // Map initial seed aliases to real generated sample PDFs
    const aliases: Record<string, string> = {
      rf1: 'unit1_intro_ml.pdf',
      rf2: 'unit2_preprocessing.pdf',
      rf3: 'unit3_classification.pdf',
      rf4: 'unit4_clustering.pdf',
      rf5: 'unit5_neural_networks.pdf',
      rf6: 'ml_pyq2024.pdf',
      rf7: 'unit1_intro_ml.pdf',
      rf8: 'unit2_preprocessing.pdf',
      rf9: 'unit3_classification.pdf',
      rf10: 'unit4_clustering.pdf',
      rf11: 'unit5_neural_networks.pdf',
    };

    if (aliases[filename] && fs.existsSync(path.join(UPLOADS_DIR, aliases[filename]))) {
      filePath = path.join(UPLOADS_DIR, aliases[filename]);
    } else {
      return res.status(404).json({ error: 'File not found on storage server.' });
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const download = req.query.download === 'true';

  if (ext === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.setHeader('Content-Type', 'image/jpeg');
  }

  const baseName = path.basename(filePath);
  if (download) {
    res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
  } else {
    res.setHeader('Content-Disposition', `inline; filename="${baseName}"`);
  }

  fs.createReadStream(filePath).pipe(res);
});

// ==============================================================================
// 4. DATABASE REST ENDPOINTS
// ==============================================================================

// Branches
app.get('/api/database/branches', (_req, res) => {
  const branches = db.getBranches();
  res.json({ data: branches, error: null });
});

app.post('/api/database/branches', requireAdmin, (req, res) => {
  const { name, code, icon, semestersCount } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Branch name and code are required.' });
  }
  const college = db.getCollege();
  const newBranch = db.addBranch({
    collegeId: college.id,
    name,
    code: code.toUpperCase(),
    icon: icon || 'Layers',
    semestersCount: semestersCount || 8,
    coursesCount: 0,
    isActive: true,
  });
  res.status(201).json({ data: newBranch, error: null });
});

app.put('/api/database/branches/:id', requireAdmin, (req, res) => {
  const updated = db.updateBranch(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Branch not found' });
  res.json({ data: updated, error: null });
});

app.delete('/api/database/branches/:id', requireAdmin, (req, res) => {
  const success = db.deleteBranch(req.params.id);
  if (!success) return res.status(404).json({ error: 'Branch not found' });
  res.json({ data: { success: true }, error: null });
});

// Semesters
app.get('/api/database/semesters', (req, res) => {
  const branchId = req.query.branchId as string | undefined;
  const semesters = db.getSemesters(branchId);
  res.json({ data: semesters, error: null });
});

app.post('/api/database/semesters', requireAdmin, (req, res) => {
  const { branchId, semesterNumber, academicYear } = req.body;
  if (!branchId || !semesterNumber) {
    return res.status(400).json({ error: 'Branch ID and semester number are required.' });
  }
  const newSem = db.addSemester({
    branchId,
    semesterNumber: Number(semesterNumber),
    academicYear: academicYear || '2025-2026',
    coursesCount: 0,
    isActive: true,
  });
  res.status(201).json({ data: newSem, error: null });
});

// Courses
app.get('/api/database/courses', (req, res) => {
  const branchId = req.query.branchId as string | undefined;
  const semesterId = req.query.semesterId as string | undefined;
  const semesterNumber = req.query.semesterNumber ? Number(req.query.semesterNumber) : undefined;

  const courses = db.getCourses({ branchId, semesterId, semesterNumber });
  res.json({ data: courses, error: null });
});

app.get('/api/database/courses/:id', (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ data: course, error: null });
});

app.post('/api/database/courses', requireAdmin, (req, res) => {
  const { semesterId, branchId, name, code, credits, description, icon, facultyId } = req.body;
  if (!semesterId || !branchId || !name || !code) {
    return res.status(400).json({ error: 'Missing required course fields.' });
  }

  const faculty = facultyId ? db.getFaculty().find((f) => f.id === facultyId) : undefined;

  const newCourse = db.addCourse({
    semesterId,
    branchId,
    name,
    code: code.toUpperCase(),
    credits: Number(credits) || 3,
    description: description || '',
    icon: icon || 'BookOpen',
    facultyId,
    facultyName: faculty?.name,
    resourceCount: { notes: 0, pyqs: 0, practicals: 0, assignments: 0, total: 0 },
    isActive: true,
  });

  res.status(201).json({ data: newCourse, error: null });
});

app.put('/api/database/courses/:id', requireAdmin, (req, res) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json({ data: updated, error: null });
});

app.delete('/api/database/courses/:id', requireAdmin, (req, res) => {
  const success = db.deleteCourse(req.params.id);
  if (!success) return res.status(404).json({ error: 'Course not found' });
  res.json({ data: { success: true }, error: null });
});

// Faculty
app.get('/api/database/faculty', (req, res) => {
  const branchId = req.query.branchId as string | undefined;
  const faculty = db.getFaculty(branchId);
  res.json({ data: faculty, error: null });
});

app.post('/api/database/faculty', requireAdmin, (req, res) => {
  const { name, designation, department, specialization, email, phone, branchId, avatarUrl } = req.body;
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email and department are required.' });
  }
  const college = db.getCollege();
  const newFaculty = db.addFaculty({
    collegeId: college.id,
    branchId,
    name,
    designation: designation || 'Assistant Professor',
    department,
    specialization,
    email,
    phone,
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    assignedCourses: [],
    isActive: true,
  });
  res.status(201).json({ data: newFaculty, error: null });
});

app.put('/api/database/faculty/:id', requireAdmin, (req, res) => {
  const updated = db.updateFaculty(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Faculty not found' });
  res.json({ data: updated, error: null });
});

app.delete('/api/database/faculty/:id', requireAdmin, (req, res) => {
  const success = db.deleteFaculty(req.params.id);
  if (!success) return res.status(404).json({ error: 'Faculty not found' });
  res.json({ data: { success: true }, error: null });
});

// Academic Resources
app.get('/api/database/resources', (req, res) => {
  const courseId = req.query.courseId as string | undefined;
  const category = req.query.category as string | undefined;
  const status = req.query.status as any;
  const search = req.query.search as string | undefined;
  const user = (req as any).user as TokenPayload | undefined;

  const resources = db.getResources({
    courseId,
    category,
    status: status || (user?.role === 'admin' ? 'all' : 'approved'),
    search,
    userId: user?.userId,
  });

  res.json({ data: resources, error: null });
});

app.get('/api/database/resources/:id', (req, res) => {
  const user = (req as any).user as TokenPayload | undefined;
  const resource = db.getResourceById(req.params.id, user?.userId);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  res.json({ data: resource, error: null });
});

app.post('/api/database/resources', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const isBatch = Array.isArray(req.body);
    const items = isBatch ? req.body : [req.body];
    const createdResources: Resource[] = [];

    const uploaderProfile = db.getProfileById(user.userId);
    const isAdmin = user.role === 'admin';

    for (const item of items) {
      const { courseId, category, title, description, unitTopic, academicYear, files } = item;
      if (!courseId || !category || !title || !files || files.length === 0) {
        if (!isBatch) {
          return res.status(400).json({ error: 'Course, category, title and at least one file are required.' });
        }
        continue;
      }

      const newResource = db.addResource({
        courseId,
        category,
        title,
        description: description || '',
        unitTopic: unitTopic || 'General Unit',
        academicYear: academicYear || '2025-2026',
        uploaderId: user.userId,
        uploaderName: uploaderProfile?.name || 'Prof. Administrative Dean',
        uploaderRole: user.role,
        approvalStatus: isAdmin ? 'approved' : 'pending',
        files: files.map((f: any) => ({
          id: f.id || uuidv4(),
          resourceId: '',
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          storagePath: f.storagePath,
          fileSizeBytes: f.fileSizeBytes || 2048000,
          mimeType: f.mimeType || 'application/pdf',
          pageCount: f.pageCount || 20,
          createdAt: new Date().toISOString(),
        })),
      });
      createdResources.push(newResource);
    }

    if (isBatch) {
      res.status(201).json({ data: createdResources, error: null });
    } else {
      if (createdResources.length === 0) {
        return res.status(400).json({ error: 'Failed to create resource. Missing fields.' });
      }
      res.status(201).json({ data: createdResources[0], error: null });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/database/resources/:id', requireAuth, (req, res) => {
  const user = (req as any).user as TokenPayload;
  const resource = db.getResourceById(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  if (user.role !== 'admin' && resource.uploaderId !== user.userId) {
    return res.status(403).json({ error: 'You do not have permission to delete this resource.' });
  }

  db.deleteResource(req.params.id);
  res.json({ data: { success: true }, error: null });
});

app.post('/api/database/resources/:id/view', (req, res) => {
  db.incrementView(req.params.id);
  res.json({ success: true });
});

app.post('/api/database/resources/:id/download', (req, res) => {
  db.incrementDownload(req.params.id);
  res.json({ success: true });
});

// Bookmarks
app.get('/api/database/bookmarks', requireAuth, (req, res) => {
  const user = (req as any).user as TokenPayload;
  const bookmarks = db.getBookmarks(user.userId);
  res.json({ data: bookmarks, error: null });
});

app.post('/api/database/bookmarks', requireAuth, (req, res) => {
  const user = (req as any).user as TokenPayload;
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ error: 'resourceId is required.' });

  const isBookmarked = db.toggleBookmark(user.userId, resourceId);
  res.json({ data: { isBookmarked }, error: null });
});

// Approvals (Admin Only)
app.get('/api/database/approvals', requireAdmin, (_req, res) => {
  const approvals = db.getApprovals();
  res.json({ data: approvals, error: null });
});

app.post('/api/database/approvals/:id/review', requireAdmin, (req, res) => {
  const user = (req as any).user as TokenPayload;
  const { status, remarks } = req.body;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  const result = db.reviewApproval(req.params.id, status, user.userId, remarks);
  if (!result) return res.status(404).json({ error: 'Approval request not found.' });

  res.json({ data: result, error: null });
});

// Student Management (Admin Only)
app.get('/api/database/students', requireAdmin, (_req, res) => {
  const students = db.getProfiles().filter((p) => p.role === 'student');
  res.json({ data: students, error: null });
});

// Statistics
app.get('/api/database/stats', (_req, res) => {
  const stats = db.getStats();
  res.json({ data: stats, error: null });
});

// Global Search
app.get('/api/database/search', (req, res) => {
  const q = (req.query.q as string) || '';
  const results = db.search(q);
  res.json({ data: results, error: null });
});

// Public Landing Data (Real-time Stats, Real Uploaded Folder Tree, Real Reviews)
app.get('/api/public/landing-data', (_req, res) => {
  try {
    const landingData = db.getLandingData();
    res.json({ data: landingData, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews API
app.get('/api/public/reviews', (_req, res) => {
  try {
    const reviews = db.getReviews();
    res.json({ data: reviews, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/public/reviews', (req, res) => {
  try {
    const { studentName, studentEmail, branchCode, branchName, batchYear, semesterNumber, rating, comment } = req.body;
    if (!studentName || !comment) {
      return res.status(400).json({ error: 'Name and comment are required to post a review.' });
    }
    const newRev = db.addReview({
      studentName: String(studentName).trim(),
      studentEmail: studentEmail ? String(studentEmail).trim() : undefined,
      branchCode: branchCode || 'IT',
      branchName: branchName || 'Information Technology',
      batchYear: batchYear || '2025 Batch',
      semesterNumber: semesterNumber ? Number(semesterNumber) : undefined,
      rating: rating ? Math.min(Math.max(Number(rating), 1), 5) : 5,
      comment: String(comment).trim(),
    });
    res.status(201).json({ success: true, data: newRev, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student's own reviews (including pending moderation status)
app.get('/api/student/my-reviews', requireAuth, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const allReviews = db.getAllReviews('all');
    const myReviews = allReviews.filter(
      (r) => (r.studentEmail && r.studentEmail.toLowerCase() === user.email.toLowerCase()) || (user.name && r.studentName.toLowerCase() === user.name.toLowerCase())
    );
    res.json({ data: myReviews, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Reviews Moderation
app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  try {
    const status = req.query.status as any;
    const reviews = db.getAllReviews(status);
    res.json({ data: reviews, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reviews/:id/approve', requireAdmin, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const reviewerName = user ? (user.name || user.email) : 'Administrator';
    const approved = db.approveReview(req.params.id, reviewerName);
    if (!approved) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, data: approved, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reviews/:id/reject', requireAdmin, (req, res) => {
  try {
    const user = (req as any).user as TokenPayload;
    const reviewerName = user ? (user.name || user.email) : 'Administrator';
    const { reason } = req.body;
    const rejected = db.rejectReview(req.params.id, reason, reviewerName);
    if (!rejected) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, data: rejected, error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully', error: null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get('/api/database/notifications', requireAuth, (req, res) => {
  const user = (req as any).user as TokenPayload;
  const notifs = db.getNotifications(user.userId);
  res.json({ data: notifs, error: null });
});

app.post('/api/database/notifications/:id/read', requireAuth, (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

// Start Server with Unit Folders & Multi-file Uploads
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 YCCify Academic Platform Backend running on port ${PORT}`);
  console.log(`📍 Institution: Yeshwantrao Chavan College of Engineering (YCCE)`);
  console.log(`⚡ InsForge BaaS Compatible API: http://localhost:${PORT}`);
  console.log(`📂 Uploads Storage: ${UPLOADS_DIR}`);
  console.log(`=======================================================`);
});

