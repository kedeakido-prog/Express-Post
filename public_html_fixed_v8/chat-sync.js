/* ================================================================
   CHAT-SYNC.JS — Live Chat via SyncEngine (localStorage + BroadcastChannel)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Firebase removed. All state is managed via SyncEngine (sync.js).
   Supabase realtime can be added as a drop-in layer when ready.
   ================================================================ */
'use strict';

/* Holds the active SyncEngine unsubscribe function */
let _seUnsubscribe = null;

/**
 * sendChatMessage — saves a message via SyncEngine.
 * Returns the new message object, or null on error.
 */
function sendChatMessage(convId, text, senderRole, visitorName) {
  if (!convId || !text || !senderRole) {
    console.warn('[ChatSync] sendChatMessage: missing required params');
    return null;
  }
  try {
    if (senderRole === 'user') {
      return window.SyncEngine.sendUserMessage(convId, text, visitorName || 'Website Visitor');
    } else {
      return window.SyncEngine.sendAdminMessage(convId, text);
    }
  } catch(err) {
    console.error('[ChatSync] sendChatMessage error:', err);
    return null;
  }
}

/**
 * listenToConversation — subscribes to real-time updates for one conversation.
 * Calls onMessage(messagesArray) whenever messages change.
 * Returns an unsubscribe function.
 */
function listenToConversation(convId, chatBox, onMessage, onError) {
  if (!convId || !onMessage) {
    console.warn('[ChatSync] listenToConversation: missing convId or onMessage');
    return () => {};
  }

  // Load messages immediately
  try {
    const msgs = window.SyncEngine.getMessages(convId);
    onMessage(msgs);
  } catch(err) {
    if (onError) onError(err);
  }

  // Subscribe to live updates
  const unsub = window.SyncEngine.onUpdate(function(data) {
    if (
      data.type === 'chat_update' &&
      (!data.convId || data.convId === convId)
    ) {
      try {
        const msgs = window.SyncEngine.getMessages(convId);
        onMessage(msgs);
      } catch(err) {
        if (onError) onError(err);
      }
    }
  });

  return unsub;
}

/**
 * stopListening — unsubscribes the active listener.
 */
function stopListening() {
  if (_seUnsubscribe) {
    try { _seUnsubscribe(); } catch(e) {}
    _seUnsubscribe = null;
  }
}

window.ChatSync = {
  sendChatMessage,
  listenToConversation,
  stopListening,
};

console.log('[ChatSync] Ready — SyncEngine-powered live chat.');
