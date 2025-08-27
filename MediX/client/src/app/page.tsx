"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

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
      name: "Sadia Sultana",
      role: "Receptionist",
      text: "MediX has made my job so much easier. I can manage appointments and patient information effortlessly.",
      avatar: "👩‍💼",
    },
    {
      name: "Dr. Salman Kareem",
      role: "Healthcare Provider",
      text: "As a doctor, MediX streamlines my practice and improves patient care significantly.",
      avatar: "👨‍⚕️",
    },
    {
      name: "Anika Rahman",
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
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-green-50 via-white to-blue-50"
      }`}
    >
      {/* Navigation Header */}
      <header
        className={`backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors duration-300 ${
          darkMode ? "bg-gray-900/80" : "bg-white/80"
        }`}
      >
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
            <span
              className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? "text-green-400" : "text-green-700"
              }`}
            >
              Medi
              <span className={darkMode ? "text-gray-200" : "text-gray-800"}>
                X
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className={`transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:text-green-400"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Features
            </a>
            <a
              href="#about"
              className={`transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:text-green-400"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              About
            </a>
            <a
              href="#testimonials"
              className={`transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:text-green-400"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Testimonials
            </a>
            <Link
              href="/patient-status"
              className={`transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:text-green-400"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              Check Status
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 transform hover:scale-105 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <Link
              href="/signin"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
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
              <h1
                className={`text-5xl lg:text-6xl font-bold leading-tight mb-6 transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Your Health,
                <span
                  className={`block transition-colors duration-300 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Our Priority
                </span>
              </h1>
              <p
                className={`text-xl mb-8 leading-relaxed transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
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
                <Link
                  href="/patient-status"
                  className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 text-center border-2 ${
                    darkMode
                      ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900"
                      : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  Check Status
                </Link>
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
                {/* Healthcare Promise Section */}
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-center text-white space-y-6">
                    {/* Main Promise */}
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold leading-tight">
                        Healthcare Made
                        <span className="block text-yellow-300">
                          Simple & Smart
                        </span>
                      </h2>
                      <div className="w-20 h-1 bg-yellow-300 mx-auto rounded-full"></div>
                    </div>

                    {/* Key Benefits */}
                    <div className="grid grid-cols-1 gap-4 mt-8">
                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl font-bold">
                            ✓
                          </span>
                        </div>
                        <span className="text-lg font-medium">
                          Seamless Doctor Appointment
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl font-bold">
                            ✓
                          </span>
                        </div>
                        <span className="text-lg font-medium">
                          Digital Health Records
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl font-bold">
                            ✓
                          </span>
                        </div>
                        <span className="text-lg font-medium">
                          24/7 Support Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div
                  className={`absolute -top-4 -right-4 rounded-full p-4 shadow-lg animate-bounce ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <span className="text-3xl">🩺</span>
                </div>
                <div
                  className={`absolute -bottom-4 -left-4 rounded-full p-4 shadow-lg animate-pulse ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <span className="text-3xl">💚</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div
            className={`backdrop-blur-sm rounded-full p-4 ${
              darkMode ? "bg-gray-800/20" : "bg-white/20"
            }`}
          >
            <span className="text-2xl">⚕️</span>
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div
            className={`backdrop-blur-sm rounded-full p-4 ${
              darkMode ? "bg-gray-800/20" : "bg-white/20"
            }`}
          >
            <span className="text-2xl">🏥</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className={`py-20 transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Why Choose MediX?
            </h2>
            <p
              className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              We're revolutionizing healthcare with cutting-edge technology and
              compassionate care, making quality healthcare accessible to
              everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
                  darkMode ? "bg-gray-700" : "bg-white"
                }`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed transition-colors duration-300 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
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
              <h2
                className={`text-4xl font-bold mb-6 transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Transforming Healthcare
                <span
                  className={`block transition-colors duration-300 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  One Patient at a Time
                </span>
              </h2>
              <p
                className={`text-lg mb-6 leading-relaxed transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                MediX is more than just a healthcare platform—it's your partner
                in wellness. We bridge the gap between patients and healthcare
                providers with innovative technology that makes quality care
                accessible, affordable, and efficient.
              </p>
              <p
                className={`text-lg mb-8 leading-relaxed transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
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
                <div
                  className={`rounded-2xl p-6 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-300 ${
                          darkMode ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        Dr. Sarah Wilson
                      </h4>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Cardiologist
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm mb-4 transition-colors duration-300 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
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
      <section
        id="testimonials"
        className={`py-20 transition-colors duration-300 ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              What Our Users Say
            </h2>
            <p
              className={`text-xl transition-colors duration-300 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join thousands of satisfied patients and healthcare providers
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div
              className={`rounded-2xl shadow-xl p-8 md:p-12 transition-colors duration-300 ${
                darkMode ? "bg-gray-700" : "bg-white"
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-6">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <blockquote
                  className={`text-2xl mb-8 italic leading-relaxed transition-colors duration-300 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div>
                  <div
                    className={`font-semibold text-lg transition-colors duration-300 ${
                      darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div
                    className={`transition-colors duration-300 ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
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
                      ? darkMode
                        ? "bg-green-400"
                        : "bg-green-600"
                      : darkMode
                      ? "bg-gray-600"
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
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdb4DJ6meoTb-rUdISAKvSDO4dGZqp9gCTxobc8w5ZsB18W7Q/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Provide Feedback
            </a>
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
      <footer
        className={`py-12 text-white transition-colors duration-300 ${
          darkMode ? "bg-gray-900" : "bg-gray-900"
        }`}
      >
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
                    href="/patient-status"
                    className="hover:text-white transition-colors"
                  >
                    Check Status
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
