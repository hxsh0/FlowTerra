"use client";
import { useEffect, useRef } from "react";
import type { HotLead } from "@/lib/types";
import { hasGoogleMapsApiKey, loadMapsLibrary } from "@/lib/google-maps-loader";

interface Props {
  leads: HotLead[];
}

const CONTINENTAL_US_CENTER = { lat: 39.8, lng: -98.6 };

// Dark basemap tuned to the app's near-black canvas (--bg-0/--bg-2/--line-2)
// so the map reads as part of the console rather than an embedded widget.
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1322" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0d18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7d82a0" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#242b45" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#33395a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0f1322" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1d2438" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#161b2e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#242b45" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#080a12" }] },
];

/** Gold circle markers scaled by ICP score, rendered on Google Maps JS API. */
export function LeadsMap({ leads }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const located = leads.filter((l): l is HotLead & { lat: number; lng: number } => l.lat != null && l.lng != null);

  useEffect(() => {
    if (!hasGoogleMapsApiKey() || !containerRef.current) return;
    let cancelled = false;

    (async () => {
      const { Map } = await loadMapsLibrary();
      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = new Map(containerRef.current, {
          center: CONTINENTAL_US_CENTER,
          zoom: 4,
          disableDefaultUI: true,
          zoomControl: true,
          styles: DARK_MAP_STYLE,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
      }
      const map = mapRef.current;

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      if (located.length === 0) {
        map.setCenter(CONTINENTAL_US_CENTER);
        map.setZoom(4);
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      located.forEach((lead) => {
        const position = { lat: lead.lat, lng: lead.lng };
        bounds.extend(position);
        const radius = 5 + (lead.icpScore / 100) * 6;

        const marker = new google.maps.Marker({
          position,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: radius,
            strokeWeight: 1.5,
            strokeColor: "#171b2c",
            fillColor: lead.icpScore >= 70 ? "#eec87a" : "#7d82a0",
            fillOpacity: 0.9,
          },
        });

        marker.addListener("click", () => {
          infoWindowRef.current?.setContent(
            `<strong>${escapeHtml(lead.company)}</strong><br/>ICP score: ${lead.icpScore}${
              lead.address ? `<br/>${escapeHtml(lead.address)}` : ""
            }`
          );
          infoWindowRef.current?.open({ map, anchor: marker });
        });

        markersRef.current.push(marker);
      });
      map.fitBounds(bounds, 40);
    })();

    return () => {
      cancelled = true;
    };
  }, [leads]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      infoWindowRef.current?.close();
    };
  }, []);

  if (!hasGoogleMapsApiKey()) {
    return (
      <p className="leads-map-caption">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the leads map.
      </p>
    );
  }

  return (
    <>
      <div ref={containerRef} className="leads-map" />
      {located.length === 0 && (
        <p className="leads-map-caption">No located leads yet — Places results carry coordinates once you run Discovery.</p>
      )}
    </>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
