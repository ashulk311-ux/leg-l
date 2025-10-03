import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Footer } from '../components/layout/Footer';

function LandingPage() {
  return (
    <div className="landing-hero">
      {/* Floating Background Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>

      {/* Navigation */}
      <nav className="landing-nav shadow-lg">
        <div className="container">
          <div className="flex justify-between items-center" style={{ height: '5rem' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
              }}>
                <span className="text-white font-bold text-lg">⚖️</span>
              </div>
              <span className="text-3xl font-black gradient-text">
                LegalDocs
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary text-lg px-6 py-3"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-purple-100 text-purple-700 text-lg font-bold mb-6" style={{ display: 'none' }}>
              ⚡ Powerful AI Features
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8">
              Everything you need to
              <span className="block landing-title mt-4">
                revolutionize your practice
              </span>
            </h2>
            <p className="text-2xl text-gray-600" style={{ maxWidth: '50rem', margin: '0 auto' }}>
              Our platform combines cutting-edge technology with intuitive design to transform how you work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                name: 'Semantic Search',
                description: 'Find relevant information instantly across all your documents with natural language queries.',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                stats: '95% accuracy'
              },
              {
                icon: '📄',
                name: 'Smart Summarization',
                description: 'Quickly grasp the essence of lengthy legal texts with intelligent summaries.',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                stats: '10x faster'
              },
              {
                icon: '🔒',
                name: 'Enterprise Security',
                description: 'Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                stats: '99.9% secure'
              },
              {
                icon: '⭐',
                name: 'Fact Matching',
                description: 'Verify facts and identify discrepancies automatically across documents.',
                gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                stats: '99% precision'
              },
              {
                icon: '👥',
                name: 'Team Collaboration',
                description: 'Share documents and collaborate seamlessly with your entire legal team.',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                stats: 'Unlimited users'
              },
              {
                icon: '⚡',
                name: 'Workflow Automation',
                description: 'Automate repetitive tasks and focus on what matters most.',
                gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                stats: '40h saved/week'
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                style={{ 
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
                  background: feature.gradient,
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
                    <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
                    {feature.name}
                  </CardTitle>
                  <CardDescription style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: '0' }}>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent style={{ padding: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Performance
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      background: feature.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {feature.stats}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="landing-cta py-24 relative">
        <div className="container text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
            Ready to transform your
            <span className="block mt-4">legal practice?</span>
          </h2>
          <p className="text-2xl text-blue-100 mb-16" style={{ maxWidth: '40rem', margin: '0 auto 4rem' }}>
            Join thousands of legal professionals who trust LegalDocs to streamline their workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register"
              className="btn btn-white text-2xl font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              Start Free Trial ✨
            </Link>
            <Link 
              to="/login"
              className="btn btn-ghost text-2xl font-bold px-12 py-6 rounded-2xl transition-all duration-500"
              style={{ border: '3px solid rgba(255, 255, 255, 0.3)', color: 'white' }}
            >
              Schedule Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-blue-200 text-lg mb-8">Trusted by leading law firms worldwide</p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              <div className="text-white font-bold text-xl">Baker McKenzie</div>
              <div className="text-white font-bold text-xl">Latham & Watkins</div>
              <div className="text-white font-bold text-xl">Skadden</div>
              <div className="text-white font-bold text-xl">Kirkland & Ellis</div>
            </div>
          </div>
        </div>
      </div>

      <Footer variant="landing" />
    </div>
  );
}

export default LandingPage;