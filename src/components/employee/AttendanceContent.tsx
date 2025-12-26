import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { attendanceService } from '../../services/firebaseService';

const AttendanceContent: React.FC = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showMarkAttendanceDialog, setShowMarkAttendanceDialog] = useState(false);
  const [workReport, setWorkReport] = useState('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [currentAttendanceId, setCurrentAttendanceId] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    checkTodayAttendance();
  }, [user?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const timeDiff = now.getTime() - checkInTime.getTime();
        const hoursWorked = timeDiff / (1000 * 60 * 60);
        setWorkingTime(hoursWorked);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const checkTodayAttendance = async () => {
    try {
      const todayRecord = await attendanceService.getTodayByUserId(user?.id || '');
      if (todayRecord && todayRecord.isActive) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(todayRecord.checkInTime));
        setCurrentAttendanceId(todayRecord.id);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const getUserLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setIsGettingLocation(false);
          resolve(locationString);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Unable to retrieve location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your device settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleMarkAttendance = async () => {
    try {
      setIsGettingLocation(true);
      const location = await getUserLocation();
      setUserLocation(location);
      setShowMarkAttendanceDialog(true);
    } catch (error) {
      setIsGettingLocation(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      alert(`Location Error: ${errorMessage}\n\nPlease:\n1. Enable location services on your device\n2. Allow location access for this website\n3. Try again`);
    }
  };

  const handleConfirmAttendance = async () => {
    try {
      const now = new Date();
      const newRecord = {
        userId: user?.id || '',
        userName: user?.name || '',
        userDesignation: user?.designation || '',
        date: now.toISOString(),
        checkInTime: now.toISOString(),
        checkOutTime: null,
        hoursWorked: 0,
        workReport: '',
        isActive: true,
        isLate: now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15),
        location: userLocation
      };

      const result = await attendanceService.create(newRecord);
      setCurrentAttendanceId(result.id);
      setIsCheckedIn(true);
      setCheckInTime(now);
      setWorkingTime(0);
      setShowMarkAttendanceDialog(false);
      setUserLocation('');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance. Please check your internet connection and try again.');
    }
  };

  const handleCheckOut = async () => {
    if (!workReport.trim()) {
      alert('Please enter your work report before checking out');
      return;
    }

    try {
      const now = new Date();
      const hoursWorked = checkInTime ? (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) : 0;

      await attendanceService.update(currentAttendanceId || '', {
        checkOutTime: now.toISOString(),
        hoursWorked: hoursWorked,
        workReport: workReport,
        isActive: false
      });

      setIsCheckedIn(false);
      setCheckInTime(null);
      setWorkingTime(0);
      setShowCheckoutDialog(false);
      setWorkReport('');
      setCurrentAttendanceId(null);
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out. Please try again.');
    }
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mark Attendance</h2>

      {/* Instructions Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Location Permission Required</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please allow location access when prompted</li>
                <li>• Ensure location services are enabled on your device</li>
                <li>• Your location will be recorded for attendance verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isCheckedIn ? (
            <Button 
              onClick={handleMarkAttendance}
              disabled={isGettingLocation}
              className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {isGettingLocation ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Mark Attendance
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-green-100 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Checked In</p>
                <p className="text-sm text-green-600">{checkInTime?.toLocaleTimeString()}</p>
              </div>
              <Button 
                onClick={() => setShowCheckoutDialog(true)}
                variant="outline"
                className="w-full"
              >
                Check Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Time Display */}
      {isCheckedIn && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Currently Working</p>
                <p className="text-3xl font-bold">{formatTime(workingTime)}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkAttendanceDialog} onOpenChange={setShowMarkAttendanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Attendance</DialogTitle>
            <DialogDescription>
              Please verify your attendance details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Date</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              {userLocation && (
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Location</span>
                  <span className="text-xs text-muted-foreground text-right max-w-[200px]">{userLocation}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleConfirmAttendance} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Attendance
              </Button>
              <Button variant="outline" onClick={() => setShowMarkAttendanceDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Report</DialogTitle>
            <DialogDescription>
              Please describe what you accomplished today before checking out
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Working Hours: {formatTime(workingTime)}</p>
              <Textarea
                placeholder="Describe your work today:&#10;- Tasks completed&#10;- Projects worked on&#10;- Issues resolved&#10;- Progress made"
                value={workReport}
                onChange={(e) => setWorkReport(e.target.value)}
                rows={10}
                className="resize-none"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCheckOut} className="flex-1">
                Submit & Check Out
              </Button>
              <Button variant="outline" onClick={() => setShowCheckoutDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceContent;