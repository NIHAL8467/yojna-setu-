'use client';

import React, { useEffect, useRef } from 'react';
import type { ChannelPartner } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  partners: ChannelPartner[];
  userCoords: { lat: number; lng: number } | null;
  selectedPartner: ChannelPartner | null;
  onSelectPartner: (partner: ChannelPartner) => void;
}

export default function LeafletMap({
  partners,
  userCoords,
  selectedPartner,
  onSelectPartner,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Guard against duplicate initialization in React 18 / fast refresh
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
    }

    const initialCenter: [number, number] = userCoords
      ? [userCoords.lat, userCoords.lng]
      : [22.9734, 78.6569]; // Geographic center of India

    const initialZoom = userCoords ? 13 : 5;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Immediately trigger invalidateSize across multiple ticks to guarantee tiles render even during dynamic layout reflow
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 200),
      setTimeout(() => map.invalidateSize(), 500),
    ];

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Markers and Camera when partners, userCoords, or selectedPartner changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Ensure map container dimensions are updated
    map.invalidateSize();

    markersGroup.clearLayers();

    // 1. Add User Location Marker if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #1d4ed8;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(29,78,216,0.9), 0 2px 6px rgba(0,0,0,0.35);
            position: relative;
            cursor: pointer;
          ">
            <span style="
              position: absolute;
              top: -8px;
              left: -8px;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: rgba(29,78,216,0.25);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <b style="color: #1d4ed8; font-size: 13px;">📍 Your Location (आपकी स्थिति)</b>
          <p style="margin: 4px 0 0; color: #475569;">GPS Detected Position</p>
        </div>
      `);
      markersGroup.addLayer(userMarker);
    }

    // 2. Add Partner Markers
    partners.forEach((partner) => {
      const isSelected = selectedPartner?.id === partner.id;
      
      // Color by type
      let bgColor = '#003580'; // SCA
      let badgeLabel = 'SCA';
      if (partner.type === 'Bank') {
        bgColor = '#1e3a8a';
        badgeLabel = 'Bank';
      } else if (partner.type === 'RRB') {
        bgColor = '#047857';
        badgeLabel = 'RRB';
      } else if (partner.type === 'NBFC-MFI') {
        bgColor = '#7c2d12';
        badgeLabel = 'MFI';
      }

      const partnerWithDist = partner as ChannelPartner & { distanceKm?: number };
      const distanceBadge = partnerWithDist.distanceKm !== undefined
        ? `<div style="font-size: 10px; color: #1e3a8a; background: #e0f2fe; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-bottom: 4px; font-weight: bold;">
             📍 ${partnerWithDist.distanceKm < 1 ? Math.round(partnerWithDist.distanceKm * 1000) + ' m away' : partnerWithDist.distanceKm.toFixed(1) + ' km away'}
           </div>`
        : '';

      const partnerIcon = L.divIcon({
        className: 'custom-partner-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 8px;
            border: 2px solid ${isSelected ? '#f59e0b' : '#ffffff'};
            box-shadow: ${isSelected ? '0 0 14px rgba(245,158,11,0.8)' : '0 2px 6px rgba(0,0,0,0.3)'};
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: transform 0.2s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          ">
            <span>🏛️</span>
            <span>${badgeLabel}</span>
          </div>
        `,
        iconSize: [64, 28],
        iconAnchor: [32, 14],
      });

      const marker = L.marker([partner.lat, partner.lng], { icon: partnerIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; max-width: 230px;">
          <b style="color: #003580; font-size: 13px; display: block; margin-bottom: 4px;">${partner.name}</b>
          ${distanceBadge}
          <p style="margin: 0 0 4px 0; color: #475569;">${partner.address}</p>
          <div style="margin-bottom: 4px; font-weight: bold; color: #047857;">📞 ${partner.phone}</div>
          <div style="font-size: 10px; color: #b45309; background: #fef3c7; padding: 2px 4px; border-radius: 4px; display: inline-block;">
            Fund Utilization: ${partner.fundUtilization}% (Simulated)
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectPartner(partner);
      });

      markersGroup.addLayer(marker);
    });

    // 3. Centering and Zooming Logic
    if (selectedPartner) {
      // Pan to specifically selected partner
      map.setView([selectedPartner.lat, selectedPartner.lng], 14, { animate: true });
    } else if (userCoords) {
      // User location detected: center around user's detected location and fit with nearby bank markers
      const nearbyPartners = partners.slice(0, 6);
      if (nearbyPartners.length > 0) {
        const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);
        nearbyPartners.forEach((p) => {
          bounds.extend([p.lat, p.lng]);
        });
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 14,
          animate: true,
        });
      } else {
        map.setView([userCoords.lat, userCoords.lng], 13, { animate: true });
      }
    } else if (partners.length > 0) {
      const bounds = L.latLngBounds(partners.map((p) => [p.lat, p.lng]));
      if (partners.length === 1) {
        map.setView([partners[0].lat, partners[0].lng], 12, { animate: true });
      } else {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13, animate: true });
      }
    } else {
      map.setView([22.9734, 78.6569], 5, { animate: true });
    }

    // Invalidate size once more on next tick to ensure no blank tiles
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => clearTimeout(t);
  }, [partners, userCoords, selectedPartner, onSelectPartner]);

  return (
    <div className="w-full h-[440px] sm:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '440px' }} />
    </div>
  );
}
