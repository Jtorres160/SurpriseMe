import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  Lock, 
  DollarSign, 
  Users, 
  Image, 
  Video, 
  Shield, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload your images and videos with just a few clicks. Support for multiple formats.'
    },
    {
      icon: Lock,
      title: 'Secure Content',
      description: 'Your content is protected behind a paywall. Only paying customers can access it.'
    },
    {
      icon: DollarSign,
      title: 'Earn Money',
      description: 'Set your own prices and earn money from your creative content.'
    },
    {
      icon: Users,
      title: 'Build Audience',
      description: 'Connect with fans and build a loyal following around your content.'
    },
    {
      icon: Shield,
      title: 'Safe Payments',
      description: 'Secure payment processing with Stripe. Your earnings are protected.'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Buyers get instant access to content after payment confirmation.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Creators' },
    { number: '50K+', label: 'Content Items' },
    { number: '$500K+', label: 'Paid to Creators' },
    { number: '100K+', label: 'Happy Customers' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Photographer',
      content: 'SurpriseMe has completely changed how I monetize my photography. The platform is so easy to use!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Video Creator',
      content: 'I love how I can set my own prices and the payment system is seamless. Highly recommended!',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Digital Artist',
      content: 'The best platform for selling digital art. My earnings have increased significantly since joining.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Share Your Creativity,
              <span className="text-gradient block">Earn Your Worth</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your images and videos, set your price, and let people pay to unlock your exclusive content. 
              Start earning from your creativity today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/upload" className="btn-primary text-lg px-8 py-3">
                  <Upload className="w-5 h-5 mr-2" />
                  Start Uploading
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started Free
                  </Link>
                  <Link to="/gallery" className="btn-secondary text-lg px-8 py-3">
                    Browse Content
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to monetize your content effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Content</h3>
              <p className="text-gray-600">
                Upload your images or videos and add a compelling title and description
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Your Price</h3>
              <p className="text-gray-600">
                Choose how much your content is worth and set the price accordingly
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Earning</h3>
              <p className="text-gray-600">
                People pay to unlock your content and you earn money instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Creators Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied creators who are already earning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already monetizing their content on SurpriseMe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/upload" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
                Upload Your First Content
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started Free
                </Link>
                <Link to="/gallery" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                  Browse Content
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 