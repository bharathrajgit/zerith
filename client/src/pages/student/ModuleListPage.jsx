import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './ModuleListPage.module.css';

function getTrackLabel(module) {
  return module?.difficulty || 'Beginner';
}

function getDisplayStatus(module, percentage) {
  if (module?.status === 'Completed' || percentage === 100) return 'Completed';
  if (module?.status === 'InProgress' || percentage > 0) return 'InProgress';
  if (module?.status === 'Locked' || !module?.accessible) return 'Locked';
  return 'NotStarted';
}

export default function ModuleListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressionRes, progressRes] = await Promise.all([
          api.get('/progression'),
          api.get('/progress'),
        ]);

        if (progressionRes.data.success) {
          setModules(progressionRes.data.data?.modules || []);
        }

        if (progressRes.data.success) {
          const map = {};
          (progressRes.data.data.moduleProgress || []).forEach((moduleEntry) => {
            map[moduleEntry.module._id] = moduleEntry.percentage || 0;
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.error('Failed to load modules:', err);
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.currentLevel]);

  const filteredModules = useMemo(() => {
    return [...modules]
      .filter((module) => {
        if (search && !module.title.toLowerCase().includes(search.toLowerCase())) return false;
        const status = getDisplayStatus(module, progressMap[module._id] || 0);
        if (filter === 'InProgress') return status === 'InProgress';
        if (filter === 'Completed') return status === 'Completed';
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [filter, modules, progressMap, search]);

  const totalTopicsCount = modules.reduce((sum, module) => sum + (module.totalTopics || 0), 0);

  if (loading) {
    return (
      <StudentLayout>
        <div className={styles.page}>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>Retry</button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>DSA Modules</h1>
          <p className={styles.subtitle}>Track all {totalTopicsCount || 0} topics across Beginner, Intermediate, and Advanced.</p>
          <div className={styles.filters}>
            {['All', 'InProgress', 'Completed'].map((item) => (
              <button
                key={item}
                className={`${styles.filterBtn} ${filter === item ? styles.activeFilter : ''}`}
                onClick={() => setFilter(item)}
              >
                {item === 'InProgress' ? 'In Progress' : item}
              </button>
            ))}
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search modules..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </header>

        {filteredModules.length === 0 ? (
          <div className={styles.emptyState}>No modules match your criteria</div>
        ) : (
          <div className={styles.grid}>
            {filteredModules.map((module) => {
              const percentage = progressMap[module._id] || 0;
              const status = getDisplayStatus(module, percentage);
              const trackLabel = getTrackLabel(module);
              const emoji = {
                Arrays: '📊',
                Strings: '🔤',
                Searching: '🔍',
                Sorting: '↕️',
                Recursion: '🔁',
                'Linked Lists': '🔗',
                'Stack and Queue': '📚',
                Trees: '🌳',
                'Heaps and Hashing': '⛏️',
                Graphs: '🕸️',
                'Dynamic Programming': '💡',
              }[module.title] || '📘';

              return (
                <div
                  key={module._id}
                  className={styles.card}
                  onClick={() => navigate(`/modules/${module._id}`)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.emoji}>{emoji}</span>
                    <span className={`${styles.difficultyBadge} ${trackLabel === 'Beginner' ? styles.diffGreen : trackLabel === 'Intermediate' ? styles.diffAmber : styles.diffRed}`}>
                      {trackLabel}
                    </span>
                    <span className={`${styles.statusBadge} ${
                      status === 'Completed' ? styles.statusCompleted :
                      status === 'InProgress' ? styles.statusInProgress :
                      styles.statusNotStarted
                    }`}>
                      {status === 'Completed' ? 'Done' : status === 'InProgress' ? 'In Progress' : status === 'Locked' ? 'Locked' : 'New'}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{module.title}</h3>
                  <p className={styles.cardDesc}>{module.description?.slice(0, 80) || 'No description'}...</p>

                  <div className={styles.meta}>
                    <span>{module.totalTopics} topics</span>
                    <span>Est. {module.estimatedDays} days</span>
                  </div>

                  <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                    </div>
                    <span className={styles.progressText}>{Math.round(percentage)}%</span>
                  </div>

                  <button className={styles.cardBtn}>
                    {status === 'Completed'
                      ? 'Review →'
                      : status === 'InProgress'
                        ? 'Continue →'
                        : status === 'Locked'
                          ? 'View Path →'
                          : 'Start →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
