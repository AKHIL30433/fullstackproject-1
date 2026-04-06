import { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import API from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function getDay(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const day = d.getDay();
  const map = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
  return map[day] || null;
}

function timeToHour(t) {
  if (!t) return null;
  return t.slice(0, 5);
}

export default function Schedule() {
  const [shifts, setShifts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student: '', job: '', date: '', startTime: '', endTime: '', location: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      API.get('/shifts').then(r => setShifts(r.data)).catch(() => {});
      API.get('/students').then(r => setStudents(r.data)).catch(() => {});
      API.get('/jobs').then(r => setJobs(r.data)).catch(() => {});
    } else {
      API.get('/applications').then(r => {
        setApplications(r.data.filter(a => a.status === 'approved'));
      }).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editId) { await API.put('/shifts/' + editId, form); }
      else { await API.post('/shifts', form); }
      setShowForm(false); setEditId(null);
      setForm({ student: '', job: '', date: '', startTime: '', endTime: '', location: '', notes: '' });
      API.get('/shifts').then(r => setShifts(r.data));
    } catch (err) { setError(err.response?.data?.msg || 'Failed to save shift'); }
  };

  const handleEdit = (s) => {
    setForm({ student: s.student?._id || '', job: s.job?._id || '', date: s.date, startTime: s.startTime, endTime: s.endTime, location: s.location || '', notes: s.notes || '' });
    setEditId(s._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this shift?')) {
      await API.delete('/shifts/' + id);
      setShifts(shifts.filter(s => s._id !== id));
    }
  };

  // Build timetable grid for admin (from shifts)
  // cell[day][hour] = shift
  const adminGrid = {};
  DAYS.forEach(d => { adminGrid[d] = {}; });
  shifts.forEach(shift => {
    const day = getDay(shift.date);
    const hour = timeToHour(shift.startTime);
    if (day && hour && adminGrid[day]) {
      if (!adminGrid[day][hour]) adminGrid[day][hour] = [];
      adminGrid[day][hour].push(shift);
    }
  });

  // Build timetable for student (from approved applications - no date, so show by job)
  const sColor = { scheduled: { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' }, completed: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }, cancelled: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' } };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>My Timetable</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Your approved job schedule</p>
        </div>

        {applications.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>No approved applications yet</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>Once your application is approved, it will appear here</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#6b7280', borderBottom: '2px solid #e5e7eb', textAlign: 'left', width: '100px' }}>Time / Day</th>
                    {DAYS.map(d => (
                      <th key={d} style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={app._id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280', fontWeight: '600', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                        {app.job?.title?.slice(0, 12) || '—'}
                      </td>
                      {DAYS.map(day => (
                        <td key={day} style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', borderLeft: '1px solid #f3f4f6', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 8px', display: 'inline-block', minWidth: '80px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#15803d' }}>✓ Approved</div>
                            <div style={{ fontSize: '10px', color: '#166534', marginTop: '2px' }}>{app.job?.department || ''}</div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // ADMIN TIMETABLE VIEW
  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Work Timetable</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Weekly schedule grid — {shifts.length} total shifts</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ student: '', job: '', date: '', startTime: '', endTime: '', location: '', notes: '' }); }}
          style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
          + Add Shift
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', width: '480px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 20px 0' }}>{editId ? 'Edit Shift' : 'Add New Shift'}</h3>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Student *</label>
                <select required value={form.student} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, student: e.target.value })}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Job *</label>
                <select required value={form.job} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, job: e.target.value })}>
                  <option value="">Select job...</option>
                  {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Date *</label>
                <input type="date" required value={form.date} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Start Time *</label>
                  <input type="time" required value={form.startTime} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>End Time *</label>
                  <input type="time" required value={form.endTime} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Location</label>
                <input type="text" value={form.location} placeholder="e.g. Library, Block A" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Notes</label>
                <textarea value={form.notes} rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>{editId ? 'Update' : 'Add Shift'}</button>
                <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px 20px' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8', marginBottom: '4px' }}>Scheduled</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#1d4ed8' }}>{shifts.filter(s => s.status === 'scheduled').length}</div></div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#15803d', marginBottom: '4px' }}>Completed</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d' }}>{shifts.filter(s => s.status === 'completed').length}</div></div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px 20px' }}><div style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>Cancelled</div><div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>{shifts.filter(s => s.status === 'cancelled').length}</div></div>
      </div>

      {/* TIMETABLE GRID */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#6b7280', borderBottom: '2px solid #e5e7eb', textAlign: 'left', width: '80px' }}>Time</th>
                {DAYS.map(d => (
                  <th key={d} style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#111827', borderBottom: '2px solid #e5e7eb', textAlign: 'center', borderLeft: '1px solid #e5e7eb' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, hi) => (
                <tr key={hour} style={{ background: hi % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    {hour}
                  </td>
                  {DAYS.map(day => {
                    const cellShifts = adminGrid[day]?.[hour] || [];
                    return (
                      <td key={day} style={{ padding: '4px', borderBottom: '1px solid #f3f4f6', borderLeft: '1px solid #f3f4f6', verticalAlign: 'top', minWidth: '120px', minHeight: '48px' }}>
                        {cellShifts.map(shift => {
                          const sc = sColor[shift.status] || sColor.scheduled;
                          return (
                            <div key={shift._id} style={{ background: sc.bg, border: '1px solid ' + sc.border, borderRadius: '6px', padding: '5px 7px', marginBottom: '3px', cursor: 'pointer' }}
                              onClick={() => handleEdit(shift)}>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: sc.color }}>{shift.student?.name || '—'}</div>
                              <div style={{ fontSize: '10px', color: sc.color, opacity: 0.85, marginTop: '1px' }}>{shift.job?.title || '—'}</div>
                              <div style={{ fontSize: '10px', color: sc.color, opacity: 0.7 }}>{shift.startTime}–{shift.endTime}</div>
                              <button onClick={e => { e.stopPropagation(); handleDelete(shift._id); }}
                                style={{ marginTop: '3px', fontSize: '9px', padding: '1px 5px', background: 'rgba(255,255,255,0.6)', border: '1px solid ' + sc.border, borderRadius: '4px', cursor: 'pointer', color: sc.color }}>
                                delete
                              </button>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
        💡 Click on any shift in the grid to edit it
      </div>
    </Layout>
  );
}
