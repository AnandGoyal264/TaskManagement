import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import * as analyticsService from '../services/analyticsService';
import './Analytics.css'; // Import the CSS file

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function Analytics() {
  const auth = useSelector((s) => s.auth);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (auth.user?.role === 'manager' || auth.user?.role === 'admin') {
      import('../services/usersService').then((m) => m.listUsers()).then((res) => setUsers(res.data.data)).catch(() => {});
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.role]);

  useEffect(() => {
    load();
  }, [selectedUser]);

  const load = async () => {
    setLoading(true);
    try {
      const params = selectedUser ? { assignee: selectedUser } : {};
      const s = await analyticsService.getSummary(params);
      const t = await analyticsService.getTrends({ days: 30, ...params });
      setSummary(s.data.data);
      setTrends(t.data.data);
    } catch (e) {
      console.warn('Analytics load failed', e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = async () => {
    try {
      const res = await analyticsService.exportTasksCsv({});
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Export failed', e);
    }
  };

  if (loading || !summary) return <div className="analytics-loading">Loading analytics...</div>;

  const statusData = summary.byStatus.map((s) => ({ name: s._id, value: s.count }));
  const priorityData = summary.byPriority.map((p) => ({ name: p._id, value: p.count }));

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="analytics-controls">
          {(auth.user?.role === 'manager' || auth.user?.role === 'admin') && (
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          )}
          <button className="btn" onClick={downloadCsv}>Export CSV</button>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card">
          <h4>Task Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie dataKey="value" data={statusData} outerRadius={80} fill="#8884d8" label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h4>Priority Breakdown</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie dataKey="value" data={priorityData} outerRadius={80} fill="#82ca9d" label>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell2-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-full-width">
          <h4>Tasks Created (last 30 days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-full-width">
          <h4>Top Users (by tasks created)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={summary.topUsers.map((u) => ({ name: u.user?.name || 'Unknown', created: u.created }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="created" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}