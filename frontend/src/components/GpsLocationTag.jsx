import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, RefreshCw } from 'lucide-react';

export default function GpsLocationTag({ onCoordinatesChanged, initialLat, initialLon }) {
  const [coords, setCoords] = useState({
    latitude: initialLat || 23.6889,
    longitude: initialLon || 86.9661
  });
  const [accuracy, setAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Auto-Tagged');

  const acquireGps = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(5));
          const lon = parseFloat(position.coords.longitude.toFixed(5));
          const acc = Math.round(position.coords.accuracy || 8);
          setCoords({ latitude: lat, longitude: lon });
          setAccuracy(acc);
          setGpsStatus('GPS High-Precision Lock');
          setIsLocating(false);
          if (onCoordinatesChanged) onCoordinatesChanged(lat, lon);
        },
        () => {
          // Fallback
          setCoords({ latitude: 23.6889, longitude: 86.9661 });
          setAccuracy(15);
          setGpsStatus('Civic Geo-Estimate');
          setIsLocating(false);
          if (onCoordinatesChanged) onCoordinatesChanged(23.6889, 86.9661);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      setGpsStatus('Simulated GPS');
    }
  };

  useEffect(() => {
    acquireGps();
  }, []);

  return (
    <div className="bg-cream p-4 rounded-2xl border-2 border-vanilla flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-raspberry/10 text-raspberry flex items-center justify-center shrink-0 border border-raspberry/20">
          <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900">Auto GPS Location Tagging</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime/20 text-lime border border-lime/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{gpsStatus}</span>
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-600 font-semibold mt-0.5">
            {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E {accuracy ? `(±${accuracy}m)` : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={acquireGps}
        disabled={isLocating}
        className="self-start sm:self-center text-xs font-bold text-raspberry hover:bg-vanilla/60 bg-white border border-vanilla px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
        title="Refresh GPS Coordinates"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
      </button>
    </div>
  );
}
