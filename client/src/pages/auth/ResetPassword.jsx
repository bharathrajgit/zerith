import { useState, useMemo } from 'react';
import { useNavigate }       from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertTriangle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

/* ── Password strength helper ─────────────────── */
function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (pwd.length >= 12)             score++;
  if (/[A-Z]/.test(pwd))            score++;
  if (/[0-9]/.test(pwd))            score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;
  if (score <= 1) return { level: 'Weak',   color: '#ef4444', pct: 33  };
  if (score <= 3) return { level: 'Medium', color: '#f59e0b', pct: 66  };
  return          { level: 'Strong', color: '#22c55e', pct: 100 };
}

export default function ResetPasswordPage() {
  const navigate             = useNavigate();
  const { resetFirstPassword } = useAuth();
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [form, setForm] = useState({
    currentPassword:  '',
    newPassword:      '',
    confirmNewPassword: '',
  });

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const strength = useMemo(
    () => getStrength(form.newPassword),
    [form.newPassword]
  );

  /* ── Validation ───────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.currentPassword)
      e.currentPassword = 'Enter your temporary password';
    if (!form.newPassword)
      e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8)
      e.newPassword = 'Minimum 8 characters';
    else if (form.newPassword === form.currentPassword)
      e.newPassword =
        'New password must differ from current';
    if (!form.confirmNewPassword)
      e.confirmNewPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmNewPassword)
      e.confirmNewPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ───────────────────────────────────── */
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await resetFirstPassword({
        currentPassword:    form.currentPassword,
        newPassword:        form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      toast.success('Password updated! Let\'s start.');
      navigate(result.nextPath || '/diagnostic', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
                  || 'Password reset failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('current') ||
          msg.toLowerCase().includes('incorrect')) {
        setErrors(p => ({
          ...p,
          currentPassword: 'Incorrect temporary password',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>
            <Zap size={18} />
          </span>
          DSA Master
        </div>

        {/* Warning banner */}
        <div className={styles.warningBanner}>
          <AlertTriangle
            size={16}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <span>
            Your account was created by your institution.
            Please set a new password to continue.
          </span>
        </div>

        <h1 className={styles.title}>Set New Password</h1>
        <p className={styles.subtitle}>
          Choose a strong password to secure your account
        </p>

        <form onSubmit={handleSubmit}
              className={styles.form}
              noValidate>

          {/* Current password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Current (Temporary) Password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={16} />
              </span>
              <input
                type={showCur ? 'text' : 'password'}
                className={`${styles.input} ${
                  errors.currentPassword
                    ? styles.inputError : ''
                }`}
                placeholder="Enter temporary password"
                value={form.currentPassword}
                onChange={set('currentPassword')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCur(p => !p)}
                tabIndex={-1}
              >
                {showCur
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className={styles.errorMsg}>
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              New Password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={16} />
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                className={`${styles.input} ${
                  errors.newPassword
                    ? styles.inputError : ''
                }`}
                placeholder="Min 8 characters"
                value={form.newPassword}
                onChange={set('newPassword')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNew(p => !p)}
                tabIndex={-1}
              >
                {showNew
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {form.newPassword.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width:           `${strength.pct}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span
                  className={styles.strengthLabel}
                  style={{ color: strength.color }}
                >
                  {strength.level}
                </span>
              </div>
            )}

            {errors.newPassword && (
              <p className={styles.errorMsg}>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Confirm New Password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={16} />
              </span>
              <input
                type={showConf ? 'text' : 'password'}
                className={`${styles.input} ${
                  errors.confirmNewPassword
                    ? styles.inputError : ''
                }`}
                placeholder="Repeat new password"
                value={form.confirmNewPassword}
                onChange={set('confirmNewPassword')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConf(p => !p)}
                tabIndex={-1}
              >
                {showConf
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className={styles.errorMsg}>
                {errors.confirmNewPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading
              ? <span className={styles.spinner} />
              : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
