import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../stores/auth';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb', 
      padding: '3rem 1rem' 
    }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            margin: '0 auto', 
            height: '3rem', 
            width: '3rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '50%', 
            backgroundColor: '#eff6ff' 
          }}>
            <svg
              style={{ height: '2rem', width: '2rem', color: '#3b82f6' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 style={{ 
            marginTop: '1.5rem', 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#111827' 
          }}>
            Sign in to your account
          </h2>
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#6b7280' 
          }}>
            Access your legal document management system
          </p>
        </div>

        {/* Login Form */}
        <Card style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input
                {...register('email')}
                type="email"
                label="Email address"
                placeholder="Enter your email"
                error={errors.email?.message}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                rightIcon={
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    style={{ 
                      height: '1rem', 
                      width: '1rem', 
                      color: '#3b82f6', 
                      borderColor: '#d1d5db', 
                      borderRadius: '0.25rem' 
                    }}
                  />
                  <label htmlFor="remember-me" style={{ 
                    marginLeft: '0.5rem', 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    color: '#111827' 
                  }}>
                    Remember me
                  </label>
                </div>

                <div style={{ fontSize: '0.875rem' }}>
                  <Link
                    to="/forgot-password"
                    style={{ 
                      fontWeight: '500', 
                      color: '#3b82f6', 
                      textDecoration: 'none' 
                    }}
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                style={{ width: '100%' }}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }} />
                </div>
                <div style={{ 
                  position: 'relative', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  fontSize: '0.875rem' 
                }}>
                  <span style={{ 
                    padding: '0 0.5rem', 
                    backgroundColor: 'white', 
                    color: '#6b7280' 
                  }}>Or continue with</span>
                </div>
              </div>

              <div style={{ 
                marginTop: '1.5rem', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '0.75rem' 
              }}>
                <Button
                  variant="outline"
                  style={{ width: '100%' }}
                  onClick={() => toast('Google authentication coming soon!')}
                >
                  <svg style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
                  style={{ width: '100%' }}
                  onClick={() => toast('Microsoft authentication coming soon!')}
                >
                  <svg style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M13 1h10v10H13z" />
                    <path fill="#7fba00" d="M1 13h10v10H1z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  Microsoft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign up link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ 
                fontWeight: '500', 
                color: '#3b82f6', 
                textDecoration: 'none' 
              }}
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
