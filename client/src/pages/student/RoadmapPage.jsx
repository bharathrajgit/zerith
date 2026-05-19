import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ChevronDown, Lock, Check, Clock, Target, Zap } from 'lucide-react';
import styles from './RoadmapPage.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getStatusText(week, currentWeek) {
  if (week.isCompleted) return 'Completed';
  if (week.weekNumber === currentWeek) return 'Current';
  if (week.weekNumber > currentWeek) return 'Upcoming';
  return 'In Progress';
}

export default function RoadmapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const openTask = useCallback(async (task) => {
    if (!task?.referenceId || !task?.isUnlocked) return;
    const normalizedType = String(task.type || '').toLowerCase();

    if (normalizedType.includes('video') || normalizedType === 'revision') {
      navigate(`/topic/${task.referenceId}`);
      return;
    }

    if (normalizedType.includes('mcq')) {
      navigate(`/assessment/${task.referenceId}/Basic`);
      return;
    }

    if (normalizedType.includes('coding')) {
      try {
        const res = await api.get(`/coding/by-topic/${task.referenceId}`);
        if (res.data?.success && res.data.data?.problem?._id) {
          navigate(`/coding/${res.data.data.problem._id}`);
        }
      } catch (err) {
        console.error('Failed to load coding problem for task', task.referenceId, err);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data } = await api.get('/roadmap');
        if (data.success) {
          const {
            roadmap: roadmapData,
            currentWeek,
            currentDay,
            todayTasks,
            recapModules = [],
          } = data.data;
          setRoadmap({ ...roadmapData, currentWeek, currentDay, todayTasks, recapModules });
          return;
        }
      } catch (err) {
        console.error('Failed to load roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [user?.currentLevel]);

  const activeExpandedWeeks = useMemo(() => {
    if (!roadmap?.currentWeek) return expandedWeeks;
    if (Object.keys(expandedWeeks).length === 0) {
      return { [roadmap.currentWeek]: true };
    }
    return expandedWeeks;
  }, [roadmap, expandedWeeks]);

  const toggleWeek = useCallback((weekNum) => {
    setExpandedWeeks((prev) => {
      if (prev[weekNum]) {
        const next = { ...prev };
        delete next[weekNum];
        return next;
      }
      return { [weekNum]: true };
    });
  }, []);

  const { completedDays, totalDays, overallProgress, totalLearningDays } = useMemo(() => {
    if (!roadmap) {
      return { completedDays: 0, totalDays: 1, overallProgress: 0, totalLearningDays: 0 };
    }
    return {
      completedDays: roadmap.completedWorkDays || 0,
      totalDays: roadmap.totalDays || 1,
      overallProgress: roadmap.overallProgress || 0,
      totalLearningDays: roadmap.totalWorkDays || roadmap.totalDays || 0,
    };
  }, [roadmap]);

  if (loading) {
    return (
      <StudentLayout>
        <div className={styles.page}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonProgress} />
          <div className={styles.skeletonTimeline}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonWeek} />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !roadmap) {
    return (
      <StudentLayout>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>!</div>
          <h2>Failed to load roadmap</h2>
          <p>{error || 'Roadmap not available'}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
            <button onClick={() => navigate('/dashboard')} className={styles.retryBtn}>Go to Dashboard</button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Your {roadmap.planType || '90-day'} Roadmap</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => navigate('/dashboard')} className={styles.retryBtn}>Go to Dashboard</button>
          </div>
          <div className={styles.progressOverview}>
            <div className={styles.progressBarLarge}>
              <div className={styles.progressBarFill} style={{ width: `${overallProgress}%` }} />
            </div>
            <div className={styles.progressDetails}>
              <span className={styles.progressText}>
                {completedDays} / {totalLearningDays} learning days completed ({overallProgress}%)
              </span>
              <span className={`${styles.statusBadge} ${styles.onTrack}`}>
                Current day: {roadmap.currentDay}
              </span>
            </div>
          </div>
          <div className={styles.metaStrip}>
            <span>Day {roadmap.currentDay} of {totalDays}</span>
            <span className={styles.metaSeparator}>•</span>
            <span>{roadmap.planType || '90-day'} plan</span>
            <span className={styles.metaSeparator}>•</span>
            <span>
              {new Date(roadmap.targetDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        <section className={styles.weekList}>
          {roadmap.weeks.map((week, index) => {
            const expanded = activeExpandedWeeks[week.weekNumber] || false;
            const isCurrent = week.weekNumber === roadmap.currentWeek;
            const isPast = week.weekNumber < roadmap.currentWeek;
            const scheduledWeekDays = week.days.filter((day) => day.tasks.length > 0);
            const daysCompleted = scheduledWeekDays.filter((day) => day.isCompleted).length;
            const weekProgress = scheduledWeekDays.length
              ? Math.round((daysCompleted / scheduledWeekDays.length) * 100)
              : 0;

            return (
              <div
                key={week.weekNumber}
                className={`${styles.weekCard} ${
                  isCurrent ? styles.currentWeek : isPast ? styles.pastWeek : styles.futureWeek
                } ${expanded ? styles.weekExpanded : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className={styles.weekHeader}
                  onClick={() => toggleWeek(week.weekNumber)}
                  aria-expanded={expanded}
                >
                  <div className={styles.weekInfo}>
                    <span className={styles.weekNumber}>Week {week.weekNumber}</span>
                    <span className={styles.weekTopic}>
                      <Target size={14} className={styles.weekTopicIcon} /> {week.topic}
                    </span>
                    <div className={styles.weekProgressMini}>
                      <div className={styles.weekProgressBar}>
                        <div className={styles.weekProgressFill} style={{ width: `${weekProgress}%` }} />
                      </div>
                      <span className={styles.weekDaysCompleted}>
                        {scheduledWeekDays.length > 0
                          ? `${daysCompleted}/${scheduledWeekDays.length} learning days`
                          : 'Practice week'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.weekRight}>
                    <span className={styles.weekStatus}>{getStatusText(week, roadmap.currentWeek)}</span>
                    <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>
                      <ChevronDown size={20} />
                    </span>
                  </div>
                </button>

                <div className={`${styles.daysContainer} ${expanded ? styles.daysOpen : ''}`}>
                  <div className={styles.daysGrid}>
                    {week.days.map((day, idx) => {
                      const today = day.dayNumber === roadmap.currentDay;
                      const completed = day.isCompleted;
                      const locked = !day.unlockedAt && day.tasks.length > 0;
                      const missed = day.dayNumber < roadmap.currentDay && !completed && !locked;

                      return (
                        <div
                          key={day.dayNumber}
                          className={`${styles.dayCard} ${
                            today ? styles.todayCard : completed ? styles.completedCard : locked ? styles.lockedCard : missed ? styles.missedCard : ''
                          } ${styles.fadeInUp}`}
                          style={{ animationDelay: `${idx * 0.08}s` }}
                        >
                          <div className={styles.dayHeader}>
                            <div className={styles.dayNumberBadge}>
                              <span className={styles.dayNumber}>Day {day.dayNumber}</span>
                              <span className={styles.dayWeekday}>
                                {WEEKDAYS[(new Date(roadmap.startDate).getDay() + (day.dayNumber - 1)) % 7]}
                              </span>
                            </div>
                            <div className={styles.dayStatusIcon}>
                              {completed && <Check size={16} className={styles.dayCheck} />}
                              {locked && <Lock size={16} className={styles.dayLock} />}
                              {missed && <Clock size={16} className={styles.dayMiss} />}
                              {today && !completed && <Zap size={16} className={styles.dayToday} />}
                            </div>
                          </div>
                          <div className={styles.divider} />
                          <ul className={styles.taskList}>
                            {day.tasks.length === 0 ? (
                              <li className={styles.moreTasks}>Daily practice block</li>
                            ) : day.tasks.map((task, i) => (
                              <li
                                key={i}
                                className={`${styles.taskItem} ${task.referenceId && task.isUnlocked ? styles.taskItemClickable : ''}`}
                                onClick={() => openTask(task)}
                                role={task.referenceId && task.isUnlocked ? 'button' : undefined}
                                tabIndex={task.referenceId && task.isUnlocked ? 0 : -1}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ' ') && task.referenceId && task.isUnlocked) {
                                    e.preventDefault();
                                    openTask(task);
                                  }
                                }}
                              >
                                <span className={styles.taskEmoji}>
                                  {task.type === 'video' ? '📺' : task.type?.includes('mcq') ? '📝' : '💻'}
                                </span>
                                <span className={styles.taskName}>
                                  {task.title}
                                  {!task.isCompleted && !task.isUnlocked ? ' (Locked)' : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {today && !completed && !locked && day.tasks.length > 0 && (
                            <button
                              className={styles.startDayBtn}
                              onClick={() => navigate(`/roadmap/day/${day.dayNumber}`)}
                            >
                              Start Today&apos;s Tasks
                              <Zap size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {Array.isArray(roadmap.recapModules) && roadmap.recapModules.length > 0 && (
          <section className={styles.weekList} style={{ marginTop: '2rem' }}>
            <div className={styles.weekCard}>
              <div className={styles.weekHeader} style={{ cursor: 'default' }}>
                <div className={styles.weekInfo}>
                  <span className={styles.weekNumber}>Optional Recap</span>
                  <span className={styles.weekTopic}>
                    <Target size={14} className={styles.weekTopicIcon} /> Lower-level modules remain available in Modules/Course
                  </span>
                </div>
              </div>
              <div className={styles.daysOpen} style={{ paddingTop: 0 }}>
                <div className={styles.daysGrid}>
                  {roadmap.recapModules.map((module) => (
                    <div key={module._id} className={styles.dayCard}>
                      <div className={styles.dayHeader}>
                        <div className={styles.dayNumberBadge}>
                          <span className={styles.dayNumber}>{module.title}</span>
                          <span className={styles.dayWeekday}>{module.difficulty}</span>
                        </div>
                      </div>
                      <div className={styles.divider} />
                      <ul className={styles.taskList}>
                        <li className={styles.taskItem}>
                          <span className={styles.taskEmoji}>📚</span>
                          <span className={styles.taskName}>
                            {module.completedTopics}/{module.totalTopics} topics completed
                          </span>
                        </li>
                        <li className={styles.taskItem}>
                          <span className={styles.taskEmoji}>↺</span>
                          <span className={styles.taskName}>Optional recap only</span>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className={styles.legend}>
          <span><span className={styles.dotCompleted}></span> Completed</span>
          <span><span className={styles.dotToday}></span> Current</span>
          <span><span className={styles.dotMissed}></span> In progress</span>
          <span><span className={styles.dotLocked}></span> Locked</span>
        </div>
      </div>
    </StudentLayout>
  );
}
