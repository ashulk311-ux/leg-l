import { Link } from 'react-router-dom';
import { useState } from 'react';

interface FooterProps {
  variant?: 'default' | 'landing';
  className?: string;
}

export function Footer({ variant = 'default', className = '' }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const socialLinks = [
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/legaldocs' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/company/legaldocs' },
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/legaldocs' },
    { name: 'Email', icon: '📧', url: 'mailto:support@legaldocs.com' }
  ];

  const productLinks = [
    { name: 'Features', url: '/features' },
    { name: 'Pricing', url: '/pricing' },
    { name: 'Security', url: '/security' },
    { name: 'Integrations', url: '/integrations' },
    { name: 'API', url: '/api' }
  ];

  const companyLinks = [
    { name: 'About Us', url: '/about' },
    { name: 'Careers', url: '/careers' },
    { name: 'Contact', url: '/contact' },
    { name: 'Blog', url: '/blog' },
    { name: 'Press', url: '/press' }
  ];

  const supportLinks = [
    { name: 'Help Center', url: '/help' },
    { name: 'Documentation', url: '/docs' },
    { name: 'Status', url: '/status' },
    { name: 'Community', url: '/community' },
    { name: 'Training', url: '/training' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', url: '/privacy' },
    { name: 'Terms of Service', url: '/terms' },
    { name: 'Cookie Policy', url: '/cookies' },
    { name: 'GDPR', url: '/gdpr' }
  ];

  const isLanding = variant === 'landing';

  return (
    <footer className={`${isLanding ? 'landing-footer' : ''} ${className}`} style={{
      backgroundColor: isLanding ? '#0f172a' : '#1e293b',
      color: '#94a3b8',
      padding: isLanding ? '5rem 0 3rem' : '3rem 0',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Main Footer Content */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isLanding ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Section */}
          <div style={{ gridColumn: isLanding ? 'span 2' : 'span 1' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ 
                width: isLanding ? '3rem' : '2.5rem', 
                height: isLanding ? '3rem' : '2.5rem', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: isLanding ? '1.25rem' : '1rem'
                }}>⚖️</span>
              </div>
              <span style={{ 
                fontSize: isLanding ? '1.75rem' : '1.25rem', 
                fontWeight: 'bold', 
                color: 'white' 
              }}>
                LegalDocs
              </span>
            </div>
            
            <p style={{ 
              color: '#94a3b8', 
              marginBottom: '2rem', 
              lineHeight: '1.6',
              maxWidth: '400px',
              fontSize: isLanding ? '1.125rem' : '1rem'
            }}>
              {isLanding 
                ? 'The future of legal document management. Intelligent, secure, and designed for modern legal professionals.'
                : 'Legal document management for modern professionals. Streamline your workflow with intelligent automation.'
              }
            </p>
            
            {/* Social Links */}
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              marginBottom: isLanding ? '2rem' : '0'
            }}>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    width: '2.75rem', 
                    height: '2.75rem', 
                    backgroundColor: '#374151',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#4b5563';
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#374151';
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <span style={{ color: 'white', fontSize: '1.125rem' }}>{social.icon}</span>
                </a>
              ))}
            </div>

            {/* Newsletter Subscription (Landing only) */}
            {isLanding && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ 
                  color: 'white', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem' 
                }}>
                  Stay Updated
                </h4>
                <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#4b5563'}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Product Links */}
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem' 
            }}>
              Product
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {productLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.url}
                  style={{ 
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem' 
            }}>
              Company
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.url}
                  style={{ 
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem' 
            }}>
              Support
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {supportLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.url}
                  style={{ 
                    color: '#94a3b8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#94a3b8'}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ 
          borderTop: '1px solid #374151', 
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Copyright and Legal Links */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            width: '100%'
          }}>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              margin: 0
            }}>
              © 2024 LegalDocs. All rights reserved.
            </p>
            
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'center'
            }}>
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.url}
                  style={{ 
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#6b7280'}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
            color: '#6b7280',
            fontSize: '0.75rem'
          }}>
            <p style={{ margin: 0 }}>
              Built with ❤️ for legal professionals worldwide
            </p>
            <p style={{ margin: 0 }}>
              SOC 2 Type II Certified • GDPR Compliant • ISO 27001
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

