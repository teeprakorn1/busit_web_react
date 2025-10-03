// components/ActivityAdmin/AdminAllActivity/ActivityModal/LocationDisplay.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationDisplay.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationDisplay({ location, locationDetail }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !location) return;

    // สร้างแผนที่
    const map = L.map(mapRef.current).setView([location.lat, location.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // เพิ่ม marker
    const marker = L.marker([location.lat, location.lng]).addTo(map);

    // เพิ่ม popup ถ้ามี locationDetail
    if (locationDetail) {
      marker.bindPopup(`<strong>${locationDetail}</strong>`).openPopup();
    }

    // เพิ่มวงกลมรัศมี
    L.circle([location.lat, location.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      radius: 300
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, locationDetail]);

  if (!location) return null;

  return (
    <div className={styles.container}>
      <div ref={mapRef} className={styles.map}></div>
      <div className={styles.coordinates}>
        <span>ละติจูด: {location.lat.toFixed(6)}</span>
        <span>ลองจิจูด: {location.lng.toFixed(6)}</span>
      </div>
    </div>
  );
}

export default LocationDisplay;