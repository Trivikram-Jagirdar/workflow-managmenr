import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Download, Eye } from 'lucide-react';
import type { AttendanceRecord } from '../../types';

interface AttendanceSectionProps {
  attendanceData: AttendanceRecord[];
  onViewReport: (record: AttendanceRecord) => void;
  onExport: () => void;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  attendanceData,
  onViewReport,
  onExport
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Attendance & Work Reports</CardTitle>
            <CardDescription>Real-time employee attendance and daily work reports</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attendanceData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
          ) : (
            attendanceData.slice().reverse().map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar>
                    <AvatarFallback>{record.userName?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{record.userName}</h4>
                    <p className="text-sm text-muted-foreground">{record.userDesignation}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                      <span>In: {new Date(record.checkInTime).toLocaleTimeString()}</span>
                      {record.checkOutTime && (
                        <span>Out: {new Date(record.checkOutTime).toLocaleTimeString()}</span>
                      )}
                      {record.hoursWorked > 0 && (
                        <span className="font-medium text-blue-600">
                          {record.hoursWorked.toFixed(2)}h worked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={record.isActive ? 'default' : 'secondary'}>
                    {record.isActive ? 'Working' : 'Checked Out'}
                  </Badge>
                  {record.isLate && <Badge variant="destructive">Late</Badge>}
                  {record.workReport && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewReport(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Report
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceSection;