import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import api from '../../services/api';
import {
  Search, Plus, Upload, Download, AlertCircle, X, Check, Eye, Key,
  ArrowRightLeft, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadCsv } from '../../utils/downloadCsv';
import styles from './StudentsPage.module.css';

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    departmentCode: searchParams.get('dept') || searchParams.get('departmentCode') || '',
    level: searchParams.get('level') || '',
    status: searchParams.get('status') || '',
  }));
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [profileSlideover, setProfileSlideover] = useState({ open: false, studentId: null });
  const [resetConfirm, setResetConfirm] = useState(null);
  const [resetResult, setResetResult] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  const syncQuery = useCallback((nextFilters) => {
    const nextParams = new URLSearchParams();
    if (nextFilters.search) nextParams.set('search', nextFilters.search);
    if (nextFilters.departmentCode) nextParams.set('departmentCode', nextFilters.departmentCode);
    if (nextFilters.level) nextParams.set('level', nextFilters.level);
    if (nextFilters.status) nextParams.set('status', nextFilters.status);
    setSearchParams(nextParams, { replace: true });
  }, [setSearchParams]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page);
      params.set('limit', 100);
      if (filters.search) params.set('search', filters.search);
      if (filters.departmentCode) params.set('departmentCode', filters.departmentCode);
      if (filters.level) params.set('level', filters.level);

      const { data } = await api.get(`/institution/students?${params.toString()}`);
      if (data.success) {
        let list = data.data.students || [];
        let nextPagination = { total: data.data.total, page: data.data.page, pages: data.data.pages };
        if (filters.status) {
          list = list.filter((student) => {
            if (filters.status === 'Active') return activeInDays(student.lastActiveAt, 7);
            if (filters.status === 'Inactive') return !activeInDays(student.lastActiveAt, 7);
            if (filters.status === 'Pending Diagnostic') return !student.diagnosticCompleted;
            return true;
          });
          nextPagination = { total: list.length, page: 1, pages: 1 };
        }
        setStudents(list);
        setPagination(nextPagination);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  const fetchDepartments = useCallback(() => {
    api.get('/institution/departments')
      .then(({ data }) => {
        if (data.success) setDepartments(data.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [filters.search, filters.departmentCode, filters.level, filters.status]);

  useEffect(() => {
    syncQuery(filters);
  }, [filters, syncQuery]);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedStudents = useMemo(() => {
    const list = [...students];
    list.sort((left, right) => {
      let leftValue = left[sortField] || '';
      let rightValue = right[sortField] || '';
      if (sortField === 'name') {
        leftValue = String(leftValue).toLowerCase();
        rightValue = String(rightValue).toLowerCase();
        return sortAsc ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue);
      }
      if (sortField === 'placementReadiness') {
        return sortAsc ? (leftValue || 0) - (rightValue || 0) : (rightValue || 0) - (leftValue || 0);
      }
      return 0;
    });
    return list;
  }, [students, sortAsc, sortField]);

  const handleExportStudents = () => {
    const rows = sortedStudents.map((student) => ({
      name: student.name,
      email: student.email,
      departmentCode: student.departmentCode || '',
      currentLevel: student.currentLevel || 'Beginner',
      placementReadiness: student.placementReadiness || 0,
      studentSource: student.studentSource || 'self_registered',
      status: student.diagnosticCompleted ? (activeInDays(student.lastActiveAt, 7) ? 'Active' : 'Inactive') : 'Pending Diagnostic',
      lastActiveAt: student.lastActiveAt ? new Date(student.lastActiveAt).toISOString() : '',
    }));

    if (!downloadCsv(rows, 'institution-students.csv')) {
      toast.error('No student data available to export');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/institution/students/${id}`);
      toast.success('Student removed');
      setRemoveConfirm(null);
      fetchStudents();
      fetchDepartments();
    } catch {
      toast.error('Failed to remove student');
    }
  };

  const handleReset = async (id) => {
    try {
      const { data } = await api.put(`/institution/students/${id}/reset-password`);
      setResetResult({
        studentId: id,
        newTempPassword: data.data?.newTempPassword || '',
      });
      setResetConfirm(null);
      toast.success('Password reset');
      fetchStudents();
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleMoveStudent = async ({ studentId, fromDepartment, toDepartment }) => {
    try {
      const { data } = await api.put('/institution/departments/move-student', {
        studentId,
        fromDepartment,
        toDepartment,
      });
      if (!data.success) {
        throw new Error(data.message || 'Failed to move student');
      }
      toast.success('Student moved successfully');
      setMoveModal(null);
      fetchStudents();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to move student');
    }
  };

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Students</h1>
          <div className={styles.headerActions}>
            <button className={styles.primaryBtn} onClick={() => setAddModalOpen(true)}><Plus size={16} /> Add Student</button>
            <button className={styles.outlineBtn} onClick={() => setBulkModalOpen(true)}><Upload size={16} /> Bulk Upload</button>
            <button className={styles.outlineBtn} onClick={handleExportStudents}><Download size={16} /> Export CSV</button>
          </div>
        </header>

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} />
            <input
              placeholder="Search by name or email..."
              className={styles.searchInput}
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </div>
          <select className={styles.select} value={filters.departmentCode} onChange={(event) => setFilters((current) => ({ ...current, departmentCode: event.target.value }))}>
            <option value="">All Departments</option>
            {departments.map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}
          </select>
          <select className={styles.select} value={filters.level} onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value }))}>
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Placement-Ready">Placement Ready</option>
          </select>
          <select className={styles.select} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending Diagnostic">Pending Diagnostic</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.tableSkeleton}>
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className={styles.skeletonRow} />)}
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className={styles.emptyState}>No students found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')}>Student {sortField === 'name' && (sortAsc ? '↑' : '↓')}</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th onClick={() => handleSort('placementReadiness')}>Readiness {sortField === 'placementReadiness' && (sortAsc ? '↑' : '↓')}</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => (
                  <tr key={student._id} className={styles.row}>
                    <td className={styles.studentCell}>
                      <div className={styles.avatar} style={{ backgroundColor: getColor(student.name) }}>{student.name?.charAt(0) || '?'}</div>
                      <div>
                        <span className={styles.studentName}>{student.name}</span>
                        <span className={styles.studentEmail}>{student.email}</span>
                      </div>
                    </td>
                    <td>{student.departmentCode || '-'}</td>
                    <td>
                      <StudentSourceBadge source={student.studentSource} />
                    </td>
                    <td><LevelBadge level={student.currentLevel} /></td>
                    <td>
                      <div className={styles.readiness}>
                        <div className={styles.miniBar}><div className={styles.miniBarFill} style={{ width: `${student.placementReadiness || 0}%` }} /></div>
                        <span>{student.placementReadiness || 0}%</span>
                      </div>
                    </td>
                    <td>{formatRelative(student.lastActiveAt)}</td>
                    <td><StatusBadge student={student} /></td>
                    <td>
                      <div className={styles.actionsGroup}>
                        <button onClick={() => setProfileSlideover({ open: true, studentId: student._id })} title="View"><Eye size={14} /></button>
                        <button onClick={() => setResetConfirm(student)} title="Reset Password"><Key size={14} /></button>
                        <button onClick={() => setMoveModal(student)} title="Move"><ArrowRightLeft size={14} /></button>
                        <button onClick={() => setRemoveConfirm(student)} title="Remove"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination {...pagination} onPageChange={(page) => setPagination((current) => ({ ...current, page }))} />
          </div>
        )}

        {addModalOpen && <AddSingleModal departments={departments} onClose={() => setAddModalOpen(false)} onSuccess={() => { fetchStudents(); fetchDepartments(); }} />}
        {bulkModalOpen && <BulkUploadModal departments={departments} onClose={() => setBulkModalOpen(false)} onSuccess={() => { fetchStudents(); fetchDepartments(); }} />}
        {profileSlideover.open && <ProfileSlideover studentId={profileSlideover.studentId} onClose={() => setProfileSlideover({ open: false, studentId: null })} />}
        {resetConfirm && (
          <ConfirmDialog
            message={`Reset password for ${resetConfirm.name}?`}
            onConfirm={() => handleReset(resetConfirm._id)}
            onCancel={() => setResetConfirm(null)}
          />
        )}
        {resetResult && (
          <PasswordResultDialog
            title="Temporary password created"
            password={resetResult.newTempPassword}
            onClose={() => setResetResult(null)}
          />
        )}
        {removeConfirm && (
          <ConfirmDialog
            message={`Remove ${removeConfirm.name} from the institution?`}
            onConfirm={() => handleDelete(removeConfirm._id)}
            onCancel={() => setRemoveConfirm(null)}
          />
        )}
        {moveModal && (
          <MoveStudentModal
            student={moveModal}
            departments={departments}
            onClose={() => setMoveModal(null)}
            onConfirm={handleMoveStudent}
          />
        )}
      </div>
    </InstitutionLayout>
  );
}

function StudentSourceBadge({ source }) {
  const isInstitutionCreated = source === 'institution_created';
  return (
    <span className={`${styles.badge} ${isInstitutionCreated ? styles.typeInstitutionCreated : styles.typeSelfRegistered}`}>
      {isInstitutionCreated ? 'Institution' : 'Self Registered'}
    </span>
  );
}

function LevelBadge({ level }) {
  return <span className={`${styles.badge} ${level === 'Placement-Ready' ? styles.levelGreen : level === 'Intermediate' ? styles.levelAmber : styles.levelRed}`}>{level || 'Beginner'}</span>;
}

function StatusBadge({ student }) {
  const active = activeInDays(student.lastActiveAt, 7);
  if (active) return <span className={styles.statusActive}>Active</span>;
  if (!student.diagnosticCompleted) return <span className={styles.statusPending}>Pending Diagnostic</span>;
  return <span className={styles.statusInactive}>Inactive</span>;
}

function Pagination({ total, page, pages, onPageChange }) {
  return (
    <div className={styles.pagination}>
      <span>Showing {Math.min((page - 1) * 100 + 1, total)} to {Math.min(page * 100, total)} of {total} students</span>
      <div className={styles.pageBtns}>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
        <span>{page} / {pages}</span>
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <p>{message}</p>
        <div className={styles.modalBtns}>
          <button onClick={onCancel}>Cancel</button>
          <button className={styles.dangerBtn} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function PasswordResultDialog({ title, password, onClose }) {
  const handleDownload = () => {
    downloadCsv([{ temporaryPassword: password }], 'student-password.csv');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <Check size={40} className={styles.successIcon} />
        <h3>{title}</h3>
        <div className={styles.credentialBox}>
          <p><strong>Temporary Password:</strong> <code>{password}</code></p>
        </div>
        <p className={styles.warnText}>Save this password now. It will not be shown again.</p>
        <div className={styles.modalBtns}>
          <button className={styles.outlineBtn} onClick={handleDownload}><Download size={14} /> Download CSV</button>
          <button className={styles.primaryBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function MoveStudentModal({ student, departments, onClose, onConfirm }) {
  const [toDepartment, setToDepartment] = useState('');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <h3>Move Student</h3>
        <p className={styles.helperText}>
          Move {student.name} from {student.departmentCode || 'Unassigned'} to another department.
        </p>
        <select className={styles.select} value={toDepartment} onChange={(event) => setToDepartment(event.target.value)}>
          <option value="">Select destination department</option>
          {departments
            .filter((department) => department.code !== student.departmentCode)
            .map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}
        </select>
        <div className={styles.modalBtns}>
          <button onClick={onClose}>Cancel</button>
          <button
            className={styles.primaryBtn}
            onClick={() => onConfirm({
              studentId: student._id,
              fromDepartment: student.departmentCode,
              toDepartment,
            })}
            disabled={!toDepartment}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSingleModal({ departments, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', departmentCode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.departmentCode) return setError('All fields required');
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/institution/students/add', form);
      if (data.success) {
        setResult(data.data);
        onSuccess?.();
      } else {
        setError(data.message || 'Failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
          <Check size={40} className={styles.successIcon} />
          <h3>Student Added</h3>
          <div className={styles.credentialBox}>
            <p><strong>Username:</strong> {result.student.email}</p>
            <p><strong>Temp Password:</strong> <code>{result.temporaryPassword}</code></p>
          </div>
          <p className={styles.warnText}>Save this password now. It will not be shown again.</p>
          <div className={styles.modalBtns}>
            <button onClick={() => setResult(null)} className={styles.outlineBtn}>Add Another</button>
            <button onClick={onClose} className={styles.primaryBtn}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <h3>Add Student</h3>
        {error && <p className={styles.errorText}><AlertCircle size={14} /> {error}</p>}
        <input placeholder="Full Name" className={styles.input} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <input placeholder="Email Address" className={styles.input} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <select className={styles.select} value={form.departmentCode} onChange={(event) => setForm((current) => ({ ...current, departmentCode: event.target.value }))}>
          <option value="">Select Department</option>
          {departments.map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}
        </select>
        <button className={styles.primaryBtn} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Student'}
        </button>
      </div>
    </div>
  );
}

function BulkUploadModal({ departments, onClose, onSuccess }) {
  const [tab, setTab] = useState('manual');
  const [manualText, setManualText] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [entries, setEntries] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleManualPreview = () => {
    const emails = manualText.split('\n').map((value) => value.trim()).filter(Boolean);
    setEntries(emails.map((email) => ({ name: email.split('@')[0], email, departmentCode: deptCode })));
  };

  const handleFilePreview = async (file) => {
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      setEntries(parsed);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to parse CSV file');
    }
  };

  const handleCreate = async () => {
    if (entries.length === 0) return;
    setSubmitting(true);
    try {
      const payload = entries.map((entry) => ({
        name: entry.name || entry.email.split('@')[0],
        email: entry.email,
        departmentCode: entry.departmentCode || deptCode,
      }));
      const { data } = await api.post('/institution/students/bulk', { students: payload });
      if (data.success) {
        setResult(data.data);
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCredentials = () => {
    if (!result?.students?.length) return;
    downloadCsv(
      result.students.map((student) => ({
        name: student.name,
        email: student.email,
        departmentCode: student.departmentCode,
        temporaryPassword: student.temporaryPassword,
      })),
      'bulk-student-credentials.csv'
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()} style={{ maxWidth: 600 }}>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        <h3>Bulk Upload</h3>
        {error && <p className={styles.errorText}><AlertCircle size={14} /> {error}</p>}
        <div className={styles.tabBtns}>
          <button className={tab === 'manual' ? styles.activeTab : ''} onClick={() => setTab('manual')}>Manual Entry</button>
          <button className={tab === 'csv' ? styles.activeTab : ''} onClick={() => setTab('csv')}>CSV Upload</button>
        </div>

        {tab === 'manual' ? (
          <>
            <select className={styles.select} value={deptCode} onChange={(event) => setDeptCode(event.target.value)}>
              <option value="">Select Department</option>
              {departments.map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}
            </select>
            <textarea className={styles.textarea} rows={6} placeholder="Enter emails, one per line" value={manualText} onChange={(event) => setManualText(event.target.value)} />
            <button className={styles.outlineBtn} onClick={handleManualPreview}>Preview</button>
          </>
        ) : (
          <div className={styles.csvTab}>
            <input
              type="file"
              accept=".csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFilePreview(file);
              }}
              className={styles.fileInput}
            />
            <p className={styles.csvNote}>File should have columns: name, email, departmentCode</p>
          </div>
        )}

        {entries.length > 0 && (
          <>
            <PreviewTable entries={entries} />
            <button className={styles.primaryBtn} disabled={submitting} onClick={handleCreate}>
              {submitting ? 'Creating...' : 'Create All'}
            </button>
          </>
        )}

        {result && (
          <div className={styles.resultBox}>
            <p>{result.created} students created, {result.failed} failed.</p>
            {result.failedEmails?.length > 0 && <p className={styles.failEmails}>Failed: {result.failedEmails.join(', ')}</p>}
            <button onClick={handleDownloadCredentials} className={styles.outlineBtn}><Download size={14} /> Download Credentials CSV</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewTable({ entries }) {
  return (
    <div className={styles.previewTable}>
      <div className={styles.previewRow}><strong>Email</strong><strong>Department</strong></div>
      {entries.slice(0, 5).map((entry, index) => <div key={`${entry.email}-${index}`} className={styles.previewRow}><span>{entry.email}</span><span>{entry.departmentCode || '-'}</span></div>)}
      {entries.length > 5 && <div className={styles.previewRow}>... and {entries.length - 5} more</div>}
    </div>
  );
}

function ProfileSlideover({ studentId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/institution/analytics/student/${studentId}`)
      .then(({ data }) => {
        if (data.success) setProfile(data.data);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.slideover} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        {loading ? <p>Loading...</p> : !profile ? <p>Failed to load</p> : (
          <div className={styles.profileContent}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar} style={{ backgroundColor: getColor(profile.profile?.name) }}>{profile.profile?.name?.charAt(0)}</div>
              <div>
                <h4>{profile.profile?.name}</h4>
                <span className={styles.studentEmail}>{profile.profile?.email}</span>
                <span className={styles.studentEmail}>{profile.profile?.departmentCode || 'GEN'}</span>
              </div>
              <LevelBadge level={profile.profile?.currentLevel} />
            </div>
            <StudentSourceBadge source={profile.profile?.studentSource} />
            <div className={styles.profileReadiness}>
              <span>Readiness: {profile.profile?.placementReadiness}%</span>
              <div className={styles.progressBar}><div style={{ width: `${profile.profile?.placementReadiness || 0}%` }} /></div>
            </div>
            <h5>Topics Progress</h5>
            {profile.topicsProgress?.slice(0, 8).map((topic) => (
              <div key={`${topic.topic}-${topic.module}`} className={styles.topicRow}>
                <span>{topic.topic}</span>
                <div className={styles.progressBar}><div style={{ width: `${topic.masteryScore || 0}%` }} /></div>
                <span>{topic.masteryScore || 0}%</span>
              </div>
            ))}
            <h5>Recent Assessments</h5>
            {profile.assessmentHistory?.slice(0, 5).map((assessment) => (
              <div key={assessment._id} className={styles.assessmentRow}>
                <span>{assessment.topicId?.title || 'Assessment'}</span>
                <span>{assessment.round}</span>
                <span>{assessment.accuracy}%</span>
                <span>{new Date(assessment.completedAt).toLocaleDateString()}</span>
              </div>
            ))}
            <h5>Streak</h5>
            <div className={styles.streakRow}>
              <span>Current: {profile.streak?.currentStreak || 0} days</span>
              <span>Best: {profile.streak?.longestStreak || 0} days</span>
              <span>Total Active Days: {profile.streak?.totalActiveDays || 0}</span>
            </div>
            {profile.topicsProgress?.some((topic) => topic.weakAreas?.length > 0) && (
              <>
                <h5>Weak Areas</h5>
                <ul className={styles.weakList}>
                  {profile.topicsProgress
                    .filter((topic) => topic.weakAreas?.length)
                    .flatMap((topic) =>
                      topic.weakAreas.map((weakArea, index) => (
                        <li key={`${topic.topic}-${index}`}>{topic.topic}: {weakArea}</li>
                      ))
                    )}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV file must include a header row and at least one student row');
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  const requiredHeaders = ['name', 'email', 'departmentCode'];
  const missingHeader = requiredHeaders.find((header) => !headers.includes(header));
  if (missingHeader) {
    throw new Error(`CSV file is missing the ${missingHeader} column`);
  }

  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((cell) => cell.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || '']));
    return {
      name: row.name,
      email: row.email,
      departmentCode: row.departmentCode,
    };
  }).filter((row) => row.email && row.departmentCode);
}

function getColor(name) {
  let hash = 0;
  for (let index = 0; index < (name || '').length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4'];
  return colors[Math.abs(hash) % colors.length];
}

function activeInDays(lastActive, days) {
  if (!lastActive) return false;
  return (Date.now() - new Date(lastActive).getTime()) < days * 86400000;
}

function formatRelative(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
