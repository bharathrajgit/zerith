import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ArrowLeft, Check, Play, BookOpen, Code, Lock } from 'lucide-react';
import styles from './RoadmapDayPage.module.css';

const TASK_ICONS = {
  video: Play,
  'basic-mcq': BookOpen,
  'mcq-practice': BookOpen,
  'video-analysis': BookOpen,
  revision: BookOpen,
  coding: Code,
  'coding-practice': Code,
};

const TASK_COLORS = {
  video: '#6366f1',
  'basic-mcq': '#22c55e',
  'mcq-practice': '#22c55e',
  'video-analysis': '#38bdf8',
  revision: '#f59e0b',
  coding: '#f59e0b',
  'coding-practice': '#f97316',
};

export default function RoadmapDayPage() {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const { data } = await api.get('/roadmap');
        if (!data.success) {
          setError('Failed to load roadmap');
          return;
        }

        const roadmapData = data.data.roadmap;
        const day = roadmapData.weeks
          .flatMap((week) => week.days)
          .find((entry) => entry.dayNumber === Number(dayNumber));

        if (!day) {
          setError('Day not found in roadmap');
          return;
        }

        setCurrentDay(day);
      } catch (err) {
        console.error('Failed to load roadmap:', err);
        setError('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [dayNumber, user?.currentLevel]);

  const handleTaskClick = async (task) => {
    if (!task?.referenceId || !task?.isUnlocked) return;

    const taskType = String(task.type || '').toLowerCase();
    if (taskType.includes('video') || taskType === 'revision') {
      navigate(`/topic/${task.referenceId}`);
      return;
    }

    if (taskType.includes('mcq')) {
      navigate(`/assessment/${task.referenceId}/Basic`);
      return;
    }

    if (taskType.includes('coding')) {
      try {
        const res = await api.get(`/coding/by-topic/${task.referenceId}`);
        if (res.data?.success && res.data.data?.problem?._id) {
          navigate(`/coding/${res.data.data.problem._id}`);
        }
      } catch (err) {
        console.error('Failed to load coding problem for topic', task.referenceId, err);
      }
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading day tasks...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !currentDay) {
    return (
      <StudentLayout>
        <div className={styles.error}>
          <h2>Unable to load day</h2>
          <p>{error || 'Day not found'}</p>
          <button onClick={() => navigate('/roadmap')} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Roadmap
          </button>
        </div>
      </StudentLayout>
    );
  }

  const completedTasks = currentDay.tasks.filter((task) => task.isCompleted).length;
  const totalTasks = currentDay.tasks.length || 1;

  return (
    <StudentLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <button onClick={() => navigate('/roadmap')} className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Roadmap
          </button>
          <div className={styles.dayInfo}>
            <h1 className={styles.title}>Day {currentDay.dayNumber} Tasks</h1>
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                />
              </div>
              <span className={styles.progressText}>
                {completedTasks} / {currentDay.tasks.length} tasks completed
              </span>
            </div>
          </div>
        </header>

        <section className={styles.tasksSection}>
          <div className={styles.tasksGrid}>
            {currentDay.tasks.length === 0 ? (
              <div className={styles.taskCard}>
                <div className={styles.taskContent}>
                  <h3 className={styles.taskTitle}>Buffer / revision day</h3>
                </div>
              </div>
            ) : currentDay.tasks.map((task, index) => {
              const IconComponent = TASK_ICONS[task.type] || BookOpen;
              const color = TASK_COLORS[task.type] || '#6366f1';

              return (
                <div
                  key={index}
                  className={`${styles.taskCard} ${task.isCompleted ? styles.completed : ''} ${task.isUnlocked ? styles.clickable : ''}`}
                  onClick={() => handleTaskClick(task)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && task.isUnlocked) {
                      e.preventDefault();
                      handleTaskClick(task);
                    }
                  }}
                  role={task.isUnlocked ? 'button' : undefined}
                  tabIndex={task.isUnlocked ? 0 : -1}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.taskHeader}>
                    <div className={styles.taskIcon} style={{ backgroundColor: color }}>
                      <IconComponent size={20} />
                    </div>
                    <div className={styles.taskMeta}>
                      <span className={styles.taskType}>
                        {String(task.type || '').replace(/-/g, ' ').toUpperCase()}
                      </span>
                      {task.isCompleted ? (
                        <Check size={16} className={styles.checkIcon} />
                      ) : !task.isUnlocked ? (
                        <Lock size={16} className={styles.checkIcon} />
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.taskContent}>
                    <h3 className={styles.taskTitle}>{task.title}</h3>
                    {!task.isCompleted && task.isUnlocked && (
                      <span className={styles.startText}>Click to start</span>
                    )}
                    {!task.isCompleted && !task.isUnlocked && (
                      <span className={styles.startText}>Complete the previous step first</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
