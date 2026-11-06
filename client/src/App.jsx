import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { SellPage } from './pages/SellPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout for Public Pages (with Navbar and Footer)
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/properties"
          element={
            <PublicLayout>
              <PropertiesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <PublicLayout>
              <PropertyDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/sell"
          element={
            <PublicLayout>
              <SellPage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Control Desk */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="min-h-screen pt-36 pb-20 text-center flex flex-col items-center justify-center px-6">
                <h2 className="text-3xl font-bold text-primary">Page Not Found</h2>
                <p className="text-sm text-charcoal-500 mt-2">
                  The page you are looking for does not exist or has been moved.
                </p>
                <a
                  href="/"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-gold text-white font-bold text-xs"
                >
                  Return to Home
                </a>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
