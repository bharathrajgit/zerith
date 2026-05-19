import { useState, useEffect } from 'react';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import api from '../../services/api';
import { Download, FileText, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadCsv } from '../../utils/downloadCsv';
import styles from './ReportsPage.module.css';

export default function ReportsPage() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [malpractice, setMalpractice] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [
          overviewResponse,
          departmentResponse,
          studentResponse,
          atRiskResponse,
          malpracticeResponse,
          predictionResponse,
        ] = await Promise.all([
          api.get('/institution/analytics/overview'),
          api.get('/institution/analytics/departments'),
          api.get('/institution/students?page=1&limit=1000'),
          api.get('/institution/analytics/at-risk'),
          api.get('/institution/analytics/malpractice'),
          api.get('/institution/analytics/placement-prediction'),
        ]);

        if (overviewResponse.data.success) setOverview(overviewResponse.data.data);
        if (departmentResponse.data.success) setDepartments(departmentResponse.data.data || []);
        if (studentResponse.data.success) setStudents(studentResponse.data.data.students || []);
        if (atRiskResponse.data.success) setAtRisk(atRiskResponse.data.data || []);
        if (malpracticeResponse.data.success) {
          setMalpractice([
            ...(malpracticeResponse.data.data.high || []),
            ...(malpracticeResponse.data.data.medium || []),
            ...(malpracticeResponse.data.data.low || []),
          ]);
        }
        if (predictionResponse.data.success) setPrediction(predictionResponse.data.data);
      } catch (error) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const exportRows = {
    students: students.map((student) => ({
      name: student.name,
      email: student.email,
      departmentCode: student.departmentCode || '',
      currentLevel: student.currentLevel || 'Beginner',
      placementReadiness: student.placementReadiness || 0,
      studentSource: student.studentSource || 'self_registered',
      diagnosticCompleted: student.diagnosticCompleted ? 'Yes' : 'No',
    })),
    departments: departments.map((department) => ({
      name: department.name,
      code: department.code,
      totalStudents: department.totalStudents || 0,
      activeToday: department.activeToday || 0,
      activeThisWeek: department.activeThisWeek || 0,
      atRiskStudents: department.atRiskStudents || 0,
      avgPlacementReadiness: department.avgPlacementReadiness || 0,
    })),
    atRisk: atRisk.map((student) => ({
      name: student.name,
      email: student.email,
      severity: student.severity,
      placementReadiness: student.placementReadiness || 0,
      reasons: (student.reasons || []).join('; '),
    })),
    malpractice: malpractice.map((log) => ({
      studentName: log.userId?.name || 'Unknown',
      riskLevel: log.riskLevel,
      status: log.status || 'pending',
      flags: (log.flags || []).join('; '),
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : '',
    })),
    prediction: (prediction?.byDepartment || []).map((department) => ({
      department: department.name,
      code: department.code,
      readyNow: department.readyNow,
      within30: department.within30,
      within60: department.within60,
      within90: department.within90,
      needsMore: department.needsMore,
      totalStudents: department.totalStudents,
    })),
  };

  const handleExport = (key, filename) => {
    if (!downloadCsv(exportRows[key], filename)) {
      toast.error('No data available for export');
    }
  };

  if (loading) {
    return (
      <InstitutionLayout>
        <div className={styles.page}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonSection} />
          <div className={styles.skeletonSection} />
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Reports</h1>
            <p className={styles.subtitle}>Download live institution reports from current student and department data.</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => handleExport('students', 'institution-students-report.csv')}>
            <Download size={16} /> Export Student Report
          </button>
        </header>

        <div className={styles.summaryGrid}>
          <SummaryCard icon={<Users size={18} />} label="Students" value={overview?.totalStudents || 0} />
          <SummaryCard icon={<FileText size={18} />} label="Departments" value={departments.length} />
          <SummaryCard icon={<Shield size={18} />} label="At Risk" value={atRisk.length} />
          <SummaryCard icon={<Shield size={18} />} label="Malpractice Alerts" value={malpractice.length} />
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Department Summary</h2>
              <p className={styles.sectionCopy}>Readiness, activity, and risk rollups per department.</p>
            </div>
            <button className={styles.outlineBtn} onClick={() => handleExport('departments', 'department-summary-report.csv')}>
              <Download size={14} /> Export
            </button>
          </div>
          <ReportTable
            headers={['Department', 'Students', 'Active Today', 'Active This Week', 'At Risk', 'Avg Readiness']}
            rows={departments.map((department) => [
              `${department.name} (${department.code})`,
              department.totalStudents || 0,
              department.activeToday || 0,
              department.activeThisWeek || 0,
              department.atRiskStudents || 0,
              `${department.avgPlacementReadiness || 0}%`,
            ])}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>At-Risk Students</h2>
              <p className={styles.sectionCopy}>Students needing immediate intervention based on readiness, inactivity, or repeated failures.</p>
            </div>
            <button className={styles.outlineBtn} onClick={() => handleExport('atRisk', 'at-risk-report.csv')}>
              <Download size={14} /> Export
            </button>
          </div>
          <ReportTable
            headers={['Name', 'Email', 'Severity', 'Readiness', 'Reasons']}
            rows={atRisk.map((student) => [
              student.name,
              student.email,
              student.severity,
              `${student.placementReadiness || 0}%`,
              (student.reasons || []).join(', '),
            ])}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Malpractice Alerts</h2>
              <p className={styles.sectionCopy}>Most recent proctoring and suspicious behavior alerts for institution-linked assessments.</p>
            </div>
            <button className={styles.outlineBtn} onClick={() => handleExport('malpractice', 'malpractice-report.csv')}>
              <Download size={14} /> Export
            </button>
          </div>
          <ReportTable
            headers={['Student', 'Risk', 'Status', 'Flags', 'Created']}
            rows={malpractice.map((log) => [
              log.userId?.name || 'Unknown',
              log.riskLevel,
              log.status || 'pending',
              (log.flags || []).join(', '),
              log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '-',
            ])}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Placement Prediction</h2>
              <p className={styles.sectionCopy}>Department-level prediction counts based only on current backend activity and readiness data.</p>
            </div>
            <button className={styles.outlineBtn} onClick={() => handleExport('prediction', 'placement-prediction-report.csv')}>
              <Download size={14} /> Export
            </button>
          </div>
          <ReportTable
            headers={['Department', 'Ready Now', 'Within 30d', 'Within 60d', 'Within 90d', 'Needs More']}
            rows={(prediction?.byDepartment || []).map((department) => [
              `${department.name} (${department.code})`,
              department.readyNow,
              department.within30,
              department.within60,
              department.within90,
              department.needsMore,
            ])}
          />
        </section>
      </div>
    </InstitutionLayout>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryIcon}>{icon}</div>
      <div>
        <p className={styles.summaryLabel}>{label}</p>
        <p className={styles.summaryValue}>{value}</p>
      </div>
    </div>
  );
}

function ReportTable({ headers, rows }) {
  if (!rows.length) {
    return <div className={styles.emptyState}>No data available for this report yet.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => <td key={`${row[0]}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
