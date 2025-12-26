import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { employeeService } from '../../services/firebaseService';
import type { Employee } from '../../types';

interface LocalUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'employee',
    designation: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.designation) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create employee in Firebase
      await employeeService.create({
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        designation: newEmployee.designation
      });

      // Also add to localStorage users for authentication
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser: LocalUser = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.email, // Email as default password
        role: newEmployee.role,
        designation: newEmployee.designation
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      await loadEmployees();
      setNewEmployee({ name: '', email: '', role: 'employee', designation: '' });
      setIsAddDialogOpen(false);
      alert(`Employee added successfully! Default password: ${newEmployee.email}`);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await employeeService.update(selectedEmployee.id, {
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        designation: selectedEmployee.designation,
        role: selectedEmployee.role
      });

      // Update in localStorage users as well
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: LocalUser) => 
        u.email === selectedEmployee.email 
          ? { ...u, name: selectedEmployee.name, designation: selectedEmployee.designation, role: selectedEmployee.role }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      await loadEmployees();
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (id: string, email: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeService.delete(id);

      // Remove from localStorage users
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter((u: LocalUser) => u.email !== email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      await loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Employee Management
            </CardTitle>
            <CardDescription>Add, edit, and manage employees</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee account. Email will be used as the default password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used as the default password
                  </p>
                </div>
                <div>
                  <Label>Designation *</Label>
                  <Input
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    placeholder="Software Developer"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddEmployee} className="w-full">
                  Create Employee
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No employees added yet</p>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {employee.designation}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {employee.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id, employee.email || '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={selectedEmployee.name}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Designation</Label>
                <Input
                  value={selectedEmployee.designation}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={selectedEmployee.role} onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateEmployee} className="w-full">
                Update Employee
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeeManagement;