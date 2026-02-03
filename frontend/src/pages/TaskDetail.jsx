import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTask } from '../store/slices/tasksSlice';
import { useParams, Link } from 'react-router-dom';
import CommentForm from '../components/CommentForm';
import CommentItem from '../components/CommentItem';
import { updateTask } from '../store/slices/tasksSlice';
import * as fileService from '../services/fileService';
import './TaskDetail.css'; // Import the CSS file

export default function TaskDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const { current, loading, error } = useSelector((s) => s.tasks);
  const [files, setFiles] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [commentLoading, setCommentLoading] = React.useState(false);

  const fetchComments = async () => {
    try {
      const m = await import('../services/commentService');
      const res = await m.getCommentsByTask(id);
      setComments(res.data.data || []);
    } catch (e) {
      console.warn('Failed to load comments', e.message);
      if (e.response && e.response.status === 401) {
        alert('You are not authenticated. Please log in to view comments.');
      }
    }
  };

  useEffect(() => {
    dispatch(fetchTask(id));
    fetchFiles();
    fetchComments();

    let poll = null;
    if (auth.user) {
      poll = setInterval(async () => {
        try {
          await fetchFiles();
          await fetchComments();
        } catch (e) {
          // ignore poll errors
        }
      }, 5000);
    }

    return () => {
      if (poll) clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, auth.user]);

  const fetchFiles = async () => {
    try {
      const m = await import('../services/fileService');
      const res = await m.getFilesByTask(id);
      setFiles(res.data.data || []);
    } catch (e) {
      console.warn('Failed to load files', e.message);
      if (e.response && e.response.status === 401) {
        alert('You are not authenticated. Please log in to view files.');
      }
    }
  };

  const handleUpload = async (e) => {
    const list = e.target.files || [];
    if (!list.length) return;
    const form = new FormData();
    for (const f of list) form.append('files', f);
    form.append('taskId', id);
    try {
      setUploading(true);
      const m = await import('../services/fileService');
      const result = await m.uploadFiles(form);
      console.log('Upload successful:', result);
      await fetchFiles();
      alert('Files uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      alert('Upload failed: ' + errorMsg);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Delete this file?')) return;
    try {
      const m = await import('../services/fileService');
      await m.deleteFile(fileId);
      await fetchFiles();
    } catch (err) {
      console.warn('Delete failed', err);
    }
  };

  // Check if current user is an assignee
  const isAssignee = auth.user?.role === 'employee' && (String(auth.user?.id || auth.user?._id) === String(current.assignee) || (current.assignees && current.assignees.some(a => String(a._id || a) === String(auth.user?.id || auth.user?._id))));

  const handleMarkComplete = async () => {
    try {
      await dispatch(updateTask({ id: current._id, payload: { status: 'done' } })).unwrap();
      await dispatch(fetchTask(current._id));
    } catch (err) {
      console.error('Failed to mark task as complete:', err);
    }
  };

  if (loading || !current) return <div className="task-detail-loading">Loading...</div>;
  if (error) return <div className="task-detail-container"><div className="error">{error.message || JSON.stringify(error)}</div></div>;

  return (
    <div className="task-detail-container">
      <div className="task-detail-header">
        <h2>{current.title}</h2>
        <div className="task-detail-actions">
          {isAssignee && current.status !== 'done' && (
            <button className="btn btn-success" onClick={handleMarkComplete}>
              ✓ Mark as Complete
            </button>
          )}
          {isAssignee && current.status === 'done' && (
            <span className="task-completed-badge">✓ Completed</span>
          )}
          <Link to={`/tasks/${id}/edit`} className="btn-link">Edit Task</Link>
        </div>
      </div>

      <div className="card">
        <p>
          <strong>Status:</strong>
          {(auth.user?.role === 'employee' && (String(auth.user?.id || auth.user?._id) === String(current.assignee) || (current.assignees && current.assignees.some(a => String(a._id || a) === String(auth.user?.id || auth.user?._id))))) || (auth.user?.role === 'manager' || auth.user?.role === 'admin') ? (
            <select value={current.status} onChange={async (e) => { await dispatch(updateTask({ id: current._id, payload: { status: e.target.value } })); await dispatch(fetchTask(current._id)); }}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
          ) : (
            ` ${current.status}`
          )}
        </p>
        <p><strong>Priority:</strong> {current.priority}</p>
        <p>
          <strong>Assigned To:</strong> 
          {current.assignees && current.assignees.length > 0 ? (
            <span>{current.assignees.map((a, i) => (
              <span key={i}>
                {typeof a === 'object' ? a.name : a}
                {i < current.assignees.length - 1 ? ', ' : ''}
              </span>
            ))}</span>
          ) : current.assignee ? (
            <span>{typeof current.assignee === 'object' ? current.assignee.name : current.assignee}</span>
          ) : (
            <span>Unassigned</span>
          )}
        </p>
        <p><strong>Due:</strong> {current.dueDate ? new Date(current.dueDate).toLocaleDateString() : '—'}</p>
        <p><strong>Description:</strong></p>
        <div>{current.description || 'No description'}</div>
      </div>

      <h3>Files</h3>
      <div className="card">
        <input type="file" multiple onChange={handleUpload} />
        {uploading && <div className="uploading-indicator">Uploading files</div>}
        <ul>
          {files.map((f) => (
            <li key={f._id}>
              <button className="btn-link" onClick={async () => {
                  try {
                    // Get the file URL from backend
                    const m = await import('../services/fileService');
                    const urlRes = await m.getFileUrl(f._id);
                    
                    if (urlRes.data.data?.url) {
                      // Open the URL in a new window for viewing/downloading
                      window.open(urlRes.data.data.url, '_blank');
                    } else {
                      alert('File URL not available');
                    }
                  } catch (e) {
                    console.error('Download error:', e);
                    alert('Download failed: ' + (e.response?.data?.message || e.message));
                  }
                }}>{f.originalName}</button>
              <div>
                <button className="btn-link" onClick={async () => {
                  try {
                    const m = await import('../services/fileService');
                    const response = await m.downloadFileBlob(f._id);
                    // response.data is already a Blob when responseType is 'blob'
                    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: f.mimeType || 'application/octet-stream' });
                    
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = f.originalName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => window.URL.revokeObjectURL(link.href), 100);
                  } catch (e) {
                    console.error('Download error:', e);
                    alert('Download failed: ' + (e.response?.data?.message || e.message));
                  }
                }}>Download</button>
                <button className="btn" onClick={() => handleDeleteFile(f._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <h3>Comments</h3>
      <div className="card">
        <CommentForm
          submitLabel="Add Comment"
          onSubmit={async (text) => {
            try {
              setCommentLoading(true);
              const m = await import('../services/commentService');
              await m.addComment({ text, taskId: id });
              await fetchFiles();
              await fetchComments();
            } catch (e) {
              console.warn('Failed to add comment', e);
            } finally {
              setCommentLoading(false);
            }
          }}
          loading={commentLoading}
        />

        <div className="comments-section">
          {comments.length === 0 && <div className="no-comments">No comments yet.</div>}
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              onDelete={async (cid) => {
                if (!confirm('Delete this comment?')) return;
                try {
                  const m = await import('../services/commentService');
                  await m.deleteComment(cid);
                  await fetchComments();
                } catch (e) {
                  console.warn('Delete failed', e);
                }
              }}
              onEdit={async (cid, text) => {
                try {
                  const m = await import('../services/commentService');
                  await m.updateComment(cid, { text });
                  await fetchComments();
                } catch (e) {
                  console.warn('Update failed', e);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}