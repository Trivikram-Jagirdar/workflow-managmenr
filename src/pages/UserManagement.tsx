import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Trash2, UserPlus, Upload, Download } from 'lucide-react';
import { employeeService } from '../services/firebaseService';
import type { Employee } from '../types';

interface LocalUser {
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

const UserManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkImportDialogOpen, setIsBulkImportDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'employee',
    designation: '',
    department: '',
    phone: '',
    employmentType: 'full-time',
    workingShift: 'day',
    joiningDate: '',
    aadharNumber: ''
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
      alert('Please fill in all required fields (Name, Email, Designation)');
      return;
    }

    try {
      // Create employee in Firebase
      await employeeService.create({
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        designation: newEmployee.designation,
        department: newEmployee.department,
        phone: newEmployee.phone,
        employmentType: newEmployee.employmentType,
        workingShift: newEmployee.workingShift,
        joiningDate: newEmployee.joiningDate,
        aadharNumber: newEmployee.aadharNumber
      });

      // Also add to localStorage users for authentication
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser: LocalUser = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        password: newEmployee.email,
        role: newEmployee.role,
        designation: newEmployee.designation,
        department: newEmployee.department,
        phone: newEmployee.phone,
        employmentType: newEmployee.employmentType,
        workingShift: newEmployee.workingShift,
        joiningDate: newEmployee.joiningDate,
        aadharNumber: newEmployee.aadharNumber
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      await loadEmployees();
      setNewEmployee({
        name: '',
        email: '',
        role: 'employee',
        designation: '',
        department: '',
        phone: '',
        employmentType: 'full-time',
        workingShift: 'day',
        joiningDate: '',
        aadharNumber: ''
      });
      setIsAddDialogOpen(false);
      alert(`User added successfully! Default password: ${newEmployee.email}`);
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await employeeService.update(selectedEmployee.id, {
        name: selectedEmployee.name,
        email: selectedEmployee.email,
        designation: selectedEmployee.designation,
        role: selectedEmployee.role,
        department: selectedEmployee.department,
        phone: selectedEmployee.phone,
        employmentType: selectedEmployee.employmentType,
        workingShift: selectedEmployee.workingShift,
        joiningDate: selectedEmployee.joiningDate,
        aadharNumber: selectedEmployee.aadharNumber
      });

      // Update in localStorage users as well
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: LocalUser) => 
        u.email === selectedEmployee.email 
          ? { 
              ...u, 
              name: selectedEmployee.name, 
              designation: selectedEmployee.designation, 
              role: selectedEmployee.role,
              department: selectedEmployee.department,
              phone: selectedEmployee.phone,
              employmentType: selectedEmployee.employmentType,
              workingShift: selectedEmployee.workingShift,
              joiningDate: selectedEmployee.joiningDate,
              aadharNumber: selectedEmployee.aadharNumber
            }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      await loadEmployees();
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteEmployee = async (id: string, email: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await employeeService.delete(id);

      // Remove from localStorage users
      const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter((u: LocalUser) => u.email !== email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      await loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      ['Full Name*', 'Email*', 'Role*', 'Designation*', 'Department', 'Phone', 'Employment Type', 'Working Shift', 'Joining Date (YYYY-MM-DD)', 'Aadhar Number'].join(','),
      ['John Doe', 'john@company.com', 'employee', 'Software Developer', 'Engineering', '9876543210', 'full-time', 'day', '2024-01-15', '123456789012'].join(','),
      ['Jane Smith', 'jane@company.com', 'employee', 'UI/UX Designer', 'Design', '9876543211', 'full-time', 'day', '2024-02-01', '123456789013'].join(','),
      ['Mike Johnson', 'mike@company.com', 'client', 'Project Manager', 'Management', '9876543212', 'full-time', 'day', '2024-01-10', '123456789014'].join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < 4) continue;

          const employeeData = {
            name: values[0],
            email: values[1],
            role: values[2] || 'employee',
            designation: values[3],
            department: values[4] || '',
            phone: values[5] || '',
            employmentType: values[6] || 'full-time',
            workingShift: values[7] || 'day',
            joiningDate: values[8] || '',
            aadharNumber: values[9] || ''
          };

          try {
            // Create in Firebase
            await employeeService.create(employeeData);

            // Add to localStorage
            const users: LocalUser[] = JSON.parse(localStorage.getItem('users') || '[]');
            const newUser: LocalUser = {
              id: Date.now().toString() + i,
              ...employeeData,
              password: employeeData.email
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            successCount++;
          } catch (error) {
            console.error(`Error importing employee ${employeeData.name}:`, error);
            errorCount++;
          }
        }

        await loadEmployees();
        setIsBulkImportDialogOpen(false);
        alert(`Bulk import completed!\nSuccess: ${successCount}\nFailed: ${errorCount}`);
      } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Failed to process CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-blue-100">Manage employee and client accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                All Users
              </CardTitle>
              <CardDescription>Add, edit, and manage user accounts</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isBulkImportDialogOpen} onOpenChange={setIsBulkImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Import Users</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file to import multiple users at once
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Instructions:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                        <li>Download the template CSV file below</li>
                        <li>Fill in user details (Name, Email, Role, Designation are required)</li>
                        <li>Upload the completed CSV file</li>
                        <li>Email will be used as default password for all users</li>
                      </ul>
                    </div>
                    <Button onClick={downloadTemplate} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample Template
                    </Button>
                    <div>
                      <Label>Upload CSV File</Label>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleBulkImport}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with role-based permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label>Role *</Label>
                      <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Designation *</Label>
                      <Input
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                        placeholder="Department"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <Label>Employment Type</Label>
                      <Select value={newEmployee.employmentType} onValueChange={(value) => setNewEmployee({ ...newEmployee, employmentType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Working Shift</Label>
                      <Select value={newEmployee.workingShift} onValueChange={(value) => setNewEmployee({ ...newEmployee, workingShift: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Joining Date</Label>
                      <Input
                        type="date"
                        value={newEmployee.joiningDate}
                        onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Aadhar Number</Label>
                      <Input
                        value={newEmployee.aadharNumber}
                        onChange={(e) => setNewEmployee({ ...newEmployee, aadharNumber: e.target.value })}
                        placeholder="12-digit Aadhar number"
                        maxLength={12}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Email address will be used as the default password
                    </p>
                  </div>
                  <Button onClick={handleAddEmployee} className="w-full">
                    Add User
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users added yet</p>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium">{employee.name}</h4>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                      <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {employee.designation}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {employee.role}
                        </Badge>
                        {employee.department && (
                          <Badge variant="outline" className="text-xs">
                            {employee.department}
                          </Badge>
                        )}
                        {employee.employmentType && (
                          <Badge variant="outline" className="text-xs">
                            {employee.employmentType}
                          </Badge>
                        )}
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
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={selectedEmployee.name}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
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
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input
                  value={selectedEmployee.designation}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={selectedEmployee.department}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={selectedEmployee.phone}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Employment Type</Label>
                <Select value={selectedEmployee.employmentType} onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, employmentType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Working Shift</Label>
                <Select value={selectedEmployee.workingShift} onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, workingShift: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Joining Date</Label>
                <Input
                  type="date"
                  value={selectedEmployee.joiningDate}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, joiningDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Aadhar Number</Label>
                <Input
                  value={selectedEmployee.aadharNumber}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, aadharNumber: e.target.value })}
                  maxLength={12}
                />
              </div>
              <div className="col-span-2">
                <Button onClick={handleUpdateEmployee} className="w-full">
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;