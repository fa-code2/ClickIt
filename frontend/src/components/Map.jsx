import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ complaints = [] }) {
  if (typeof window === 'undefined') return null;

  const center = complaints && complaints.length > 0 
    ? [complaints[0].latitude, complaints[0].longitude] 
    : [23.6889, 86.9661];

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border-2 border-vanilla relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((c) => (
          <Marker key={c.id} position={[c.latitude, c.longitude]}>
            <Popup>
              <div className="text-sm">
                <strong className="text-raspberry font-bold block">{c.issue_type}</strong>
                <p className="m-0 text-slate-700">Dept: {c.department}</p>
                <p className="m-0 text-slate-700">Priority: {c.priority_score}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}