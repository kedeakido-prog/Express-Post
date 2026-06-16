/* ================================================================
   SHIPMENT-SYNC.JS — Supabase-powered shipment CRUD
   All operations go to Supabase. No localStorage.
   ================================================================ */
'use strict';

async function createShipment(shipmentData) {
  if (!shipmentData || !shipmentData.trackingNumber) {
    console.error('[ShipmentSync] trackingNumber required'); return null;
  }
  const record = {
    ...shipmentData,
    tracking_number: shipmentData.trackingNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const result = await window.SyncEngine.saveShipment(record);
  if (result) console.log('[ShipmentSync] Created:', shipmentData.trackingNumber);
  return result;
}

async function updateShipment(trackingNumber, updates) {
  if (!trackingNumber || !updates) return false;
  const cache = window._shipmentCache || [];
  const existing = cache.find(s =>
    (s.trackingNumber || s.tracking_number || '').toUpperCase() === trackingNumber.toUpperCase()
  );
  if (!existing) { console.warn('[ShipmentSync] Not found:', trackingNumber); return false; }
  const record = { ...existing, ...updates, updated_at: new Date().toISOString() };
  const result = await window.SyncEngine.saveShipment(record);
  return !!result;
}

async function deleteShipment(id) {
  const result = await window.SyncEngine.deleteShipment(id);
  if (result) console.log('[ShipmentSync] Deleted:', id);
  return result;
}

function getShipment(trackingNumber) {
  const cache = window._shipmentCache || [];
  return cache.find(s =>
    (s.trackingNumber || s.tracking_number || '').toUpperCase() === trackingNumber.toUpperCase()
  ) || null;
}

function listenToShipments({ onUpdate, onError } = {}) {
  if (!onUpdate) return () => {};
  // Fire immediately with current cache
  try { onUpdate(window._shipmentCache || []); } catch(e) { if (onError) onError(e); }
  // Subscribe to updates
  return window.SyncEngine.onUpdate(function(data) {
    if (data.type === 'shipment_update' || data.type === 'move_update') {
      try { onUpdate(window._shipmentCache || []); } catch(e) { if (onError) onError(e); }
    }
  });
}

window.ShipmentSync = { createShipment, updateShipment, deleteShipment, getShipment, listenToShipments };
console.log('[ShipmentSync v2] Supabase-powered.');
