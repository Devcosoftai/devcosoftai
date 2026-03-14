import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public layout
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Public pages
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminContactDetailPage from './pages/admin/AdminContactDetailPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Auth context & guard
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute/ProtectedRoute';

import './styles/globals.css';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/about"    element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact"  element={<PublicLayout><ContactPage /></PublicLayout>} />

          {/* Admin — Public */}
          <Route path="/admin"        element={<AdminLoginPage />} />
          <Route path="/admin/login"  element={<AdminLoginPage />} />

          {/* Admin — Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/contacts/:id" element={
            <ProtectedRoute><AdminContactDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute><AdminSettingsPage /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div style={{
                minHeight: '60vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '1rem',
                color: 'var(--muted)', fontFamily: 'var(--font-display)',
              }}>
                <div style={{ fontSize: '4rem' }}>404</div>
                <div style={{ fontSize: '1.1rem' }}>Page not found</div>
                <a href="/" style={{ color: 'var(--cyan)', fontSize: '0.9rem' }}>← Go Home</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
