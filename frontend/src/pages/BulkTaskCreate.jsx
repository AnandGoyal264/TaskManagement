import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as taskService from '../services/taskService';
import * as usersService from '../services/usersService';
import './BulkTaskCreate.css';

export default function BulkTaskCreate() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignees: [] }
  ]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersService.getAllUsers();
        // Filter to show only employees
        const employees = res.data?.data?.filter(u => u.role === 'employee') || [];
        setUsers(employees);
      } catch (err) {
        console.warn('Failed to load users:', err.message);
      }
    };
    fetchUsers();
  }, []);

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(-1);

  const handleAddRow = () => {
    setTasks([...tasks, { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignees: [] }]);
  };

  const handleRemoveRow = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const toggleAssignee = (taskIndex, userId) => {
    const updated = [...tasks];
    if (updated[taskIndex].assignees.includes(userId)) {
      updated[taskIndex].assignees = updated[taskIndex].assignees.filter(id => id !== userId);
    } else {
      updated[taskIndex].assignees = [...updated[taskIndex].assignees, userId];
    }
    setTasks(updated);
  };

  const removeAssignee = (taskIndex, userId) => {
    const updated = [...tasks];
    updated[taskIndex].assignees = updated[taskIndex].assignees.filter(id => id !== userId);
    setTasks(updated);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result || '';
        const lines = csv.split('\n').filter(line => line.trim());
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());

        const parsed = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          header.forEach((h, i) => {
            obj[h] = values[i] || '';
          });
          return {
            title: obj.title || obj.name || '',
            description: obj.description || obj.desc || '',
            priority: obj.priority || 'medium',
            status: obj.status || 'todo',
            dueDate: obj.duedate || obj.due || '',
            assignees: obj.assignees ? obj.assignees.split(';').filter(a => a.trim()) : []
          };
        });

        setTasks(parsed.filter(t => t.title));
        setError('');
        setSuccess(`Loaded ${parsed.filter(t => t.title).length} tasks from CSV`);
      } catch (err) {
        setError('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    const validTasks = tasks.filter(t => t.title?.trim());
    if (!validTasks.length) {
      setError('Please add at least one task with a title');
      return;
    }

    setLoading(true);
    try {
      await taskService.bulkCreate(validTasks);
      setSuccess(`Successfully created ${validTasks.length} tasks!`);
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-create-container">
      <div className="bulk-create-header">
        <h2>Bulk Create Tasks</h2>
        <p>Create multiple tasks at once</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="bulk-create-controls">
        <div>
          <label htmlFor="csv-upload">Upload CSV File:</label>
          <input 
            id="csv-upload"
            type="file" 
            accept=".csv" 
            onChange={handleCSVUpload}
            disabled={loading}
          />
          <small>CSV Format: title, description, priority, status, assignees (semicolon-separated IDs, optional), dueDate</small>
        </div>
        <button type="button" onClick={handleAddRow} disabled={loading} className="btn-secondary">
          + Add Row
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bulk-create-table-wrapper">
          <table className="bulk-create-table">
            <thead>
              <tr>
                <th>Title *</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assign To (Multiple Employees)</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                      placeholder="Task title"
                      required
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <textarea
                      value={task.description}
                      onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      disabled={loading}
                      rows="1"
                    />
                  </td>
                  <td>
                    <select
                      value={task.priority}
                      onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                      disabled={loading}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
                      disabled={loading}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td style={{ position: 'relative' }}>
                    {/* Selected Assignees Tags */}
                    {task.assignees && task.assignees.length > 0 && (
                      <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {task.assignees.map(id => {
                          const user = users.find(u => u._id === id);
                          return (
                            <div
                              key={id}
                              style={{
                                background: '#667eea',
                                color: 'white',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px'
                              }}
                            >
                              {user?.name?.split(' ')[0]}
                              <button
                                type="button"
                                onClick={() => removeAssignee(index, id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: '12px',
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
                    <button
                      type="button"
                      onClick={() => setDropdownOpenIndex(dropdownOpenIndex === index ? -1 : index)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      disabled={loading}
                    >
                      <span style={{ fontSize: '11px' }}>
                        {task.assignees?.length > 0 ? `${task.assignees.length} selected` : 'Select'}
                      </span>
                      <span style={{ fontSize: '10px' }}>▼</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {dropdownOpenIndex === index && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 4px 4px',
                        maxHeight: '200px',
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
                              padding: '8px 10px',
                              borderBottom: '1px solid #eee',
                              cursor: 'pointer',
                              background: task.assignees?.includes(user._id) ? '#f0f4ff' : 'white',
                              fontSize: '12px'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#f9f9f9'}
                            onMouseOut={(e) => e.target.style.background = task.assignees?.includes(user._id) ? '#f0f4ff' : 'white'}
                          >
                            <input
                              type="checkbox"
                              checked={task.assignees?.includes(user._id) || false}
                              onChange={() => toggleAssignee(index, user._id)}
                              style={{ marginRight: '6px', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value)}
                      disabled={loading}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="btn-remove"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bulk-create-footer">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : `Create ${tasks.filter(t => t.title?.trim()).length} Tasks`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
