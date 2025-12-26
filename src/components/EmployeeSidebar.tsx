import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { LayoutDashboard, MapPin, FolderKanban, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface EmployeeSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Mark Attendance', icon: MapPin },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'profile', label: 'My Details', icon: User }
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">WorkFlow Pro</h2>
        <p className="text-sm text-gray-500">Employee Portal</p>
      </div>

      {/* User Profile Section */}
      <div className="mb-6 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 truncate">{user?.designation}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                currentPage === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button at Bottom */}
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;