import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Clock, Award, TrendingUp } from 'lucide-react';
import { attendanceService } from '../../services/firebaseService';
import type { AttendanceRecord } from '../../types';

const motivationalQuotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it."
];

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [dailyQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    calculateAttendancePercentage();
  }, [user?.id]);

  const calculateAttendancePercentage = async () => {
    try {
      const records: AttendanceRecord[] = await attendanceService.getByUserId(user?.id || '');
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthRecords = records.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= firstDayOfMonth && recordDate <= now;
      });

      const workingDays = Math.floor((now.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const attendedDays = new Set(currentMonthRecords.map((r) => new Date(r.date).toDateString())).size;
      
      const percentage = workingDays > 0 ? (attendedDays / workingDays) * 100 : 0;
      setAttendancePercentage(Math.min(percentage, 100));
    } catch (error) {
      console.error('Error calculating attendance:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAttendanceColor = () => {
    if (attendancePercentage >= 90) return 'text-green-600';
    if (attendancePercentage >= 75) return 'text-blue-600';
    if (attendancePercentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header with Quote */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name}! 👋
            </h1>
            <p className="text-green-100 text-lg italic mb-4">"{dailyQuote}"</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {currentTime.toLocaleTimeString()}
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {user?.designation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Attendance Tracking
          </CardTitle>
          <CardDescription>Your attendance for this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Attendance</p>
              <p className={`text-4xl font-bold ${getAttendanceColor()}`}>
                {attendancePercentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={attendancePercentage >= 75 ? 'default' : 'destructive'} className="text-sm">
                {attendancePercentage >= 90 ? 'Excellent' : attendancePercentage >= 75 ? 'Good' : attendancePercentage >= 60 ? 'Average' : 'Poor'}
              </Badge>
            </div>
          </div>
          <Progress value={attendancePercentage} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Keep up the good work! Maintain above 75% for excellent performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;