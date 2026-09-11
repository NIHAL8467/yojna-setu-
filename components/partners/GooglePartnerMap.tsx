'use client';

import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import type { ChannelPartner } from '@/types';
import { PhoneCall, MapPin, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { formatDistance } from '@/lib/geo-utils';

interface GooglePartnerMapProps {
  partners: ChannelPartner[];
  userCoords: { lat: number; lng: number } | null;
  selectedPartner: ChannelPartner | null;
  onSelectPartner: (partner: ChannelPartner) => void;
  onSwitchToOsm?: () => void;
}

/**
 * Controller to fit bounds and smoothly pan the camera
 * when partners list, user position, or selection updates.
 */
function MapBoundsController({
  partners,
  userCoords,
  selectedPartner,
}: {
  partners: ChannelPartner[];
  userCoords: { lat: number; lng: number } | null;
  selectedPartner: ChannelPartner | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    if (selectedPartner) {
      map.panTo({ lat: selectedPartner.lat, lng: selectedPartner.lng });
      map.setZoom(13);
      return;
    }

    if (partners.length === 0 && !userCoords) {
      map.setCenter({ lat: 22.9734, lng: 78.6569 }); // Center of India
      map.setZoom(5);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    if (userCoords) {
      bounds.extend({ lat: userCoords.lat, lng: userCoords.lng });
    }
    partners.forEach((p) => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });

    if (partners.length === 1 && !userCoords) {
      map.setCenter({ lat: partners[0].lat, lng: partners[0].lng });
      map.setZoom(12);
    } else {
      map.fitBounds(bounds, {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      });
    }
  }, [map, partners, userCoords, selectedPartner]);

  return null;
}

export default function GooglePartnerMap({
  partners,
  userCoords,
  selectedPartner,
  onSelectPartner,
  onSwitchToOsm,
}: GooglePartnerMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const [clickedPartner, setClickedPartner] = useState<ChannelPartner | null>(null);
  const [closedPartnerId, setClosedPartnerId] = useState<string | null>(null);

  const activePartner = clickedPartner ?? selectedPartner;
  const isInfoWindowOpen = Boolean(activePartner && activePartner.id !== closedPartnerId);

  // If no API key configured in env, render the live interactive Google Map Embed
  // so Google Maps is ALWAYS visible and working immediately
  const activeFallbackPartner = selectedPartner || (partners.length > 0 ? partners[0] : null);
  const [embedZoom, setEmbedZoom] = useState<number>(12);
  const [embedType, setEmbedType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite

  if (!apiKey) {
    const query = activeFallbackPartner
      ? `${activeFallbackPartner.name}, ${activeFallbackPartner.address}`
      : userCoords
      ? `${userCoords.lat},${userCoords.lng}`
      : 'State Channelising Agency Bank India';

    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${embedType}&z=${embedZoom}&ie=UTF8&iwloc=&output=embed`;

    return (
      <div id="google-maps-live-container" className="w-full flex flex-col rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-white">
        {/* Top Control Bar for Google Map */}
        <div className="bg-gradient-to-r from-[#003366] to-[#0A2540] px-3.5 py-2.5 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-amber-300">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight">Google Maps (लाइव गूगल मैप्स)</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded-full font-semibold">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-300 truncate max-w-[220px] sm:max-w-xs">
                {activeFallbackPartner ? activeFallbackPartner.name : 'Viewing Pan-India Network'}
              </p>
            </div>
          </div>

          {/* Map Controls: Satellite Toggle, Zoom Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              id="btn-google-map-type-toggle"
              type="button"
              onClick={() => setEmbedType((prev) => (prev === 'm' ? 'k' : 'm'))}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
              title="Toggle Satellite / Map view"
            >
              {embedType === 'm' ? '🛰️ Satellite' : '🗺️ Map'}
            </button>

            <div className="flex items-center bg-white/15 rounded-md overflow-hidden">
              <button
                id="btn-google-map-zoom-in"
                type="button"
                onClick={() => setEmbedZoom((prev) => Math.min(prev + 1, 18))}
                className="px-2 py-1 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer border-r border-white/20"
                title="Zoom in"
              >
                +
              </button>
              <button
                id="btn-google-map-zoom-out"
                type="button"
                onClick={() => setEmbedZoom((prev) => Math.max(prev - 1, 4))}
                className="px-2 py-1 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
                title="Zoom out"
              >
                −
              </button>
            </div>

            {activeFallbackPartner && (
              <a
                id="btn-open-in-google-maps"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${activeFallbackPartner.name}, ${activeFallbackPartner.address}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                title="Open in Google Maps App"
              >
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Live Interactive Google Map Frame */}
        <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-slate-100">
          <iframe
            id="google-maps-embed-frame"
            title="Google Maps Partner Locator"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Floating Branch Quick Selection Strip */}
          {partners.length > 0 && (
            <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1.5 overflow-x-auto pointer-events-auto no-scrollbar max-w-full">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1.5 shrink-0 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" />
                  Branches:
                </span>
                {partners.slice(0, 8).map((p) => {
                  const isSelected = activeFallbackPartner?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPartner(p)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#003366] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Partner Info Footer */}
        {activeFallbackPartner && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 max-w-md">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-900 text-white uppercase tracking-wider">
                  {activeFallbackPartner.typeName}
                </span>
                <span className="font-bold text-[#0F294A] text-xs">
                  {activeFallbackPartner.name}
                </span>
                {activeFallbackPartner.distanceKm !== undefined && (
                  <span className="text-[10px] font-semibold text-blue-950 bg-blue-100 px-1.5 py-0.2 rounded">
                    {formatDistance(activeFallbackPartner.distanceKm)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{activeFallbackPartner.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${activeFallbackPartner.phone}`}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-blue-900" />
                <span>Call Branch</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${activeFallbackPartner.name}, ${activeFallbackPartner.address}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#003366] hover:bg-blue-950 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Directions on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Compliant Footer with Maps Terms and Demo Key Info */}
        <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Google Maps • Powered by Google Maps Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-800"
            >
              Google Maps Platform Terms of Service
            </a>
            {onSwitchToOsm && (
              <button
                type="button"
                onClick={onSwitchToOsm}
                className="text-blue-900 font-semibold hover:underline cursor-pointer ml-1"
              >
                OpenStreetMap Fallback
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[360px] sm:min-h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%', minHeight: '440px' }}
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 22.9734, lng: 78.6569 }}
          defaultZoom={5}
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          {/* Bounds / Camera Synchronization */}
          <MapBoundsController
            partners={partners}
            userCoords={userCoords}
            selectedPartner={selectedPartner}
          />

          {/* User Location Marker */}
          {userCoords && (
            <AdvancedMarker
              position={{ lat: userCoords.lat, lng: userCoords.lng }}
              title="Your Detected Location"
            >
              <Pin
                background="#2563eb"
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          )}

          {/* Channel Partner Pins */}
          {partners.map((partner) => {
            const isSelected = (selectedPartner?.id === partner.id) || (activePartner?.id === partner.id);
            
            // Channel partner badge colors
            const pinColor = isSelected
              ? '#f59e0b' // Selected Gold
              : partner.type === 'SCA'
              ? '#003580' // State Channelising Agency Navy
              : partner.type === 'Bank'
              ? '#1e3a8a' // Commercial Bank Indigo
              : partner.type === 'RRB'
              ? '#047857' // Regional Rural Bank Emerald
              : '#7c2d12'; // NBFC-MFI Warm Ochre

            return (
              <AdvancedMarker
                key={partner.id}
                position={{ lat: partner.lat, lng: partner.lng }}
                title={partner.name}
                onClick={() => {
                  setClosedPartnerId(null);
                  setClickedPartner(partner);
                  onSelectPartner(partner);
                }}
              >
                <Pin
                  background={pinColor}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={isSelected ? 1.25 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Active Partner InfoWindow */}
          {isInfoWindowOpen && activePartner && (
            <InfoWindow
              position={{ lat: activePartner.lat, lng: activePartner.lng }}
              pixelOffset={[0, -32]}
              onCloseClick={() => {
                setClosedPartnerId(activePartner.id);
                setClickedPartner(null);
              }}
            >
              <div className="p-1 font-sans max-w-[240px] text-xs text-slate-800">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide bg-blue-900 text-white">
                    {activePartner.typeName}
                  </span>
                  {activePartner.distanceKm !== undefined && (
                    <span className="text-[10px] font-semibold text-blue-950 bg-blue-100 px-1.5 py-0.2 rounded">
                      {formatDistance(activePartner.distanceKm)}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-[#0F294A] text-xs leading-snug mb-1">
                  {activePartner.name}
                </h4>

                <p className="text-[11px] text-slate-600 mb-2 leading-relaxed flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{activePartner.address}</span>
                </p>

                <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[11px]">
                  <a
                    href={`tel:${activePartner.phone}`}
                    className="inline-flex items-center gap-1 text-blue-900 font-bold hover:underline"
                  >
                    <PhoneCall className="w-3 h-3 text-blue-800" />
                    <span>{activePartner.phone}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${activePartner.name}, ${activePartner.address}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-900 font-bold hover:underline"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
