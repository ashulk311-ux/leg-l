import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  CloudIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const features = [
  {
    name: 'AI-Powered Search',
    description: 'Find relevant legal documents instantly using semantic search powered by advanced AI.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Smart Summarization',
    description: 'Get intelligent summaries of complex legal documents in seconds.',
    icon: CpuChipIcon,
  },
  {
    name: 'Secure Storage',
    description: 'Your documents are encrypted and stored securely with enterprise-grade security.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Cloud-Based',
    description: 'Access your documents from anywhere with our cloud-based platform.',
    icon: CloudIcon,
  },
  {
    name: 'Collaboration',
    description: 'Share documents and collaborate with your team seamlessly.',
    icon: UserGroupIcon,
  },
  {
    name: 'Document Management',
    description: 'Organize, categorize, and manage your legal documents efficiently.',
    icon: DocumentTextIcon,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Senior Legal Counsel',
    company: 'TechCorp Inc.',
    content: 'This platform has revolutionized how we manage our legal documents. The AI search is incredibly accurate.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
  },
  {
    name: 'Michael Chen',
    role: 'Partner',
    company: 'Chen & Associates',
    content: 'The document summarization feature saves us hours of work. Highly recommended for any law firm.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Legal Director',
    company: 'Global Enterprises',
    content: 'The security and compliance features give us peace of mind. Our sensitive documents are in safe hands.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
];

const pricingPlans = [
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Perfect for individual legal professionals',
    features: [
      'Up to 1,000 documents',
      'AI-powered search',
      'Document summarization',
      'Basic collaboration',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Team',
    price: '$99',
    period: '/month',
    description: 'Ideal for small to medium law firms',
    features: [
      'Up to 10,000 documents',
      'Advanced AI features',
      'Team collaboration',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with complex needs',
    features: [
      'Unlimited documents',
      'Full AI suite',
      'Advanced security',
      'Dedicated support',
      'Custom deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">LegalDocs</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </Link>
                <Link to="#pricing" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link to="#testimonials" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Testimonials
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Legal
              <span className="text-primary-600"> Document Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your legal practice with intelligent document search, summarization, and management. 
              Find what you need in seconds, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage legal documents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with intuitive design to streamline your legal workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.name} className="text-center">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <CardTitle>{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by legal professionals worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'ring-2 ring-primary-500' : ''}>
                {plan.popular && (
                  <div className="bg-primary-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your legal practice?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust LegalDocs to manage their documents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-white">LegalDocs</span>
              </div>
              <p className="text-gray-400">
                AI-powered legal document management for the modern legal professional.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Security</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Status</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 LegalDocs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
