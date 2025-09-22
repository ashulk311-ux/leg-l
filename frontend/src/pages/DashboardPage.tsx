import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon, 
  ClockIcon,
  ShieldCheckIcon,
  FolderIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

function DashboardPage() {
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

        {/* Document Categories Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Judgement Card */}
          <Card style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <DocumentTextIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Judgement
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                Upload court judgements and legal decisions
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ 
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onClick={() => navigate('/documents?tab=upload&category=judgement')}
              >
                <CloudArrowUpIcon style={{ width: '2rem', height: '2rem', color: '#6b7280', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Click to upload Judgement files
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0' }}>
                  PDF, DOC, DOCX supported
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Circulars Card */}
          <Card style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <DocumentTextIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Circulars
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                Upload government and official circulars
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ 
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onClick={() => navigate('/documents?tab=upload&category=circulars')}
              >
                <CloudArrowUpIcon style={{ width: '2rem', height: '2rem', color: '#6b7280', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Click to upload Circular files
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0' }}>
                  PDF, DOC, DOCX supported
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications Card */}
          <Card style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <DocumentTextIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Notifications
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                Upload legal notifications and announcements
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ 
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f59e0b';
                e.currentTarget.style.backgroundColor = '#fef3c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onClick={() => navigate('/documents?tab=upload&category=notifications')}
              >
                <CloudArrowUpIcon style={{ width: '2rem', height: '2rem', color: '#6b7280', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Click to upload Notification files
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0' }}>
                  PDF, DOC, DOCX supported
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Statutes Card */}
          <Card style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <DocumentTextIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Statutes
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                Upload legal statutes and regulations
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ 
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.backgroundColor = '#f3e8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onClick={() => navigate('/documents?tab=upload&category=statutes')}
              >
                <CloudArrowUpIcon style={{ width: '2rem', height: '2rem', color: '#6b7280', margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Click to upload Statute files
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0' }}>
                  PDF, DOC, DOCX supported
                </p>
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
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BoltIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Quick Actions
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                Essential tools for your workflow
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button 
                  style={{ 
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
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
                    justifyContent: 'flex-start',
                    boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.4)';
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
                    justifyContent: 'flex-start',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
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
                    justifyContent: 'flex-start',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
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
                    justifyContent: 'flex-start',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
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
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ClockIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                Recent Activity
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
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
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
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
                  margin: '0 auto',
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.4)';
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
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }}
          >
            <CardHeader style={{ 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1.5rem',
              borderRadius: '12px 12px 0 0',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <CardTitle style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldCheckIcon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                System Status
              </CardTitle>
              <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
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
                  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
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
                  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
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
                  boxShadow: '0 2px 4px rgba(234, 179, 8, 0.1)'
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
                  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)'
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

      </div>
    </div>
  );
}

export default DashboardPage;
