(function(){
'use strict';

/* ══════════════════════════════════════════════════════
   CONFIGURATION
   ══════════════════════════════════════════════════════ */
const CFG = {
  groq: {
    apiKey:   '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',
    model:    'llama3-8b-8192',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions'
  },
  resend: {
    // Set your Resend API key here once integrated
    // Get one at https://resend.com
    apiKey:      '',
    fromName:    'Aussie Express Post',
    fromEmail:   'support@aussiexpresspost.com',
    // Use a backend/edge function endpoint to keep the key off the client
    proxyEndpoint: '/api/send-email'
  },
  adminEmail: 'support@aussiexpresspost.com',
  siteUrl:    'https://aussiexpresspost.com'
};

/* ══════════════════════════════════════════════════════
   GROQ AI CHAT ENGINE
   ══════════════════════════════════════════════════════ */
const GROQ_SYSTEM = `You are a professional customer support agent for Aussie Express Post, a premium Australian shipping and tracking company. Your name is "Aria".

Your job:
- Answer questions about shipments, tracking, delivery times, customs, shipping rates
- Be polite, concise and professional at all times
- If a customer asks about a specific tracking number, tell them to visit https://aussiexpresspost.com and enter their tracking number
- If asked about delays, explain possible reasons (weather, customs, logistics) and advise them to check tracking
- Keep replies short (2-4 sentences max) unless a detailed answer is clearly needed

IMPORTANT RULES:
- NEVER make up specific shipment data or delivery dates
- If you cannot help, politely offer to connect them to a human agent
- If the customer says anything like "speak to human", "real person", "live agent", "human support", "talk to someone" — respond ONLY with this exact text and nothing else:
  HANDOFF_REQUESTED
- Always end your responses warmly`;

const _aiHistory = {};

async function groqReply(convId, userText) {
  if (!_aiHistory[convId]) _aiHistory[convId] = [];
  _aiHistory[convId].push({ role: 'user', content: userText });
  if (_aiHistory[convId].length > 10) _aiHistory[convId] = _aiHistory[convId].slice(-10);

  try {
    const res = await fetch(CFG.groq.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CFG.groq.apiKey
      },
      body: JSON.stringify({
        model: CFG.groq.model,
        max_tokens: 300,
        messages: [
          { role: 'system', content: GROQ_SYSTEM },
          ..._aiHistory[convId]
        ]
      })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(()=>({}));
      console.error('[Groq Admin] API error', res.status, errBody);
      return 'I apologise, I am having trouble connecting right now. Please try again in a moment or type "speak to human" to connect with our team.';
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '';
    if (reply) _aiHistory[convId].push({ role: 'assistant', content: reply });
    return reply;
  } catch(err) {
    console.error('[Groq] Error:', err);
    return 'I apologise, I am having trouble connecting right now. Please try again in a moment or type "speak to human" to connect with our team.';
  }
}

/* ══════════════════════════════════════════════════════
   AI AUTO-REPLY — hooks into incoming visitor messages
   ══════════════════════════════════════════════════════ */
const _handoffConvs = new Set();
const _aiProcessed  = new Set();

async function handleAIReply(convId, msgText, msgId) {
  if (_handoffConvs.has(convId)) return;
  if (_aiProcessed.has(msgId)) return;
  _aiProcessed.add(msgId);

  if (window.SyncEngine) {
    const convs = SyncEngine.loadChatConversations();
    const conv  = convs.find(c => c.id === convId || c.session_id === convId);
    if (conv && conv.status === 'live') { _handoffConvs.add(convId); return; }
  }

  await new Promise(r => setTimeout(r, 1200));
  const aiReply = await groqReply(convId, msgText);
  if (!aiReply) return;

  if (aiReply.includes('HANDOFF_REQUESTED')) {
    triggerHumanHandoff(convId);
    const handoffMsg = "I'll connect you with one of our human support agents right away. Please hold on — an agent will be with you shortly. 🙏";
    if (window.SyncEngine) SyncEngine.sendAdminMessage(convId, handoffMsg);
    return;
  }

  if (window.SyncEngine) SyncEngine.sendAdminMessage(convId, aiReply);
}

function triggerHumanHandoff(convId) {
  _handoffConvs.add(convId);
  if (window.SyncEngine) {
    try {
      const convs = SyncEngine.loadChatConversations();
      const conv  = convs.find(c => c.id === convId || c.session_id === convId);
      if (conv) {
        conv.status = 'live';
        conv.agentRequested = true;
        conv.agentRequestedAt = new Date().toISOString();
        SyncEngine.saveChatConversations && SyncEngine.saveChatConversations(convs);
      }
    } catch(e) {}
  }
  const badge = document.getElementById('sb-msg-badge');
  if (badge) { badge.style.background = 'var(--danger)'; badge.style.animation = 'livePulse 1s infinite'; }
  if (typeof toast === 'function') toast('🔴 Live Agent Requested — a visitor wants to speak to a human!', 'e');
  const ni = document.getElementById('ni-msgs');
  if (ni) { ni.style.background = 'rgba(220,38,38,.25)'; setTimeout(() => ni.style.background = '', 3000); }
  if (typeof addNotification === 'function') addNotification('warn', '🔴 Live Agent Requested', 'A visitor needs human support — check Messages now.');
  console.log('[AI Handoff] Human agent requested for conv:', convId);
}

window.adminTakeOver = function(convId) {
  if (!convId && typeof activeMsgConv !== 'undefined') convId = activeMsgConv;
  if (!convId) { if(typeof toast==='function') toast('No conversation selected.','e'); return; }
  _handoffConvs.add(convId);
  if (window.SyncEngine) {
    try {
      const convs = SyncEngine.loadChatConversations();
      const conv  = convs.find(c => c.id === convId || c.session_id === convId);
      if (conv) { conv.status = 'live'; SyncEngine.saveChatConversations && SyncEngine.saveChatConversations(convs); }
    } catch(e) {}
  }
  if(typeof toast==='function') toast('You are now handling this conversation as a live agent.','s');
  if(typeof loadMessages==='function') loadMessages();
};

window.adminHandBackToAI = function(convId) {
  if (!convId && typeof activeMsgConv !== 'undefined') convId = activeMsgConv;
  if (!convId) { if(typeof toast==='function') toast('No conversation selected.','e'); return; }
  _handoffConvs.delete(convId);
  if (window.SyncEngine) {
    try {
      const convs = SyncEngine.loadChatConversations();
      const conv  = convs.find(c => c.id === convId || c.session_id === convId);
      if (conv) { conv.status = 'online'; conv.agentRequested = false; SyncEngine.saveChatConversations && SyncEngine.saveChatConversations(convs); }
    } catch(e) {}
  }
  if(typeof toast==='function') toast('AI assistant is now handling this conversation.','i');
  if(typeof loadMessages==='function') loadMessages();
};

function _hookAIIntoSyncEngine() {
  if (!window.SyncEngine || !SyncEngine.onUpdate) return;
  SyncEngine.onUpdate(function(data) {
    if (data.type === 'new_visitor_msg' && data.convId && data.msgId) {
      try {
        const msgs = SyncEngine.loadMessages();
        const convMsgs = msgs[data.convId] || [];
        const msg = convMsgs.find(m => m.id === data.msgId);
        if (msg && msg.text && msg.sender === 'user') handleAIReply(data.convId, msg.text, data.msgId);
      } catch(e) { console.warn('[AI Hook] Could not retrieve message:', e); }
    }
    if (data.type === 'chat_update' && data.convId && data.text && data.sender === 'user') {
      handleAIReply(data.convId, data.text, data.msgId || data.ts || Math.random().toString(36));
    }
  });
  console.log('[AI Hook] ✅ SyncEngine listener registered');
}

setTimeout(function() { console.log('[Integration] AI hook delegated to fixes.js'); }, 2000);

function _injectChatAIControls() {
  const head = document.querySelector('.chat-panel-head');
  if (!head || document.getElementById('ai-chat-controls')) return;
  const ctrl = document.createElement('div');
  ctrl.id = 'ai-chat-controls';
  ctrl.style.cssText = 'display:flex;gap:.4rem;align-items:center;flex-shrink:0';
  ctrl.innerHTML = `
    <span id="ai-status-badge" style="font-size:.68rem;font-weight:700;padding:.2rem .55rem;border-radius:9999px;background:rgba(59,130,246,.12);color:var(--primary);border:1px solid rgba(59,130,246,.2)">🤖 AI Active</span>
    <button onclick="adminTakeOver()" title="Take over this conversation as human agent" style="padding:.3rem .65rem;border-radius:.4rem;font-size:.72rem;font-weight:600;background:rgba(5,150,105,.1);color:#059669;border:1px solid rgba(5,150,105,.2);cursor:pointer;font-family:inherit">👤 Take Over</button>
    <button onclick="adminHandBackToAI()" title="Hand back to AI" style="padding:.3rem .65rem;border-radius:.4rem;font-size:.72rem;font-weight:600;background:rgba(59,130,246,.1);color:var(--primary);border:1px solid rgba(59,130,246,.2);cursor:pointer;font-family:inherit">🤖 AI Reply</button>
  `;
  head.appendChild(ctrl);
}
setTimeout(function() { console.log('[Integration] Chat AI controls delegated to fixes.js'); }, 1500);

function updateAIBadge(convId) {
  const badge = document.getElementById('ai-status-badge');
  if (!badge) return;
  if (_handoffConvs.has(convId)) {
    badge.textContent = '👤 Human Agent';
    badge.style.background = 'rgba(5,150,105,.12)';
    badge.style.color = '#059669';
    badge.style.borderColor = 'rgba(5,150,105,.2)';
  } else {
    badge.textContent = '🤖 AI Active';
    badge.style.background = 'rgba(59,130,246,.12)';
    badge.style.color = 'var(--primary)';
    badge.style.borderColor = 'rgba(59,130,246,.2)';
  }
}

setTimeout(function() {
  const _origOpenConv = window.openConv;
  if (typeof _origOpenConv === 'function') {
    window.openConv = function(convId, name) {
      _origOpenConv.call(this, convId, name);
      setTimeout(() => updateAIBadge(convId), 100);
    };
  }
}, 0);

/* ══════════════════════════════════════════════════════
   RESEND EMAIL ENGINE — Shipment Notifications
   Calls a backend proxy endpoint to keep API key secure.
   Set up /api/send-email as a serverless function that
   forwards to https://api.resend.com/emails
   ══════════════════════════════════════════════════════ */
async function resendSendEmail({ toEmail, toName, subject, htmlContent }) {
  if (!toEmail || !subject || !htmlContent) {
    console.warn('[Resend] Missing email fields — skipping send');
    return false;
  }
  try {
    const res = await fetch(CFG.resend.proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CFG.resend.fromName + ' <' + CFG.resend.fromEmail + '>',
        to:   [toEmail],
        subject: subject,
        html: htmlContent
      })
    });
    if (res.ok) {
      console.log('[Resend] Email sent successfully to', toEmail);
      return true;
    } else {
      const data = await res.json().catch(()=>({}));
      console.error('[Resend] Error:', data);
      return false;
    }
  } catch(err) {
    console.error('[Resend] Send failed:', err);
    return false;
  }
}

function _emailHTML(title, preheader, bodyHTML) {
  const H = ['<!DOCTYPE html>',
    "<html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "<title>"+title+"</title></head>",
    "<body style=\"margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif\">",
    '<div style="display:none;font-size:1px;color:#fefefe;max-height:0;overflow:hidden">'+preheader+'</div>',
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px">',
    '<tr><td align="center">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">',
    '  <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">',
    '    <div style="display:inline-flex;align-items:center;gap:10px">',
    '      <div style="width:40px;height:40px;background:#3b82f6;border-radius:8px;display:inline-block;text-align:center;line-height:40px;font-size:20px">📦</div>',
    '      <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-.3px">Aussie Express Post</span>',
    '    </div>',
    '  </td></tr>',
    '  <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">',
    '    '+bodyHTML,
    '  </td></tr>',
    '  <tr><td style="background:#f8fafc;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center">',
    '    <p style="margin:0 0 6px;font-size:12px;color:#6b7280">Track your shipment anytime at <a href="'+CFG.siteUrl+'" style="color:#3b82f6;text-decoration:none">'+CFG.siteUrl+'</a></p>',
    '    <p style="margin:0;font-size:11px;color:#9ca3af">This is an automated message from Aussie Express Post. Please do not reply directly to this email.</p>',
    '    <p style="margin:6px 0 0;font-size:11px;color:#9ca3af">© '+new Date().getFullYear()+' Aussie Express Post. All rights reserved.</p>',
    '  </td></tr>',
    '</table>',
    '</td></tr></table>',
    "</body></html>"
  ];
  return H.join('\n');
}

function _statusColor(status) {
  const map = { pending:'#d97706', picked_up:'#3b82f6', in_transit:'#3b82f6', out_for_delivery:'#0891b2', delivered:'#059669', delayed:'#dc2626', processing:'#7c3aed' };
  return map[status] || '#6b7280';
}
function _statusLabel(status) {
  const map = { pending:'Pending', picked_up:'Picked Up', in_transit:'In Transit', out_for_delivery:'Out for Delivery', delivered:'Delivered', delayed:'Delayed', processing:'Processing' };
  return map[status] || status;
}
function _modeIcon(mode) { return mode==='air'?'✈️':mode==='sea'?'🚢':'🚛'; }
function _shipmentRow(label, value) {
  return value ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px">${label}</td><td style="padding:8px 0;font-size:13px;color:#111827;font-weight:500">${value}</td></tr>` : '';
}

/* ── EMAIL: Order Confirmation ── */
async function emailOrderConfirmation(ship) {
  const email = ship.receiver?.email;
  if (!email) return;
  const color = _statusColor(ship.status);
  const body = `
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827">Shipment Created ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Your shipment has been created and is being prepared for dispatch.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#3b82f6">Tracking Number</p>
      <p style="margin:0;font-size:26px;font-weight:800;color:#1e3a8a;font-family:monospace;letter-spacing:2px">${ship.trackingNumber}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${_shipmentRow('Package', ship.packageName)}
      ${_shipmentRow('Transport', _modeIcon(ship.transportMode)+' '+ship.transportMode)}
      ${_shipmentRow('Weight', ship.weight)}
      ${_shipmentRow('From', ship.origin?.city+', '+(ship.origin?.country||''))}
      ${_shipmentRow('To', ship.destination?.city+', '+(ship.destination?.country||''))}
      ${_shipmentRow('Est. Delivery', ship.estimatedDelivery ? new Date(ship.estimatedDelivery).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'TBD')}
      ${_shipmentRow('Recipient', ship.receiver?.name)}
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;margin-bottom:24px">
      <p style="margin:0;font-size:13px;color:#166534"><strong>Status:</strong> <span style="background:${color};color:#fff;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600">${_statusLabel(ship.status)}</span></p>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280">You will receive automatic updates as your shipment progresses.</p>
  `;
  const html = _emailHTML('Shipment Created — '+ship.trackingNumber, 'Your shipment '+ship.trackingNumber+' has been created.', body);
  const ok = await resendSendEmail({ toEmail: email, toName: ship.receiver?.name, subject: 'Your Shipment Has Been Created — '+ship.trackingNumber, htmlContent: html });
  if (ok && typeof toast === 'function') toast('📧 Order confirmation email sent to '+email,'s');
}

/* ── EMAIL: Status Update ── */
async function emailShipmentUpdate(ship, eventType, extraInfo) {
  const email = ship.receiver?.email;
  if (!email) return;
  const subjects = {
    in_transit:       '🚚 Your Package Is On Its Way — '+ship.trackingNumber,
    out_for_delivery: '📦 Out for Delivery Today — '+ship.trackingNumber,
    delivered:        '✅ Your Package Has Been Delivered — '+ship.trackingNumber,
    delayed:          '⚠️ Important Update On Your Shipment — '+ship.trackingNumber,
    picked_up:        '📬 Your Package Has Been Picked Up — '+ship.trackingNumber,
  };
  const intros = {
    in_transit: 'Great news! Your package is now in transit and on its way to you.',
    out_for_delivery: 'Your package is out for delivery today and should arrive soon.',
    delivered: 'Your package has been successfully delivered to its destination.',
    delayed: 'We want to keep you informed about a delay with your shipment.',
    picked_up: 'Your package has been picked up and is now in our system.',
  };
  const icons = { in_transit:'🚚', out_for_delivery:'📦', delivered:'✅', delayed:'⚠️', picked_up:'📬' };
  const color = _statusColor(eventType);
  const subject = subjects[eventType] || 'Shipment Update — '+ship.trackingNumber;
  const intro   = intros[eventType]  || 'There is an update on your shipment.';
  const icon    = icons[eventType]   || '📋';
  const delayBlock = eventType === 'delayed' && extraInfo?.reason ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin:16px 0">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b">Reason for Delay</p>
      <p style="margin:0;font-size:13px;color:#7f1d1d">${extraInfo.reason}</p>
      ${extraInfo.newETA ? `<p style="margin:8px 0 0;font-size:13px;color:#991b1b"><strong>New Estimated Delivery:</strong> ${new Date(extraInfo.newETA).toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>` : ''}
    </div>` : '';
  const deliveredBlock = eventType === 'delivered' ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:16px 0;text-align:center">
      <p style="margin:0;font-size:28px">🎉</p>
      <p style="margin:6px 0 0;font-size:14px;font-weight:600;color:#166534">Successfully Delivered!</p>
    </div>` : '';
  const body = `
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#111827">${icon} ${_statusLabel(eventType)}</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px">${intro}</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-bottom:20px">
      <span style="font-size:12px;color:#3b82f6;font-weight:600">TRACKING #</span>
      <span style="font-size:16px;font-weight:800;color:#1e3a8a;font-family:monospace;letter-spacing:1.5px;margin-left:8px">${ship.trackingNumber}</span>
      <span style="float:right;background:${color};color:#fff;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700">${_statusLabel(eventType)}</span>
    </div>
    ${delayBlock}${deliveredBlock}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      ${_shipmentRow('Package', ship.packageName)}
      ${_shipmentRow('From', ship.origin?.city)}
      ${_shipmentRow('To', ship.destination?.city)}
      ${eventType !== 'delivered' ? _shipmentRow('Est. Delivery', ship.estimatedDelivery ? new Date(ship.estimatedDelivery).toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'}) : '—') : ''}
    </table>
    <a href="${CFG.siteUrl}" style="display:block;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;text-decoration:none;text-align:center;padding:13px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:16px">Track Your Shipment →</a>
  `;
  const html = _emailHTML(subject, intro+' Tracking: '+ship.trackingNumber, body);
  const ok = await resendSendEmail({ toEmail: email, toName: ship.receiver?.name, subject, htmlContent: html });
  if (ok && typeof toast === 'function') toast('📧 Email notification sent to customer','s');
}

/* ══════════════════════════════════════════════════════
   RESEND — PASSWORD RESET OTP
   Calls /api/send-email (your backend proxy)
   ══════════════════════════════════════════════════════ */
async function sendOTPEmail(email, otp, name) {
  try {
    const otpBody = '<h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">Password Reset Code</h2>' +
       '<p style="margin:0 0 20px;color:#6b7280">Hi '+(name||'Admin')+', use the code below to reset your password.</p>' +
       '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px">' +
       '<p style="margin:0;font-size:36px;font-weight:800;color:#1e3a8a;letter-spacing:8px;font-family:monospace">'+otp+'</p>' +
       '</div>' +
       '<p style="margin:0;font-size:13px;color:#6b7280">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>';
    const html = _emailHTML(
      'Password Reset — Aussie Express Post',
      'Your password reset code is: ' + otp,
      otpBody
    );
    const ok = await resendSendEmail({ toEmail: email, toName: name || 'Admin', subject: 'Your Password Reset Code — Aussie Express Post', htmlContent: html });
    if (ok) { console.log('[Resend] OTP sent to', email); return true; }
    if (typeof toast === 'function') toast('OTP: ' + otp + ' (email not configured — copy this)', 'i');
    return false;
  } catch(err) {
    console.error('[Resend] OTP send error:', err);
    if (typeof toast === 'function') toast('OTP: ' + otp + ' (copy this code)', 'i');
    return false;
  }
}

/* ══════════════════════════════════════════════════════
   AUTO REPLY (contact form)
   ══════════════════════════════════════════════════════ */
window.sendAutoReply = async function(toEmail, toName, referenceId) {
  if (!toEmail) return;
  const html = _emailHTML(
    'We received your message — Aussie Express Post',
    'Thank you for contacting Aussie Express Post.',
    `<h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">We received your message ✅</h2>
     <p style="margin:0 0 16px;color:#6b7280">Hi ${toName || 'there'}, thank you for getting in touch. Our team will respond within 1–2 business days.</p>
     ${referenceId ? `<p style="margin:0;font-size:13px;color:#6b7280">Reference: <strong>${referenceId}</strong></p>` : ''}`
  );
  const ok = await resendSendEmail({ toEmail, toName, subject: 'We received your message — Aussie Express Post', htmlContent: html });
  if (!ok) console.warn('[Resend] Auto-reply failed for', toEmail);
};

/* ══════════════════════════════════════════════════════
   HOOK INTO SHIPMENT EVENTS
   ══════════════════════════════════════════════════════ */
const _emailedEvents = new Set();

function _installShipmentEmailHooks() {
  console.log('[Email Hooks] ✅ doCreate email handled inline');

  const _origStart = window.startMovement;
  if (typeof _origStart === 'function') {
    window.startMovement = function(shipId) {
      _origStart.call(this, shipId);
      try {
        const ship = ships.find(s => s.id === shipId);
        if (ship && ship.receiver?.email) emailShipmentUpdate(ship, 'in_transit');
      } catch(e) {}
    };
  }

  const _origDelay = window.delayShipment;
  if (typeof _origDelay === 'function') {
    window.delayShipment = function(shipId, reason, days) {
      _origDelay.apply(this, arguments);
      try {
        const ship = ships.find(s => s.id === shipId);
        if (ship && ship.receiver?.email) emailShipmentUpdate(ship, 'delayed', { reason, newETA: ship.estimatedDelivery });
      } catch(e) {}
    };
  }

  const _origTick = window.tickMovement;
  if (typeof _origTick === 'function') {
    window.tickMovement = function(shipId) {
      const shipBefore = ships.find(s => s.id === shipId);
      const prevStatus = shipBefore?.status;
      _origTick.call(this, shipId);
      try {
        const ship = ships.find(s => s.id === shipId);
        if (!ship || !ship.receiver?.email) return;
        const newStatus = ship.status;
        const eventKey  = shipId + '_' + newStatus;
        if (newStatus !== prevStatus && !_emailedEvents.has(eventKey)) {
          if (newStatus === 'delivered' || newStatus === 'out_for_delivery') {
            _emailedEvents.add(eventKey);
            emailShipmentUpdate(ship, newStatus);
          }
        }
      } catch(e) {}
    };
  }

  const _origSaveEdit = window.saveEdit;
  if (typeof _origSaveEdit === 'function') {
    window.saveEdit = function() {
      const shipBefore = currentEditId ? ships.find(s => s.id === currentEditId) : null;
      const prevStatus = shipBefore?.status;
      _origSaveEdit.apply(this, arguments);
      try {
        const ship = ships.find(s => s.id === currentEditId);
        if (!ship || !ship.receiver?.email) return;
        const newStatus = ship.status;
        const eventKey  = ship.id + '_' + newStatus + '_edit';
        if (newStatus !== prevStatus && !_emailedEvents.has(eventKey)) {
          const notifiable = ['in_transit','out_for_delivery','delivered','picked_up','delayed'];
          if (notifiable.includes(newStatus)) {
            _emailedEvents.add(eventKey);
            emailShipmentUpdate(ship, newStatus);
          }
        }
      } catch(e) {}
    };
  }
}

if (document.readyState === 'complete') {
  setTimeout(_installShipmentEmailHooks, 800);
} else {
  window.addEventListener('load', () => setTimeout(_installShipmentEmailHooks, 800));
}

/* ══════════════════════════════════════════════════════
   EXPOSE HELPERS GLOBALLY
   ══════════════════════════════════════════════════════ */
window.AEP_Email = {
  sendOrderConfirmation: emailOrderConfirmation,
  sendShipmentUpdate:    emailShipmentUpdate,
  sendOTP:               sendOTPEmail,
  sendAutoReply:         window.sendAutoReply,
  groqReply:             groqReply,
  triggerHandoff:        triggerHumanHandoff,
  takeOver:              window.adminTakeOver,
  handBackToAI:          window.adminHandBackToAI
};

console.log('[AEP Integration] ✅ Groq AI Chat + Resend Email — all systems active');

})();