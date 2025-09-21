import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Don't show header/footer on landing page
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1.5rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '4rem' 
          }}>
            {/* Logo */}
            <Link to="/dashboard" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              textDecoration: 'none'
            }}>
              <div style={{ 
                width: '2rem', 
                height: '2rem', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '0.875rem' 
                }}>⚖️</span>
              </div>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#1e293b' 
              }}>
                LegalDocs
              </span>
            </Link>

            {/* Navigation */}
            <nav style={{ 
              display: window.innerWidth >= 768 ? 'flex' : 'none',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <Link 
                to="/dashboard" 
                style={{ 
                  color: '#64748b', 
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
              >
                Dashboard
              </Link>
              <Link 
                to="/documents" 
                style={{ 
                  color: '#64748b', 
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
              >
                Documents
              </Link>
              <Link 
                to="/search" 
                style={{ 
                  color: '#64748b', 
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
              >
                Search
              </Link>
              <Link 
                to="/ai" 
                style={{ 
                  color: '#64748b', 
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
              >
                AI Tools
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  style={{ 
                    color: '#64748b', 
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem' 
            }}>
              {isAuthenticated ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}>
                    <div style={{ 
                      width: '2rem', 
                      height: '2rem', 
                      backgroundColor: '#eff6ff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ 
                        color: '#3b82f6', 
                        fontWeight: '600', 
                        fontSize: '0.875rem' 
                      }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span style={{ 
                      color: '#374151', 
                      fontWeight: '500',
                      display: window.innerWidth >= 640 ? 'block' : 'none'
                    }}>
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}>
                    <Link 
                      to="/profile" 
                      style={{ 
                        color: '#64748b', 
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={logout}
                      style={{ 
                        color: '#64748b', 
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#dc2626'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem' 
                }}>
                  <Link 
                    to="/login" 
                    style={{ 
                      color: '#64748b', 
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#3b82f6'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748b'}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#1e293b',
        color: '#94a3b8',
        padding: '3rem 0',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1.5rem' 
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Brand */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
                }}>
                  <span style={{ 
                    color: 'white', 
                    fontWeight: 'bold', 
                    fontSize: '0.875rem' 
                  }}>⚖️</span>
                </div>
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: 'white' 
                }}>
                  LegalDocs
                </span>
              </div>
              
              <p style={{ 
                color: '#94a3b8', 
                marginBottom: '1.5rem', 
                lineHeight: '1.6',
                maxWidth: '400px'
              }}>
                AI-powered legal document management for modern professionals. 
                Streamline your workflow with intelligent automation.
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem' 
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#374151'}
                >
                  <span style={{ color: 'white', fontSize: '1rem' }}>📧</span>
                </div>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#374151'}
                >
                  <span style={{ color: 'white', fontSize: '1rem' }}>🐦</span>
                </div>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#374151'}
                >
                  <span style={{ color: 'white', fontSize: '1rem' }}>💼</span>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1rem' 
              }}>Product</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/features" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Features
                </Link>
                <Link to="/pricing" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Pricing
                </Link>
                <Link to="/security" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Security
                </Link>
                <Link to="/integrations" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Integrations
                </Link>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1rem' 
              }}>Company</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/about" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  About Us
                </Link>
                <Link to="/careers" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Careers
                </Link>
                <Link to="/contact" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Contact
                </Link>
                <Link to="/blog" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Blog
                </Link>
              </div>
            </div>
          </div>
          
          <div style={{ 
            paddingTop: '2rem',
            marginTop: '2rem',
            borderTop: '1px solid #374151'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                © 2024 LegalDocs. All rights reserved.
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <Link to="/privacy" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Privacy Policy
                </Link>
                <Link to="/terms" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Terms of Service
                </Link>
                <Link to="/cookies" style={{ 
                  color: '#94a3b8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
