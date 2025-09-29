import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationPicker.module.css';
import { FiMap, FiMapPin, FiX, FiSearch, FiNavigation } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ selectedLocation, onLocationSelect, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);

  const DEFAULT_LAT = 13.778259;
  const DEFAULT_LNG = 100.556873;

  useEffect(() => {
    if (!mapRef.current) return;

    const initialCenter = selectedLocation || { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
    const map = L.map(mapRef.current).setView([initialCenter.lat, initialCenter.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (selectedLocation) {
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        draggable: true,
      }).addTo(map);

      marker.on('dragend', function (e) {
        const position = e.target.getLatLng();
        const newLocation = { lat: position.lat, lng: position.lng };
        setCurrentCoords(newLocation);

        if (circleRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(circleRef.current);
        }
        const newCircle = L.circle([newLocation.lat, newLocation.lng], {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          radius: 500
        }).addTo(map);
        circleRef.current = newCircle;
      });

      const circle = L.circle([selectedLocation.lat, selectedLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 500
      }).addTo(map);

      markerRef.current = marker;
      circleRef.current = circle;
      setCurrentCoords(selectedLocation);
    }

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      updateMarker({ lat, lng });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMarker = (location) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    const marker = L.marker([location.lat, location.lng], {
      draggable: true,
    }).addTo(map);

    marker.on('dragend', function (e) {
      const position = e.target.getLatLng();
      const newLocation = { lat: position.lat, lng: position.lng };
      setCurrentCoords(newLocation);

      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
      const newCircle = L.circle([newLocation.lat, newLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 300
      }).addTo(map);
      circleRef.current = newCircle;
    });

    const circle = L.circle([location.lat, location.lng], {
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      radius: 300
    }).addTo(map);

    markerRef.current = marker;
    circleRef.current = circle;
    setCurrentCoords(location);
    map.panTo([location.lat, location.lng]);
  };

  const handleGetCurrentLocation = () => {
    setIsLoading(true);

    const location = {
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
    };

    updateMarker(location);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 16);
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=th&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const location = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        updateMarker(location);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 16);
        }
      } else {
        alert('ไม่พบสถานที่ที่ค้นหา กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleConfirm = () => {
    if (!currentCoords) {
      alert('กรุณาเลือกตำแหน่งบนแผนที่');
      return;
    }

    onLocationSelect(currentCoords);
    onClose();
  };

  const handleClearMarker = () => {
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      setCurrentCoords(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <FiMap className={styles.titleIcon} />
            เลือกตำแหน่งกิจกรรม
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="ค้นหาสถานที่... (เช่น มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className={styles.searchInput}
              />
            </div>
            <button
              onClick={handleSearch}
              className={styles.searchButton}
              disabled={isLoading || !searchQuery.trim()}
            >
              <FiSearch /> ค้นหา
            </button>
            <button
              onClick={handleGetCurrentLocation}
              className={styles.currentLocationButton}
              disabled={isLoading}
              title="ใช้ตำแหน่งปัจจุบัน"
            >
              <FiNavigation />
            </button>
          </div>
          <div className={styles.mapWrapper}>
            <div ref={mapRef} className={styles.map}></div>
            {isLoading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner}></div>
                <p>กำลังโหลด...</p>
              </div>
            )}
          </div>
          <div className={styles.instructions}>
            <FiMapPin className={styles.instructionIcon} />
            <div>
              <strong>วิธีใช้งาน:</strong>
              <ul>
                <li>คลิกบนแผนที่เพื่อเลือกตำแหน่ง</li>
                <li>ลากปักหมุดเพื่อปรับตำแหน่ง</li>
                <li>ค้นหาสถานที่หรือใช้ตำแหน่งปัจจุบัน</li>
              </ul>
            </div>
          </div>
          {currentCoords && (
            <div className={styles.coordinatesDisplay}>
              <FiMapPin className={styles.coordIcon} />
              <div className={styles.coordInfo}>
                <span>ละติจูด: {currentCoords.lat.toFixed(6)}</span>
                <span>ลองจิจูด: {currentCoords.lng.toFixed(6)}</span>
              </div>
              <button
                onClick={handleClearMarker}
                className={styles.clearButton}
                title="ลบตำแหน่ง"
              >
                <FiX />
              </button>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className={styles.confirmButton}
            disabled={!currentCoords}
          >
            <FiMapPin /> ยืนยันตำแหน่ง
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;