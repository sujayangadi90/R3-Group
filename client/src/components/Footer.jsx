import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#1F1F1F] text-white border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-14 border-b border-[#2E2E2E]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block bg-white rounded-xl p-3 shadow-md">
              <img
                src="/r3_logo.png"
                alt="R3 Group Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm mt-3 font-normal">
              Creating Meaningful Real Estate Opportunities through architectural discretion, absolute integrity, and institutional rigor.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[#E2C389] text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>Premier Advisory & Real Estate Capital</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E2C389] uppercase tracking-widest">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/" className="hover:text-[#E2C389] transition-colors flex items-center gap-1">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-[#E2C389] transition-colors flex items-center gap-1">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-[#E2C389] transition-colors flex items-center gap-1">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#E2C389] transition-colors flex items-center gap-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#E2C389] transition-colors flex items-center gap-1">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E2C389] uppercase tracking-widest">
              Portfolio
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/properties?type=Apartment" className="hover:text-[#E2C389] transition-colors">
                  Luxury Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Villa" className="hover:text-[#E2C389] transition-colors">
                  Exclusive Villas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Penthouse" className="hover:text-[#E2C389] transition-colors">
                  Signature Penthouses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Plot" className="hover:text-[#E2C389] transition-colors">
                  Prime Freehold Plots
                </Link>
              </li>
              <li>
                <Link to="/properties?type=Commercial" className="hover:text-[#E2C389] transition-colors">
                  Commercial Floorplates
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Advisory Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#E2C389] uppercase tracking-widest">
              Direct Advisory
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Bangalore</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+917676759595" className="hover:text-white transition-colors">
                  +91 76767 59595
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a href="mailto:Info@r3group.co.in" className="hover:text-white transition-colors">
                  Info@r3group.co.in
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Sub-footer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} R3 Group Real Estate Advisory. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              Terms of Advisory
            </Link>
            <span className="text-gray-500">RERA: A51900018442</span>
            <Link to="/admin" className="text-gold hover:underline font-semibold flex items-center gap-1">
              Admin Portal <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
