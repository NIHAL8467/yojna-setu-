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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when partners, userCoords, or selectedPartner changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Add User Location Marker if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(37,99,235,0.7);
            position: relative;
          ">
            <span style="
              position: absolute;
              top: -6px;
              left: -6px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(37,99,235,0.25);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon });
      userMarker.bindPopup('<b>📍 Your Location</b>');
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
          ">
            <span>🏛️</span>
            <span>${badgeLabel}</span>
          </div>
        `,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([partner.lat, partner.lng], { icon: partnerIcon });
      
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; max-width: 220px;">
          <b style="color: #003580; font-size: 13px; display: block; margin-bottom: 4px;">${partner.name}</b>
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

    // If a partner is selected, pan to it
    if (selectedPartner) {
      map.setView([selectedPartner.lat, selectedPartner.lng], 13, { animate: true });
    }
  }, [partners, userCoords, selectedPartner, onSelectPartner]);

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
}
