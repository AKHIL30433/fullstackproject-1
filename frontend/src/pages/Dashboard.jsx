import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';
export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [students, setStudents] = useState([]);
  useEffect(() => {
    API.get('/jobs').then(r=>setJobs(r.data)).catch(()=>{});
    API.get('/applications').then(r=>setApps(r.data)).catch(()=>{});
    API.get('/students').then(r=>setStudents(r.data)).catch(()=>{});
  }, []);
  const openJobs = jobs.filter(j=>j.status==='open').length;
  const pending = apps.filter(a=>a.status==='pending').length;
  const totalHours = apps.reduce((s,a)=>s+(a.hoursWorked||0),0);
  
  const statusColor = {pending:{bg:'#fef9c3',color:'#b45309'},approved:{bg:'#dcfce7',color:'#15803d'},rejected:{bg:'#fee2e2',color:'#dc2626'}};
  return (
    <Layout>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>Dashboard Overview</h1>
        <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>Monitor work-study program metrics and activities</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px'}}>
        {[{icon:'👤',label:'Active Students',val:students.length,bg:'#eff6ff',trend:true},{icon:'💼',label:'Open Positions',val:openJobs,bg:'#f0fdf4'},{icon:'📄',label:'Pending Applications',val:pending,bg:'#fff7ed'},{icon:'🕐',label:'Total Hours Worked',val:totalHours,bg:'#faf5ff'}].map(c=>(
          <div key={c.label} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
              <div style={{width:'40px',height:'40px',background:c.bg,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{c.icon}</div>
              {c.trend&&<span style={{color:'#16a34a',fontSize:'16px'}}>↗</span>}
            </div>
            <div style={{fontSize:'13px',color:'#6b7280',marginBottom:'6px'}}>{c.label}</div>
            <div style={{fontSize:'32px',fontWeight:'700',color:'#111827'}}>{c.val}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px',marginBottom:'20px'}}>
        <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 14px 0'}}>Program Hours Overview</h3>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{fontSize:'13px',color:'#6b7280'}}>Hours Utilized</span>
          <span style={{fontSize:'13px',color:'#6b7280'}}>{totalHours} / 400 hours</span>
        </div>
        <div style={{height:'8px',background:'#e5e7eb',borderRadius:'4px',overflow:'hidden'}}>
          <div style={{height:'100%',background:'#2563eb',borderRadius:'4px',width:`${Math.min((totalHours/400)*100,100)}%`}}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 16px 0'}}>Recent Applications</h3>
          {apps.slice(0,5).map(app=>(
            <div key={app._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div>
                <div style={{fontSize:'14px',fontWeight:'500',color:'#111827'}}>{app.student?.name}</div>
                <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{app.job?.title}</div>
              </div>
              <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:statusColor[app.status]?.bg,color:statusColor[app.status]?.color}}>{app.status}</span>
            </div>
          ))}
          {apps.length===0&&<p style={{color:'#9ca3af',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>No applications yet</p>}
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 16px 0'}}>Upcoming Shifts</h3>
          {apps.filter(a=>a.status==='approved').slice(0,4).map(app=>(
            <div key={app._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div>
                <div style={{fontSize:'14px',fontWeight:'500',color:'#111827'}}>{app.student?.name}</div>
                <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{app.job?.title} · {new Date().toLocaleDateString()}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'13px',color:'#374151'}}>09:00 - 13:00</div>
                <div style={{fontSize:'11px',color:'#9ca3af'}}>4h</div>
              </div>
            </div>
          ))}
          {apps.filter(a=>a.status==='approved').length===0&&<p style={{color:'#9ca3af',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>No upcoming shifts</p>}
        </div>
      </div>
    </Layout>
  );
}
