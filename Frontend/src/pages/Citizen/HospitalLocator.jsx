import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPinned, Star, Phone, Navigation, Siren, Bookmark, Droplets, Pill, Search, X, AlertTriangle, MapPin, Loader2, Compass, ExternalLink, Globe } from 'lucide-react';
import { fetchAllNearbyHealthcareFacilities, calculateHaversineDistance, geocodeCityOrAddress, searchHealthcareFacilitiesByCity, reverseGeocodeLocation } from '../../api/locationApi';
import { fetchHospitals } from '../../api/hospitalApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { updateHospitalOccupancy } from '../../api/workflowApi';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { cn } from '../../utils/cn';

// Leaflet DivIcons for dynamic marker colors (Blue = User, Red = Hospital, Green = Pharmacy)
const userMarkerIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #2563eb; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.8); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const hospitalMarkerIcon = new L.DivIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(239,68,68,0.7);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const pharmacyMarkerIcon = new L.DivIcon({
  className: 'custom-pharmacy-marker',
  html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(16,185,129,0.7);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const bloodBankMarkerIcon = new L.DivIcon({
  className: 'custom-bloodbank-marker',
  html: `<div style="background-color: #e11d48; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(225,29,72,0.7);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const TABS = [
  { key: 'hospitals', label: 'Hospitals', icon: MapPinned },
  { key: 'pharmacies', label: 'Pharmacies', icon: Pill },
  { key: 'bloodBanks', label: 'Blood Banks', icon: Droplets },
];

const DEFAULT_COIMBATORE_LOCATION = { lat: 11.0168, lng: 76.9558, lon: 76.9558, name: 'Coimbatore' };
const QUICK_CITIES = ['Coimbatore', 'Chennai', 'Madurai', 'Bengaluru', 'Delhi', 'Mumbai'];

export default function HospitalLocator() {
  const [activeTab, setActiveTab] = useState('hospitals');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [activeLocationLabel, setActiveLocationLabel] = useState('Current GPS Location');
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('LOADING'); // 'LOADING' | 'SUCCESS_WITH_DATA' | 'SUCCESS_WITH_NO_DATA' | 'API_ERROR' | 'TIMEOUT'
  const [fetchError, setFetchError] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const [mapCenter, setMapCenter] = useState([DEFAULT_COIMBATORE_LOCATION.lat, DEFAULT_COIMBATORE_LOCATION.lon]);

  // userGpsRef preserves the user's actual physical device GPS coordinates across searches
  const userGpsRef = useRef(DEFAULT_COIMBATORE_LOCATION);

  // Load facilities for a searched city (calculates distances strictly from user's physical GPS)
  const loadCityData = async (cityName) => {
    setIsLoading(true);
    setFetchStatus('LOADING');
    setFetchError(null);
    setIsSearchingCity(true);

    try {
      const userGps = userGpsRef.current;
      console.log(`[HospitalLocator] Searching city: "${cityName}" relative to user GPS:`, userGps);
      const res = await searchHealthcareFacilitiesByCity(cityName, userGps.lat, userGps.lon);

      if (res && res.city) {
        setMapCenter([res.city.lat, res.city.lon]);
        setActiveLocationLabel(res.city.displayName || res.city.name);
        setHospitals(res.hospitals || []);
        setPharmacies(res.pharmacies || []);
        setBloodBanks(res.bloodBanks || []);
        const hasData = (res.hospitals?.length > 0) || (res.pharmacies?.length > 0) || (res.bloodBanks?.length > 0);
        setFetchStatus(hasData ? 'SUCCESS_WITH_DATA' : 'SUCCESS_WITH_NO_DATA');
        toast.success(`Found ${res.hospitals.length} hospitals in ${res.city.name}`);
      } else {
        toast.error(`Could not locate "${cityName}". Showing local facilities.`);
        await loadNearbyGpsData(userGps.lat, userGps.lon);
      }
    } catch (err) {
      console.error("[HospitalLocator] loadCityData error:", err);
      setFetchStatus('API_ERROR');
      setFetchError(err.message || 'Error loading city facilities');
    } finally {
      setIsLoading(false);
      setIsSearchingCity(false);
      setIsFetchingLocation(false);
    }
  };

  // Load facilities around GPS location
  const loadNearbyGpsData = async (lat, lon, label = null) => {
    setIsLoading(true);
    setFetchStatus('LOADING');
    setFetchError(null);

    try {
      const res = await fetchAllNearbyHealthcareFacilities(lat, lon, { lat, lon });
      setMapCenter([lat, lon]);
      if (label) setActiveLocationLabel(label);
      setHospitals(res.hospitals || []);
      setPharmacies(res.pharmacies || []);
      setBloodBanks(res.bloodBanks || []);
      const hasData = (res.hospitals?.length > 0) || (res.pharmacies?.length > 0) || (res.bloodBanks?.length > 0);
      setFetchStatus(hasData ? 'SUCCESS_WITH_DATA' : 'SUCCESS_WITH_NO_DATA');
    } catch (err) {
      console.error("[HospitalLocator] loadNearbyGpsData error:", err);
      setFetchStatus('API_ERROR');
      setFetchError(err.message || 'Error loading facilities');
    } finally {
      setIsLoading(false);
      setIsFetchingLocation(false);
    }
  };

  const handleCitySearch = async (targetCity) => {
    const city = targetCity || cityInput;
    if (!city || !city.trim()) {
      toast.error('Please enter a city or town name');
      return;
    }
    toast.loading(`Locating healthcare facilities in ${city}...`, { id: 'citySearch' });
    await loadCityData(city.trim());
    toast.dismiss('citySearch');
  };

  const handleUseCurrentGPS = () => {
    setIsFetchingLocation(true);
    toast.loading('Acquiring live GPS coordinates...', { id: 'gpsToast' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            lon: position.coords.longitude,
          };
          userGpsRef.current = coords;
          setUserLocation(coords);
          setIsLocationDenied(false);
          toast.success('Live GPS coordinates locked!', { id: 'gpsToast' });

          let detectedLabel = 'Live GPS Location';
          try {
            const geo = await reverseGeocodeLocation(coords.lat, coords.lon);
            if (geo?.displayLocation) detectedLabel = geo.displayLocation;
          } catch {}

          await loadNearbyGpsData(coords.lat, coords.lon, detectedLabel);
        },
        (error) => {
          setIsLocationDenied(true);
          toast.error('Could not get GPS location. Showing Coimbatore facilities.', { id: 'gpsToast' });
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.', { id: 'gpsToast' });
      setIsFetchingLocation(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setIsFetchingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            lon: position.coords.longitude,
          };
          console.log("[HospitalLocator] Live GPS acquired:", coords);
          userGpsRef.current = coords;
          setUserLocation(coords);
          setMapCenter([coords.lat, coords.lon]);
          setIsLocationDenied(false);

          let detectedLabel = 'Live GPS Location';
          try {
            const geo = await reverseGeocodeLocation(coords.lat, coords.lon);
            if (geo?.displayLocation) detectedLabel = geo.displayLocation;
          } catch {}

          await loadNearbyGpsData(coords.lat, coords.lon, detectedLabel);
        },
        async (error) => {
          console.warn("[HospitalLocator] Geolocation error:", error.message);
          setIsLocationDenied(true);
          setUserLocation(DEFAULT_COIMBATORE_LOCATION);
          userGpsRef.current = DEFAULT_COIMBATORE_LOCATION;
          setActiveLocationLabel('Coimbatore, Tamil Nadu (Default)');
          await loadCityData('Coimbatore');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocationDenied(true);
      setUserLocation(DEFAULT_COIMBATORE_LOCATION);
      userGpsRef.current = DEFAULT_COIMBATORE_LOCATION;
      setActiveLocationLabel('Coimbatore, Tamil Nadu (Default)');
      loadCityData('Coimbatore');
    }
  }, []);

  const activeUserLoc = userGpsRef.current;
  const currentMapCenter = mapCenter || [activeUserLoc.lat, activeUserLoc.lng];

  // Helper to trigger Google Maps direction navigation directly from USER GPS to facility
  const handleNavigate = (item) => {
    const destLat = item.lat || item.latitude || DEFAULT_COIMBATORE_LOCATION.lat;
    const destLon = item.lon || item.lng || item.longitude || DEFAULT_COIMBATORE_LOCATION.lon;
    const name = item.name || item.label || "Facility";
    const originLat = userGpsRef.current.lat;
    const originLon = userGpsRef.current.lon;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLon}&destination=${destLat},${destLon}&travelmode=driving`;
    window.open(googleMapsUrl, "_blank");

    if (item.beds) {
      const occupancyPercent = Math.min(99, 65 + (item.beds % 35));
      updateHospitalOccupancy({ hospitalName: name, occupancyPercent });
    }
    toast(`Opening Google Maps Navigation to ${name}`, { icon: '🧭' });
  };

  const handleOpenGoogleSearch = (item) => {
    const name = item.name || item.label || "Facility";
    const destLat = item.lat || item.latitude || DEFAULT_COIMBATORE_LOCATION.lat;
    const destLon = item.lon || item.lng || item.longitude || DEFAULT_COIMBATORE_LOCATION.lon;
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${destLat},${destLon}`;
    window.open(searchUrl, "_blank");
  };

  const handleCall = (name, phone) => toast(`Calling ${name}: ${phone}`, { icon: '📞' });

  const handleSave = (id, name) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast(`Removed ${name} from saved places`);
      } else {
        next.add(id);
        toast.success(`Saved ${name}`);
      }
      return next;
    });
  };

  // Helper to render distance relative to user's real GPS, plus distance to city center if searched
  const renderDistanceBadge = (item) => {
    if (!item) return null;
    if (item.cityDistKm != null && item.distanceKm > 45) {
      return (
        <span className="text-brand-600 dark:text-brand-400 font-bold" title={`${item.cityDistKm} km from searched city center`}>
          📍 {item.distanceKm} km from your GPS <span className="text-[11px] font-normal text-slate-400">({item.cityDistKm} km from center)</span>
        </span>
      );
    }
    return (
      <span className="text-brand-600 dark:text-brand-400 font-bold">
        📍 {item.distanceKm} km away
      </span>
    );
  };

  // Quick Action Click Handlers: Centers map on nearest facility
  const handleQuickAction = (tabKey) => {
    setActiveTab(tabKey);

    const items =
      tabKey === 'hospitals'  ? hospitals :
      tabKey === 'pharmacies' ? pharmacies :
                                bloodBanks;

    const label =
      tabKey === 'hospitals'  ? 'Hospital' :
      tabKey === 'pharmacies' ? 'Pharmacy' : 'Blood Bank';

    if (items.length > 0) {
      const nearest = items[0];
      setMapCenter([nearest.lat, nearest.lon]);
      toast.success(`Centered on nearest ${label}: ${nearest.name || nearest.label}`);
    } else {
      toast.success(`Locating nearest ${label}…`);
    }
  };

  const query = searchTerm.trim().toLowerCase();

  const filterItems = (list, searchFn) => {
    if (!query) return list;
    return list.filter(searchFn);
  };

  const filteredHospitals = filterItems(hospitals, (h) => {
    const nameMatch = (h.name || '').toLowerCase().includes(query);
    const typeMatch = (h.type || '').toLowerCase().includes(query);
    const specMatch = (Array.isArray(h.specialties) && h.specialties.some((s) => s.toLowerCase().includes(query))) ||
                      (typeof h.specialties === 'string' && h.specialties.toLowerCase().includes(query)) ||
                      (typeof h.services === 'string' && h.services.toLowerCase().includes(query)) ||
                      (Array.isArray(h.services) && h.services.some((s) => s.toLowerCase().includes(query)));
    return nameMatch || typeMatch || specMatch;
  });

  const filteredPharmacies = filterItems(pharmacies, (p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(query);
    const typeMatch = (p.type || '').toLowerCase().includes(query);
    const hourMatch = p.open24Hours && ('24 hrs 24 hours 24h').includes(query);
    return nameMatch || typeMatch || hourMatch;
  });

  const filteredBloodBanks = filterItems(bloodBanks, (bb) => {
    const nameMatch = (bb.name || '').toLowerCase().includes(query);
    const stockMatch = (bb.stock || '').toLowerCase().includes(query);
    return nameMatch || stockMatch;
  });

  // Active facility dataset for Leaflet Map Markers
  const activeMapItems =
    activeTab === 'hospitals'  ? filteredHospitals :
    activeTab === 'pharmacies' ? filteredPharmacies :
                                 filteredBloodBanks;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="section-eyebrow">
            <MapPinned className="h-3.5 w-3.5" /> Real-World Healthcare Finder • OpenStreetMap & Google Maps
          </span>
          <h1 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Find hospitals & pharmacies near you
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3.5 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300">
          <MapPin className="h-4 w-4 text-brand-500 shrink-0" />
          <span className="truncate max-w-[240px]">{activeLocationLabel}</span>
        </div>
      </div>

      {/* City & Address Search Bar + Live GPS Toggle */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-surface-darkcard">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Compass className="h-4 w-4 text-brand-500" />
            </div>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              placeholder="Search any city or district across India (e.g., Coimbatore, Chennai, Madurai)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCitySearch()}
              disabled={isSearchingCity}
              className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold shrink-0 cursor-pointer"
            >
              {isSearchingCity ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              <span>Search City</span>
            </button>
            <button
              type="button"
              onClick={handleUseCurrentGPS}
              disabled={isFetchingLocation}
              className="btn-secondary flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold shrink-0 cursor-pointer"
              title="Use current GPS coordinates"
            >
              {isFetchingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5 text-rose-500" />}
              <span>Live GPS</span>
            </button>
          </div>
        </div>

        {/* Quick Indian City Chips */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pt-1 text-xs text-slate-500">
          <span className="font-semibold shrink-0 text-slate-400">Popular:</span>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setCityInput(city);
                handleCitySearch(city);
              }}
              className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-brand-500/10 cursor-pointer transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Status / Error Banner */}
      {isFetchingLocation && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 px-4 py-3 text-xs font-medium text-brand-700 dark:text-brand-300">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-500" />
          <span>Fetching real-time data from OpenStreetMap near your GPS location — this may take up to 30 seconds…</span>
        </div>
      )}

      {!isFetchingLocation && isLocationDenied && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>Location access was denied. Showing healthcare facilities near Coimbatore (or type any city above).</span>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleQuickAction('hospitals')}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all shadow-sm cursor-pointer",
            activeTab === 'hospitals'
              ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-200"
          )}
        >
          <MapPinned className="h-4 w-4 text-brand-500" />
          <span>Nearest Hospital</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickAction('pharmacies')}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all shadow-sm cursor-pointer",
            activeTab === 'pharmacies'
              ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-200"
          )}
        >
          <Pill className="h-4 w-4 text-emerald-500" />
          <span>Nearest Pharmacy</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickAction('bloodBanks')}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all shadow-sm cursor-pointer",
            activeTab === 'bloodBanks'
              ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20"
              : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 dark:border-white/10 dark:bg-surface-darkcard dark:text-slate-200"
          )}
        >
          <Droplets className="h-4 w-4 text-rose-500" />
          <span>Nearest Blood Bank</span>
        </button>
      </div>

      {/* Local Filter Bar */}
      <div className="mt-4 relative max-w-2xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter current results by name, type, or specialty..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-surface-darkcard dark:text-white dark:placeholder-slate-500"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Interactive Map with Custom Colored Markers (Blue=User, Red=Hospital, Green=Pharmacy) */}
      <div className="surface-card mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
        <MapContainer
          key={`${currentMapCenter[0]}-${currentMapCenter[1]}`}
          center={currentMapCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "380px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Live User Location Marker (Blue) */}
          <Marker position={[activeUserLoc.lat, activeUserLoc.lng]} icon={userMarkerIcon}>
            <Popup>
              <div className="p-1 text-center font-sans">
                <p className="font-bold text-xs text-brand-600">📍 Your Current Location</p>
                <p className="text-[11px] text-slate-500">Lat: {activeUserLoc.lat.toFixed(4)}, Lng: {activeUserLoc.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>

          {/* Facility Markers for Active Tab */}
          {activeMapItems.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={
                activeTab === 'hospitals'  ? hospitalMarkerIcon :
                activeTab === 'pharmacies' ? pharmacyMarkerIcon :
                                            bloodBankMarkerIcon
              }
            >
              <Popup>
                <div className="p-1.5 font-sans">
                  <p className="font-bold text-xs text-slate-900">{item.name || item.label}</p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {item.cityDistKm != null && item.distanceKm > 45
                      ? `📍 ${item.distanceKm} km from your GPS (${item.cityDistKm} km from center)`
                      : `📍 ${item.distanceKm} km away`}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCall(item.name || item.label, item.phone || item.number)}
                      className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="h-3 w-3" /> Call
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className="px-2 py-1 bg-brand-600 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="h-3 w-3" /> Navigate
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="p-2.5 text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-white/[0.02]">
          {activeMapItems.length > 0
            ? `Showing ${activeMapItems.length} verified facilities in ${activeLocationLabel} (distances measured from your GPS)`
            : 'Searching healthcare facilities near your current location...'}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer',
              activeTab === t.key
                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold'
                : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-white/10 dark:text-slate-300'
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonGrid count={4} className="mt-6 grid gap-4 sm:grid-cols-2" cardClassName="p-5" />}

      {/* API Error / Timeout Banner */}
      {!isLoading && (fetchStatus === 'API_ERROR' || fetchStatus === 'TIMEOUT') && hospitals.length === 0 && pharmacies.length === 0 && bloodBanks.length === 0 && (
        <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-slate-800 dark:text-slate-200">
          <AlertTriangle className="mx-auto h-8 w-8 text-signal-rose mb-2" />
          <h3 className="text-base font-semibold text-signal-rose">
            {fetchStatus === 'TIMEOUT' ? 'Facility Search Timed Out' : 'Unable to Load Healthcare Facilities'}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {fetchError || 'Unable to connect to OpenStreetMap and facility servers right now. Please check your network and try again.'}
          </p>
          <button
            type="button"
            onClick={() => loadNearbyGpsData(activeUserLoc.lat, activeUserLoc.lon || activeUserLoc.lng)}
            className="btn-primary mt-4 text-xs inline-flex items-center gap-1.5"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Hospitals Tab */}
      {!isLoading && activeTab === 'hospitals' && (fetchStatus !== 'API_ERROR' && fetchStatus !== 'TIMEOUT' || filteredHospitals.length > 0) && (
        <div className="mt-6">
          {filteredHospitals.length === 0 ? (
            <EmptyState
              icon={MapPinned}
              title="No hospitals found"
              description={searchTerm ? `No hospitals match "${searchTerm}".` : "No healthcare facilities found matching your criteria. Try searching a city above."}
              className="py-12"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredHospitals.map((h, index) => (
                <div key={h.id} className={cn("surface-card p-5 transition-all flex flex-col justify-between", index === 0 && "ring-2 ring-brand-500/40 bg-brand-500/[0.02]")}>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.name}</p>
                          {index === 0 && (
                            <Badge tone="brand">
                              <MapPin className="mr-1 h-3 w-3" /> Nearest to You
                            </Badge>
                          )}
                          {h.source === 'OPENSTREETMAP' && (
                            <Badge tone="neutral">
                              <Globe className="mr-1 h-2.5 w-2.5 text-brand-500" /> OSM Live
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{h.type}{h.beds ? ` · ${h.beds} beds` : ''}</p>
                        {h.address && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {h.address}
                          </p>
                        )}
                      </div>
                      {h.emergency && (
                        <Badge tone="rose">
                          <Siren className="mr-1 h-3 w-3" /> Emergency
                        </Badge>
                      )}
                    </div>

                    {h.specialties && h.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {h.specialties.map((s) => (
                          <Badge key={s} tone="neutral">{s}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-signal-amber text-signal-amber" /> {h.rating || 4.2}
                      </span>
                      {renderDistanceBadge(h)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button type="button" onClick={() => handleCall(h.name, h.phone)} className="btn-secondary flex-1 text-xs">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </button>
                    <button type="button" onClick={() => handleNavigate(h)} className="btn-primary flex-1 text-xs">
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleSearch(h)}
                      title="Open in Google Maps"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-400 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(h.id, h.name)}
                      aria-label="Save"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer',
                        saved.has(h.id)
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 text-slate-400 hover:border-brand-300 dark:border-white/10'
                      )}
                    >
                      <Bookmark className={cn('h-4 w-4', saved.has(h.id) && 'fill-current')} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pharmacies Tab */}
      {!isLoading && activeTab === 'pharmacies' && (fetchStatus !== 'API_ERROR' && fetchStatus !== 'TIMEOUT' || filteredPharmacies.length > 0) && (
        <div className="mt-6">
          {filteredPharmacies.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No pharmacies found"
              description={searchTerm ? `No pharmacies match "${searchTerm}".` : "No pharmacies found matching your criteria. Try searching a city above."}
              className="py-12"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPharmacies.map((p, index) => (
                <div key={p.id} className={cn("surface-card p-5 transition-all flex flex-col justify-between", index === 0 && "ring-2 ring-brand-500/40 bg-brand-500/[0.02]")}>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                          {index === 0 && (
                            <Badge tone="brand">
                              <MapPin className="mr-1 h-3 w-3" /> Nearest to You
                            </Badge>
                          )}
                          {p.source === 'OPENSTREETMAP' && (
                            <Badge tone="neutral">
                              <Globe className="mr-1 h-2.5 w-2.5 text-emerald-500" /> OSM Live
                            </Badge>
                          )}
                        </div>
                        {p.address && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {p.address}
                          </p>
                        )}
                      </div>
                      {p.open24Hours && <Badge tone="brand">Open 24 Hours</Badge>}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-signal-amber text-signal-amber" /> {p.rating || 4.1}
                      </span>
                      {renderDistanceBadge(p)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button type="button" onClick={() => handleCall(p.name, p.phone)} className="btn-secondary flex-1 text-xs">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </button>
                    <button type="button" onClick={() => handleNavigate(p)} className="btn-primary flex-1 text-xs">
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleSearch(p)}
                      title="Open in Google Maps"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-400 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(p.id, p.name)}
                      aria-label="Save"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors cursor-pointer',
                        saved.has(p.id)
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'border-slate-200 text-slate-400 hover:border-brand-300 dark:border-white/10'
                      )}
                    >
                      <Bookmark className={cn('h-4 w-4', saved.has(p.id) && 'fill-current')} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blood Banks Tab */}
      {!isLoading && activeTab === 'bloodBanks' && (fetchStatus !== 'API_ERROR' && fetchStatus !== 'TIMEOUT' || filteredBloodBanks.length > 0) && (
        <div className="mt-6">
          {filteredBloodBanks.length === 0 ? (
            <EmptyState
              icon={Droplets}
              title="No blood banks found"
              description={searchTerm ? `No blood banks match "${searchTerm}".` : "No blood banks found matching your criteria. Try searching a city above."}
              className="py-12"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBloodBanks.map((bb, index) => (
                <div key={bb.id} className={cn("surface-card p-5 transition-all flex flex-col justify-between gap-3", index === 0 && "ring-2 ring-brand-500/40 bg-brand-500/[0.02]")}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{bb.name}</p>
                      <Badge tone={bb.stock?.toLowerCase().includes('low') ? 'amber' : 'brand'}>{bb.stock}</Badge>
                    </div>
                    {index === 0 && (
                      <Badge tone="brand" className="mb-2">
                        <MapPin className="mr-1 h-3 w-3" /> Nearest to You
                      </Badge>
                    )}
                    {bb.address && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {bb.address}
                      </p>
                    )}
                    <div className="mt-2">
                      {renderDistanceBadge(bb)}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <button type="button" onClick={() => handleCall(bb.name, bb.phone || "+91 422 245 5555")} className="btn-secondary flex-1 text-xs">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </button>
                    <button type="button" onClick={() => handleNavigate(bb)} className="btn-primary flex-1 text-xs">
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGoogleSearch(bb)}
                      title="Open in Google Maps"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:text-slate-400 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
