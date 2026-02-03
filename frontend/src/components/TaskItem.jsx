import React from 'react';
import { Link } from 'react-router-dom';
import './TaskItem.css';

export default function TaskItem({ task, onDelete }) {
  return (
    <div className="card task-item">
      <div className="task-item__wrapper">
        <div className="task-item__content">
          <h4 className="task-item__title">{task.title}</h4>
          <div className="task-item__meta">
            <span className="task-item__meta-item">{task.priority}</span>
            <span className="task-item__meta-separator">•</span>
            <span className="task-item__meta-item">{task.status}</span>
            {task.dueDate && (
              <>
                <span className="task-item__meta-separator">•</span>
                <span className="task-item__meta-item">
                  due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          {task.assignee && (
            <div className="task-item__assignee">
              Assigned to: {task.assignee.name || task.assignee}
            </div>
          )}
        </div>
        <div className="task-item__actions">
          <Link to={`/tasks/${task._id}`} className="task-item__btn-view">
            View
          </Link>
          {['manager','admin'].includes(task.currentUserRole || '') && (
            <Link to={`/tasks/${task._id}/edit`} className="task-item__btn-edit">
              Edit
            </Link>
          )}
          {task.canChangeStatus && (
            <select 
              value={task.status} 
              onChange={(e) => task.onChangeStatus(task._id, e.target.value)}
              className="task-item__status-select"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
          )}
          {['manager','admin'].includes(task.currentUserRole || '') && (
            <button 
              className="task-item__btn-delete" 
              onClick={() => onDelete(task._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}