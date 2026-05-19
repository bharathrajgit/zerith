import { useState, useEffect } from 'react';
import InstitutionLayout from '../../components/Layout/InstitutionLayout';
import api from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Trophy, AlertTriangle, Clock4 } from 'lucide-react';
import styles from './AnalyticsPage.module.css';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ov, dept, risk, predictionResponse] = await Promise.allSettled([
          api.get('/institution/analytics/overview'),
          api.get('/institution/analytics/departments'),
          api.get('/institution/analytics/at-risk'),
          api.get('/institution/analytics/placement-prediction'),
        ]);

        if (ov.status === 'fulfilled' && ov.value.data.success) setOverview(ov.value.data.data);
        if (dept.status === 'fulfilled' && dept.value.data.success) setDepartments(dept.value.data.data);
        if (risk.status === 'fulfilled' && risk.value.data.success) setAtRisk(risk.value.data.data);
        if (predictionResponse.status === 'fulfilled' && predictionResponse.value.data.success) {
          setPrediction(predictionResponse.value.data.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const levelData = overview?.levelDistribution
    ? [
        { name: 'Beginner', value: overview.levelDistribution.Beginner || 0, color: '#ef4444' },
        { name: 'Intermediate', value: overview.levelDistribution.Intermediate || 0, color: '#f59e0b' },
        { name: 'Placement Ready', value: overview.levelDistribution['Placement-Ready'] || 0, color: '#22c55e' },
      ]
    : [];

  const deptBarData = departments.map((department) => ({
    name: department.code || department.name,
    readiness: department.avgPlacementReadiness || 0,
    students: department.totalStudents || 0,
    activeThisWeek: department.activeThisWeek || 0,
  }));

  const allStudents = departments.flatMap((department) =>
    (department.topPerformers || []).map((student) => ({ ...student, dept: department.code }))
  );
  const top10 = [...allStudents]
    .sort((left, right) => (right.placementReadiness || 0) - (left.placementReadiness || 0))
    .slice(0, 10);

  const predictionCards = prediction?.summary
    ? [
        { label: 'Ready Now', value: prediction.summary.readyNow || 0, desc: 'Students already interview ready' },
        { label: 'Within 30d', value: prediction.summary.within30 || 0, desc: 'Likely ready in the next month' },
        { label: 'Within 60d', value: prediction.summary.within60 || 0, desc: 'Need another month of guided work' },
        { label: 'Within 90d', value: prediction.summary.within90 || 0, desc: 'Longer preparation window' },
        { label: 'Needs More', value: prediction.summary.needsMore || 0, desc: 'Require deeper support before placement prep' },
      ]
    : [];

  if (loading) {
    return (
      <InstitutionLayout>
        <div className={styles.page}>
          <div className={styles.skeletonBlock} style={{ height: 300 }} />
          <div className={styles.skeletonBlock} style={{ height: 250 }} />
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <h1 className={styles.title}>Analytics</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Department Performance Comparison</h2>
          <div className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111120', border: '1px solid #1e1e35', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="readiness" name="Avg Readiness">
                  {deptBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.readiness >= 70 ? '#22c55e' : entry.readiness >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
                <Bar dataKey="activeThisWeek" name="Active This Week" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.twoCol}>
            <div className={styles.chartCard} style={{ maxWidth: 420 }}>
              <h2 className={styles.sectionTitle}>Student Level Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={levelData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {levelData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111120', border: '1px solid #1e1e35', borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartCard}>
              <h2 className={styles.sectionTitle}>Prediction Summary</h2>
              {predictionCards.length === 0 ? (
                <p className={styles.emptyText}>Prediction data will appear when students have enough activity history.</p>
              ) : (
                <div className={styles.predictionGrid}>
                  {predictionCards.map((card) => (
                    <div key={card.label} className={styles.predictionCard}>
                      <p className={styles.predictionLabel}>{card.label}</p>
                      <p className={styles.predictionValue}>{card.value}</p>
                      <p className={styles.predictionDesc}>{card.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.twoCol}>
            <div className={styles.performerCard}>
              <h3 className={styles.performerTitle} style={{ color: '#4ade80' }}><Trophy size={18} /> Top 10 Students</h3>
              {top10.length === 0 ? <p className={styles.emptyText}>No student performance data yet.</p> : (
                <div className={styles.performerList}>
                  {top10.map((student, index) => (
                    <div key={student._id || `${student.email}-${index}`} className={styles.performerRow}>
                      <span className={styles.performerRank}>{index + 1}</span>
                      <span className={styles.performerName}>{student.name}</span>
                      <span className={styles.performerDept}>{student.dept}</span>
                      <span className={styles.performerScore}>{student.placementReadiness || 0}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.performerCard}>
              <h3 className={styles.performerTitle} style={{ color: '#f87171' }}><AlertTriangle size={18} /> At-Risk Students</h3>
              {atRisk.length === 0 ? <p className={styles.emptyText}>No at-risk students right now.</p> : (
                <div className={styles.performerList}>
                  {atRisk.slice(0, 10).map((student, index) => (
                    <div key={student._id || `${student.email}-${index}`} className={styles.performerRow}>
                      <span className={styles.performerRank}>{index + 1}</span>
                      <span className={styles.performerName}>{student.name}</span>
                      <span className={styles.performerDept}>{student.severity}</span>
                      <span className={styles.performerScore}>{student.placementReadiness || 0}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><Clock4 size={18} /> Department Activity Snapshot</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.heatmapTable}>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Active Today</th>
                  <th>Active This Week</th>
                  <th>Pending Diagnostic</th>
                  <th>At Risk</th>
                  <th>Avg Readiness</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.code}>
                    <td className={styles.topicCell}>{department.name} ({department.code})</td>
                    <td className={styles.heatCell}>{department.totalStudents || 0}</td>
                    <td className={styles.heatCell}>{department.activeToday || 0}</td>
                    <td className={styles.heatCell}>{department.activeThisWeek || 0}</td>
                    <td className={styles.heatCell}>{department.diagnosticPending || 0}</td>
                    <td className={styles.heatCell}>{department.atRiskStudents || 0}</td>
                    <td className={styles.heatCell}>{department.avgPlacementReadiness || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </InstitutionLayout>
  );
}
