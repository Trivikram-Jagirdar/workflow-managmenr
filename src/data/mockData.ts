import { User, Employee, Project, AttendanceRecord } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    designation: 'System Administrator'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    password: 'password123',
    role: 'employee',
    designation: 'Software Developer'
  },
  {
    id: '3',
    name: 'Client User',
    email: 'client@company.com',
    password: 'password123',
    role: 'client',
    designation: 'Project Manager'
  }
];

// Initialize localStorage with default users if empty
if (typeof window !== 'undefined') {
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
}

export const mockEmployees: Employee[] = [
  {
    id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'employee',
    designation: 'Software Developer',
    department: 'Engineering',
    phone: '9876543210',
    employmentType: 'full-time',
    workingShift: 'day'
  }
];

export const mockProjects: Project[] = [];
export const mockAttendance: AttendanceRecord[] = [];