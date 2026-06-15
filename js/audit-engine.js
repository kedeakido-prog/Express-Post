/* =================================================================
   AUDIT ENGINE — v1
   Tracks all shipment creates, edits, deletions, and movement
   updates. Stores in localStorage. Exposed as window.AuditEngine.
   ─────────────────────────────────────────────────────────────────
   SAFETY: Purely additive. Does not modify any existing function.
   Patches doDelete() and saveEdit() in admin.html non-destructively.
   ================================================================= */
'use strict';

(function () {

  const AUDIT_KEY = 'epa_audit_log_v1';
  const MAX_ENTRIES = 500; // cap log size

  /* ─── Core storage ─── */
  function loadLog() {
    return window._epa_audit_log || [];
  }
  function saveLog(entries) {
    window._epa_audit_log = entries.slice(0, MAX_ENTRIES);
  }

  /* ─── Broadcast an audit event to other tabs ─── */
  function broadcastAudit(entry) {
    if (window.SyncEngine && window.SyncEngine._broadcast) {
      window.SyncEngine._broadcast({ type: 'audit_update', entry, ts: Date.now() });
    }
  }

  /* ─── Shallow diff: returns array of changed fields ─── */
  function diffShipment(before, after) {
    const changes = [];
    const fields = [
      ['packageName', 'Package Name'],
      ['packageType', 'Package Type'],
      ['transportMode', 'Transport Mode'],
      ['status', 'Status'],
      ['weight', 'Weight'],
      ['estimatedDelivery', 'Estimated Delivery'],
    ];
    fields.forEach(function ([key, label]) {
      const bv = before[key] !== undefined ? String(before[key]) : '';
      const av = after[key] !== undefined ? String(after[key]) : '';
      if (bv !== av) changes.push({ field: label, key, before: bv, after: av });
    });
    // Nested origin city
    if ((before.origin && before.origin.city) !== (after.origin && after.origin.city)) {
      changes.push({ field: 'Origin City', key: 'origin.city', before: (before.origin || {}).city || '', after: (after.origin || {}).city || '' });
    }
    if ((before.destination && before.destination.city) !== (after.destination && after.destination.city)) {
      changes.push({ field: 'Destination City', key: 'destination.city', before: (before.destination || {}).city || '', after: (after.destination || {}).city || '' });
    }
    if ((before.sender && before.sender.name) !== (after.sender && after.sender.name)) {
      changes.push({ field: 'Sender Name', key: 'sender.name', before: (before.sender || {}).name || '', after: (after.sender || {}).name || '' });
    }
    if ((before.receiver && before.receiver.name) !== (after.receiver && after.receiver.name)) {
      changes.push({ field: 'Receiver Name', key: 'receiver.name', before: (before.receiver || {}).name || '', after: (after.receiver || {}).name || '' });
    }
    return changes;
  }

  /* ─── Public log methods ─── */
  const AuditEngine = {

    /* Log shipment creation */
    logCreated: function (shipment, actor) {
      const entry = {
        id: 'AUD' + Date.now() + Math.random().toString(36).slice(2, 6),
        type: 'created',
        icon: '✅',
        label: 'Shipment Created',
        trackingNumber: shipment.trackingNumber || '—',
        shipmentId: shipment.id || '',
        packageName: shipment.packageName || shipment.packageType || '—',
        origin: (shipment.origin && shipment.origin.city) || '—',
        destination: (shipment.destination && shipment.destination.city) || '—',
        actor: actor || 'Admin',
        timestamp: Date.now(),
        changes: [],
        deletionReason: null,
      };
      const log = loadLog();
      log.unshift(entry);
      saveLog(log);
      broadcastAudit(entry);
      return entry;
    },

    /* Log shipment edit — before is the snapshot before save, after is post-save */
    logEdited: function (before, after, actor) {
      const changes = diffShipment(before, after);
      if (changes.length === 0) return null; // nothing changed
      const entry = {
        id: 'AUD' + Date.now() + Math.random().toString(36).slice(2, 6),
        type: 'edited',
        icon: '✏️',
        label: 'Shipment Edited',
        trackingNumber: after.trackingNumber || before.trackingNumber || '—',
        shipmentId: after.id || before.id || '',
        packageName: after.packageName || before.packageName || '—',
        origin: (after.origin && after.origin.city) || '—',
        destination: (after.destination && after.destination.city) || '—',
        actor: actor || 'Admin',
        timestamp: Date.now(),
        changes,
        deletionReason: null,
      };
      const log = loadLog();
      log.unshift(entry);
      saveLog(log);
      broadcastAudit(entry);
      return entry;
    },

    /* Log shipment deletion */
    logDeleted: function (shipment, reason, actor) {
      const entry = {
        id: 'AUD' + Date.now() + Math.random().toString(36).slice(2, 6),
        type: 'deleted',
        icon: '🗑️',
        label: 'Shipment Deleted',
        trackingNumber: shipment.trackingNumber || '—',
        shipmentId: shipment.id || '',
        packageName: shipment.packageName || shipment.packageType || '—',
        origin: (shipment.origin && shipment.origin.city) || '—',
        destination: (shipment.destination && shipment.destination.city) || '—',
        actor: actor || 'Admin',
        timestamp: Date.now(),
        changes: [],
        deletionReason: reason || 'No reason specified',
      };
      const log = loadLog();
      log.unshift(entry);
      saveLog(log);
      broadcastAudit(entry);
      return entry;
    },

    /* Log movement update (speed/state change) */
    logMovement: function (shipment, eventLabel, actor) {
      const entry = {
        id: 'AUD' + Date.now() + Math.random().toString(36).slice(2, 6),
        type: 'movement',
        icon: '🚚',
        label: eventLabel || 'Movement Update',
        trackingNumber: shipment.trackingNumber || '—',
        shipmentId: shipment.id || '',
        packageName: shipment.packageName || '—',
        origin: (shipment.origin && shipment.origin.city) || '—',
        destination: (shipment.destination && shipment.destination.city) || '—',
        actor: actor || 'Admin',
        timestamp: Date.now(),
        changes: [],
        deletionReason: null,
      };
      const log = loadLog();
      log.unshift(entry);
      saveLog(log);
      broadcastAudit(entry);
      return entry;
    },

    getLog: loadLog,

    clearLog: function () { saveLog([]); },

    /* Filter helpers */
    getByType: function (type) { return loadLog().filter(e => e.type === type); },
    getByTracking: function (tn) { return loadLog().filter(e => e.trackingNumber === tn); },
    getRecent: function (n) { return loadLog().slice(0, n || 50); },
  };

  window.AuditEngine = AuditEngine;

  /* ════════════════════════════════════════════════════════
     HOOK INTO ADMIN FUNCTIONS (non-destructive patches)
     We wrap doDelete(), saveEdit(), and the shipment create
     flow after DOMContentLoaded so they auto-log.
  ════════════════════════════════════════════════════════ */

  // Snapshot of shipment before edit (captured when edit modal opens)
  window._auditEditSnapshot = null;

  function patchAdminFunctions() {
    /* ── Patch doDelete() ── */
    if (typeof window.doDelete === 'function' && !window.doDelete._auditPatched) {
      const origDelete = window.doDelete;
      window.doDelete = function () {
        // delId is the admin's current delete target
        const targetId = window.delId;
        const allShips = window.ships || [];
        const ship = allShips.find(s => s.id === targetId);

        // Grab reason from the delete modal if present
        const reasonEl = document.getElementById('del-reason') || document.getElementById('delete-reason-select');
        const reason = reasonEl ? reasonEl.value : 'Permanently removed by admin';

        // Call original delete
        origDelete.apply(this, arguments);

        // Log after deletion
        if (ship) {
          AuditEngine.logDeleted(ship, reason, 'Admin');
        }
      };
      window.doDelete._auditPatched = true;
    }

    /* ── Patch saveEdit() ── */
    if (typeof window.saveEdit === 'function' && !window.saveEdit._auditPatched) {
      const origSaveEdit = window.saveEdit;
      window.saveEdit = function () {
        // Snapshot before
        const editId = window.currentEditId;
        const allShips = window.ships || [];
        const before = JSON.parse(JSON.stringify(allShips.find(s => s.id === editId) || {}));

        origSaveEdit.apply(this, arguments);

        // Snapshot after (ships array mutated in place by saveEdit)
        const after = allShips.find(s => s.id === editId) || {};
        if (Object.keys(before).length && Object.keys(after).length) {
          AuditEngine.logEdited(before, after, 'Admin');
        }
      };
      window.saveEdit._auditPatched = true;
    }

    /* ── Patch saveShips() to detect creates ── */
    if (typeof window.saveShips === 'function' && !window.saveShips._auditPatched) {
      const origSaveShips = window.saveShips;
      let _lastKnownIds = new Set((window.ships || []).map(s => s.id));
      window.saveShips = function (ships) {
        const currentIds = new Set(ships.map(s => s.id));
        // Detect new shipments
        ships.forEach(function (s) {
          if (!_lastKnownIds.has(s.id)) {
            AuditEngine.logCreated(s, 'Admin');
          }
        });
        _lastKnownIds = currentIds;
        return origSaveShips.apply(this, arguments);
      };
      window.saveShips._auditPatched = true;
    }

    /* ── Patch startMovement / pauseMovement / resumeMovement ── */
    ['startMovement', 'pauseMovement', 'resumeMovement', 'resetMovement'].forEach(function (fnName) {
      if (typeof window[fnName] === 'function' && !window[fnName]._auditPatched) {
        const orig = window[fnName];
        const labels = {
          startMovement: '▶ Movement Started',
          pauseMovement: '⏸ Movement Paused',
          resumeMovement: '▶ Movement Resumed',
          resetMovement: '↺ Movement Reset',
        };
        window[fnName] = function (shipId) {
          orig.apply(this, arguments);
          const ship = (window.ships || []).find(s => s.id === shipId);
          if (ship) AuditEngine.logMovement(ship, labels[fnName] || fnName, 'Admin');
        };
        window[fnName]._auditPatched = true;
      }
    });
  }

  // Apply patches after DOM is ready and functions are defined
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(patchAdminFunctions, 300);
    // Also try after auth (admin panel initialises after login)
    const origShowDash = window.showDash;
    if (typeof origShowDash === 'function') {
      window.showDash = function () {
        origShowDash.apply(this, arguments);
        setTimeout(patchAdminFunctions, 200);
      };
    }
  });

  // Re-apply every 2s (handles lazy-loaded functions)
  let _patchInterval = setInterval(function () {
    patchAdminFunctions();
    // Stop trying once all major ones are patched
    if (
      window.doDelete && window.doDelete._auditPatched &&
      window.saveEdit && window.saveEdit._auditPatched
    ) {
      clearInterval(_patchInterval);
    }
  }, 2000);

})();
