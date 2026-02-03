import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, fetchTask, updateTask, clearCurrent } from '../store/slices/tasksSlice';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskForm.css'; // Import the CSS file

export default function TaskForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector((s) => s.tasks);
  const auth = useSelector((s) => s.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [users, setUsers] = useState([]);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);

  const toggleAssignee = (userId) => {
    if (assignees.includes(userId)) {
      setAssignees(assignees.filter(id => id !== userId));
    } else {
      setAssignees([...assignees, userId]);
    }
  };

  const removeAssignee = (userId) => {
    setAssignees(assignees.filter(id => id !== userId));
  };

  useEffect(() => {
    // fetch users for assignee select (only employees)
    const fetchUsers = async () => {
      try {
        const usersModule = await import('../services/usersService');
        const res = await usersModule.getAllUsers();
        const employees = (res.data?.data || []).filter((u) => u.role === 'employee');
        setUsers(employees);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (id) dispatch(fetchTask(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  useEffect(() => {
    if (current && id) {
      setTitle(current.title || '');
      setDescription(current.description || '');
      setStatus(current.status || 'todo');
      setPriority(current.priority || 'medium');
      setDueDate(current.dueDate ? new Date(current.dueDate).toISOString().slice(0, 10) : '');
      
      // Handle single assignee (for backward compatibility)
      const assigneeId = current.assignee && typeof current.assignee === 'object' ? current.assignee._id : (current.assignee || '');
      setAssignee(assigneeId);
      
      // Handle multiple assignees
      const assigneeIds = current.assignees ? current.assignees.map(a => typeof a === 'object' ? a._id : a) : [];
      setAssignees(assigneeIds);
    }
  }, [current, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Use assignees array if multiple are selected, otherwise use single assignee
    const payload = { 
      title, 
      description, 
      status, 
      priority, 
      dueDate: dueDate || null,
      assignees: assignees.length > 0 ? assignees : (assignee ? [assignee] : [])
    };
    try {
      if (id) {
        await dispatch(updateTask({ id, payload })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      navigate('/tasks');
    } catch (err) {
      // handled by slice
    }
  };

  return (
    <div className="task-form-container">
      <h2>{id ? 'Edit Task' : 'Create New Task'}</h2>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error">{error.message || JSON.stringify(error)}</div>}
        
        <label>
          Title
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter task title"
            required 
          />
        </label>

        <label>
          Description
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task in detail..."
          />
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        {/* Assign To Section - Visible for Managers/Admins */}
        {['manager','admin'].includes(auth.user?.role) && users.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', background: '#f9f9f9' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong style={{ fontSize: '16px' }}>Assign To Employees</strong>
            </label>
            
            {/* Selected Assignees Tags */}
            {assignees.length > 0 && (
              <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {assignees.map(id => {
                  const user = users.find(u => u._id === id);
                  return (
                    <div
                      key={id}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {user?.name}
                      <button
                        type="button"
                        onClick={() => removeAssignee(id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{assignees.length > 0 ? `${assignees.length} selected` : 'Select employees...'}</span>
                <span style={{ fontSize: '12px' }}>▼</span>
              </button>
              
              {/* Dropdown Menu */}
              {assigneeDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 10,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  {users.map(user => (
                    <label
                      key={user._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        background: assignees.includes(user._id) ? '#f0f4ff' : 'white'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                      onMouseOut={(e) => e.target.style.background = assignees.includes(user._id) ? '#f0f4ff' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={assignees.includes(user._id)}
                        onChange={() => toggleAssignee(user._id)}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
              Select one or more employees to assign this task
            </small>
          </div>
        )}

        {/* Message for non-managers */}
        {!['manager','admin'].includes(auth.user?.role) && (
          <div style={{ marginBottom: '20px', padding: '12px', background: '#e8f4f8', border: '1px solid #b8dce8', borderRadius: '4px', color: '#333', fontSize: '14px' }}>
            <strong>Note:</strong> Only managers and admins can assign tasks to employees.
          </div>
        )}

        {/* Assign By User ID - for direct assignment */}
        {['manager','admin'].includes(auth.user?.role) && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <strong>Assign by Employee ID (Optional)</strong>
              <input
                type="text"
                placeholder="Paste employee ID to quickly assign (e.g., 507f1f77bcf86cd799439011)"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
                onChange={(e) => {
                  const id = e.target.value.trim();
                  if (id && !assignees.includes(id)) {
                    setAssignees([...assignees, id]);
                    e.target.value = '';
                  }
                }}
              />
              <small style={{ display: 'block', marginTop: '6px', color: '#666' }}>
                Paste an employee's ID and press Enter or click outside to add
              </small>
            </label>
          </div>
        )}

        <label>
          Due Date
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving' : (id ? 'Update Task' : 'Create Task')}
        </button>
      </form>
    </div>
  );
}