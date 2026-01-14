import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import GalleryPage from './pages/GalleryPage'
import NewsPage from './pages/NewsPage'
import Donation from './pages/Donation'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import TestControls from './pages/TestControls'
import NotFound from './pages/NotFound'
import MajorMembers from './pages/MajorMembers'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/gallery"
          element={
            <>
              <GalleryPage />
            </>
          }
        />
        <Route
          path="/news"
          element={
            <>
              <NewsPage />
            </>
          }
        />
        <Route
          path="/donation"
          element={
            <>
              <Header />
              <Donation />
              <Footer />
            </>
          }
        />
        <Route
          path="/core-team"
          element={
            <>
              <Header />
              <MajorMembers />
              <Footer />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Header />
              <Profile />
              <Footer />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        {/* Hidden Test Controls Route - Not visible in UI */}
        {/* <Route path="/test-controls" element={<TestControls />} /> */}
        {/* 404 Page - Catch all unmatched routes */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <NotFound />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default App
