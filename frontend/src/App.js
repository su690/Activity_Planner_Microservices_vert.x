import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// Auth Context
const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, { email, password, name });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      <Router>
        <div className="app">
          <nav className="navbar">
            <h1>Activity Planner</h1>
            <div className="nav-links">
              {user ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/activities">Activities</Link>
                  <Link to="/plans">My Plans</Link>
                  <Link to="/notifications">Notifications</Link>
                  <button onClick={logout} className="btn btn-danger">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </nav>
          <div className="container">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/activities" element={user ? <Activities /> : <Navigate to="/login" />} />
              <Route path="/plans" element={user ? <Plans /> : <Navigate to="/login" />} />
              <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Demo: admin@activity.com / admin123
      </p>
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, name);
    if (result.success) {
      setSuccess(true);
      setError('');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>Registration successful! Please login.</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const { user } = React.useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, plansRes] = await Promise.all([
        axios.get(`${API_BASE}/activities`),
        axios.get(`${API_BASE}/plans/user/${user?.sub || 'user-1'}`)
      ]);
      setActivities(activitiesRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Welcome, {user?.name || 'User'}!</h2>
      <div className="grid" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3>Available Activities</h3>
          <p style={{ fontSize: '2rem', color: '#007bff' }}>{activities.length}</p>
        </div>
        <div className="card">
          <h3>My Plans</h3>
          <p style={{ fontSize: '2rem', color: '#28a745' }}>{plans.length}</p>
        </div>
        <div className="card">
          <h3>Account Status</h3>
          <p style={{ fontSize: '1.2rem' }}>Active</p>
          <p>Role: {user?.role || 'USER'}</p>
        </div>
      </div>
    </div>
  );
}

function Activities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  return (
    <div>
      <h2>Available Activities</h2>
      <div className="grid" style={{ marginTop: '20px' }}>
        {activities.map(activity => (
          <div key={activity.id} className="card">
            <h3>{activity.name}</h3>
            <p>{activity.description}</p>
            <p><strong>Category:</strong> {activity.category}</p>
            <p><strong>Duration:</strong> {activity.duration} minutes</p>
            <p><strong>Location:</strong> {activity.location}</p>
            <button className="btn btn-primary" style={{ marginTop: '10px' }}>
              Plan This Activity
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Plans() {
  const [plans, setPlans] = useState([]);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE}/plans/user/${user?.sub || 'user-1'}`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  return (
    <div>
      <h2>My Activity Plans</h2>
      <div style={{ marginTop: '20px' }}>
        {plans.length === 0 ? (
          <p>No plans yet. Go to Activities to create one!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id}>
                  <td>{plan.activityName}</td>
                  <td>{plan.scheduledDate}</td>
                  <td>{plan.scheduledTime}</td>
                  <td className={`status-${plan.status.toLowerCase()}`}>{plan.status}</td>
                  <td>{plan.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notifications/user/${user?.sub || 'user-1'}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      <div style={{ marginTop: '20px' }}>
        {notifications.length === 0 ? (
          <p>No notifications.</p>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className="card" style={{ 
              opacity: notif.isRead ? 0.7 : 1,
              borderLeft: notif.isRead ? 'none' : '4px solid #007bff'
            }}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                {new Date(notif.createdAt).toLocaleString()}
              </p>
              {!notif.isRead && (
                <button onClick={() => markAsRead(notif.id)} className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

