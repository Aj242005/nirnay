import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import OfficerLayout from '@/components/layout/OfficerLayout';
import LoginPage from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tenders from '@/pages/Tenders';
import Upload from '@/pages/Upload';
import Evaluation from '@/pages/Evaluation';
import Credibility from '@/pages/Credibility';
import Review from '@/pages/Review';
import ExportPage from '@/pages/Export';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider requiredRole="officer">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><OfficerLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tenders" element={<Tenders />} />
          <Route path="upload" element={<Upload />} />
          <Route path="evaluation" element={<Evaluation />} />
          <Route path="credibility" element={<Credibility />} />
          <Route path="review" element={<Review />} />
          <Route path="export" element={<ExportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
