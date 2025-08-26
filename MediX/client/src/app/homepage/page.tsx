"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type RevenueData = {
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
};

export default function Home() {

  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    // Fetch revenue analytics
    fetch("http://localhost:8080/api/bills/revenue/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch revenue data");
        return res.json();
      })
      .then((data) => {
        setRevenue(data);
        setRevenueLoading(false);
      })
      .catch((err) => {
        setRevenueError(err.message || "Error fetching revenue data");
        setRevenueLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: "🩺",
      title: "Expert Medical Care",
      description:
        "Connect with certified doctors and healthcare professionals",
    },
    {
      icon: "📱",
      title: "Digital Prescriptions",
      description:
        "Get digital prescriptions instantly and track your medications",
    },
    {
      icon: "⏰",
      title: "Easy Scheduling",
      description:
        "Book appointments at your convenience with just a few clicks",
    },
    {
      icon: "🏥",
      title: "Comprehensive Care",
      description: "Complete healthcare management from diagnosis to treatment",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      text: "MediX has transformed how I manage my healthcare. The convenience is unmatched!",
      avatar: "👩‍💼",
    },
    {
      name: "Dr. Michael Chen",
      role: "Healthcare Provider",
      text: "As a doctor, MediX streamlines my practice and improves patient care significantly.",
      avatar: "👨‍⚕️",
    },
    {
      name: "Emma Rodriguez",
      role: "Patient",
      text: "Booking appointments has never been easier. Highly recommend MediX!",
      avatar: "👩‍🎓",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Patients" },
    { number: "500+", label: "Healthcare Providers" },
    { number: "50K+", label: "Prescriptions Managed" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/lo.png"
              alt="MediX Logo"
              width={50}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-2xl font-bold text-green-700">
              Medi<span className="text-gray-800">X</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              Testimonials
            </a>
          </nav>

          <Link
            href="/signin"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Health,
                <span className="text-green-600 block">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the future of healthcare with MediX. Connect with top
                doctors, manage prescriptions digitally, and take control of
                your health journey with our comprehensive medical platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/request-appointment"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                >
                  Book Appointment
                </Link>
                <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105">
                  Learn More
                </button>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Image
                    src="/Prescription.png"
                    alt="Digital Prescription"
                    width={500}
                    height={400}
                    className="rounded-2xl shadow-lg"
                    priority
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
                  <span className="text-3xl">💊</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-pulse">
                  <span className="text-3xl">🩺</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <span className="text-2xl">⚕️</span>
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <span className="text-2xl">🏥</span>
          </div>
        </div>
      </section>

      {/* Revenue Overview Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Revenue Overview</h2>
          {revenueLoading ? (
            <div className="text-gray-500">Loading revenue data...</div>
          ) : revenueError ? (
            <div className="text-red-500">{revenueError}</div>
          ) : revenue ? (
            <div>
              <div className="mb-6">
                <span className="text-lg text-gray-700">Total Revenue:</span>
                <span className="text-2xl font-bold text-green-700 ml-2">${revenue.totalRevenue?.toLocaleString() ?? 0}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b text-left">Month</th>
                        <th className="px-4 py-2 border-b text-left">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.monthlyRevenue?.map((m) => (
                        <tr key={m.month}>
                          <td className="px-4 py-2 border-b">{m.month}</td>
                          <td className="px-4 py-2 border-b">${m.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose MediX?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing healthcare with cutting-edge technology and
              compassionate care, making quality healthcare accessible to
              everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transforming Healthcare
                <span className="text-green-600 block">
                  One Patient at a Time
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MediX is more than just a healthcare platform—it's your partner
                in wellness. We bridge the gap between patients and healthcare
                providers with innovative technology that makes quality care
                accessible, affordable, and efficient.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From instant appointment booking to digital prescription
                management, we're simplifying every aspect of your healthcare
                journey.
              </p>
              <Link
                href="/request-appointment"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Get Started Today
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-blue-400 to-green-500 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Dr. Sarah Wilson
                      </h4>
                      <p className="text-gray-600 text-sm">Cardiologist</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    "MediX has revolutionized how I connect with my patients.
                    The platform is intuitive and helps me provide better care."
                  </p>
                  <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied patients and healthcare providers
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="text-center">
                <div className="text-6xl mb-6">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <blockquote className="text-2xl text-gray-700 mb-8 italic leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-green-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join MediX today and experience the future of healthcare. Book your
            first appointment and discover the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/request-appointment"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Your Appointment
            </Link>
            <Link
              href="/signin"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Healthcare Provider Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/lo.png"
                  alt="MediX Logo"
                  width={40}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">
                  Medi<span className="text-green-400">X</span>
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing healthcare with innovative technology and
                compassionate care.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <Link
                    href="/request-appointment"
                    className="hover:text-white transition-colors"
                  >
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signin"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Online Consultations</li>
                <li>Digital Prescriptions</li>
                <li>Health Records</li>
                <li>Appointment Booking</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@medix.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Healthcare Ave, Medical City</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 MediX. All rights reserved. Your health, our priority.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
