/* ================================================================
   EXPRESS POST AUSTRALIA — Supabase Sync Engine v8
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - Zero localStorage for data
   - Supabase Realtime subscriptions for all tables
   - BroadcastChannel for same-browser cross-tab sync
   - Used by BOTH admin panel and main website
   ================================================================ */
'use strict';

/* ── BroadcastChannel for cross-tab instant sync ── */
let _bc = null;
function getBroadcast() {
  if (!_bc) { try { _bc = new BroadcastChannel('epa_realtime_v8'); } catch(e) {} }
  return _bc;
}

const _listeners = [];
let _listenersSetup = false;

function _fire(data) {
  _listeners.forEach(fn => { try { fn(data); } catch(e) {} });
}

function _broadcast(msg) {
  const payload = { ...msg, _t: msg._t || Date.now() };
  const bc = getBroadcast();
  if (bc) { try { bc.postMessage(payload); } catch(e) {} }
  _fire(payload);
}

function _setupListeners() {
  if (_listenersSetup) return;
  _listenersSetup = true;
  const bc = getBroadcast();
  if (bc) bc.onmessage = e => _fire(e.data);
}

/* ── Supabase client getter ── */
function db() { return window.supabaseClient || null; }

/* ── In-memory route cache (geometry only) ── */
const _routeCache = {};

/* ── Normalise a Supabase row into a consistent app object ── */
// Safely parse JSONB values — may be string or object from Supabase
function _jp(v) {
  if (!v) return {};
  if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return {}; } }
  return v;
}

function _normalise(row) {
  if (!row) return null;
  if (row.trackingNumber && typeof row.trackingNumber === 'string') return row; // already normalised
  return {
    ...row,
    id:                row.id,
    trackingNumber:    (row.tracking_number || row.trackingNumber || '').toUpperCase() || '—',
    packageName:       row.package_name      || row.packageName      || '—',
    packageType:       row.package_type      || row.packageType      || 'standard',
    transportMode:     row.transport_mode    || row.transportMode    || 'road',
    status:            row.status            || 'pending',
    weight:            row.weight            || 'N/A',
    dimensions:        row.dimensions        || 'N/A',
    estimatedDelivery: row.estimated_delivery|| row.estimatedDelivery|| '',
    delayReason:       row.delay_reason      || row.delayReason      || null,
    delayTimestamp:    row.delay_timestamp   || row.delayTimestamp   || null,
    createdAt:         row.created_at        || row.createdAt        || '',
    // Carry DB progress through — written by admin _syncShipToSupabase
    progress_pct:      typeof row.progress_pct === 'number' ? row.progress_pct : (row.progress_pct ? parseInt(row.progress_pct, 10) : 0),
    sender:            _jp(row.sender)   || {},
    receiver:          _jp(row.receiver) || {},
    // Merge flat columns into JSONB so origin_city always wins over stale JSONB city.
    // This ensures edits to origin/destination cities are reflected after cache refresh.
    origin:            Object.assign({ city: row.origin_city||'—', country:'Australia', coordinates:[0,0] }, _jp(row.origin)||{}, row.origin_city ? { city: row.origin_city } : {}),
    destination:       Object.assign({ city: row.destination_city||'—', country:'Australia', coordinates:[0,0] }, _jp(row.destination)||{}, row.destination_city ? { city: row.destination_city } : {}),
    currentLocation:   (function(){ const cl=_jp(row.current_location||row.currentLocation)||{}; return Object.assign({ city: row.origin_city||'—', country:'Australia', coordinates:[0,0] }, _jp(row.origin)||{}, Object.keys(cl).length ? cl : {}); })(),
    timeline:          row.timeline          || [],
    images:            row.images            || [],
  };
}

/* ════════════════════════════════════════════════════════════════
   SYNCENGINE
   ════════════════════════════════════════════════════════════════ */
const SyncEngine = {

  /* ── SHIPMENTS ── */
  async loadShipmentsAsync() {
    const client = db();
    if (!client) return [];
    const { data, error } = await client
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('[SyncEngine] loadShipments:', error.message); return []; }
    return (data || []).map(_normalise);
  },

  loadShipments() { return window._shipmentCache || []; },

  async saveShipment(ship) {
    const client = db();
    if (!client) return null;
    // Use UPDATE instead of upsert to avoid needing a PK/unique constraint on id
    const { data, error } = await client
      .from('shipments')
      .update(ship)
      .eq('id', ship.id)
      .select()
      .single();
    if (error) { console.error('[SyncEngine] saveShipment:', error.message); return null; }
    await this.refreshShipmentCache();
    _broadcast({ type: 'shipment_update', ts: Date.now() });
    return data;
  },

  async deleteShipment(id) {
    const client = db();
    if (!client) return false;
    // Delete by id OR tracking_number to be safe
    const { error } = await client.from('shipments').delete().eq('id', id);
    if (error) { console.error('[SyncEngine] deleteShipment:', error.message); return false; }
    // Also attempt delete by tracking_number in case id differs
    try { await client.from('shipments').delete().eq('tracking_number', id); } catch(e) {}
    // Remove from all caches immediately
    if (window._shipmentCache) {
      window._shipmentCache = window._shipmentCache.filter(s =>
        s.id !== id && s.trackingNumber !== id && s.tracking_number !== id
      );
    }
    _broadcast({ type: 'shipment_deleted', deletedId: id, ts: Date.now() });
    _broadcast({ type: 'shipment_update', ts: Date.now() });
    return true;
  },

  async refreshShipmentCache() {
    const ships = await this.loadShipmentsAsync();
    // Merge: preserve in-memory currentLocation/status for actively moving shipments
    // so that a Supabase Realtime event doesn't clobber a tick that just ran.
    const moveStates = window._moveStateCache || {};
    const existing   = window._shipmentCache  || [];
    const merged = ships.map(fresh => {
      const ms = moveStates[fresh.id];
      if (ms && ms.state === 'running') {
        const inMem = existing.find(e => e.id === fresh.id);
        if (inMem && inMem.currentLocation && inMem.currentLocation.lat) {
          // Deep-merge: DB row fields update tracking info, but live GPS position is preserved
          if (SyncEngine.safeMergeShipment) {
            return SyncEngine.safeMergeShipment(inMem, fresh);
          }
          return Object.assign({}, fresh, {
            currentLocation: inMem.currentLocation,
            status: inMem.status || fresh.status,
            progress_pct: (inMem.progress !== undefined ? inMem.progress : fresh.progress_pct) || fresh.progress_pct || 0,
          });
        }
      }
      return fresh;
    });
    window._shipmentCache = merged;
    // Also update window.ships used by admin panel
    if (typeof window.ships !== 'undefined') window.ships = merged;
    return merged;
  },

  /* Fast lookup by tracking number — ALWAYS hits DB for cross-device accuracy */
  async lookupByTrackingNumber(tn) {
    if (!tn) return null;
    const normalized = tn.trim().toUpperCase();
    const client = db();

    // Always query DB directly — cache may be stale on other devices
    if (client) {
      try {
        const { data, error } = await client
          .from('shipments')
          .select('*')
          .ilike('tracking_number', normalized)
          .maybeSingle();
        if (!error && data) {
          // Update cache with this fresh result
          if (window._shipmentCache) {
            const idx = window._shipmentCache.findIndex(s =>
              (s.trackingNumber || s.tracking_number || '').toUpperCase() === normalized
            );
            const normalised = _normalise(data);
            if (idx >= 0) window._shipmentCache[idx] = normalised;
            else window._shipmentCache.push(normalised);
          }
          return _normalise(data);
        }
        if (error) console.error('[SyncEngine] lookup:', error.message);
      } catch(e) { console.error('[SyncEngine] lookup error:', e.message); }
    }

    // Fallback to cache only if DB unavailable
    const cache = window._shipmentCache || [];
    const cached = cache.find(s =>
      (s.trackingNumber || '').toUpperCase() === normalized ||
      (s.tracking_number || '').toUpperCase() === normalized
    );
    return cached ? _normalise(cached) : null;
  },

  isDeleted(id) {
    // Only return true if cache is loaded AND doesn't contain the ID
    const cache = window._shipmentCache;
    if (!cache || cache.length === 0) return false; // unknown, assume not deleted
    return !cache.some(s =>
      s.id === id || s.trackingNumber === id ||
      (s.tracking_number || '').toUpperCase() === (id || '').toUpperCase()
    );
  },

  /* ── MOVEMENT STATES ── */
  loadMoveStates() { return window._moveStateCache || {}; },
  saveMoveStates(states) {
    window._moveStateCache = states;
    _broadcast({ type: 'move_update', ts: Date.now() });
  },

  /* ── ROUTES (in-memory geometry) ── */
  loadRoutes()  { return _routeCache; },
  saveRoutes(r) {
    // Merge incoming routes — honour explicit undefined/null values as deletions
    Object.keys(r).forEach(k => {
      if(r[k] === null || r[k] === undefined || (Array.isArray(r[k]) && r[k].length === 0)){
        delete _routeCache[k];
      } else {
        _routeCache[k] = r[k];
      }
    });
  },
  deleteRoute(shipId) { delete _routeCache[shipId]; },

  getShipmentPosition(shipId) {
    const states = this.loadMoveStates();
    const ms = states[shipId];
    const route = _routeCache[shipId];
    if (!ms || !route || route.length === 0) return null;
    const idx = Math.min(Math.floor(ms.routeIdx || 0), route.length - 1);
    const lat = route[idx][0];
    const lng = route[idx][1];
    const progress = route.length > 1 ? Math.round((idx / (route.length - 1)) * 100) : 0;

    // Resolve nearest city name from AU_GEO
    let city = '';
    const AU = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
    if (AU) {
      let minD = Infinity;
      for (const [name, coords] of Object.entries(AU)) {
        const d = Math.hypot(coords[0]-lat, coords[1]-lng);
        if (d < minD) { minD = d; city = name; }
      }
      if (city) city = city.replace(/\w/g, w => w.toUpperCase());
    }

    return { lat, lng, progress, city };
  },

  /* ── QUOTE REQUESTS ── */
  async loadQuoteRequestsAsync() {
    const client = db();
    if (!client) return [];
    const { data, error } = await client
      .from('quote_requests').select('*').order('submitted_at', { ascending: false });
    if (error) { console.error('[SyncEngine] loadQuotes:', error.message); return []; }
    return data || [];
  },
  loadQuoteRequests() { return window._quoteCache || []; },

  async submitQuoteRequest(formData) {
    const client = db();
    const record = {
      id: 'QR' + Date.now(),
      name: formData.name || '', email: formData.email || '',
      phone: formData.phone || '', subject: formData.subject || 'General Enquiry',
      message: formData.message || '', from_city: formData.fromCity || '',
      to_city: formData.toCity || '', weight: formData.weight || '',
      source: 'website', status: 'new', read: false, submitted_at: Date.now(),
    };
    if (client) {
      const { error } = await client.from('quote_requests').insert(record);
      if (error) console.error('[SyncEngine] submitQuote:', error.message);
    }
    _broadcast({ type: 'quote_update', ts: Date.now() });
    return record.id;
  },

  async updateQuoteStatus(id, status) {
    const client = db();
    if (!client) return;
    await client.from('quote_requests').update({ status }).eq('id', id);
    await this.refreshQuoteCache();
    _broadcast({ type: 'quote_update', ts: Date.now() });
  },

  async markQuoteRead(id) {
    const client = db();
    if (!client) return;
    await client.from('quote_requests').update({ read: true }).eq('id', id);
    if (window._quoteCache) {
      const q = window._quoteCache.find(r => r.id === id);
      if (q) q.read = true;
    }
  },

  async deleteQuoteRequest(id) {
    const client = db();
    if (!client) return;
    await client.from('quote_requests').delete().eq('id', id);
    await this.refreshQuoteCache();
    _broadcast({ type: 'quote_update', ts: Date.now() });
  },

  async refreshQuoteCache() {
    window._quoteCache = await this.loadQuoteRequestsAsync();
    return window._quoteCache;
  },

  /* ── CHAT CONVERSATIONS ── */
  async loadChatConversationsAsync() {
    const client = db();
    if (!client) return [];
    const { data, error } = await client
      .from('chat_conversations').select('*').order('ts', { ascending: false });
    if (error) { console.error('[SyncEngine] loadConvs:', error.message); return []; }
    return data || [];
  },
  loadChatConversations() { return window._convCache || []; },

  async saveChatConversation(conv) {
    const client = db();
    if (!client) return;
    await client.from('chat_conversations').upsert(conv, { onConflict: 'id' });
    await this.refreshConvCache();
    _broadcast({ type: 'chat_update', subtype: 'conv', ts: Date.now() });
  },

  async refreshConvCache() {
    window._convCache = await this.loadChatConversationsAsync();
    return window._convCache;
  },

  /* ── CHAT MESSAGES ── */
  async loadMessagesAsync(convId) {
    const client = db();
    if (!client) return [];
    let q = client.from('chat_messages').select('*').order('ts', { ascending: true });
    if (convId) q = q.eq('conv_id', convId);
    const { data, error } = await q;
    if (error) { console.error('[SyncEngine] loadMessages:', error.message); return []; }
    return data || [];
  },

  loadMessages() { return window._msgCache || {}; },
  getMessages(convId) { return (window._msgCache || {})[convId] || []; },

  async sendUserMessage(convId, text, visitorName) {
    const client = db();
    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      conv_id: convId, sender: 'user', text, ts: Date.now(), read: false,
    };
    if (client) {
      await client.from('chat_messages').insert(msg);
      const convs = this.loadChatConversations();
      const existing = convs.find(c => c.id === convId);
      await client.from('chat_conversations').upsert({
        id: convId, name: visitorName || 'Website Visitor', preview: text,
        ts: Date.now(), unread: (existing ? (existing.unread || 0) : 0) + 1,
        status: 'active', started_at: existing ? existing.started_at : Date.now(),
      }, { onConflict: 'id' });
    }
    if (!window._msgCache) window._msgCache = {};
    if (!window._msgCache[convId]) window._msgCache[convId] = [];
    const exists = window._msgCache[convId].some(m => m.id === msg.id);
    if (!exists) window._msgCache[convId].push({ ...msg });
    _broadcast({ type: 'new_visitor_msg', convId, session_id: convId, msgId: msg.id, ts: Date.now() });
    return msg;
  },

  async sendAdminMessage(convId, text) {
    const client = db();
    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      conv_id: convId, sender: 'admin', text, ts: Date.now(), read: true,
    };
    if (client) {
      await client.from('chat_messages').insert(msg);
      await client.from('chat_conversations').upsert({
        id: convId, preview: 'Agent: ' + text,
        ts: Date.now(), status: 'live', agent_connected: true,
      }, { onConflict: 'id' });
    }
    if (!window._msgCache) window._msgCache = {};
    if (!window._msgCache[convId]) window._msgCache[convId] = [];
    const exists = window._msgCache[convId].some(m => m.id === msg.id);
    if (!exists) window._msgCache[convId].push({ ...msg });
    _broadcast({ type: 'new_admin_msg', convId, session_id: convId, msgId: msg.id, ts: Date.now() });
    return msg;
  },

  async connectAgent(convId, visitorName) {
    const client = db();
    const convs = this.loadChatConversations();
    const existing = convs.find(c => c.id === convId);
    if (client) {
      await client.from('chat_conversations').upsert({
        id: convId, name: existing ? existing.name : (visitorName || 'Website Visitor'),
        preview: '[Live agent connected]', ts: Date.now(),
        unread: (existing ? (existing.unread || 0) : 0) + 1,
        status: 'live', agent_connected: true,
        started_at: existing ? existing.started_at : Date.now(),
      }, { onConflict: 'id' });
    }
    _broadcast({ type: 'agent_connected', convId, session_id: convId, ts: Date.now() });
  },

  async deleteConversation(convId) {
    const client = db();
    if (client) {
      await client.from('chat_messages').delete().eq('conv_id', convId);
      await client.from('chat_conversations').delete().eq('id', convId);
    }
    if (window._msgCache) delete window._msgCache[convId];
    if (window._convCache) window._convCache = window._convCache.filter(c => c.id !== convId);
    _broadcast({ type: 'conv_deleted', convId, session_id: convId, ts: Date.now() });
  },

  setTyping(convId, isTyping) {
    _broadcast({ type: 'typing_update', convId, session_id: convId, isTyping, ts: Date.now() });
  },
  isTyping() { return false; },

  /* ── EVENT LISTENERS ── */
  onUpdate(callback) {
    _setupListeners();
    _listeners.push(callback);
    return () => { const i = _listeners.indexOf(callback); if (i !== -1) _listeners.splice(i, 1); };
  },

  _broadcast,
  _normalise,

  /* ── SAFE SHIPMENT MERGE ──────────────────────────────────────────────
     Deep-merge a partial update into the current shipment object without
     destroying nested fields or live position data.
     
     Priority rules:
     - update wins for scalar fields (status, packageName, etc.)
     - For objects (origin, destination, sender, receiver): deep merge,
       never let a partial object wipe a fully-populated existing one
     - currentLocation: only update if the update has a valid city/lat/lng.
       A DB refresh with currentLocation.city = origin city must NOT overwrite
       a live mid-route position that tickMovement set in memory.
     ────────────────────────────────────────────────────────────────────── */
  safeMergeShipment(current, update) {
    if (!current) return update;
    if (!update)  return current;

    // Deep merge for nested objects — never replace a rich object with an empty one
    function _mergeObj(cur, upd) {
      if (!upd || typeof upd !== 'object') return cur;
      if (!cur || typeof cur !== 'object') return upd;
      const result = Object.assign({}, cur);
      for (const [k, v] of Object.entries(upd)) {
        if (v !== null && v !== undefined && v !== '' && v !== '—') {
          if (typeof v === 'object' && !Array.isArray(v)) {
            result[k] = _mergeObj(cur[k], v);
          } else {
            result[k] = v;
          }
        }
        // If update has explicit null, allow it (intentional clear)
        else if (v === null) {
          result[k] = null;
        }
        // Otherwise keep current value (don't overwrite with empty string or '—')
      }
      return result;
    }

    const merged = Object.assign({}, current);

    // Scalar fields — update wins if not empty
    const scalars = ['status','packageName','packageType','transportMode','weight',
      'dimensions','estimatedDelivery','delayReason','delayTimestamp','notes',
      'trackingNumber','progress','progress_pct','statusText','statusColor',
      'senderName','senderAddress','receiverName','receiverAddress','shippingMethod',
      'dispatchDate','receiverEmail','receiverPhone','_adminManaged'];
    scalars.forEach(k => {
      const v = update[k];
      if (v !== undefined && v !== null && v !== '' && v !== '—') merged[k] = v;
      else if (v === null) merged[k] = null; // explicit clear
    });

    // Arrays — update wins if non-empty
    if (Array.isArray(update.timeline) && update.timeline.length > 0) merged.timeline = update.timeline;
    if (Array.isArray(update.images)   && update.images.length > 0)   merged.images   = update.images;

    // Nested objects — deep merge
    merged.sender      = _mergeObj(current.sender,      update.sender);
    merged.receiver    = _mergeObj(current.receiver,     update.receiver);
    merged.origin      = _mergeObj(current.origin,       update.origin);
    merged.destination = _mergeObj(current.destination,  update.destination);
    merged.courier     = _mergeObj(current.courier,      update.courier);

    // currentLocation — SPECIAL: only accept update if it has a genuine position.
    // A city-only update (coordinates = [0,0] or missing) from a DB refresh must
    // NOT overwrite a live GPS position that the movement engine set.
    const upCL = update.currentLocation;
    const curCL = current.currentLocation;
    if (upCL) {
      const upHasLivePos = upCL.lat && Math.abs(upCL.lat) > 0.01;
      const curHasLivePos = curCL && curCL.lat && Math.abs(curCL.lat) > 0.01;
      if (upHasLivePos) {
        // Update has a real GPS position — always accept it
        merged.currentLocation = _mergeObj(curCL, upCL);
      } else if (!curHasLivePos) {
        // Neither has live pos — safe to merge city name
        merged.currentLocation = _mergeObj(curCL, upCL);
      }
      // else: current has live GPS, update only has a city name → KEEP current
    }

    return merged;
  },

  /* ── SESSION REGISTRY ── */
  loadSessions() { return window._sessionCache || {}; },

  async registerSession(session_id, meta) {
    meta = meta || {};
    const client = db();
    const record = {
      session_id, socket_id: session_id, status: 'online',
      updated_at: Date.now(), user_agent: (meta.user_agent || '').slice(0,80),
      page_title: (meta.page_title || '').slice(0,60), agent_connected: false,
    };
    if (client) {
      const { data: existing } = await client.from('chat_sessions')
        .select('created_at,agent_connected').eq('session_id', session_id)
        .single();
      if (existing) { record.created_at = existing.created_at; record.agent_connected = existing.agent_connected; }
      else { record.created_at = Date.now(); }
      await client.from('chat_sessions').upsert(record, { onConflict: 'session_id' });
    }
    if (!window._sessionCache) window._sessionCache = {};
    window._sessionCache[session_id] = record;
    _broadcast({ type: 'presence_update', session_id, status: 'online', ts: Date.now() });
  },

  async setSessionOffline(session_id) {
    const client = db();
    if (client) await client.from('chat_sessions')
      .update({ status: 'offline', updated_at: Date.now() }).eq('session_id', session_id);
    if (window._sessionCache && window._sessionCache[session_id])
      window._sessionCache[session_id].status = 'offline';
    _broadcast({ type: 'presence_update', session_id, status: 'offline', ts: Date.now() });
  },

  setSessionIdle(session_id) {
    const client = db();
    if (client) client.from('chat_sessions')
      .update({ status: 'idle', updated_at: Date.now() }).eq('session_id', session_id);
    _broadcast({ type: 'presence_update', session_id, status: 'idle', ts: Date.now() });
  },

  heartbeat(session_id) {
    const client = db();
    if (client) client.from('chat_sessions')
      .update({ status: 'online', updated_at: Date.now() }).eq('session_id', session_id);
  },

  getSession(s) { return (window._sessionCache || {})[s] || null; },

  getAllSessionsWithConvData() {
    const sessions = window._sessionCache || {};
    const convs = window._convCache || [];
    return Object.values(sessions).map(s => {
      const conv = convs.find(c => c.id === s.session_id);
      return {
        ...s,
        display_name: conv ? conv.name : 'Website Visitor',
        preview: conv ? conv.preview : '',
        unread: conv ? (conv.unread || 0) : 0,
        conv_status: conv ? conv.status : s.status,
        agent_connected: s.agent_connected || (conv ? !!conv.agent_connected : false),
        message_count: this.getMessages(s.session_id).length,
      };
    }).sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
  },

  getActiveSessions() {
    return this.getAllSessionsWithConvData().filter(s => s.status !== 'offline');
  },

  markSessionRead(session_id) {
    const client = db();
    if (client) client.from('chat_conversations').update({ unread: 0 }).eq('id', session_id);
    if (window._convCache) {
      const c = window._convCache.find(c => c.id === session_id);
      if (c) c.unread = 0;
    }
  },

  isMySession(eventData, mySessionId) {
    if (!eventData.session_id) return true;
    return eventData.session_id === mySessionId;
  },

  getStats() {
    const all = Object.values(window._sessionCache || {});
    const convs = window._convCache || [];
    const totalUnread = convs.reduce((acc, c) => acc + (c.unread || 0), 0);
    return {
      total: all.length,
      online: all.filter(s => s.status === 'online').length,
      idle: all.filter(s => s.status === 'idle').length,
      offline: all.filter(s => s.status === 'offline').length,
      live: all.filter(s => s.agent_connected).length,
      totalUnread,
    };
  },

  /* ── SUPABASE REALTIME — All tables ── */
  _realtimeSetup: false,
  setupRealtimeListeners() {
    if (this._realtimeSetup) return;
    if (window._epa_rt_active) return;
    this._realtimeSetup = true;
    window._epa_rt_active = true;
    const client = db();
    if (!client) {
      this._realtimeSetup = false;
      window._epa_rt_active = false;
      return;
    }

    // SHIPMENTS — any change refreshes cache and notifies all tabs
    client.channel('epa-ships-v8')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, async (payload) => {
        await SyncEngine.refreshShipmentCache();
        if (payload.eventType === 'DELETE') {
          const oldId = payload.old?.id || payload.old?.tracking_number;
          _broadcast({ type: 'shipment_deleted', deletedId: oldId, ts: Date.now() });
        }
        _broadcast({ type: 'shipment_update', ts: Date.now() });
      })
      .subscribe();

    // CHAT MESSAGES
    client.channel('epa-msgs-v8')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, async (payload) => {
        const msg = payload.new;
        if (msg && msg.conv_id) {
          if (!window._msgCache) window._msgCache = {};
          if (!window._msgCache[msg.conv_id]) window._msgCache[msg.conv_id] = [];
          const exists = window._msgCache[msg.conv_id].some(m => m.id === msg.id);
          if (!exists) window._msgCache[msg.conv_id].push(msg);
          _broadcast({
            type: msg.sender === 'admin' ? 'new_admin_msg' : 'new_visitor_msg',
            convId: msg.conv_id, session_id: msg.conv_id, msgId: msg.id, ts: Date.now()
          });
        }
      })
      .subscribe();

    // CONVERSATIONS
    client.channel('epa-convs-v8')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, async () => {
        await SyncEngine.refreshConvCache();
        _broadcast({ type: 'chat_update', subtype: 'conv', ts: Date.now() });
      })
      .subscribe();

    // QUOTES
    client.channel('epa-quotes-v8')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_requests' }, async () => {
        await SyncEngine.refreshQuoteCache();
        _broadcast({ type: 'quote_update', ts: Date.now() });
      })
      .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('[Realtime] Error — retry in 5s');
        window._epa_rt_active = false;
        SyncEngine._realtimeSetup = false;
        setTimeout(() => SyncEngine.setupRealtimeListeners(), 5000);
      }
    });

    console.log('[SyncEngine v8] ✅ Supabase Realtime active on all tables.');
  },

  /* ── BOOT ── */
  async boot() {
    const [ships, quotes, convs] = await Promise.all([
      this.loadShipmentsAsync(),
      this.loadQuoteRequestsAsync(),
      this.loadChatConversationsAsync(),
    ]);
    window._shipmentCache = ships;
    window._quoteCache    = quotes;
    window._convCache     = convs;
    window._moveStateCache = window._moveStateCache || {};
    window._msgCache       = window._msgCache || {};
    window._sessionCache   = window._sessionCache || {};
    // Update window.ships if admin panel uses it
    if (typeof window.ships !== 'undefined') window.ships = ships;
    this.setupRealtimeListeners();
    _setupListeners();
    _broadcast({ type: 'boot_complete', ts: Date.now() });
    console.log('[SyncEngine v8] Boot complete. Shipments:', ships.length, 'Quotes:', quotes.length);
  },
};

window.SyncEngine = SyncEngine;

/* ── Auto-boot once Supabase is ready ── */
function _doBootWhenReady() {
  if (window.supabaseClient) {
    SyncEngine.boot();
  } else {
    window.addEventListener('supabase_ready', () => SyncEngine.boot(), { once: true });
    // Fallback polling
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if (window.supabaseClient) { clearInterval(iv); SyncEngine.boot(); }
      else if (attempts > 40) {
        clearInterval(iv);
        console.warn('[SyncEngine v8] Running in offline mode — Supabase unavailable.');
        window._shipmentCache = []; window._quoteCache = [];
        window._convCache = []; window._moveStateCache = {};
        window._msgCache = {}; window._sessionCache = {};
      }
    }, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _doBootWhenReady);
} else {
  _doBootWhenReady();
}

console.log('[SyncEngine v8] Loaded — Supabase-first, zero localStorage for data.');
