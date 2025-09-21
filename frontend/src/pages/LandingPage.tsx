import { Link } from 'react-router-dom';

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

      {/* Hero Section */}
      <div className="pt-24 pb-20 px-4 relative">
        <div className="container text-center">
          {/* Badge */}
          <div className="landing-badge inline-flex items-center px-6 py-3 rounded-full text-blue-700 text-lg font-bold mb-8 animate-fade-in">
            ✨ LegalTech Reimagined • Trusted by 10,000+ Lawyers
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight animate-slide-up">
            Transform Your
            <span className="block landing-title mt-4">
              Legal Practice
            </span>
            with AI
          </h1>

          {/* Subheading */}
          <p className="text-2xl md:text-3xl text-gray-600 mb-16 leading-relaxed animate-fade-in" style={{ maxWidth: '60rem', margin: '0 auto 4rem' }}>
            The most advanced AI-powered legal document management platform. 
            <span className="font-semibold text-blue-600"> Save 40+ hours per week</span> with intelligent automation.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-slide-up">
            <Link 
              to="/register"
              className="btn btn-primary text-xl font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-glow"
            >
              Start Free Trial →
            </Link>
            <Link 
              to="/login"
              className="btn btn-outline text-xl font-bold px-10 py-5 rounded-2xl transition-all duration-500 hover:-translate-y-2"
            >
              Watch Demo
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ maxWidth: '60rem', margin: '0 auto' }}>
            <div className="text-center p-6 glass rounded-2xl">
              <div className="text-3xl font-black text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600 font-semibold">Active Lawyers</div>
            </div>
            <div className="text-center p-6 glass rounded-2xl">
              <div className="text-3xl font-black text-gray-900 mb-2">1M+</div>
              <div className="text-gray-600 font-semibold">Documents Processed</div>
            </div>
            <div className="text-center p-6 glass rounded-2xl">
              <div className="text-3xl font-black text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600 font-semibold">Uptime SLA</div>
            </div>
            <div className="text-center p-6 glass rounded-2xl">
              <div className="text-3xl font-black text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-semibold">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="container">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-purple-100 text-purple-700 text-lg font-bold mb-6">
              ⚡ Powerful AI Features
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8">
              Everything you need to
              <span className="block landing-title mt-4">
                revolutionize your practice
              </span>
            </h2>
            <p className="text-2xl text-gray-600" style={{ maxWidth: '50rem', margin: '0 auto' }}>
              Our platform combines cutting-edge AI with intuitive design to transform how you work.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                name: 'AI-Powered Search',
                description: 'Find relevant information instantly across all your documents with natural language queries.',
                color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                stats: '95% accuracy'
              },
              {
                icon: '📄',
                name: 'Smart Summarization',
                description: 'Quickly grasp the essence of lengthy legal texts with AI-generated summaries.',
                color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                stats: '10x faster'
              },
              {
                icon: '🔒',
                name: 'Enterprise Security',
                description: 'Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
                color: 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)',
                stats: '99.9% secure'
              },
              {
                icon: '⭐',
                name: 'Fact Matching',
                description: 'Verify facts and identify discrepancies automatically across documents.',
                color: 'linear-gradient(135deg, #ec4899 0%, #dc2626 100%)',
                stats: '99% precision'
              },
              {
                icon: '👥',
                name: 'Team Collaboration',
                description: 'Share documents and collaborate seamlessly with your entire legal team.',
                color: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                stats: 'Unlimited users'
              },
              {
                icon: '⚡',
                name: 'Workflow Automation',
                description: 'Automate repetitive tasks and focus on what matters most.',
                color: 'linear-gradient(135deg, #eab308 0%, #ea580c 100%)',
                stats: '40h saved/week'
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="landing-feature-card rounded-3xl p-8 interactive-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 hover:scale-125 transition-transform duration-300 shadow-lg" style={{ 
                  background: feature.color.includes('gradient') ? feature.color : `linear-gradient(135deg, ${feature.color} 0%, ${feature.color} 100%)`
                }}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {feature.name}
                  </h3>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {feature.stats}
                  </span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
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

      {/* Footer */}
      <footer className="landing-footer py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)'
                }}>
                  <span className="text-white font-bold text-xl">⚖️</span>
                </div>
                <span className="text-3xl font-black text-white">
                  LegalDocs
                </span>
              </div>
              
              <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                The future of legal document management. AI-powered, secure, and designed for modern legal professionals.
              </p>
              
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">📧</span>
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">🐦</span>
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  <span className="text-white">💼</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Product</h3>
              <div className="space-y-4">
                <Link to="/features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link to="/security" className="block text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
                <Link to="/integrations" className="block text-gray-400 hover:text-white transition-colors">
                  Integrations
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Company</h3>
              <div className="space-y-4">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link to="/careers" className="block text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link to="/blog" className="block text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-lg">
                © 2024 LegalDocs. All rights reserved.
              </p>
              <div className="flex space-x-8 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
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

export default LandingPage;