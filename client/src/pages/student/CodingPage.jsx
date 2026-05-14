import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../../components/Layout/StudentLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import usePracticeMonitoring from '../../hooks/usePracticeMonitoring';

const shellCard = {
  borderRadius: 24,
  border: '1px solid rgba(51,65,85,0.88)',
  background: 'linear-gradient(180deg, rgba(9,13,25,0.98), rgba(15,23,42,0.9))',
  boxShadow: '0 28px 60px rgba(2,6,23,0.35)',
};

const badgeStyle = (tone) => {
  if (tone === 'good') {
    return { background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)', color: '#86efac' };
  }
  if (tone === 'warn') {
    return { background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.28)', color: '#fcd34d' };
  }
  if (tone === 'bad') {
    return { background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.28)', color: '#fca5a5' };
  }
  return { background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)', color: '#c7d2fe' };
};

const verdictTone = (verdict) => {
  if (verdict === 'Accepted') return 'good';
  if (verdict === 'Wrong Answer') return 'warn';
  return 'bad';
};

const tabButtonStyle = (active) => ({
  padding: '0.75rem 1rem',
  borderRadius: 14,
  border: active ? '1px solid rgba(96,165,250,0.35)' : '1px solid rgba(51,65,85,0.9)',
  background: active ? 'rgba(37,99,235,0.18)' : 'rgba(15,23,42,0.7)',
  color: active ? '#eff6ff' : '#94a3b8',
  fontWeight: 700,
  cursor: 'pointer',
});

export default function CodingPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [discussionScope, setDiscussionScope] = useState('public');
  const [discussionThreads, setDiscussionThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [threadForm, setThreadForm] = useState({ title: '', body: '', tags: '' });
  const [replyBody, setReplyBody] = useState('');
  const [discussionSubmitting, setDiscussionSubmitting] = useState(false);

  const canUseInstitutionScope = !!user?.institutionId;

  const handleMonitoringStatusChange = useCallback((nextState) => {
    if (nextState.finalFlagged) {
      toast.error(
        `Monitoring flag raised for this coding session. Warning ${nextState.warningCount}/${nextState.warningLimit}.`
      );
      return;
    }

    if ((nextState.warningCount || 0) > 0) {
      toast(`Monitoring warning ${nextState.warningCount}/${nextState.warningLimit}`, {
        icon: '⚠️',
      });
    }
  }, []);

  const {
    finishMonitoring,
    isMonitoring,
    sessionState,
    trackBrowserEvent,
  } = usePracticeMonitoring({
    sessionType: 'coding',
    problemId,
    autoStart: true,
    mode: 'browser-only',
    institutionLinked: canUseInstitutionScope,
    sessionLabel: 'coding practice session',
    onStatusChange: handleMonitoringStatusChange,
  });

  const loadProblem = async () => {
    const { data } = await api.get(`/coding/${problemId}`);
    if (!data.success) throw new Error(data.message || 'Failed to load coding problem.');
    setProblem(data.data.problem);
    setWorkspace(data.data.workspace);
    setSubmissions(data.data.recentSubmissions || []);
    setCode(data.data.workspace?.draftCode || data.data.problem?.javaStarterCode || '');
  };

  const loadDiscussions = async (scope = discussionScope) => {
    setDiscussionLoading(true);
    try {
      const { data } = await api.get(`/coding/${problemId}/discussions?scope=${scope}`);
      if (data.success) {
        const nextThreads = data.data.threads || [];
        setDiscussionThreads(nextThreads);
        if (selectedThread) {
          const exists = nextThreads.find((thread) => thread._id === selectedThread._id);
          if (!exists) setSelectedThread(null);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load discussions.');
    } finally {
      setDiscussionLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        await loadProblem();
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'This coding challenge is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [problemId]);

  useEffect(() => {
    if (activeTab === 'discussion' && problem) {
      loadDiscussions(discussionScope);
    }
  }, [activeTab, discussionScope, problem]);

  useEffect(() => {
    let copyThrottleTimer;

    const onVisibility = () => {
      if (document.hidden && isMonitoring) {
        trackBrowserEvent('tabSwitches');
        toast('Do not switch tabs during coding practice.', { icon: '⚠️' });
      }
    };

    const onCopy = () => {
      if (!isMonitoring || copyThrottleTimer) return;
      trackBrowserEvent('copyAttempts');
      copyThrottleTimer = window.setTimeout(() => {
        copyThrottleTimer = null;
      }, 1000);
    };

    const onBlur = () => {
      if (isMonitoring) {
        trackBrowserEvent('windowBlurCount');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('copy', onCopy);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('copy', onCopy);
      window.removeEventListener('blur', onBlur);
      if (copyThrottleTimer) window.clearTimeout(copyThrottleTimer);
    };
  }, [isMonitoring, trackBrowserEvent]);

  useEffect(() => () => {
    finishMonitoring(
      {
        problemId,
      },
      { keepalive: true }
    );
  }, [finishMonitoring, problemId]);

  const visibleTests = useMemo(
    () => (problem?.testCases || []).filter((testCase) => !testCase.isHidden),
    [problem]
  );

  const saveDraft = async () => {
    if (!problem) return;
    setSavingDraft(true);
    try {
      const { data } = await api.put(`/coding/${problemId}/workspace`, {
        draftCode: code,
      });
      if (data.success) {
        setWorkspace(data.data.workspace);
        toast.success('Draft saved');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const { data } = await api.post(`/coding/${problemId}/run`, { code });
      if (data.success) {
        setResult(data.data);
        toast.success(data.data.verdict || 'Sample run finished');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Run failed.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/coding/${problemId}/submit`, { code });
      if (data.success) {
        setResult(data.data);
        toast.success(data.message || data.data.verdict || 'Submission complete');
        await loadProblem();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const openThread = async (threadId) => {
    try {
      const { data } = await api.get(`/coding/discussions/${threadId}`);
      if (data.success) {
        setSelectedThread(data.data.thread);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load thread.');
    }
  };

  const createThread = async () => {
    if (!threadForm.title.trim() || !threadForm.body.trim()) {
      toast.error('Add a title and your question first.');
      return;
    }

    setDiscussionSubmitting(true);
    try {
      const { data } = await api.post(`/coding/${problemId}/discussions`, {
        scope: discussionScope,
        title: threadForm.title,
        body: threadForm.body,
        tags: threadForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      if (data.success) {
        setThreadForm({ title: '', body: '', tags: '' });
        await loadDiscussions(discussionScope);
        setSelectedThread(data.data.thread);
        toast.success('Discussion posted');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post discussion.');
    } finally {
      setDiscussionSubmitting(false);
    }
  };

  const replyToThread = async () => {
    if (!selectedThread || !replyBody.trim()) return;
    setDiscussionSubmitting(true);
    try {
      const { data } = await api.post(`/coding/discussions/${selectedThread._id}/replies`, {
        body: replyBody,
      });
      if (data.success) {
        setReplyBody('');
        setSelectedThread(data.data.thread);
        await loadDiscussions(discussionScope);
        toast.success('Reply added');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add reply.');
    } finally {
      setDiscussionSubmitting(false);
    }
  };

  const toggleResolveThread = async () => {
    if (!selectedThread) return;
    try {
      const { data } = await api.patch(`/coding/discussions/${selectedThread._id}/resolve`);
      if (data.success) {
        setSelectedThread(data.data.thread);
        await loadDiscussions(discussionScope);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update thread.');
    }
  };

  const monitoringBadge = isMonitoring ? (
    <span style={{ ...badgeStyle('good'), padding: '0.6rem 0.85rem', borderRadius: 999 }}>
      Camera Active • Warnings {sessionState?.warningCount || 0}/{sessionState?.warningLimit || (canUseInstitutionScope ? 2 : 3)}
      {' '}Local browser-warning only. Do not switch tabs.
    </span>
  ) : null;


  if (loading) {
    return (
      <StudentLayout>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem', color: '#94a3b8' }}>
          Loading coding workspace...
        </div>
      </StudentLayout>
    );
  }

  if (error || !problem) {
    return (
      <StudentLayout>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ ...shellCard, padding: '1.5rem', color: '#fca5a5' }}>
            <p style={{ marginTop: 0 }}>{error || 'Coding problem unavailable.'}</p>
            <button
              onClick={() => navigate('/coding')}
              style={{
                border: 'none',
                borderRadius: 14,
                padding: '0.9rem 1.1rem',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Back to Coding Hub
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const statement = problem.problemStatement || problem.description;

  return (
    <StudentLayout>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '1.25rem', display: 'grid', gap: '1rem' }}>
        <header style={{ ...shellCard, padding: '1.25rem 1.35rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'start' }}>
            <div>
              <button
                onClick={() => navigate('/coding')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, marginBottom: '0.6rem', fontWeight: 700 }}
              >
                Back to Coding Hub
              </button>
              <h1 style={{ color: '#f8fafc', margin: 0, fontSize: '2rem' }}>{problem.title}</h1>
              <p style={{ color: '#94a3b8', margin: '0.55rem 0 0', fontSize: '0.95rem' }}>
                {problem.topicId?.title || 'Topic'} • {problem.moduleId?.title || 'Module'} • {problem.difficulty}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ ...badgeStyle('info'), padding: '0.6rem 0.85rem', borderRadius: 999 }}>{problem.timeLimit}s limit</span>
              <span style={{ ...badgeStyle('info'), padding: '0.6rem 0.85rem', borderRadius: 999 }}>{problem.points || 0} points</span>
              {workspace?.solved && <span style={{ ...badgeStyle('good'), padding: '0.6rem 0.85rem', borderRadius: 999 }}>Solved</span>}
              {monitoringBadge}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
            <div style={{ padding: '0.95rem', borderRadius: 18, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Language</div>
              <div style={{ color: '#e2e8f0', fontWeight: 800, marginTop: '0.35rem' }}>Java</div>
            </div>
            <div style={{ padding: '0.95rem', borderRadius: 18, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Samples</div>
              <div style={{ color: '#e2e8f0', fontWeight: 800, marginTop: '0.35rem' }}>{visibleTests.length}</div>
            </div>
            <div style={{ padding: '0.95rem', borderRadius: 18, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Runs</div>
              <div style={{ color: '#e2e8f0', fontWeight: 800, marginTop: '0.35rem' }}>{submissions.length}</div>
            </div>
            <div style={{ padding: '0.95rem', borderRadius: 18, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workspace</div>
              <div style={{ color: '#e2e8f0', fontWeight: 800, marginTop: '0.35rem' }}>{workspace?.acceptedAt ? 'Accepted' : 'In Progress'}</div>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 0.94fr) minmax(460px, 1.06fr)', gap: '1rem', alignItems: 'start' }}>
          <section style={{ ...shellCard, padding: '1rem', display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {[
                ['description', 'Description'],
                ['samples', 'Samples'],
                ['hints', 'Hints'],
                ['submissions', 'Submissions'],
                ['discussion', 'Discussion'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={tabButtonStyle(activeTab === key)}>
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <h2 style={{ color: '#f8fafc', marginTop: 0 }}>Problem Statement</h2>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 0 }}>{statement}</p>
                </div>
                {problem.constraints && (
                  <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                    <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Constraints</h3>
                    <pre style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{problem.constraints}</pre>
                  </div>
                )}
                {(problem.inputFormat || problem.outputFormat) && (
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {problem.inputFormat && (
                      <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                        <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Input Format</h3>
                        <pre style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{problem.inputFormat}</pre>
                      </div>
                    )}
                    {problem.outputFormat && (
                      <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                        <h3 style={{ color: '#f8fafc', marginTop: 0 }}>Output Format</h3>
                        <pre style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{problem.outputFormat}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'samples' && (
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {visibleTests.length === 0 ? (
                  <p style={{ color: '#94a3b8', margin: 0 }}>No visible sample tests available.</p>
                ) : visibleTests.map((testCase, index) => (
                  <div key={`${index}-${testCase.input}`} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: '0.65rem' }}>Sample Case {index + 1}</div>
                    <pre style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>
{`Input:
${testCase.input || '(empty)'}

Expected Output:
${testCase.expectedOutput || '(empty)'}`}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hints' && (
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {(problem.hints || []).length === 0 ? (
                  <p style={{ color: '#94a3b8', margin: 0 }}>No hints are attached to this problem yet.</p>
                ) : problem.hints.map((hint, index) => (
                  <div key={hint} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: '0.5rem' }}>Hint {index + 1}</div>
                    <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.65 }}>{hint}</p>
                  </div>
                ))}
                {(problem.solutionApproach || problem.timeComplexity || problem.spaceComplexity) && (
                  <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: '0.55rem' }}>Approach Notes</div>
                    {problem.solutionApproach && <p style={{ margin: '0 0 0.6rem', color: '#cbd5e1', lineHeight: 1.65 }}>{problem.solutionApproach}</p>}
                    {problem.timeComplexity && <p style={{ margin: '0 0 0.35rem', color: '#cbd5e1' }}>Time: {problem.timeComplexity}</p>}
                    {problem.spaceComplexity && <p style={{ margin: 0, color: '#cbd5e1' }}>Space: {problem.spaceComplexity}</p>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {submissions.length === 0 ? (
                  <p style={{ color: '#94a3b8', margin: 0 }}>No submissions yet.</p>
                ) : submissions.map((submission) => (
                  <div key={submission._id} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ ...badgeStyle(verdictTone(submission.verdict)), borderRadius: 999, padding: '0.35rem 0.7rem', fontWeight: 800 }}>
                        {submission.verdict}
                      </span>
                      <span style={{ color: '#94a3b8' }}>{new Date(submission.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ color: '#cbd5e1', margin: '0.75rem 0 0' }}>
                      {submission.mode === 'submit' ? 'Hidden tests' : 'Visible tests'}: {submission.passedVisibleCount}/{submission.totalVisibleCount}
                      {submission.mode === 'submit' ? ` • Hidden ${submission.passedHiddenCount}/${submission.totalHiddenCount}` : ''}
                      {' '}• {submission.executionTimeMs || 0} ms
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setDiscussionScope('public')} style={tabButtonStyle(discussionScope === 'public')}>Public Discussion</button>
                  {canUseInstitutionScope && (
                    <button onClick={() => setDiscussionScope('institution')} style={tabButtonStyle(discussionScope === 'institution')}>Institution Circle</button>
                  )}
                </div>

                <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)', display: 'grid', gap: '0.75rem' }}>
                  <div style={{ color: '#f8fafc', fontWeight: 800 }}>Ask a Question</div>
                  <input
                    value={threadForm.title}
                    onChange={(event) => setThreadForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Short thread title"
                    style={{ borderRadius: 14, border: '1px solid rgba(71,85,105,0.95)', background: '#020617', color: '#e2e8f0', padding: '0.85rem 0.95rem', outline: 'none' }}
                  />
                  <textarea
                    value={threadForm.body}
                    onChange={(event) => setThreadForm((prev) => ({ ...prev, body: event.target.value }))}
                    placeholder={discussionScope === 'institution' ? 'Only learners from your institution can see this thread.' : 'Describe the bug, idea, or doubt clearly.'}
                    style={{ minHeight: 110, resize: 'vertical', borderRadius: 14, border: '1px solid rgba(71,85,105,0.95)', background: '#020617', color: '#e2e8f0', padding: '0.85rem 0.95rem', outline: 'none' }}
                  />
                  <input
                    value={threadForm.tags}
                    onChange={(event) => setThreadForm((prev) => ({ ...prev, tags: event.target.value }))}
                    placeholder="Tags, comma separated"
                    style={{ borderRadius: 14, border: '1px solid rgba(71,85,105,0.95)', background: '#020617', color: '#e2e8f0', padding: '0.85rem 0.95rem', outline: 'none' }}
                  />
                  <button
                    onClick={createThread}
                    disabled={discussionSubmitting}
                    style={{ border: 'none', borderRadius: 14, padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    {discussionSubmitting ? 'Posting...' : 'Post Discussion'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.82fr) minmax(0, 1.18fr)', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {discussionLoading ? (
                      <div style={{ color: '#94a3b8' }}>Loading discussions...</div>
                    ) : discussionThreads.length === 0 ? (
                      <div style={{ color: '#94a3b8' }}>No threads yet in this space.</div>
                    ) : discussionThreads.map((thread) => (
                      <button
                        key={thread._id}
                        onClick={() => openThread(thread._id)}
                        style={{
                          textAlign: 'left',
                          borderRadius: 16,
                          border: selectedThread?._id === thread._id ? '1px solid rgba(96,165,250,0.35)' : '1px solid rgba(51,65,85,0.9)',
                          background: selectedThread?._id === thread._id ? 'rgba(30,64,175,0.16)' : 'rgba(15,23,42,0.78)',
                          color: '#e2e8f0',
                          padding: '0.95rem',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
                          <strong style={{ color: '#f8fafc' }}>{thread.title}</strong>
                          {thread.resolved && <span style={{ ...badgeStyle('good'), borderRadius: 999, padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}>Resolved</span>}
                        </div>
                        <p style={{ color: '#94a3b8', margin: '0.45rem 0 0', lineHeight: 1.5 }}>
                          {thread.body.slice(0, 120)}{thread.body.length > 120 ? '...' : ''}
                        </p>
                        <div style={{ color: '#64748b', marginTop: '0.55rem', fontSize: '0.82rem' }}>
                          {thread.author?.name} • {thread.replyCount} replies
                        </div>
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(51,65,85,0.9)', minHeight: 260 }}>
                    {!selectedThread ? (
                      <div style={{ color: '#94a3b8' }}>Select a thread to read the discussion.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.9rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <h3 style={{ color: '#f8fafc', margin: 0 }}>{selectedThread.title}</h3>
                            {String(selectedThread.author?._id) === String(user?._id) && (
                              <button onClick={toggleResolveThread} style={{ ...tabButtonStyle(false), color: '#e2e8f0' }}>
                                {selectedThread.resolved ? 'Mark Open' : 'Mark Resolved'}
                              </button>
                            )}
                          </div>
                          <p style={{ color: '#cbd5e1', lineHeight: 1.65 }}>{selectedThread.body}</p>
                          <p style={{ color: '#64748b', margin: 0 }}>{selectedThread.author?.name}</p>
                        </div>

                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {(selectedThread.replies || []).map((reply) => (
                            <div key={reply._id} style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(2,6,23,0.65)', border: '1px solid rgba(51,65,85,0.85)' }}>
                              <div style={{ color: '#f8fafc', fontWeight: 700 }}>{reply.author?.name}</div>
                              <p style={{ color: '#cbd5e1', margin: '0.45rem 0 0', lineHeight: 1.6 }}>{reply.body}</p>
                            </div>
                          ))}
                        </div>

                        <textarea
                          value={replyBody}
                          onChange={(event) => setReplyBody(event.target.value)}
                          placeholder="Share your suggestion or explanation"
                          style={{ minHeight: 90, resize: 'vertical', borderRadius: 14, border: '1px solid rgba(71,85,105,0.95)', background: '#020617', color: '#e2e8f0', padding: '0.85rem 0.95rem', outline: 'none' }}
                        />
                        <button
                          onClick={replyToThread}
                          disabled={discussionSubmitting || !replyBody.trim()}
                          style={{ border: 'none', borderRadius: 14, padding: '0.85rem 1rem', background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                        >
                          {discussionSubmitting ? 'Replying...' : 'Post Reply'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section style={{ display: 'grid', gap: '1rem', position: 'sticky', top: 16 }}>
            <div style={{ ...shellCard, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Editor</div>
                  <h2 style={{ color: '#f8fafc', margin: '0.2rem 0 0' }}>Java Workspace</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button onClick={saveDraft} disabled={savingDraft} style={{ ...tabButtonStyle(false), color: '#e2e8f0' }}>
                    {savingDraft ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button onClick={handleRun} disabled={running} style={{ border: 'none', borderRadius: 14, padding: '0.8rem 1rem', background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                    {running ? 'Running...' : 'Run'}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting} style={{ border: 'none', borderRadius: 14, padding: '0.8rem 1rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                disabled={false}
                style={{
                  width: '100%',
                  minHeight: 470,
                  resize: 'vertical',
                  borderRadius: 18,
                  border: '1px solid rgba(51,65,85,0.95)',
                  background: '#020617',
                  color: '#e2e8f0',
                  padding: '1rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  outline: 'none',
                  opacity: 1,
                }}
              />
            </div>

            <div style={{ ...shellCard, padding: '1rem', display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <h2 style={{ color: '#f8fafc', margin: 0 }}>Verdict</h2>
                {result?.verdict && (
                  <span style={{ ...badgeStyle(verdictTone(result.verdict)), borderRadius: 999, padding: '0.4rem 0.7rem', fontWeight: 800 }}>
                    {result.verdict}
                  </span>
                )}
              </div>

              {!result ? (
                <p style={{ color: '#94a3b8', margin: 0 }}>
                  Run the visible sample cases first, then submit against the hidden test suite.
                </p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                    <div style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
                      <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase' }}>Execution</div>
                      <div style={{ color: '#f8fafc', fontWeight: 800, marginTop: '0.35rem' }}>{result.executionTimeMs || 0} ms</div>
                    </div>
                    <div style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
                      <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase' }}>Visible</div>
                      <div style={{ color: '#f8fafc', fontWeight: 800, marginTop: '0.35rem' }}>{result.passedVisibleCount || 0}/{result.totalVisibleCount || 0}</div>
                    </div>
                    <div style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
                      <div style={{ color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase' }}>Hidden</div>
                      <div style={{ color: '#f8fafc', fontWeight: 800, marginTop: '0.35rem' }}>{result.passedHiddenCount || 0}/{result.totalHiddenCount || 0}</div>
                    </div>
                  </div>

                  {result.compileOutput && (
                    <div style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: '0.45rem' }}>Compiler Output</div>
                      <pre style={{ margin: 0, color: '#fecaca', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{result.compileOutput}</pre>
                    </div>
                  )}

                  {result.runtimeOutput && (
                    <div style={{ padding: '0.9rem', borderRadius: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.9)' }}>
                      <div style={{ color: '#f8fafc', fontWeight: 800, marginBottom: '0.45rem' }}>Runtime Output</div>
                      <pre style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{result.runtimeOutput}</pre>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {(result.testResults || []).map((testCase, index) => (
                      <div key={`${index}-${testCase.runtimeMs || index}`} style={{ padding: '0.9rem', borderRadius: 16, background: testCase.passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${testCase.passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#f8fafc' }}>Case {index + 1} {testCase.isHidden ? '(Hidden)' : '(Visible)'}</strong>
                          <span style={{ color: testCase.passed ? '#86efac' : '#fca5a5', fontWeight: 800 }}>{testCase.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                        {!testCase.isHidden && (
                          <pre style={{ margin: '0.65rem 0 0', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>
{`Input: ${testCase.input || '(empty)'}
Expected: ${testCase.expectedOutput || '(empty)'}
Actual: ${testCase.actualOutput || '(empty)'}`}
                          </pre>
                        )}
                        {testCase.error && <pre style={{ margin: '0.65rem 0 0', color: '#fecaca', whiteSpace: 'pre-wrap', fontFamily: 'Consolas, monospace' }}>{testCase.error}</pre>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
}
