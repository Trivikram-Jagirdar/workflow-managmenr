import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { AlertCircle, Building2, Lock, Mail, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    const success = login(userEmail, userPassword);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="text-white space-y-6 hidden md:block">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              WorkFlow Pro
            </h1>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
              Modern Employee Management
              <br />
              <span className="text-purple-300">Made Simple</span>
            </h2>
            <p className="text-purple-200 text-lg">
              Streamline attendance tracking, project management, and team collaboration all in one powerful platform.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">99%</div>
              <div className="text-sm text-purple-200">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">24/7</div>
              <div className="text-sm text-purple-200">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">500+</div>
              <div className="text-sm text-purple-200">Companies</div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="w-full bg-white/95 backdrop-blur-lg shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Quick Access</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('admin@company.com', 'admin123')}
                  className="w-full h-11 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                        AD
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Admin</div>
                        <div className="text-xs text-gray-500">admin@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('john@company.com', 'password123')}
                  className="w-full h-11 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                        JD
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Employee</div>
                        <div className="text-xs text-gray-500">john@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin('client@company.com', 'password123')}
                  className="w-full h-11 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs mr-3">
                        CL
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Client</div>
                        <div className="text-xs text-gray-500">client@company.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;