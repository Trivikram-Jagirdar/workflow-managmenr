import { useState, useEffect } from 'react';
import { employeeService, attendanceService, projectService, issueService } from '../services/firebaseService';
import type { Employee, AttendanceRecord, Project, Issue } from '../types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return { employees, loading, error, reload: loadEmployees };
};

export const useAttendance = (userId?: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = userId 
        ? await attendanceService.getByUserId(userId)
        : await attendanceService.getAll();
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [userId]);

  return { attendance, loading, error, reload: loadAttendance };
};

export const useProjects = (clientId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = clientId
        ? await projectService.getByClientId(clientId)
        : await projectService.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [clientId]);

  return { projects, loading, error, reload: loadProjects };
};

export const useIssues = (userId?: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = userId
        ? await issueService.getByUserId(userId)
        : await issueService.getAll();
      setIssues(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [userId]);

  return { issues, loading, error, reload: loadIssues };
};