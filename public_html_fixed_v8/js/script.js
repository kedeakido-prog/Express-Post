/* ===================================================
   EXPRESS POST AUSTRALIA – Main JavaScript v2
   Australia-focused | PDF Export | Refined Tracking
   =================================================== */
'use strict';

const ICONS = {
  package:`<svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>`,
  menu:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  x:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  sun:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  phone:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"/></svg>`,
  arrowRight:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  chevronDown:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronLeft:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  plane:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>`,
  ship:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0021 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6"/><path d="M12 10v4M12 2v3"/></svg>`,
  truck:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  warehouse:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22 8.35V20a2 2 0 01-2 2H4a2 2 0 01-2-2V8.35A2 2 0 013.26 6.5l8-3.2a2 2 0 011.48 0l8 3.2A2 2 0 0122 8.35zM6 18h4v-2H6zm0-4h4v-2H6zm8 4h4v-2h-4zm0-4h4v-2h-4z"/></svg>`,
  search:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  send:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  messageCircle:`<svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  bot:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M16 15h.01"/></svg>`,
  user:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  minimize2:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`,
  maximize2:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  loader2:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>`,
  checkCircle:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  circle:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
  mapPin:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  clock:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  globe:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  shield:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  zap:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  trendingUp:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  helpCircle:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  quote:`<svg xmlns="https://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
  star:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  mail:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  facebook:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  twitter:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>`,
  linkedin:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  instagram:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  youtube:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
  qrCode:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>`,
  download:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  maximize:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>`,
  scale:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 4-2 7-2s5 2 7 2h2"/></svg>`,
  ruler:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21.3 8.7l-1.4 1.4L18.5 9l-1.4 1.4 1.4 1.4-1.4 1.4L15.7 12l-1.4 1.4 1.4 1.4L14.3 16l-1.4-1.4L11.5 16l1.4 1.4-1.4 1.4L9.1 17.4 7.7 18.8 5.2 16.3 18.8 2.7z"/></svg>`,
  fileText:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  calendar:`<svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  fileCheck:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>`,
  dollarSign:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  users:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  headphones:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>`,
  shoppingCart:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>`,
  train:`<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M4 11h16M12 3v8"/><circle cx="8.5" cy="19.5" r="1.5"/><circle cx="15.5" cy="19.5" r="1.5"/><path d="M15 19H9"/></svg>`,
  checkmark:`<svg xmlns="https://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#22c55e" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

function icon(name,size=20){const svg=ICONS[name];if(!svg)return '';return svg.replace(/width="\d+"/,`width="${size}"`).replace(/height="\d+"/,`height="${size}"`);}

/* ── Theme ── */
const ThemeManager=(()=>{
  const KEY='axon-theme';
  let current=localStorage.getItem(KEY)||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  function apply(t){current=t;document.documentElement.classList.toggle('dark',t==='dark');localStorage.setItem(KEY,t);}
  function toggle(){apply(current==='dark'?'light':'dark');}
  return{init:()=>apply(current),toggle,get:()=>current};
})();

/* ── Header ── */
function initHeader(){
  const header=document.getElementById('header');
  const hamburger=document.getElementById('hamburger');
  const mobileMenu=document.getElementById('mobile-menu');
  const themeBtn=document.getElementById('theme-toggle');
  if(!header)return;
  window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',window.scrollY>20);},{passive:true});
  if(hamburger&&mobileMenu){
    hamburger.addEventListener('click',()=>{
      const open=mobileMenu.classList.toggle('open');
      hamburger.innerHTML=open?icon('x'):icon('menu');
      hamburger.setAttribute('aria-expanded',String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      mobileMenu.classList.remove('open');hamburger.innerHTML=icon('menu');hamburger.setAttribute('aria-expanded','false');
    }));
  }
  if(themeBtn)themeBtn.addEventListener('click',()=>ThemeManager.toggle());
}

/* ── Hero Slider ── */
function initHero(){
  if(!document.getElementById('hero')||document.querySelector('.tracking-page-content'))return;
  const slides=[
    {title:"Australia's Premier",titleAccent:'Logistics Partner',description:'Seamless door-to-door delivery across every state and territory in Australia, with real-time tracking and guaranteed delivery times.',image:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80',stats:[{value:'8',label:'States Covered',iconName:'globe'},{value:'24/7',label:'Support',iconName:'clock'},{value:'100%',label:'Secure',iconName:'shield'}]},
    {title:'Track Your Goods',titleAccent:'Across Australia',description:'Real-time tracking technology that keeps you informed at every step — from Sydney warehouses to remote outback deliveries.',image:'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80',stats:[{value:'5M+',label:'Packages/Year',iconName:'package'},{value:'99.9%',label:'On-Time',iconName:'clock'},{value:'Live',label:'Tracking',iconName:'globe'}]},
    {title:'Fast, Secure &',titleAccent:'Australia-Wide',description:'Same-day metro delivery and next-day interstate. Covering Sydney, Melbourne, Brisbane, Perth, Adelaide, Darwin and beyond.',image:'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=80',stats:[{value:'1-3',label:'Days Express',iconName:'plane'},{value:'500+',label:'Depots',iconName:'warehouse'},{value:'$1B+',label:'Cargo Value',iconName:'shield'}]},
  ];
  let current=0,timer;
  const content=document.getElementById('hero-content');
  const dotsContainer=document.getElementById('slide-dots');
  const bgWrap=document.getElementById('hero-bg');
  if(!content||!dotsContainer||!bgWrap)return;
  function renderSlide(idx){
    const s=slides[idx];
    content.style.animation='none';content.offsetHeight;content.style.animation='revealUp .5s ease-out both';
    content.innerHTML=`
      <div class="hero-badge"><span class="badge-dot"><span class="badge-dot-ping"></span><span class="badge-dot-inner"></span></span><span class="badge-text">Trusted by 10,000+ Australian businesses</span></div>
      <div><h1 class="hero-title"><span>${s.title}</span><br><span class="text-gradient">${s.titleAccent}</span></h1><p class="hero-desc">${s.description}</p></div>
      <div class="hero-ctas">
        <a href="tracking.html" class="btn btn-primary btn-lg">${icon('package',20)} Track Shipment ${icon('arrowRight',16)}</a>
        <a href="#contact" class="btn btn-outline btn-lg">${icon('phone',16)} Get Free Quote</a>
        <a href="#services" class="btn btn-ghost btn-lg">Our Services</a>
      </div>
      <div class="hero-stats">${s.stats.map(st=>`<div class="hero-stat-item"><div class="hero-stat-top"><span style="color:var(--primary)">${icon(st.iconName,20)}</span><span class="hero-stat-value">${st.value}</span></div><span class="hero-stat-label">${st.label}</span></div>`).join('')}</div>`;
    bgWrap.style.backgroundImage=`url(${s.image})`;
    bgWrap.style.animation='none';bgWrap.offsetHeight;bgWrap.style.animation='fadeIn .8s ease-out';
    dotsContainer.querySelectorAll('.slide-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  slides.forEach((_,i)=>{
    const dot=document.createElement('button');dot.className='slide-dot'+(i===0?' active':'');dot.setAttribute('aria-label',`Slide ${i+1}`);
    dot.addEventListener('click',()=>{clearInterval(timer);goTo(i);startTimer();});dotsContainer.appendChild(dot);
  });
  function goTo(idx){current=(idx+slides.length)%slides.length;renderSlide(current);}
  function startTimer(){timer=setInterval(()=>goTo(current+1),6000);}
  document.getElementById('slide-prev')?.addEventListener('click',()=>{clearInterval(timer);goTo(current-1);startTimer();});
  document.getElementById('slide-next')?.addEventListener('click',()=>{clearInterval(timer);goTo(current+1);startTimer();});
  renderSlide(0);startTimer();
}

/* ── Scroll Reveal ── */
function initScrollReveal(){
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.1,rootMargin:'-60px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

/* ── Counters ── */
function animateCounter(el,target,suffix,duration){
  const start=performance.now();const isFloat=!Number.isInteger(target);
  function step(ts){const p=Math.min((ts-start)/(duration*1000),1);const val=p*target;el.textContent=(isFloat?val.toFixed(1):Math.floor(val).toLocaleString())+suffix;if(p<1)requestAnimationFrame(step);else el.textContent=(isFloat?target.toFixed(1):target.toLocaleString())+suffix;}
  requestAnimationFrame(step);
}
function initCounters(){
  const els=document.querySelectorAll('[data-counter]');if(!els.length)return;
  const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const el=e.target;animateCounter(el,+el.dataset.counter,el.dataset.suffix||'',+el.dataset.duration||1.5);obs.unobserve(el);}});},{threshold:0.3});
  els.forEach(el=>obs.observe(el));
}

/* ── FAQ ── */
function initFAQ(){
  const searchInput=document.getElementById('faq-search');
  const faqItems=document.querySelectorAll('.faq-item');
  document.querySelectorAll('.faq-question').forEach(btn=>{
    btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');const wasOpen=item.classList.contains('open');faqItems.forEach(i=>i.classList.remove('open'));if(!wasOpen)item.classList.add('open');});
  });
  if(searchInput){searchInput.addEventListener('input',()=>{const q=searchInput.value.toLowerCase();document.querySelectorAll('.faq-category').forEach(cat=>{let vis=false;cat.querySelectorAll('.faq-item').forEach(item=>{const m=!q||item.textContent.toLowerCase().includes(q);item.style.display=m?'':'none';if(m)vis=true;});cat.style.display=vis?'':'none';});});}
}

/* ── Testimonials ── */
function initTestimonials(){
  const testimonials=[
    {name:'Sarah Johnson',role:'Supply Chain Director',company:'TechCorp Australia',image:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',rating:5,text:'Express Post Australia has transformed our supply chain across Australia. Their real-time tracking and reliable delivery have significantly improved our customer satisfaction rates.'},
    {name:'Michael Chen',role:'Operations Manager',company:'Global Retail Co.',image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',rating:5,text:'The level of professionalism from Axon is exceptional. They handle our high-volume shipments from Sydney to Perth with precision and care every single time.'},
    {name:'Emily Rodriguez',role:'E-commerce Founder',company:'StyleBox Online',image:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',rating:5,text:'As a growing Australian e-commerce business, finding a reliable logistics partner was crucial. Axon exceeded expectations with seamless integration and fast deliveries.'},
    {name:'David Kim',role:'Logistics Manager',company:'Pacific Trade Ltd.',image:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',rating:5,text:'Their expertise for imports into Brisbane saved us countless hours. Express Post is now our go-to partner for all interstate and international shipments.'},
    {name:'Lisa Thompson',role:'Operations Lead',company:'MedSupply Australia',image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',rating:5,text:'Temperature-controlled shipping for our medical supplies is critical. Axon\'s specialised handling gives us complete peace of mind across all states.'},
  ];
  const container=document.getElementById('testimonial-card');const dotsWrap=document.getElementById('testimonial-dots');
  if(!container)return;
  let current=0,timer;
  function render(idx){
    const t=testimonials[idx];container.style.animation='none';container.offsetHeight;container.style.animation='slideInRight .5s ease-out';
    container.innerHTML=`<div class="testimonial-stars">${Array.from({length:t.rating},()=>icon('star')).join('')}</div><blockquote class="testimonial-text">"${t.text}"</blockquote><div class="testimonial-author"><div class="testimonial-avatar"><img src="${t.image}" alt="${t.name}" loading="lazy"></div><div><p class="testimonial-name">${t.name}</p><p class="testimonial-role">${t.role} at ${t.company}</p></div></div>`;
    dotsWrap?.querySelectorAll('.t-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  testimonials.forEach((_,i)=>{const d=document.createElement('button');d.className='t-dot'+(i===0?' active':'');d.addEventListener('click',()=>{clearInterval(timer);go(i);startT();});dotsWrap?.appendChild(d);});
  function go(idx){current=(idx+testimonials.length)%testimonials.length;render(current);}
  function startT(){timer=setInterval(()=>go(current+1),5000);}
  document.getElementById('t-prev')?.addEventListener('click',()=>{clearInterval(timer);go(current-1);startT();});
  document.getElementById('t-next')?.addEventListener('click',()=>{clearInterval(timer);go(current+1);startT();});
  render(0);startT();
}

/* ── Contact Form (also submits quote requests) ── */
function initContactForm(){
  const form=document.getElementById('contact-form');if(!form)return;
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();const btn=form.querySelector('[type=submit]');const orig=btn.innerHTML;
    btn.disabled=true;btn.innerHTML=`${icon('loader2',16)} Submitting...`;
    await new Promise(r=>setTimeout(r,1800));
    // Collect form data
    const name=form.querySelector('#c-name')?.value||form.querySelector('[name="name"]')?.value||'';
    const email=form.querySelector('#c-email')?.value||form.querySelector('[name="email"]')?.value||'';
    const phone=form.querySelector('#c-phone')?.value||form.querySelector('[name="phone"]')?.value||'';
    const subject=form.querySelector('#c-type')?.value||form.querySelector('[name="shipmentType"]')?.value||'General Enquiry';
    const message=form.querySelector('#c-msg')?.value||form.querySelector('[name="message"]')?.value||'';
    const fromCity=form.querySelector('#c-origin')?.value||form.querySelector('[name="origin"]')?.value||'';
    const toCity=form.querySelector('#c-dest')?.value||form.querySelector('[name="destination"]')?.value||'';
    const weight=form.querySelector('#c-weight')?.value||form.querySelector('[name="weight"]')?.value||'';
    // Submit to SyncEngine as quote request
    if(window.SyncEngine && (name||email)){
      SyncEngine.submitQuoteRequest({
        name, email, phone, subject, message,
        fromCity, toCity, weight,
        source: 'contact_form',
        pageUrl: window.location.href,
      });
    }
    document.getElementById('contact-form-inner')?.classList.add('hidden');
    document.getElementById('contact-success')?.classList.add('show');
    btn.disabled=false;btn.innerHTML=orig;
    setTimeout(()=>{
      document.getElementById('contact-form-inner')?.classList.remove('hidden');
      document.getElementById('contact-success')?.classList.remove('show');
      form.reset();
    },4500);
  });
}

/* ── Newsletter ── */
function initNewsletter(){
  const form=document.getElementById('newsletter-form');if(!form)return;
  form.addEventListener('submit',(e)=>{e.preventDefault();const btn=form.querySelector('button');btn.textContent='Subscribed! ✓';setTimeout(()=>{btn.textContent='Subscribe';form.reset();},3000);});
}

/* ── Live Chat ── Real-Time WhatsApp-style ── */

// initLiveChat removed — Tawk.to handles all chat

/* ================================================================
   TAWK.TO INTEGRATION — Human escalation + admin notification
   ================================================================ */
(function() {
  'use strict';

  // Phrases that trigger human agent escalation
  const HUMAN_PHRASES = [
    'speak to a human', 'talk to a human', 'human agent', 'human support',
    'live support', 'real person', 'live agent', 'connect me to',
    'talk to someone', 'speak to someone', 'talk to an agent',
    'live chat', 'speak to agent', 'need help from human',
    'real agent', 'customer service', 'speak to representative'
  ];

  function _containsHumanRequest(text) {
    const lower = (text || '').toLowerCase();
    return HUMAN_PHRASES.some(p => lower.includes(p));
  }

  // Notify admin panel via Supabase when human is requested
  async function _notifyAdminHumanRequest(visitorMsg, conversationId) {
    const client = window.supabaseClient;
    if (!client) return;
    try {
      // Insert notification
      await client.from('notifications').insert({
        type:    'chat',
        title:   '🚨 Human Agent Requested',
        message: 'A visitor is requesting a human agent: "' + visitorMsg.substring(0, 80) + '"',
        icon:    '🙋',
        data:    JSON.stringify({ conv_id: conversationId, source: 'tawk', urgent: true }),
        read:    false
      });
      // Also save to chat_conversations so admin sees it
      await client.from('chat_conversations').upsert({
        id:      'tawk_' + (conversationId || Date.now()),
        name:    'Tawk.to Visitor',
        preview: '🚨 HUMAN REQUESTED: ' + visitorMsg.substring(0, 60),
        status:  'live',
        unread:  1,
        ts:      Date.now(),
        agent_connected: false
      }, { onConflict: 'id' });
      console.log('[Tawk] Admin notified of human request');
    } catch(e) {
      console.warn('[Tawk] Notification failed:', e.message);
    }
  }

  // Save Tawk.to message to Supabase for admin dashboard sync
  async function _saveTawkMessage(msg, visitorId, sender) {
    const client = window.supabaseClient;
    if (!client) return;
    const convId = 'tawk_' + (visitorId || 'visitor');
    try {
      await client.from('chat_messages').insert({
        id:      'tm_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        conv_id: convId,
        sender:  sender || 'user',
        text:    msg,
        ts:      Date.now(),
        read:    false
      });
    } catch(e) {}
  }

  // Wait for Tawk.to API to be ready
  function _initTawkHooks() {
    if (typeof Tawk_API === 'undefined') {
      setTimeout(_initTawkHooks, 500);
      return;
    }

    // Hook into chat messages
    Tawk_API.onChatMessageVisitor = function(message) {
      const text = message && message.message ? message.message : '';
      const vid  = Tawk_API.visitor ? Tawk_API.visitor.id : 'anon';

      // Save to Supabase
      _saveTawkMessage(text, vid, 'user');

      // Check for human escalation request
      if (_containsHumanRequest(text)) {
        console.log('[Tawk] Human agent requested:', text);
        _notifyAdminHumanRequest(text, vid);

        // Show escalation message to visitor
        setTimeout(function() {
          Tawk_API.sendMsg(
            "Connecting you with a human agent now. Please hold on!"
          );
        }, 800);
      }
    };

    // Hook into agent messages for Supabase sync
    Tawk_API.onChatMessageAgent = function(message) {
      const text = message && message.message ? message.message : '';
      const vid  = Tawk_API.visitor ? Tawk_API.visitor.id : 'anon';
      _saveTawkMessage(text, vid, 'admin');
    };

    // Log chat start
    Tawk_API.onChatStarted = function() {
      console.log('[Tawk] Chat started');
      const vid = Tawk_API.visitor ? Tawk_API.visitor.id : 'anon';
      const client = window.supabaseClient;
      if (client) {
        client.from('chat_conversations').upsert({
          id:     'tawk_' + vid,
          name:   'Tawk.to Visitor',
          preview:'Chat started',
          status: 'active',
          unread: 0,
          ts:     Date.now()
        }, { onConflict: 'id' }).catch(() => {});
      }
    };

    console.log('[Tawk] Integration hooks active ✓');
  }

  // Start hooking after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_initTawkHooks, 1000); });
  } else {
    setTimeout(_initTawkHooks, 1000);
  }
})();
/* ================================================================
   END TAWK.TO INTEGRATION
   ================================================================ */



/* ════════════════════════════════════════
   AUSTRALIA SHIPMENT DATA
   ════════════════════════════════════════ */
const AU_CITIES={
  sydney:    {city:'Sydney',    state:'NSW',lat:-33.8688,lng:151.2093},
  melbourne: {city:'Melbourne', state:'VIC',lat:-37.8136,lng:144.9631},
  brisbane:  {city:'Brisbane',  state:'QLD',lat:-27.4698,lng:153.0251},
  perth:     {city:'Perth',     state:'WA', lat:-31.9505,lng:115.8605},
  adelaide:  {city:'Adelaide',  state:'SA', lat:-34.9285,lng:138.6007},
  canberra:  {city:'Canberra',  state:'ACT',lat:-35.2809,lng:149.1300},
  darwin:    {city:'Darwin',    state:'NT', lat:-12.4634,lng:130.8456},
  hobart:    {city:'Hobart',    state:'TAS',lat:-42.8821,lng:147.3272},
  cairns:    {city:'Cairns',    state:'QLD',lat:-16.9186,lng:145.7781},
  albury:    {city:'Albury',    state:'NSW',lat:-36.0737,lng:146.9135},
  goldCoast: {city:'Gold Coast',state:'QLD',lat:-28.0167,lng:153.4000},
  goldCoast: {city:'Gold Coast',state:'QLD',lat:-28.0167,lng:153.4000},
};


/* ════════════════════════════════════════
   SHIPMENT LOOKUP — Supabase only.
   No mock data. No localStorage fallback.
   ════════════════════════════════════════ */

/* Convert a raw Supabase shipment row into the display shape used by showTrackingResult() */
function _normaliseShipment(ship) {
  if (!ship) return null;
  // If ship is already normalised (has .trackingNumber and .origin.city set properly)
  // do a lightweight update rather than full re-normalisation which would clobber
  // origin/destination with flat-column reads that are undefined on normalised objects.
  if (ship._adminManaged && ship.trackingNumber && ship.origin && ship.origin.city && ship.origin.city !== '—') {
    // Already normalised — refresh dynamic fields only, preserve all origin/destination data
    const _lp = window.SyncEngine ? SyncEngine.getShipmentPosition(ship.id || ship.trackingNumber) : null;
    if (_lp && typeof _lp.progress === 'number') ship.progress = _lp.progress;
    // Refresh status text in case status changed
    const _sm2 = {
      pending:{text:'Awaiting Pickup',color:'#eab308'}, picked_up:{text:'Picked Up',color:'#3b82f6'},
      in_transit:{text:'In Transit',color:'#3b82f6'}, 'in-transit':{text:'In Transit',color:'#3b82f6'},
      out_for_delivery:{text:'Out for Delivery',color:'#0891b2'}, delivered:{text:'Delivered',color:'#22c55e'},
      delayed:{text:'Delayed',color:'#ef4444'}, processing:{text:'Processing',color:'#7c3aed'},
    }[ship.status] || { text: ship.status || 'Unknown', color:'#6b7280' };
    ship.statusText  = _sm2.text;
    ship.statusColor = _sm2.color;
    // Ensure shippingMethod is always set (may be missing on first normalise pass)
    if (!ship.shippingMethod || ship.shippingMethod === 'undefined') {
      const _mm = { road:'Road Freight', air:'Air Freight', sea:'Sea Freight' };
      const _tm = ship.transportMode || 'road';
      ship.shippingMethod = _mm[_tm] || 'Road Freight';
    }
    // Ensure dispatchDate is never 'undefined'
    if (!ship.dispatchDate || ship.dispatchDate === 'undefined' || ship.dispatchDate === '—') {
      const _cr = ship.createdAt || ship.created_at || '';
      if (_cr && _cr !== 'undefined') {
        try { ship.dispatchDate = new Date(_cr).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}); }
        catch(e) { ship.dispatchDate = '—'; }
      } else {
        ship.dispatchDate = '—';
      }
    }
    return ship;
  }
  const statusMap = {
    pending:          { text:'Awaiting Pickup',    color:'#eab308' },
    picked_up:        { text:'Picked Up',          color:'#3b82f6' },
    in_transit:       { text:'In Transit',         color:'#3b82f6' },
    'in-transit':     { text:'In Transit',         color:'#3b82f6' },
    out_for_delivery: { text:'Out for Delivery',   color:'#0891b2' },
    delivered:        { text:'Delivered',          color:'#22c55e' },
    delayed:          { text:'Delayed',            color:'#ef4444' },
    processing:       { text:'Processing',         color:'#7c3aed' },
  };
  const methodMap = { road:'Road Freight', air:'Air Freight', sea:'Sea Freight' };
  const sm = statusMap[ship.status] || { text: ship.status || 'Unknown', color:'#6b7280' };

  const livePos = window.SyncEngine ? SyncEngine.getShipmentPosition(ship.id || ship.trackingNumber) : null;

  const timeline = [];
  const rawTl = ship.timeline || ship.timeline_events || [];
  rawTl.forEach(function(ev) {
    timeline.push({
      date: ev.timestamp
        ? new Date(ev.timestamp).toLocaleString('en-AU', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
        : (ev.date || ''),
      status:    ev.title || ev.status || '',
      location:  ev.location || '',
      completed: ['delivered','picked_up','in_transit','out_for_delivery','in-transit','out-for-delivery'].includes(ev.status) || !!ev.completed,
    });
  });

  // Safely parse JSONB fields — they may be strings from Supabase
  function _safeObj(v) {
    if (!v) return {};
    if (typeof v === 'string') { try { return JSON.parse(v); } catch(e) { return {}; } }
    return v;
  }
  const sender   = _safeObj(ship.sender)   || {};
  const receiver = _safeObj(ship.receiver) || {};

  // Build origin — flat columns (origin_city) are the authoritative source for
  // city name because the UPDATE writes to both flat and JSONB columns.
  // Flat columns always reflect the latest edit; JSONB may lag if only flat was written.
  const _rawOrigin = _safeObj(ship.origin) || {};
  const origin = {
    city:   ship.origin_city  || _rawOrigin.city  || '—',
    state:  _rawOrigin.state  || ship.origin_state || '',
    country:_rawOrigin.country || ship.sender_country || 'Australia',
    lat:    _rawOrigin.lat    || (_rawOrigin.coordinates && _rawOrigin.coordinates[0]) || 0,
    lng:    _rawOrigin.lng    || (_rawOrigin.coordinates && _rawOrigin.coordinates[1]) || 0,
    coordinates: _rawOrigin.coordinates || [_rawOrigin.lat||0, _rawOrigin.lng||0],
  };

  // Build destination — same strategy: flat column wins for city name
  const _rawDest = _safeObj(ship.destination) || {};
  const dest = {
    city:   ship.destination_city || _rawDest.city  || '—',
    state:  _rawDest.state  || ship.destination_state || '',
    country:_rawDest.country || ship.receiver_country || 'Australia',
    lat:    _rawDest.lat    || (_rawDest.coordinates && _rawDest.coordinates[0]) || 0,
    lng:    _rawDest.lng    || (_rawDest.coordinates && _rawDest.coordinates[1]) || 0,
    coordinates: _rawDest.coordinates || [_rawDest.lat||0, _rawDest.lng||0],
  };

  // Current location — prefer live position, then DB current_location JSONB, then origin
  const _rawCurLoc = _safeObj(ship.current_location || ship.currentLocation) || {};
  // Guard against the literal string "undefined" being stored in DB
  function _cleanStr(v, fallback) {
    if (!v || v === 'undefined' || v === 'null') return fallback || '';
    return v;
  }
  const curLocMerged = {
    city:    _cleanStr(_rawCurLoc.city, origin.city),
    state:   _cleanStr(_rawCurLoc.state, origin.state || ''),
    country: _cleanStr(_rawCurLoc.country, origin.country || 'Australia'),
    lat:     livePos ? livePos.lat : (_rawCurLoc.lat || (_rawCurLoc.coordinates&&_rawCurLoc.coordinates[0]) || origin.lat || 0),
    lng:     livePos ? livePos.lng : (_rawCurLoc.lng || (_rawCurLoc.coordinates&&_rawCurLoc.coordinates[1]) || origin.lng || 0),
  };

  // Calculate real progress from movement engine
  // Use live progress from DB lookup if available
  let progress = 0;
  if (ship.status === 'delivered') {
    progress = 100;
  } else if (ship._liveProgress !== undefined) {
    progress = ship._liveProgress;
  } else if (livePos && typeof livePos.progress === 'number') {
    progress = livePos.progress;
  } else if (window.SyncEngine && SyncEngine.loadMoveStates) {
    const _msT = SyncEngine.loadMoveStates()[ship.id || ship.trackingNumber];
    // Only count progress if the shipment has actually been started
    if (_msT && _msT.state && _msT.state !== 'idle' && _msT.routeIdx !== undefined && _msT.totalRouteLen) {
      progress = Math.round((_msT.routeIdx / (_msT.totalRouteLen - 1)) * 100);
    }
  }

  const tnRaw   = ship.trackingNumber || ship.tracking_number || '';
  const createdRaw = ship.createdAt   || ship.created_at || '';
  const estDelRaw  = ship.estimatedDelivery || ship.estimated_delivery || '';

  return {
    id:               ship.id,
    trackingNumber:   tnRaw.toUpperCase(),
    status:           ship.status || 'pending',
    statusText:       sm.text,
    statusColor:      sm.color,
    senderName:       sender.name    || ship.sender_name    || '—',
    senderAddress:    [sender.address, sender.city, sender.country].filter(Boolean).join(', ') || '—',
    senderCity:       (function(){ const v = sender.city || origin.city; return (v && v !== 'undefined' && v !== 'null') ? v : '—'; })(),
    senderCountry:    (function(){ const v = sender.country || origin.country; return (v && v !== 'undefined' && v !== 'null') ? v : 'Australia'; })(),
    receiverName:     receiver.name  || ship.receiver_name  || '—',
    receiverAddress:  [receiver.address, receiver.city, receiver.country].filter(Boolean).join(', ') || '—',
    receiverCity:     (function(){ const v = receiver.city || dest.city; return (v && v !== 'undefined' && v !== 'null') ? v : '—'; })(),
    receiverCountry:  (function(){ const v = receiver.country || dest.country; return (v && v !== 'undefined' && v !== 'null') ? v : 'Australia'; })(),
    receiverEmail:    receiver.email || ship.receiver_email || '',
    receiverPhone:    receiver.phone || ship.receiver_phone || '',
    packageType:      ship.packageType  || ship.package_type  || 'General',
    packageName:      ship.packageName  || ship.package_name  || 'Package',
    weight:           ship.weight      || '—',
    dimensions:       ship.dimensions  || '—',
    transportMode:    (function(){ const m = ship.transportMode || ship.transport_mode; return (m && m !== 'undefined' && m !== 'null') ? m : 'road'; })(),
    shippingMethod:   (function(){ const m = ship.transportMode || ship.transport_mode; const mm = (m && m !== 'undefined' && m !== 'null') ? m : 'road'; return methodMap[mm] || 'Road Freight'; })(),
    dispatchDate:     (createdRaw && createdRaw !== 'undefined' && createdRaw !== 'null') ? (function(){ try{ return new Date(createdRaw).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return '—'; } })() : '—',
    estimatedDelivery:estDelRaw  ? new Date(estDelRaw).toLocaleDateString('en-AU',{day:'2-digit',month:'short',year:'numeric'}) : '—',
    currentLocation:  curLocMerged,
    origin,
    destination:      dest,
    progress,
    notes:   ship.notes || '',
    courier: {
      name:    'Express Post ' + (methodMap[ship.transportMode || ship.transport_mode] || 'Road'),
      vehicle: (ship.transportMode||ship.transport_mode) === 'air' ? 'Air Freight Aircraft'
             : (ship.transportMode||ship.transport_mode) === 'sea' ? 'Cargo Vessel' : 'Delivery Truck',
      driver:  'Assigned Driver',
      contact: '+61 493 148 492',
    },
    timeline,
    images:        ship.images || [],
    delayReason:   ship.delayReason    || ship.delay_reason    || null,
    delayTimestamp:ship.delayTimestamp || ship.delay_timestamp || null,
    delayLocation: ship.delayLocation  || ship.delay_location  || null,
    _adminManaged: true,
  };
}

/* Lookup a tracking number from Supabase */
async function lookupShipment(trackingNumber) {
  const tn = (trackingNumber || '').trim().toUpperCase();
  if (!tn) return null;

  // Use SyncEngine which handles cache + DB with ilike (case-insensitive)
  let rawShip = null;
  if (window.SyncEngine && SyncEngine.lookupByTrackingNumber) {
    rawShip = await SyncEngine.lookupByTrackingNumber(tn);
  }

  // Also fetch live movement state from shipment_movement table
  if (rawShip && window.supabaseClient) {
    try {
      const { data: mv } = await window.supabaseClient
        .from('shipment_movement')
        .select('*')
        .eq('shipment_id', rawShip.id)
        .maybeSingle();

      if (mv && mv.route_idx !== undefined) {
        // Inject live position into ship object
        // Use 'let' not 'const' so we can discard a stale route below
        let route = mv.route_geometry
          ? (typeof mv.route_geometry === 'string'
              ? (function(){ try{ return JSON.parse(mv.route_geometry); } catch(e){ return null; } })()
              : mv.route_geometry)
          : null;

        // Validate the stored route still matches the shipment's current
        // origin/destination — reject it if it was left over from a previous edit
        if (route && route.length > 1 && rawShip.origin && rawShip.destination) {
          const _oC = (rawShip.origin && rawShip.origin.coordinates) || [0,0];
          const _dC = (rawShip.destination && rawShip.destination.coordinates) || [0,0];
          const _od = Math.hypot((route[0][0]||0)-(_oC[0]||0), (route[0][1]||0)-(_oC[1]||0));
          const _dd = Math.hypot((route[route.length-1][0]||0)-(_dC[0]||0), (route[route.length-1][1]||0)-(_dC[1]||0));
          if (_od > 2 || _dd > 2) route = null; // discard stale route
        } else if (route && route.length <= 1) {
          route = null;
        }

        if (route && route.length > 1) {
          // Time-correct the position
          let routeIdx = parseFloat(mv.route_idx) || 0;
          if (mv.state === 'running' && mv.last_updated) {
            const elapsed  = (Date.now() - new Date(mv.last_updated).getTime()) / 1000;
            const speedMap = { slow:0.15, normal:0.55, fast:1.2, auto:0.55 };
            const step     = speedMap[mv.speed_key] || 0.55;
            routeIdx = Math.min(routeIdx + (elapsed / 1.5) * step, route.length - 1);
          }
          const idx = Math.min(Math.floor(routeIdx), route.length - 1);
          const pos = route[idx];

          // Resolve nearest AU city
          let city = '';
          const AU = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
          if (AU && pos) {
            let minD = Infinity;
            for (const [name, coords] of Object.entries(AU)) {
              const d = Math.hypot(coords[0]-pos[0], coords[1]-pos[1]);
              if (d < minD) { minD = d; city = name; }
            }
            if (city) city = city.replace(/\w/g, w => w.toUpperCase());
          }

          rawShip.current_location = {
            city: city || (rawShip.origin && rawShip.origin.city) || '',
            lat: pos ? pos[0] : 0, lng: pos ? pos[1] : 0,
            coordinates: pos ? [pos[0], pos[1]] : [0,0]
          };
          rawShip.currentLocation = rawShip.current_location;
          rawShip._liveRouteIdx   = routeIdx;
          rawShip._liveRoute      = route;
          rawShip._liveProgress   = route.length > 1
            ? Math.round((routeIdx / (route.length-1)) * 100) : 0;
          rawShip.status          = mv.state === 'done' ? 'delivered' : (rawShip.status || 'in_transit');
          console.log('[Track] Live position:', city, '— progress:', rawShip._liveProgress + '%');
        }
      }
    } catch(e) { console.warn('[Track] Movement fetch failed:', e.message); }
  }

  if (rawShip) return _normaliseShipment(rawShip);

  // Direct fallback
  const cache = window._shipmentCache || [];
  const cached = cache.find(function(s) {
    return (s.trackingNumber || s.tracking_number || '').toUpperCase() === tn;
  });
  if (cached) return _normaliseShipment(cached);

  const client = window.supabaseClient;
  if (!client) return null;
  const { data, error } = await client
    .from('shipments')
    .select('*')
    .ilike('tracking_number', tn)
    .maybeSingle();
  if (error) { console.error('[lookupShipment]', error.message); return null; }
  return data ? _normaliseShipment(data) : null;
}

/* Sync listener — refresh displayed shipment when admin updates it */
(function() {
  if (!window.SyncEngine) return;
  // Debounce timer — prevents rapid broadcasts from triggering multiple updates
  var _trackingUpdateTimer = null;
  // Track the last status+delay state so map only reinits on genuine changes
  var _lastTrackingStatus = null;
  var _lastTrackingDelay  = null;

  SyncEngine.onUpdate(function(data) {
    // Handle deletion immediately — no debounce needed
    if (data.type === 'shipment_deleted') {
      const resultSec = document.getElementById('tracking-result');
      const inp = document.getElementById('tracking-number-input');
      const tn = inp ? inp.value.trim().toUpperCase() : '';
      if (resultSec && resultSec.classList.contains('show') && tn) {
        const deletedId = (data.deletedId || '').toUpperCase();
        if (deletedId && (tn === deletedId || tn.includes(deletedId) || deletedId.includes(tn))) {
          resultSec.classList.remove('show');
          const nf = document.getElementById('not-found-section');
          if (nf) nf.classList.add('show');
        }
      }
      return;
    }
    if (data.type !== 'shipment_update' && data.type !== 'move_update') return;
    const resultSec = document.getElementById('tracking-result');
    if (!resultSec || !resultSec.classList.contains('show')) return;

    // Debounce: collapse rapid-fire broadcasts into a single update
    // Position ticks fire every 1.5s — we only need to react once per 5s
    if (_trackingUpdateTimer) return; // already queued
    _trackingUpdateTimer = setTimeout(function() {
      _trackingUpdateTimer = null;

      const inp = document.getElementById('tracking-number-input');
      const tn = inp ? inp.value.trim().toUpperCase() : null;
      if (!tn) return;

      // Use cached shipment data if available — avoids a DB round-trip on every tick.
      // Only fall back to lookupShipment for genuine data changes (status / delay).
      const cachedShip = window._currentDisplayedShipment;
      if (cachedShip) {
        // Update progress from live movement state — no DB needed
        const lp = window.SyncEngine && SyncEngine.getShipmentPosition
          ? SyncEngine.getShipmentPosition(cachedShip.id || cachedShip.trackingNumber)
          : null;
        if (lp && typeof lp.progress === 'number') {
          cachedShip.progress = lp.progress;
          // Update progress bar without re-rendering entire result
          const progBar = document.getElementById('live-progress-bar');
          const progPct = document.getElementById('live-progress-pct');
          if (progBar) progBar.style.width = lp.progress + '%';
          if (progPct) progPct.textContent = lp.progress + '%';
        }

        // Check if status or delay changed — only then do a full re-fetch and re-render
        const ms = window.SyncEngine && SyncEngine.loadMoveStates
          ? SyncEngine.loadMoveStates()[cachedShip.id || cachedShip.trackingNumber]
          : null;
        const currentStatus = (ms && ms.state) || cachedShip.status || '';
        const currentDelay  = cachedShip.delayReason || '';
        if (currentStatus === _lastTrackingStatus && currentDelay === _lastTrackingDelay) {
          return; // No meaningful change — skip full re-render
        }
        _lastTrackingStatus = currentStatus;
        _lastTrackingDelay  = currentDelay;
      }

      // Genuine status/delay change — do full lookup and re-render
      lookupShipment(tn).then(function(updShip) {
        if (!updShip) { resultSec.classList.remove('show'); return; }
        window._currentDisplayedShipment = updShip;
        _lastTrackingStatus = updShip.status || '';
        _lastTrackingDelay  = updShip.delayReason || '';

        var existingBanner = document.getElementById('delay-notification-banner');
        var isNowDelayed = (updShip.status||'').toLowerCase().replace(/_/g,'-') === 'delayed';
        if (isNowDelayed && !existingBanner) {
          var banner = document.createElement('div');
          banner.id = 'delay-notification-banner';
          banner.style.cssText = 'background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fde68a;border-radius:.875rem;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:flex-start;gap:.875rem;box-shadow:0 4px 16px rgba(245,158,11,.15)';
          banner.innerHTML = '<div style="flex:1"><div style="font-weight:800;color:#92400e;font-size:.9375rem;margin-bottom:.25rem">Shipment Delayed</div>'
            + '<div style="color:#78350f;font-size:.8125rem;line-height:1.5">' + (updShip.delayReason || 'Your shipment is currently delayed.') + '</div>'
            + (updShip.estimatedDelivery ? '<div style="margin-top:.375rem;font-size:.75rem;color:#b45309;font-weight:600">Updated ETA: ' + updShip.estimatedDelivery + '</div>' : '')
            + '</div>';
          resultSec.insertBefore(banner, resultSec.firstChild);
          if (window.showDelayPopup) setTimeout(function() { window.showDelayPopup(updShip); }, 300);
        } else if (!isNowDelayed && existingBanner) {
          existingBanner.remove();
        }
        // Only reinit map on genuine status change, not on every position tick
        if (window.initAustraliaMap && window.leafletMap) window.initAustraliaMap(updShip);
      });
    }, 5000); // 5s debounce — position ticks are visual-only, handled by animInterval
  });
})();


function getStatusBgColor(s){return{'pending':'#eab308','in-transit':'#3b82f6','delivered':'#22c55e','delayed':'#ef4444','customs':'#f97316'}[s]||'#6b7280';}

function generateBarcodeSVG(tn){
  // Build bar pattern: alternate narrow/wide bars and spaces for each char
  const pattern=[];
  for(let i=0;i<tn.length;i++){
    const code=tn.charCodeAt(i);
    const barW=code%3===0?4:code%2===0?3:2;
    const spaceW=code%4===0?3:code%5===0?2:1;
    pattern.push({type:'bar',w:barW});
    if(i<tn.length-1)pattern.push({type:'space',w:spaceW});
  }
  // Add guard bars
  const guards=[{type:'bar',w:2},{type:'space',w:1},{type:'bar',w:2},{type:'space',w:1}];
  const allBars=[...guards,...pattern,...guards];
  const totalW=allBars.reduce((a,b)=>a+b.w,0);
  let rects='';let x=0;
  allBars.forEach(b=>{
    if(b.type==='bar')rects+=`<rect x="${x}" y="0" width="${b.w}" height="56" fill="#111"/>`;
    x+=b.w;
  });
  const svgW=Math.max(totalW,200);
  const offsetX=Math.round((svgW-totalW)/2);
  let rects2='';let x2=offsetX;
  allBars.forEach(b=>{
    if(b.type==='bar')rects2+=`<rect x="${x2}" y="0" width="${b.w}" height="56" fill="#111"/>`;
    x2+=b.w;
  });
  return `<svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 ${svgW} 56" width="100%" height="56" preserveAspectRatio="xMidYMid meet">${rects2}</svg>`;
}

function generateQRPattern(text){
  const seed=text.split('').reduce((a,c)=>a+c.charCodeAt(0),0);const size=21;let cells='';
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){const isQR=(r<7&&c<7)||(r<7&&c>=size-7)||(r>=size-7&&c<7)||((seed*(r+1)*(c+1))%3===0);if(isQR)cells+=`<rect x="${c*8}" y="${r*8}" width="7" height="7" fill="black"/>`;}
  return `<svg xmlns="https://www.w3.org/2000/svg" width="168" height="168" viewBox="0 0 168 168">${cells}</svg>`;
}

/* ════════════════════════════════════════
   DELAY POPUP NOTIFICATION
   ════════════════════════════════════════ */
var _delayPopupShownFor = {};
window._delayPopupShownFor = _delayPopupShownFor;
window.showDelayPopup = showDelayPopup;

function showDelayPopup(shipment) {
  if (!shipment || !shipment.trackingNumber) return;
  var tn = shipment.trackingNumber;
  // Prevent duplicate popups for same shipment+reason combination in same session
  var popupKey = tn + '|' + (shipment.delayReason||'');
  if (_delayPopupShownFor[popupKey]) return;
  _delayPopupShownFor[popupKey] = true;

  // Remove any existing delay popup
  var existing = document.getElementById('delay-popup-overlay');
  if (existing) existing.remove();

  var reason = shipment.delayReason || 'Your shipment is currently delayed. Our team is working to resolve this as quickly as possible.';
  var eta = shipment.estimatedDelivery ? '<div style="margin-top:.75rem;padding:.5rem .875rem;background:rgba(245,158,11,.15);border-radius:.5rem;font-size:.8125rem;color:#92400e;font-weight:600;">\uD83D\uDCC5 Updated ETA: ' + shipment.estimatedDelivery + '</div>' : '';
  var delayTime = '';
  if (shipment.delayTimestamp) {
    try {
      delayTime = '<div style="margin-top:.375rem;font-size:.75rem;color:#b45309;">Delay recorded: ' + new Date(shipment.delayTimestamp).toLocaleString('en-AU', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) + '</div>';
    } catch(e) {}
  }

  // ── Location block: show where shipment was delayed ──
  var locCity = shipment.delayLocation || (shipment.currentLocation && shipment.currentLocation.city) || '';
  var locState = (!shipment.delayLocation && shipment.currentLocation && shipment.currentLocation.state) ? (', ' + shipment.currentLocation.state) : '';
  var locationBlock = locCity
    ? '<div style="margin-top:.75rem;padding:.625rem .875rem;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.18);border-radius:.625rem;display:flex;align-items:center;gap:.5rem">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
      + '<span style="font-size:.8125rem;color:#991b1b;font-weight:700">Delayed at: ' + locCity + locState + '</span>'
      + '</div>'
    : '';

  var overlay = document.createElement('div');
  overlay.id = 'delay-popup-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:delayFadeIn .25s ease';
  overlay.innerHTML = '<div id="delay-popup-box" style="background:#fff;border-radius:1.25rem;padding:2rem 2.25rem 1.75rem;max-width:430px;width:calc(100% - 2.5rem);box-shadow:0 24px 80px rgba(0,0,0,.25),0 0 0 1px rgba(245,158,11,.2);position:relative;animation:delaySlideUp .3s cubic-bezier(.34,1.56,.64,1)">'
    + '<div style="display:flex;align-items:center;gap:.875rem;margin-bottom:1.25rem">'
    +   '<div style="width:3.25rem;height:3.25rem;border-radius:1rem;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 16px rgba(245,158,11,.3)">'
    +     '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    +   '</div>'
    +   '<div><div style="font-size:1.0625rem;font-weight:800;color:#92400e;letter-spacing:-.01em">Shipment Delayed</div>'
    +   '<div style="font-size:.8rem;color:#b45309;margin-top:.1rem;font-weight:600;">Tracking #' + tn + '</div></div>'
    + '</div>'
    + '<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1.5px solid #fde68a;border-radius:.875rem;padding:1rem 1.125rem;margin-bottom:.5rem">'
    +   '<div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#b45309;margin-bottom:.375rem">Delay Reason</div>'
    +   '<div style="font-size:.875rem;color:#78350f;line-height:1.55;font-weight:500">' + reason + '</div>'
    +   delayTime
    + '</div>'
    + locationBlock
    + eta
    + '<div style="margin-top:1.25rem;display:flex;gap:.625rem">'
    +   '<button onclick="document.getElementById(\'delay-popup-overlay\').remove()" style="flex:1;padding:.65rem 1rem;background:linear-gradient(135deg,#d97706,#b45309);color:#fff;border:none;border-radius:.75rem;font-size:.875rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(217,119,6,.35)">Got it</button>'
    + '</div>'
    + '<button onclick="document.getElementById(\'delay-popup-overlay\').remove()" style="position:absolute;top:.875rem;right:.875rem;background:rgba(0,0,0,.06);border:none;border-radius:.5rem;width:1.75rem;height:1.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#6b7280;line-height:1">\xd7</button>'
    + '</div>';

  // Close on overlay click
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  // Inject keyframe animations once
  if (!document.getElementById('delay-popup-styles')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'delay-popup-styles';
    styleEl.textContent = '@keyframes delayFadeIn{from{opacity:0}to{opacity:1}}@keyframes delaySlideUp{from{opacity:0;transform:translateY(28px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}';
    document.head.appendChild(styleEl);
  }

  document.body.appendChild(overlay);
}

/* ════════════════════════════════════════
   PDF GENERATION
   ════════════════════════════════════════ */
function generateShipmentPDF(shipment){
  const timelineRows=shipment.timeline.map(ev=>`
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:7px 10px;font-size:11px;color:${ev.completed?'#111':'#9ca3af'}">${ev.date}</td>
      <td style="padding:7px 10px;font-size:11px;font-weight:${ev.completed?'600':'400'};color:${ev.completed?'#111':'#9ca3af'}">${ev.status}</td>
      <td style="padding:7px 10px;font-size:11px;color:${ev.completed?'#374151':'#9ca3af'}">${ev.location}</td>
      <td style="padding:7px 10px;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:${ev.completed?'#111':'#f3f4f6'};color:${ev.completed?'#fff':'#9ca3af'}">${ev.completed?'DONE':'PENDING'}</span></td>
    </tr>`).join('');

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Shipment – ${shipment.trackingNumber}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;background:#fff;color:#111;font-size:12px;line-height:1.5;}
  .page{width:210mm;min-height:297mm;margin:0 auto;padding:14mm 16mm;background:#fff;}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:3px solid #111;margin-bottom:18px;}
  .co{font-size:26px;font-weight:900;letter-spacing:-1px;}.co span{font-weight:300;}
  .co-sub{font-size:10px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:.05em;}
  .co-contact{font-size:10px;color:#6b7280;margin-top:6px;}
  .dtitle{text-align:right;}.dtitle h2{font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1px;}
  .dtitle .tnum{font-family:monospace;font-size:13px;font-weight:700;color:#374151;margin-top:4px;}
  .dtitle .ddate{font-size:10px;color:#6b7280;margin-top:3px;}
  .sbar{display:flex;align-items:center;justify-content:space-between;background:#111;color:#fff;padding:10px 16px;border-radius:6px;margin-bottom:16px;}
  .sbar-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;opacity:.7;}
  .sbar-val{font-size:13px;font-weight:700;margin-top:2px;}
  .sbadge{background:#fff;color:#111;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;}
  .prog-row{display:flex;justify-content:space-between;font-size:10px;color:#6b7280;margin-bottom:4px;}
  .prog-bg{background:#f3f4f6;border-radius:99px;height:10px;overflow:hidden;margin-bottom:16px;}
  .prog-fill{height:100%;background:#111;border-radius:99px;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
  .card{border:1px solid #e5e7eb;border-radius:6px;padding:12px 14px;}
  .card-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;border-bottom:1px solid #f3f4f6;padding-bottom:5px;margin-bottom:8px;}
  .row{margin-bottom:5px;}.key{font-size:10px;color:#6b7280;}.val{font-size:11px;color:#111;font-weight:600;margin-top:1px;}
  .sec-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:#111;color:#fff;padding:6px 12px;border-radius:4px 4px 0 0;}
  table{width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none;margin-bottom:16px;}
  th{background:#f9fafb;padding:7px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#374151;border-bottom:2px solid #e5e7eb;}
  .sig-section{border:1px solid #e5e7eb;border-radius:6px;padding:12px 14px;margin-bottom:16px;}
  .sig-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;color:#374151;}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
  .sig-box{border-bottom:1.5px solid #111;height:48px;}
  .sig-lbl{font-size:9px;color:#6b7280;margin-top:5px;text-transform:uppercase;letter-spacing:.05em;}
  .name-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:12px;}
  .name-lbl{font-size:10px;color:#6b7280;margin-bottom:3px;}
  .name-line{border-bottom:1px solid #e5e7eb;height:22px;}
  .footer{border-top:2px solid #111;padding-top:10px;display:flex;justify-content:space-between;align-items:flex-end;}
  .footer-l,.footer-r{font-size:9px;color:#6b7280;}
  .footer-r{text-align:right;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style></head><body><div class="page">
  <div class="hdr">
    <div><div class="co">EXPRESS POST<span> AUSTRALIA</span></div><div class="co-sub">Australia's Premier Courier &amp; Freight Solutions</div><div class="co-contact">ABN: 28 864 970 579 &nbsp;|&nbsp; +61 493 148 492 &nbsp;|&nbsp; info@expresspostaustralia.com &nbsp;|&nbsp; expresspostaustralia.com</div></div>
    <div class="dtitle"><h2>Shipment Receipt</h2><div class="tnum">${shipment.trackingNumber}</div><div class="ddate">Issued: ${new Date().toLocaleDateString('en-AU',{day:'2-digit',month:'long',year:'numeric'})}</div></div>
  </div>
  <div class="sbar" style="${(shipment.status||'').toLowerCase()==='delayed'?'background:linear-gradient(135deg,#d97706,#b45309)':''}">
    <div><div class="sbar-lbl">Current Status</div><div class="sbar-val">${shipment.statusText.toUpperCase()} — ${shipment.currentLocation.city||'—'}, ${shipment.currentLocation.state||''}</div></div>
    <div><div class="sbar-lbl" style="text-align:right">Progress</div><div class="sbar-val" id="live-progress-pct-alt"><span id="live-progress-num">${typeof shipment.progress==='number'?shipment.progress:0}</span>% Complete</div></div>
    <div><span class="sbadge" style="${(shipment.status||'').toLowerCase()==='delayed'?'background:#fff;color:#b45309;border:2px solid #fde68a':''}">${shipment.statusText}</span></div>
  </div>
  ${(()=>{
    if((shipment.status||'').toLowerCase()!=='delayed') return '';
    const dr = shipment.delayReason||'Logistics Issues';
    let dtStr = '';
    if(shipment.delayTimestamp){try{dtStr='<div style="font-size:10px;color:#b45309;margin-bottom:3px"><strong>Delay Recorded:</strong> '+new Date(shipment.delayTimestamp).toLocaleString('en-AU',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})+'</div>';}catch(e){dtStr='';}}
    const etaStr = shipment.estimatedDelivery ? '<div style="font-size:10px;color:#92400e;font-weight:700;margin-top:4px">Updated ETA: '+shipment.estimatedDelivery+'</div>' : '';
    return '<div style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2.5px solid #f59e0b;border-radius:8px;padding:14px 18px;margin-bottom:16px;display:flex;gap:14px;align-items:flex-start;">'
      +'<div style="width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
      +'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      +'</div>'
      +'<div style="flex:1">'
      +'<div style="font-size:13px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">⚠ SHIPMENT DELAYED</div>'
      +'<div style="font-size:11px;color:#78350f;margin-bottom:5px"><strong>Delay Reason:</strong> '+dr+'</div>'
      +dtStr+etaStr
      +'<div style="font-size:10px;color:#b45309;margin-top:5px;font-style:italic">This shipment is temporarily on hold. Movement paused until delay is resolved.</div>'
      +'</div></div>';
  })()}
  <div class="prog-row"><span>${shipment.origin.city}, ${shipment.origin.state||''}</span><span>Delivery Progress: ${typeof shipment.progress==='number'?shipment.progress:0}%</span><span>${shipment.destination.city}, ${shipment.destination.state||''}</span></div>
  <div class="prog-bg"><div class="prog-fill" id="live-progress-bar" style="width:${typeof shipment.progress==='number'?shipment.progress:0}%"></div></div>
  <div class="grid2">
    <div class="card"><div class="card-title">▲ Sender (Origin)</div>
      <div class="row"><div class="key">Company / Name</div><div class="val">${shipment.senderName}</div></div>
      <div class="row"><div class="key">Address</div><div class="val">${shipment.senderAddress}</div></div>
      <div class="row"><div class="key">Origin City</div><div class="val">${shipment.origin.city}, ${shipment.origin.state||''}</div></div>
    </div>
    <div class="card"><div class="card-title">▼ Recipient (Destination)</div>
      <div class="row"><div class="key">Company / Name</div><div class="val">${shipment.receiverName}</div></div>
      <div class="row"><div class="key">Address</div><div class="val">${shipment.receiverAddress}</div></div>
      <div class="row"><div class="key">Destination City</div><div class="val">${shipment.destination.city}, ${shipment.destination.state||''}</div></div>
      ${shipment.receiverEmail?`<div class="row"><div class="key">Email</div><div class="val">${shipment.receiverEmail}</div></div>`:''}
      ${shipment.receiverPhone?`<div class="row"><div class="key">Phone</div><div class="val">${shipment.receiverPhone}</div></div>`:''}
    </div>
  </div>
  <div class="grid2">
    <div class="card"><div class="card-title">📦 Package Details</div>
      <div class="row"><div class="key">Package Type</div><div class="val">${shipment.packageType}</div></div>
      <div class="row"><div class="key">Weight</div><div class="val">${shipment.weight}</div></div>
      <div class="row"><div class="key">Dimensions</div><div class="val">${shipment.dimensions}</div></div>
      <div class="row"><div class="key">Shipping Method</div><div class="val">${shipment.shippingMethod}</div></div>
      ${shipment.notes?`<div class="row"><div class="key">Special Instructions</div><div class="val">${shipment.notes}</div></div>`:''}
    </div>
    <div class="card"><div class="card-title">🚚 Courier Details</div>
      <div class="row"><div class="key">Courier Service</div><div class="val">${shipment.courier?.name||'Express Post Australia'}</div></div>
      <div class="row"><div class="key">Vehicle / Asset</div><div class="val">${shipment.courier?.vehicle||'–'}</div></div>
      <div class="row"><div class="key">Driver / Handler</div><div class="val">${shipment.courier?.driver||'–'}</div></div>
      <div class="row"><div class="key">Dispatch Date</div><div class="val">${shipment.dispatchDate}</div></div>
      <div class="row"><div class="key">Est. Delivery Date</div><div class="val">${shipment.estimatedDelivery}</div></div>
    </div>
  </div>
  <div class="sec-title">Shipment Timeline &amp; History</div>
  <table><thead><tr><th>Date &amp; Time</th><th>Status Update</th><th>Location</th><th style="text-align:center">State</th></tr></thead><tbody>${timelineRows}</tbody></table>
  <div class="sig-section">
    <div class="sig-title">Proof of Delivery &amp; Authorisation</div>
    <div class="sig-grid"><div><div class="sig-box"></div><div class="sig-lbl">Recipient Signature</div></div><div><div class="sig-box"></div><div class="sig-lbl">Axon Agent Signature</div></div></div>
    <div class="name-grid"><div><div class="name-lbl">Recipient Full Name (Print)</div><div class="name-line"></div></div><div><div class="name-lbl">Date &amp; Time Received</div><div class="name-line"></div></div></div>
  </div>
  <div class="footer">
    <div class="footer-l"><strong>EXPRESS POST AUSTRALIA PTY LTD</strong><br>Level 12, 1 Bligh Street, Sydney NSW 2000 | ABN: 28 864 970 579<br>This document is computer-generated and valid without a handwritten signature unless otherwise stated.</div>
    <div class="footer-r"><strong>${shipment.trackingNumber}</strong><br>Generated: ${new Date().toLocaleString('en-AU')}<br>© ${new Date().getFullYear()} Express Post Australia Pty Ltd</div>
  </div>
  </div></body></html>`;

  const win=window.open('','_blank','width=900,height=750');
  win.document.write(html);win.document.close();win.focus();
  setTimeout(()=>win.print(),700);
}

/* ════════════════════════════════════════
   AUSTRALIA MAP — Professional Road Map
   ════════════════════════════════════════ */
let leafletMap=null;
let mapAnimations=[];

// Australian city waypoints for interpolation along routes
const AU_ROUTE_WAYPOINTS = [
  {city:'Sydney',state:'NSW',lat:-33.8688,lng:151.2093},
  {city:'Canberra',state:'ACT',lat:-35.2809,lng:149.1300},
  {city:'Albury',state:'NSW',lat:-36.0737,lng:146.9135},
  {city:'Melbourne',state:'VIC',lat:-37.8136,lng:144.9631},
  {city:'Adelaide',state:'SA',lat:-34.9285,lng:138.6007},
  {city:'Perth',state:'WA',lat:-31.9505,lng:115.8605},
  {city:'Brisbane',state:'QLD',lat:-27.4698,lng:153.0251},
  {city:'Cairns',state:'QLD',lat:-16.9186,lng:145.7781},
  {city:'Darwin',state:'NT',lat:-12.4634,lng:130.8456},
  {city:'Hobart',state:'TAS',lat:-42.8821,lng:147.3272},
  {city:'Gold Coast',state:'QLD',lat:-28.0167,lng:153.4000},
  {city:'Newcastle',state:'NSW',lat:-32.9283,lng:151.7817},
  {city:'Wollongong',state:'NSW',lat:-34.4278,lng:150.8931},
  {city:'Ballarat',state:'VIC',lat:-37.5622,lng:143.8503},
  {city:'Geelong',state:'VIC',lat:-38.1499,lng:144.3617},
  {city:'Toowoomba',state:'QLD',lat:-27.5598,lng:151.9507},
  {city:'Townsville',state:'QLD',lat:-19.2576,lng:146.8177},
  {city:'Wagga Wagga',state:'NSW',lat:-35.1082,lng:147.3598},
  {city:'Port Augusta',state:'SA',lat:-32.4936,lng:137.7714},
  {city:'Alice Springs',state:'NT',lat:-23.6980,lng:133.8807},
  {city:'Kalgoorlie',state:'WA',lat:-30.7489,lng:121.4664},
  {city:'Broome',state:'WA',lat:-17.9614,lng:122.2359},
  {city:'Rockhampton',state:'QLD',lat:-23.3791,lng:150.5100},
  {city:'Mackay',state:'QLD',lat:-21.1411,lng:149.1861},
  {city:'Bendigo',state:'VIC',lat:-36.7570,lng:144.2794},
  {city:'Mount Gambier',state:'SA',lat:-37.8290,lng:140.7829},
  {city:'Coffs Harbour',state:'NSW',lat:-30.2963,lng:153.1135},
  {city:'Dubbo',state:'NSW',lat:-32.2569,lng:148.6011},
  {city:'Tamworth',state:'NSW',lat:-31.0927,lng:150.9320},
  {city:'Launceston',state:'TAS',lat:-41.4332,lng:147.1441},
];

function getNearestCity(lat, lng) {
  let nearest = AU_ROUTE_WAYPOINTS[0];
  let minDist = Infinity;
  AU_ROUTE_WAYPOINTS.forEach(c => {
    const d = Math.sqrt(Math.pow(c.lat-lat,2)+Math.pow(c.lng-lng,2));
    if(d < minDist){ minDist=d; nearest=c; }
  });
  return nearest;
}

/* ═══════════════════════════════════════════════════════════════════
   PROFESSIONAL LOGISTICS TRACKING MAP — FedEx/DHL/Amazon Quality
   ─ Real OSM tiles with all suburbs/towns/roads
   ─ OSRM real road routing (no fake straight lines)
   ─ Animated truck icon following exact route geometry
   ─ Blue origin truck + red destination pin
   ─ Admin sync: pause/resume/delay reflected instantly
   ═══════════════════════════════════════════════════════════════════ */

// Inject map CSS
(function(){
  if(document.getElementById('pro-map-css'))return;
  const s=document.createElement('style');
  s.id='pro-map-css';
  s.textContent=`
    #leaflet-map { height:480px !important; min-height:480px !important; background:#e8edf2; border-radius:0 0 .75rem .75rem; display:block !important; }
    @keyframes proMapPulse{0%{transform:scale(1);opacity:.8}60%{transform:scale(1.8);opacity:.15}100%{transform:scale(2.2);opacity:0}}
    @keyframes proTruckBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    .pro-map-legend{position:absolute;bottom:.75rem;left:.75rem;z-index:1000;background:rgba(255,255,255,.97);border-radius:.625rem;padding:.625rem .875rem;box-shadow:0 4px 16px rgba(0,0,0,.13);backdrop-filter:blur(10px);border:1px solid rgba(0,0,0,.07)}
    .pro-map-legend p{font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.375rem;color:#374151}
    .pro-map-legend-row{display:flex;align-items:center;gap:.375rem;font-size:.76rem;color:#374151;margin-bottom:.22rem;font-weight:500}
    .pro-map-badge{position:absolute;top:.75rem;right:.75rem;z-index:1000;background:rgba(255,255,255,.97);border-radius:.5rem;padding:.45rem .75rem;display:flex;align-items:center;gap:.375rem;box-shadow:0 2px 10px rgba(0,0,0,.12);backdrop-filter:blur(8px);font-size:.8125rem;font-weight:600;color:#374151;border:1px solid rgba(0,0,0,.07)}
    .pro-live-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:proMapPulse 1.6s ease-out infinite;flex-shrink:0}
    .pro-delay-dot{width:8px;height:8px;border-radius:50%;background:#d97706;flex-shrink:0}
    .pro-route-card{background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:.75rem;padding:.75rem 1rem;margin-top:.75rem;font-size:.8125rem;color:#374151}
    .pro-route-card strong{color:#1d4ed8}
    .pro-live-badge{display:inline-flex;align-items:center;gap:.35rem;background:#dcfce7;color:#15803d;font-size:.7rem;font-weight:700;letter-spacing:.5px;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .pro-delay-badge{display:inline-flex;align-items:center;gap:.35rem;background:#fef3c7;color:#d97706;font-size:.7rem;font-weight:700;letter-spacing:.5px;padding:2px 8px;border-radius:20px;text-transform:uppercase}
    .leaflet-popup-content-wrapper{border-radius:.75rem!important;box-shadow:0 8px 30px rgba(0,0,0,.15)!important;border:1px solid rgba(0,0,0,.07)!important}
    .leaflet-popup-tip{background:white!important}
  `;
  document.head.appendChild(s);
})();

// ─ OSRM Route Cache
const _osmRouteCache = {};

async function _fetchOSRMRoute(from, to){
  const key = from[0].toFixed(3)+','+from[1].toFixed(3)+':'+to[0].toFixed(3)+','+to[1].toFixed(3);
  if(_osmRouteCache[key]) return _osmRouteCache[key];
  try{
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const r = await fetch(url, {signal: AbortSignal.timeout(10000)});
    if(!r.ok) return null;
    const d = await r.json();
    if(!d.routes || !d.routes[0]) return null;
    const pts = d.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]);
    _osmRouteCache[key] = pts;
    return pts;
  }catch(e){ return null; }
}

function _buildFallbackRoute(from, to, n=120){
  // Smooth bezier fallback following road-like curves
  n = n || 120;
  const dlat=to[0]-from[0], dlng=to[1]-from[1];
  const dist=Math.sqrt(dlat*dlat+dlng*dlng);
  if(dist < 3){
    // Short route — gentle curve
    const ctrl=[(from[0]+to[0])/2 + dlng*0.1, (from[1]+to[1])/2 - dlat*0.1];
    const pts=[];
    for(let i=0;i<=n;i++){const t=i/n;pts.push([(1-t)**2*from[0]+2*(1-t)*t*ctrl[0]+t*t*to[0],(1-t)**2*from[1]+2*(1-t)*t*ctrl[1]+t*t*to[1]]);}
    return pts;
  }
  // Longer route — two control points
  const w1=[from[0]+dlat*0.33+dlng*0.05, from[1]+dlng*0.33-dlat*0.05];
  const w2=[from[0]+dlat*0.66-dlng*0.05, from[1]+dlng*0.66+dlat*0.05];
  const all=[from,w1,w2,to]; const pts=[]; const seg=Math.floor(n/3);
  for(let s=0;s<3;s++){
    const a=all[s],b=all[s+1],ctrl=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const cnt=s===2?seg+1:seg;
    for(let i=0;i<cnt;i++){const t=i/seg;pts.push([(1-t)**2*a[0]+2*(1-t)*t*ctrl[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*ctrl[1]+t*t*b[1]]);}
  }
  return pts;
}

// ─ Air route: proper great-circle arc (curved flight path over globe)
function _buildAirRoute(from, to, n=160){
  const r1=from[0]*Math.PI/180, g1=from[1]*Math.PI/180;
  const r2=to[0]*Math.PI/180, g2=to[1]*Math.PI/180;
  const d=2*Math.asin(Math.sqrt(Math.pow(Math.sin((r2-r1)/2),2)+Math.cos(r1)*Math.cos(r2)*Math.pow(Math.sin((g2-g1)/2),2)));
  const pts=[];
  for(let i=0;i<=n;i++){
    const t=i/n;
    if(d<0.0001){pts.push([from[0]+t*(to[0]-from[0]),from[1]+t*(to[1]-from[1])]);continue;}
    const A=Math.sin((1-t)*d)/Math.sin(d), B=Math.sin(t*d)/Math.sin(d);
    const x=A*Math.cos(r1)*Math.cos(g1)+B*Math.cos(r2)*Math.cos(g2);
    const y=A*Math.cos(r1)*Math.sin(g1)+B*Math.cos(r2)*Math.sin(g2);
    const z=A*Math.sin(r1)+B*Math.sin(r2);
    pts.push([Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI, Math.atan2(y,x)*180/Math.PI]);
  }
  return pts;
}

// ─ Sea route: ocean shipping lane routing with major waypoints
function _buildSeaRoute(from, to, n=160){
  // Key ocean waypoints: strait/canal checkpoints
  const WP={
    suez:[30.5,32.3],hormuz:[26.5,56.5],malacca:[2.5,102.0],bab:[12.5,43.5],
    gibraltar:[35.9,-5.5],dover:[51.0,1.4],capeGood:[-34.5,19.0],
    atlMid:[20.0,-30.0],indMid:[-10.0,80.0],medMid:[35.0,18.0],
    pacNorth:[50.0,-170.0],atlNorth:[50.0,-40.0],caribbean:[15.0,-75.0],
    redSea:[20.0,38.0],ausSouth:[-38.0,130.0]
  };
  const inBox=(pt,s,w,n2,e)=>pt[0]>=s&&pt[0]<=n2&&pt[1]>=w&&pt[1]<=e;
  const fE=inBox(from,35,-12,72,42), fA=inBox(from,1,60,55,150);
  const fO=inBox(from,-50,110,0,180);
  const tE=inBox(to,35,-12,72,42), tA=inBox(to,1,60,55,150);
  const tO=inBox(to,-50,110,0,180);
  let wps=[from];
  if((fE||inBox(from,15,-80,72,-10))&&(tA||tO)){
    wps.push(WP.gibraltar,WP.medMid,WP.suez,WP.redSea,WP.bab,WP.indMid);
    if(to[1]>100) wps.push(WP.malacca);
  } else if((tE||inBox(to,15,-80,72,-10))&&(fA||fO)){
    if(fO) wps.push(WP.ausSouth);
    wps.push(WP.indMid,WP.bab,WP.redSea,WP.suez,WP.medMid,WP.gibraltar);
  } else if(fO&&tO){
    wps.push(WP.ausSouth);
  } else {
    const m=[(from[0]+to[0])/2,(from[1]+to[1])/2];
    wps.push([m[0]-(to[1]-from[1])*0.2, m[1]+(to[0]-from[0])*0.2]);
  }
  wps.push(to);
  // Catmull-Rom spline through waypoints
  const pts=[]; const segN=wps.length-1; const pps=Math.ceil(n/segN);
  for(let s=0;s<segN;s++){
    const p0=wps[Math.max(0,s-1)],p1=wps[s],p2=wps[s+1],p3=wps[Math.min(segN,s+2)];
    const cnt=s===segN-1?pps+1:pps;
    for(let i=0;i<cnt;i++){
      const t=i/pps;
      const lat=0.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t*t+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t*t*t);
      const lng=0.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t*t+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t*t*t);
      pts.push([lat,lng]);
    }
  }
  return pts;
}

// ─ Professional Icon Factories
function _makeOriginMarker(){
  return L.divIcon({
    className:'',
    html:`<div style="position:relative;width:46px;height:46px">
      <div style="position:absolute;inset:-6px;background:rgba(37,99,235,.15);border-radius:50%;animation:proMapPulse 2.4s ease-out infinite"></div>
      <div style="width:46px;height:46px;background:linear-gradient(145deg,#1e40af,#2563eb);border:3px solid white;border-radius:50%;box-shadow:0 4px 18px rgba(37,99,235,.5),0 0 0 2px rgba(37,99,235,.2);display:flex;align-items:center;justify-content:center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);background:#1e40af;color:white;font-size:9px;font-weight:800;padding:3px 9px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);letter-spacing:.6px">ORIGIN</div>
    </div>`,
    iconSize:[46,46], iconAnchor:[23,23]
  });
}

function _makeDestMarker(){
  return L.divIcon({
    className:'',
    html:`<div style="position:relative;width:38px;height:48px">
      <div style="position:absolute;top:-4px;inset-x:-4px;height:56px;background:rgba(220,38,38,.12);border-radius:50%;animation:proMapPulse 2.4s ease-out infinite .5s"></div>
      <svg width="38" height="48" viewBox="0 0 38 48" fill="none" style="filter:drop-shadow(0 5px 12px rgba(220,38,38,.45))">
        <path d="M19 2C10.7 2 4 8.7 4 17c0 10.5 15 29 15 29s15-18.5 15-29C34 8.7 27.3 2 19 2z" fill="#dc2626" stroke="white" stroke-width="2"/>
        <circle cx="19" cy="17" r="7" fill="white" opacity=".95"/>
        <circle cx="19" cy="17" r="3.5" fill="#dc2626"/>
      </svg>
      <div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);background:#dc2626;color:white;font-size:9px;font-weight:800;padding:3px 9px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);letter-spacing:.6px">DESTINATION</div>
    </div>`,
    iconSize:[38,48], iconAnchor:[19,48]
  });
}

function _makeTruckIcon(color, label, isDelayed, transportMode){
  const glowColor = isDelayed ? '#f59e0b' : color;
  const vehicleSVG = (transportMode === 'air')
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`
    : (transportMode === 'sea')
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6"/><path d="M12 10v4M12 2v3"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
  return L.divIcon({
    className:'',
    html:`<div style="position:relative;width:44px;height:44px">
      <div style="position:absolute;inset:-7px;background:${glowColor}20;border-radius:50%;animation:proMapPulse ${isDelayed?'0.8s':'2s'} ease-out infinite"></div>
      <div style="width:44px;height:44px;background:linear-gradient(145deg,${color},${color}dd);border:3px solid white;border-radius:50%;box-shadow:0 4px 20px ${glowColor}60,0 0 0 2px ${glowColor}30;display:flex;align-items:center;justify-content:center;animation:proTruckBounce 2s ease-in-out infinite">
        ${vehicleSVG}
      </div>
      ${label?`<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${color};color:white;font-size:8px;font-weight:800;padding:2px 7px;border-radius:4px;white-space:nowrap;letter-spacing:.5px;box-shadow:0 2px 8px rgba(0,0,0,.3)">${label}</div>`:''}
    </div>`,
    iconSize:[44,44], iconAnchor:[22,22]
  });
}

async function initAustraliaMap(shipment){
  if(leafletMap){leafletMap.remove();leafletMap=null;}
  // Clear ALL map animation intervals (including named ones from _animKey pattern)
  mapAnimations.forEach(id=>clearInterval(id));mapAnimations=[];
  // Clear any named animation timers for this shipment
  const _animKeyClear = 'mapAnim_' + (shipment.id || shipment.trackingNumber);
  if(window[_animKeyClear]){ clearInterval(window[_animKeyClear]); window[_animKeyClear] = null; }
  const container=document.getElementById('leaflet-map');
  if(!container||typeof L==='undefined'){
    console.warn('[Map] container or Leaflet not ready');
    return;
  }

  // Ensure container has height before init
  if(!container.clientHeight || container.clientHeight < 10){
    container.style.height = '480px';
    container.style.minHeight = '480px';
  }

  /* ── RESOLVE COORDINATES FIRST — before map init so center is correct ── */
  let from = [-33.865, 151.209]; // Sydney default
  let to   = [-37.813, 144.963]; // Melbourne default

  // Resolve coordinates from any available source
  function _resolveFromGeo(obj){
    if(!obj) return null;
    // Use existing valid coords
    if(obj.lat && obj.lng && (Math.abs(obj.lat)>0.01 || Math.abs(obj.lng)>0.01)) return [obj.lat, obj.lng];
    if(obj.coordinates && obj.coordinates[0] && Math.abs(obj.coordinates[0])>0.01) return [obj.coordinates[0], obj.coordinates[1]];
    const AU  = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
    const WC  = window.LiveRoutes && window.LiveRoutes.WORLD_COORDS;
    const city  = ((obj.city||obj.state||obj.country||'')).toLowerCase().trim();
    const state = ((obj.state||'')).toLowerCase().trim();
    // Search all available geocode tables
    for(const dict of [AU, WC].filter(Boolean)){
      if(dict[city]) return [...dict[city]];
      if(state && dict[state]) return [...dict[state]];
      for(const [name,c] of Object.entries(dict)){
        if(city && (city.includes(name)||name.includes(city))) return [...c];
      }
    }
    // Last resort: default to centre of Australia
    // (This is an Australia-only platform — never resolve to other countries)
    return [-25.274, 133.775]; // Australia centre
  }
  // Try raw lat/lng first
  const _rawFrom = [shipment.origin&&(shipment.origin.lat||0), shipment.origin&&(shipment.origin.lng||0)];
  const _rawTo   = [shipment.destination&&(shipment.destination.lat||0), shipment.destination&&(shipment.destination.lng||0)];
  if(_rawFrom[0] && Math.abs(_rawFrom[0])>0.01) from = _rawFrom;
  if(_rawTo[0]   && Math.abs(_rawTo[0])>0.01)   to   = _rawTo;
  // Then try full geo resolution
  from = _resolveFromGeo(shipment.origin)      || from;
  to   = _resolveFromGeo(shipment.destination) || to;
  // Final fallback — never [0,0]
  if(!from || (Math.abs(from[0])<0.01 && Math.abs(from[1])<0.01)) from = [-33.865, 151.209];
  if(!to   || (Math.abs(to[0])<0.01   && Math.abs(to[1])<0.01))   to   = [-37.813, 144.963];

  /* ── MAP INIT — AFTER coordinates resolved ── */
  const _auCenter = [(from[0]+to[0])/2, (from[1]+to[1])/2];
  const _auZoom   = 5;

  const map=L.map('leaflet-map',{
    center: [-25.2744, 133.7751], zoom: 5, minZoom:5, maxZoom:18,
    scrollWheelZoom:true,
    maxBounds: L.latLngBounds(L.latLng(-44.5, 111.0), L.latLng(-9.0, 155.0)),
    maxBoundsViscosity: 1.0,
    zoomControl:true,
    preferCanvas:false,
  });
  leafletMap=map;

  // CartoDB Voyager — clean roadmap style, Australia-detail
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains:'abcd', maxZoom:19
  }).addTo(map);

  // Fit map to show both origin and destination — always stay within Australia
  try {
    map.fitBounds(L.latLngBounds([from, to]).pad(0.25), { minZoom:5, maxZoom:10, animate:false });
  } catch(e) {
    map.setView([-25.2744, 133.7751], 5);
  }

  const isDelayed = (shipment.status||'').toLowerCase().replace(/_/g,'-') === 'delayed';
  const isDelivered = shipment.status === 'delivered';
  const isActive = ['in-transit','in_transit','picked_up','out_for_delivery','out-for-delivery'].includes(shipment.status);
  const trackColor = isDelayed ? '#f59e0b' : isDelivered ? '#059669' : '#2563eb';

  /* ── FETCH ROUTE — matches transport mode (air/sea/road) ── */
  let route = null;
  const routeTransportMode = shipment.transportMode || 'road';

  // 1. Check shared SyncEngine route cache — validate against current coordinates
  //    to avoid drawing a stale route left over from before an origin/destination edit
  if(window.SyncEngine && SyncEngine.loadRoutes){
    const stored = SyncEngine.loadRoutes();
    const id = shipment.id || shipment.trackingNumber;
    const cached = stored && stored[id];
    if(cached && cached.length > 10){
      const originDrift = Math.hypot((cached[0][0]||0)-(from[0]||0), (cached[0][1]||0)-(from[1]||0));
      const destDrift   = Math.hypot((cached[cached.length-1][0]||0)-(to[0]||0), (cached[cached.length-1][1]||0)-(to[1]||0));
      if(originDrift <= 2 && destDrift <= 2) route = cached;
      else {
        // Stale — evict so it is regenerated from the new cities
        delete stored[id];
        if(window._routeCache) delete window._routeCache[id];
      }
    }
  }

  // 2. Generate route based on transport mode
  if(!route){
    if(routeTransportMode === 'air'){
      // Great-circle arc for air shipments (curved line over globe)
      route = _buildAirRoute(from, to, 160);
    } else if(routeTransportMode === 'sea'){
      // Ocean lane routing for sea shipments
      route = _buildSeaRoute(from, to, 160);
    } else {
      // Road: try real OSRM routing first
      route = await _fetchOSRMRoute(from, to);
    }
  }

  // 3. Fallback smooth bezier
  if(!route || route.length < 3){
    route = _buildFallbackRoute(from, to, 140);
  }

  // Cache for admin sync
  if(window.SyncEngine && SyncEngine.saveRoutes){
    const stored = SyncEngine.loadRoutes() || {};
    stored[shipment.id || shipment.trackingNumber] = route;
    SyncEngine.saveRoutes(stored);
  }

  /* ── DETERMINE CURRENT POSITION ON ROUTE ── */
  let progress = (shipment.progress || 5) / 100;
  if(isDelivered) progress = 1;

  // Live admin movement engine position takes priority
  if(window.SyncEngine && SyncEngine.getShipmentPosition){
    const lp = SyncEngine.getShipmentPosition(shipment.id || shipment.trackingNumber);
    if(lp && lp.progress !== undefined) progress = lp.progress / 100;
  }
  if(window.SyncEngine && SyncEngine.loadMoveStates){
    const ms = SyncEngine.loadMoveStates();
    const st = ms[shipment.id || shipment.trackingNumber];
    if(st && st.routeIdx !== undefined) progress = st.routeIdx / Math.max(route.length-1,1);
  }

  let routeIdx = Math.min(Math.floor(progress * (route.length - 1)), route.length - 1);

  /* ── DRAW ROUTE LINES ── */
  let doneLine = null, remainLine = null;

  // Completed segment — solid vivid
  if(routeIdx > 0){
    doneLine = L.polyline(route.slice(0, routeIdx+1), {
      color: trackColor, weight: 6, opacity: 0.95, lineJoin:'round', lineCap:'round',
    }).addTo(map);
  }

  // Remaining segment — dashed lighter
  if(routeIdx < route.length-1 && !isDelivered){
    remainLine = L.polyline(route.slice(routeIdx), {
      color: isDelayed ? '#fde68a' : '#93c5fd',
      weight: 3.5, opacity: 0.6, dashArray: '11 8', lineJoin:'round',
    }).addTo(map);
  } else if(routeIdx === 0 && !isDelivered){
    remainLine = L.polyline(route, {
      color: '#93c5fd', weight: 3.5, opacity: 0.6, dashArray: '11 8', lineJoin:'round',
    }).addTo(map);
  }

  /* ── ORIGIN MARKER ── */
  L.marker(from, {icon: _makeOriginMarker(), zIndexOffset:600})
    .addTo(map)
    .bindPopup(`<div style="font-family:system-ui;min-width:180px;padding:.4rem .5rem">
      <div style="font-weight:800;font-size:.9rem;color:#1d4ed8;margin-bottom:.3rem">📦 Shipment Origin</div>
      <div style="font-weight:600;color:#111;font-size:.875rem">${shipment.origin.city||'—'}, ${shipment.origin.state||''}</div>
      <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Dispatched: ${shipment.dispatchDate||'—'}</div>
      <div style="color:#6b7280;font-size:.75rem">Sender: ${shipment.senderName||'—'}</div>
    </div>`);

  /* ── DESTINATION MARKER ── */
  L.marker(to, {icon: _makeDestMarker(), zIndexOffset:600})
    .addTo(map)
    .bindPopup(`<div style="font-family:system-ui;min-width:180px;padding:.4rem .5rem">
      <div style="font-weight:800;font-size:.9rem;color:#dc2626;margin-bottom:.3rem">📍 Destination</div>
      <div style="font-weight:600;color:#111;font-size:.875rem">${shipment.destination.city||'—'}, ${shipment.destination.state||''}</div>
      <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Est. Delivery: ${shipment.estimatedDelivery||'—'}</div>
      <div style="color:#6b7280;font-size:.75rem">Recipient: ${shipment.receiverName||'—'}</div>
    </div>`);

  /* ── LIVE TRUCK MARKER ── */
  const transportMode = shipment.transportMode || 'road';
  const modeLabels = { air:'AIR FREIGHT', sea:'SEA FREIGHT', road:'ROAD FREIGHT' };
  const truckLabel = isDelivered ? 'DELIVERED' : isDelayed ? '⏸ DELAYED' : (modeLabels[transportMode]||'ROAD FREIGHT');
  let truckMarker = L.marker(route[routeIdx]||route[0], {
    icon: _makeTruckIcon(trackColor, truckLabel, isDelayed, transportMode), zIndexOffset:1000
  }).addTo(map);

  truckMarker.bindPopup(`<div style="font-family:system-ui;min-width:200px;padding:.4rem .5rem">
    <div style="font-weight:800;font-size:.9rem;margin-bottom:.3rem">${shipment.trackingNumber}</div>
    <div style="display:inline-flex;align-items:center;gap:.3rem;background:${trackColor}18;color:${trackColor};font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:.4rem;text-transform:uppercase">${(shipment.statusText||shipment.status||'').replace(/_/g,' ')}</div>
    <div style="color:#374151;font-size:.8rem">
      <div>📦 ${shipment.packageName||shipment.packageType||'—'} · ${shipment.weight||''}</div>
      <div style="margin-top:.2rem">🗺 ${shipment.origin.city||'—'} → ${shipment.destination.city||'—'}</div>
      <div style="margin-top:.2rem">📊 Progress: <strong style="color:${trackColor}">${Math.round(progress*100)}%</strong></div>
      ${isDelayed?`<div style="margin-top:.2rem;color:#d97706;font-weight:600">⏸ ${shipment.delayReason||'Delay in progress'}</div>`:''}
    </div>
  </div>`);

  /* ── FIT MAP BOUNDS ── */
  try{ map.fitBounds(L.latLngBounds(route), {padding:[70,70], minZoom:5, maxZoom:10}); }catch(e){}

  /* ── REPLACE LEGEND & BADGE OVERLAYS ── */
  // Remove old overlay elements injected by script
  container.querySelectorAll('.leaflet-control-container ~ div').forEach(el=>el.remove());

  // Remove old legend from map-container
  const mapCont = document.getElementById('map-container');
  if(mapCont){
    mapCont.querySelectorAll('[style*="Legend"], [style*="Origin"], .pro-map-legend').forEach(el=>el.remove());

    // Inject professional legend
    const legend = document.createElement('div');
    legend.className = 'pro-map-legend';
    legend.innerHTML = `
      <p>Legend</p>
      <div class="pro-map-legend-row"><div style="width:14px;height:14px;background:linear-gradient(145deg,#1e40af,#2563eb);border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(37,99,235,.4)"></div>Origin</div>
      <div class="pro-map-legend-row"><div style="width:8px;height:6px;background:${trackColor};border-radius:2px;margin-left:3px;margin-right:3px"></div>Completed Route</div>
      <div class="pro-map-legend-row"><div style="width:8px;height:6px;background:#93c5fd;border-radius:2px;border:1px dashed #60a5fa;margin-left:3px;margin-right:3px"></div>Remaining</div>
      <div class="pro-map-legend-row"><div style="width:14px;height:14px;background:#dc2626;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(220,38,38,.4)"></div>Destination</div>
    `;
    mapCont.appendChild(legend);

    // Inject live badge
    const badge = document.createElement('div');
    badge.className = 'pro-map-badge';
    const modeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
    badge.innerHTML = modeIcon + `<span>${shipment.shippingMethod||'Road Freight'}</span>` +
      (isDelayed ? `<span class="pro-delay-dot"></span><span style="color:#d97706;font-weight:700;font-size:.75rem">DELAYED</span>` :
       isActive  ? `<span class="pro-live-dot"></span><span style="color:#15803d;font-weight:700;font-size:.75rem">LIVE</span>` : '');
    mapCont.appendChild(badge);

    // Inject route info card below map
    const oldCard = document.getElementById('pro-tracking-route-card');
    if(oldCard) oldCard.remove();
    const distKm = (function(){
      const R=6371,dL=(to[0]-from[0])*Math.PI/180,dG=(to[1]-from[1])*Math.PI/180;
      const a=Math.sin(dL/2)**2+Math.cos(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.sin(dG/2)**2;
      return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
    })();
    const routeCard = document.createElement('div');
    routeCard.id = 'pro-tracking-route-card';
    routeCard.className = 'pro-route-card';
    routeCard.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <div style="display:flex;align-items:center;gap:.5rem;font-size:.85rem">
          🚛 <strong>${shipment.origin.city||'—'}</strong> → <strong>${shipment.destination.city||'—'}</strong>
        </div>
        ${isActive&&!isDelayed?'<span class="pro-live-badge">● Live Tracking</span>':''}
        ${isDelayed?'<span class="pro-delay-badge">⏸ Delayed</span>':''}
      </div>
      <div style="margin-top:.5rem;display:flex;gap:1.5rem;flex-wrap:wrap;font-size:.78rem;color:#6b7280">
        <span>📏 ~${distKm} km</span>
        <span>📊 ${Math.round(progress*100)}% complete</span>
        <span style="color:#16a34a;font-weight:600">✓ Real road route</span>
      </div>
    `;
    mapCont.insertAdjacentElement('afterend', routeCard);
  }

  /* ── SMOOTH ANIMATION: truck follows exact route geometry ── */
  // Guard against duplicate animation intervals for the same shipment
  const _animKey = 'mapAnim_' + (shipment.id || shipment.trackingNumber);
  if(window[_animKey]) { clearInterval(window[_animKey]); window[_animKey] = null; }

  if(isActive && !isDelayed){
    const animInterval = setInterval(function(){
      // CRITICAL: Always reload moveStates fresh on each tick to catch admin commands
      const freshStates = window.SyncEngine && SyncEngine.loadMoveStates ? SyncEngine.loadMoveStates() : {};
      const shipKey = shipment.id || shipment.trackingNumber;
      const st = freshStates[shipKey];

      // Obey admin pause/delay — if paused or delayed, do NOT advance the marker
      if(st && (st.state==='paused' || st.state==='delayed')) return;

      // Sync with admin movement engine index if significantly diverged
      if(st && st.routeIdx !== undefined){
        const adminIdx = Math.min(Math.floor(st.routeIdx), route.length-1);
        if(Math.abs(adminIdx - routeIdx) > 3) routeIdx = adminIdx;
      } else if(window.SyncEngine && SyncEngine.getShipmentPosition){
        const lp = SyncEngine.getShipmentPosition(shipKey);
        if(lp && lp.progress !== undefined){
          const synced = Math.min(Math.floor((lp.progress/100)*(route.length-1)), route.length-1);
          if(Math.abs(synced - routeIdx) > 3) routeIdx = synced;
        }
      }

      // If admin has stopped the movement (idle/done), halt animation
      if(st && (st.state==='idle' || st.state==='done')){
        if(st.state==='done') routeIdx = route.length - 1;
        truckMarker.setLatLng(route[routeIdx]);
        clearInterval(animInterval);
        window[_animKey] = null;
        return;
      }

      routeIdx = Math.min(routeIdx + 1, route.length - 1);

      if(truckMarker){
        truckMarker.setLatLng(route[routeIdx]);

        // Update completed route line in-place — setLatLngs() avoids
        // destroying and recreating the layer which caused marker flickering
        if(doneLine){
          doneLine.setLatLngs(route.slice(0, routeIdx+1));
        } else {
          doneLine = L.polyline(route.slice(0, routeIdx+1), {
            color: trackColor, weight: 6, opacity: 0.95, lineJoin:'round', lineCap:'round',
          }).addTo(map);
        }

        // Update remaining route line in-place
        if(routeIdx < route.length-1){
          if(remainLine){
            remainLine.setLatLngs(route.slice(routeIdx));
          } else {
            remainLine = L.polyline(route.slice(routeIdx), {
              color: '#93c5fd', weight: 3.5, opacity: 0.6, dashArray:'11 8', lineJoin:'round',
            }).addTo(map);
          }
        } else if(remainLine){
          try{ map.removeLayer(remainLine); }catch(e){}
          remainLine = null;
        }

        // Update live location display
        const lld = document.getElementById('live-location-display');
        if(lld && route[routeIdx]){
          const [lat,lng] = route[routeIdx];
          const AU = window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO;
          if(AU){
            let nearest=null, minD=Infinity;
            for(const [name,c] of Object.entries(AU)){
              const d=Math.abs(c[0]-lat)+Math.abs(c[1]-lng);
              if(d<minD){minD=d;nearest=name;}
            }
            if(nearest && minD < 4) {
              const displayCity = nearest.replace(/\b\w/g,w=>w.toUpperCase());
              if(displayCity && displayCity.trim()) lld.textContent = displayCity;
            }
          }
        }

        // Live-patch progress bar and percentage displays without re-rendering
        if(route.length > 1){
          const liveProgress = Math.round((routeIdx / (route.length - 1)) * 100);
          const _pb  = document.getElementById('live-progress-bar');
          const _pp  = document.getElementById('live-progress-pct');
          const _pn  = document.getElementById('live-progress-num');
          const _pm  = document.getElementById('live-progress-map');
          if(_pb)  _pb.style.width = liveProgress + '%';
          if(_pp)  _pp.textContent = liveProgress + '%';
          if(_pn)  _pn.textContent = liveProgress;
          if(_pm)  _pm.textContent = liveProgress + '%';
          // Also update cached shipment progress so onUpdate handler has fresh value
          if(window._currentDisplayedShipment){
            window._currentDisplayedShipment.progress = liveProgress;
          }
        }
      }

      if(routeIdx >= route.length-1){
        clearInterval(animInterval);
        window[_animKey] = null;
      }
    }, 2200);

    mapAnimations.push(animInterval);
    window[_animKey] = animInterval;
    map.on('remove', ()=>{ clearInterval(animInterval); window[_animKey] = null; });
  }

  // If delivered — show full completed line and park truck at destination
  if(isDelivered){
    if(doneLine){ try{map.removeLayer(doneLine);}catch(e){} }
    L.polyline(route, {color:'#059669', weight:6, opacity:0.9, lineJoin:'round', lineCap:'round'}).addTo(map);
    truckMarker.setLatLng(route[route.length-1]);
  }
}

/* ════════════════════════════════════════
   TRACKING RESULT RENDER
   ════════════════════════════════════════ */
function showTrackingResult(shipment){
  // Store reference for the onUpdate handler to use without a DB fetch
  window._currentDisplayedShipment = shipment;
  const resultSection=document.getElementById('tracking-result');
  const errorMsg=document.getElementById('tracking-error');
  if(errorMsg)errorMsg.classList.remove('show');
  if(!resultSection)return;
  resultSection.classList.add('show');
  const statusColor=getStatusBgColor(shipment.status);
  const completedCount=shipment.timeline.filter(e=>e.completed).length;
  const isDelayedShipment = (shipment.status||'').toLowerCase().replace(/_/g,'-') === 'delayed';

  // Delay notification banner (shown only when delayed — amber/orange theme)
  const delayBanner = isDelayedShipment ? `
  <div id="delay-notification-banner" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:2px solid #fde68a;border-radius:.875rem;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:flex-start;gap:.875rem;box-shadow:0 4px 16px rgba(245,158,11,.15)">
    <div style="width:2.5rem;height:2.5rem;border-radius:.625rem;background:rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:.1rem">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:800;color:#92400e;font-size:.9375rem;margin-bottom:.25rem">⚠ Shipment Delayed</div>
      <div style="color:#78350f;font-size:.8125rem;line-height:1.5">${shipment.delayReason||'Your shipment is currently delayed. Our team is working to resolve this as quickly as possible.'}</div>
      ${shipment.delayTimestamp?`<div style="margin-top:.25rem;font-size:.75rem;color:#b45309;">Delay recorded: ${(()=>{try{return new Date(shipment.delayTimestamp).toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch(e){return shipment.delayTimestamp;}})()}</div>`:''}
      ${shipment.estimatedDelivery?`<div style="margin-top:.375rem;font-size:.75rem;color:#b45309;font-weight:600">Updated ETA: ${shipment.estimatedDelivery}</div>`:''}
    </div>
  </div>` : '';

  resultSection.innerHTML=delayBanner+`
  <!-- Status Card -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.25rem">
      <div style="display:flex;align-items:center;gap:.875rem">
        <div style="width:3rem;height:3rem;border-radius:.75rem;background:${statusColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 14px ${statusColor}40">${icon('package',24)}</div>
        <div>
          <div style="display:flex;align-items:center;gap:.625rem;flex-wrap:wrap;margin-bottom:.25rem">
            <span style="font-family:monospace;font-size:1.0625rem;font-weight:700;color:var(--foreground);letter-spacing:.04em">${shipment.trackingNumber}</span>
            <span style="padding:.2rem .7rem;border-radius:9999px;font-size:.7rem;font-weight:700;background:${statusColor};color:#fff;text-transform:uppercase;letter-spacing:.05em">${shipment.statusText}</span>
          </div>
          <p style="font-size:.8125rem;color:var(--muted-foreground);display:flex;align-items:center;gap:.25rem">${icon('mapPin',13)} Currently at <strong style="color:var(--foreground);margin-left:.25rem">${shipment.currentLocation.city||'—'}, ${shipment.currentLocation.state||''}</strong></p>
        </div>
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" id="print-btn">${icon('download',15)} Download PDF</button>
      </div>
    </div>
    <!-- Info chips -->
    <div style="display:flex;flex-wrap:wrap;gap:.625rem;padding:.875rem;background:var(--muted);border-radius:.625rem;margin-bottom:1.25rem;align-items:center">
      <div style="display:flex;align-items:center;gap:.375rem;font-size:.8rem"><span style="color:var(--muted-foreground)">${icon('truck',13)}</span><span style="color:var(--muted-foreground)">Method:</span><strong style="color:var(--foreground)">${shipment.shippingMethod}</strong></div>
      <span style="color:var(--border);font-size:.75rem">|</span>
      <div style="display:flex;align-items:center;gap:.375rem;font-size:.8rem"><span style="color:var(--muted-foreground)">${icon('scale',13)}</span><span style="color:var(--muted-foreground)">Weight:</span><strong style="color:var(--foreground)">${shipment.weight}</strong></div>
      <span style="color:var(--border);font-size:.75rem">|</span>
      <div style="display:flex;align-items:center;gap:.375rem;font-size:.8rem"><span style="color:var(--muted-foreground)">${icon('calendar',13)}</span><span style="color:var(--muted-foreground)">Dispatched:</span><strong style="color:var(--foreground)">${shipment.dispatchDate}</strong></div>
      <span style="color:var(--border);font-size:.75rem">|</span>
      <div style="display:flex;align-items:center;gap:.375rem;font-size:.8rem"><span style="color:var(--primary)">${icon('clock',13)}</span><span style="color:var(--muted-foreground)">Est. Delivery:</span><strong style="color:var(--primary)">${shipment.estimatedDelivery}</strong></div>
    </div>
    <!-- Progress -->
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:.5rem;font-size:.8rem;font-weight:500">
        <span style="color:var(--muted-foreground)">${shipment.origin.city||'—'}${shipment.origin.state ? ', '+shipment.origin.state : ''}</span>
        <span style="color:var(--foreground)"><span id="live-progress-pct">${typeof shipment.progress==='number'?shipment.progress:0}</span>% &nbsp;·&nbsp; ${completedCount}/${shipment.timeline.length} checkpoints done</span>
        <span style="color:var(--muted-foreground)">${shipment.destination.city||'—'}${shipment.destination.state ? ', '+shipment.destination.state : ''}</span>
      </div>
      <div style="height:.625rem;background:var(--muted);border-radius:9999px;overflow:hidden">
        <div id="progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,var(--primary),#60a5fa);border-radius:9999px;transition:width .9s ease"></div>
      </div>
    </div>
  </div>

  <!-- 2-col grid -->
  <div class="tracking-grid">
    <!-- LEFT -->
    <div style="display:flex;flex-direction:column;gap:1.25rem">
      <!-- Sender/Receiver -->
      <div class="tracking-card">
        <div class="tracking-card-header"><h3 class="tracking-card-title">${icon('user',18)} Sender &amp; Recipient</h3></div>
        <div class="tracking-card-body" style="padding:1.25rem;display:flex;flex-direction:column;gap:.875rem">
          <div style="padding:.875rem;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:.625rem">
            <p style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#16a34a;margin-bottom:.375rem">▲ FROM</p>
            <p style="font-weight:600;color:var(--foreground);margin-bottom:.2rem">${shipment.senderName}</p>
            <p style="font-size:.8125rem;color:var(--muted-foreground)">${shipment.senderAddress}</p>
          </div>
          <div style="padding:.875rem;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:.625rem">
            <p style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#dc2626;margin-bottom:.375rem">▼ TO</p>
            <p style="font-weight:600;color:var(--foreground);margin-bottom:.2rem">${shipment.receiverName}</p>
            <p style="font-size:.8125rem;color:var(--muted-foreground)">${shipment.receiverAddress}</p>
          </div>
        </div>
      </div>
      <!-- Package Info -->
      <div class="tracking-card">
        <div class="tracking-card-header"><h3 class="tracking-card-title">${icon('package',18)} Package Details</h3></div>
        <div class="tracking-card-body" style="padding:1.25rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
            ${[['Type',shipment.packageType,'fileText'],['Weight',shipment.weight,'scale'],['Dimensions',shipment.dimensions,'ruler'],['Method',shipment.shippingMethod,'truck'],['Dispatched',shipment.dispatchDate,'calendar'],['Est. Delivery',shipment.estimatedDelivery,'clock']].map(([l,v,ic])=>`<div style="padding:.75rem;background:var(--muted);border-radius:.5rem"><div style="display:flex;align-items:center;gap:.25rem;color:var(--muted-foreground);font-size:.75rem;margin-bottom:.25rem">${icon(ic,12)} ${l}</div><div style="font-weight:600;color:var(--foreground);font-size:.875rem">${v}</div></div>`).join('')}
          </div>
          ${shipment.notes?`<div style="margin-top:.875rem;padding:.75rem;background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.25);border-radius:.5rem;font-size:.8125rem"><span style="font-weight:600;color:#92400e">⚠ Note: </span><span style="color:var(--foreground)">${shipment.notes}</span></div>`:''}
        </div>
      </div>
      <!-- Courier -->
      ${shipment.courier?`<div class="tracking-card">
        <div class="tracking-card-header"><h3 class="tracking-card-title">${icon('truck',18)} Courier Details</h3></div>
        <div class="tracking-card-body" style="padding:1.25rem">
          ${[['Service',shipment.courier.name],['Vehicle',shipment.courier.vehicle],['Driver / Handler',shipment.courier.driver],['Contact',shipment.courier.contact]].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border)"><span style="font-size:.8125rem;color:var(--muted-foreground)">${k}</span><span style="font-size:.8125rem;font-weight:600;color:var(--foreground)">${v}</span></div>`).join('')}
        </div>
      </div>`:''}
      <!-- Barcode -->
      <div class="tracking-card">
        <div class="tracking-card-header"><h3 class="tracking-card-title">Barcode</h3></div>
        <div class="tracking-card-body" style="padding:1.25rem">
          <div style="background:white;padding:1rem 1.25rem;border-radius:.5rem;border:1px solid #e5e7eb;text-align:center"><div style="display:flex;justify-content:center;align-items:center;overflow:hidden;width:100%">${generateBarcodeSVG(shipment.trackingNumber)}</div><p style="font-family:monospace;font-size:.8125rem;text-align:center;margin-top:.625rem;color:#111;letter-spacing:.08em">${shipment.trackingNumber}</p></div>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div style="display:flex;flex-direction:column;gap:1.25rem">
      <!-- Live Location Banner -->
      <div style="background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(8,145,178,.06));border:1px solid rgba(37,99,235,.18);border-radius:.875rem;padding:1rem 1.25rem;display:flex;align-items:center;gap:.875rem">
        <div style="width:2.5rem;height:2.5rem;border-radius:.625rem;background:rgba(37,99,235,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <div style="width:10px;height:10px;border-radius:50%;background:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.25);animation:mapPulse 1.8s ease-out infinite"></div>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-foreground);margin-bottom:.125rem">Current Location</div>
          <div style="font-size:.9375rem;font-weight:700;color:var(--foreground)" id="live-location-display">${(shipment.currentLocation.city && shipment.currentLocation.city !== 'undefined') ? shipment.currentLocation.city : (shipment.origin.city||'—')}, ${(shipment.currentLocation.state && shipment.currentLocation.state !== 'undefined') ? shipment.currentLocation.state : (shipment.origin.state||'')}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:.6875rem;color:var(--muted-foreground);margin-bottom:.125rem">Progress</div>
          <div style="font-size:.875rem;font-weight:700;color:var(--primary)" id="live-progress-map">${typeof shipment.progress==='number'?shipment.progress:0}%</div>
        </div>
      </div>
      <!-- Map -->
      <div class="tracking-card">
        <div class="tracking-card-header">
          <h3 class="tracking-card-title">${icon('mapPin',18)} Live Tracking – Australia</h3>
          <button class="btn btn-ghost btn-sm" id="map-fullscreen-btn">${icon('maximize',15)}</button>
        </div>
        <div class="map-container" id="map-container" style="position:relative;isolation:isolate;z-index:0;min-height:480px;height:480px;width:100%;overflow:hidden">
          <div id="leaflet-map" style="width:100%;height:100%;min-height:480px;position:relative;z-index:0;"></div>
        </div>
      </div>
      <!-- Timeline -->
      <div class="tracking-card">
        <div class="tracking-card-header">
          <h3 class="tracking-card-title">${icon('clock',18)} Shipment Timeline</h3>
          <span style="font-size:.75rem;color:var(--muted-foreground);font-weight:500">${completedCount} / ${shipment.timeline.length} complete</span>
        </div>
        <div class="tracking-card-body" style="padding:1.25rem">
          <div class="timeline">
            ${shipment.timeline.map((ev,i)=>`
              <div class="timeline-item">
                <div class="timeline-icon-col">
                  <div class="timeline-icon ${ev.completed?'completed':'pending'}">${ev.completed?icon('checkCircle',14):icon('circle',14)}</div>
                  ${i<shipment.timeline.length-1?`<div class="timeline-line ${ev.completed?'completed':'pending'}"></div>`:''}
                </div>
                <div class="timeline-content" style="padding-bottom:${i===shipment.timeline.length-1?'0':'1.5rem'}">
                  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:.25rem;margin-bottom:.2rem">
                    <p style="font-size:.875rem;font-weight:${ev.completed?'600':'400'};color:${ev.completed?'var(--foreground)':'var(--muted-foreground)'}">${ev.status}</p>
                    <p style="font-size:.75rem;color:var(--muted-foreground);white-space:nowrap">${ev.date}</p>
                  </div>
                  <p style="font-size:.8125rem;color:var(--muted-foreground);display:flex;align-items:center;gap:.25rem">${icon('mapPin',12)} ${ev.location}</p>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
      ${shipment.images.length?`<div class="tracking-card">
        <div class="tracking-card-header"><h3 class="tracking-card-title">Package Images</h3></div>
        <div class="tracking-card-body" style="padding:1.25rem"><div class="pkg-images-grid">${shipment.images.map(img=>`<div class="pkg-image"><img src="${img}" alt="Package" loading="lazy"></div>`).join('')}</div></div>
      </div>`:''}
    </div>
  </div>`;

  setTimeout(()=>{const f=document.getElementById('progress-fill');if(f)f.style.width=shipment.progress+'%';},150);

  document.getElementById('print-btn')?.addEventListener('click',()=>generateShipmentPDF(shipment));
  document.getElementById('map-fullscreen-btn')?.addEventListener('click',()=>{
    document.getElementById('map-container')?.classList.toggle('fullscreen');
    if(leafletMap)setTimeout(()=>leafletMap.invalidateSize(),100);
  });

  // Wait for ProfessionalRoutes to load before map init (production timing fix)
  function _doMapInit() {
    const mc = document.getElementById('leaflet-map');
    if (mc && (!mc.clientHeight || mc.clientHeight < 10)) {
      mc.style.height = '480px';
    }
    initAustraliaMap(shipment);
    setTimeout(function() {
      if (window.leafletMap) window.leafletMap.invalidateSize(true);
    }, 400);
  }

  if (window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO) {
    // Routes already loaded — init immediately
    setTimeout(_doMapInit, 100);
  } else {
    // Wait for routes to load (production CDN timing)
    let _mapWait = 0;
    const _mapIv = setInterval(function() {
      _mapWait++;
      if (window.ProfessionalRoutes && window.ProfessionalRoutes.AU_GEO) {
        clearInterval(_mapIv);
        _doMapInit();
      } else if (_mapWait > 30) {
        // Timeout after 3s — init anyway
        clearInterval(_mapIv);
        console.warn('[Map] ProfessionalRoutes timeout — initing without AU_GEO');
        _doMapInit();
      }
    }, 100);
  }
  resultSection.scrollIntoView({behavior:'smooth',block:'start'});
  // Show delay popup notification if shipment is delayed
  if (isDelayedShipment) {
    setTimeout(function(){ showDelayPopup(shipment); }, 600);
  }
}

/* ── Tracking Page ── */
function initTrackingPage(){
  const form=document.getElementById('tracking-form');const input=document.getElementById('tracking-number-input');const errMsg=document.getElementById('tracking-error');
  if(!form||!input)return;
  async function doSearch(num){
    const n=num.trim().toUpperCase();if(!n)return;

    // EPA format validation — only validate EPA-prefixed IDs
    const EPA_REGEX = /^EPA[A-Z]{3}[0-9]{4}$/;
    if(n.startsWith('EPA') && !EPA_REGEX.test(n)){
      if(errMsg){
        const errText = errMsg.querySelector('.err-text');
        if(errText) errText.textContent='Invalid tracking ID format. Expected: EPA + 3 letters + 4 digits (e.g. EPAQTR4821)';
        else errMsg.textContent='Invalid tracking ID format. Expected: EPA + 3 letters + 4 digits (e.g. EPAQTR4821)';
        errMsg.classList.add('show');
      }
      document.getElementById('tracking-result')?.classList.remove('show');
      return;
    }

    const btn=form.querySelector('[type=submit]');const orig=btn.innerHTML;
    btn.disabled=true;btn.innerHTML=`${icon('loader2',16)} Tracking...`;
    // Fetch directly from Supabase — no mock data, no localStorage
    const shipment = await lookupShipment(n);
    btn.disabled=false;btn.innerHTML=orig;
    if(shipment){
      if(errMsg)errMsg.classList.remove('show');
      showTrackingResult(shipment);
    }else{
      if(errMsg){errMsg.textContent='Tracking number not found. Please check and try again.';errMsg.classList.add('show');}
      document.getElementById('tracking-result')?.classList.remove('show');
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();doSearch(input.value);});
  input.addEventListener('input',()=>{input.value=input.value.toUpperCase();});
  document.querySelectorAll('.demo-num-btn').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.num;doSearch(btn.dataset.num);}));
  const p=new URLSearchParams(window.location.search).get('id');
  if(p){input.value=p.toUpperCase();doSearch(p);}
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded',()=>{
  ThemeManager.init();initHeader();initHero();initScrollReveal();initCounters();
  initFAQ();initTestimonials();initContactForm();initNewsletter();initTrackingPage();
});
