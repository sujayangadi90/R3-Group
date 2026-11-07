import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle,
  Home as HomeIcon,
  Phone,
  Compass,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { SiteVisitModal } from '../components/SiteVisitModal';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState(null);

  // Search filter bar states
  const [citiesData, setCitiesData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [searchType, setSearchType] = useState('All');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.getLocations();
        if (res.success && res.data) {
          setCitiesData(res.data);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Compute available localities for selected city
  const availableLocalities = React.useMemo(() => {
    if (selectedCity === 'All') {
      // Gather all unique active localities across all cities
      const allLocs = [];
      citiesData.forEach((c) => {
        (c.localities || []).forEach((l) => {
          if (l.isActive !== false && !allLocs.includes(l.name)) {
            allLocs.push(l.name);
          }
        });
      });
      return allLocs;
    }
    const targetCity = citiesData.find((c) => c.name.toLowerCase() === selectedCity.toLowerCase());
    return targetCity
      ? (targetCity.localities || []).filter((l) => l.isActive !== false).map((l) => l.name)
      : [];
  }, [citiesData, selectedCity]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getProperties({ featured: 'true', limit: 6 });
        if (res.success && res.data) {
          setFeaturedProperties(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedCity !== 'All') query.append('city', selectedCity);
    if (selectedLocality !== 'All') query.append('locality', selectedLocality);
    if (searchType !== 'All') query.append('type', searchType);
    navigate(`/properties?${query.toString()}`);
  };

  const categories = [
    {
      title: 'Luxury Apartments',
      count: '32 Available',
      type: 'Apartment',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB0QMWhxAlvDLvHIWVtpFnIGLGkFkt4mwqZ8jzawQftrl2VeT60y4HAVDouH6LbTfzdyJ6d892Mj_d4_9uuQOWrsW9FvZkrVuZmaAH5ohhNMsdLZkiSPUmHJaJQdfu3hxKZB8HrQ0c9WzS4DA_1MbhkO7W2D_aa1hwxjD_L2YnypgJ--7O6gB1r8kBHwMcdj_QzWw5YCoRed2KnyNCVteQ59uvf4PCD-Fm_QfP8ZQ',
      tagline: 'High-rise sea view residences in South & Central Mumbai',
    },
    {
      title: 'Exclusive Villas',
      count: '14 Available',
      type: 'Villa',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB6sEFbwN58KTVpFKxBT09rDeBm0Ku6pZ49rL8yovuehZ0gj7wWFAUQrRI6Rusfdvkv06uix0b1MlazUSWtV38n4AmG6bXMme-ycTE5x0PO1px5kUrhcvg-J0kbwnGOE0tcno9qoNO4THlKUuEgm9f05utMtbVSeFSPZj_CuFpCh_GZ-hsVwkVEstELdxQx0ee9cHk-2ob_gVRYRrBJQzKbhpXt4EPeb6B3wPFAow',
      tagline: 'Coastal private beachfront & hillside family compounds',
    },
    {
      title: 'Signature Penthouses',
      count: '8 Available',
      type: 'Penthouse',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1kDiJaHOk5TnCh26sWAhk-EsR8-oofu1tWeKGm3Udw4o-CzqgSzl8e2FEYUyMoZaGm5ALuQemvD0ZtrxFS2hHDUOUcgsL2OBQUtFF1ZE03NL-YyzUr9qONzjdkcvy2VJGz6kwNpJQ7nli_CuniTb6-xukt6ccKY_IsdkaOYi63_-1-31jAOpq-bUQ3f3FJ2gZGL4ZUOy_Tcyf9HxhuGpt9Ez9ksjbW-TGHI2nCA',
      tagline: 'Duplex sky sanctuaries with private infinity pools & decks',
    },
    {
      title: 'Prime Freehold Plots',
      count: '11 Available',
      type: 'Plot',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB01xvB3d-GlsgHvF_Uo-ZfYNJwvfGd3rzOt6Nbc94lZb80LU2GM3iALtwH1lQ295dPmQHmJk6l7I6zsrYystFtChGXOzmvLP5drEDZZg9XkfHnunkh7G5dWcYOQc3M1OtTkU28c1Es1J_UrxND__rfA9Zkg39vaSZAeCJYPddmA4SZw6TVesxjPuyrDpsvbW752SXB0P21rXiyZmRHw4_1i8KmsyzBdXW5oEiBWQ',
      tagline: 'Clear-title development land parcels for bespoke estates',
    },
  ];

  return (
    <main className="w-full pt-20 md:pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[760px] flex items-center justify-center bg-primary overflow-hidden">
        {/* Background Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Ultra Luxury Modern Villa Architectural Property"
            className="w-full h-full object-cover object-center scale-105 animate-pulse transition-transform duration-1000 ease-out"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1kDiJaHOk5TnCh26sWAhk-EsR8-oofu1tWeKGm3Udw4o-CzqgSzl8e2FEYUyMoZaGm5ALuQemvD0ZtrxFS2hHDUOUcgsL2OBQUtFF1ZE03NL-YyzUr9qONzjdkcvy2VJGz6kwNpJQ7nli_CuniTb6-xukt6ccKY_IsdkaOYi63_-1-31jAOpq-bUQ3f3FJ2gZGL4ZUOy_Tcyf9HxhuGpt9Ez9ksjbW-TGHI2nCA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#1F1F1F]/75 to-[#1F1F1F]/55"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.65)_100%)]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-gold/40 text-[#E2C389] text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Ultra-Luxury Real Estate Advisory</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.15] drop-shadow-md">
            Find a Property That Feels Like Home.
          </h1>

          <p className="mt-5 text-base md:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed drop-shadow">
            Unrivaled private advisory, discreet acquisitions, and trophy estates across South Mumbai, coastal enclaves, and premier financial corridors.
          </p>

          {/* Search Filter Box: City, Locality, Property Type */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mt-10 p-3 md:p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {/* City Filter */}
            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-200">
              <label className="block text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-1">
                City
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedLocality('All');
                  }}
                  className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Cities</option>
                  {citiesData.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Locality Filter */}
            <div className="px-3 py-2 border-b sm:border-b-0 lg:border-r border-gray-200">
              <label className="block text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-1">
                Locality
              </label>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold shrink-0" />
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">
                    {selectedCity === 'All' ? 'All Localities' : `All in ${selectedCity}`}
                  </option>
                  {availableLocalities.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-gray-200">
              <label className="block text-[11px] font-bold text-charcoal-500 uppercase tracking-wider mb-1">
                Property Type
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold shrink-0" />
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option value="All">All Portfolio</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Apartment">Luxury Apartment</option>
                  <option value="Villa">Beachfront Villa</option>
                  <option value="Commercial">Commercial Office</option>
                  <option value="Plot">Freehold Plot</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-center justify-center p-1">
              <button
                type="submit"
                className="w-full h-full min-h-[46px] rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Portfolio</span>
              </button>
            </div>
          </form>

          {/* Quick Stats in Hero */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/90 text-xs">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold" /> Confidential Family Desk
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold" /> Institutional Due Diligence
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gold" /> 100% Clear Legal Title
            </span>
          </div>
        </div>
      </section>

      {/* Metrics & Heritage Bar */}
      <section className="w-full bg-surface-card border-b border-[#ECE7E1] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-surface-warm">
              <span className="block text-2xl md:text-3xl font-extrabold text-primary">₹ 2,400+ Cr</span>
              <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold mt-1 block">
                Aggregate Transacted
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-warm">
              <span className="block text-2xl md:text-3xl font-extrabold text-gold">450+</span>
              <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold mt-1 block">
                High Net Worth Families
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-warm">
              <span className="block text-2xl md:text-3xl font-extrabold text-primary">18+ Years</span>
              <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold mt-1 block">
                Advisory Heritage
              </span>
            </div>
            <div className="p-4 rounded-xl bg-surface-warm">
              <span className="block text-2xl md:text-3xl font-extrabold text-gold">100%</span>
              <span className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold mt-1 block">
                RERA Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="py-20 bg-surface" id="featured">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-subtle text-gold text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Curated Exclusives
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                Featured Prime Properties
              </h2>
              <p className="mt-2 text-charcoal-500 text-sm max-w-xl">
                Handpicked architectural icons commanding prestigious locations, unmatched finishes, and exceptional capital appreciation.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-gold transition-colors group"
            >
              <span>Explore All 140+ Properties</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl border border-gray-200 h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onBookVisit={(prop) => setSelectedPropertyForVisit(prop)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Categories */}
      <section className="py-20 bg-surface-warm" id="types">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Asset Specialization</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mt-2">
              Bespoke Categories For Discerning Portfolios
            </h2>
            <p className="mt-3 text-sm text-charcoal-500">
              Each asset tier is vetted through our institutional risk framework, title provenance verification, and spatial quality metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                to={`/properties?type=${cat.type}`}
                className="group relative rounded-2xl overflow-hidden shadow-luxury bg-white border border-[#ECECE8] flex flex-col justify-between hover:shadow-luxury-hover transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-gold text-white text-[11px] font-bold uppercase tracking-wider mb-1">
                      {cat.count}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors">
                      {cat.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <p className="text-xs text-charcoal-500 line-clamp-1">{cat.tagline}</p>
                  <ArrowRight className="w-4 h-4 text-gold shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The Three Pillars of R3 Advisory */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Our Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mt-2">
              The Three Pillars of R3 Advisory
            </h2>
            <p className="mt-3 text-sm text-charcoal-500">
              In an opaque market, R3 Group operates as a fiduciary ally, shielding private wealth through structured governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-surface border border-[#ECE7E1] hover:border-gold/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Absolute Discretion</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Trophy real estate transactions demand absolute confidentiality. We protect client identity through blinded dossiers, NDAs, and private off-market listings.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-[#ECE7E1] hover:border-gold/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Architectural Reverence</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                We assess properties beyond square footage: evaluating spatial flow, natural illumination, ceiling heights, ventilation, and generational materials.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface border border-[#ECE7E1] hover:border-gold/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gold-subtle text-gold flex items-center justify-center mb-6">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Institutional Rigor</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Every asset under our mandate is examined across 70+ legal and regulatory touchpoints, Title Deeds, IOD/CC approvals, OC status, and RERA compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Property Advisory Banner */}
      <section className="py-16 bg-primary text-white relative overflow-hidden" id="sell">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Discreet Divestments</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Looking to Sell an Ultra-Luxury Asset?
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Our bespoke advisory connects sellers with pre-vetted family offices, corporate leaders, and institutional buyers without public market exposure.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-300">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold" /> Zero Public Footprint
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold" /> Precise Capital Valuation
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gold" /> Rapid Qualified Matching
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/sell"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-sm tracking-wide shadow-lg transition-all"
              >
                <span>Submit Property For Valuation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                <span>Private Consultation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Site Visit Modal */}
      <SiteVisitModal
        property={selectedPropertyForVisit}
        isOpen={!!selectedPropertyForVisit}
        onClose={() => setSelectedPropertyForVisit(null)}
      />
    </main>
  );
};
