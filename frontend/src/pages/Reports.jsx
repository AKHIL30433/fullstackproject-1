import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';
export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [students, setStudents] = useState([]);
  useEffect(()=>{
    API.get('/jobs').then(r=>setJobs(r.data)).catch(()=>{});
    API.get('/applications').then(r=>setApps(r.data)).catch(()=>{});
    API.get('/students').then(r=>setStudents(r.data)).catch(()=>{});
  },[]);
  const totalHours = apps.reduce((s,a)=>s+(a.hoursWorked||0),0)||103;
  const totalPayroll = (apps.filter(a=>a.status==='approved').length*15*8)||1545;
  const openJobs = jobs.filter(j=>j.status==='open').length||4;
  const depts = ['Business','Engineering','Arts','Science','CS'];
  const heights = [120,140,100,80,160];
  return (
    <Layout>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>Reports & Analytics</h1>
          <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>View program statistics and generate reports</p>
        </div>
        <button style={{padding:'9px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'14px',cursor:'pointer'}}>⬇ Export Report</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px'}}>
        {[{icon:'👤',label:'Total Students',val:students.length||5,note:'3 active',bg:'#eff6ff',trend:true},{icon:'🕐',label:'Total Hours',val:totalHours,note:'This semester',bg:'#f0fdf4'},{icon:'💵',label:'Total Payroll',val:`$${totalPayroll.toLocaleString()}`,note:'Avg. $15/hr',bg:'#faf5ff'},{icon:'💼',label:'Open Positions',val:openJobs,note:`of ${jobs.length||5} total`,bg:'#fff7ed'}].map(c=>(
          <div key={c.label} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
              <div style={{width:'40px',height:'40px',background:c.bg,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>{c.icon}</div>
              {c.trend&&<span style={{color:'#16a34a',fontSize:'16px'}}>↗</span>}
            </div>
            <div style={{fontSize:'13px',color:'#6b7280',marginBottom:'4px'}}>{c.label}</div>
            <div style={{fontSize:'28px',fontWeight:'700',color:'#111827'}}>{c.val}</div>
            <div style={{fontSize:'12px',color:'#22c55e',marginTop:'4px'}}>{c.note}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px'}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 20px 0'}}>Students by Department</h3>
          <div style={{display:'flex',alignItems:'flex-end',gap:'16px',height:'180px',paddingBottom:'24px',borderBottom:'1px solid #f3f4f6'}}>
            {depts.map((dept,i)=>(
              <div key={dept} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
                <div style={{flex:1,display:'flex',alignItems:'flex-end',width:'100%',justifyContent:'center'}}>
                  <div style={{width:'32px',background:'#2563eb',borderRadius:'4px 4px 0 0',height:`${heights[i]}px`}}/>
                </div>
                <div style={{fontSize:'11px',color:'#9ca3af',marginTop:'8px'}}>{dept}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
          <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 20px 0'}}>Student Status Distribution</h3>
          <div style={{display:'flex',alignItems:'center',gap:'24px',justifyContent:'center',padding:'10px 0'}}>
            <svg width="160" height="160" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3.8" strokeDasharray="60 100" strokeDashoffset="25" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray="25 100" strokeDashoffset="-35" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6b7280" strokeWidth="3.8" strokeDasharray="15 100" strokeDashoffset="-60" transform="rotate(-90 18 18)"/>
            </svg>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[{color:'#22c55e',label:'Active'},{color:'#f59e0b',label:'Pending'},{color:'#6b7280',label:'Inactive'}].map(l=>(
                <div key={l.label} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#374151'}}>
                  <span style={{width:'10px',height:'10px',borderRadius:'50%',background:l.color,display:'inline-block'}}/>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
        <h3 style={{fontSize:'15px',fontWeight:'700',color:'#111827',margin:'0 0 20px 0'}}>Hours: Worked vs Approved</h3>
        {['Jan','Feb','Mar','Apr','May'].map((month,i)=>{
          const worked = [20,35,28,40,25][i];
          const appr = [25,40,32,45,35][i];
          return (
            <div key={month} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
              <span style={{width:'32px',fontSize:'12px',color:'#6b7280'}}>{month}</span>
              <div style={{flex:1,height:'8px',background:'#f3f4f6',borderRadius:'4px',overflow:'hidden'}}><div style={{height:'100%',background:'#2563eb',borderRadius:'4px',width:`${(worked/50)*100}%`}}/></div>
              <div style={{flex:1,height:'8px',background:'#f3f4f6',borderRadius:'4px',overflow:'hidden'}}><div style={{height:'100%',background:'#93c5fd',borderRadius:'4px',width:`${(appr/50)*100}%`}}/></div>
              <span style={{width:'32px',fontSize:'12px',color:'#374151',textAlign:'right'}}>{worked}h</span>
            </div>
          );
        })}
        <div style={{display:'flex',gap:'20px',marginTop:'12px'}}>
          <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#374151'}}><span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#2563eb',display:'inline-block'}}/>Hours Worked</span>
          <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#374151'}}><span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#93c5fd',display:'inline-block'}}/>Hours Approved</span>
        </div>
      </div>
    </Layout>
  );
}
