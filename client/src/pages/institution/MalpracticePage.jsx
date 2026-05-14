// client/src/pages/institution/MalpracticePage.jsx
import { useState, useEffect } from 'react';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import styles from './MalpracticePage.module.css';

const FLAG_LABELS = {
  TAB_SWITCH: { icon: '🔀', label: 'Tab switched' },
  COPY_ATTEMPT: { icon: '📋', label: 'Copy detected' },
  WINDOW_BLUR: { icon: '👁', label: 'Left window' },
  SPEED: { icon: '⚡', label: 'Too fast' },
  TIMING_ANOMALY: { icon: '⏱', label: 'Suspicious timing' },
  PATTERN_SHIFT: { icon: '📊', label: 'Pattern shift' },
  MULTIPLE_FACES: { icon: 'ðŸ‘¥', label: 'Multiple faces' },
  HEAD_POSE_AWAY: { icon: 'ðŸ§­', label: 'Head turned away' },
  GAZE_AWAY: { icon: 'ðŸ‘€', label: 'Looking away' },
  FACE_MISSING: { icon: 'ðŸ“·', label: 'Face missing' },
};

export default function MalpracticePage() {
  const [logs, setLogs] = useState({ high: [], medium: [], low: [] });
  const [summary, setSummary] = useState({ total: 0, highCount: 0, mediumCount: 0, lowCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/institution/analytics/malpractice');
        if (data.success) {
          setLogs({ high: data.data.high || [], medium: data.data.medium || [], low: data.data.low || [] });
          setSummary(data.data.summary || { total: 0, highCount: 0, mediumCount: 0, lowCount: 0 });
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const allLogs = [...logs.high, ...logs.medium, ...logs.low];
  const filteredLogs = filter === 'All' ? allLogs : allLogs.filter((l) => l.riskLevel === filter.toUpperCase() || l.status === filter);

  const handleStatusUpdate = async (logId, newStatus) => {
    try {
      const { data } = await api.patch(`/institution/analytics/malpractice/${logId}/status`, {
        status: newStatus,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to update malpractice status');
      }

      const updateList = (list) => list.map((l) => (l._id === logId ? { ...l, ...data.data } : l));
      setLogs((prev) => ({ high: updateList(prev.high), medium: updateList(prev.medium), low: updateList(prev.low) }));
      if (selectedLog?._id === logId) setSelectedLog({ ...selectedLog, ...data.data });
      toast.success(`Marked as ${newStatus}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update malpractice status');
    }
  };

  if (loading) {
    return (
      <InstitutionLayout>
        <div className={styles.page}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <h1 className={styles.title}>🛡️ Malpractice Reports</h1>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statRed}`}><span className={styles.statValue}>{summary.highCount}</span><span className={styles.statLabel}>High Risk</span></div>
          <div className={`${styles.statCard} ${styles.statAmber}`}><span className={styles.statValue}>{summary.mediumCount}</span><span className={styles.statLabel}>Medium Risk</span></div>
          <div className={`${styles.statCard} ${styles.statGreen}`}><span className={styles.statValue}>{allLogs.filter((l) => l.status === 'reviewed' || l.status === 'dismissed').length}</span><span className={styles.statLabel}>Resolved</span></div>
        </div>

        {/* Filter tabs */}
        <div className={styles.filterRow}>
          {['All', 'HIGH', 'MEDIUM', 'pending', 'reviewed', 'dismissed', 'confirmed'].map((f) => (
            <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`} onClick={() => setFilter(f)}>
              {f === 'pending' ? 'Pending' : f === 'reviewed' ? 'Reviewed' : f === 'dismissed' ? 'Dismissed' : f === 'confirmed' ? 'Confirmed' : f === 'All' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Alert cards */}
        {filteredLogs.length === 0 ? (
          <div className={styles.emptyState}>✅ No alerts match this filter.</div>
        ) : (
          <div className={styles.alertList}>
            {filteredLogs.map((log) => (
              <div key={log._id} className={`${styles.alertCard} ${log.riskLevel === 'HIGH' ? styles.alertHigh : log.riskLevel === 'MEDIUM' ? styles.alertMedium : styles.alertLow}`}>
                <div className={styles.alertBody} onClick={() => setSelectedLog(log)}>
                  <div className={styles.alertHeader}>
                    <span className={styles.alertStudent}>{log.userId?.name || 'Unknown Student'}</span>
                    <span className={`${styles.riskBadge} ${log.riskLevel === 'HIGH' ? styles.riskHigh : log.riskLevel === 'MEDIUM' ? styles.riskMedium : styles.riskLow}`}>{log.riskLevel}</span>
                  </div>
                  <div className={styles.alertFlags}>
                    {log.flags?.map((f) => (
                      <span key={f} className={styles.flagTag}>{FLAG_LABELS[f]?.icon || '•'} {FLAG_LABELS[f]?.label || f}</span>
                    ))}
                  </div>
                  <div className={styles.alertMeta}>
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                    {log.warningCount > 0 && <span>Warnings: {log.warningCount}/{log.warningLimit || 0}</span>}
                    {log.sourceFlags?.length > 0 && <span>{log.sourceFlags.join(', ')}</span>}
                    {log.similarityScore > 0.5 && <span className={styles.similarityScore}>Similarity: {(log.similarityScore * 100).toFixed(0)}%</span>}
                  </div>
                </div>
                <div className={styles.alertActions}>
                  <button onClick={() => handleStatusUpdate(log._id, 'reviewed')} className={styles.reviewBtn}><CheckCircle size={14} /> Review</button>
                  <button onClick={() => handleStatusUpdate(log._id, 'dismissed')} className={styles.dismissBtn}><XCircle size={14} /> Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedLog && (
          <div className={styles.overlay} onClick={() => setSelectedLog(null)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}><XCircle size={18} /></button>
              <h3>Session Detail</h3>
              <div className={styles.detailGrid}>
                <span>Student:</span><span>{selectedLog.userId?.name || 'Unknown'}</span>
                <span>Risk Level:</span><span className={`${styles.riskBadge} ${selectedLog.riskLevel === 'HIGH' ? styles.riskHigh : styles.riskMedium}`}>{selectedLog.riskLevel}</span>
                <span>Risk Score:</span>
                <div className={styles.riskScoreBar}>
                  <div className={styles.riskScoreFill} style={{ width: `${(selectedLog.riskScore || 0) * 100}%`, backgroundColor: (selectedLog.riskScore || 0) >= 0.6 ? '#ef4444' : '#f59e0b' }} />
                  <span>{((selectedLog.riskScore || 0) * 100).toFixed(0)}%</span>
                </div>
                <span>Tab Switches:</span><span>{selectedLog.sessionData?.tabSwitches || 0}</span>
                <span>Copy Attempts:</span><span>{selectedLog.sessionData?.copyAttempts || 0}</span>
                <span>Window Blurs:</span><span>{selectedLog.sessionData?.windowBlurCount || 0}</span>
                <span>Avg Answer Time:</span><span>{selectedLog.sessionData?.avgAnswerTime?.toFixed(1) || 'N/A'}s</span>
                <span>Timing StdDev:</span><span>{selectedLog.sessionData?.timingStdDev?.toFixed(1) || 'N/A'}s</span>
                <span>Flags:</span><span>{selectedLog.flags?.join(', ') || 'None'}</span>
                <span>Reasons:</span><span className={styles.reasonsText}>{selectedLog.reasons?.join('; ') || 'N/A'}</span>
                <span>Warnings:</span><span>{selectedLog.warningCount || 0}/{selectedLog.warningLimit || 0}</span>
                <span>Sources:</span><span>{selectedLog.sourceFlags?.join(', ') || 'N/A'}</span>
                <span>Face Count:</span><span>{selectedLog.visionFindings?.faceCount ?? 'N/A'}</span>
                <span>Looking Away:</span><span>{selectedLog.visionFindings?.gazeAway ? 'Yes' : 'No'}</span>
                <span>Head Away:</span><span>{selectedLog.visionFindings?.headPoseAway ? 'Yes' : 'No'}</span>
                <span>Multiple Faces:</span><span>{selectedLog.visionFindings?.multipleFaces ? 'Yes' : 'No'}</span>
                <span>Face Missing:</span><span>{selectedLog.visionFindings?.faceMissing ? 'Yes' : 'No'}</span>
              </div>
              <p className={styles.recommendation}>
                {selectedLog.riskLevel === 'HIGH'
                  ? '⚠️ Strongly recommend investigation. Multiple suspicious behaviors detected.'
                  : selectedLog.riskLevel === 'MEDIUM'
                  ? 'Monitor this student. Some unusual patterns present.'
                  : 'Minor irregularities. Likely benign.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </InstitutionLayout>
  );
}
