
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';
import BulkTaskCreate from './pages/BulkTaskCreate';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtected from './components/RoleProtected';
import Header from './components/Header';
import Analytics from './pages/Analytics';
import Users from './pages/Users';

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
          <Route path="/tasks/bulk" element={<ProtectedRoute><BulkTaskCreate /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
          <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />

          <Route path="/analytics" element={<ProtectedRoute><RoleProtected allowedRoles={["manager","admin"]}><Analytics /></RoleProtected></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><RoleProtected allowedRoles={["manager","admin"]}><Users /></RoleProtected></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

