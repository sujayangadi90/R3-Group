import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  Eye,
  Check,
  X,
  Upload,
  Building2,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Star,
  Link as LinkIcon,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Upload state
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Form Fields
  const initialForm = {
    title: '',
    slug: '',
    tagline: '',
    description: '',
    propertyType: 'Apartment',
    price: '',
    priceDisplay: '',
    location: '',
    city: 'Mumbai',
    address: '',
    bedrooms: '3',
    bathrooms: '3',
    carpetArea: '',
    floor: 'Higher Floor',
    totalFloors: '45',
    status: 'Ready to Move',
    possessionDate: 'Immediate',
    featured: false,
    images: [],
    amenities: [
      'Private Swimming Pool',
      '24/7 Security & Concierge',
      'Covered Multi-Car Parking',
      'Direct High-Speed Elevator',
    ],
    reraId: 'P51900018442',
  };

  const [formData, setFormData] = useState(initialForm);
  const [amenityInput, setAmenityInput] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.getProperties({
        type: typeFilter,
        search: searchTerm,
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
  }, [typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const openCreateModal = () => {
    setEditingProperty(null);
    setFormData(initialForm);
    setFormError('');
    setUploadError('');
    setShowUrlFallback(false);
    setIsModalOpen(true);
  };

  const openEditModal = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      slug: property.slug || '',
      tagline: property.tagline || '',
      description: property.description || '',
      propertyType: property.propertyType || 'Apartment',
      price: property.price || '',
      priceDisplay: property.priceDisplay || '',
      location: property.location || '',
      city: property.city || 'Mumbai',
      address: property.address || '',
      bedrooms: property.bedrooms?.toString() || '3',
      bathrooms: property.bathrooms?.toString() || '3',
      carpetArea: property.carpetArea?.toString() || '',
      floor: property.floor || '',
      totalFloors: property.totalFloors?.toString() || '45',
      status: property.status || 'Ready to Move',
      possessionDate: property.possessionDate || 'Immediate',
      featured: property.featured || false,
      images: property.images || [],
      amenities: property.amenities || [],
      reraId: property.reraId || '',
    });
    setFormError('');
    setUploadError('');
    setShowUrlFallback(false);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await api.toggleFeaturedProperty(id);
      if (res.success) {
        setProperties((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, featured: !item.featured } : item
          )
        );
      }
    } catch (err) {
      alert('Failed to toggle featured status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property from the portfolio?')) return;
    try {
      const res = await api.deleteProperty(id);
      if (res.success) {
        setProperties((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  // Direct File Upload handler (Max 4 MB)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');

    // Check size limit: 4 MB (4 * 1024 * 1024 bytes)
    const MAX_SIZE = 4 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((f) => `"${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)} MB)`).join(', ');
      setUploadError(`Upload rejected: ${names} exceed the 4 MB limit. Please select images under 4 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhotos(true);
    try {
      const res = await api.uploadPhotos(files);
      if (res.success && res.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.urls],
        }));
      } else {
        setUploadError(res.message || 'Failed to upload photos.');
      }
    } catch (err) {
      setUploadError('Network error uploading photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetCoverPhoto = (index) => {
    if (index === 0) return;
    const selected = formData.images[index];
    const rest = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: [selected, ...rest],
    }));
  };

  const handleAddManualUrl = () => {
    if (manualUrlInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, manualUrlInput.trim()],
      }));
      setManualUrlInput('');
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    if (formData.images.length === 0) {
      setFormError('Please upload at least 1 property photograph.');
      setFormLoading(false);
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      carpetArea: Number(formData.carpetArea),
      totalFloors: Number(formData.totalFloors),
      images: formData.images,
    };

    try {
      if (editingProperty) {
        const res = await api.updateProperty(editingProperty._id, payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchProperties();
        } else {
          setFormError(res.message || 'Update failed.');
        }
      } else {
        const res = await api.createProperty(payload);
        if (res.success) {
          setIsModalOpen(false);
          fetchProperties();
        } else {
          setFormError(res.message || 'Creation failed.');
        }
      }
    } catch (err) {
      setFormError('An error occurred. Check connection and fields.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECECE8] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search properties by title, location, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-24 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-charcoal-500">Filter Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-primary bg-white focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Plot</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-primary text-sm">
            Active Properties Portfolio ({properties.length})
          </h3>
          <span className="text-xs text-charcoal-500">Manage real-time listings & status</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-charcoal-500 text-sm">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-bold text-primary">No properties found in portfolio.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-gold text-white text-xs font-bold"
            >
              Add First Property
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-warm border-b border-gray-100 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {properties.map((item) => (
                  <tr key={item._id} className="hover:bg-surface/50 transition-colors">
                    {/* Media + Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || 'https://via.placeholder.com/80'}
                          alt={item.title}
                          className="w-14 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <Link
                            to={`/properties/${item.slug || item._id}`}
                            target="_blank"
                            className="font-bold text-primary hover:text-gold transition-colors block truncate"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-gray-100 text-primary font-semibold text-[11px]">
                        {item.propertyType}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-gold text-sm font-sans">
                        {item.priceDisplay}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-600">
                      <div>{item.bedrooms > 0 ? `${item.bedrooms} BHK` : item.propertyType}</div>
                      <div className="text-[11px] text-charcoal-500">
                        {item.carpetArea?.toLocaleString()} sq.ft
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.status === 'Ready to Move'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Under Construction'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(item._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          item.featured
                            ? 'bg-gold-subtle text-gold border border-gold/40'
                            : 'bg-gray-100 text-charcoal-500 hover:text-primary'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{item.featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                      <Link
                        to={`/properties/${item.slug || item._id}`}
                        target="_blank"
                        className="inline-block p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-primary transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-gray-200 text-charcoal-600 hover:text-gold hover:border-gold transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-base">
                  {editingProperty ? 'Edit Property Listing' : 'Add New Luxury Property Listing'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Grand Aurum Penthouse"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. the-grand-aurum-penthouse"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Category, Status, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Apartment">Luxury Apartment</option>
                    <option value="Villa">Exclusive Villa</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Commercial">Commercial Office</option>
                    <option value="Plot">Freehold Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Pre-Launch">Pre-Launch</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-gold focus:ring-gold"
                    />
                    <span>Highlight as Featured</span>
                  </label>
                </div>
              </div>

              {/* Price Numeric & Price Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Price (Numeric In Rupees) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 185000000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-charcoal-500">
                    Numeric value for search filters (e.g. 185000000 = 18.50 Cr)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Price Display String *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹ 18.50 Cr or ₹ 18.5 Cr - ₹ 22.0 Cr"
                    value={formData.priceDisplay}
                    onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Location, City, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Location Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Worli Sea Face"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    RERA Registration ID
                  </label>
                  <input
                    type="text"
                    placeholder="P51900018442"
                    value={formData.reraId}
                    onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Carpet Area, Floor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Bedrooms (BHK)
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Carpet (Sq.Ft) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="6450"
                    value={formData.carpetArea}
                    onChange={(e) => setFormData({ ...formData, carpetArea: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Possession
                  </label>
                  <input
                    type="text"
                    placeholder="Immediate"
                    value={formData.possessionDate}
                    onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Tagline & Description */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Perched on the 48th level overlooking the Arabian Sea expanse"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive architectural overview, finishes, and spatial qualities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              {/* ========================================================= */}
              {/* PHOTO UPLOAD SECTION (Max 4 MB, Best Resolution & Ratio) */}
              {/* ========================================================= */}
              <div className="p-5 rounded-2xl bg-surface border border-gold/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gold" />
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                        Property Photography Gallery *
                      </h4>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Upload high-resolution architectural captures for card displays and full galleries.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{showUrlFallback ? 'Hide URL Input' : 'Add via Image URL'}</span>
                  </button>
                </div>

                {/* Best Resolution & Aspect Ratio Spec Guide Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white border border-[#ECECE8] text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gold-subtle text-gold flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-primary text-[11px] uppercase">
                        Best Aspect Ratio
                      </span>
                      <span className="font-extrabold text-gold text-xs block">
                        16:10 (or 16:9)
                      </span>
                      <span className="text-[10px] text-charcoal-500">
                        Landscape architectural format
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-3">
                    <div className="w-7 h-7 rounded-lg bg-gold-subtle text-gold flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-primary text-[11px] uppercase">
                        Best Resolution
                      </span>
                      <span className="font-extrabold text-primary text-xs block">
                        1920 × 1200 px
                      </span>
                      <span className="text-[10px] text-charcoal-500">
                        Min 1280×800 • Max 2560×1600
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0 sm:pl-3">
                    <div className="w-7 h-7 rounded-lg bg-gold-subtle text-gold flex items-center justify-center shrink-0 mt-0.5">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-bold text-primary text-[11px] uppercase">
                        File Limits
                      </span>
                      <span className="font-extrabold text-primary text-xs block">
                        Max 4 MB / Photo
                      </span>
                      <span className="text-[10px] text-charcoal-500">
                        JPG, PNG, WEBP, HEIC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Dropzone / Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadingPhotos
                      ? 'border-gold bg-gold-subtle/50 pointer-events-none'
                      : 'border-gray-300 hover:border-gold hover:bg-white bg-surface-warm'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadingPhotos ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-primary">Uploading & optimizing photos...</p>
                      <p className="text-[11px] text-charcoal-500">Processing file buffers under 4 MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 text-gold flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">
                          Click to Browse or Drag & Drop Photos
                        </p>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">
                          Select multiple files • Max <strong>4 MB</strong> each • <strong>16:10</strong> Aspect Ratio Recommended
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold text-white text-xs font-bold mt-1 shadow-sm">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Select Photos from Computer</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Optional URL Adder Fallback */}
                {showUrlFallback && (
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-charcoal-700 uppercase">
                      Add Direct Image URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or hosted web link"
                        value={manualUrlInput}
                        onChange={(e) => setManualUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualUrl}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploaded Photos Preview Grid */}
                {formData.images.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-charcoal-600 uppercase">
                        Uploaded Photos ({formData.images.length})
                      </span>
                      <span className="text-[10px] text-charcoal-500">
                        First image is the <strong>Primary Cover</strong> card
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((img, i) => (
                        <div
                          key={i}
                          className="group relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm"
                        >
                          <img
                            src={img}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge */}
                          {i === 0 ? (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-gold text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" /> Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(i)}
                              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 hover:bg-gold text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Make Cover Photo"
                            >
                              Set Cover
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(i)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 transition-opacity shadow"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Photo Number */}
                          <span className="absolute bottom-1 right-1.5 px-1.5 py-0.2 rounded bg-black/50 text-white text-[9px] font-mono">
                            #{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-charcoal-500 italic text-center py-1">
                    No photos uploaded yet. Upload at least one 16:10 photograph to display on the listing card.
                  </p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Residence Amenities
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Private Heated Lap Pool"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-black"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-surface-warm border border-gray-200 text-xs text-primary font-medium flex items-center gap-1.5"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || uploadingPhotos}
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-white text-xs font-bold shadow-md transition-all disabled:opacity-75 flex items-center gap-2"
                >
                  {formLoading ? 'Saving Property...' : editingProperty ? 'Save Changes' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
