import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff,
  Building2, Target, Hash, Zap, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const GOALS = [
  { value: 'Interview Prep', label: 'Interview Prep' },
  { value: 'Academics',      label: 'Academics'      },
  { value: 'Both',           label: 'Both'           },
];

export default function StudentRegister() {
  const navigate               = useNavigate();
  const { registerStudent, isAuthenticated } = useAuth();
  const [loading, setLoading]  = useState(false);
  const [errors,  setErrors]   = useState({});
  const [showP,   setShowP]    = useState(false);
  const [showCP,  setShowCP]   = useState(false);
  const justRegistered = useRef(false);

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    college:         '',
    targetGoal:      '',
    institutionCode: '',
  });

  useEffect(() => {
    if (isAuthenticated && !justRegistered.current) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);


  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  /* ── Validation ───────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = 'Full name is required';
    if (!form.email.trim())
      e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Enter a valid email';
    if (!form.password)
      e.password = 'Password is required';
    else if (form.password.length < 8)
      e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    if (!form.college.trim())
      e.college = 'College name is required';
    if (!form.targetGoal)
      e.targetGoal = 'Select a goal';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ───────────────────────────────────── */
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerStudent({
        username:        form.email,
        name:            form.name,
        email:           form.email,
        password:        form.password,
        college:         form.college,
        targetGoal:      form.targetGoal,
        institutionCode: form.institutionCode || undefined,
      });
      if (!res.success) {
        toast.error(res.message || 'Registration failed');
        return;
      }
      justRegistered.current = true;
      navigate('/diagnostic');
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ───────────────────────────────────── */
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={`${styles.card} ${styles.cardTall}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Zap size={18} />
          </span>
          DSA Master
        </Link>

        <h1 className={styles.title}>
          Create your account
        </h1>
        <p className={styles.subtitle}>
          Start your 90-day DSA journey today
        </p>

        <form onSubmit={handleSubmit}
              className={styles.form}
              noValidate>

          {/* Full Name */}
          <Field
            label="Full Name"
            icon={<User size={16} />}
            error={errors.name}
          >
            <input
              type="text"
              className={`${styles.input} ${
                errors.name ? styles.inputError : ''
              }`}
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
            />
          </Field>

          {/* Email */}
          <Field
            label="Email Address"
            icon={<Mail size={16} />}
            error={errors.email}
          >
            <input
              type="email"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ''
              }`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </Field>

          {/* Password */}
          <Field
            label="Password"
            icon={<Lock size={16} />}
            error={errors.password}
            extra={
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowP(p => !p)}
                tabIndex={-1}
              >
                {showP
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            }
          >
            <input
              type={showP ? 'text' : 'password'}
              className={`${styles.input} ${
                errors.password ? styles.inputError : ''
              }`}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
            />
          </Field>

          {/* Confirm Password */}
          <Field
            label="Confirm Password"
            icon={<Lock size={16} />}
            error={errors.confirmPassword}
            extra={
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCP(p => !p)}
                tabIndex={-1}
              >
                {showCP
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
              </button>
            }
          >
            <input
              type={showCP ? 'text' : 'password'}
              className={`${styles.input} ${
                errors.confirmPassword
                  ? styles.inputError : ''
              }`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
          </Field>

          {/* College */}
          <Field
            label="College / Institute Name"
            icon={<Building2 size={16} />}
            error={errors.college}
          >
            <input
              type="text"
              className={`${styles.input} ${
                errors.college ? styles.inputError : ''
              }`}
              placeholder="e.g. BITS Pilani"
              value={form.college}
              onChange={set('college')}
            />
          </Field>

          {/* Target Goal */}
          <Field
            label="Target Goal"
            icon={<Target size={16} />}
            error={errors.targetGoal}
          >
            <select
              className={`${styles.input} ${
                styles.select
              } ${
                errors.targetGoal ? styles.inputError : ''
              }`}
              value={form.targetGoal}
              onChange={set('targetGoal')}
            >
              <option value="">Select your goal</option>
              {GOALS.map(g => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Institution Code (optional) */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Institution Code{' '}
              <span className={styles.optional}>
                (Optional)
              </span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Hash size={16} />
              </span>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. BITS2847"
                value={form.institutionCode}
                onChange={set('institutionCode')}
              />
            </div>
            <p className={styles.helperText}>
              Get this code from your institution admin
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading
              ? <span className={styles.spinner} />
              : 'Create Account'}
          </button>
        </form>

        {/* Back to Home link */}
        <div className={styles.backToHome}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className={styles.links}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable field wrapper ─────────────────────── */
function Field({ label, icon, error, extra, children }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <span className={styles.inputIcon}>{icon}</span>
        {children}
        {extra}
      </div>
      {error && (
        <p className={styles.errorMsg}>{error}</p>
      )}
    </div>
  );
}