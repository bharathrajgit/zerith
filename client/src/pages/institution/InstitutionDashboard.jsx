import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionLayout from '../../components/Layout/InstitutionLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users, TrendingUp, Activity, AlertTriangle, Clock, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import styles from './InstitutionDashboard.module.css';

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [malpractice, setMalpractice] = useState(null);
  const [placementPrediction, setPlacementPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ov, dept, risk, prediction] = await Promise.allSettled([
          api.get('/institution/analytics/overview'),
          api.get('/institution/analytics/departments'),
          api.get('/institution/analytics/at-risk'),
          api.get('/institution/analytics/placement-prediction'),
        ]);

        if (ov.status === 'fulfilled' && ov.value.data.success) {
          setOverview(ov.value.data.data);
        }
        if (dept.status === 'fulfilled' && dept.value.data.success) {
          setDepartments(dept.value.data.data);
        }
        if (risk.status === 'fulfilled' && risk.value.data.success) {
          setAtRisk(risk.value.data.data);
        }
        if (prediction.status === 'fulfilled' && prediction.value.data.success) {
          setPlacementPrediction(prediction.value.data.data);
        }
      } catch (error) {
        console.error('Dashboard fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    api.get('/institution/analytics/malpractice')
      .then(({ data }) => {
        if (data.success) setMalpractice(data.data);
      })
      .catch(() => {});
  }, []);

  const avgReadiness = overview?.avgPlacementReadiness || 0;
  const readinessColor = avgReadiness >= 80 ? '#22c55e' : avgReadiness >= 60 ? '#f59e0b' : '#ef4444';
  const timelineData = placementPrediction?.byDepartment || [];
  const hasPredictionData = timelineData.some((department) => department.totalStudents > 0);

  if (loading) {
    return (
      <InstitutionLayout>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSubtitle} />
          </div>
          <div className={styles.statsRow}>
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className={styles.skeletonCard} />)}
          </div>
          <div className={styles.skeletonDeptGrid}>
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className={styles.skeletonDeptCard} />)}
          </div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <header className={`${styles.header} ${styles.fadeInUp}`}>
          <h1 className={styles.greeting}>Welcome, {user?.name || 'Institution'}!</h1>
          <p className={styles.subtitle}>
            Manage your students and track placement readiness across departments.
          </p>
        </header>

        <div className={styles.statsRow}>
          <StatCard icon={<Users size={20} />} value={overview?.totalStudents || 0} label="Total Students" color="#3b82f6" delay={0} />
          <StatCard icon={<Activity size={20} />} value={overview?.activeToday || 0} label="Active Today" color="#22c55e" delay={0.1} />
          <StatCard icon={<TrendingUp size={20} />} value={overview?.activeThisWeek || 0} label="Active This Week" color="#6366f1" delay={0.2} />
          <StatCard
            icon={<TargetIcon />}
            value={`${avgReadiness}%`}
            label="Avg Readiness"
            color={readinessColor}
            delay={0.3}
          />
          <StatCard icon={<AlertTriangle size={20} />} value={overview?.atRiskStudents || 0} label="At-Risk" color="#ef4444" urgent delay={0.4} />
          <StatCard icon={<Clock size={20} />} value={overview?.diagnosticPending || 0} label="Pending Diagnostic" color="#f59e0b" delay={0.5} />
        </div>

        <section className={`${styles.section} ${styles.fadeInUp}`} style={{ animationDelay: '0.2s' }}>
          <h2 className={styles.sectionTitle}>Departments</h2>
          {departments.length === 0 ? (
            <div className={styles.emptyState}>No departments found.</div>
          ) : (
            <div className={styles.deptGrid}>
              {departments.map((dept) => (
                <div key={dept.code || dept.name} className={styles.deptCard}>
                  <div className={styles.deptHeader}>
                    <span className={styles.deptName}>{dept.name}</span>
                    <span className={styles.deptCode}>{dept.code}</span>
                  </div>
                  <p className={styles.deptStudents}>{dept.totalStudents || 0} students</p>
                  <div className={styles.deptReadiness}>
                    <span className={styles.deptReadinessLabel}>Avg Readiness</span>
                    <div className={styles.deptProgressBar}>
                      <div
                        className={styles.deptProgressFill}
                        style={{ width: `${dept.avgPlacementReadiness || 0}%` }}
                      />
                    </div>
                    <span className={styles.deptReadinessValue}>{dept.avgPlacementReadiness || 0}%</span>
                  </div>
                  <div className={styles.deptLevels}>
                    <span className={styles.levelBar} style={{ flex: dept.levelDistribution?.Beginner || 0, backgroundColor: '#ef4444' }} />
                    <span className={styles.levelBar} style={{ flex: dept.levelDistribution?.Intermediate || 0, backgroundColor: '#f59e0b' }} />
                    <span className={styles.levelBar} style={{ flex: dept.levelDistribution?.['Placement-Ready'] || 0, backgroundColor: '#22c55e' }} />
                  </div>
                  <div className={styles.deptActiveToday}>
                    Active today: <strong>{dept.activeToday}</strong>
                  </div>
                  <button
                    className={styles.deptLink}
                    onClick={() => navigate(`/institution/departments?dept=${dept.code}`)}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.twoCol}>
          <section className={`${styles.section} ${styles.fadeInUp}`} style={{ animationDelay: '0.3s' }}>
            <h2 className={styles.sectionTitle}>At-Risk Students</h2>
            {atRisk.length === 0 ? (
              <div className={styles.emptyCard}>No at-risk students right now.</div>
            ) : (
              <div className={styles.riskList}>
                {atRisk.slice(0, 5).map((student) => (
                  <div key={student._id} className={styles.riskCard}>
                    <div className={styles.riskInfo}>
                      <p className={styles.riskName}>{student.name}</p>
                      <p className={styles.riskEmail}>{student.email}</p>
                      <p className={styles.riskReason}>{student.reasons?.join(', ') || 'Low readiness'}</p>
                    </div>
                    <button
                      className={styles.viewBtn}
                      onClick={() => navigate(`/institution/students?search=${student.email}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={`${styles.section} ${styles.fadeInUp}`} style={{ animationDelay: '0.4s' }}>
            <h2 className={styles.sectionTitle}>Recent Alerts</h2>
            {!malpractice || (malpractice?.high?.length === 0 && malpractice?.medium?.length === 0 && malpractice?.low?.length === 0) ? (
              <div className={styles.emptyCard}>No recent alerts.</div>
            ) : (
              <div className={styles.alertList}>
                {[...(malpractice?.high || []), ...(malpractice?.medium || [])].slice(0, 5).map((alert) => (
                  <div key={alert._id} className={styles.alertCard}>
                    <div className={styles.alertInfo}>
                      <p className={styles.alertStudent}>Student: {alert.userId?.name || 'Unknown'}</p>
                      <span className={`${styles.alertLevel} ${alert.riskLevel === 'HIGH' ? styles.alertHigh : styles.alertMedium}`}>
                        {alert.riskLevel}
                      </span>
                      <p className={styles.alertFlags}>{alert.flags?.join(', ')}</p>
                    </div>
                    <button className={styles.viewBtn} onClick={() => navigate('/institution/malpractice')}>
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className={`${styles.section} ${styles.fadeInUp}`} style={{ animationDelay: '0.5s' }}>
          <h2 className={styles.sectionTitle}>Placement Timeline Prediction</h2>
          {!hasPredictionData ? (
            <div className={styles.emptyCard}>
              Prediction data will appear once institution-linked students build enough activity history.
            </div>
          ) : (
            <div className={styles.chartCard}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
                  <XAxis dataKey="code" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111120', border: '1px solid #1e1e35', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="readyNow" stackId="a" fill="#22c55e" name="Ready Now" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="within30" stackId="a" fill="#6366f1" name="Within 30d" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="within60" stackId="a" fill="#f59e0b" name="Within 60d" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="within90" stackId="a" fill="#f97316" name="Within 90d" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="needsMore" stackId="a" fill="#ef4444" name="Needs More" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </InstitutionLayout>
  );
}

function StatCard({ icon, value, label, color, urgent, delay = 0 }) {
  return (
    <div
      className={`${styles.statCard} ${urgent ? styles.statCardUrgent : ''} ${styles.fadeInUp}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={styles.statIcon} style={{ color }}>
        {icon}
      </div>
      <p className={styles.statValue} style={{ color }}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
