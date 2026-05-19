import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff,
  Building2, Target, Hash, Zap, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Auth.module.css';

const GOALS = [
  { value: 'Interview Prep', label: 'Interview Prep' },
  { value: 'Academics', label: 'Academics' },
  { value: 'Both', label: 'Both' },
];

const initialLookupState = {
  status: 'idle',
  institutionName: '',
  institutionCode: '',
  departments: [],
  message: '',
};

export default function StudentRegister() {
  const navigate = useNavigate();
  const { registerStudent, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showP, setShowP] = useState(false);
  const [showCP, setShowCP] = useState(false);
  const [lookupState, setLookupState] = useState(initialLookupState);
  const justRegistered = useRef(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetGoal: '',
    institutionCode: '',
    departmentCode: '',
  });

  useEffect(() => {
    if (isAuthenticated && !justRegistered.current) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const normalizedCode = form.institutionCode.trim().toUpperCase();

    if (!normalizedCode) {
      setLookupState(initialLookupState);
      setForm((prev) => (
        prev.departmentCode
          ? { ...prev, departmentCode: '' }
          : prev
      ));
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLookupState((prev) => ({
        ...prev,
        status: 'loading',
        message: 'Checking institution code...',
      }));

      try {
        const { data } = await api.get(`/auth/institution-lookup/${encodeURIComponent(normalizedCode)}`);
        if (cancelled) return;

        const departments = data?.data?.departments || [];
        setLookupState({
          status: 'success',
          institutionName: data?.data?.institutionName || '',
          institutionCode: data?.data?.institutionCode || normalizedCode,
          departments,
          message: departments.length
            ? 'Select the department you want to join.'
            : 'No departments are available for this institution yet.',
        });

        setForm((prev) => {
          const hasExistingSelection = departments.some(
            (department) => department.code === prev.departmentCode
          );

          return {
            ...prev,
            departmentCode: hasExistingSelection
              ? prev.departmentCode
              : departments.length === 1
              ? departments[0].code
              : '',
          };
        });
      } catch (error) {
        if (cancelled) return;

        setLookupState({
          status: 'error',
          institutionName: '',
          institutionCode: normalizedCode,
          departments: [],
          message: error?.response?.data?.message || 'Institution code not found',
        });
        setForm((prev) => ({ ...prev, departmentCode: '' }));
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [form.institutionCode]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'institutionCode' ? { departmentCode: '' } : {}),
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
    if (key === 'institutionCode' && errors.departmentCode) {
      setErrors((prev) => ({ ...prev, departmentCode: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email';

    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 8) nextErrors.password = 'Minimum 8 characters';

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.targetGoal) nextErrors.targetGoal = 'Select a goal';

    const normalizedCode = form.institutionCode.trim();
    if (normalizedCode) {
      if (lookupState.status === 'loading') {
        nextErrors.institutionCode = 'Please wait while we verify the institution code';
      } else if (lookupState.status === 'error') {
        nextErrors.institutionCode = lookupState.message || 'Enter a valid institution code';
      } else if (lookupState.status !== 'success') {
        nextErrors.institutionCode = 'Unable to verify institution code';
      } else if (lookupState.departments.length === 0) {
        nextErrors.institutionCode = 'This institution does not have departments open for self-registration yet';
      } else if (!form.departmentCode) {
        nextErrors.departmentCode = 'Select a department';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        username: form.email,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        targetGoal: form.targetGoal,
      };

      if (form.institutionCode.trim()) {
        payload.institutionCode = form.institutionCode.trim().toUpperCase();
        payload.departmentCode = form.departmentCode;
      }

      const response = await registerStudent(payload);
      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return;
      }

      justRegistered.current = true;
      navigate('/diagnostic');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const showDepartmentField =
    lookupState.status === 'success' && lookupState.departments.length > 0;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={`${styles.card} ${styles.cardTall}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <Zap size={18} />
          </span>
          Zerith
        </Link>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Join with an institution code if you have one, or continue as an independent student.
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Field label="Full Name" icon={<User size={16} />} error={errors.name}>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
            />
          </Field>

          <Field label="Email Address" icon={<Mail size={16} />} error={errors.email}>
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </Field>

          <Field
            label="Password"
            icon={<Lock size={16} />}
            error={errors.password}
            extra={(
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowP((prev) => !prev)}
                tabIndex={-1}
              >
                {showP ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          >
            <input
              type={showP ? 'text' : 'password'}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
            />
          </Field>

          <Field
            label="Confirm Password"
            icon={<Lock size={16} />}
            error={errors.confirmPassword}
            extra={(
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowCP((prev) => !prev)}
                tabIndex={-1}
              >
                {showCP ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          >
            <input
              type={showCP ? 'text' : 'password'}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
          </Field>

          <Field label="Target Goal" icon={<Target size={16} />} error={errors.targetGoal}>
            <select
              className={`${styles.input} ${styles.select} ${errors.targetGoal ? styles.inputError : ''}`}
              value={form.targetGoal}
              onChange={set('targetGoal')}
            >
              <option value="">Select your goal</option>
              {GOALS.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Institution Code"
            icon={<Hash size={16} />}
            error={errors.institutionCode}
          >
            <input
              type="text"
              className={`${styles.input} ${errors.institutionCode ? styles.inputError : ''}`}
              placeholder="Optional, e.g. BITS2847"
              value={form.institutionCode}
              onChange={set('institutionCode')}
            />
          </Field>

          <div className={styles.lookupCard}>
            <div className={styles.lookupHeader}>
              <Building2 size={16} />
              <span>Institution access</span>
            </div>
            <p className={styles.lookupText}>
              {!form.institutionCode.trim()
                ? 'Leave the code blank if you are joining as an independent student.'
                : lookupState.message}
            </p>
            {lookupState.status === 'success' ? (
              <div className={`${styles.lookupStatus} ${styles.lookupStatusSuccess}`}>
                <strong>{lookupState.institutionName}</strong>
                <span>{lookupState.departments.length} department{lookupState.departments.length === 1 ? '' : 's'} available</span>
              </div>
            ) : null}
            {lookupState.status === 'loading' ? (
              <div className={`${styles.lookupStatus} ${styles.lookupStatusLoading}`}>
                <strong>Verifying institution code</strong>
                <span>Fetching department list...</span>
              </div>
            ) : null}
            {lookupState.status === 'error' ? (
              <div className={`${styles.lookupStatus} ${styles.lookupStatusError}`}>
                <strong>Code not available</strong>
                <span>{lookupState.message}</span>
              </div>
            ) : null}
          </div>

          {showDepartmentField ? (
            <Field label="Department" icon={<Building2 size={16} />} error={errors.departmentCode}>
              <select
                className={`${styles.input} ${styles.select} ${errors.departmentCode ? styles.inputError : ''}`}
                value={form.departmentCode}
                onChange={set('departmentCode')}
              >
                <option value="">Select your department</option>
                {lookupState.departments.map((department) => (
                  <option key={department.code} value={department.code}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? <span className={`${styles.spinner} ${styles.spinnerStudent}`} /> : 'Create Account'}
          </button>
        </form>

        <div className={styles.backToHome}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className={styles.links}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.linkStudent}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, error, extra, children }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <span className={styles.inputIcon}>{icon}</span>
        {children}
        {extra}
      </div>
      {error ? <p className={styles.errorMsg}>{error}</p> : null}
    </div>
  );
}
