import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, removeTask, updateTask } from '../store/slices/tasksSlice';
import TaskItem from '../components/TaskItem';
import { Link } from 'react-router-dom';
import './Tasks.css'; // Import the CSS file

export default function Tasks() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const { list, loading, error, meta } = useSelector((s) => s.tasks);

  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState('desc');

  useEffect(() => {
    const params = { page, limit, status, priority, search, sortBy, sortDir };
    dispatch(fetchTasks(params));
  }, [dispatch, page, limit, status, priority, search, sortBy, sortDir]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch(removeTask(id));
    }
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <div className="tasks-header-actions">
          <Link to="/tasks/new" className="btn">Create Task</Link>
          <Link to="/tasks/bulk" className="btn btn-secondary">Bulk Create</Link>
        </div>
      </div>

      <div className="tasks-filters">
        <div className="tasks-filters-grid">
          <input 
            placeholder="Search title or description" 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>
          <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <div className="tasks-per-page">
            <label>
              Per page:
              <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {loading && <div className="tasks-loading">Loading tasks</div>}
      {error && <div className="error">{error.message || JSON.stringify(error)}</div>}

      {!loading && list.length === 0 && (
        <div className="tasks-empty">
          No tasks found. Create your first task to get started!
        </div>
      )}

      <div className="tasks-grid">
        {list.map((t) => (
          <TaskItem
            key={t._id}
            task={{
              ...t,
              currentUserRole: auth.user?.role,
              canChangeStatus: (auth.user?.role === 'employee' && String(auth.user?.id || auth.user?._id) === String(t.assignee)) || auth.user?.role === 'manager' || auth.user?.role === 'admin',
              onChangeStatus: async (id, status) => {
                await dispatch(updateTask({ id, payload: { status } }));
                dispatch(fetchTasks());
              },
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {!loading && list.length > 0 && (
        <div className="tasks-pagination">
          <button disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
            Previous
          </button>
          <div className="tasks-pagination-info">
            Page {meta.page} of {meta.pages}
          </div>
          <button disabled={meta.page >= meta.pages} onClick={() => setPage(meta.page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}