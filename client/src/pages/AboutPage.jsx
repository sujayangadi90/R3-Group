import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building,
  KeyRound,
  Compass,
  FileCheck2,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <main className="w-full pt-24 pb-20 bg-surface">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-gold font-semibold text-xs tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Advisory Heritage & Philosophy</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight leading-tight">
                Crafting Enduring Legacies in Ultra-Luxury Real Estate.
              </h1>

              <p className="text-base lg:text-lg text-charcoal-600 max-w-2xl leading-relaxed">
                Founded on absolute discretion, architectural reverence, and institutional rigor, R3 Group is South Mumbai’s premier real estate advisory firm serving family offices, generational dynasties, and discerning global investors.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-black transition-all shadow-md"
                >
                  <span>Explore Prime Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#ECECE8] text-primary font-bold text-sm hover:bg-surface-warm transition-all shadow-sm"
                >
                  <span>Private Desk Consultation</span>
                </Link>
              </div>
            </div>

            {/* Emblem Card */}
            <div className="relative w-full lg:w-96 shrink-0 flex flex-col items-center justify-center p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-luxury">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gold/10 blur-2xl pointer-events-none"></div>
              <img
                alt="R3 Group Emblem"
                className="w-44 h-auto object-contain py-4"
                src="/r3_logo.png"
              />
              <div className="mt-4 text-center space-y-1">
                <p className="font-bold text-primary text-base">Private Real Estate Advisory</p>
                <p className="text-xs font-semibold text-gold tracking-widest uppercase">
                  Mumbai • Dubai • London Desk
                </p>
              </div>
              <div className="w-full mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-center">
                <div>
                  <span className="block font-bold text-primary text-sm">Est. 2007</span>
                  <span className="text-[11px] text-charcoal-500">Founded</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div>
                  <span className="block font-bold text-gold text-sm">RERA Certified</span>
                  <span className="text-[11px] text-charcoal-500">Regulated Advisory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="w-full bg-white py-14 border-y border-[#ECE7E1]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1 p-6 rounded-xl bg-surface-warm">
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Aggregate Transacted</p>
              <p className="text-3xl font-extrabold text-primary">₹ 2,400+ Cr</p>
              <p className="text-[11px] text-charcoal-500">Across residential & commercial</p>
            </div>
            <div className="space-y-1 p-6 rounded-xl bg-surface-warm">
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Client Families</p>
              <p className="text-3xl font-extrabold text-primary">450+</p>
              <p className="text-[11px] text-charcoal-500">Family offices & corporate leaders</p>
            </div>
            <div className="space-y-1 p-6 rounded-xl bg-surface-warm">
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Advisory Heritage</p>
              <p className="text-3xl font-extrabold text-primary">18+ Years</p>
              <p className="text-[11px] text-charcoal-500">Operating in South Mumbai</p>
            </div>
            <div className="space-y-1 p-6 rounded-xl bg-surface-warm">
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Title Integrity</p>
              <p className="text-3xl font-extrabold text-primary">100%</p>
              <p className="text-[11px] text-charcoal-500">Zero litigation disputes recorded</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Operational Principles</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mt-2">
              The Three Pillars of R3 Advisory
            </h2>
            <p className="mt-3 text-sm text-charcoal-500 leading-relaxed">
              We operate strictly as fiduciaries, protecting family capital from inflated valuations, legal ambiguity, and market volatility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary">1. Absolute Discretion</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Trophy real estate transactions demand absolute confidentiality. We protect client identity through blinded dossiers, strict NDAs, and private off-market listings, ensuring your private life and transactions remain uncompromised.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary">2. Architectural Reverence</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                We believe true luxury is a function of architectural purity. We evaluate volume, structural integrity, fenestration, acoustic isolation, and natural illumination, selecting residences that appreciate both culturally and financially.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#ECECE8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary">3. Institutional Rigor</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Every transaction undergoes exhaustive audit: title history spanning 30+ years, RERA compliance, local zoning sanctions, municipal clearances, and tax optimization structures executed alongside our empanelled legal partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to connect banner */}
      <section className="py-16 bg-white border-t border-[#ECE7E1]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Connect With Leadership</span>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Initiate a Confidential Property Dialogue
          </h2>
          <p className="text-sm text-charcoal-600 max-w-xl mx-auto leading-relaxed">
            Whether evaluating acquisition of a trophy penthouse or structuring the private disposition of an estate, our advisory desk is available for confidential discussions.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md transition-all"
            >
              Contact Advisory Desk
            </Link>
            <Link
              to="/sell"
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-black text-white font-bold text-sm shadow-md transition-all"
            >
              List an Asset
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
