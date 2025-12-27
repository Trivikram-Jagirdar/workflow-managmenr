import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  MapPin,
  CheckCircle,
  CalendarDays,
  Timer,
  Clock
} from 'lucide-react';
import { attendanceService } from '../../services/firebaseService';

const STORAGE_KEY = 'active_attendance';
const GPS_PERMISSION_KEY = 'gps_permission_status';

const AttendanceContent: React.FC = () => {
  const { user } = useAuth();

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const [showGpsDialog, setShowGpsDialog] = useState(false);
  const [gpsPermission, setGpsPermission] = useState<string | null>(
    localStorage.getItem(GPS_PERMISSION_KEY)
  );

  const [workReport, setWorkReport] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- RESTORE SESSION ---------------- */
  useEffect(() => {
    restoreAttendance();
  }, [user?.id]);

  const restoreAttendance = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const time = new Date(parsed.checkInTime);
      setIsCheckedIn(true);
      setCheckInTime(time);
      setAttendanceId(parsed.id);
      startTimer(time);
      return;
    }
  };

  /* ---------------- TIMER ---------------- */
  const startTimer = (start: Date) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      setWorkingTime(diff / (1000 * 60 * 60));
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  /* ---------------- LOCATION ---------------- */
  const getUserLocation = (): Promise<string> =>
    new Promise((resolve, reject) => {
      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGettingLocation(false);
          resolve(
            `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
          );
        },
        () => {
          setIsGettingLocation(false);
          setShowLocationDialog(true);
          reject('');
        }
      );
    });

  /* ---------------- CHECK IN ---------------- */
  const handleMarkAttendance = async () => {
    if (gpsPermission === 'denied') {
      setShowLocationDialog(true);
      return;
    }

    if (!gpsPermission) {
      setShowGpsDialog(true);
      return;
    }

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setShowConfirmDialog(true);
    } catch {}
  };

  const allowGps = async () => {
    localStorage.setItem(GPS_PERMISSION_KEY, 'allowed');
    setGpsPermission('allowed');
    setShowGpsDialog(false);

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setShowConfirmDialog(true);
    } catch {}
  };

  const denyGps = () => {
    localStorage.setItem(GPS_PERMISSION_KEY, 'denied');
    setGpsPermission('denied');
    setShowGpsDialog(false);
    setShowLocationDialog(true);
  };

  const confirmAttendance = async () => {
    const now = new Date();

    const record = await attendanceService.create({
      userId: user?.id || '',
      userName: user?.name || '',
      userDesignation: user?.designation || '',
      date: now.toISOString(),
      checkInTime: now.toISOString(),
      checkOutTime: null,
      hoursWorked: 0,
      workReport: '',
      isActive: true,
      isLate: false,
      location: userLocation
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: record.id, checkInTime: now.toISOString() })
    );

    setAttendanceId(record.id);
    setIsCheckedIn(true);
    setCheckInTime(now);
    startTimer(now);
    setShowConfirmDialog(false);
  };

  /* ---------------- CHECK OUT ---------------- */
  const handleCheckOut = async () => {
    if (!workReport.trim()) return alert('Please enter work report');

    const now = new Date();
    const hours =
      checkInTime
        ? (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
        : 0;

    await attendanceService.update(attendanceId || '', {
      checkOutTime: now.toISOString(),
      hoursWorked: hours,
      workReport,
      isActive: false
    });

    stopTimer();
    localStorage.removeItem(STORAGE_KEY);

    setIsCheckedIn(false);
    setCheckInTime(null);
    setWorkingTime(0);
    setWorkReport('');
    setAttendanceId(null);
    setShowCheckoutDialog(false);
  };

  const formatTime = (h: number) => {
    const hr = Math.floor(h);
    const m = Math.floor((h - hr) * 60);
    const s = Math.floor((((h - hr) * 60) - m) * 60);
    return `${hr}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Attendance Dashboard</h2>

      {/* ACTION CARD */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          {!isCheckedIn ? (
            <Button
              onClick={handleMarkAttendance}
              disabled={isGettingLocation}
              className="flex-1 h-14 text-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
            >
              <MapPin className="mr-2" />
              Check In
            </Button>
          ) : (
            <Button
              onClick={() => setShowCheckoutDialog(true)}
              className="flex-1 h-14 text-lg text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
            >
              Check Out
            </Button>
          )}
        </CardContent>
      </Card>

      {/* TIMER */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="py-8 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Working Time</p>
            <p className="text-3xl font-bold">
              {isCheckedIn ? formatTime(workingTime) : '0h 0m 0s'}
            </p>
          </div>
          <Timer className="w-12 h-12 opacity-80" />
        </CardContent>
      </Card>

      {/* CONFIRM DIALOG */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Attendance</DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-2 text-sm">
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Date: {new Date().toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time: {new Date().toLocaleTimeString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location: {userLocation}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={confirmAttendance}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Check-In
          </Button>
        </DialogContent>
      </Dialog>

      {/* CHECKOUT DIALOG */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Work Report</DialogTitle>
          </DialogHeader>
          <p className="text-sm mb-2">
            Total Time: {formatTime(workingTime)}
          </p>
          <Textarea
            rows={6}
            value={workReport}
            onChange={(e) => setWorkReport(e.target.value)}
            placeholder="Describe today's work..."
          />
          <Button
            onClick={handleCheckOut}
            className="bg-red-600 hover:bg-red-700"
          >
            Submit & Check Out
          </Button>
        </DialogContent>
      </Dialog>

      {/* GPS & LOCATION DIALOGS */}
      <Dialog open={showGpsDialog} onOpenChange={setShowGpsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allow Location Access</DialogTitle>
            <DialogDescription>
              This app needs GPS access to mark attendance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={allowGps}>Allow</Button>
            <Button variant="outline" className="flex-1" onClick={denyGps}>Deny</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Required</DialogTitle>
            <DialogDescription>
              GPS permission is required to mark attendance.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowLocationDialog(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceContent;
