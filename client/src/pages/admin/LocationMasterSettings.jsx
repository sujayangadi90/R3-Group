import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Building,
  Navigation,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';

export const LocationMasterSettings = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCities, setExpandedCities] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add / Edit City Modal State
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityFormData, setCityFormData] = useState({ name: '', state: '' });
  const [cityLoading, setCityLoading] = useState(false);

  // Add Locality Inline / Modal State
  const [isLocalityModalOpen, setIsLocalityModalOpen] = useState(false);
  const [activeCityForLocality, setActiveCityForLocality] = useState(null);
  const [localityFormData, setLocalityFormData] = useState({ name: '', pincode: '' });
  const [localityLoading, setLocalityLoading] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.getLocations(true); // get all including inactive
      if (res.success && res.data) {
        setLocations(res.data);
        // Expand all by default
        const initialExpand = {};
        res.data.forEach((c) => {
          initialExpand[c._id] = true;
        });
        setExpandedCities(initialExpand);
      }
    } catch (err) {
      console.error('Failed to fetch locations master:', err);
      setErrorMsg('Failed to fetch cities & localities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const toggleCityExpand = (cityId) => {
    setExpandedCities((prev) => ({
      ...prev,
      [cityId]: !prev[cityId],
    }));
  };

  // City Handlers
  const handleOpenAddCity = () => {
    setEditingCity(null);
    setCityFormData({ name: '', state: '' });
    setErrorMsg('');
    setIsCityModalOpen(true);
  };

  const handleOpenEditCity = (city) => {
    setEditingCity(city);
    setCityFormData({ name: city.name, state: city.state || '' });
    setErrorMsg('');
    setIsCityModalOpen(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    if (!cityFormData.name.trim()) {
      setErrorMsg('City name is required.');
      return;
    }

    setCityLoading(true);
    setErrorMsg('');
    try {
      if (editingCity) {
        const res = await api.updateCity(editingCity._id, cityFormData);
        if (res.success) {
          setSuccessMsg(`City "${cityFormData.name}" updated successfully.`);
          setIsCityModalOpen(false);
          fetchLocations();
        } else {
          setErrorMsg(res.message || 'Failed to update city.');
        }
      } else {
        const res = await api.createCity(cityFormData);
        if (res.success) {
          setSuccessMsg(`City "${cityFormData.name}" created successfully.`);
          setIsCityModalOpen(false);
          fetchLocations();
        } else {
          setErrorMsg(res.message || 'Failed to create city.');
        }
      }
    } catch (err) {
      setErrorMsg('Network error while saving city.');
    } finally {
      setCityLoading(false);
    }
  };

  const handleDeleteCity = async (city) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${city.name}" and all its ${city.localities?.length || 0} localities?`
      )
    )
      return;

    try {
      const res = await api.deleteCity(city._id);
      if (res.success) {
        setSuccessMsg(`City "${city.name}" removed successfully.`);
        setLocations((prev) => prev.filter((c) => c._id !== city._id));
      } else {
        alert(res.message || 'Failed to delete city.');
      }
    } catch (err) {
      alert('Network error deleting city.');
    }
  };

  // Locality Handlers
  const handleOpenAddLocality = (city) => {
    setActiveCityForLocality(city);
    setLocalityFormData({ name: '', pincode: '' });
    setErrorMsg('');
    setIsLocalityModalOpen(true);
  };

  const handleSaveLocality = async (e) => {
    e.preventDefault();
    if (!localityFormData.name.trim() || !activeCityForLocality) {
      setErrorMsg('Locality name is required.');
      return;
    }

    setLocalityLoading(true);
    setErrorMsg('');
    try {
      const res = await api.addLocality(activeCityForLocality._id, localityFormData);
      if (res.success && res.data) {
        setSuccessMsg(
          `Locality "${localityFormData.name}" added to ${activeCityForLocality.name}.`
        );
        setIsLocalityModalOpen(false);
        // Update local city record
        setLocations((prev) =>
          prev.map((c) => (c._id === activeCityForLocality._id ? res.data : c))
        );
      } else {
        setErrorMsg(res.message || 'Failed to add locality.');
      }
    } catch (err) {
      setErrorMsg('Network error adding locality.');
    } finally {
      setLocalityLoading(false);
    }
  };

  const handleDeleteLocality = async (cityId, localityId, localityName) => {
    if (!window.confirm(`Remove locality "${localityName}" from this city?`)) return;

    try {
      const res = await api.deleteLocality(cityId, localityId);
      if (res.success && res.data) {
        setSuccessMsg(`Locality "${localityName}" deleted.`);
        setLocations((prev) => prev.map((c) => (c._id === cityId ? res.data : c)));
      } else {
        alert(res.message || 'Failed to delete locality.');
      }
    } catch (err) {
      alert('Network error deleting locality.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Block & Action Toolbar */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECECE8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold" />
            <h2 className="text-base font-bold text-primary">Cities & Localities Master Settings</h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Configure primary cities and their respective luxury localities/neighborhoods used across public search filters and property portfolios.
          </p>
        </div>

        <button
          onClick={handleOpenAddCity}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New City</span>
        </button>
      </div>

      {/* Cities & Localities Accordion List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-charcoal-500 text-sm rounded-2xl border border-gray-100">
            Loading master location data...
          </div>
        ) : locations.length === 0 ? (
          <div className="bg-white p-12 text-center text-charcoal-500 text-sm rounded-2xl border border-gray-100">
            No cities configured yet. Click "Add New City" above to create one.
          </div>
        ) : (
          locations.map((city) => {
            const isExpanded = expandedCities[city._id] !== false;
            const localityCount = city.localities?.length || 0;

            return (
              <div
                key={city._id}
                className="bg-white rounded-2xl border border-[#ECECE8] shadow-sm overflow-hidden transition-all"
              >
                {/* City Card Header */}
                <div className="p-4 sm:px-6 bg-surface-warm/60 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCityExpand(city._id)}
                      className="p-1 rounded-lg text-charcoal-500 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-primary" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-sm sm:text-base">
                          {city.name}
                        </span>
                        {city.state && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-charcoal-600 font-medium">
                            {city.state}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-bold">
                          {localityCount} {localityCount === 1 ? 'Locality' : 'Localities'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddLocality(city)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-gold" />
                      <span>Add Locality</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditCity(city)}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-charcoal-600 hover:text-primary transition-colors cursor-pointer"
                      title="Edit City"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCity(city)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete City"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Localities Tags / Grid */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-white">
                    {localityCount === 0 ? (
                      <p className="text-xs text-charcoal-400 italic">
                        No localities added under {city.name} yet. Click "Add Locality" to add the first neighborhood.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {city.localities.map((loc) => (
                          <div
                            key={loc._id || loc.name}
                            className="p-3 rounded-xl border border-gray-100 bg-surface/50 hover:bg-white hover:border-gold/30 hover:shadow-xs transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Navigation className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span className="text-xs font-semibold text-primary truncate">
                                {loc.name}
                              </span>
                              {loc.pincode && (
                                <span className="text-[10px] text-charcoal-400 shrink-0">
                                  ({loc.pincode})
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteLocality(city._id, loc._id, loc.name)}
                              className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-red-600 p-1 rounded transition-all cursor-pointer"
                              title="Delete locality"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* City Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-sm">
                  {editingCity ? `Edit City: ${editingCity.name}` : 'Add Master City'}
                </h3>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  City Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Alibaug, Goa"
                  value={cityFormData.name}
                  onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Goa"
                  value={cityFormData.state}
                  onChange={(e) => setCityFormData({ ...cityFormData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cityLoading}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all disabled:opacity-75 cursor-pointer"
                >
                  {cityLoading ? 'Saving...' : editingCity ? 'Update City' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Locality Modal */}
      {isLocalityModalOpen && activeCityForLocality && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-sm">
                  Add Locality to {activeCityForLocality.name}
                </h3>
              </div>
              <button
                onClick={() => setIsLocalityModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocality} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Locality / Neighborhood Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Worli Sea Face, Pali Hill, Assagao"
                  value={localityFormData.name}
                  onChange={(e) =>
                    setLocalityFormData({ ...localityFormData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                  Postal Pincode (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 400018"
                  value={localityFormData.pincode}
                  onChange={(e) =>
                    setLocalityFormData({ ...localityFormData, pincode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLocalityModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-charcoal-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={localityLoading}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-dark text-white font-bold text-xs shadow-md transition-all disabled:opacity-75 cursor-pointer"
                >
                  {localityLoading ? 'Adding...' : 'Add Locality'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
