// client/src/pages/student/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/Layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getChatResponse } from '../../services/geminiService';
import {
  Flame, TrendingUp, BookOpen, Brain, Code2, PlayCircle,
  AlertCircle, Send, X, Bot, ChevronRight, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import styles from './DashboardPage.module.css';

const StatSkeleton = () => <div className={`${styles.card} ${styles.skeleton}`} />;
const TaskSkeleton = () => (
  <div className={styles.taskSkeleton}>
    <div className={styles.skeletonAvatar} />
    <div className={styles.skeletonLines}>
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div className={styles.skeletonLine} style={{ width: '30%', marginTop: '0.5rem' }} />
    </div>
  </div>
);
const ChartSkeleton = () => <div className={`${styles.card} ${styles.chartSkeleton}`} />;
const ModuleCardSkeleton = () => <div className={`${styles.moduleCard} ${styles.skeleton}`} />;

const MODULE_EMOJI = {
  Arrays: '📊', Strings: '🔤', Searching: '🔍', Sorting: '↕️', Recursion: '🔄',
  'Linked Lists': '🔗', 'Stack and Queue': '📚', Trees: '🌳',
  'Heaps and Hashing': '⛏️', Graphs: '🕸️', 'Dynamic Programming': '💡',
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState(null);
  const [weakAreas, setWeakAreas] = useState(null);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingWeak, setLoadingWeak] = useState(false);
  const [activityData, setActivityData] = useState([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const buildWeakAreaPayload = (progressEntry) => {
    const mcqAccuracy = (progressEntry?.round1Score || 0) / 100;
    const codingAccuracy = (progressEntry?.codingScore || 0) > 0
      ? (progressEntry.codingScore || 0) / 100
      : mcqAccuracy;

    return {
      round1_acc: mcqAccuracy,
      round2_acc: mcqAccuracy,
      round3_acc: codingAccuracy,
      attempt_count: progressEntry?.totalAttempts || 0,
      hint_rate: progressEntry?.totalAttempts
        ? (progressEntry.hintsUsed || 0) / progressEntry.totalAttempts
        : 0,
    };
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [r, p, s] = await Promise.allSettled([
          api.get('/roadmap'), api.get('/progress'), api.get('/streak'),
        ]);
        if (r.status === 'fulfilled' && r.value.data.success) {
          const {
            roadmap: roadmapData,
            currentWeek,
            currentDay,
            todayTasks,
            recapModules = [],
          } = r.value.data.data;
          setRoadmap({
            ...(roadmapData || {}),
            currentWeek,
            currentDay,
            todayTasks: todayTasks || [],
            recapModules,
          });
        }
        if (p.status === 'fulfilled' && p.value.data.success) setProgress(p.value.data.data);
        if (s.status === 'fulfilled' && s.value.data.success) setStreak(s.value.data.data);
      } catch (e) { toast.error('Unable to load dashboard data'); }
      finally { setLoadingMain(false); }
    };
    fetch();
  }, [user?.currentLevel]);

  useEffect(() => {
    if (!progress?.moduleProgress) return;
    const topics = [];
    progress.moduleProgress.forEach((mod) =>
      mod.topics.forEach((t) => {
        if (t.progress) {
          topics.push({
            topic_name: t.topic.title,
            ...buildWeakAreaPayload(t.progress),
          });
        }
      })
    );
    if (topics.length === 0) return;
    setLoadingWeak(true);
    api.post('/ml/detect-weak-areas', { topics })
      .then(({ data }) => { if (data.success) setWeakAreas(data.data); })
      .catch(() => {})
      .finally(() => setLoadingWeak(false));
  }, [progress]);

  useEffect(() => {
    if (Array.isArray(streak?.activityLog)) {
      const activityByDate = new Map();

      streak.activityLog.forEach((entry) => {
        const key = new Date(entry.date).toISOString().split('T')[0];
        const current = activityByDate.get(key) || { tasks: 0, minutes: 0 };
        activityByDate.set(key, {
          tasks: current.tasks + (entry.tasksCompleted || 0),
          minutes: current.minutes + (entry.minutesSpent || 0),
        });
      });

      const nextData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().split('T')[0];
        const entry = activityByDate.get(key) || { tasks: 0, minutes: 0 };

        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          tasks: entry.tasks,
          minutes: entry.minutes,
        };
      });

      setActivityData(nextData);
    }
  }, [streak]);

  // ─── Derived stats ────────────────────────────────────
  const modulesMastered = progress?.overview?.completedTopics
    ?? progress?.moduleProgress?.reduce((acc, m) => acc + m.completedTopics, 0)
    ?? 0;
  const totalTopicsAll = progress?.overview?.totalTopics
    ?? progress?.moduleProgress?.reduce((acc, m) => acc + (m.totalTopics || 0), 0)
    ?? 0;
  const todayTasks = roadmap?.todayTasks || [];

  // Determine if the current day has been unlocked
  const currentWeekObj = roadmap?.weeks?.find(w => w.weekNumber === roadmap.currentWeek);
  const currentDayObj = currentWeekObj?.days?.find(d => d.dayNumber === roadmap.currentDay);
  const dayUnlocked = currentDayObj?.unlockedAt != null;   // null means locked

  const completedToday = todayTasks.filter(t => t.isCompleted).length;

  const openRoadmapTask = async (task) => {
    if (!task?.referenceId || !task?.isUnlocked) return;

    if (task.type === 'video' || task.type === 'video-analysis' || task.type === 'revision') {
      navigate(`/topic/${task.referenceId}`);
      return;
    }

    if (String(task.type).includes('mcq')) {
      navigate(`/assessment/${task.referenceId}/Basic`);
      return;
    }

    if (task.type === 'coding') {
      try {
        const res = await api.get(`/coding/by-topic/${task.referenceId}`);
        const problemId = res.data?.data?.problem?._id;
        if (problemId) navigate(`/coding/${problemId}`);
      } catch {
        toast.error('Coding problem not available right now.');
      }
    }
  };

  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    const newMsgs = [...chatMessages, { role: 'user', content: msg }];
    setChatMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);
    const context = {
      topic: roadmap?.currentWeek
        ? roadmap.weeks.find(w => w.weekNumber === roadmap.currentWeek)?.topic : 'General',
      currentLevel: user?.currentLevel || 'Beginner',
    };
    try {
      const reply = await getChatResponse(msg, context);
      setChatMessages([...newMsgs, { role: 'assistant', content: reply || "I'm having trouble connecting." }]);
    } catch {
      setChatMessages([...newMsgs, { role: 'assistant', content: "I'm having trouble connecting." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loadingMain) {
    return (
      <StudentLayout>
        <div className={styles.page}>
          <div className={styles.statsRow}>{Array.from({length:4}).map((_,i)=><StatSkeleton key={i} />)}</div>
          <div className={styles.taskTitle}><div className={styles.skeletonLine} style={{width:'150px',height:'1.5rem'}} /></div>
          <div className={styles.tasksList}>{Array.from({length:3}).map((_,i)=><TaskSkeleton key={i} />)}</div>
          <div className={styles.twoCol}><ChartSkeleton /><ChartSkeleton /></div>
          <div className={styles.moduleGrid}>{Array.from({length:8}).map((_,i)=><ModuleCardSkeleton key={i} />)}</div>
        </div>
      </StudentLayout>
    );
  }

  // Use the name field if available, otherwise fall back to username or email prefix
  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'Student';
  const userLevel = user?.currentLevel || 'Beginner';
  const readinessScore = progress?.placementReadiness ?? user?.placementReadiness ?? 0;
  const readinessState = readinessScore >= 80 ? 'Placement Ready'
    : readinessScore >= 60 ? 'Interview Practicing'
    : readinessScore >= 40 ? 'Foundation Building'
    : userLevel;

  return (
    <StudentLayout>
      <div className={styles.page}>
        <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, {displayName}! 👋</h1>
          {roadmap && (
            <p className={styles.planInfo}>
              Day {roadmap.currentDay} of {roadmap.totalDays} • {roadmap.planType || '90-day'} Plan
            </p>
          )}
        </div>
        <p className={styles.date}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardAmber}`}>
          <Flame className={styles.statIcon} style={{color:'#f59e0b'}} />
          <p className={styles.statValue}>{streak?.currentStreak || 0}</p>
          <p className={styles.statLabel}>Day Streak</p>
          <p className={styles.statSub}>Best: {streak?.longestStreak || 0} days</p>
        </div>

        <div className={styles.statCard}>
          <TrendingUp className={styles.statIcon} style={{color:'#6366f1'}} />
          <p className={styles.statValue} style={{color:
            readinessScore < 40 ? '#ef4444' :
            readinessScore < 70 ? '#f59e0b' : '#22c55e'
          }}>
            {readinessScore}%
          </p>
          <p className={styles.statLabel}>Placement Readiness</p>
          <p className={styles.statSub} style={{textTransform:'capitalize'}}>
            {readinessState}
          </p>
          <p className={styles.statSub} style={{textTransform:'capitalize'}}>
            Diagnostic Level: {userLevel}
          </p>
        </div>

        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <BookOpen className={styles.statIcon} style={{color:'#22c55e'}} />
          <p className={styles.statValue}>{modulesMastered} / {totalTopicsAll}</p>
          <p className={styles.statLabel}>Topics Mastered</p>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} style={{width:`${totalTopicsAll > 0 ? (modulesMastered/totalTopicsAll)*100 : 0}%`}} />
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.todayRing}>
            <svg viewBox="0 0 120 120" className={styles.ringSvg}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1e35" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" strokeWidth="8"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * completedToday) / Math.max(todayTasks.length, 1)}
                strokeLinecap="round" className={styles.ringProgress} />
            </svg>
            <span className={styles.ringValue}>{completedToday}/{todayTasks.length}</span>
          </div>
          <p className={styles.statLabel}>Today's Tasks</p>
          <p className={styles.statSub}>{completedToday} of {todayTasks.length} done</p>
        </div>
      </div>

      {/* Today's tasks */}
      {roadmap && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span>📋 Today's Tasks</span>
            <span className={styles.dayBadge}>Day {roadmap.currentDay}</span>
          </h2>
          {todayTasks.length === 0 ? (
            <div className={styles.emptyState}>🎉 No tasks for today – enjoy your rest day!</div>
          ) : (
            <div className={styles.tasksList}>
              {todayTasks.map((task, idx) => (
                <div key={idx} className={styles.taskRow}>
                  <div className={styles.taskIcon}>
                    {task.type === 'video' ? <PlayCircle /> :
                     task.type === 'basic-mcq' || task.type === 'mcq-practice' ? <Brain /> :
                     task.type === 'video-analysis' || task.type === 'revision' ? <BookOpen /> :
                     String(task.type).includes('coding') ? <Code2 /> : <BookOpen />}
                  </div>
                  <div className={styles.taskInfo}>
                    <p className={styles.taskName}>{task.title}</p>
                    <p className={styles.taskType}>{task.type.replace(/-/g, ' ')}</p>
                  </div>
                  {task.isCompleted ? (
                    <span className={styles.taskStatusDone}><Check /> Done</span>
                  ) : dayUnlocked && task.isUnlocked ? (
                    <button onClick={() => openRoadmapTask(task)}
                      className={styles.taskBtn}>Start <ChevronRight /></button>
                  ) : (
                    <span className={styles.taskStatusLocked} title="Complete previous day first">🔒 Locked</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Two column: weak areas + activity */}
      <div className={styles.twoCol}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚠️ Focus Areas</h2>
          {loadingWeak ? (
            <div className={styles.skeletonList}>
              {Array.from({length:2}).map((_,i)=><div key={i} className={`${styles.card} ${styles.skeleton}`} style={{height:'80px'}} />)}
            </div>
          ) : weakAreas?.weak_topics?.length > 0 ? (
            <div className={styles.weakList}>
              {weakAreas.weak_topics.slice(0,3).map((wt) => (
                <div key={wt.topic_name} className={styles.weakCard}>
                  <span className={`${styles.severityDot} ${
                    wt.severity === 'high' ? styles.severityHigh :
                    wt.severity === 'medium' ? styles.severityMedium : styles.severityLow
                  }`} />
                  <div className={styles.weakInfo}>
                    <p className={styles.weakTopic}>{wt.topic_name}</p>
                    <p className={styles.weakRecommendation}>{wt.recommendation?.slice(0, 80) || 'Practice this topic'}</p>
                  </div>
                  <button onClick={() => {
                    const mod = progress?.moduleProgress?.find(m => m.topics?.some(t => t.topic.title === wt.topic_name));
                    if (mod) navigate(`/modules/${mod.module._id}`);
                  }} className={styles.practiceBtn}>Practice</button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>🎯 No weak areas detected! Keep up the great work.</div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📊 Weekly Activity</h2>
          <div className={styles.chartCard}>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
                  <XAxis dataKey="day" tick={{fill:'#64748b', fontSize:12}} />
                  <YAxis tick={{fill:'#64748b', fontSize:12}} />
                  <Tooltip
                    contentStyle={{backgroundColor:'#111120', border:'1px solid #1e1e35', borderRadius:8}}
                    formatter={(value, name) => [
                      value,
                      name === 'tasks' ? 'Tasks Completed' : 'Minutes Spent',
                    ]}
                  />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>No recent activity data</div>
            )}
          </div>
        </section>
      </div>

      {/* Module Mastery Grid */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📚 Module Progress</h2>
        <div className={styles.moduleGrid}>
          {progress?.moduleProgress?.map((mod) => {
            const pct = mod.percentage || 0;
            let cardStyle = styles.moduleCard;
            if (pct >= 80) cardStyle += ` ${styles.moduleCardGreen}`;
            else if (pct >= 60) cardStyle += ` ${styles.moduleCardAmber}`;
            else if (pct >= 40) cardStyle += ` ${styles.moduleCardOrange}`;
            else if (pct > 0) cardStyle += ` ${styles.moduleCardRed}`;
            return (
              <div key={mod.module._id} className={cardStyle} onClick={() => navigate(`/modules/${mod.module._id}`)}>
                <span className={styles.moduleEmoji}>{MODULE_EMOJI[mod.module.title] || '📘'}</span>
                <p className={styles.moduleName}>{mod.module.title}</p>
                <p className={styles.modulePercent}>{pct}% mastery</p>
                <div className={styles.moduleBar}>
                  <div className={styles.moduleBarFill} style={{width:`${pct}%`}} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating AI Chat button / panel (unchanged) */}
      <button className={styles.chatFloatBtn} onClick={() => setChatOpen(true)}><Bot /></button>
      {chatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div>
              <p className={styles.chatTitle}>DSA AI Assistant</p>
              <p className={styles.chatSubtitle}>Ask me anything about Java DSA</p>
            </div>
            <button onClick={() => setChatOpen(false)} className={styles.chatClose}><X /></button>
          </div>
          <div className={styles.chatMessages}>
            <div className={styles.chatSystemMsg}>
              Hi {displayName}! I'm your DSA assistant. Ask me anything about Java, algorithms, or your current topic.
            </div>
            {chatMessages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div className={styles.chatTyping}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} style={{animationDelay:'0.1s'}} />
                <span className={styles.typingDot} style={{animationDelay:'0.2s'}} />
              </div>
            )}
          </div>
          <div className={styles.chatInputArea}>
            <input
              type="text"
              placeholder="Ask about Java DSA..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              className={styles.chatInput}
            />
            <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}
              className={styles.chatSendBtn}><Send /></button>
          </div>
        </div>
      )}
    </div>
    </StudentLayout>
  );
}
