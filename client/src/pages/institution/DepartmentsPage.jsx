import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import InstitutionLayout from '../../components/layout/InstitutionLayout';
import api from '../../services/api';
import { Plus, Pencil, Trash2, ArrowRightLeft, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './DepartmentsPage.module.css';

export default function DepartmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [selectedCode, setSelectedCode] = useState(searchParams.get('dept') || '');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const [departmentResponse, analyticsResponse] = await Promise.all([
        api.get('/institution/departments'),
        api.get('/institution/analytics/departments'),
      ]);

      const departmentList = departmentResponse.data.data || [];
      const analyticsByCode = new Map((analyticsResponse.data.data || []).map((department) => [department.code, department]));
      const merged = departmentList.map((department) => ({
        ...department,
        ...(analyticsByCode.get(department.code) || {}),
      }));
      setDepartments(merged);

      if (!selectedCode && merged[0]?.code) {
        setSelectedCode(merged[0].code);
      }
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!selectedCode && departments[0]?.code) {
      setSelectedCode(departments[0].code);
      return;
    }

    if (selectedCode && !departments.some((department) => department.code === selectedCode)) {
      setSelectedCode(departments[0]?.code || '');
    }
  }, [departments, selectedCode]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (selectedCode) nextParams.set('dept', selectedCode);
    setSearchParams(nextParams, { replace: true });
  }, [selectedCode, setSearchParams]);

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.code === selectedCode) || departments[0] || null,
    [departments, selectedCode]
  );

  const handleDelete = async (department) => {
    try {
      const { data } = await api.delete(`/institution/departments/${department.code}`);
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete department');
      }
      toast.success('Department deleted');
      setDeleteTarget(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete department');
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
      setMoveTarget(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to move student');
    }
  };

  return (
    <InstitutionLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Departments</h1>
            <p className={styles.subtitle}>Manage department structure, student assignment, and placement focus.</p>
          </div>
          <button className={styles.primaryBtn} onClick={() => setCreateOpen(true)}><Plus size={16} /> Add Department</button>
        </header>

        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className={styles.skeletonCard} />)}
          </div>
        ) : departments.length === 0 ? (
          <div className={styles.emptyState}>No departments found.</div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.listColumn}>
              {departments.map((department) => (
                <button
                  key={department.code}
                  className={`${styles.departmentCard} ${selectedDepartment?.code === department.code ? styles.departmentCardActive : ''}`}
                  onClick={() => setSelectedCode(department.code)}
                >
                  <div className={styles.departmentHead}>
                    <div>
                      <h2 className={styles.departmentName}>{department.name}</h2>
                      <p className={styles.departmentCode}>{department.code}</p>
                    </div>
                    <span className={styles.departmentCount}>{department.studentCount || department.totalStudents || 0} students</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Avg readiness</span>
                    <strong>{department.avgPlacementReadiness || 0}%</strong>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${department.avgPlacementReadiness || 0}%` }} />
                  </div>
                  <div className={styles.metricRow}>
                    <span>Active today</span>
                    <strong>{department.activeToday || 0}</strong>
                  </div>
                </button>
              ))}
            </div>

            {selectedDepartment && (
              <div className={styles.detailColumn}>
                <div className={styles.detailCard}>
                  <div className={styles.detailHeader}>
                    <div>
                      <h2 className={styles.detailTitle}>{selectedDepartment.name}</h2>
                      <p className={styles.detailMeta}>{selectedDepartment.code}</p>
                    </div>
                    <div className={styles.actionRow}>
                      <button className={styles.outlineBtn} onClick={() => setEditTarget(selectedDepartment)}><Pencil size={14} /> Edit</button>
                      <button className={styles.outlineBtn} onClick={() => setDeleteTarget(selectedDepartment)}><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>

                  <div className={styles.statsGrid}>
                    <Stat label="Students" value={selectedDepartment.studentCount || selectedDepartment.totalStudents || 0} />
                    <Stat label="Active This Week" value={selectedDepartment.activeThisWeek || 0} />
                    <Stat label="Pending Diagnostic" value={selectedDepartment.diagnosticPending || 0} />
                    <Stat label="At Risk" value={selectedDepartment.atRiskStudents || 0} />
                  </div>

                  <div className={styles.notesPanel}>
                    <div>
                      <span className={styles.notesLabel}>Placement Target</span>
                      <p>{selectedDepartment.targetPlacementDate ? new Date(selectedDepartment.targetPlacementDate).toLocaleDateString() : 'Not set'}</p>
                    </div>
                    <div>
                      <span className={styles.notesLabel}>Notes</span>
                      <p>{selectedDepartment.notes || 'No notes added for this department yet.'}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.studentPanel}>
                  <div className={styles.studentPanelHeader}>
                    <h3 className={styles.studentPanelTitle}><Users size={16} /> Students in {selectedDepartment.code}</h3>
                  </div>

                  {selectedDepartment.students?.length ? (
                    <div className={styles.studentTable}>
                      {selectedDepartment.students.map((student) => (
                        <div key={student._id} className={styles.studentRow}>
                          <div>
                            <p className={styles.studentName}>{student.name}</p>
                            <p className={styles.studentMeta}>
                              {student.email} · {student.currentLevel || 'Beginner'} · {student.placementReadiness || 0}% readiness
                            </p>
                            <p className={styles.studentSource}>
                              {student.studentSource === 'institution_created' ? 'Institution created' : 'Self registered'}
                            </p>
                          </div>
                          <button className={styles.outlineBtn} onClick={() => setMoveTarget({ ...student, departmentCode: selectedDepartment.code })}>
                            <ArrowRightLeft size={14} /> Move
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyStateInline}>No students in this department.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {createOpen && <DepartmentFormModal title="Create Department" onClose={() => setCreateOpen(false)} onSuccess={() => { setCreateOpen(false); fetchDepartments(); }} />}
        {editTarget && <DepartmentFormModal title="Edit Department" department={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); fetchDepartments(); }} />}
        {deleteTarget && (
          <ConfirmDialog
            message={`Delete ${deleteTarget.name}?`}
            onConfirm={() => handleDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {moveTarget && (
          <MoveStudentModal
            student={moveTarget}
            departments={departments}
            onClose={() => setMoveTarget(null)}
            onConfirm={handleMoveStudent}
          />
        )}
      </div>
    </InstitutionLayout>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{value}</strong>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <p>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.outlineBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.primaryBtn} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function DepartmentFormModal({ title, department, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: department?.name || '',
    code: department?.code || '',
    targetPlacementDate: department?.targetPlacementDate ? new Date(department.targetPlacementDate).toISOString().slice(0, 10) : '',
    notes: department?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(department);

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      toast.error('Department name and code are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        targetPlacementDate: form.targetPlacementDate || null,
        notes: form.notes,
      };
      const request = isEdit
        ? api.put(`/institution/departments/${department.code}`, payload)
        : api.post('/institution/departments', payload);
      const { data } = await request;
      if (!data.success) {
        throw new Error(data.message || 'Failed to save department');
      }
      toast.success(isEdit ? 'Department updated' : 'Department created');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <input className={styles.input} placeholder="Department Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <input className={styles.input} placeholder="Department Code" value={form.code} disabled={isEdit} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
        <label className={styles.fieldLabel}>Placement target date</label>
        <input className={styles.input} type="date" value={form.targetPlacementDate} onChange={(event) => setForm((current) => ({ ...current, targetPlacementDate: event.target.value }))} />
        <label className={styles.fieldLabel}>Notes</label>
        <textarea className={styles.textarea} rows={4} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        <div className={styles.modalActions}>
          <button className={styles.outlineBtn} onClick={onClose}>Cancel</button>
          <button className={styles.primaryBtn} onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
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
        <h3>Move Student</h3>
        <p className={styles.subtitle}>Move {student.name} from {student.departmentCode} to another department.</p>
        <select className={styles.select} value={toDepartment} onChange={(event) => setToDepartment(event.target.value)}>
          <option value="">Select Department</option>
          {departments.filter((department) => department.code !== student.departmentCode).map((department) => (
            <option key={department.code} value={department.code}>{department.name}</option>
          ))}
        </select>
        <div className={styles.modalActions}>
          <button className={styles.outlineBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.primaryBtn}
            disabled={!toDepartment}
            onClick={() => onConfirm({
              studentId: student._id,
              fromDepartment: student.departmentCode,
              toDepartment,
            })}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}
