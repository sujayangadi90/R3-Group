import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Building2, ShieldCheck, Phone, PlusCircle, UserCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Buy Property', path: '/properties' },
    { name: 'Sell Property', path: '/sell' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#ECE7E1]'
          : 'bg-white/90 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/r3_logo.png"
              alt="R3 Group Logo"
              className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[15px] font-medium transition-all relative py-1 ${
                  isActive(link.path)
                    ? 'text-primary font-semibold'
                    : 'text-charcoal-600 hover:text-gold'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions Desk */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-white font-semibold text-sm tracking-wide shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Property</span>
            </Link>

            <Link
              to="/admin"
              className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center ${
                isAuthenticated
                  ? 'border-gold text-gold bg-gold-subtle hover:bg-gold/20'
                  : 'border-charcoal-500/20 text-charcoal-600 hover:text-primary hover:border-primary'
              }`}
              title={isAuthenticated ? 'Admin Dashboard' : 'Admin Portal Login'}
            >
              <UserCircle className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/admin"
              className="p-2 text-charcoal-600 hover:text-primary"
              title="Admin Portal"
            >
              <UserCircle className="w-6 h-6" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-800 hover:text-gold transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#ECE7E1] shadow-xl px-6 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`py-2 text-base font-medium flex items-center justify-between border-b border-gray-100 ${
                  isActive(link.path)
                    ? 'text-primary font-bold border-l-4 border-l-gold pl-3'
                    : 'text-charcoal-600 hover:text-gold pl-1'
                }`}
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-charcoal-500" />
              </Link>
            ))}

            <div className="pt-3">
              <Link
                to="/sell"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-gold text-white font-semibold text-sm shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                List Your Property
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
