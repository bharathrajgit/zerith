// client/src/pages/student/ProfilePage.jsx
import { useState } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Lock, Bell, Calendar, Building2, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, updateUser, isLoading: authLoading } = useAuth();

  // Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    targetGoal: user?.targetGoal || 'Interview Prep',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [notificationPrefs, setNotificationPrefs] = useState({
    streakReminder: true,
    assessmentReady: true,
    weeklyReport: false,
  });

  // Calculate password strength (0-4)
  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handlePasswordChange = (e) => {
    const newPwd = e.target.value;
    setForm({ ...form, newPassword: newPwd });
    setPasswordStrength(calculateStrength(newPwd));
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Simulate API call or use actual endpoint if available
      updateUser({ name: form.name, college: form.college, targetGoal: form.targetGoal });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChangeSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (form.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/reset-first-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmPassword,
      });
      toast.success('Password updated successfully');
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setPasswordStrength(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  // Show loading skeleton while auth context is loading
  if (authLoading) {
    return (
      <StudentLayout>
        <div className={styles.page}>
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonLine} style={{ width: '40%' }} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} style={{ width: '70%' }} />
                  <div className={styles.skeletonBtn} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className={styles.page}>
        <h1 className={styles.title}>👤 Profile Settings</h1>

        <div className={styles.grid}>
          {/* Profile Info */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}><User size={18} /> Profile Information</h2>
            <div className={styles.field}>
              <label>Username</label>
              <input disabled value={user?.username || ''} className={styles.input} />
              <p className={styles.helper}>Username cannot be changed</p>
            </div>
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>College / Institute</label>
              <input
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g., BITS Pilani"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>Target Goal</label>
              <select
                value={form.targetGoal}
                onChange={(e) => setForm({ ...form, targetGoal: e.target.value })}
                className={styles.select}
              >
                <option value="Interview Prep">Interview Prep</option>
                <option value="Academics">Academics</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <button
              className={styles.saveBtn}
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <span className={styles.btnLoading}>
                  <span className={styles.spinner} />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </section>

          {/* Change Password */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}><Lock size={18} /> Change Password</h2>
            <p className={styles.helper} style={{ marginBottom: '1rem' }}>
              Update your password here from settings whenever you need. This is the student password reset option.
            </p>
            <div className={styles.field}>
              <label>Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimum 8 characters"
                className={styles.input}
              />
              {/* Password strength meter */}
              {form.newPassword.length > 0 && (
                <div className={styles.strengthMeter}>
                  <div className={styles.strengthBar}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`${styles.strengthSegment} ${
                          passwordStrength >= level ? styles.active : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className={styles.strengthText}>
                    {passwordStrength === 0 && 'Too weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Fair'}
                    {passwordStrength === 3 && 'Good'}
                    {passwordStrength === 4 && 'Strong'}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className={styles.input}
              />
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className={styles.errorMsg}>
                  <AlertCircle size={12} /> Passwords do not match
                </p>
              )}
            </div>
            <button
              className={styles.saveBtn}
              onClick={handlePasswordChangeSubmit}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <span className={styles.btnLoading}>
                  <span className={styles.spinner} />
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </section>

          {/* Notifications */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}><Bell size={18} /> Notification Preferences</h2>
            {Object.entries(notificationPrefs).map(([key, value]) => (
              <div key={key} className={styles.toggleRow}>
                <span className={styles.toggleLabel}>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (s) => s.toUpperCase())}
                </span>
                <button
                  className={`${styles.toggle} ${value ? styles.toggleOn : styles.toggleOff}`}
                  onClick={() =>
                    setNotificationPrefs({ ...notificationPrefs, [key]: !value })
                  }
                  aria-label={`Toggle ${key}`}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </section>

          {/* Account Info */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}><Calendar size={18} /> Account Overview</h2>
            <div className={styles.infoRow}>
              <span>Member Since</span>
              <span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span>Current Level</span>
              <span
                className={`${styles.levelBadge} ${
                  user?.currentLevel === 'Placement-Ready'
                    ? styles.levelGreen
                    : user?.currentLevel === 'Intermediate'
                    ? styles.levelAmber
                    : styles.levelRed
                }`}
              >
                {user?.currentLevel || 'Beginner'}
              </span>
            </div>
            {user?.institutionId && (
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}>
                  <Building2 size={14} />
                </span>
                <span>Verified Institution Account</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </StudentLayout>
  );
}
