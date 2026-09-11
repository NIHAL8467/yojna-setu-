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

  // If no API key configured, inform the user with demo guidance
  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[360px] sm:min-h-[440px] rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50/50 to-white p-6 flex flex-col justify-center items-center text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 shadow-xs">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-bold text-[#0F294A]">
            Google Maps Platform Integration Ready
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The locator is wired to use modern Google Maps Platform with <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono text-[11px]">@vis.gl/react-google-maps</code> and <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono text-[11px]">AdvancedMarker</code>.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            Google provides a <strong>100% free Maps Demo Key</strong> for testing (zero cost, no credit card or Google Cloud billing required).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-left text-xs max-w-md w-full shadow-2xs space-y-2">
          <span className="font-bold text-[#0F294A] block">How to activate in 1 minute:</span>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
            <li>
              Mint your free demo key at{' '}
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="text-blue-900 font-bold underline inline-flex items-center gap-0.5"
              >
                Maps Demo Key Portal <ExternalLink className="w-3 h-3 inline" />
              </a>
            </li>
            <li>Add <code className="font-mono text-blue-950 font-semibold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in project settings or secrets.</li>
            <li>The interactive map with custom colored pins and dynamic info windows will activate immediately.</li>
          </ol>
        </div>

        {onSwitchToOsm && (
          <button
            type="button"
            onClick={onSwitchToOsm}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
          >
            Preview with OpenStreetMap in the meantime
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliant with Google Maps Platform Terms of Service</span>
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
