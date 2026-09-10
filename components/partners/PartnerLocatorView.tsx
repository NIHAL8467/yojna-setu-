'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import { getAllPartners } from '@/lib/partners';
import { getAllSchemes } from '@/lib/schemes';
import { sortPartnersByDistance, formatDistance } from '@/lib/geo-utils';
import type { ChannelPartner } from '@/types';
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
  Compass
} from 'lucide-react';

// Dynamic import of LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 animate-pulse border border-slate-200">
      <Compass className="w-6 h-6 animate-spin text-blue-900 mr-2" />
      <span>Loading OpenStreetMap Partner Map...</span>
    </div>
  ),
});

export default function PartnerLocatorView() {
  const { t, locale, selectedSchemeForPartners, setSelectedSchemeForPartners, userCoords, setUserCoords } = useApp();
  const allPartners = getAllPartners();
  const allSchemes = getAllSchemes();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);
  const handleSelectPartner = React.useCallback((p: ChannelPartner) => {
    setSelectedPartner(p);
  }, [setSelectedPartner]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Handle Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation failed or denied, using Delhi NCR default coordinates:', err);
        // Fallback to Delhi Central coordinates for demo
        setUserCoords({
          lat: 28.6139,
          lng: 77.2090,
        });
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Filter & Sort Partners
  const filteredPartners = useMemo(() => {
    let list = [...allPartners];

    // 1. Search Query
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

    // 2. Scheme Filter
    if (selectedSchemeForPartners && selectedSchemeForPartners !== 'ALL') {
      list = list.filter((p) => p.schemesProcessed.includes(selectedSchemeForPartners));
    }

    // 3. Partner Type Filter
    if (selectedType !== 'ALL') {
      list = list.filter((p) => p.type === selectedType);
    }

    // 4. Distance Sorting if user location available
    if (userCoords) {
      return sortPartnersByDistance(list, userCoords.lat, userCoords.lng);
    }

    return list;
  }, [allPartners, searchQuery, selectedSchemeForPartners, selectedType, userCoords]);

  return (
    <div id="partner-locator-view" className="max-w-6xl mx-auto space-y-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
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

          {/* Scheme Filter */}
          <div>
            <select
              id="select-partner-scheme"
              value={selectedSchemeForPartners || 'ALL'}
              onChange={(e) => setSelectedSchemeForPartners(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[44px] cursor-pointer font-medium text-slate-800"
            >
              <option value="ALL">🔍 {t('partners.allSchemes')}</option>
              {allSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              id="select-partner-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-none min-h-[44px] cursor-pointer font-medium text-slate-800"
            >
              <option value="ALL">🏛️ {t('partners.allTypes')}</option>
              <option value="SCA">{t('partners.typeSca')}</option>
              <option value="Bank">{t('partners.typeBank')}</option>
              <option value="RRB">{t('partners.typeRrb')}</option>
              <option value="NBFC-MFI">{t('partners.typeMfi')}</option>
            </select>
          </div>

          {/* Use My Location Button */}
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
                  ? 'Location Active (Sorted by Distance)'
                  : t('partners.useMyLocation')}
              </span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(selectedSchemeForPartners !== 'ALL' && selectedSchemeForPartners) || selectedType !== 'ALL' || searchQuery ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
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
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSchemeForPartners('ALL');
                setSelectedType('ALL');
              }}
              className="text-blue-900 hover:underline font-semibold ml-auto"
            >
              Clear All
            </button>
          </div>
        ) : null}
      </div>

      {/* Split View: Partner Cards (Left) and Leaflet Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Partner Cards List (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-700">
              {filteredPartners.length} Partner Centers Found
            </span>
            <span>Click any card to locate on map</span>
          </div>

          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => {
              const isSelected = selectedPartner?.id === partner.id;
              return (
                <div
                  key={partner.id}
                  id={`partner-card-${partner.id}`}
                  onClick={() => setSelectedPartner(partner)}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-blue-900 ring-2 ring-blue-900/10 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Top line with Type & Distance */}
                  <div className="flex items-center justify-between gap-2 mb-2">
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
              <p className="text-sm font-bold text-slate-700">No partner branches found matching your search</p>
              <p className="text-xs text-slate-500">Try broadening your search term or clearing the scheme filter.</p>
            </div>
          )}
        </div>

        {/* RIGHT: Leaflet Interactive Map View (6 cols) */}
        <div className="lg:col-span-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-900" />
                Channel Partner Network Map
              </span>
              <span className="text-[11px] text-slate-500">
                OpenStreetMap Tiles
              </span>
            </div>
            
            <LeafletMap
              partners={filteredPartners}
              userCoords={userCoords}
              selectedPartner={selectedPartner}
              onSelectPartner={handleSelectPartner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
