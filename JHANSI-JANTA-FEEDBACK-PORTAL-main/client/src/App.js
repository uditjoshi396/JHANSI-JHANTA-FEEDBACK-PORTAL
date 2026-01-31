import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import EasySubmission from './pages/EasySubmission';
import RealTimeTracking from './pages/RealTimeTracking';
import SecurePrivate from './pages/SecurePrivate';
import AIPoweredSupport from './pages/AIPoweredSupport';
import MobileOptimized from './pages/MobileOptimized';
import FastResolution from './pages/FastResolution';
import ThemeToggle from './components/ThemeToggle';
import AIChatbot from './components/AIChatbot';
import './App.css';

function App(){
  // Security: Auto-logout on app start if token is expired
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (token && tokenExpiry) {
      if (Date.now() > parseInt(tokenExpiry)) {
        // Token expired, clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
      }
    }
  }, []);

  // Security: Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Security: Prevent common keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <ThemeToggle />
      <AIChatbot />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/statistics' element={<Statistics/>} />
        <Route path='/privacy' element={<PrivacyPolicy/>} />
        <Route path='/terms' element={<TermsOfService/>} />
        <Route path='/contact' element={<Contact/>} />
        <Route path='/features/easy-submission' element={<EasySubmission/>} />
        <Route path='/features/real-time-tracking' element={<RealTimeTracking/>} />
        <Route path='/features/secure-private' element={<SecurePrivate/>} />
        <Route path='/features/ai-powered-support' element={<AIPoweredSupport/>} />
        <Route path='/features/mobile-optimized' element={<MobileOptimized/>} />
        <Route path='/features/fast-resolution' element={<FastResolution/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
