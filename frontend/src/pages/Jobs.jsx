import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { useAuth } from '../context/AuthContext';
export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({title:'',department:'',description:'',hoursPerWeek:'',pay:'',slots:''});
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();
  useEffect(()=>{ API.get('/jobs').then(r=>setJobs(r.data)); },[]);
  const handleApply = async (jobId) => {
    try { await API.post('/applications',{job:jobId}); alert('Application submitted!'); }
    catch(err){ alert(err.response?.data?.msg||'Error'); }
  };
  const openEdit = (job) => {
    setForm({title:job.title,department:job.department,description:job.description||'',hoursPerWeek:job.hoursPerWeek||'',pay:job.pay||'',slots:job.slots||''});
    setEditId(job._id); setShowForm(true);
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    if(editId){ await API.put(`/jobs/${editId}`,form); }
    else { await API.post('/jobs',form); }
    setShowForm(false); setEditId(null);
    setForm({title:'',department:'',description:'',hoursPerWeek:'',pay:'',slots:''});
    API.get('/jobs').then(r=>setJobs(r.data));
  };
  const handleDelete = async (id) => {
    if(window.confirm('Delete?')){ await API.delete(`/jobs/${id}`); setJobs(jobs.filter(j=>j._id!==id)); }
  };
  const filtered = jobs.filter(j=>{
    const ms = j.title.toLowerCase().includes(search.toLowerCase())||j.department.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='all'||j.status===filterStatus;
    return ms&&mf;
  });
  const deptBg = ['#eff6ff','#f0fdf4','#faf5ff','#fff7ed','#fef9c3'];
  const deptColor = ['#1d4ed8','#15803d','#7c3aed','#c2410c','#b45309'];
  return (
    <Layout>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>Job Postings</h1>
          <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>{jobs.filter(j=>j.status==='open').length} open positions available</p>
        </div>
        {user?.role==='admin'&&<button style={{padding:'9px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}} onClick={()=>{setEditId(null);setForm({title:'',department:'',description:'',hoursPerWeek:'',pay:'',slots:''});setShowForm(!showForm)}}>+ Post New Job</button>}
      </div>
      <div style={{display:'flex',gap:'12px',marginBottom:'20px'}}>
        <div style={{flex:1,position:'relative'}}>
          <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)'}}>🔍</span>
          <input style={{width:'100%',padding:'10px 14px 10px 36px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#fff'}} placeholder="Search jobs..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select value={filterStatus} style={{padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',background:'#fff'}} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="all">All Status</option><option value="open">Open</option><option value="closed">Closed</option>
        </select>
      </div>
      {showForm&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:'12px',padding:'32px',width:'480px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',maxHeight:'90vh',overflowY:'auto'}}>
            <h3 style={{fontSize:'18px',fontWeight:'700',color:'#111827',margin:'0 0 20px 0'}}>{editId?'Edit Job':'Post New Job'}</h3>
            <form onSubmit={handleCreate}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
                {[['Job Title','title','text'],['Department','department','text'],['Hours/Week','hoursPerWeek','number'],['Pay ($/hr)','pay','number'],['Slots','slots','number']].map(([label,field,type])=>(
                  <div key={field}>
                    <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>{label}</label>
                    <input type={type} value={form[field]} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}} onChange={e=>setForm({...form,[field]:e.target.value})}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Description</label>
                <textarea rows={3} value={form.description} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',resize:'vertical'}} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button type="submit" style={{flex:1,padding:'10px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>{editId?'Save Changes':'Create Job'}</button>
                <button type="button" onClick={()=>{setShowForm(false);setEditId(null);}} style={{flex:1,padding:'10px',background:'#f3f4f6',color:'#374151',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        {filtered.map((job,i)=>(
          <div key={job._id} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'600',background:deptBg[i%5],color:deptColor[i%5]}}>{job.department}</span>
              <span style={{padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:job.status==='open'?'#dcfce7':'#fee2e2',color:job.status==='open'?'#15803d':'#dc2626'}}>{job.status}</span>
            </div>
            <h3 style={{fontSize:'16px',fontWeight:'700',color:'#111827',margin:0}}>{job.title}</h3>
            <p style={{fontSize:'13px',color:'#6b7280',lineHeight:'1.5',margin:0}}>{job.description||'No description provided.'}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              <div style={{fontSize:'13px',color:'#6b7280'}}>🕐 {job.hoursPerWeek||'—'} hrs/week</div>
              <div style={{fontSize:'13px',color:'#6b7280'}}>💵 ${job.pay||'—'}/hr</div>
              <div style={{fontSize:'13px',color:'#6b7280'}}>👥 {job.slots||'—'} slots available</div>
            </div>
            <div style={{display:'flex',gap:'8px',marginTop:'4px'}}>
              {user?.role==='student'&&job.status==='open'&&<button onClick={()=>handleApply(job._id)} style={{padding:'8px 16px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'13px',cursor:'pointer'}}>Apply Now</button>}
              {user?.role==='admin'&&<>
                <button onClick={()=>openEdit(job)} style={{padding:'8px 16px',background:'#f3f4f6',color:'#374151',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'13px',cursor:'pointer'}}>✏️ Edit</button>
                <button onClick={()=>handleDelete(job._id)} style={{padding:'8px 16px',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'13px',cursor:'pointer'}}>🗑️ Delete</button>
              </>}
            </div>
          </div>
        ))}
      </div>
      {filtered.length===0&&<div style={{textAlign:'center',padding:'40px',color:'#9ca3af'}}>No jobs found.</div>}
    </Layout>
  );
}
