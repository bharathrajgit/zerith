import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Clock,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import usePracticeMonitoring from '../../hooks/usePracticeMonitoring';
import MonitoringConsentModal from '../../components/common/MonitoringConsentModal';
import CameraMonitoringLayer from '../../components/common/CameraMonitoringLayer';
import styles from './DiagnosticPage.module.css';

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore audio errors quietly.
  }
};

const formatTopic = (topic) =>
  topic
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatQuestionRange = (minQuestions, maxQuestions) => `${minQuestions}-${maxQuestions}`;

const formatPercentage = (score) => {
  if (typeof score !== 'number') return '0%';
  return `${score.toFixed(1)}%`;
};

const ProgressBar = ({ score, color = 'primary' }) => {
  const percentage = Math.min(100, Math.max(0, score));
  const colorClass = color === 'success' ? styles.progressSuccess : 
                     color === 'warning' ? styles.progressWarning : 
                     styles.progressPrimary;
  
  return (
    <div className={styles.progressContainer}>
      <div className={`${styles.progressBar} ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

const AnimatedScore = ({ value, label, icon: Icon }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'number' ? value : 0;
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [targetValue]);
  
  return (
    <div className={styles.animatedDetailBox}>
      {Icon && <Icon size={20} className={styles.detailIcon} />}
      <span className={styles.detailLabel}>{label}</span>
      <strong className={styles.detailValue}>
        {label.includes('%') ? `${displayValue}%` : displayValue}
      </strong>
    </div>
  );
};

const getAchievementBadge = (score) => {
  if (score >= 90) return { emoji: '🏆', title: 'Outstanding!', color: 'gold' };
  if (score >= 75) return { emoji: '⭐', title: 'Excellent!', color: 'purple' };
  if (score >= 60) return { emoji: '🎯', title: 'Great Job!', color: 'blue' };
  if (score >= 40) return { emoji: '💪', title: 'Good Progress!', color: 'green' };
  return { emoji: '📈', title: 'Keep Learning!', color: 'orange' };
};

const getMotivationalMessage = (level, score) => {
  const messages = {
    'Beginner': [
      "Great start! Every expert was once a beginner.",
      "You've taken the first step towards mastery!",
      "Begin with determination, end with excellence."
    ],
    'Intermediate': [
      "Impressive progress! You're building strong foundations.",
      "You're on the right track to becoming proficient!",
      "Intermediate skills open doors to advanced concepts."
    ],
    'Placement-Ready': [
      "Outstanding! You're ready for real-world challenges.",
      "Placement-ready! Your hard work is paying off.",
      "You've mastered the fundamentals. Time to shine!"
    ]
  };
  
  const levelMessages = messages[level] || messages['Beginner'];
  return levelMessages[Math.floor(Math.random() * levelMessages.length)];
};

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  const [screen, setScreen] = useState('welcome');
  const [sessionToken, setSessionToken] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [minQuestions, setMinQuestions] = useState(30);
  const [maxQuestions, setMaxQuestions] = useState(50);
  const [timePerQuestion, setTimePerQuestion] = useState(45);
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [results, setResults] = useState(null);
  const [perTopicScores, setPerTopicScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [analyzingStep, setAnalyzingStep] = useState(0);

  const timerRef = useRef(null);
  const beepPlayed = useRef(false);
  const analyzingInterval = useRef(null);
  const sessionDataRef = useRef({
    changedAnswers: 0,
  });

  const handleMonitoringStatusChange = useMemo(
    () => (nextState) => {
      if (nextState.finalFlagged) {
        toast.error(
          `Monitoring flag raised for this diagnostic. Warning ${nextState.warningCount}/${nextState.warningLimit}.`
        );
        return;
      }

      if ((nextState.warningCount || 0) > 0) {
        toast(`Warning ${nextState.warningCount}/${nextState.warningLimit}: do not switch tabs during the diagnostic.`, {
          icon: '⚠️',
        });
      }
    },
    []
  );

  const {
    browserMetrics,
    captureVideoRef,
    consentModal,
    finishMonitoring,
    isMobile,
    sessionId,
    sessionState,
    startMonitoring,
    stream,
    trackBrowserEvent,
  } = usePracticeMonitoring({
    sessionType: 'diagnostic',
    institutionLinked: !!user?.institutionId,
    sessionLabel: 'diagnostic test session',
    onStatusChange: handleMonitoringStatusChange,
  });

  const analyzingMessages = [
    'Analyzing your answers',
    'Calculating your readiness level',
    'Detecting strong and weak topics',
    'Preparing your roadmap',
  ];

  const strengths = useMemo(
    () =>
      Object.entries(perTopicScores)
        .filter(([, score]) => score >= 60)
        .sort(([, a], [, b]) => b - a),
    [perTopicScores]
  );

  const focusAreas = useMemo(
    () =>
      Object.entries(perTopicScores)
        .filter(([, score]) => score < 60)
        .sort(([, a], [, b]) => a - b),
    [perTopicScores]
  );

  const questionRangeLabel = useMemo(
    () => formatQuestionRange(minQuestions, maxQuestions),
    [minQuestions, maxQuestions]
  );

  const loadNextQuestion = async (token, fallbackTarget = totalQuestions, fallbackTime = timePerQuestion) => {
    try {
      setScreen('loading');
      const { data } = await api.post('/diagnostic/question', { token });

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to load question');
      }

      setCurrentQuestion(data.data);
      setQuestionNumber(data.data.questionNumber || 1);
      setTotalQuestions(data.data.currentTarget || fallbackTarget || 30);
      setTimeLeft(data.data.timeLimit || fallbackTime || 45);
      setSelectedOption(null);
      setQuestionResult(null);
      beepPlayed.current = false;
      setScreen('question');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Could not load question.';
      setSessionError(message);
      setScreen('error');
      toast.error(message);
    }
  };

  const startDiagnostic = async () => {
    setIsSubmitting(true);
    setSessionError('');

    try {
      const monitoringReady = await startMonitoring();
      if (!monitoringReady) return;

      const { data } = await api.post('/diagnostic/start');

      if (!data.success || !data.data?.token) {
        throw new Error(data.message || 'Could not start diagnostic');
      }

      const nextMinQuestions = data.data.minQuestions || 30;
      const nextMaxQuestions = data.data.maxQuestions || 50;
      const nextTotalQuestions = data.data.totalQuestions || nextMinQuestions;
      const nextTimePerQuestion = data.data.timePerQuestion || 45;

      setSessionToken(data.data.token);
      setMinQuestions(nextMinQuestions);
      setMaxQuestions(nextMaxQuestions);
      setTotalQuestions(nextTotalQuestions);
      setTimePerQuestion(nextTimePerQuestion);

      await loadNextQuestion(data.data.token, nextTotalQuestions, nextTimePerQuestion);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Could not start diagnostic.';
      setSessionError(message);
      setScreen('welcome');
      toast.error(message);

      if (error.response?.status === 400 && message.toLowerCase().includes('already completed')) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnswer = async (optionIndex) => {
    if (isSubmitting || selectedOption !== null || !sessionToken) return;

    setSelectedOption(optionIndex);
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const questionLimit = currentQuestion?.timeLimit || timePerQuestion;
    const timeTaken = questionLimit - timeLeft;

    try {
      const { data } = await api.post('/diagnostic/answer', {
        token: sessionToken,
        selectedOption: optionIndex,
        timeTaken,
      });

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to submit answer');
      }

      setQuestionResult(data.data);
      setTotalQuestions(data.data.currentTarget || totalQuestions);

      window.setTimeout(() => {
        if (data.data.isComplete) {
          setScreen('analyzing');
        } else {
          loadNextQuestion(sessionToken, data.data.currentTarget || totalQuestions, timePerQuestion);
        }
      }, 1100);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to submit answer.';
      setSessionError(message);
      setScreen('error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (screen !== 'question' || selectedOption !== null || isSubmitting) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timerRef.current);
          if (selectedOption === null) {
            submitAnswer(-1);
          }
          return 0;
        }

        if (previous === 6 && !beepPlayed.current) {
          playBeep();
          beepPlayed.current = true;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [screen, selectedOption, isSubmitting, sessionToken, currentQuestion, timePerQuestion, timeLeft]);

  useEffect(() => {
    let copyThrottleTimer;

    const handleVisibility = () => {
      if (document.hidden && screen === 'question') {
        trackBrowserEvent('tabSwitches');
        toast('Do not switch tabs during the test. This session is monitored.', { icon: '⚠️' });
      }
    };

    const handleCopy = () => {
      if (screen === 'question' && !copyThrottleTimer) {
        trackBrowserEvent('copyAttempts');
        copyThrottleTimer = window.setTimeout(() => {
          copyThrottleTimer = null;
        }, 1000);
      }
    };

    const handleBlur = () => {
      if (screen === 'question') {
        trackBrowserEvent('windowBlurCount');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('copy', handleCopy);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('copy', handleCopy);
      window.removeEventListener('blur', handleBlur);

      if (copyThrottleTimer) {
        window.clearTimeout(copyThrottleTimer);
      }
    };
  }, [screen, trackBrowserEvent]);

  useEffect(() => () => {
    finishMonitoring({}, { keepalive: true });
  }, [finishMonitoring]);

  useEffect(() => {
    if (screen !== 'analyzing' || !sessionToken) {
      return undefined;
    }

    const completeDiagnostic = async () => {
      try {
        const { data } = await api.post('/diagnostic/complete', {
          token: sessionToken,
          sessionData: {
            ...browserMetrics,
            changedAnswers: sessionDataRef.current.changedAnswers,
          },
          monitoringSessionId: sessionId,
        });

        if (!data.success || !data.data) {
          throw new Error(data.message || 'Could not complete diagnostic');
        }

        updateUser({
          diagnosticCompleted: true,
          currentLevel: data.data.level,
          diagnosticScore: data.data.score,
          placementReadiness: data.data.placementReadiness,
        });

        localStorage.setItem('dsa_diag_completed', 'true');
        setResults(data.data);
        setPerTopicScores(data.data.perTopicScores || {});
        setScreen('results');
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Could not complete diagnostic.';
        setSessionError(message);
        setScreen('error');
        toast.error(message);
      }
    };

    completeDiagnostic();

    analyzingInterval.current = window.setInterval(() => {
      setAnalyzingStep((previous) => (previous + 1) % analyzingMessages.length);
    }, 1000);

    return () => {
      if (analyzingInterval.current) {
        window.clearInterval(analyzingInterval.current);
      }
    };
  }, [browserMetrics, finishMonitoring, navigate, screen, sessionId, sessionToken, updateUser]);

  const restartLanding = () => {
    setScreen('welcome');
    setSessionError('');
    setSelectedOption(null);
    setQuestionResult(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {screen === 'welcome' && (
          <section className={styles.card}>
            <div className={styles.hero}>
              <div className={styles.heroIcon}>
                <Brain size={30} />
              </div>
              <div>
                <p className={styles.eyebrow}>Diagnostic Assessment</p>
                <h1 className={styles.title}>Start your DSA level test</h1>
                <p className={styles.subtitle}>
                  This page is your diagnostic landing screen. Read the test details below,
                  then click Start to begin the assessment.
                </p>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Questions</span>
                <strong className={styles.detailValue}>{minQuestions} to {maxQuestions}</strong>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Time per question</span>
                <strong className={styles.detailValue}>{timePerQuestion} seconds</strong>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Difficulty</span>
                <strong className={styles.detailValue}>Adaptive Java DSA</strong>
              </div>
              <div className={styles.detailBox}>
                <span className={styles.detailLabel}>Result</span>
                <strong className={styles.detailValue}>Level and roadmap</strong>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <Sparkles size={18} />
                <span>Before you start</span>
              </div>
              <div className={styles.ruleList}>
                <div className={styles.ruleItem}>You cannot go back to previous questions.</div>
                <div className={styles.ruleItem}>Each question auto-submits when the timer ends.</div>
                <div className={styles.ruleItem}>Only one attempt is allowed for each student account.</div>
                <div className={styles.ruleItem}>Your roadmap will be generated from this score.</div>
                <div className={styles.ruleItem}>Do not switch tabs or leave the test window. Warnings will be recorded.</div>
              </div>
            </div>

            {sessionError ? (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{sessionError}</span>
              </div>
            ) : null}

            <div className={styles.actionRow}>
              <button className={styles.primaryButton} onClick={startDiagnostic} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className={styles.spin} />
                    <span>Starting test...</span>
                  </>
                ) : (
                  <>
                    <span>Start Test</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {screen === 'loading' && (
          <section className={styles.centerCard}>
            <RefreshCw size={28} className={`${styles.loaderIcon} ${styles.spin}`} />
            <h2 className={styles.centerTitle}>Preparing your question</h2>
            <p className={styles.centerText}>
              Loading question {questionNumber || 1} of {questionRangeLabel}
            </p>
          </section>
        )}

        {screen === 'question' && currentQuestion && (
          <section className={styles.card}>
            <div className={styles.questionHeader}>
              <div className={styles.questionMeta}>
                <span className={styles.badge}>Question {questionNumber} / {questionRangeLabel}</span>
                <span className={styles.topicBadge}>
                  <BookOpen size={14} />
                  <span>{currentQuestion.topic}</span>
                </span>
              </div>
              <div className={styles.timerBadge}>
                <Clock size={16} />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <div className={styles.feedback}>
              <AlertCircle size={16} />
              <span>
                Monitoring active. Warning {sessionState?.warningCount || 0}/{sessionState?.warningLimit || (user?.institutionId ? 2 : 3)}. Do not switch tabs.
              </span>
            </div>

            <div className={styles.questionBlock}>
              <h2 className={styles.questionText}>{currentQuestion.question}</h2>
            </div>

            <div className={styles.options}>
              {currentQuestion.options.map((option, index) => {
                let stateClass = '';

                if (selectedOption === index && !questionResult) {
                  stateClass = styles.optionSelected;
                } else if (questionResult) {
                  if (questionResult.isCorrect && index === selectedOption) {
                    stateClass = styles.optionCorrect;
                  } else if (!questionResult.isCorrect && index === selectedOption) {
                    stateClass = styles.optionWrong;
                  } else if (index === questionResult.correctOption) {
                    stateClass = styles.optionReveal;
                  }
                }

                const optionLabel = ['A', 'B', 'C', 'D'][index] || String(index + 1);

                return (
                  <button
                    key={index}
                    type="button"
                    className={`${styles.optionButton} ${stateClass}`}
                    disabled={selectedOption !== null}
                    onClick={() => submitAnswer(index)}
                  >
                    <span className={styles.optionIndex}>{optionLabel}</span>
                    <span className={styles.optionText}>{option}</span>
                  </button>
                );
              })}
            </div>

            {questionResult ? (
              <div className={`${styles.feedback} ${questionResult.isCorrect ? styles.feedbackGood : styles.feedbackBad}`}>
                {questionResult.isCorrect ? <Check size={18} /> : <X size={18} />}
                <span>
                  {questionResult.isCorrect ? 'Correct answer. Moving to next question.' : 'Incorrect answer. Moving to next question.'}
                </span>
              </div>
            ) : null}
          </section>
        )}

        {screen === 'analyzing' && (
          <section className={styles.centerCard}>
            <Brain size={28} className={styles.loaderIcon} />
            <h2 className={styles.centerTitle}>{analyzingMessages[analyzingStep]}</h2>
            <p className={styles.centerText}>Please wait while your diagnostic result is generated.</p>
          </section>
        )}

        {screen === 'results' && results && (
          <section className={styles.card}>
            <div className={styles.resultsHeader}>
              <div className={styles.achievementSection}>
                <div className={styles.achievementBadge}>
                  <span className={styles.achievementEmoji}>{getAchievementBadge(results.score || 0).emoji}</span>
                  <div className={styles.achievementText}>
                    <h3 className={styles.achievementTitle}>{getAchievementBadge(results.score || 0).title}</h3>
                    <p className={styles.motivationalMessage}>{getMotivationalMessage(results.level || 'Beginner', results.score || 0)}</p>
                  </div>
                </div>
                <span className={`${styles.levelPill} ${styles.animated}`}>
                  <Award size={16} />
                  <span>{results.level || 'Diagnostic Completed'}</span>
                </span>
              </div>
              <h2 className={styles.resultsTitle}>Your diagnostic result is ready</h2>
              <p className={styles.subtitle}>
                Your roadmap has been generated from the current performance summary.
              </p>
            </div>

            <div className={styles.detailsGrid}>
              <AnimatedScore 
                value={results.score ?? 0} 
                label="Score" 
                icon={Target} 
              />
              <AnimatedScore 
                value={results.accuracy ?? 0} 
                label="Accuracy" 
                icon={Award} 
              />
              <AnimatedScore 
                value={results.correctAnswers ?? 0} 
                label="Correct answers" 
                icon={Check} 
              />
              <AnimatedScore 
                value={results.confidence ? Math.round(results.confidence * 100) : 0} 
                label="Confidence" 
                icon={Brain} 
              />
            </div>

            <div className={styles.resultsColumns}>
              <div className={styles.resultPanel}>
                <div className={styles.sectionTitle}>
                  <Trophy size={18} />
                  <span>Strengths</span>
                </div>
                {strengths.length ? (
                  <div className={styles.topicList}>
                    {strengths.map(([topic, score]) => (
                      <div key={topic} className={styles.topicRow}>
                        <div className={styles.topicInfo}>
                          <span>{formatTopic(topic)}</span>
                          <ProgressBar score={score} color="success" />
                        </div>
                        <strong>{formatPercentage(score)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No strong topics identified yet.</p>
                )}
              </div>

              <div className={styles.resultPanel}>
                <div className={styles.sectionTitle}>
                  <Target size={18} />
                  <span>Focus Areas</span>
                </div>
                {focusAreas.length ? (
                  <div className={styles.topicList}>
                    {focusAreas.map(([topic, score]) => (
                      <div key={topic} className={styles.topicRow}>
                        <div className={styles.topicInfo}>
                          <span>{formatTopic(topic)}</span>
                          <ProgressBar score={score} color="warning" />
                        </div>
                        <strong>{formatPercentage(score)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>No weak areas detected.</p>
                )}
              </div>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.primaryButton} onClick={() => navigate('/roadmap')}>
                <span>View Roadmap</span>
                <ChevronRight size={18} />
              </button>
              <button className={styles.secondaryButton} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </section>
        )}

        {screen === 'error' && (
          <section className={styles.centerCard}>
            <AlertCircle size={28} className={styles.errorIcon} />
            <h2 className={styles.centerTitle}>Diagnostic page could not continue</h2>
            <p className={styles.centerText}>{sessionError || 'Something went wrong.'}</p>
            <div className={styles.actionRow}>
              <button className={styles.primaryButton} onClick={restartLanding}>
                Back to Start Page
              </button>
            </div>
          </section>
        )}
      </div>

      <MonitoringConsentModal {...consentModal} />
      {stream ? (
        <CameraMonitoringLayer
          stream={stream}
          captureVideoRef={captureVideoRef}
          hidden={isMobile}
        />
      ) : null}
    </div>
  );
}
