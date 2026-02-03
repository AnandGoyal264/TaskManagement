import React, { useState } from 'react';
import './CommentForm.css';

export default function CommentForm({ initial = '', onSubmit, submitLabel = 'Add', loading = false }) {
  const [text, setText] = useState(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        rows={3}
        className="comment-form__textarea"
        placeholder="Write a comment..."
      />
      <div className="comment-form__actions">
        <button className="comment-form__btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}