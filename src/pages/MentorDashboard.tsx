import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Users, 
  FolderKanban, 
  CheckCircle, 
  TrendingUp
} from 'lucide-react';
import { mockUsers, mockProjects } from '../data/mockData';

const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const myTeam = mockUsers.filter(u => u.mentorId === user?.id);
  const myProjects = mockProjects.filter(p => p.mentorId === user?.id);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-orange-100">Lead your team to success</p>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTeam.length}</div>
            <p className="text-xs text-muted-foreground">Under your mentorship</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProjects.length}</div>
            <p className="text-xs text-muted-foreground">Currently managing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Average completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              My Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTeam.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.designation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Active</Badge>
                    <p className="text-xs text-muted-foreground mt-1">85% attendance</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderKanban className="w-5 h-5 mr-2" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{project.title}</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Due: {project.endDate} • Budget: ${project.budget.toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;