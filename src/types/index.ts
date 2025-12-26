export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
  department?: string;
  phone?: string;
  employmentType?: string;
  workingShift?: string;
  joiningDate?: string;
  aadharNumber?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  role: string;
  designation?: string;
  department?: string;
  phone?: string;
  employmentType?: string;
  workingShift?: string;
  joiningDate?: string;
  aadharNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userDesignation: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  hoursWorked: number;
  workReport: string;
  isActive: boolean;
  isLate: boolean;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  tasks: Task[];
  assignedClients?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  assignedToName: string;
  dueDate?: string;
  createdAt: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Issue {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}