// client/src/pages/student/ModuleDetailPage.jsx

import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import StudentLayout from '../../components/Layout/StudentLayout';

import api from '../../services/api';

import { ArrowLeft, Clock, Lock, Check } from 'lucide-react';

import styles from './ModuleDetailPage.module.css';



const statusColors = {

  Completed: '#22c55e',

  InProgress: '#6366f1',

  Unlocked: '#6366f1',

  Locked: '#475569',

  Mastered: '#22c55e',

};



function getTrackLabelByOrder(order) {

  if (order <= 3) return 'Beginner';

  if (order <= 7) return 'Intermediate';

  return 'Advanced';

}



export default function ModuleDetailPage() {

  const { moduleId } = useParams();

  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);

  const [moduleInfo, setModuleInfo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  useEffect(() => {

    const fetchData = async () => {

      try {

        console.log('Fetching module data for:', moduleId);

        const [modRes, topicsRes] = await Promise.all([

          api.get(`/modules/${moduleId}`),

          api.get(`/modules/${moduleId}/topics`),

        ]);

        

        console.log('Module response:', modRes.data);
        console.log('Topics response:', topicsRes.data);

        if (modRes.data.success) {

          setModuleInfo(modRes.data.data.module);

        } else {

          setError(modRes.data.message || 'Failed to load module details');

        }

        

        if (topicsRes.data.success) {

          setTopics(topicsRes.data.data);

        } else {

          setError(topicsRes.data.message || 'Failed to load topics');

        }

      } catch (err) {

        console.error('Error fetching module data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load module details');

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, [moduleId]);



  if (loading) {

    return (

      <StudentLayout>

        <div className={styles.skeletonPage}>

          <div className={styles.skeletonHeader} />

          <div className={styles.skeletonLine} style={{ width: '60%' }} />

          <div className={styles.skeletonLine} style={{ width: '40%' }} />

          <div className={styles.skeletonTimeline}>

            {Array.from({ length: 3 }).map((_, i) => (

              <div key={i} className={styles.skeletonNode} />

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

  if (!moduleInfo && !loading) {

    return (

      <StudentLayout>

        <div className={styles.errorState}>

          <p>Module not found or unavailable</p>

          <button onClick={() => navigate('/modules')} className={styles.retryBtn}>Back to Modules</button>

        </div>

      </StudentLayout>

    );

  }



  const emoji = {

    Arrays: '📊', Strings: '🔤', Searching: '🔍', Sorting: '↕️',

    Recursion: '🔄', 'Linked Lists': '🔗', 'Stack and Queue': '📚',

    Trees: '🌳', 'Heaps and Hashing': '⛏️', Graphs: '🕸️',

    'Dynamic Programming': '💡',

  }[moduleInfo?.title] || '📘';



  const completedTopics = topics.filter(t => t.progress?.status === 'Completed' || t.progress?.status === 'Mastered').length;

  const trackLabel = getTrackLabelByOrder(moduleInfo?.order || 1);



  return (

    <StudentLayout>

      <div className={styles.page}>

        <button className={styles.backBtn} onClick={() => navigate('/modules')}>

          <ArrowLeft size={16} /> Modules

        </button>



        {moduleInfo && (

          <header className={styles.header}>

            <span className={styles.emoji}>{emoji}</span>

            <div>

              <h1 className={styles.title}>{moduleInfo.title}</h1>

              <div className={styles.badges}>

                <span className={`${styles.badge} ${trackLabel === 'Beginner' ? styles.bgGreen : trackLabel === 'Intermediate' ? styles.bgAmber : styles.bgRed}`}>

                  {trackLabel}

                </span>

                <span className={`${styles.badge} ${styles.bgBlue}`}>

                  <Clock size={12} /> {moduleInfo.estimatedDays} days

                </span>

              </div>

              <p className={styles.description}>{moduleInfo.description}</p>

            </div>

          </header>

        )}



        <section className={styles.progressSection}>

          <h2 className={styles.sectionTitle}>Your Progress</h2>

          <div className={styles.progressRow}>

            <div className={styles.progressBar}>

              <div

                className={styles.progressFill}

                style={{ width: `${(completedTopics / (topics.length || 1)) * 100}%` }}

              />

            </div>

            <span className={styles.progressSummary}>

              {completedTopics} of {topics.length} topics completed

            </span>

          </div>

        </section>



        <section className={styles.timeline}>

          <h2 className={styles.sectionTitle}>Topics</h2>

          {topics.length === 0 ? (

            <p className={styles.emptyMessage}>No topics available in this module.</p>

          ) : (

            <div className={styles.timelineList}>

              {topics.map((topic, index) => {

                const progress = topic.progress;

                const status = progress?.status || 'Locked';

                const round1Done = progress && progress.round1Score >= 80;

                const round2Done = progress && progress.round2Score >= 80;

                const round3Done = progress && progress.round3Score >= 60;



                const getStatusColor = () => {

                  if (status === 'Completed' || status === 'Mastered') return '#22c55e';

                  if (status === 'InProgress') return '#f59e0b';

                  if (status === 'Unlocked') return '#6366f1';

                  return '#475569';

                };



                return (

                  <div key={topic._id} className={styles.timelineNode}>

                    <div className={styles.nodeCircle} style={{ borderColor: getStatusColor() }}>

                      {status === 'Completed' || status === 'Mastered' ? (

                        <Check size={14} color="#22c55e" />

                      ) : (

                        <span style={{ color: getStatusColor() }}>{index + 1}</span>

                      )}

                    </div>

                    {index < topics.length - 1 && <div className={styles.connector} />}

                    <div className={`${styles.topicCard} ${

                      status === 'Locked' ? styles.lockedCard : ''

                    }`}>

                      <div className={styles.topicHeader}>

                        <h3 className={styles.topicTitle}>{topic.title}</h3>

                        <span className={styles.timeBadge}>{topic.estimatedMinutes} min</span>

                      </div>

                      <div className={styles.rounds}>

                        <span className={`${styles.roundDot} ${round1Done ? styles.roundDone : ''}`} />

                        <span className={`${styles.roundDot} ${round2Done ? styles.roundDone : ''}`} />

                        <span className={`${styles.roundDot} ${round3Done ? styles.roundDone : ''}`} />

                        <span className={styles.roundLabel}>B M H</span>

                      </div>

                      <div className={styles.actionRow}>

                        {status === 'Locked' ? (

                          <span className={styles.lockedTag}>

                            <Lock size={12} /> Locked

                            {topic.lockReason && (

                              <span className={styles.lockReason}>{topic.lockReason}</span>

                            )}

                          </span>

                        ) : status === 'Completed' || status === 'Mastered' ? (

                          <button className={styles.reviewBtn} onClick={() => navigate(`/topic/${topic._id}`)}>

                            Review

                          </button>

                        ) : (

                          <button className={styles.startBtn} onClick={() => navigate(`/topic/${topic._id}`)}>

                            {status === 'InProgress' ? 'Continue →' : 'Start →'}

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

        </section>

      </div>

    </StudentLayout>

  );

}