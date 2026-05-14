// client/src/pages/student/ProgressPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import api from '../../services/api';
import { Flame, Trophy, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import styles from './ProgressPage.module.css';

const TOPIC_EMOJI = {
  Arrays: '📊', Strings: '🔤', Searching: '🔍', Sorting: '↕️',
  Recursion: '🔄', 'Linked Lists': '🔗', 'Stack and Queue': '📚',
  Trees: '🌳', 'Heaps and Hashing': '⛏️', Graphs: '🕸️',
  'Dynamic Programming': '💡',
};

const MasteryStatus = ({ score }) => {
  if (score >= 85) return <span className={`${styles.statusPill} ${styles.statusMastered}`}>Mastered</span>;
  if (score >= 70) return <span className={`${styles.statusPill} ${styles.statusProficient}`}>Proficient</span>;
  if (score >= 55) return <span className={`${styles.statusPill} ${styles.statusDeveloping}`}>Developing</span>;
  return <span className={`${styles.statusPill} ${styles.statusWeak}`}>Weak</span>;
};

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('topic');
  const [sortAsc, setSortAsc] = useState(true);
  const [masteryFilter, setMasteryFilter] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [progRes, streRes] = await Promise.allSettled([
          api.get('/progress'),
          api.get('/streak'),
        ]);
        if (progRes.status === 'fulfilled' && progRes.value.data.success)
          setProgress(progRes.value.data.data);
        if (streRes.status === 'fulfilled' && streRes.value.data.success)
          setStreak(streRes.value.data.data);
      } catch (err) {
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Build topic rows from progress
  const topicRows = useMemo(() => {
    if (!progress?.moduleProgress) return [];
    return progress.moduleProgress
      .map((mod) =>
        mod.topics.map((t) => ({
          topic: t.topic?.title || 'Unknown',
          emoji: TOPIC_EMOJI[t.topic?.title] || '📘',
          mcq: t.progress?.round1Score || 0,
          coding: t.progress?.codingScore || 0,
          mastery: t.progress?.masteryScore || 0,
          status: t.progress?.status || 'Locked',
          requiresCoding: !!t.topic?.requiresCoding,
        }))
      )
      .flat();
  }, [progress]);

  // Filter and sort
  const filteredTopics = useMemo(() => {
    let res = [...topicRows];
    if (masteryFilter === 'Mastered') res = res.filter((t) => t.mastery >= 85);
    else if (masteryFilter === 'Weak') res = res.filter((t) => t.mastery < 55);
    res.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'topic') {
        return sortAsc ? a.topic.localeCompare(b.topic) : b.topic.localeCompare(a.topic);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
    return res;
  }, [topicRows, masteryFilter, sortField, sortAsc]);

  // Sorting toggle
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }, [sortField]);

  // Readiness gauge
  const readiness = progress?.placementReadiness || 0;
  const gaugeRadius = 90;
  const gaugeCircumference = Math.PI * gaugeRadius;
  const gaugeProgress = (readiness / 100) * gaugeCircumference;
  const gaugeColor = readiness >= 80 ? '#22c55e' : readiness >= 60 ? '#f59e0b' : readiness >= 40 ? '#f97316' : '#ef4444';
  const readinessLevel = readiness >= 80 ? 'Placement Ready' : readiness >= 60 ? 'Interview Practicing' : readiness >= 40 ? 'Foundation Building' : 'Beginner';

  // Performance chart data (using streak activity to simulate)
  const chartData = useMemo(() => {
    if (!Array.isArray(progress?.recentPerformance)) return [];
    return progress.recentPerformance.map((entry) => ({
      day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      accuracy: typeof entry.mcqAccuracy === 'number' ? Math.round(entry.mcqAccuracy) : null,
      coding: typeof entry.codingAccuracy === 'number' ? Math.round(entry.codingAccuracy) : null,
      mastery: typeof entry.masteryScore === 'number' ? Math.round(entry.masteryScore) : null,
    }));
  }, [progress]);
  const hasTrendData = chartData.some((entry) =>
    typeof entry.accuracy === 'number' ||
    typeof entry.coding === 'number' ||
    typeof entry.mastery === 'number'
  );

  // Achievements
  const achievements = useMemo(() => [
    { icon: '🧠', name: 'First Step', desc: 'Completed diagnostic test', earned: progress?.diagnosticCompleted },
    { icon: '🔥', name: 'Week Warrior', desc: '7 day streak', earned: streak?.currentStreak >= 7 },
    { icon: '🏅', name: 'Topic Master', desc: 'First topic mastered', earned: topicRows.some((t) => t.mastery >= 85) },
    { icon: '⚡', name: 'Speed Demon', desc: '10 questions <10s avg', earned: false },
    { icon: '🎯', name: 'Placement Ready', desc: '80% readiness', earned: readiness >= 80 },
    { icon: '💻', name: 'Problem Solver', desc: '10 coding problems', earned: false },
  ], [progress, streak, topicRows, readiness]);

  // Calendar : build last 30 days with actual activity for last 7 days, and unknown before
  const calendarDays = useMemo(() => {
    const activityDates = new Set(
      (streak?.activityLog || []).map((entry) =>
        new Date(entry.date).toISOString().split('T')[0]
      )
    );
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const active = activityDates.has(dateKey);
      days.push({ date: dateKey, active, isToday: i === 0 });
    }
    return days;
  }, [streak]);

  if (loading) {
    return (
      <StudentLayout>
        <div className={styles.page}>
          <div className={styles.skeletonGauge} />
          <div className={styles.skeletonChart} />
          <div className={styles.skeletonTable} />
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>!</div>
          <h2>Failed to load progress</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>📈 My Progress</h1>

        {/* Section 1 – Readiness Gauge */}
        <section className={`${styles.gaugeSection} ${styles.fadeInUp}`}>
          <div className={styles.gaugeContainer}>
            <svg viewBox="0 0 200 130" className={styles.gaugeSvg}>
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gaugeColor} />
                  <stop offset="100%" stopColor={readiness >= 80 ? '#4ade80' : readiness >= 60 ? '#fbbf24' : '#f87171'} />
                </linearGradient>
              </defs>
              <path
                d="M 15 110 A 90 90 0 0 1 185 110"
                fill="none"
                stroke="#1e1e35"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 15 110 A 90 90 0 0 1 185 110"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeCircumference - gaugeProgress}
                className={styles.gaugeFill}
              />
              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((value) => {
                const angle = -180 + (value / 100) * 180; // -180 to 0
                const rad = (angle * Math.PI) / 180;
                const innerR = 58;
                const outerR = 62;
                const x1 = 100 + innerR * Math.cos(rad);
                const y1 = 110 + innerR * Math.sin(rad);
                const x2 = 100 + outerR * Math.cos(rad);
                const y2 = 110 + outerR * Math.sin(rad);
                return <line key={value} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2" />;
              })}
            </svg>
            <div className={styles.gaugeText}>
              <span className={styles.gaugeScore}>{readiness}%</span>
              <span className={styles.gaugeLabel}>{readinessLevel}</span>
            </div>
          </div>
          <div className={styles.supportingStats}>
            <div className={styles.supportStat}>
              <span className={styles.supportValue}>{topicRows.filter((t) => t.mastery >= 85).length}/{topicRows.length}</span>
              <span>Topics Mastered</span>
            </div>
            <div className={styles.supportStat}>
              <span className={styles.supportValue}>{streak?.totalActiveDays || 0}</span>
              <span>Active Days</span>
            </div>
            <div className={styles.supportStat}>
              <span className={styles.supportValue}>{topicRows.length ? Math.round(topicRows.reduce((s, t) => s + t.mastery, 0) / topicRows.length) : 0}%</span>
              <span>Avg Mastery</span>
            </div>
            <div className={styles.supportStat}>
              <span className={styles.supportValue}>{streak?.longestStreak || 0}</span>
              <span>Best Streak</span>
            </div>
          </div>
        </section>

        {/* Section 2 – Performance Chart */}
        <section className={`${styles.chartSection} ${styles.fadeInUp}`}>
          <h2 className={styles.sectionTitle}>Performance Trend (7 days)</h2>
          {hasTrendData ? (
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111120', border: '1px solid #1e1e35', borderRadius: 8, color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="MCQ Accuracy"
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="coding"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Coding Score"
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="mastery"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Mastery"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.emptyChart}>
              Complete more assessments to see your trend
            </div>
          )}
        </section>

        {/* Section 3 – Topic Mastery Table */}
        <section className={`${styles.tableSection} ${styles.fadeInUp}`}>
          <h2 className={styles.sectionTitle}>Topic Mastery</h2>
          <div className={styles.filterRow}>
            {['All', 'Mastered', 'Weak'].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${masteryFilter === f ? styles.activeFilter : ''}`}
                onClick={() => setMasteryFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {filteredTopics.length === 0 ? (
            <div className={styles.emptyMessage}>No topics match the filter</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Topic', 'MCQ', 'Coding', 'Mastery', 'Status'].map((col) => (
                      <th
                        key={col}
                        className={styles.th}
                        onClick={() => {
                          if (col === 'Topic') handleSort('topic');
                          if (col === 'Mastery') handleSort('mastery');
                        }}
                      >
                        <span className={styles.thContent}>
                          {col}
                          {sortField === col.toLowerCase() ? (
                            <span className={styles.sortIcon}>{sortAsc ? ' ↑' : ' ↓'}</span>
                          ) : (
                            <span className={styles.sortIcon}> ⇅</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((row, i) => (
                    <tr key={i} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={styles.topicCell}>
                          <span className={styles.topicEmoji}>{row.emoji}</span>
                          <span className={styles.topicName}>{row.topic}</span>
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.cellPill} ${
                          row.mcq >= 80 ? styles.cellGreen : row.mcq >= 60 ? styles.cellAmber : row.mcq >= 40 ? styles.cellOrange : row.mcq > 0 ? styles.cellRed : styles.cellEmpty
                        }`}>
                          {row.mcq > 0 ? `${Math.round(row.mcq)}%` : '-'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.cellPill} ${
                          !row.requiresCoding
                            ? styles.cellEmpty
                            : row.coding >= 80 ? styles.cellGreen : row.coding >= 60 ? styles.cellAmber : row.coding >= 40 ? styles.cellOrange : row.coding > 0 ? styles.cellRed : styles.cellEmpty
                        }`}>
                          {!row.requiresCoding
                            ? 'N/A'
                            : row.coding > 0 ? `${Math.round(row.coding)}%` : '-'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.masteryCell}>
                          <div className={styles.miniBar}>
                            <div
                              className={styles.miniBarFill}
                              style={{ width: `${row.mastery}%` }}
                            />
                          </div>
                          <span className={styles.miniBarText}>{Math.round(row.mastery)}%</span>
                        </div>
                      </td>
                      <td className={styles.td}><MasteryStatus score={row.mastery} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 4 – Streak Calendar */}
        <section className={`${styles.streakSection} ${styles.fadeInUp}`}>
          <h2 className={styles.sectionTitle}>Last 30 Days</h2>
          <div className={styles.calendarGrid}>
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`${styles.calendarCell} ${day.active ? styles.calActive : ''} ${day.isToday ? styles.calToday : ''}`}
                title={day.date}
              />
            ))}
          </div>
          <div className={styles.streakStats}>
            <div className={styles.streakStat}><Flame size={18} color="#f59e0b" /> Current streak: {streak?.currentStreak || 0} days</div>
            <div className={styles.streakStat}><Trophy size={18} color="#f59e0b" /> Best streak: {streak?.longestStreak || 0} days</div>
            <div className={styles.streakStat}><Activity size={18} color="#22c55e" /> Consistency: {streak?.consistencyScore || 0}%</div>
          </div>
        </section>

        {/* Section 5 – Achievements */}
        <section className={`${styles.achievementsSection} ${styles.fadeInUp}`}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          <div className={styles.achievementsGrid}>
            {achievements.map((ach) => (
              <div key={ach.name} className={`${styles.achievementCard} ${ach.earned ? styles.earned : styles.locked}`}>
                <span className={styles.achievementIcon}>{ach.icon}</span>
                <p className={styles.achievementName}>{ach.name}</p>
                <p className={styles.achievementDesc}>{ach.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
