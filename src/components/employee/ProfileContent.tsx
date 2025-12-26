import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { User, Mail, Briefcase, Key, Save } from 'lucide-react';

interface LocalUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
}

const ProfileContent: React.FC = () => {
  const { user } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Update password in localStorage
    const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: LocalUser) => u.id === user?.id);
    
    if (userIndex !== -1) {
      if (users[userIndex].password !== passwordData.currentPassword) {
        alert('Current password is incorrect');
        return;
      }

      users[userIndex].password = passwordData.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Details</h2>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </CardTitle>
          <CardDescription>Your account details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user?.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {user?.role}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </div>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4 mr-2" />
                Designation
              </div>
              <p className="font-medium">{user?.designation || 'Not specified'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                Employee ID
              </div>
              <p className="font-medium">{user?.id}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Badge className="w-4 h-4 mr-2" />
                Account Status
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditingPassword ? (
            <Button onClick={() => setIsEditingPassword(true)}>
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleChangePassword} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Password
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Default Login Credentials</CardTitle>
          <CardDescription>Your initial login information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Default Password:</strong> Your email address was used as your initial password.
            </p>
            <p className="text-xs text-blue-600">
              For security reasons, please change your password if you haven't already.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileContent;