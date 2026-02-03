import React, { useEffect, useState } from 'react';
import { listUsers, updateUserRole } from '../services/usersService';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice';
import './Users.css'; // Import the CSS file

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listUsers({ limit: 200 });
      setUsers(res.data.data || []);
    } catch (e) {
      console.warn('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = async (id, role) => {
    if (!confirm('Change role?')) return;
    try {
      await updateUserRole(id, role);
      await load();
      // refresh current user if affected
      if (String(auth.user?.id) === String(id)) {
        dispatch(fetchMe());
      }
    } catch (e) {
      alert('Failed to update role: ' + (e.response?.data?.message || e.message));
    }
  };

  if (loading) return <div className="users-loading">Loading users</div>;

  return (
    <div className="users-container">
      <h2>User Management</h2>
      <div className="card">
        <div className="users-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="users-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td data-label="Name">{u.name}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Role">
                      <select value={u.role} onChange={(e) => handleChange(u._id, e.target.value)}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        {auth.user?.role === 'admin' && <option value="admin">Admin</option>}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}