import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice';
import * as analyticsService from '../services/analyticsService';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Import the CSS file

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const loadAssigned = async () => {
    try {
      const m = await import('../services/taskService');
      const res = await m.getTasks({ assignee: user.id, limit: 5 });
      setAssignedTasks(res.data.data || []);
    } catch (e) {
      console.warn('Failed to load assigned tasks', e);
    }
  };

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      load();
      if (user.role === 'employee') loadAssigned();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      // Backend returns personal summary for employees and org-level for managers/admins
      const res = await analyticsService.getSummary();
      setSummary(res.data.data);
    } catch (e) {
      console.warn('Failed to load dashboard summary', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="dashboard-loading">Loading...</div>;
  if (loading || !summary) return <div className="dashboard-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>Welcome, {user.name}!</h2>

      {user.role === 'manager' || user.role === 'admin' ? (
        <div className="grid">
          <div className="card">
            <h4>Organization Summary</h4>
            <p><strong>Total tasks:</strong> {summary.total}</p>
            <p><strong>Statuses:</strong></p>
            <ul>{summary.byStatus.map(s => <li key={s._id}>{s._id}: {s.count}</li>)}</ul>
            <div>
              <Link to="/analytics" className="btn">Open Analytics</Link>
              <Link to="/users" className="btn">Manage Users</Link>
            </div>
          </div>
          <div className="card">
            <h4>Top Users</h4>
            <ul>{summary.topUsers && summary.topUsers.map(u => <li key={u.user?.id}>{u.user?.name} — {u.created} tasks</li>)}</ul>
          </div>
        </div>
      ) : (
        <div className="grid">
          <div className="card">
            <h4>Your Assigned Tasks</h4>
            <ul>
              {assignedTasks.map((t) => (
                <li key={t._id}><a href={`/tasks/${t._id}`}>{t.title}</a> — {t.status}</li>
              ))}
            </ul>
            <Link to="/tasks" className="btn">All Tasks</Link>
          </div>
        </div>
      )}
    </div>
  );
}