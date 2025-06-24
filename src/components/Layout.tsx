import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

function Layout({ user, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-soft sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Home className="w-6 h-6 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Префектура ЮВАО
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.organization}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                title={isDark ? 'Светлая тема' : 'Темная тема'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                title="Выйти"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;