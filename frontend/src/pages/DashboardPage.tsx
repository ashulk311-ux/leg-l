import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/auth';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  FolderIcon,
  EyeIcon,
  SparklesIcon,
  BoltIcon,
  AcademicCapIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem' 
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  margin: '0 0 0.5rem 0'
                }}>
                  Welcome back, {user?.name || 'User'}
                </h1>
                <p style={{ 
                  color: '#64748b', 
                  margin: '0 0 1rem 0',
                  fontSize: '1rem'
                }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.875rem',
                  maxWidth: '500px',
                  lineHeight: '1.5'
                }}>
                  Manage your legal documents with AI-powered insights and intelligent search capabilities.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button 
                  style={{ 
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => navigate('/documents?tab=upload')}
                >
                  <CloudArrowUpIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  Upload Document
                </Button>
                <Button 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => navigate('/search')}
                >
                  <MagnifyingGlassIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Documents Card */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DocumentTextIcon style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>0</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Documents</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Total Documents
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowTrendingUpIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                  +0 this month
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClockIcon style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>0</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Processing</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  In Queue
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <BoltIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                  AI processing
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Searches Card */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: '#d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MagnifyingGlassIcon style={{ width: '1.5rem', height: '1.5rem', color: '#10b981' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>0</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Searches</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  AI Searches
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <SparklesIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                  Today's activity
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Card */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CloudArrowUpIcon style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0' }}>0 MB</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Storage</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                  Cloud Storage
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheckIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                  10 GB available
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Quick Actions */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardHeader style={{ 
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BoltIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                Quick Actions
              </CardTitle>
              <CardDescription style={{ color: '#64748b', fontSize: '0.875rem', margin: '0' }}>
                Essential tools for your workflow
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button 
                  style={{ 
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  onClick={() => navigate('/documents?tab=upload')}
                >
                  <CloudArrowUpIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  Upload Document
                </Button>
                <Button 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  onClick={() => navigate('/search')}
                >
                  <MagnifyingGlassIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  Search Documents
                </Button>
                <Button 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  onClick={() => navigate('/ai')}
                >
                  <SparklesIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  AI Analysis
                </Button>
                <Button 
                  variant="outline"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                  onClick={() => navigate('/documents')}
                >
                  <FolderIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  Browse Library
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardHeader style={{ 
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ClockIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                Recent Activity
              </CardTitle>
              <CardDescription style={{ color: '#64748b', fontSize: '0.875rem', margin: '0' }}>
                Your latest document activities
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '4rem', 
                height: '4rem', 
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <ClockIcon style={{ width: '2rem', height: '2rem', color: '#64748b' }} />
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: '0 0 0.5rem 0'
              }}>
                No recent activity
              </h3>
              <p style={{ 
                color: '#64748b', 
                fontSize: '0.875rem',
                margin: '0 0 1.5rem 0',
                lineHeight: '1.5'
              }}>
                Start by uploading your first document to see activity here.
              </p>
              <Button 
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
                onClick={() => navigate('/documents?tab=upload')}
              >
                <CloudArrowUpIcon style={{ width: '1rem', height: '1rem' }} />
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card style={{ 
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <CardHeader style={{ 
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldCheckIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                System Status
              </CardTitle>
              <CardDescription style={{ color: '#64748b', fontSize: '0.875rem', margin: '0' }}>
                Real-time system health
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      backgroundColor: '#22c55e',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Database</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>Online</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      backgroundColor: '#22c55e',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>AI Services</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>Online</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#fefce8',
                  borderRadius: '8px',
                  border: '1px solid #fde047'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      backgroundColor: '#eab308',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Vector Search</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ca8a04' }}>Limited</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      backgroundColor: '#22c55e',
                      borderRadius: '50%'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Storage</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>Online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Library Section */}
        <Card style={{ 
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader style={{ 
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '1.5rem',
            borderRadius: '12px 12px 0 0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CardTitle style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  margin: '0 0 0.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <ScaleIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                  Document Library
                </CardTitle>
                <CardDescription style={{ color: '#64748b', fontSize: '0.875rem', margin: '0' }}>
                  Your comprehensive legal document management center
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #d1d5db',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => navigate('/documents')}
              >
                <EyeIcon style={{ width: '1rem', height: '1rem' }} />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ 
              width: '5rem', 
              height: '5rem', 
              backgroundColor: '#f1f5f9',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <AcademicCapIcon style={{ width: '2.5rem', height: '2.5rem', color: '#64748b' }} />
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: '0 0 1rem 0'
            }}>
              Welcome to Your Legal Hub
            </h3>
            <p style={{ 
              color: '#64748b', 
              fontSize: '1rem',
              margin: '0 0 2rem 0',
              lineHeight: '1.6',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Transform your legal practice with AI-powered document analysis, intelligent search, 
              and automated insights. Upload your first document to get started.
            </p>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#3b82f6',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <CloudArrowUpIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  Smart Upload
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', lineHeight: '1.4' }}>
                  AI-powered document processing
                </p>
              </div>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#10b981',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <MagnifyingGlassIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  Intelligent Search
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', lineHeight: '1.4' }}>
                  Find content with semantic search
                </p>
              </div>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#8b5cf6',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <SparklesIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  AI Insights
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0', lineHeight: '1.4' }}>
                  Automated summaries and findings
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => navigate('/documents?tab=upload')}
              >
                <CloudArrowUpIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                Upload Your First Document
              </Button>
              <Button 
                variant="outline"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #d1d5db',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => navigate('/search')}
              >
                <MagnifyingGlassIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                Explore Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
