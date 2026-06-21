/* =================================================================
   LIVE ROUTES EXTENSION — v1
   Extension layer: adds route visualization + animated shipment
   markers to BOTH the user tracking map and the admin fleet map.
   ─────────────────────────────────────────────────────────────────
   SAFETY: Never overwrites existing map, script, or sync logic.
   All functions are namespaced under window.LiveRoutes.
   Hooks into existing SyncEngine and Leaflet instances only.
   ================================================================= */
'use strict';

(function () {

  /* ─── Minimal global coordinate database for any location ─── */
  const WORLD_COORDS = {
    // Africa
    'cairo': [30.0444, 31.2357], 'lagos': [6.5244, 3.3792], 'nairobi': [1.2921, 36.8219],
    'johannesburg': [-26.2041, 28.0473], 'cape town': [-33.9249, 18.4241], 'accra': [5.6037, -0.1870],
    'dar es salaam': [-6.7924, 39.2083], 'addis ababa': [9.0320, 38.7469], 'casablanca': [33.5731, -7.5898],
    'bamenda': [5.9631, 10.1591], 'douala': [4.0511, 9.7679], 'yaounde': [3.8480, 11.5021],
    'abuja': [9.0765, 7.3986], 'kano': [12.0022, 8.5920], 'kinshasa': [-4.3217, 15.3225],
    'kampala': [0.3476, 32.5825], 'dar es salaam': [-6.7924, 39.2083], 'lusaka': [-15.4167, 28.2833],
    'harare': [-17.8252, 31.0335], 'maputo': [-25.9692, 32.5732], 'antananarivo': [-18.9137, 47.5361],
    'dakar': [14.6928, -17.4467], 'abidjan': [5.3600, -4.0083], 'conakry': [9.6412, -13.5784],
    'freetown': [8.4657, -13.2317], 'monrovia': [6.3004, -10.7969], 'bamako': [12.6392, -8.0029],
    'ouagadougou': [12.3714, -1.5197], 'niamey': [13.5137, 2.1098], 'ndjamena': [12.1348, 15.0557],
    'khartoum': [15.5007, 32.5599], 'tripoli': [32.9016, 13.1797], 'tunis': [36.8065, 10.1815],
    'algiers': [36.7372, 3.0869], 'rabat': [34.0209, -6.8416], 'libreville': [0.3902, 9.4536],
    'brazzaville': [-4.2634, 15.2429], 'luanda': [-8.8383, 13.2344], 'windhoek': [-22.5609, 17.0658],
    'gaborone': [-24.6282, 25.9231], 'maseru': [-29.3167, 27.4833], 'mbabane': [-26.3186, 31.1410],

    // Asia
    'tokyo': [35.6762, 139.6503], 'beijing': [39.9042, 116.4074], 'shanghai': [31.2304, 121.4737],
    'hong kong': [22.3193, 114.1694], 'seoul': [37.5665, 126.9780], 'singapore': [1.3521, 103.8198],
    'bangkok': [13.7563, 100.5018], 'jakarta': [-6.2088, 106.8456], 'kuala lumpur': [3.1390, 101.6869],
    'manila': [14.5995, 120.9842], 'taipei': [25.0330, 121.5654], 'mumbai': [19.0760, 72.8777],
    'delhi': [28.7041, 77.1025], 'bangalore': [12.9716, 77.5946], 'chennai': [13.0827, 80.2707],
    'kolkata': [22.5726, 88.3639], 'hyderabad': [17.3850, 78.4867], 'pune': [18.5204, 73.8567],
    'karachi': [24.8607, 67.0011], 'lahore': [31.5497, 74.3436], 'islamabad': [33.7294, 73.0931],
    'dhaka': [23.8103, 90.4125], 'colombo': [6.9271, 79.8612], 'kathmandu': [27.7172, 85.3240],
    'yangon': [16.8661, 96.1951], 'phnom penh': [11.5564, 104.9282], 'vientiane': [17.9757, 102.6331],
    'hanoi': [21.0285, 105.8542], 'ho chi minh city': [10.8231, 106.6297], 'ulaanbaatar': [47.8864, 106.9057],
    'almaty': [43.2220, 76.8512], 'tashkent': [41.2995, 69.2401], 'baku': [40.4093, 49.8671],
    'tbilisi': [41.6938, 44.8015], 'yerevan': [40.1872, 44.5152], 'tehran': [35.6892, 51.3890],
    'dubai': [25.2048, 55.2708], 'abu dhabi': [24.4539, 54.3773], 'riyadh': [24.7136, 46.6753],
    'jeddah': [21.4858, 39.1925], 'doha': [25.2854, 51.5310], 'muscat': [23.5880, 58.3829],
    'kuwait city': [29.3759, 47.9774], 'beirut': [33.8886, 35.4955], 'amman': [31.9454, 35.9284],
    'jerusalem': [31.7683, 35.2137], 'tel aviv': [32.0853, 34.7818], 'damascus': [33.5138, 36.2765],
    'baghdad': [33.3152, 44.3661], 'kabul': [34.5553, 69.2075], 'male': [4.1755, 73.5093],

    // Europe
    'london': [51.5074, -0.1278], 'paris': [48.8566, 2.3522], 'berlin': [52.5200, 13.4050],
    'madrid': [40.4168, -3.7038], 'rome': [41.9028, 12.4964], 'amsterdam': [52.3676, 4.9041],
    'brussels': [50.8503, 4.3517], 'vienna': [48.2082, 16.3738], 'zurich': [47.3769, 8.5417],
    'geneva': [46.2044, 6.1432], 'stockholm': [59.3293, 18.0686], 'oslo': [59.9139, 10.7522],
    'copenhagen': [55.6761, 12.5683], 'helsinki': [60.1699, 24.9384], 'warsaw': [52.2297, 21.0122],
    'prague': [50.0755, 14.4378], 'budapest': [47.4979, 19.0402], 'bucharest': [44.4268, 26.1025],
    'athens': [37.9838, 23.7275], 'istanbul': [41.0082, 28.9784], 'ankara': [39.9334, 32.8597],
    'kyiv': [50.4501, 30.5234], 'minsk': [53.9045, 27.5615], 'moscow': [55.7558, 37.6173],
    'saint petersburg': [59.9343, 30.3351], 'riga': [56.9496, 24.1052], 'tallinn': [59.4370, 24.7536],
    'vilnius': [54.6872, 25.2797], 'lisbon': [38.7223, -9.1393], 'porto': [41.1579, -8.6291],
    'barcelona': [41.3851, 2.1734], 'milan': [45.4654, 9.1859], 'frankfurt': [50.1109, 8.6821],
    'munich': [48.1351, 11.5820], 'hamburg': [53.5753, 10.0153], 'cologne': [50.9333, 6.9500],
    'rotterdam': [51.9244, 4.4777], 'antwerp': [51.2213, 4.3997], 'lyon': [45.7640, 4.8357],
    'marseille': [43.2965, 5.3698], 'dublin': [53.3498, -6.2603], 'edinburgh': [55.9533, -3.1883],

    // Americas
    'new york': [40.7128, -74.0060], 'los angeles': [34.0522, -118.2437], 'chicago': [41.8781, -87.6298],
    'houston': [29.7604, -95.3698], 'phoenix': [33.4484, -112.0740], 'philadelphia': [39.9526, -75.1652],
    'san antonio': [29.4241, -98.4936], 'san diego': [32.7157, -117.1611], 'dallas': [32.7767, -96.7970],
    'san jose': [37.3382, -121.8863], 'san francisco': [37.7749, -122.4194], 'austin': [30.2672, -97.7431],
    'seattle': [47.6062, -122.3321], 'denver': [39.7392, -104.9903], 'boston': [42.3601, -71.0589],
    'miami': [25.7617, -80.1918], 'atlanta': [33.7490, -84.3880], 'minneapolis': [44.9778, -93.2650],
    'portland': [45.5051, -122.6750], 'las vegas': [36.1699, -115.1398], 'detroit': [42.3314, -83.0458],
    'memphis': [35.1495, -90.0490], 'louisville': [38.2527, -85.7585], 'baltimore': [39.2904, -76.6122],
    'toronto': [43.6532, -79.3832], 'montreal': [45.5017, -73.5673], 'vancouver': [49.2827, -123.1207],
    'calgary': [51.0447, -114.0719], 'ottawa': [45.4215, -75.6972], 'winnipeg': [49.8951, -97.1384],
    'mexico city': [19.4326, -99.1332], 'guadalajara': [20.6597, -103.3496], 'monterrey': [25.6866, -100.3161],
    'sao paulo': [-23.5505, -46.6333], 'rio de janeiro': [-22.9068, -43.1729], 'buenos aires': [-34.6037, -58.3816],
    'bogota': [4.7110, -74.0721], 'lima': [-12.0464, -77.0428], 'santiago': [-33.4489, -70.6693],
    'caracas': [10.4806, -66.9036], 'quito': [-0.1807, -78.4678], 'la paz': [-16.5000, -68.1500],
    'montevideo': [-34.9011, -56.1645], 'asuncion': [-25.2867, -57.6470], 'havana': [23.1136, -82.3666],
    'panama city': [8.9824, -79.5199], 'san jose (cr)': [9.9281, -84.0907], 'guatemala city': [14.6349, -90.5069],
    'kingston': [17.9714, -76.7936], 'port of spain': [10.6549, -61.5019],

    // Oceania
    'sydney': [-33.8688, 151.2093], 'melbourne': [-37.8136, 144.9631], 'brisbane': [-27.4698, 153.0251],
    'perth': [-31.9505, 115.8605], 'adelaide': [-34.9285, 138.6007], 'canberra': [-35.2809, 149.1300],
    'darwin': [-12.4634, 130.8456], 'hobart': [-42.8821, 147.3272], 'auckland': [-36.8485, 174.7633],
    'wellington': [-41.2865, 174.7762], 'christchurch': [-43.5321, 172.6362], 'gold coast': [-28.0167, 153.4000],
    'newcastle (au)': [-32.9283, 151.7817], 'sunshine coast': [-26.6500, 153.0667],
    'suva': [-18.1416, 178.4419], 'port moresby': [-9.4438, 147.1803], 'noumea': [-22.2763, 166.4572],
  };

  /* ─── Geocode a string globally ─── */
  function resolveCoords(locationStr) {
    if (!locationStr) return null;
    const key = locationStr.trim().toLowerCase().replace(/\s+/g, ' ');
    if (WORLD_COORDS[key]) return [...WORLD_COORDS[key]];
    // Try partial match
    for (const [k, v] of Object.entries(WORLD_COORDS)) {
      if (key.includes(k) || k.includes(key)) return [...v];
    }
    // Delegate to admin's geocode() if available
    if (typeof geocode === 'function') {
      const r = geocode(locationStr);
      if (r) return r;
    }
    return null;
  }

  /* ─── Build a smooth multi-point route between two lat/lng pairs ─── */
  function buildRoute(from, to, mode, numPoints) {
    numPoints = numPoints || 120;
    const [lat1, lng1] = from;
    const [lat2, lng2] = to;
    const pts = [];

    if (mode === 'air') {
      // Great-circle arc
      const r1 = lat1 * Math.PI / 180, g1 = lng1 * Math.PI / 180;
      const r2 = lat2 * Math.PI / 180, g2 = lng2 * Math.PI / 180;
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const d = 2 * Math.asin(Math.sqrt(
          Math.pow(Math.sin((r2 - r1) / 2), 2) +
          Math.cos(r1) * Math.cos(r2) * Math.pow(Math.sin((g2 - g1) / 2), 2)
        ));
        if (d < 0.0001) { pts.push([lat1 + t * (lat2 - lat1), lng1 + t * (lng2 - lng1)]); continue; }
        const A = Math.sin((1 - t) * d) / Math.sin(d);
        const B = Math.sin(t * d) / Math.sin(d);
        const x = A * Math.cos(r1) * Math.cos(g1) + B * Math.cos(r2) * Math.cos(g2);
        const y = A * Math.cos(r1) * Math.sin(g1) + B * Math.cos(r2) * Math.sin(g2);
        const z = A * Math.sin(r1) + B * Math.sin(r2);
        pts.push([Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, Math.atan2(y, x) * 180 / Math.PI]);
      }
    } else {
      // Road/sea: smooth bezier with intermediate waypoints
      const dlat = lat2 - lat1, dlng = lng2 - lng1;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      const waypoints = [];
      if (dist > 5) {
        waypoints.push([lat1 + dlat * 0.33 + (Math.random() - .5) * 1.2, lng1 + dlng * 0.33 + (Math.random() - .5) * 1.5]);
        waypoints.push([lat1 + dlat * 0.66 + (Math.random() - .5) * 1.2, lng1 + dlng * 0.66 + (Math.random() - .5) * 1.5]);
      } else {
        waypoints.push([lat1 + dlat * 0.5 + (Math.random() - .5) * .5, lng1 + dlng * 0.5 + (Math.random() - .5) * .8]);
      }
      const allPts = [[lat1, lng1], ...waypoints, [lat2, lng2]];
      const segCount = allPts.length - 1;
      const ptsPerSeg = Math.floor(numPoints / segCount);
      for (let s = 0; s < segCount; s++) {
        const a = allPts[s], b = allPts[s + 1];
        const cLat = (a[0] + b[0]) / 2 + (Math.random() - .5) * .5;
        const cLng = (a[1] + b[1]) / 2 + (Math.random() - .5) * .8;
        const n = (s === segCount - 1) ? ptsPerSeg + 1 : ptsPerSeg;
        for (let i = 0; i < n; i++) {
          const t = i / ptsPerSeg;
          pts.push([
            (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cLat + t * t * b[0],
            (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cLng + t * t * b[1],
          ]);
        }
      }
    }
    return pts;
  }

  /* ─── Get live position of a shipment along its route ─── */
  function getLivePosition(shipment) {
    if (!window.SyncEngine) return null;
    // Try SyncEngine's position (set by admin movement engine)
    const lp = SyncEngine.getShipmentPosition(shipment.id || shipment.trackingNumber);
    if (lp) return lp;
    // Fall back to progress-based interpolation
    if (!shipment.origin || !shipment.destination) return null;
    const progress = (shipment.progress || 0) / 100;
    const from = [shipment.origin.lat, shipment.origin.lng];
    const to = [shipment.destination.lat, shipment.destination.lng];
    if (!from[0] || !to[0]) return null;
    return {
      lat: from[0] + (to[0] - from[0]) * progress,
      lng: from[1] + (to[1] - from[1]) * progress,
      progress: shipment.progress || 0,
    };
  }

  /* ════════════════════════════════════════════════════════
     USER TRACKING MAP ENHANCEMENT
     Adds: dashed route line + animated vehicle marker
     Hooks into the existing initAustraliaMap result.
  ════════════════════════════════════════════════════════ */

  // Track per-map animation intervals so they can be cleared
  window._lrUserAnimInterval = null;
  window._lrUserMarker = null;
  window._lrUserRouteLine = null;

  function enhanceUserMap(shipment, leafletMap) {
    if (!leafletMap || typeof L === 'undefined') return;

    // Resolve origin + destination coords (works globally)
    let fromCoords = null, toCoords = null;
    if (shipment.origin) fromCoords = [shipment.origin.lat, shipment.origin.lng];
    if (shipment.destination) toCoords = [shipment.destination.lat, shipment.destination.lng];

    // Try string resolution if coords are missing/zero
    if (!fromCoords || (!fromCoords[0] && !fromCoords[1])) {
      fromCoords = resolveCoords(
        (shipment.origin && (shipment.origin.city || shipment.senderAddress)) ||
        shipment.senderAddress || ''
      );
    }
    if (!toCoords || (!toCoords[0] && !toCoords[1])) {
      toCoords = resolveCoords(
        (shipment.destination && (shipment.destination.city || shipment.receiverAddress)) ||
        shipment.receiverAddress || ''
      );
    }

    if (!fromCoords || !toCoords) return;

    const mode = (shipment.shippingMethod || '').toLowerCase().includes('air') ? 'air' :
      (shipment.shippingMethod || '').toLowerCase().includes('sea') ? 'sea' : 'road';

    // Prefer SyncEngine route (validated, matches current origin/dest) over generating new one.
    // This avoids a route mismatch where live-routes draws a different path than professional-routes.
    let route = null;
    if (window.SyncEngine && SyncEngine.loadRoutes) {
      const stored = SyncEngine.loadRoutes();
      const cached = stored && stored[shipment.id || shipment.trackingNumber];
      if (cached && cached.length > 5) {
        // Validate: cached route endpoints must match current coords within ~2 degrees
        const oD = Math.hypot((cached[0][0]||0)-(fromCoords[0]||0), (cached[0][1]||0)-(fromCoords[1]||0));
        const dD = Math.hypot((cached[cached.length-1][0]||0)-(toCoords[0]||0), (cached[cached.length-1][1]||0)-(toCoords[1]||0));
        if(oD <= 2 && dD <= 2) route = cached;
      }
    }
    // Only build a new route if SyncEngine doesn't have a valid one
    if (!route) route = buildRoute(fromCoords, toCoords, mode, 140);

    // ALWAYS remove old route/marker and animation before drawing new ones.
    // This is the critical cleanup that prevents ghost layers on map re-init.
    if (window._lrUserRouteLine) { try { leafletMap.removeLayer(window._lrUserRouteLine); } catch (e) {} window._lrUserRouteLine = null; }
    if (window._lrUserMarker) { try { leafletMap.removeLayer(window._lrUserMarker); } catch (e) {} window._lrUserMarker = null; }
    clearInterval(window._lrUserAnimInterval);
    window._lrUserAnimInterval = null;

    // Draw dashed full route (origin → destination)
    window._lrUserRouteLine = L.polyline(route, {
      color: '#2563eb', weight: 3, opacity: 0.55,
      dashArray: '10 7', dashOffset: '0', lineJoin: 'round',
    }).addTo(leafletMap);

    // Determine start position
    const progress = (shipment.progress || 0) / 100;
    let routeIdx = Math.min(Math.floor(progress * (route.length - 1)), route.length - 1);

    // If admin movement engine has a live position, use that
    const lp = getLivePosition(shipment);
    if (lp && lp.progress !== undefined) {
      routeIdx = Math.min(Math.floor((lp.progress / 100) * (route.length - 1)), route.length - 1);
    }

    // Create animated vehicle marker
    const modeEmoji = mode === 'air' ? '✈️' : mode === 'sea' ? '🚢' : '🚛';
    const isActive = ['in-transit', 'in_transit', 'picked_up', 'out_for_delivery'].includes(shipment.status);
    const glowColor = isActive ? '#2563eb' : '#6b7280';

    function makeVehicleIcon(lat, lng) {
      return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:36px;height:36px">
          ${isActive ? `<div style="position:absolute;inset:-6px;background:${glowColor}33;border-radius:50%;animation:mapPulse 2s ease-out infinite"></div>` : ''}
          <div style="width:36px;height:36px;background:${glowColor};border:3px solid white;border-radius:50%;box-shadow:0 2px 12px ${glowColor}99;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1">${modeEmoji}</div>
        </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18],
      });
    }

    const startPos = route[routeIdx] || route[0];
    window._lrUserMarker = L.marker(startPos, { icon: makeVehicleIcon(startPos[0], startPos[1]), zIndexOffset: 1000 })
      .addTo(leafletMap)
      .bindPopup(`<div style="font-family:sans-serif;min-width:160px;font-size:12px">
        <strong>${shipment.trackingNumber}</strong><br>
        <span style="color:${glowColor};font-weight:700">${shipment.statusText || shipment.status}</span><br>
        ${modeEmoji} ${shipment.shippingMethod || 'Shipment'}<br>
        <span style="color:#6b7280">Progress: ${shipment.progress || 0}%</span>
      </div>`);

    // Animate along route (only for active statuses)
    if (isActive) {
      // Capture route reference at this point in time — used throughout this closure
      const _capturedRoute = route;
      let idx = routeIdx;
      window._lrUserAnimInterval = setInterval(function () {
        // If the marker was removed (map re-init), stop animation
        if (!window._lrUserMarker) { clearInterval(window._lrUserAnimInterval); return; }

        // Check if admin moved it
        const livePos = getLivePosition(shipment);
        if (livePos && livePos.progress !== undefined) {
          const newIdx = Math.min(Math.floor((livePos.progress / 100) * (_capturedRoute.length - 1)), _capturedRoute.length - 1);
          if (Math.abs(newIdx - idx) > 2) idx = newIdx;
        }
        idx = Math.min(idx + 1, _capturedRoute.length - 1);
        try {
          window._lrUserMarker.setLatLng(_capturedRoute[idx]);
        } catch(e) {
          clearInterval(window._lrUserAnimInterval);
          window._lrUserAnimInterval = null;
          return;
        }
        // Update live location display
        const lld = document.getElementById('live-location-display');
        if (lld) {
          const lat = _capturedRoute[idx][0], lng = _capturedRoute[idx][1];
          let nearest = null, minDist = Infinity;
          for (const [name, coords] of Object.entries(WORLD_COORDS)) {
            const d = Math.sqrt(Math.pow(coords[0] - lat, 2) + Math.pow(coords[1] - lng, 2));
            if (d < minDist) { minDist = d; nearest = name; }
          }
          if (nearest && minDist < 5) {
            lld.textContent = nearest.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
          }
        }
        if (idx >= _capturedRoute.length - 1) {
          clearInterval(window._lrUserAnimInterval);
          window._lrUserAnimInterval = null;
        }
      }, 2000);
    }

    // Fit bounds to include full route
    try {
      leafletMap.fitBounds(L.latLngBounds(route), { padding: [60, 60] });
    } catch (e) {}
  }

  /* ════════════════════════════════════════════════════════
     ADMIN FLEET MAP ENHANCEMENT
     Adds: per-shipment dashed route lines + animated markers
     with real speed from admin movement engine.
  ════════════════════════════════════════════════════════ */

  window._lrAdminRouteLines = [];
  window._lrAdminMarkers = {};
  window._lrAdminInterval = null;

  function clearAdminRouteOverlays(map) {
    window._lrAdminRouteLines.forEach(l => { try { map.removeLayer(l); } catch (e) {} });
    window._lrAdminRouteLines = [];
    Object.values(window._lrAdminMarkers).forEach(m => { try { map.removeLayer(m); } catch (e) {} });
    window._lrAdminMarkers = {};
    clearInterval(window._lrAdminInterval);
  }

  function enhanceAdminFleetMap(ships, map) {
    if (!map || typeof L === 'undefined') return;
    clearAdminRouteOverlays(map);

    const statusColors = {
      in_transit: '#2563eb', in_transit: '#2563eb', in_traffic: '#2563eb',
      'in-transit': '#2563eb', out_for_delivery: '#0891b2', picked_up: '#7c3aed',
      pending: '#d97706', delayed: '#dc2626', delivered: '#059669',
    };

    const activeShips = (ships || []).filter(s =>
      s.status !== 'delivered' && s.origin && s.destination
    );

    activeShips.forEach(function (ship) {
      const mode = ship.transportMode === 'air' ? 'air' : ship.transportMode === 'sea' ? 'sea' : 'road';
      const from = ship.origin && ship.origin.coordinates
        ? ship.origin.coordinates
        : (ship.origin ? resolveCoords(ship.origin.city || '') : null);
      const to = ship.destination && ship.destination.coordinates
        ? ship.destination.coordinates
        : (ship.destination ? resolveCoords(ship.destination.city || '') : null);

      if (!from || !to || (!from[0] && !from[1])) return;

      // Get or generate route
      let route = null;
      if (window.SyncEngine) {
        const routes = SyncEngine.loadRoutes();
        if (routes[ship.id] && routes[ship.id].length > 2) route = routes[ship.id];
      }
      if (!route) route = buildRoute(from, to, mode, 120);

      // Draw dashed route line
      const color = statusColors[ship.status] || '#6b7280';
      const routeLine = L.polyline(route, {
        color: color, weight: 2.5, opacity: 0.45,
        dashArray: '8 6', lineJoin: 'round',
      }).addTo(map);
      window._lrAdminRouteLines.push(routeLine);

      // Get current position
      let routeIdx = 0;
      if (window.SyncEngine) {
        const moveStatesRaw = SyncEngine.loadMoveStates();
        const ms = moveStatesRaw[ship.id];
        if (ms && ms.routeIdx !== undefined) routeIdx = Math.floor(ms.routeIdx);
      } else {
        routeIdx = Math.floor(((ship.progress || 5) / 100) * (route.length - 1));
      }
      routeIdx = Math.min(routeIdx, route.length - 1);

      const isActive = ['in_transit', 'in-transit', 'picked_up', 'out_for_delivery'].includes(ship.status);
      const modeEmoji = mode === 'air' ? '✈️' : mode === 'sea' ? '🚢' : '🚛';

      const vehicleIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:32px;height:32px">
          ${isActive ? `<div style="position:absolute;inset:-8px;background:${color}25;border-radius:50%;animation:mapPulse 2s ease-out infinite"></div>` : ''}
          <div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 12px ${color}99;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1">${modeEmoji}</div>
          <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:${color};color:#fff;font-size:7px;font-weight:700;padding:1px 4px;border-radius:3px;white-space:nowrap;max-width:80px;overflow:hidden">${ship.trackingNumber}</div>
        </div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });

      const startPos = route[routeIdx] || route[0];
      const marker = L.marker(startPos, { icon: vehicleIcon, zIndexOffset: 900 })
        .addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;min-width:190px;font-size:12px;padding:.25rem">
          <strong style="font-size:13px">${ship.trackingNumber}</strong>
          <div style="margin:.3rem 0;padding:.2rem .5rem;background:${color}22;border-radius:4px;color:${color};font-weight:700;font-size:10px;text-transform:uppercase">${(ship.status || '').replace(/_/g, ' ')}</div>
          <div>📦 ${ship.packageName || ship.packageType || '—'}</div>
          <div style="margin-top:.2rem">🗺 ${ship.origin.city || '—'} → ${ship.destination.city || '—'}</div>
          <div style="margin-top:.2rem;color:#6b7280">Mode: ${modeEmoji} ${mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
        </div>`);

      window._lrAdminMarkers[ship.id] = { marker, route, routeIdx };
    });

    // Animate all active markers every 2s, synced with admin movement engine
    window._lrAdminInterval = setInterval(function () {
      Object.entries(window._lrAdminMarkers).forEach(function ([shipId, state]) {
        // Get real position from movement engine
        let newIdx = state.routeIdx;
        if (window.SyncEngine) {
          const moveStatesRaw = SyncEngine.loadMoveStates();
          const ms = moveStatesRaw[shipId];
          if (ms && ms.routeIdx !== undefined) newIdx = Math.floor(ms.routeIdx);
        } else {
          newIdx = Math.min(newIdx + 1, state.route.length - 1);
        }
        state.routeIdx = Math.min(newIdx, state.route.length - 1);
        state.marker.setLatLng(state.route[state.routeIdx]);
      });
    }, 2000);

    // Stop animation when panel changes
    if (map._container) {
      map.once('remove', function () { clearInterval(window._lrAdminInterval); });
    }
  }

  /* ─── Patch initAustraliaMap to call enhanceUserMap after render ─── */
  (function patchUserMap() {
    // Wait for script.js to define initAustraliaMap, then wrap it
    const _patch = function () {
      if (typeof window.initAustraliaMap !== 'function') return;
      if (window._lrPatched) return; // avoid double-patching
      window._lrPatched = true;
      const orig = window.initAustraliaMap;
      window.initAustraliaMap = function (shipment) {
        // CRITICAL: clear live-routes animation and layers BEFORE calling orig.
        // If we don't do this, the old interval fires against a stale map reference
        // after Leaflet destroys it, causing silent errors and ghost markers.
        clearInterval(window._lrUserAnimInterval);
        window._lrUserAnimInterval = null;
        if (window._lrUserMarker) {
          try { if (window.leafletMap) window.leafletMap.removeLayer(window._lrUserMarker); } catch(e) {}
          window._lrUserMarker = null;
        }
        if (window._lrUserRouteLine) {
          try { if (window.leafletMap) window.leafletMap.removeLayer(window._lrUserRouteLine); } catch(e) {}
          window._lrUserRouteLine = null;
        }
        orig.call(this, shipment);
        // Short delay to let Leaflet fully initialize
        setTimeout(function () {
          if (window.leafletMap) {
            enhanceUserMap(shipment, window.leafletMap);
          }
        }, 300);
      };
    };
    // Try immediately, then after DOMContentLoaded
    _patch();
    document.addEventListener('DOMContentLoaded', _patch);
  })();

  /* ─── Patch admin initFleetMap to call enhanceAdminFleetMap ─── */
  (function patchAdminMap() {
    const _patch = function () {
      if (typeof window.initFleetMap !== 'function') return;
      const orig = window.initFleetMap;
      window.initFleetMap = function () {
        orig.call(this);
        setTimeout(function () {
          if (window._adminFleetMap && window.ships) {
            enhanceAdminFleetMap(window.ships, window._adminFleetMap);
          }
        }, 600);
      };
      // Also patch the _adminFleetMap capture
      const origMapInit = window.initFleetMap;
      window._lrPatchedAdminMap = true;
    };
    _patch();
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(_patch, 200);
    });
  })();

  /* ─── Expose API for external use ─── */
  window.LiveRoutes = {
    resolveCoords,
    buildRoute,
    getLivePosition,
    enhanceUserMap,
    enhanceAdminFleetMap,
  };

})();
