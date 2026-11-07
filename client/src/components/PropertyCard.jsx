import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Maximize2, Sparkles, Calendar, ArrowRight } from 'lucide-react';

export const PropertyCard = ({ property, onBookVisit }) => {
  const defaultImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC1kDiJaHOk5TnCh26sWAhk-EsR8-oofu1tWeKGm3Udw4o-CzqgSzl8e2FEYUyMoZaGm5ALuQemvD0ZtrxFS2hHDUOUcgsL2OBQUtFF1ZE03NL-YyzUr9qONzjdkcvy2VJGz6kwNpJQ7nli_CuniTb6-xukt6ccKY_IsdkaOYi63_-1-31jAOpq-bUQ3f3FJ2gZGL4ZUOy_Tcyf9HxhuGpt9Ez9ksjbW-TGHI2nCA';

  const imageSrc =
    property.images && property.images.length > 0 ? property.images[0] : defaultImage;

  return (
    <div className="group bg-white rounded-xl border border-[#ECECE8] overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col">
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={property.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-white text-[11px] font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-gold" /> Exclusive
            </span>
          )}
          <span className="px-2.5 py-1 rounded bg-white/90 backdrop-blur-sm text-primary text-[11px] font-semibold tracking-wider uppercase shadow-sm">
            {property.status || 'Available'}
          </span>
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-base md:text-lg font-bold font-sans text-gold tracking-tight">
              Price on Request
            </span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property.slug || property._id}`}>
            <h3 className="mt-2 text-lg font-bold text-primary hover:text-gold transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>{property.location}{property.city ? `, ${property.city}` : ''}</span>
          </p>

          {/* Specifications Grid */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs text-charcoal-600">
            {property.bedrooms ? (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-gold shrink-0" />
                <span className="truncate">
                  {typeof property.bedrooms === 'string' && property.bedrooms.includes('BHK')
                    ? property.bedrooms
                    : `${property.bedrooms} BHK`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold shrink-0" />
                <span className="truncate">{property.propertyType}</span>
              </div>
            )}

            {property.carpetArea && property.carpetArea !== 'On Request' && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gold shrink-0" />
                <span className="truncate">{property.carpetArea?.toLocaleString()} sq.ft</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold shrink-0" />
              <span className="truncate">{property.possessionDate || 'Immediate'}</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
          <Link
            to={`/properties/${property.slug || property._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-primary text-primary hover:bg-surface-warm font-semibold text-xs transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => onBookVisit && onBookVisit(property)}
            className="flex-1 inline-flex items-center justify-center py-2 px-3 rounded-lg bg-primary hover:bg-black text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Book Visit
          </button>
        </div>
      </div>
    </div>
  );
};
