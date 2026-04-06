import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Schedule() {
  const [applications, setApplications] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    API.get('/applications')
      .then(r => {
        const approved = r.data.filter(app => app.status === 'approved');
        setApplications(approved);
      })
      .catch(() => {});
  }, []);
  
  return (
    <Layout>
      <div style={{marginBottom:'20px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'700',color:'#111827',margin:0}}>Schedule</h1>
        <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>Approved job applications</p>
      </div>
      <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'20px',marginBottom:'20px',display:'inline-block'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#15803d',marginBottom:'8px'}}>Total Approved</div>
        <div style={{fontSize:'32px',fontWeight:'700',color:'#15803d'}}>{applications.length}</div>
      </div>
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px'}}>
        <h3 style={{fontSize:'16px',fontWeight:'700',color:'#111827',margin:'0 0 16px 0',paddingBottom:'12px',borderBottom:'1px solid #f3f4f6'}}>
          Approved Applications ({applications.length})
        </h3>
        {applications.length === 0 && (
          <p style={{color:'#9ca3af',textAlign:'center',padding:'32px',fontSize:'14px'}}>No approved applications found.</p>
        )}
        {applications.map(app => (
          <div key={app._id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'16px 0',borderBottom:'1px solid #f3f4f6'}}>
            <div>
              <div style={{fontSize:'15px',fontWeight:'600',color:'#111827'}}>{app.student?.name || '—'}</div>
              <div style={{fontSize:'13px',color:'#374151',marginTop:'3px'}}>Job: {app.job?.title || '—'}</div>
              <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>Department: {app.job?.department || '—'}</div>
              <div style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
            </div>
            <span style={{padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:'#dcfce7',color:'#15803d'}}>Approved</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
