import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Building2, MapPin, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { SiteVisitModal } from '../components/SiteVisitModal';

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState(null);

  // Filters state
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('newest');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.getProperties({
        type,
        location,
        bedrooms,
        status,
        search,
        sort,
      });
      if (res.success && res.data) {
        setProperties(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [type, location, bedrooms, status, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleResetFilters = () => {
    setType('All');
    setLocation('All');
    setBedrooms('All');
    setStatus('All');
    setSearch('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <main className="w-full pt-24 pb-20 bg-surface min-h-screen">
      {/* Page Header */}
      <section className="bg-white border-b border-[#ECE7E1] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">
                Prime Realty Portfolio
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                Curated Luxury Properties
              </h1>
              <p className="mt-2 text-sm text-charcoal-500 max-w-xl">
                Explore handpicked architectural residences, penthouses, and prime commercial floorplates across premier locations.
              </p>
            </div>

            {/* Quick stats counter */}
            <div className="px-5 py-3 rounded-xl bg-surface-warm border border-gray-200 self-start md:self-center">
              <span className="text-xs text-charcoal-500 uppercase font-semibold block">Curated Listings</span>
              <span className="text-2xl font-extrabold text-primary">{properties.length} Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Listing Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-8">
        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-[#ECECE8] shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by property title, street, or neighborhood..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-charcoal-500 uppercase whitespace-nowrap">
                Sort By:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Largest Area</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
            {/* Type selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-charcoal-500">Type:</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-primary bg-surface-warm focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            {/* Bedrooms selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-charcoal-500">Bedrooms:</span>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-primary bg-surface-warm focus:outline-none"
              >
                <option value="All">All BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5+">5+ BHK</option>
              </select>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-charcoal-500">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-primary bg-surface-warm focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Pre-Launch">Pre-Launch</option>
              </select>
            </div>

            {/* Reset Button */}
            {(type !== 'All' || bedrooms !== 'All' || status !== 'All' || search !== '') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-gray-200 h-96 animate-pulse"
              ></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4 my-12">
            <div className="w-16 h-16 rounded-full bg-gold-subtle text-gold flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary">No Properties Found</h3>
            <p className="text-sm text-charcoal-500">
              No listings match your selected criteria. Try resetting filters or expanding your search parameters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onBookVisit={(prop) => setSelectedPropertyForVisit(prop)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Site Visit Modal */}
      <SiteVisitModal
        property={selectedPropertyForVisit}
        isOpen={!!selectedPropertyForVisit}
        onClose={() => setSelectedPropertyForVisit(null)}
      />
    </main>
  );
};
