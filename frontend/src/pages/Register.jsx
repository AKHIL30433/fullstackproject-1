import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
export default function Register() {
  const [form, setForm] = useState({name:'',email:'',password:'',role:'student'});
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register',form);
      login(res.data.user,res.data.token);
      navigate('/dashboard');
    } catch(err){ setError(err.response?.data?.msg||'Registration failed'); }
  };
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{flex:1,background:'#1e40af',color:'white',display:'flex',flexDirection:'column',justifyContent:'center',padding:'60px'}}>
        <div style={{fontSize:'16px',fontWeight:'700',opacity:0.9,marginBottom:'4px'}}>Work-Study Management System</div>
        <div style={{fontSize:'12px',opacity:0.6,marginBottom:'40px'}}>FSAD-PS42</div>
        <h1 style={{fontSize:'28px',fontWeight:'800',lineHeight:'1.3',marginBottom:'32px'}}>Join the work-study program portal</h1>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {['Browse available positions','Submit applications easily','Track your status in real-time','Manage your work schedule'].map(b=>(
            <div key={b} style={{fontSize:'15px',opacity:0.85}}>✓ {b}</div>
          ))}
        </div>
      </div>
      <div style={{flex:1,background:'#f8f9fa',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#fff',padding:'40px',borderRadius:'12px',width:'380px',border:'1px solid #e5e7eb',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#111827',margin:'0 0 6px 0'}}>Create your account</h2>
          <p style={{color:'#6b7280',fontSize:'14px',marginBottom:'24px'}}>Fill in your details to get started</p>
          {error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',padding:'10px 14px',borderRadius:'8px',marginBottom:'16px',fontSize:'13px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Full Name</label>
            <input style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}} placeholder="John Smith" onChange={e=>setForm({...form,name:e.target.value})} required/>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Email address</label>
            <input style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}} type="email" placeholder="you@university.edu" onChange={e=>setForm({...form,email:e.target.value})} required/>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Password</label>
            <input style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}} type="password" placeholder="Min. 6 characters" onChange={e=>setForm({...form,password:e.target.value})} required/>
            <label style={{display:'block',fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'6px'}}>Role</label>
            <select style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
            <button type="submit" style={{width:'100%',padding:'11px',background:'#2563eb',color:'#fff',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>Create Account</button>
          </form>
          <p style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'#6b7280'}}>Already have an account? <a href="/" style={{color:'#2563eb',fontWeight:'600',textDecoration:'none'}}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}
