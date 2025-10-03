import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Footer } from '../components/layout/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LegalDocs Pro
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-6 py-2.5 text-gray-700 hover:text-blue-600 font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              Trusted by 10,000+ Legal Professionals
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
              Legal Document
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                Management Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              AI-powered platform that transforms how law firms manage, search, and analyze documents. 
              <span className="font-semibold text-gray-900"> Save 40+ hours per week.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
              >
                Get Started Free →
              </Link>
              <Link 
                to="/login"
                className="px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 w-full sm:w-auto"
              >
                Watch Demo
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: '10,000+', label: 'Active Users' },
              { value: '5M+', label: 'Documents Processed' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '40hrs', label: 'Saved Per Week' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
              Enterprise-Grade Features
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Everything Your Firm Needs
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                In One Platform
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your workflow with AI-powered tools designed specifically for legal professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
                name: 'AI-Powered Search',
                description: 'Find relevant information instantly across millions of documents using natural language queries',
                color: 'from-blue-500 to-blue-600',
                stats: '95% Accuracy'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                name: 'Smart Chunking',
                description: 'Automatically break down complex documents into manageable, searchable segments',
                color: 'from-emerald-500 to-emerald-600',
                stats: '10x Faster'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                name: 'Enterprise Security',
                description: 'Bank-grade encryption with SOC 2, GDPR, and HIPAA compliance for peace of mind',
                color: 'from-purple-500 to-purple-600',
                stats: '256-bit SSL'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
                name: 'Document Conversion',
                description: 'Convert PDFs to editable Word documents while preserving formatting and structure',
                color: 'from-rose-500 to-rose-600',
                stats: '99% Accurate'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
                name: 'Team Collaboration',
                description: 'Real-time collaboration with granular permissions and activity tracking',
                color: 'from-amber-500 to-amber-600',
                stats: 'Unlimited Users'
              },
              {
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                name: 'Workflow Automation',
                description: 'Automate repetitive tasks with customizable workflows and integrations',
                color: 'from-cyan-500 to-cyan-600',
                stats: '40h Saved/Week'
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Performance</span>
                  <span className={`text-sm font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.stats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Transform Your
              <span className="block mt-2">Legal Practice?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join 10,000+ legal professionals who save 40+ hours per week with LegalDocs Pro
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/register"
                className="px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free 14-Day Trial →
              </Link>
              <Link 
                to="/login"
                className="px-10 py-5 bg-transparent text-white text-lg font-bold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
              >
                Request Demo
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/90">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Setup in 5 minutes
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-16 pt-16 border-t border-white/20">
              <p className="text-white/80 text-sm mb-6 uppercase tracking-wider font-semibold">Trusted by Leading Law Firms</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-80">
                {['Baker McKenzie', 'Latham & Watkins', 'Skadden', 'Kirkland & Ellis', 'DLA Piper'].map((firm, idx) => (
                  <div key={idx} className="text-white font-semibold text-lg">{firm}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">LegalDocs Pro</span>
              </div>
              <p className="text-sm max-w-md">
                The modern document management platform for legal professionals
              </p>
            </div>
            <div className="flex space-x-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2025 LegalDocs Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;