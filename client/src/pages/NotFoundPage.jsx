import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top, #17172a 0%, #0a0a12 55%, #050509 100%)',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '680px',
    borderRadius: '28px',
    padding: '3rem',
    background: 'rgba(15, 15, 27, 0.96)',
    border: '1px solid rgba(99, 102, 241, 0.18)',
    boxShadow: '0 28px 80px rgba(0, 0, 0, 0.42)',
    color: '#f8fafc',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.7rem 1rem',
    borderRadius: '999px',
    background: 'rgba(99, 102, 241, 0.12)',
    color: '#c7d2fe',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  code: {
    margin: '1.4rem 0 0.4rem',
    fontSize: '4.4rem',
    lineHeight: 1,
    fontWeight: 800,
  },
  title: {
    margin: '0.4rem 0 1rem',
    fontSize: '2rem',
    fontWeight: 800,
  },
  text: {
    margin: '0 auto',
    maxWidth: '480px',
    color: '#94a3b8',
    fontSize: '1.05rem',
    lineHeight: 1.7,
  },
  actions: {
    marginTop: '2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.9rem',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    border: 'none',
    borderRadius: '16px',
    padding: '0.95rem 1.4rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    borderRadius: '16px',
    padding: '0.95rem 1.4rem',
    background: 'rgba(15, 23, 42, 0.72)',
    color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.24)',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  const homeTarget = isAuthenticated
    ? (userType === 'institution' ? '/institution/dashboard' : '/dashboard')
    : '/';

  return (
    <div style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>
          <Compass size={16} />
          <span>Page Missing</span>
        </div>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>That page could not be found</h2>
        <p style={styles.text}>
          The link may be outdated, the route may have changed, or the page may not exist yet.
          You can go back, return home, or head straight to your dashboard.
        </p>

        <div style={styles.actions}>
          <button type="button" style={styles.primaryButton} onClick={() => navigate(homeTarget)}>
            <Home size={18} />
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Go Home'}</span>
          </button>
          <button type="button" style={styles.secondaryButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </section>
    </div>
  );
}
