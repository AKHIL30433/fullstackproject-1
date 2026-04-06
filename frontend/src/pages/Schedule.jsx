import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Schedule() {
  const [shifts, setShifts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('day');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({student:'',job:'',date:'',startTime:'',endTime:'',location:'',notes:''});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

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
      setForm({student:'',job:'',date:'',startTime:'',endTime:'',location:'',notes:''});
      API.get('/shifts').then(r => setShifts(r.data));
    } catch(err) { setError(err.response?.data?.msg || 'Failed to save shift'); }
  };
  const handleEdit = (s) => {
    setForm({student:s.student?._id||'',job:s.job?._id||'',date:s.date,startTime:s.startTime,endTime:s.endTime,location:s.location||'',notes:s.notes||''});
    setEditId(s._id); setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this shift?')) { await API.delete('/shifts/' + id); setShifts(shifts.filter(s => s._id !== id)); }
  };
  const handleStatus = async (id, status) => {
    await API.put('/shifts/' + id, {status});
    setShifts(shifts.map(s => s._id === id ? {...s, status} : s));
  };

  const todayShifts = shifts.filter(s => s.date === today);
  const displayShifts = view === 'day' ? todayShifts : shifts;
  const sColor = {scheduled:{bg:'#dbeafe',color:'#1d4ed8'},completed:{bg:'#dcfce7',color:'#15803d'},cancelled:{bg:'#fee2e2',color:'#dc2626'}};

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div style={{marginBottom:'20px'}}>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>My Schedule</h1>
          <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>Your approved job applications</p>
        </div>
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'20px',marginBottom:'20px',display:'inline-block',minWidth:'180px'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#15803d',marginBottom:'8px'}}>Approved Applications</div>
          <div style={{fontSize:'32px',fontWeight:'700',color:'#15803d'}}>{applications.length}</div>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{fontSize:'16px',fontWeight:'700',color:'#111827',margin:'0 0 16px 0',paddingBottom:'12px',borderBottom:'1px solid #f3f4f6'}}>
            Approved Applications ({applications.length})
          </h3>
          {applications.length === 0 && <p style={{color:'#9ca3af',textAlign:'center',padding:'32px',fontSize:'14px'}}>No approved applications yet.</p>}
          {applications.map(app => (
            <div key={app._id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'16px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div>
                <div style={{fontSize:'15px',fontWeight:'600',color:'#111827'}}>{app.job?.title || '—'}</div>
                <div style={{fontSize:'13px',color:'#374151',marginTop:'3px'}}>Department: {app.job?.department || '—'}</div>
                <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'4px'}}>Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</div>
              </div>
              <span style={{padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:'#dcfce7',color:'#15803d'}}>Approved</span>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>Work Schedule</h1>
          <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>Manage student work shifts and schedules</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({student:'',job:'',date:'',startTime:'',endTime:'',location:'',notes:''}); }} style={{padding:'9px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>+ Schedule Shift</button>
      </div>
      {showForm && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:'14px',padding:'32px',width:'480px',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',maxHeight:'90vh',overflowY:'auto'}}>
            <h3 style={{fontSize:'18px',fontWeight:'700',color:'#111827',margin:'0 0 20px 0'}}>{editId ? 'Edit Shift' : 'Schedule New Shift'}</h3>
            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',padding:'10px',borderRadius:'8px',marginBottom:'16px',fontSize:'13px'}}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Student *</label>
                <select required value={form.student} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,student:e.target.value})}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Job *</label>
                <select required value={form.job} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,job:e.target.value})}>
                  <option value="">Select job...</option>
                  {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
                </select>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Date *</label>
                <input type="date" required value={form.date} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,date:e.target.value})}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Start Time *</label>
                  <input type="time" required value={form.startTime} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,startTime:e.target.value})}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>End Time *</label>
                  <input type="time" required value={form.endTime} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,endTime:e.target.value})}/>
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Location</label>
                <input type="text" value={form.location} placeholder="e.g. Library, Block A" style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e => setForm({...form,location:e.target.value})}/>
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Notes</label>
                <textarea value={form.notes} rows={2} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',resize:'vertical'}} onChange={e => setForm({...form,notes:e.target.value})}/>
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button type="submit" style={{flex:1,padding:'10px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>{editId ? 'Update Shift' : 'Schedule Shift'}</button>
                <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={{flex:1,padding:'10px',background:'#f3f4f6',color:'#374151',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div style={{display:'flex',background:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',overflow:'hidden'}}>
          <button onClick={() => setView('day')} style={{padding:'8px 18px',background:view==='day'?'#2563eb':'transparent',color:view==='day'?'#fff':'#6b7280',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'500'}}>Day View</button>
          <button onClick={() => setView('week')} style={{padding:'8px 18px',background:view==='week'?'#2563eb':'transparent',color:view==='week'?'#fff':'#6b7280',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:'500'}}>All Shifts</button>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'8px',padding:'8px 14px',fontSize:'14px',color:'#374151'}}>
          📅 {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'20px'}}>
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'20px'}}><div style={{fontSize:'13px',fontWeight:'600',color:'#1d4ed8',marginBottom:'8px'}}>Scheduled</div><div style={{fontSize:'32px',fontWeight:'700',color:'#1d4ed8'}}>{shifts.filter(s=>s.status==='scheduled').length}</div></div>
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'20px'}}><div style={{fontSize:'13px',fontWeight:'600',color:'#15803d',marginBottom:'8px'}}>Completed</div><div style={{fontSize:'32px',fontWeight:'700',color:'#15803d'}}>{shifts.filter(s=>s.status==='completed').length}</div></div>
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'10px',padding:'20px'}}><div style={{fontSize:'13px',fontWeight:'600',color:'#dc2626',marginBottom:'8px'}}>Cancelled</div><div style={{fontSize:'32px',fontWeight:'700',color:'#dc2626'}}>{shifts.filter(s=>s.status==='cancelled').length}</div></div>
      </div>
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
        <h3 style={{fontSize:'16px',fontWeight:'700',color:'#111827',margin:'0 0 16px 0',paddingBottom:'12px',borderBottom:'1px solid #f3f4f6'}}>
          {view==='day' ? 'Today\'s Shifts (' + todayShifts.length + ')' : 'All Shifts (' + shifts.length + ')'}
        </h3>
        {displayShifts.length === 0 && <p style={{color:'#9ca3af',textAlign:'center',padding:'32px',fontSize:'14px'}}>No shifts {view==='day'?'scheduled for today':'found'}. Click "+ Schedule Shift" to add one.</p>}
        {displayShifts.map(shift => {
          const sc = sColor[shift.status] || sColor.scheduled;
          const hours = shift.startTime && shift.endTime ? (function(){ var a=shift.startTime.split(':').map(Number); var b=shift.endTime.split(':').map(Number); return ((b[0]*60+b[1])-(a[0]*60+a[1]))/60; })() : 0;
          return (
            <div key={shift._id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'16px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div>
                <div style={{fontSize:'15px',fontWeight:'600',color:'#111827'}}>{shift.student?.name||'—'}</div>
                <div style={{fontSize:'13px',color:'#374151',marginTop:'3px'}}>{shift.job?.title||'—'} · {shift.job?.department||''}</div>
                <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'4px'}}>📅 {shift.date} &nbsp;·&nbsp; 🕐 {shift.startTime} - {shift.endTime} ({hours}h){shift.location ? ' · 📍 ' + shift.location : ''}</div>
                {shift.notes && <div style={{fontSize:'12px',color:'#6b7280',marginTop:'4px',fontStyle:'italic'}}>"{shift.notes}"</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px'}}>
                <span style={{padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:sc.bg,color:sc.color}}>{shift.status}</span>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'flex-end'}}>
                  {shift.status==='scheduled' && <button onClick={() => handleStatus(shift._id,'completed')} style={{padding:'4px 10px',background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#15803d',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>✓ Done</button>}
                  {shift.status==='scheduled' && <button onClick={() => handleStatus(shift._id,'cancelled')} style={{padding:'4px 10px',background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',borderRadius:'6px',fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>✕ Cancel</button>}
                  <button onClick={() => handleEdit(shift)} style={{padding:'4px 10px',background:'#f3f4f6',border:'1px solid #e5e7eb',color:'#374151',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>✏️ Edit</button>
                  <button onClick={() => handleDelete(shift._id)} style={{padding:'4px 10px',background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
