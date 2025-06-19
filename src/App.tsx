import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboards';
import ReportViewer from './components/ReportViewer';
import Scripts from './components/Scripts';
import Knowledge from './components/Knowledge';
import PolicyViewer from './components/PolicyViewer';
import ArchiveReports from './components/Analytics/ArchiveReports';
import AnalyticsDashboard from './components/Analytics/Dashboard';
import axios, { AxiosError } from 'axios';
import debounce from 'lodash.debounce';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [lastActivity, setLastActivity] = useState(() => {
    const savedTime = localStorage.getItem('lastActivity');
    return savedTime ? parseInt(savedTime, 10) : Date.now();
  });
  const [showInactivityDialog, setShowInactivityDialog] = useState(false);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleActivity = debounce(async () => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem('lastActivity', now.toString());

    if (user) {
      try {
        await axios.post('/api/update-last-visit', {
          userId: user.id,
          lastVisit: formatDate(now),
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.message);
          if (error.response) {
            console.error('Server response:', error.response.data);
            console.error('Status code:', error.response.status);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Request setup error:', error.message);
          }
        } else {
          console.error('Unknown error:', error);
        }
      }
    }
  }, 5000);

  useEffect(() => {
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 90 * 60 * 1000) {
        setShowInactivityDialog(true);
        handleLogout();
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(checkInactivity);
    };
  }, [lastActivity, user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  };

  const handleCloseInactivityDialog = () => {
    setShowInactivityDialog(false);
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        {showInactivityDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Сессия завершена
              </h2>
              <p className="text-gray-600 mb-6">
                В случае, если Вы не совершаете активных действий в системе,
                рабочая сессия продолжает оставаться активной в течение 90
                минут, после чего произойдёт автоматический выход.
                <br />
                <br />
                Для дальнейшей работы Вам необходимо снова войти в систему.
              </p>
              <button
                onClick={handleCloseInactivityDialog}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ок
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="report/:type" element={<ReportViewer />} />
          <Route path="scripts" element={<Scripts />} />
          <Route path="knowledge" element={<Knowledge />} />
          
          <Route path="analytics/archive" element={<ArchiveReports user={user} />} />
          <Route path="analytics/dashboard" element={<AnalyticsDashboard user={user} />} />
          <Route path="agreement" element={<PolicyViewer type="agreement" />} />
          <Route path="privacy" element={<PolicyViewer type="privacy" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;