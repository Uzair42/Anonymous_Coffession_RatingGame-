"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function Map({ visitors }) {
  // Filter out visitors that don't have valid coordinates
  const validVisitors = visitors.filter(v => v.location && v.location.lat && v.location.lng);

  return (
    <div className="w-full h-[600px] border-4 border-black brutal-shadow z-0 relative">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validVisitors.map((v) => (
          <Marker key={v._id} position={[v.location.lat, v.location.lng]}>
            <Popup>
              <div className="font-sans">
                <p className="font-black text-lg uppercase text-[#ff3300] m-0">{v.alias}</p>
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <p><strong>IP:</strong> {v.deviceFingerprint?.ip}</p>
                  <p><strong>OS:</strong> {v.deviceFingerprint?.os}</p>
                  <p><strong>Browser:</strong> {v.deviceFingerprint?.browser}</p>
                  <p><strong>Visits:</strong> {v.visitCount}</p>
                  <p><strong>Last Seen:</strong> {new Date(v.lastSeen).toLocaleString()}</p>
                  <p><strong>Coordinates:</strong> {v.location.lat.toFixed(4)}, {v.location.lng.toFixed(4)}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
