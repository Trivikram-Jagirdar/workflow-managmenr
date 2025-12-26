import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, FileText } from 'lucide-react';
import { projectService } from '../../services/firebaseService';
import type { Project, Task, Subtask } from '../../types';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface TaskWithProject {
  project: Project;
  task: Task;
}

const ProjectsContent: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<TaskWithProject[]>([]);

  useEffect(() => {
    loadProjects();
  }, [user?.id]);

  const loadProjects = async () => {
    try {
      const allProjects: Project[] = await projectService.getAll();
      setProjects(allProjects);
      
      const tasksForMe: TaskWithProject[] = [];
      allProjects.forEach((project) => {
        const projectTasks = project.tasks || [];
        projectTasks.forEach((task) => {
          if (task.assignedTo === user?.id) {
            tasksForMe.push({ project, task });
          }
        });
      });
      setMyTasks(tasksForMe);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleToggleSubtask = async (projectId: string, taskId: string, subtaskId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedTasks = project.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((subtask) => {
              if (subtask.id === subtaskId) {
                return {
                  ...subtask,
                  status: subtask.status === 'completed' ? 'pending' : 'completed',
                  completedAt: subtask.status === 'completed' ? undefined : new Date().toISOString()
                };
              }
              return subtask;
            })
          };
        }
        return task;
      });

      await projectService.update(projectId, { tasks: updatedTasks });
      loadProjects();
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const getPriorityColor = (priority: string): BadgeVariant => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Projects & Tasks</h2>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            My Assigned Tasks
          </CardTitle>
          <CardDescription>Tasks and subtasks assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {myTasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4">
              {myTasks.map(({ project, task }) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">Project: {project.title}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium">Subtasks</p>
                          <p className="text-xs text-muted-foreground">
                            {task.subtasks.filter((st: Subtask) => st.status === 'completed').length}/{task.subtasks.length} completed
                          </p>
                        </div>
                        <Progress 
                          value={(task.subtasks.filter((st: Subtask) => st.status === 'completed').length / task.subtasks.length) * 100} 
                          className="h-2 mb-3"
                        />
                        {task.subtasks.map((subtask: Subtask) => (
                          <div key={subtask.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={subtask.status === 'completed'}
                              onChange={() => handleToggleSubtask(project.id, task.id, subtask.id)}
                              className="mt-1 h-4 w-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <h4 className={`font-medium ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {subtask.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{subtask.description}</p>
                              {subtask.completedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Completed: {new Date(subtask.completedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            All Projects
          </CardTitle>
          <CardDescription>View all company projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No projects available</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Tasks: {project.tasks.length}</p>
                        <div className="space-y-2">
                          {project.tasks.slice(0, 3).map((task: Task) => (
                            <div key={task.id} className="text-sm p-2 bg-gray-50 rounded">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Assigned to: {task.assignedTo === user?.id ? 'You' : 'Other'}
                              </p>
                            </div>
                          ))}
                          {project.tasks.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{project.tasks.length - 3} more tasks
                            </p>
                          )}
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
    </div>
  );
};

export default ProjectsContent;