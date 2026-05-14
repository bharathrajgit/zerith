// client/src/components/layout/InstitutionLayout.jsx
import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, BarChart3, Shield,
  FileText, Settings, LogOut, Menu, X, Copy, Check
} from 'lucide-react';
import styles from './InstitutionLayout.module.css';

const navItems = [
  { to: '/institution/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/institution/students', icon: Users, label: 'Students' },
  { to: '/institution/departments', icon: Building2, label: 'Departments' },
  { to: '/institution/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/institution/malpractice', icon: Shield, label: 'Malpractice' },
  { to: '/institution/reports', icon: FileText, label: 'Reports' },
  { to: '#', icon: Settings, label: 'Settings', tooltip: 'Coming soon' },
];

function getInitial(name) {
  return (name || 'I').charAt(0).toUpperCase();
}

export default function InstitutionLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/institution/login');
  }, [logout, navigate]);

  const handleCopyCode = useCallback(() => {
    if (user?.institutionCode) {
      navigator.clipboard.writeText(user.institutionCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // fallback if clipboard API fails
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [user]);

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  return (
    <div className={styles.layout}>
      {/* Mobile overlay with fade */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo/Institution Info */}
        <div className={styles.logoSection}>
          <div className={styles.institutionBadge}>
            <span className={styles.institutionInitial}>{getInitial(user?.name)}</span>
          </div>
          <div className={styles.institutionInfo}>
            <p className={styles.institutionName}>{user?.name || 'Institution'}</p>
            <span className={`${styles.planBadge} ${
              user?.plan === 'enterprise' ? styles.planEnterprise :
              user?.plan === 'pro' ? styles.planPro :
              user?.plan === 'basic' ? styles.planBasic : styles.planFree
            }`}>
              {user?.plan || 'Free'}
            </span>
          </div>
        </div>

        {/* Institution Code */}
        {user?.institutionCode && (
          <div className={styles.codeSection}>
            <span className={styles.codeLabel}>Institution Code</span>
            <div className={styles.codeRow}>
              <span className={styles.codeText}>{user.institutionCode}</span>
              <button
                className={styles.copyBtn}
                onClick={handleCopyCode}
                aria-label="Copy institution code"
              >
                {copied ? <Check size={14} className={styles.copySuccess} /> : <Copy size={14} />}
                {copied && <span className={styles.copiedTooltip}>Copied!</span>}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) =>
            item.tooltip ? (
              <div key={item.label} className={styles.navLinkDisabled} title={item.tooltip}>
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/institution/dashboard'}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Logout */}
        <div className={styles.logoutWrapper}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut className={styles.navIcon} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Mobile top bar */}
        <div className={styles.mobileTopBar}>
          <button onClick={() => setMobileOpen(true)} className={styles.hamburger} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className={styles.mobileTitle}>{user?.name || 'Institution'}</span>
          <div className="w-6" />
        </div>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}