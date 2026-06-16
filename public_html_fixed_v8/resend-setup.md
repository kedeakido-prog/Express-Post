# Resend Email Setup Guide

## Why Resend?
Resend is a modern developer-first email API — clean REST API, great deliverability, and a free tier of 3,000 emails/month.

## Setup Steps

### 1. Create Account
Go to https://resend.com and sign up for a free account.

### 2. Get Your API Key
Dashboard → API Keys → Create API Key → copy it.

### 3. Verify Your Domain
Add Resend's DNS records to your domain (aussiexpresspost.com) so emails come from your own address.

### 4. Create a Backend Proxy Endpoint
**Never put your Resend API key in client-side JavaScript.** Set up a serverless function to proxy email requests.

#### Option A — Cloudflare Worker
```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const body = await request.json();
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.RESEND_API_KEY
      },
      body: JSON.stringify(body)
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  }
};
```
Set `RESEND_API_KEY` as a Cloudflare Worker Secret.

#### Option B — Supabase Edge Function
```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const body = await req.json();
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Deno.env.get('RESEND_API_KEY')
    },
    body: JSON.stringify(body)
  });
  return new Response(await res.text(), { status: res.status });
});
```

### 5. Update the Config in admin/index.html
Find the `CFG.resend` block and set:
```js
proxyEndpoint: 'https://your-worker.your-account.workers.dev'
// or: proxyEndpoint: 'https://your-project.supabase.co/functions/v1/send-email'
```

### OTP Emails
Password reset OTPs are sent via `AEP_Email.sendOTP()` which calls the same proxy endpoint.
The OTP is stored in `window._pendingOTP` and verified client-side. For production, store OTPs in your Supabase `password_resets` table instead.

## Files Changed
- `admin/index.html` — `brevoSendEmail()` replaced with `resendSendEmail()`, all email functions updated
- `js/fixes.js` — Email hooks updated to use `AEP_Email.sendShipmentUpdate()`
- No EmailJS SDK loaded anywhere
