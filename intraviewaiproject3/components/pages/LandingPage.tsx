"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BarChart3, Code, Shield, TrendingUp, Video, FileText } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-01.png" alt="IntraView AI" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl text-slate-900">IntraView AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900">
              How It Works
            </a>
          </div>
          <Button onClick={onGetStarted} size="sm">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden"
      >
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(/landing_page_intraview_ai.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        ></div>
        {/* Overall black overlay (70% opacity) covering full background image */}
        <div className="absolute inset-0 bg-black/70"></div>
        
        {/* Content container */}
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="p-8 md:p-12 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered Real-Time{" "}
              <span className="text-blue-400">
                Practice Interview System
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Practice interviews with AI-powered assessments. Get real-time feedback on both your communication skills
              and technical abilities, then land your dream job with confidence.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80">Companies Trust Us</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/80">Interviews Conducted</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">95%</div>
                <div className="text-white/80">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Code, title: "AI-Powered Assessment", desc: "Real-time analysis of your responses" },
              { icon: Video, title: "Behavioral + Coding", desc: "Comprehensive interview experience" },
              {
                icon: TrendingUp,
                title: "Track Your Progress",
                desc: "See your improvement over time",
              },
              { icon: BarChart3, title: "Detailed Analytics", desc: "Comprehensive performance insights" },
              { icon: FileText, title: "Custom Questions", desc: "Tailored interviews for your role" },
              { icon: Shield, title: "Secure & Scalable", desc: "Enterprise-grade platform" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 border border-slate-200 rounded-lg bg-white hover:shadow-lg hover:border-slate-300 transition"
              >
                <feature.icon className="w-8 h-8 text-blue-800 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Setup Profile", desc: "Add your skills and background" },
              { step: 2, title: "Take Interview", desc: "Behavioral + Coding combined" },
              { step: 3, title: "Get Report", desc: "Detailed analysis of your performance" },
              { step: 4, title: "Track Growth", desc: "Monitor your progress over time" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-800 to-blue-800 text-white flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-blue-800 to-blue-800 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Interviews?</h2>
          <p className="mb-8 text-blue-50">
            Start practicing today with our combined behavioral and technical assessment.
          </p>
          <Button onClick={onGetStarted} size="lg" variant="secondary">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Follow</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>&copy; 2025 IntraView AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
