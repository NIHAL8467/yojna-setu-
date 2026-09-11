'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { getAllPartners, getPartnersForLocation } from '@/lib/partners';
import { getAllSchemes } from '@/lib/schemes';
import { sortPartnersByDistance, formatDistance } from '@/lib/geo-utils';
import type { ChannelPartner } from '@/types';
import { INDIAN_STATES } from '@/lib/constants';
import { 
  MapPin, 
  Search, 
  Filter, 
  Navigation, 
  PhoneCall, 
  Mail, 
  ExternalLink, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Compass,
  X,
  ArrowLeft,
  LocateFixed
} from 'lucide-react';

// Dynamic import of GooglePartnerMap and LeafletMap to avoid SSR issues
const GooglePartnerMap = dynamic(() => import('./GooglePartnerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] sm:h-[480px] lg:h-[540px] bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 animate-pulse border border-slate-200">
      <Compass className="w-6 h-6 animate-spin text-blue-900 mr-2" />
      <span>Loading Google Maps (गूगल मैप्स)...</span>
    </div>
  ),
});

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] sm:h-[480px] lg:h-[540px] bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 animate-pulse border border-slate-200">
      <Compass className="w-6 h-6 animate-spin text-blue-900 mr-2" />
      <span>Loading OpenStreetMap...</span>
    </div>
  ),
});

export default function PartnerLocatorView() {
  const { 
    t, 
    locale, 
    selectedSchemeForPartners, 
    setSelectedSchemeForPartners, 
    userCoords, 
    setUserCoords,
    userProfile,
    updateUserProfile,
    goBack
  } = useApp();
  const allSchemes = getAllSchemes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'osm'>('google');
  const handleSelectPartner = React.useCallback((p: ChannelPartner) => {
    setSelectedPartner(p);
  }, [setSelectedPartner]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);

  // Handle Geolocation with Reverse Geocoding to match map position
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);

        // Fetch Reverse Geocoding to identify actual District and State for the coordinates
        try {
          const res = await fetch(`/api/geocode?lat=${coords.lat}&lng=${coords.lng}`);
          if (res.ok) {
            const geoData = await res.json();
            if (geoData.state) {
              const districtName = geoData.district || geoData.city || '';
              updateUserProfile({
                state: geoData.state,
                district: districtName,
              });
              setDetectedLocationName(`${districtName ? `${districtName}, ` : ''}${geoData.state}`);
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
        }

        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err);
        setGeoError('Location permission denied or unavailable. Please select your State & District.');
        setUserCoords(null);
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Base partners derived from user location / profile
  const basePartners = useMemo(() => {
    return getPartnersForLocation(userCoords, userProfile.district, userProfile.state);
  }, [userCoords, userProfile.district, userProfile.state]);

  // Filter & Sort Partners
  const filteredPartners = useMemo(() => {
    let list = [...basePartners];

    // If GPS location is not set, apply manual state/district filters
    if (!userCoords) {
      if (userProfile.state && userProfile.state !== 'All India' && userProfile.state.trim() !== '') {
        const stateTarget = userProfile.state.trim().toLowerCase();
        list = list.filter((p) => p.state.toLowerCase() === stateTarget);
      }

      if (userProfile.district && userProfile.district.trim() !== '') {
        const distTarget = userProfile.district.trim().toLowerCase();
        list = list.filter(
          (p) =>
            p.district.toLowerCase().includes(distTarget) ||
            p.address.toLowerCase().includes(distTarget) ||
            p.name.toLowerCase().includes(distTarget)
        );
      }
    }

    // Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.pincode.includes(q)
      );
    }

    // Scheme Filter
    if (selectedSchemeForPartners && selectedSchemeForPartners !== 'ALL') {
      list = list.filter((p) => p.schemesProcessed.includes(selectedSchemeForPartners));
    }

    // Partner Type Filter
    if (selectedType !== 'ALL') {
      list = list.filter((p) => p.type === selectedType);
    }

    // Distance Sorting if user location available
    if (userCoords) {
      return sortPartnersByDistance(list, userCoords.lat, userCoords.lng);
    }

    return list;
  }, [basePartners, userProfile.state, userProfile.district, searchQuery, selectedSchemeForPartners, selectedType, userCoords]);

  // Derive effective active partner without cascading setState
  const activeSelectedPartner = useMemo(() => {
    if (selectedPartner && filteredPartners.some((p) => p.id === selectedPartner.id)) {
      return selectedPartner;
    }
    return filteredPartners.length > 0 ? filteredPartners[0] : null;
  }, [selectedPartner, filteredPartners]);

  return (
    <div id="partner-locator-view" className="max-w-6xl mx-auto space-y-6">
      {/* Go Back Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          id="btn-partners-go-back"
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-2xs transition-all hover:text-[#003366] hover:border-blue-300 cursor-pointer"
          aria-label={locale === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Go back to previous page'}
        >
          <ArrowLeft className="w-4 h-4 text-[#003366]" />
          <span>{locale === 'hi' ? 'वापस जाएं (Go Back)' : 'Go Back'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F294A] tracking-tight leading-tight">
          {t('partners.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('partners.subtitle')}
        </p>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Important Demo Notice:</span>
          <span>{t('partners.disclaimer')}</span>
        </div>
      </div>

      {/* Filter and Location Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Location selector row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-800" />
              <span>State (राज्य)</span>
            </label>
            <select
              id="select-partner-state"
              value={userProfile.state || ''}
              onChange={(e) => updateUserProfile({ state: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] font-semibold text-blue-950 cursor-pointer"
            >
              <option value="">-- All India / Select State --</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District / City Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-800" />
              <span>District / City (जिला / शहर)</span>
            </label>
            <input
              id="input-partner-district"
              type="text"
              placeholder="e.g. Ranchi, Varanasi, Lucknow"
              value={userProfile.district || ''}
              onChange={(e) => updateUserProfile({ district: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] text-blue-950 font-medium"
            />
          </div>

          {/* Scheme Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              <span>Scheme Filter</span>
            </label>
            <select
              id="select-partner-scheme"
              value={selectedSchemeForPartners || 'ALL'}
              onChange={(e) => setSelectedSchemeForPartners(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] cursor-pointer font-medium text-slate-800"
            >
              <option value="ALL">🔍 {t('partners.allSchemes')}</option>
              {allSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Partner Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              <span>Partner Type</span>
            </label>
            <select
              id="select-partner-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[42px] cursor-pointer font-medium text-slate-800"
            >
              <option value="ALL">🏛️ {t('partners.allTypes')}</option>
              <option value="SCA">{t('partners.typeSca')}</option>
              <option value="Bank">{t('partners.typeBank')}</option>
              <option value="RRB">{t('partners.typeRrb')}</option>
              <option value="NBFC-MFI">{t('partners.typeMfi')}</option>
            </select>
          </div>
        </div>

        {/* Second row: Search & Geolocation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-partner-search"
              type="text"
              placeholder={t('partners.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <button
              id="btn-use-my-location"
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
              className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
                userCoords
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-blue-900 hover:bg-blue-950 text-white'
              }`}
            >
              <Navigation className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>
                {geoLoading
                  ? 'Detecting Location...'
                  : userCoords
                  ? 'GPS Active (Sorted by Distance)'
                  : t('partners.useMyLocation')}
              </span>
            </button>
          </div>
        </div>

        {/* Geolocation feedback if error */}
        {geoError && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between gap-2">
            <span>⚠️ {geoError}</span>
            <button
              type="button"
              onClick={() => setGeoError(null)}
              className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {(selectedSchemeForPartners !== 'ALL' && selectedSchemeForPartners) || 
          selectedType !== 'ALL' || 
          searchQuery || 
          (userProfile.state && userProfile.state !== 'All India') || 
          userProfile.district ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            
            {/* Active Location Badge */}
            {(userProfile.state || userProfile.district) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                <MapPin className="w-3 h-3 text-emerald-800" />
                <span>
                  Location: {userProfile.district ? `${userProfile.district}, ` : ''}{userProfile.state || 'Selected Area'}
                </span>
                <button
                  type="button"
                  onClick={() => updateUserProfile({ state: '', district: '' })}
                  className="hover:text-red-700 ml-1 cursor-pointer"
                  title="Clear location filter"
                >
                  ×
                </button>
              </span>
            )}

            {selectedSchemeForPartners && selectedSchemeForPartners !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-semibold">
                Scheme: {selectedSchemeForPartners}
                <button
                  type="button"
                  onClick={() => setSelectedSchemeForPartners('ALL')}
                  className="hover:text-red-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-semibold">
                Type: {selectedType}
                <button
                  type="button"
                  onClick={() => setSelectedType('ALL')}
                  className="hover:text-red-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Keyword: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-700 ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedSchemeForPartners('ALL');
                updateUserProfile({ state: '', district: '' });
                setUserCoords(null);
              }}
              className="text-[11px] text-red-600 hover:text-red-800 underline ml-2 font-medium cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : null}
      </div>

      {/* Split View: Partner Cards (Left) and Leaflet Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Partner Cards List (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
          {/* Active GPS Location Notice Banner */}
          {userCoords && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-bold">
                  📍 Showing branches sorted by distance to your map location
                  {detectedLocationName ? ` (${detectedLocationName})` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserCoords(null);
                  setDetectedLocationName(null);
                }}
                className="text-emerald-800 hover:text-emerald-950 text-[11px] underline font-bold cursor-pointer shrink-0"
              >
                Reset GPS
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              {filteredPartners.length} Partner Centers Found
            </span>
            <span>Click any card to center and inspect on map</span>
          </div>

          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner, index) => {
              const isSelected = activeSelectedPartner?.id === partner.id;
              const isClosest = Boolean(userCoords && index === 0);
              return (
                <div
                  key={partner.id}
                  id={`partner-card-${partner.id}`}
                  onClick={() => setSelectedPartner(partner)}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-[#003366] ring-2 ring-[#003366] bg-blue-50/70 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Top line with Type & Distance */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wide ${
                          partner.type === 'SCA'
                            ? 'bg-blue-900 text-white'
                            : partner.type === 'Bank'
                            ? 'bg-indigo-100 text-indigo-950 border border-indigo-200'
                            : partner.type === 'RRB'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-200'
                            : 'bg-purple-100 text-purple-950 border border-purple-200'
                        }`}
                      >
                        {partner.typeName}
                      </span>

                      {isClosest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                          📍 Nearest to You
                        </span>
                      )}

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#003366] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                          ✓ On Map
                        </span>
                      )}
                    </div>

                    {partner.distanceKm !== undefined && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded-full">
                        <Navigation className="w-3 h-3 text-blue-800" />
                        {formatDistance(partner.distanceKm)} away
                      </span>
                    )}
                  </div>

                  {/* Title & Address */}
                  <h3 className="text-sm sm:text-base font-bold text-[#0F294A] leading-snug">
                    {locale === 'hi' && partner.nameHi ? partner.nameHi : partner.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{partner.address}</span>
                  </p>

                  {/* Contact details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <a
                      href={`tel:${partner.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-blue-900 font-semibold hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blue-800" />
                      <span>{partner.phone}</span>
                    </a>
                    <span className="text-slate-500 truncate text-[11px]">
                      ✉️ {partner.email}
                    </span>
                  </div>

                  {/* Schemes processed tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {partner.schemesProcessed.map((schemeId) => (
                      <span
                        key={schemeId}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200"
                      >
                        {schemeId.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Fund utilization and Google Maps navigation action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      Simulated Utilization: {partner.fundUtilization}%
                    </span>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${partner.name}, ${partner.address}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-950 hover:underline"
                    >
                      <span>{t('partners.getDirections')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">
                {userProfile.district || (userProfile.state && userProfile.state !== 'All India')
                  ? `No authorized channel partners found for ${userProfile.district ? `${userProfile.district}, ` : ''}${userProfile.state || ''}`
                  : 'No partner branches found matching your search'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please check another district/state or call the National Scheduled Castes Finance and Development Corporation (NSFDC) toll-free helpline at 1800-11-2001 for nodal branch assistance.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Interactive Map View (6 cols) */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1 pt-0.5 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F294A] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Channel Partner Network Map
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {mapEngine === 'google' ? 'Google Maps' : 'OpenStreetMap'}
                </span>
              </div>

              {/* Map Engine Selector Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  id="btn-switch-map-google"
                  type="button"
                  onClick={() => setMapEngine('google')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapEngine === 'google'
                      ? 'bg-white text-[#003366] shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Google Maps (गूगल मैप्स)</span>
                </button>
                <button
                  id="btn-switch-map-osm"
                  type="button"
                  onClick={() => setMapEngine('osm')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapEngine === 'osm'
                      ? 'bg-white text-[#003366] shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>OpenStreetMap</span>
                </button>
              </div>
            </div>
            
            {mapEngine === 'google' ? (
              <GooglePartnerMap
                partners={filteredPartners}
                userCoords={userCoords}
                selectedPartner={activeSelectedPartner}
                onSelectPartner={handleSelectPartner}
                onSwitchToOsm={() => setMapEngine('osm')}
              />
            ) : (
              <LeafletMap
                partners={filteredPartners}
                userCoords={userCoords}
                selectedPartner={activeSelectedPartner}
                onSelectPartner={handleSelectPartner}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
