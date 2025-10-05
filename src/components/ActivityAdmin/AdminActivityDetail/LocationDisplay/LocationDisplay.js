import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationDisplay.module.css';

// แก้ไขปัญหา default marker icon ของ Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationDisplay({ location, locationDetail, onMapClick, interactive = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // ตรวจสอบว่ามี element และมีข้อมูล location
    if (!mapRef.current || !location || !location.lat || !location.lng) {
      return;
    }

    // ทำลาย map เก่าถ้ามี
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // สร้างแผนที่ใหม่
      const map = L.map(mapRef.current, {
        center: [location.lat, location.lng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        dragging: interactive,
      });

      // เพิ่ม tile layer (แผนที่พื้นฐาน)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      // สร้าง custom marker icon (สีแดงเข้ม)
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #ef4444;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      // เพิ่ม marker พร้อม popup
      const marker = L.marker([location.lat, location.lng], {
        icon: customIcon,
        title: locationDetail || 'ตำแหน่งกิจกรรม',
        draggable: interactive
      }).addTo(map);

      markerRef.current = marker;

      // สร้าง popup content
      const popupContent = `
        <div style="font-family: 'Noto Sans', sans-serif; padding: 4px;">
          <strong style="color: #1f2937; font-size: 14px;">
            ${locationDetail || 'ตำแหน่งกิจกรรม'}
          </strong>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            <div>ละติจูด: ${location.lat.toFixed(6)}</div>
            <div>ลองจิจูด: ${location.lng.toFixed(6)}</div>
          </div>
          <a 
            href="https://www.google.com/maps?q=${location.lat},${location.lng}" 
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              margin-top: 8px;
              padding: 4px 8px;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            "
          >
            เปิดใน Google Maps →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      }).openPopup();

      // ถ้าเป็นโหมดแก้ไข ให้คลิกแผนที่ได้
      if (interactive && onMapClick) {
        map.on('click', (e) => {
          onMapClick(e);
          // อัปเดตตำแหน่ง marker
          marker.setLatLng(e.latlng);
          marker.openPopup();
        });

        // ถ้าลาก marker
        marker.on('dragend', (e) => {
          const newLatLng = e.target.getLatLng();
          onMapClick({ latlng: newLatLng });
        });
      }

      // เพิ่มวงกลมรัศมี (แสดงพื้นที่โดยรอบ)
      L.circle([location.lat, location.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 200, // รัศมี 200 เมตร
        weight: 2,
      }).addTo(map);

      // เพิ่ม scale control
      L.control.scale({
        imperial: false,
        metric: true,
        position: 'bottomleft'
      }).addTo(map);

      mapInstanceRef.current = map;

      // รอให้แผนที่โหลดเสร็จแล้วจึง invalidate size
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

    } catch (error) {
      console.error('Error creating map:', error);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, locationDetail, interactive, onMapClick]);

  // ถ้าไม่มีข้อมูล location ให้แสดงข้อความแจ้งเตือน
  if (!location || !location.lat || !location.lng) {
    return (
      <div className={styles.noLocation}>
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>ไม่มีข้อมูลตำแหน่ง GPS</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div ref={mapRef} className={styles.map}></div>
      <div className={styles.coordinates}>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>ละติจูด:</span>
          <span className={styles.coordValue}>{location.lat.toFixed(6)}</span>
        </div>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>ลองจิจูด:</span>
          <span className={styles.coordValue}>{location.lng.toFixed(6)}</span>
        </div>
        <a
          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mapsLink}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          เปิดใน Google Maps
        </a>
      </div>
    </div>
  );
}

export default LocationDisplay;