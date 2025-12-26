import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  FileText,
  Calendar,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  tasks: Task[];
  assignedClients?: string[]; // Array of client user IDs
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedToName: string;
  status: string;
  priority: string;
  dueDate: string;
  subtasks: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface Issue {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  createdByUserId: string;
}

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadData = () => {
    const storedProjects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
    const storedIssues: Issue[] = JSON.parse(localStorage.getItem('issues') || '[]');
    
    // Filter projects assigned to this client
    const clientProjects = storedProjects.filter(project => {
      const assignedClients = project.assignedClients || [];
      return assignedClients.includes(user?.id || '');
    });
    
    // Filter issues created by this client
    const clientIssues = storedIssues.filter(issue => issue.createdByUserId === user?.id);
    
    setProjects(clientProjects);
    setIssues(clientIssues);
  };

  const handleCreateIssue = () => {
    if (!newIssue.title || !newIssue.description || !selectedProject) {
      alert('Please fill in all fields');
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    const issue: Issue = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectTitle: project?.title || '',
      title: newIssue.title,
      description: newIssue.description,
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Client',
      createdByUserId: user?.id || ''
    };

    const updatedIssues = [...issues, issue];
    const allIssues = JSON.parse(localStorage.getItem('issues') || '[]');
    allIssues.push(issue);
    localStorage.setItem('issues', JSON.stringify(allIssues));
    setIssues(updatedIssues);
    setNewIssue({ title: '', description: '' });
    setSelectedProject('');
    setIsIssueDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-purple-100">Track your project progress and raise issues</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Projects you can access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.filter(i => i.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Issues pending resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Your Projects
              </CardTitle>
              <CardDescription>Projects assigned to you by the admin</CardDescription>
            </div>
            <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Raise Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Raise an Issue</DialogTitle>
                  <DialogDescription>Report a problem or ask a question about a project</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Project *</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Issue Title *</Label>
                    <Input
                      value={newIssue.title}
                      onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      placeholder="Detailed description of the issue or question"
                      rows={5}
                    />
                  </div>
                  <Button onClick={handleCreateIssue} className="w-full">
                    Submit Issue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No projects assigned yet</p>
              <p className="text-sm text-muted-foreground">
                Please contact the admin to get access to projects
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="mt-2">{project.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {project.startDate && (
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {project.endDate && (
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {project.tasks && project.tasks.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Project Tasks ({project.tasks.length})</p>
                        <div className="space-y-2">
                          {project.tasks.map((task) => (
                            <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-sm">{task.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {task.assignedToName}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Subtasks: {task.subtasks.filter(st => st.status === 'completed').length}/{task.subtasks.length} completed
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            My Issues & Tickets
          </CardTitle>
          <CardDescription>Issues and questions you've raised</CardDescription>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No issues raised yet</p>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{issue.title}</CardTitle>
                        <CardDescription>Project: {issue.projectTitle}</CardDescription>
                      </div>
                      <Badge variant={issue.status === 'open' ? 'default' : 'secondary'}>
                        {issue.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;