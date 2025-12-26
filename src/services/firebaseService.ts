import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { Employee, AttendanceRecord, Project, Issue } from '../types';

// Collections
const EMPLOYEES_COLLECTION = 'employees';
const ATTENDANCE_COLLECTION = 'attendance';
const PROJECTS_COLLECTION = 'projects';
const ISSUES_COLLECTION = 'issues';

// LocalStorage fallback keys
const LS_EMPLOYEES = 'ls_employees';
const LS_ATTENDANCE = 'ls_attendance';
const LS_PROJECTS = 'ls_projects';
const LS_ISSUES = 'ls_issues';

// Helper to check if Firebase is available
const isFirebaseAvailable = async (): Promise<boolean> => {
  try {
    await getDocs(collection(db, EMPLOYEES_COLLECTION));
    return true;
  } catch (error) {
    console.warn('Firebase not available, using localStorage fallback');
    return false;
  }
};

// LocalStorage helpers
const getFromLS = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToLS = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Employee Service
export const employeeService = {
  async create(employee: Omit<Employee, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
        ...employee,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...employee };
    } catch (error) {
      console.warn('Firebase create failed, using localStorage:', error);
      // Fallback to localStorage
      const employees = getFromLS<Employee>(LS_EMPLOYEES);
      const newEmployee = { id: Date.now().toString(), ...employee };
      employees.push(newEmployee);
      saveToLS(LS_EMPLOYEES, employees);
      return newEmployee;
    }
  },

  async getAll(): Promise<Employee[]> {
    try {
      const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    } catch (error) {
      console.warn('Firebase getAll failed, using localStorage:', error);
      return getFromLS<Employee>(LS_EMPLOYEES);
    }
  },

  async update(id: string, data: Partial<Employee>) {
    try {
      const docRef = doc(db, EMPLOYEES_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Firebase update failed, using localStorage:', error);
      const employees = getFromLS<Employee>(LS_EMPLOYEES);
      const index = employees.findIndex(e => e.id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...data };
        saveToLS(LS_EMPLOYEES, employees);
      }
    }
  },

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
    } catch (error) {
      console.warn('Firebase delete failed, using localStorage:', error);
      const employees = getFromLS<Employee>(LS_EMPLOYEES);
      const filtered = employees.filter(e => e.id !== id);
      saveToLS(LS_EMPLOYEES, filtered);
    }
  }
};

// Attendance Service
export const attendanceService = {
  async create(attendance: Omit<AttendanceRecord, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
        ...attendance,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...attendance };
    } catch (error) {
      console.warn('Firebase create failed, using localStorage:', error);
      const records = getFromLS<AttendanceRecord>(LS_ATTENDANCE);
      const newRecord = { id: Date.now().toString(), ...attendance };
      records.push(newRecord);
      saveToLS(LS_ATTENDANCE, records);
      return newRecord;
    }
  },

  async getAll(): Promise<AttendanceRecord[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
      console.warn('Firebase getAll failed, using localStorage:', error);
      return getFromLS<AttendanceRecord>(LS_ATTENDANCE);
    }
  },

  async getByUserId(userId: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(collection(db, ATTENDANCE_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    } catch (error) {
      console.warn('Firebase getByUserId failed, using localStorage:', error);
      const records = getFromLS<AttendanceRecord>(LS_ATTENDANCE);
      return records.filter(r => r.userId === userId);
    }
  },

  async getTodayByUserId(userId: string): Promise<AttendanceRecord | undefined> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(today))
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      return results[0];
    } catch (error) {
      console.warn('Firebase getTodayByUserId failed, using localStorage:', error);
      const records = getFromLS<AttendanceRecord>(LS_ATTENDANCE);
      const today = new Date().toDateString();
      return records.find(r => r.userId === userId && new Date(r.date).toDateString() === today);
    }
  },

  async update(id: string, data: Partial<AttendanceRecord>) {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Firebase update failed, using localStorage:', error);
      const records = getFromLS<AttendanceRecord>(LS_ATTENDANCE);
      const index = records.findIndex(r => r.id === id);
      if (index !== -1) {
        records[index] = { ...records[index], ...data };
        saveToLS(LS_ATTENDANCE, records);
      }
    }
  }
};

// Project Service
export const projectService = {
  async create(project: Omit<Project, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...project,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...project };
    } catch (error) {
      console.warn('Firebase create failed, using localStorage:', error);
      const projects = getFromLS<Project>(LS_PROJECTS);
      const newProject = { id: Date.now().toString(), ...project };
      projects.push(newProject);
      saveToLS(LS_PROJECTS, projects);
      return newProject;
    }
  },

  async getAll(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    } catch (error) {
      console.warn('Firebase getAll failed, using localStorage:', error);
      return getFromLS<Project>(LS_PROJECTS);
    }
  },

  async getByClientId(clientId: string): Promise<Project[]> {
    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        where('assignedClients', 'array-contains', clientId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    } catch (error) {
      console.warn('Firebase getByClientId failed, using localStorage:', error);
      const projects = getFromLS<Project>(LS_PROJECTS);
      return projects.filter(p => p.assignedClients?.includes(clientId));
    }
  },

  async update(id: string, data: Partial<Project>) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Firebase update failed, using localStorage:', error);
      const projects = getFromLS<Project>(LS_PROJECTS);
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...data };
        saveToLS(LS_PROJECTS, projects);
      }
    }
  },

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
    } catch (error) {
      console.warn('Firebase delete failed, using localStorage:', error);
      const projects = getFromLS<Project>(LS_PROJECTS);
      const filtered = projects.filter(p => p.id !== id);
      saveToLS(LS_PROJECTS, filtered);
    }
  }
};

// Issue Service
export const issueService = {
  async create(issue: Omit<Issue, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, ISSUES_COLLECTION), {
        ...issue,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...issue };
    } catch (error) {
      console.warn('Firebase create failed, using localStorage:', error);
      const issues = getFromLS<Issue>(LS_ISSUES);
      const newIssue = { id: Date.now().toString(), ...issue };
      issues.push(newIssue);
      saveToLS(LS_ISSUES, issues);
      return newIssue;
    }
  },

  async getAll(): Promise<Issue[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ISSUES_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue));
    } catch (error) {
      console.warn('Firebase getAll failed, using localStorage:', error);
      return getFromLS<Issue>(LS_ISSUES);
    }
  },

  async getByUserId(userId: string): Promise<Issue[]> {
    try {
      const q = query(collection(db, ISSUES_COLLECTION), where('createdByUserId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Issue));
    } catch (error) {
      console.warn('Firebase getByUserId failed, using localStorage:', error);
      const issues = getFromLS<Issue>(LS_ISSUES);
      return issues.filter(i => i.clientId === userId);
    }
  },

  async update(id: string, data: Partial<Issue>) {
    try {
      const docRef = doc(db, ISSUES_COLLECTION, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.warn('Firebase update failed, using localStorage:', error);
      const issues = getFromLS<Issue>(LS_ISSUES);
      const index = issues.findIndex(i => i.id === id);
      if (index !== -1) {
        issues[index] = { ...issues[index], ...data };
        saveToLS(LS_ISSUES, issues);
      }
    }
  }
};