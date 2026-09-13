import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome back, {user?.display_name}!</h1>
      <p>This is your protected workspace dashboard.</p>
      
      <div style={{ marginTop: 40 }}>
        <h3>Your Details</h3>
        <ul>
          <li>Email: {user?.email}</li>
          <li>User ID: {user?.id}</li>
          <li>Status: {user?.global_status}</li>
        </ul>
        
        <div style={{ marginTop: '2rem' }}>
          <Link to="/documents" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>
            Go to Documents Management &rarr;
          </Link>
        </div>
      </div>

      <button onClick={logout} style={{ marginTop: 20, padding: '10px 20px' }}>
        Log Out
      </button>
    </div>
  );
}
