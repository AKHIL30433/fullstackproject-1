import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['admin', 'student'] },
  { path: '/students', label: 'Students', icon: '👤', roles: ['admin'] },
  { path: '/jobs', label: 'Job Postings', icon: '💼', roles: ['admin', 'student'] },
  { path: '/applications', label: 'Applications', icon: '📄', roles: ['admin'] },
  { path: '/schedule', label: 'Schedule', icon: '📅', roles: ['admin', 'student'] },
  { path: '/reports', label: 'Reports', icon: '📊', roles: ['admin'] },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));
  const handleLogout = () => { logout(); navigate('/'); };
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:"'Segoe UI',sans-serif",background:'#f3f4f6'}}>
      <div style={{width:'240px',background:'#fff',borderRight:'1px solid #e5e7eb',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px',borderBottom:'1px solid #f3f4f6'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'#111827',lineHeight:'1.4'}}>Work-Study Management System</div>
          <div style={{fontSize:'11px',color:'#9ca3af',marginTop:'2px'}}>FSAD-PS42</div>
        </div>
        <nav style={{padding:'12px',flex:1,display:'flex',flexDirection:'column',gap:'2px'}}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',background:active?'#eff6ff':'transparent',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'14px',color:active?'#2563eb':'#6b7280',fontWeight:active?'600':'500',width:'100%',textAlign:'left'}}
                onClick={() => navigate(item.path)}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{padding:'16px',borderTop:'1px solid #f3f4f6'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
            <div style={{width:'32px',height:'32px',background:'#2563eb',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'700',fontSize:'13px'}}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#111827'}}>{user?.name}</div>
              <div style={{fontSize:'11px',color:'#9ca3af',textTransform:'capitalize'}}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{width:'100%',padding:'7px',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:'6px',cursor:'pointer',fontSize:'12px',color:'#6b7280'}}>Logout</button>
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'12px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#111827'}}>Work-Study Management System</div>
            <div style={{fontSize:'11px',color:'#9ca3af'}}>FSAD-PS42</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'14px',fontWeight:'600',color:'#111827'}}>{user?.name}</div>
              <div style={{fontSize:'12px',color:'#9ca3af'}}>{user?.email}</div>
            </div>
            <div style={{width:'36px',height:'36px',background:'#2563eb',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'700',fontSize:'14px'}}>{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'28px'}}>{children}</div>
      </div>
    </div>
  );
}
