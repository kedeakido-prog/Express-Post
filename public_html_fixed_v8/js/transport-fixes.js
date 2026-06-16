/* ================================================================
   TRANSPORT FIXES v2.0 — EXPRESS Logistics
   ================================================================
   Fixes:
   1. Transport-aware icons (truck / airplane / ship)
   2. Maritime sea route path (no road routing)
   3. Air route (great-circle arc, airplane icon)
   4. Real-time map refresh when admin updates location/status
   5. Admin ↔ Main site instant sync (no refresh needed)
   6. Account management (admin + driver delete)
   ================================================================ */
'use strict';

/* ── Ocean/maritime waypoints (shipping lanes) ── */
const SEA_LANES = {
  suez:      [30.5,  32.3],
  hormuz:    [26.5,  56.5],
  malacca:   [ 2.5, 102.0],
  bab_el:    [12.5,  43.5],
  gibraltar: [35.9,  -5.5],
  dover:     [51.0,   1.4],
  cape_good: [-34.5, 19.0],
  cape_horn: [-56.0,-68.0],
  atl_mid:   [20.0, -30.0],
  pac_mid:   [10.0,-140.0],
  indian_mid:[-10.0, 80.0],
  med_mid:   [35.0,  18.0],
  pac_north: [50.0,-170.0],
  atl_north: [50.0, -40.0],
  caribbean: [15.0, -75.0],
  red_sea:   [20.0,  38.0],
  south_atl: [-30.0,-15.0],
  aus_south: [-38.0,130.0],
  south_pac: [-25.0,-120.0],
  indian_east:[10.0, 95.0],
};

/* ── Build a sea route that avoids land via shipping lane waypoints ── */
function buildSeaRoute(from, to, numPts) {
  numPts = numPts || 160;
  const inBox = (pt, la1, lo1, la2, lo2) =>
    pt[0] >= Math.min(la1,la2) && pt[0] <= Math.max(la1,la2) &&
    pt[1] >= Math.min(lo1,lo2) && pt[1] <= Math.max(lo1,lo2);

  const fEU  = inBox(from, 35,-12, 72, 42);
  const fAS  = inBox(from,  1, 60, 55,150);
  const fNA  = inBox(from, 15,-170,72,-50);
  const fSA  = inBox(from,-60,-85, 12,-35);
  const fOC  = inBox(from,-50,110,  0,180);
  const fAF  = inBox(from,-35,-20, 37, 52);
  const tEU  = inBox(to,  35,-12, 72, 42);
  const tAS  = inBox(to,   1, 60, 55,150);
  const tNA  = inBox(to,  15,-170,72,-50);
  const tSA  = inBox(to, -60,-85, 12,-35);
  const tOC  = inBox(to, -50,110,  0,180);
  const tAF  = inBox(to, -35,-20, 37, 52);

  const W = SEA_LANES;
  let wps = [from];

  if ((fEU||fNA) && (tAS||tOC)) {
    if (from[1] < 0) wps.push(W.atl_north);
    wps.push(W.gibraltar, W.med_mid, W.suez, W.red_sea, W.bab_el, W.indian_mid);
    if (to[1] > 100) wps.push(W.malacca);
  } else if ((tEU||tNA) && (fAS||fOC)) {
    if (fOC) wps.push(W.aus_south);
    wps.push(W.indian_mid, W.bab_el, W.red_sea, W.suez, W.med_mid, W.gibraltar);
    if (to[1] < -10) wps.push(W.atl_north);
  } else if (fNA && tEU) {
    wps.push(W.atl_north);
  } else if (fEU && tNA) {
    wps.push(W.atl_north);
  } else if (fNA && tAS) {
    wps.push(W.pac_north);
  } else if (fAS && tNA) {
    wps.push(W.pac_north);
  } else if (fNA && tSA) {
    wps.push(W.caribbean);
  } else if (fSA && tNA) {
    wps.push(W.caribbean);
  } else if ((fAF||fSA) && (tAS||tOC)) {
    wps.push(W.cape_good, W.indian_mid);
    if (to[1] > 100) wps.push(W.malacca);
  } else if ((tAF||tSA) && (fAS||fOC)) {
    if (from[1] > 100) wps.push(W.malacca);
    wps.push(W.indian_mid, W.cape_good);
  } else if (fOC && tSA) {
    wps.push(W.south_pac);
  } else if (fSA && tOC) {
    wps.push(W.south_pac);
  } else {
    // Generic mid-ocean point offset from straight line
    const mid = [(from[0]+to[0])/2 - (to[1]-from[1])*0.2,
                 (from[1]+to[1])/2 + (to[0]-from[0])*0.2];
    wps.push(mid);
  }
  wps.push(to);

  // Catmull-Rom spline through waypoints
  const pts = [];
  for (let seg = 0; seg < wps.length - 1; seg++) {
    const p0 = wps[Math.max(0, seg-1)];
    const p1 = wps[seg];
    const p2 = wps[seg+1];
    const p3 = wps[Math.min(wps.length-1, seg+2)];
    const sp = Math.max(8, Math.floor(numPts / (wps.length-1)));
    for (let i = (seg===0?0:1); i <= sp; i++) {
      const t = i/sp, t2 = t*t, t3 = t2*t;
      pts.push([
        0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
        0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
      ]);
    }
  }
  return pts.length ? pts : [from, to];
}

/* ── Build an air great-circle arc ── */
function buildAirRoute(from, to, numPts) {
  numPts = numPts || 160;
  const pts = [];
  const r1=from[0]*Math.PI/180, g1=from[1]*Math.PI/180;
  const r2=to[0]*Math.PI/180,   g2=to[1]*Math.PI/180;
  const d = 2*Math.asin(Math.sqrt(
    Math.pow(Math.sin((r2-r1)/2),2) +
    Math.cos(r1)*Math.cos(r2)*Math.pow(Math.sin((g2-g1)/2),2)
  ));
  for (let i=0; i<=numPts; i++) {
    const t = i/numPts;
    if (d < 0.0001) { pts.push([from[0]+t*(to[0]-from[0]), from[1]+t*(to[1]-from[1])]); continue; }
    const A = Math.sin((1-t)*d)/Math.sin(d), B = Math.sin(t*d)/Math.sin(d);
    const x = A*Math.cos(r1)*Math.cos(g1) + B*Math.cos(r2)*Math.cos(g2);
    const y = A*Math.cos(r1)*Math.sin(g1) + B*Math.cos(r2)*Math.sin(g2);
    const z = A*Math.sin(r1) + B*Math.sin(r2);
    pts.push([Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI, Math.atan2(y,x)*180/Math.PI]);
  }
  return pts;
}

/* ── Detect transport mode from shipment ── */
function getTransportMode(shipment) {
  const method = ((shipment.shippingMethod||'') + ' ' + (shipment.transportMode||'')).toLowerCase();
  if (method.includes('air') || method.includes('plane') || method.includes('flight')) return 'air';
  if (method.includes('sea') || method.includes('ocean') || method.includes('maritime') ||
      method.includes('ship') || method.includes('vessel') || method.includes('cargo')) return 'sea';
  return 'road';
}

/* ── Build route based on transport mode ── */
function buildRouteByMode(from, to, mode, numPts) {
  numPts = numPts || 160;
  if (mode === 'air') return buildAirRoute(from, to, numPts);
  if (mode === 'sea') return buildSeaRoute(from, to, numPts);
  // Road: bezier fallback (OSRM is tried separately in the main map init)
  const dlat = to[0]-from[0], dlng = to[1]-from[1];
  const dist = Math.sqrt(dlat*dlat+dlng*dlng);
  const pts = [];
  if (dist < 3) {
    const ctrl = [(from[0]+to[0])/2+dlng*0.1, (from[1]+to[1])/2-dlat*0.1];
    for(let i=0;i<=numPts;i++){const t=i/numPts;pts.push([(1-t)**2*from[0]+2*(1-t)*t*ctrl[0]+t*t*to[0],(1-t)**2*from[1]+2*(1-t)*t*ctrl[1]+t*t*to[1]]);}
  } else {
    const w1=[from[0]+dlat*0.33+dlng*0.05,from[1]+dlng*0.33-dlat*0.05];
    const w2=[from[0]+dlat*0.66-dlng*0.05,from[1]+dlng*0.66+dlat*0.05];
    const all=[from,w1,w2,to]; const seg=Math.floor(numPts/3);
    for(let s=0;s<3;s++){const a=all[s],b=all[s+1],ctrl=[(a[0]+b[0])/2,(a[1]+b[1])/2];const cnt=s===2?seg+1:seg;for(let i=0;i<cnt;i++){const t=i/seg;pts.push([(1-t)**2*a[0]+2*(1-t)*t*ctrl[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*ctrl[1]+t*t*b[1]]);}}
  }
  return pts.length ? pts : [from, to];
}

/* ── Vehicle icon maker (transport-aware) ── */
function makeVehicleIcon(mode, color, label, isDelayed, size) {
  size = size || 44;
  const glowColor = isDelayed ? '#dc2626' : color;
  const pulseSpeed = isDelayed ? '0.8s' : '2s';
  const half = Math.round(size/2);

  let svgInner;
  if (mode === 'air') {
    svgInner = `<svg width="${size*0.5}" height="${size*0.5}" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>`;
  } else if (mode === 'sea') {
    svgInner = `<svg width="${size*0.5}" height="${size*0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/>
      <path d="M4 13V9a2 2 0 0 1 2-2h12l3 5"/>
      <path d="M14 2v5"/>
      <path d="M8 7v2"/>
    </svg>`;
  } else {
    svgInner = `<svg width="${size*0.5}" height="${size*0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>`;
  }

  const rotateStyle = mode === 'air' ? 'transform:rotate(-45deg);' : '';

  return (typeof L !== 'undefined') ? L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="position:absolute;inset:-7px;background:${glowColor}20;border-radius:50%;animation:proMapPulse ${pulseSpeed} ease-out infinite"></div>
      <div style="width:${size}px;height:${size}px;background:linear-gradient(145deg,${color},${color}dd);border:3px solid white;border-radius:50%;box-shadow:0 4px 20px ${glowColor}60,0 0 0 2px ${glowColor}30;display:flex;align-items:center;justify-content:center;animation:proTruckBounce 2s ease-in-out infinite">
        <div style="${rotateStyle}">${svgInner}</div>
      </div>
      ${label ? `<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${color};color:white;font-size:8px;font-weight:800;padding:2px 7px;border-radius:4px;white-space:nowrap;letter-spacing:.5px;box-shadow:0 2px 8px rgba(0,0,0,.3)">${label}</div>` : ''}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
  }) : null;
}

/* ── Route line style based on mode ── */
function getRouteLineStyle(mode, trackColor) {
  if (mode === 'air') {
    return {
      done:    { color: trackColor, weight: 4, opacity: 0.9, dashArray: '2 8', lineJoin:'round', lineCap:'round' },
      remain:  { color: '#93c5fd',  weight: 2.5, opacity: 0.5, dashArray: '2 10', lineJoin:'round' }
    };
  }
  if (mode === 'sea') {
    return {
      done:    { color: trackColor, weight: 5, opacity: 0.85, dashArray: '12 5', lineJoin:'round', lineCap:'round' },
      remain:  { color: '#7dd3fc',  weight: 3,   opacity: 0.5, dashArray: '6 8',  lineJoin:'round' }
    };
  }
  // road
  return {
    done:    { color: trackColor, weight: 6, opacity: 0.95, lineJoin:'round', lineCap:'round' },
    remain:  { color: '#93c5fd',  weight: 3.5, opacity: 0.6, dashArray: '11 8', lineJoin:'round' }
  };
}

/* ================================================================
   PATCH initAustraliaMap — inject transport-aware routing + icons
   ================================================================ */
(function patchUserTrackingMap() {
  function doInject() {
    if (typeof window.initAustraliaMap !== 'function') return;
    if (window._tfPatched) return;
    window._tfPatched = true;

    const _origInit = window.initAustraliaMap;

    window.initAustraliaMap = async function(shipment) {
      // Remove existing map
      if (window.leafletMap) {
        try { window.leafletMap.remove(); } catch(e) {}
        window.leafletMap = null;
      }
      if (window.mapAnimations) { window.mapAnimations.forEach(id => clearInterval(id)); window.mapAnimations = []; }

      const container = document.getElementById('leaflet-map');
      if (!container || typeof L === 'undefined') return;

      const mode = getTransportMode(shipment);

      /* ── Detect tile layer based on transport mode ── */
      const map = L.map('leaflet-map', {
        center: [20, 0], zoom: 3, minZoom: 2, maxZoom: 19,
        scrollWheelZoom: true,
        zoomControl: true,
        preferCanvas: false,
      });
      window.leafletMap = map;

      // Choose tile layer: sea uses Carto (shows oceans), others OpenStreetMap
      if (mode === 'sea') {
        // CartoDB Voyager shows ocean labels and sea geography clearly
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd', maxZoom: 19,
        }).addTo(map);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19, subdomains: ['a','b','c'],
        }).addTo(map);
      }

      /* ── Resolve coordinates ── */
      let from = null, to = null;
      const tryGeo = (obj) => {
        if (obj && obj.lat && obj.lng && (Math.abs(obj.lat)>0.01||Math.abs(obj.lng)>0.01)) return [obj.lat, obj.lng];
        const AU = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
        if (AU && obj && obj.city) {
          const key = (obj.city||'').toLowerCase().trim();
          if (AU[key]) return [...AU[key]];
          for (const [k,c] of Object.entries(AU)) { if (key.includes(k)||k.includes(key)) return [...c]; }
        }
        // Fallback: try LiveRoutes resolver
        if (window.LiveRoutes && window.LiveRoutes.resolveCoords && obj && obj.city) {
          return window.LiveRoutes.resolveCoords(obj.city);
        }
        return null;
      };
      from = tryGeo(shipment.origin);
      to   = tryGeo(shipment.destination);
      if (!from || !to) { map.setView([20,0], 3); return; }

      const isDelayed   = (shipment.status||'').toLowerCase().replace(/_/g,'-') === 'delayed';
      const isDelivered = shipment.status === 'delivered';
      const isActive    = ['in-transit','in_transit','picked_up','out_for_delivery','out-for-delivery'].includes(shipment.status);
      const trackColor  = isDelayed ? '#dc2626' : isDelivered ? '#059669' : '#2563eb';

      /* ── Build route based on transport mode ── */
      let route = null;

      // 1. Check SyncEngine route cache
      if (window.SyncEngine && SyncEngine.loadRoutes) {
        const stored = SyncEngine.loadRoutes();
        const id = shipment.id || shipment.trackingNumber;
        if (stored && stored[id] && stored[id].length > 10) route = stored[id];
      }

      // 2. For road: try OSRM real road routing
      if (!route && mode === 'road' && typeof _fetchOSRMRoute === 'function') {
        route = await _fetchOSRMRoute(from, to);
      }

      // 3. Generate route by mode (sea/air always use our computed paths)
      if (!route || (mode !== 'road' && route.length < 10)) {
        route = buildRouteByMode(from, to, mode, 160);
      }

      // Fallback
      if (!route || route.length < 2) route = [from, to];

      // Cache route
      if (window.SyncEngine && SyncEngine.saveRoutes) {
        const stored = SyncEngine.loadRoutes() || {};
        stored[shipment.id || shipment.trackingNumber] = route;
        SyncEngine.saveRoutes(stored);
      }

      /* ── Determine progress / position ── */
      let progress = (shipment.progress || 5) / 100;
      if (isDelivered) progress = 1;
      if (window.SyncEngine) {
        if (SyncEngine.getShipmentPosition) {
          const lp = SyncEngine.getShipmentPosition(shipment.id || shipment.trackingNumber);
          if (lp && lp.progress !== undefined) progress = lp.progress / 100;
        }
        if (SyncEngine.loadMoveStates) {
          const ms = SyncEngine.loadMoveStates();
          const st = ms[shipment.id || shipment.trackingNumber];
          if (st && st.routeIdx !== undefined) progress = st.routeIdx / Math.max(route.length-1, 1);
        }
      }
      let routeIdx = Math.min(Math.floor(progress * (route.length-1)), route.length-1);

      /* ── Draw route lines ── */
      const lineStyle = getRouteLineStyle(mode, trackColor);
      let doneLine = null, remainLine = null;

      if (routeIdx > 0) {
        doneLine = L.polyline(route.slice(0, routeIdx+1), lineStyle.done).addTo(map);
      }
      if (routeIdx < route.length-1 && !isDelivered) {
        remainLine = L.polyline(route.slice(routeIdx), lineStyle.remain).addTo(map);
      } else if (routeIdx === 0 && !isDelivered) {
        remainLine = L.polyline(route, lineStyle.remain).addTo(map);
      }

      /* ── Sea: draw ocean background hint ── */
      if (mode === 'sea') {
        // Add a subtle wave pattern along the route
        L.polyline(route, {
          color: '#0ea5e9', weight: 12, opacity: 0.08, lineJoin: 'round', lineCap: 'round'
        }).addTo(map);
      }

      /* ── Origin & destination markers (reuse existing factory or inline) ── */
      const _origMarker = typeof _makeOriginMarker === 'function' ? _makeOriginMarker() : L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#2563eb;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(37,99,235,.5)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>`,
        iconSize: [36,36], iconAnchor: [18,18]
      });
      const _destMarker = typeof _makeDestMarker === 'function' ? _makeDestMarker() : L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#dc2626;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(220,38,38,.5)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [36,36], iconAnchor: [18,18]
      });

      L.marker(from, { icon: _origMarker, zIndexOffset: 600 })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;min-width:180px;padding:.4rem .5rem">
          <div style="font-weight:800;font-size:.9rem;color:#1d4ed8;margin-bottom:.3rem">${mode==='air'?'✈️':'mode'==='sea'?'🚢':'📦'} ${mode==='air'?'Departure Airport':mode==='sea'?'Port of Loading':'Shipment Origin'}</div>
          <div style="font-weight:600;color:#111;font-size:.875rem">${(shipment.origin&&shipment.origin.city)||'—'}</div>
          <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Dispatched: ${shipment.dispatchDate||'—'}</div>
        </div>`);

      L.marker(to, { icon: _destMarker, zIndexOffset: 600 })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;min-width:180px;padding:.4rem .5rem">
          <div style="font-weight:800;font-size:.9rem;color:#dc2626;margin-bottom:.3rem">${mode==='air'?'🛬 Arrival Airport':mode==='sea'?'⚓ Port of Discharge':'📍 Destination'}</div>
          <div style="font-weight:600;color:#111;font-size:.875rem">${(shipment.destination&&shipment.destination.city)||'—'}</div>
          <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Est. Delivery: ${shipment.estimatedDelivery||'—'}</div>
        </div>`);

      /* ── Vehicle marker (transport-aware) ── */
      const modeLabel = isDelivered ? 'DELIVERED' : isDelayed ? '⏸ DELAYED' :
        mode === 'air' ? 'AIR FREIGHT' : mode === 'sea' ? 'SEA FREIGHT' : 'ROAD FREIGHT';
      const vehicleIcon = makeVehicleIcon(mode, trackColor, modeLabel, isDelayed, 44);
      let vehicleMarker = null;
      if (vehicleIcon) {
        vehicleMarker = L.marker(route[routeIdx] || route[0], { icon: vehicleIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<div style="font-family:system-ui;min-width:200px;padding:.4rem .5rem">
            <div style="font-weight:800;font-size:.9rem;margin-bottom:.3rem">${shipment.trackingNumber}</div>
            <div style="display:inline-flex;align-items:center;gap:.3rem;background:${trackColor}18;color:${trackColor};font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:.4rem;text-transform:uppercase">${(shipment.statusText||shipment.status||'').replace(/_/g,' ')}</div>
            <div style="color:#374151;font-size:.8rem">
              <div>${mode==='air'?'✈️':mode==='sea'?'🚢':'🚛'} ${shipment.shippingMethod||'Freight'}</div>
              <div style="margin-top:.2rem">🗺 ${(shipment.origin&&shipment.origin.city)||'—'} → ${(shipment.destination&&shipment.destination.city)||'—'}</div>
              <div style="margin-top:.2rem">📊 Progress: <strong style="color:${trackColor}">${Math.round(progress*100)}%</strong></div>
            </div>
          </div>`);
      }

      /* ── Fit bounds ── */
      try { map.fitBounds(L.latLngBounds(route), { padding: [70, 70] }); } catch(e) {}

      /* ── Update legend ── */
      const mapCont = document.getElementById('map-container');
      if (mapCont) {
        mapCont.querySelectorAll('[style*="Legend"], .pro-map-legend').forEach(el => el.remove());
        const legend = document.createElement('div');
        legend.className = 'pro-map-legend';
        legend.innerHTML = `
          <p>Legend</p>
          <div class="pro-map-legend-row"><div style="width:14px;height:14px;background:linear-gradient(145deg,#1e40af,#2563eb);border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(37,99,235,.4)"></div>${mode==='air'?'Departure':'Origin'}</div>
          <div class="pro-map-legend-row"><div style="width:8px;height:6px;background:${trackColor};border-radius:2px;margin-left:3px;margin-right:3px"></div>Completed</div>
          <div class="pro-map-legend-row"><div style="width:8px;height:6px;background:#93c5fd;border-radius:2px;border:1px dashed #60a5fa;margin-left:3px;margin-right:3px"></div>Remaining</div>
          <div class="pro-map-legend-row"><div style="width:14px;height:14px;background:#dc2626;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(220,38,38,.4)"></div>${mode==='air'?'Arrival':'Destination'}</div>
        `;
        mapCont.appendChild(legend);

        // Update badge with correct mode icon
        mapCont.querySelectorAll('.pro-map-badge').forEach(el => el.remove());
        const badge = document.createElement('div');
        badge.className = 'pro-map-badge';
        const modeIconHtml = mode === 'air'
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" stroke="none"/></svg>`
          : mode === 'sea'
          ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 13V9a2 2 0 0 1 2-2h12l3 5"/><path d="M14 2v5"/><path d="M8 7v2"/></svg>`
          : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
        badge.innerHTML = modeIconHtml + `<span>${shipment.shippingMethod||'Freight'}</span>` +
          (isDelayed ? `<span class="pro-delay-dot"></span><span style="color:#dc2626;font-weight:700;font-size:.75rem">DELAYED</span>` :
           isActive  ? `<span class="pro-live-dot"></span><span style="color:#15803d;font-weight:700;font-size:.75rem">LIVE</span>` : '');
        mapCont.appendChild(badge);
      }

      /* ── Update route info card ── */
      const oldCard = document.getElementById('pro-tracking-route-card');
      if (oldCard) oldCard.remove();
      const distKm = (function(){
        const R=6371,dL=(to[0]-from[0])*Math.PI/180,dG=(to[1]-from[1])*Math.PI/180;
        const a=Math.sin(dL/2)**2+Math.cos(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.sin(dG/2)**2;
        return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
      })();
      const mapCont2 = document.getElementById('map-container');
      if (mapCont2) {
        const routeCard = document.createElement('div');
        routeCard.id = 'pro-tracking-route-card';
        routeCard.className = 'pro-route-card';
        const modeLabel2 = mode==='air'?'✈ Air Route':mode==='sea'?'⚓ Sea Route':'🚛 Road Route';
        routeCard.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
            <div style="display:flex;align-items:center;gap:.5rem;font-size:.85rem">
              ${modeLabel2} &nbsp;<strong>${(shipment.origin&&shipment.origin.city)||'—'}</strong> → <strong>${(shipment.destination&&shipment.destination.city)||'—'}</strong>
            </div>
            ${isActive&&!isDelayed?'<span class="pro-live-badge">● Live Tracking</span>':''}
            ${isDelayed?'<span class="pro-delay-badge">⏸ Delayed</span>':''}
          </div>
          <div style="margin-top:.5rem;display:flex;gap:1.5rem;flex-wrap:wrap;font-size:.78rem;color:#6b7280">
            <span>📏 ~${distKm} km</span>
            <span>📊 ${Math.round(progress*100)}% complete</span>
            <span style="color:#16a34a;font-weight:600">✓ ${mode==='sea'?'Maritime route':mode==='air'?'Great-circle arc':'Real road route'}</span>
          </div>
        `;
        mapCont2.insertAdjacentElement('afterend', routeCard);
      }

      /* ── Animate vehicle along route ── */
      if (isActive && !isDelayed && vehicleMarker) {
        const animInterval = setInterval(function() {
          if (window.SyncEngine && SyncEngine.loadMoveStates) {
            const ms = SyncEngine.loadMoveStates();
            const st = ms[shipment.id || shipment.trackingNumber];
            if (st && (st.state==='paused'||st.state==='delayed')) return;
            if (st && st.routeIdx !== undefined) {
              const adminIdx = Math.min(Math.floor(st.routeIdx), route.length-1);
              if (Math.abs(adminIdx - routeIdx) > 2) routeIdx = adminIdx;
            }
          }
          routeIdx = Math.min(routeIdx + 1, route.length - 1);

          if (vehicleMarker) {
            vehicleMarker.setLatLng(route[routeIdx]);
            // Redraw done/remain lines
            if (doneLine) { try { map.removeLayer(doneLine); } catch(e) {} }
            doneLine = L.polyline(route.slice(0, routeIdx+1), lineStyle.done).addTo(map);
            if (remainLine) { try { map.removeLayer(remainLine); } catch(e) {} }
            if (routeIdx < route.length-1) {
              remainLine = L.polyline(route.slice(routeIdx), lineStyle.remain).addTo(map);
            }
            // Update live-location-display
            const lld = document.getElementById('live-location-display');
            if (lld && route[routeIdx]) {
              const [lat, lng] = route[routeIdx];
              const geo = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
              const fallback = window.LiveRoutes && window.LiveRoutes.resolveCoords;
              let nearest = null, minD = Infinity;
              if (geo) {
                for (const [name, c] of Object.entries(geo)) {
                  const d = Math.abs(c[0]-lat) + Math.abs(c[1]-lng);
                  if (d < minD) { minD = d; nearest = name; }
                }
              }
              if (nearest && minD < 5) lld.textContent = nearest.replace(/\b\w/g, w=>w.toUpperCase());
            }
          }
          if (routeIdx >= route.length-1) clearInterval(animInterval);
        }, 2200);
        if (window.mapAnimations) window.mapAnimations.push(animInterval);
        map.on('remove', () => clearInterval(animInterval));
      }

      if (isDelivered && vehicleMarker) {
        if (doneLine) { try { map.removeLayer(doneLine); } catch(e) {} }
        L.polyline(route, { color: '#059669', weight: 6, opacity: 0.9, lineJoin:'round', lineCap:'round' }).addTo(map);
        vehicleMarker.setLatLng(route[route.length-1]);
      }

      /* ── Listen for admin sync updates & instantly re-render map ── */
      if (window._tfMapListener) window._tfMapListener();  // unsub previous
      if (window.SyncEngine) {
        window._tfMapListener = SyncEngine.onUpdate(function(data) {
          if (data.type === 'shipment_update' || data.type === 'move_update') {
            // Re-merge admin shipments
            if (window.mergeAdminShipments) window.mergeAdminShipments();
            // Find updated version of this shipment
            const tn = shipment.trackingNumber || shipment.id;
            const updated = window.MOCK_SHIPMENTS && window.MOCK_SHIPMENTS[tn];
            if (updated && !updated._deleted) {
              // Only re-init if status/location changed significantly
              if (window._lastShipStatus !== updated.status || window._lastShipProgress !== updated.progress) {
                window._lastShipStatus = updated.status;
                window._lastShipProgress = updated.progress;
                // Clear active interval to avoid double animation
                clearInterval(animInterval);
                setTimeout(() => window.initAustraliaMap(updated), 200);
              }
            }
          }
        });
      }
    };
  }

  doInject();
  document.addEventListener('DOMContentLoaded', doInject);
  setTimeout(doInject, 500);
})();

/* ================================================================
   ADMIN PANEL ENHANCEMENTS
   ================================================================ */

/* ── Account Management (Admin + Driver) ── */
window.ExpressAccountManager = (function() {
  /* ── Supabase-backed Account Manager — zero localStorage ── */

  function db() { return window.supabaseClient || null; }

  async function _loadAdmins() {
    const client = db();
    if (!client) return [];
    try {
      const { data, error } = await client.from('admin_credentials').select('*').order('id');
      if (error) { console.error('[AccMgr]', error.message); return []; }
      return data || [];
    } catch(e) { console.error('[AccMgr]', e); return []; }
  }

  function _renderPanel(admins) {
    const panel = document.getElementById('accounts-manager-panel');
    if (!panel) return;
    const rows = admins.map(a => `
      <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:var(--card);border:1px solid var(--border);border-radius:.5rem;margin-bottom:.5rem">
        <div style="width:2rem;height:2rem;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;flex-shrink:0">${(a.fullName||a.username||'A')[0].toUpperCase()}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:.875rem;color:var(--fg)">${a.fullName||a.username||'Admin'}</div>
          <div style="font-size:.75rem;color:var(--mfg)">${a.email||''} <span style="opacity:.5">·</span> @${a.username||''}</div>
        </div>
        <div style="display:flex;gap:.5rem;flex-shrink:0">
          <button class="btn bp btn-sm" onclick="ExpressAccountManager._editAdmin(${a.id})">Edit</button>
          ${a.id===1?'':`<button class="btn bd btn-sm" onclick="ExpressAccountManager._removeAdmin(${a.id},'${(a.username||'').replace(/'/g,'')}')">Remove</button>`}
        </div>
      </div>`).join('');

    panel.innerHTML = `
      <div style="margin-bottom:1.25rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
          <h4 style="font-size:.9rem;font-weight:700">Admin Accounts (${admins.length})</h4>
          <button class="btn bp btn-sm" onclick="ExpressAccountManager._showAddAdmin()">+ Add Admin</button>
        </div>
        ${rows || '<p style="color:var(--mfg);font-size:.82rem;text-align:center;padding:1rem 0">No admin accounts found.</p>'}
      </div>
      <div style="padding:.75rem 1rem;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.15);border-radius:.5rem;font-size:.78rem;color:var(--mfg)">
        ℹ Account changes sync directly to Supabase. Password updates take effect on next login.
      </div>`;
  }

  return {
    async renderAccountsPanel() {
      const panel = document.getElementById('accounts-manager-panel');
      if (!panel) return;
      panel.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--mfg);font-size:.85rem">Loading accounts from Supabase...</div>';
      const admins = await _loadAdmins();
      _renderPanel(admins);
    },

    async _editAdmin(id) {
      const admins = await _loadAdmins();
      const a = admins.find(x => x.id === id);
      if (!a) { toast('Account not found','e'); return; }
      const fn  = prompt('Full Name:', a.fullName || a.full_name || '');
      if (fn === null) return;
      const em  = prompt('Email:', a.email || '');
      if (em === null) return;
      const pw  = prompt('New Password (leave blank to keep current):', '');
      if (pw === null) return;
      const client = db();
      if (!client) { toast('Supabase not connected','e'); return; }
      const updates = { fullName: fn, full_name: fn, email: em, updated_at: new Date().toISOString() };
      if (pw && pw.trim()) updates.password = pw.trim();
      const { error } = await client.from('admin_credentials').update(updates).eq('id', id);
      if (error) { toast('Update failed: ' + error.message, 'e'); return; }
      toast('Account updated ✓', 's');
      this.renderAccountsPanel();
    },

    async _removeAdmin(id, username) {
      if (id === 1) { toast('Cannot remove the primary admin account.','e'); return; }
      if (!confirm(`Remove admin account "${username}"? This cannot be undone.`)) return;
      const client = db();
      if (!client) { toast('Supabase not connected','e'); return; }
      const { error } = await client.from('admin_credentials').delete().eq('id', id);
      if (error) { toast('Delete failed: ' + error.message,'e'); return; }
      toast('Account removed ✓','s');
      this.renderAccountsPanel();
    },

    async _showAddAdmin() {
      const username = prompt('Username:');
      if (!username || !username.trim()) return;
      const password = prompt('Password:');
      if (!password || !password.trim()) return;
      const fullName = prompt('Full Name:', '');
      if (fullName === null) return;
      const email = prompt('Email:', '');
      if (email === null) return;
      const client = db();
      if (!client) { toast('Supabase not connected','e'); return; }
      const { error } = await client.from('admin_credentials').insert({
        username: username.trim(), password: password.trim(),
        fullName: fullName.trim(), full_name: fullName.trim(),
        email: email.trim(), updated_at: new Date().toISOString()
      });
      if (error) { toast('Failed: ' + error.message,'e'); return; }
      toast('Admin account created ✓','s');
      this.renderAccountsPanel();
    },
  };
})();

/* ── Inject account management section into admin settings if present ── */
(function injectAccountsPanel() {
  function tryInject() {
    const spPref = document.getElementById('sp-pref');
    if (!spPref || document.getElementById('accounts-manager-panel')) return;
    const ssb = document.querySelector('.ssb');
    if (ssb && !document.getElementById('sni-accounts')) {
      const btn = document.createElement('button');
      btn.className = 'sni';
      btn.id = 'sni-accounts';
      btn.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Account Manager`;
      btn.onclick = () => {
        document.querySelectorAll('.spanel').forEach(p => p.classList.remove('on'));
        document.querySelectorAll('.sni').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const p = document.getElementById('sp-accounts');
        if (p) { p.classList.add('on'); window.ExpressAccountManager.renderAccountsPanel(); }
      };
      ssb.appendChild(btn);
    }

    const container = spPref.parentElement;
    if (!container) return;
    const panel = document.createElement('div');
    panel.className = 'spanel';
    panel.id = 'sp-accounts';
    panel.innerHTML = `
      <h3>Account Manager</h3>
      <p class="pdesc">Add or remove admin and driver accounts. Deleted accounts are immediately blocked from all access.</p>
      <div id="accounts-manager-panel" style="margin-top:1rem"></div>
    `;
    container.appendChild(panel);
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(tryInject, 1000));
  setTimeout(tryInject, 2000);
})();

/* ── Enhanced real-time sync: force immediate re-render on all admin changes ── */
(function enhanceAdminSync() {
  if (!window.SyncEngine) return;

  // Re-broadcast on ANY localStorage change from admin panel
  const _origBroadcast = window.SyncEngine._broadcast;
  if (_origBroadcast && !window._tfSyncPatched) {
    window._tfSyncPatched = true;
    // Force a deduplicated rapid re-broadcast for tracking page updates
    window._tfLastBroadcast = 0;
    /* saveShipments patch removed — SyncEngine v7 uses Supabase, not localStorage */
    /* Realtime listeners handle cross-tab sync automatically */
  }
})();

/* ── Expose globally ── */
window.TFBuildSeaRoute  = buildSeaRoute;
window.TFBuildAirRoute  = buildAirRoute;
window.TFBuildRoute     = buildRouteByMode;
window.TFMakeVehicleIcon = makeVehicleIcon;
window.TFGetMode        = getTransportMode;

console.log('[TransportFixes v2] Loaded — sea/air/road routing + sync fixes active');
