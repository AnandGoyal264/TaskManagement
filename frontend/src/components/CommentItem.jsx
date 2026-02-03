import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import './CommentItem.css';

export default function CommentItem({ comment, onEdit, onDelete }) {
  const { user } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);

  const isAuthor = user && (String(user.id || user._id) === String(comment.author._id || comment.author));
  const isManagerOrAdmin = user && ['manager', 'admin'].includes(user.role);
  const canEdit = isAuthor || isManagerOrAdmin;

  return (
    <div className="comment-item">
      <div className="comment-item__header">
        <div className="comment-item__author-info">
          <span className="comment-item__author-name">
            {comment.author?.name || 'Unknown'}
          </span>
          <span className="comment-item__timestamp">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        {canEdit && (
          <div className="comment-item__actions">
            <button 
              className="comment-item__btn-edit" 
              onClick={() => setEditing((s) => !s)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button 
              className="comment-item__btn-delete" 
              onClick={() => onDelete(comment._id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="comment-item__text">{comment.text}</div>
      ) : (
        <div className="comment-item__edit-section">
          <textarea 
            defaultValue={comment.text} 
            rows={3} 
            id={`edit-${comment._id}`}
            className="comment-item__textarea"
          />
          <div className="comment-item__edit-actions">
            <button
              className="comment-item__btn-save"
              onClick={() => {
                const val = document.getElementById(`edit-${comment._id}`).value.trim();
                if (!val) return;
                onEdit(comment._id, val);
                setEditing(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}