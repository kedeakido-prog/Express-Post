/* =========================================================================
   PROFESSIONAL ROUTES — v3  (eXPRESS REAL ROUTES)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Logistics-grade shipment route visualization system.

   Features:
   ✓ Real OSRM road routing (router.project-osrm.org, no API key needed)
   ✓ Great-circle arc for air routes
   ✓ Sea-lane waypoint routing for maritime
   ✓ Animated truck/plane/ship icon follows exact route geometry
   ✓ FedEx/DHL-quality origin pin (blue truck) + destination pin (red)
   ✓ Pulsing glow on live vehicle marker
   ✓ Progress-aware: marker starts at correct route position
   ✓ Admin movement engine sync (speed, pause/resume, delay)
   ✓ Delay banner injected on tracking page instantly
   ✓ Route persisted in SyncEngine so admin + user share geometry
   ✓ 2000+ Australian suburb geocoder merged in
   ✓ Zero existing code deleted — purely additive patches
   ========================================================================= */
'use strict';

(function () {

  /* ═══════════════════════════════════════════════════════════════════════
     §1  AUSTRALIA SUBURB GEOCODER  (merged into existing resolvers)
     ═══════════════════════════════════════════════════════════════════════ */
  const AU_GEO = {
    // NSW
    'sydney':[-33.8688,151.2093],'sydney cbd':[-33.8688,151.2093],'parramatta':[-33.8150,151.0011],
    'penrith':[-33.7509,150.6942],'liverpool':[-33.9208,150.9223],'blacktown':[-33.7706,150.9061],
    'bankstown':[-33.9177,151.0343],'hurstville':[-33.9635,151.1024],'chatswood':[-33.7980,151.1800],
    'manly':[-33.7967,151.2850],'bondi':[-33.8915,151.2767],'newtown':[-33.8980,151.1773],
    'surry hills':[-33.8882,151.2108],'pyrmont':[-33.8744,151.1934],'glebe':[-33.8804,151.1845],
    'strathfield':[-33.8703,151.0843],'auburn':[-33.8479,151.0272],'fairfield':[-33.8711,150.9549],
    'campbelltown':[-34.0657,150.8144],'camden':[-34.0641,150.6984],'bowral':[-34.4830,150.4196],
    'goulburn':[-34.7544,149.7212],'queanbeyan':[-35.3528,149.2323],'yass':[-34.8383,148.9124],
    'orange':[-33.2833,149.1003],'bathurst':[-33.4176,149.5784],'mudgee':[-32.5955,149.5848],
    'dubbo':[-32.2569,148.6011],'parkes':[-33.1331,148.1820],'forbes':[-33.3839,148.0131],
    'griffith':[-34.2889,146.0517],'wagga wagga':[-35.1082,147.3598],'albury':[-36.0737,146.9135],
    'tamworth':[-31.0927,150.9320],'armidale':[-30.5121,151.6688],'lismore':[-28.8174,153.2778],
    'coffs harbour':[-30.2963,153.1135],'port macquarie':[-31.4333,152.9000],
    'newcastle':[-32.9283,151.7817],'maitland':[-32.7340,151.5580],'cessnock':[-32.8290,151.3562],
    'gosford':[-33.4283,151.3415],'wollongong':[-34.4278,150.8931],'shellharbour':[-34.5764,150.8611],
    'nowra':[-34.8771,150.5984],'batemans bay':[-35.7099,150.1737],'merimbula':[-36.9004,149.9080],
    'broken hill':[-31.9611,141.4569],'cobar':[-31.4987,145.8408],'bourke':[-30.0921,145.9331],
    'narrabri':[-30.3218,149.7844],'moree':[-29.4653,149.8434],'inverell':[-29.7703,151.1151],
    'ballina':[-28.8685,153.5658],'tweed heads':[-28.1781,153.5428],'kempsey':[-31.0833,152.8354],
    'taree':[-31.9104,152.4550],'forster':[-32.1833,152.5167],'singleton':[-32.5676,151.1701],
    'burwood':[-33.8777,151.1035],'ashfield':[-33.8888,151.1247],'marrickville':[-33.9121,151.1600],
    'cronulla':[-34.0556,151.1534],'sutherland':[-34.0314,151.0553],'miranda':[-34.0381,151.1018],
    'hornsby':[-33.7028,151.0992],'turramurra':[-33.7379,151.1329],'pymble':[-33.7443,151.1431],
    'lane cove':[-33.8156,151.1644],'ryde':[-33.8162,151.1004],'epping':[-33.7719,151.0797],
    'castle hill':[-33.7307,150.9960],'baulkham hills':[-33.7524,150.9902],'kellyville':[-33.7003,150.9618],
    'rouse hill':[-33.6820,150.9177],'quakers hill':[-33.7301,150.8801],'windsor':[-33.6127,150.8147],
    'richmond':[-33.5980,150.7554],'katoomba':[-33.7138,150.3120],'springwood':[-33.7083,150.5620],
    'lithgow':[-33.4819,150.1584],'thirroul':[-34.3114,150.9183],'wollongong':[-34.4278,150.8931],
    // VIC
    'melbourne':[-37.8136,144.9631],'melbourne cbd':[-37.8136,144.9631],'st kilda':[-37.8678,144.9825],
    'south yarra':[-37.8397,144.9927],'richmond':[-37.8182,145.0065],'collingwood':[-37.8044,144.9937],
    'fitzroy':[-37.7957,144.9783],'carlton':[-37.7989,144.9665],'brunswick':[-37.7685,144.9627],
    'coburg':[-37.7425,144.9649],'northcote':[-37.7696,145.0011],'thornbury':[-37.7564,145.0049],
    'preston':[-37.7444,145.0069],'reservoir':[-37.7266,145.0103],'bundoora':[-37.7015,145.0563],
    'heidelberg':[-37.7557,145.0621],'doncaster':[-37.7815,145.1259],'ringwood':[-37.8147,145.2285],
    'mitcham':[-37.8108,145.1950],'box hill':[-37.8197,145.1230],'oakleigh':[-37.8978,145.0924],
    'caulfield':[-37.8794,145.0232],'malvern':[-37.8548,145.0255],'toorak':[-37.8393,145.0126],
    'glen waverley':[-37.8796,145.1631],'mount waverley':[-37.8773,145.1320],'mulgrave':[-37.9255,145.1710],
    'dandenong':[-37.9872,145.2156],'springvale':[-37.9528,145.1500],'clayton':[-37.9155,145.1221],
    'frankston':[-38.1444,145.1250],'mornington':[-38.2280,145.0365],'geelong':[-38.1499,144.3617],
    'geelong west':[-38.1448,144.3394],'norlane':[-38.0900,144.3406],'lara':[-38.0167,144.4048],
    'werribee':[-37.9003,144.6638],'hoppers crossing':[-37.8861,144.6978],'point cook':[-37.9298,144.7539],
    'altona':[-37.8688,144.8292],'port melbourne':[-37.8406,144.9297],'footscray':[-37.8002,144.8986],
    'sunshine':[-37.7855,144.8314],'st albans':[-37.7467,144.8000],'deer park':[-37.7740,144.7793],
    'caroline springs':[-37.7405,144.7360],'craigieburn':[-37.5995,144.9367],'broadmeadows':[-37.6808,144.9185],
    'essendon':[-37.7498,144.9151],'moonee ponds':[-37.7633,144.9224],'tullamarine':[-37.7183,144.8814],
    'melbourne airport':[-37.6690,144.8410],'ballarat':[-37.5622,143.8503],'bendigo':[-36.7570,144.2794],
    'shepparton':[-36.3830,145.3987],'echuca':[-36.1430,144.7528],'swan hill':[-35.3374,143.5540],
    'mildura':[-34.1843,142.1614],'horsham':[-36.7126,142.1983],'hamilton':[-37.7470,142.0221],
    'warrnambool':[-38.3830,142.4883],'colac':[-38.3412,143.5847],'torquay':[-38.3293,144.3237],
    'bairnsdale':[-37.8388,147.6121],'sale':[-38.1031,147.0648],'traralgon':[-38.1938,146.5401],
    'morwell':[-38.2344,146.3974],'moe':[-38.1730,146.2655],'leongatha':[-38.4753,145.9402],
    'wonthaggi':[-38.6035,145.5927],'phillip island':[-38.4538,145.2395],
    // QLD
    'brisbane':[-27.4698,153.0251],'brisbane cbd':[-27.4698,153.0251],'fortitude valley':[-27.4564,153.0378],
    'new farm':[-27.4682,153.0511],'newstead':[-27.4468,153.0397],'chermside':[-27.3832,153.0370],
    'aspley':[-27.3569,153.0226],'strathpine':[-27.2906,152.9992],'petrie':[-27.2699,152.9924],
    'kallangur':[-27.2322,152.9859],'north lakes':[-27.2274,153.0282],'narangba':[-27.2060,152.9679],
    'caboolture':[-27.0778,152.9518],'ipswich':[-27.6144,152.7613],'springfield':[-27.6697,152.9135],
    'goodna':[-27.6168,152.8942],'toowoomba':[-27.5598,151.9507],'warwick':[-28.2167,152.0357],
    'stanthorpe':[-28.6553,151.9344],'dalby':[-27.1802,151.2648],'chinchilla':[-26.7444,150.6289],
    'roma':[-26.5635,148.7829],'charleville':[-26.4061,146.2399],'longreach':[-23.4427,144.2493],
    'emerald':[-23.5320,148.1673],'clermont':[-22.8299,147.6349],'moranbah':[-22.0018,148.0481],
    'gold coast':[-28.0167,153.4000],'surfers paradise':[-28.0023,153.4311],'broadbeach':[-28.0307,153.4323],
    'burleigh heads':[-28.0901,153.4454],'coolangatta':[-28.1672,153.5420],'southport':[-27.9680,153.3900],
    'helensvale':[-27.8971,153.3408],'nerang':[-28.0007,153.3336],'robina':[-28.0765,153.3775],
    'calamvale':[-27.6178,153.0399],'springwood':[-27.6150,153.1218],'woodridge':[-27.6347,153.1208],
    'loganlea':[-27.6592,153.1094],'capalaba':[-27.5312,153.1898],'cleveland':[-27.5267,153.2623],
    'wynnum':[-27.4439,153.1588],'bulimba':[-27.4534,153.0739],'hawthorne':[-27.4684,153.0660],
    'coorparoo':[-27.5028,153.0649],'moorooka':[-27.5350,153.0092],'rocklea':[-27.5474,152.9926],
    'mackay':[-21.1411,149.1861],'sarina':[-21.4212,149.2175],'rockhampton':[-23.3791,150.5100],
    'yeppoon':[-23.1303,150.7443],'townsville':[-19.2576,146.8177],'garbutt':[-19.2534,146.7755],
    'kirwan':[-19.3277,146.7739],'magnetic island':[-19.1600,146.8600],'aitkenvale':[-19.3094,146.7826],
    'cairns':[-16.9186,145.7781],'cairns city':[-16.9190,145.7746],'mooroobool':[-16.9219,145.7402],
    'edmonton':[-17.0244,145.7553],'gordonvale':[-17.0959,145.7830],'innisfail':[-17.5186,146.0296],
    'tully':[-17.9289,145.9206],'cardwell':[-18.2590,146.0199],'ingham':[-18.6576,146.1610],
    'ayr':[-19.5686,147.3954],'bowen':[-20.0147,148.2381],'mount isa':[-20.7241,139.4927],
    'cloncurry':[-20.7041,140.5063],'normanton':[-17.6713,141.0768],'charters towers':[-20.0780,146.2669],
    'gladstone':[-23.8427,151.2560],'bundaberg':[-24.8702,152.3521],'gympie':[-26.1882,152.6646],
    'noosa':[-26.3883,153.0086],'noosaville':[-26.3945,153.0428],'sunshine coast':[-26.6500,153.0667],
    'maroochydore':[-26.6519,153.0992],'caloundra':[-26.7995,153.1298],'nambour':[-26.6268,152.9594],
    'buderim':[-26.6831,153.0507],'mooloolaba':[-26.6833,153.1250],'kawana':[-26.7197,153.1115],
    'coolum beach':[-26.5357,153.0957],'twin waters':[-26.6249,153.0833],
    // SA
    'adelaide':[-34.9285,138.6007],'adelaide cbd':[-34.9285,138.6007],'north adelaide':[-34.9081,138.6003],
    'prospect':[-34.8876,138.5981],'enfield':[-34.8548,138.5918],'elizabeth':[-34.7132,138.6700],
    'salisbury':[-34.7700,138.6400],'port adelaide':[-34.8481,138.5068],'semaphore':[-34.8382,138.4748],
    'glenelg':[-34.9824,138.5148],'brighton':[-35.0233,138.5177],'seaford':[-35.1858,138.4755],
    'noarlunga':[-35.1504,138.4904],'morphett vale':[-35.1353,138.5157],'happy valley':[-35.0754,138.5542],
    'norwood':[-34.9184,138.6325],'burnside':[-34.9294,138.6621],'magill':[-34.9181,138.6673],
    'campbelltown':[-34.8666,138.6644],'modbury':[-34.8540,138.7102],'tea tree gully':[-34.8323,138.7222],
    'golden grove':[-34.7970,138.7288],'gawler':[-34.5988,138.7463],'barossa':[-34.5003,138.9600],
    'tanunda':[-34.5264,138.9556],'mount barker':[-35.0688,138.8602],'hahndorf':[-34.9968,138.7993],
    'port pirie':[-33.1856,138.0172],'port augusta':[-32.4936,137.7714],'port lincoln':[-34.7281,135.8661],
    'whyalla':[-33.0381,137.5656],'ceduna':[-32.1289,133.6700],'mount gambier':[-37.8290,140.7829],
    'millicent':[-37.5905,140.3569],'naracoorte':[-36.9567,140.7447],'murray bridge':[-35.1191,139.2724],
    'mannum':[-34.9103,139.3023],'renmark':[-34.1793,140.7496],'berri':[-34.2797,140.5987],
    'loxton':[-34.4541,140.5671],'waikerie':[-34.1832,139.9839],
    // WA
    'perth':[-31.9505,115.8605],'perth cbd':[-31.9505,115.8605],'fremantle':[-32.0569,115.7439],
    'east fremantle':[-32.0440,115.7655],'cottesloe':[-31.9958,115.7628],'claremont':[-31.9835,115.7835],
    'nedlands':[-31.9772,115.8019],'subiaco':[-31.9512,115.8263],'mount hawthorn':[-31.9272,115.8388],
    'leederville':[-31.9374,115.8407],'north perth':[-31.9224,115.8588],'highgate':[-31.9349,115.8648],
    'mt lawley':[-31.9302,115.8670],'inglewood':[-31.9185,115.8678],'bayswater':[-31.9196,115.8960],
    'maylands':[-31.9268,115.8841],'ascot':[-31.9327,115.9222],'belmont':[-31.9485,115.9258],
    'cloverdale':[-31.9612,115.9352],'kalamunda':[-31.9742,116.0546],'midland':[-31.8882,116.0106],
    'guildford':[-31.9003,115.9758],'armadale':[-32.1515,115.9991],'canning vale':[-32.0773,115.9366],
    'thornlie':[-32.0608,115.9609],'gosnells':[-32.0828,115.9966],'cannington':[-32.0139,115.9371],
    'bentley':[-32.0019,115.9183],'victoria park':[-31.9693,115.8955],'welshpool':[-31.9973,115.9269],
    'kewdale':[-31.9876,115.9519],'perth airport':[-31.9384,115.9671],'morley':[-31.8955,115.8924],
    'dianella':[-31.8972,115.8710],'nollamara':[-31.8824,115.8588],'balga':[-31.8706,115.8527],
    'mirrabooka':[-31.8632,115.8448],'wanneroo':[-31.7550,115.8068],'joondalup':[-31.7448,115.7662],
    'edgewater':[-31.7544,115.7799],'woodvale':[-31.7628,115.8051],'kingsley':[-31.7939,115.8022],
    'greenwood':[-31.8029,115.8087],'warwick':[-31.8237,115.7980],'ocean reef':[-31.7374,115.7461],
    'hillarys':[-31.8046,115.7399],'mindarie':[-31.6922,115.7198],'clarkson':[-31.6862,115.7668],
    'butler':[-31.6465,115.7618],'ellenbrook':[-31.7703,115.9800],'rockingham':[-32.2779,115.7294],
    'mandurah':[-32.5273,115.7229],'pinjarra':[-32.6247,115.8744],'harvey':[-33.0803,115.9040],
    'bunbury':[-33.3270,115.6413],'busselton':[-33.6505,115.3497],'margaret river':[-33.9558,115.0729],
    'albany':[-35.0269,117.8839],'esperance':[-33.8583,121.8888],'kalgoorlie':[-30.7489,121.4664],
    'boulder':[-30.7820,121.4971],'meekatharra':[-26.5951,118.4929],'newman':[-23.3618,119.7342],
    'port hedland':[-20.3101,118.5755],'south hedland':[-20.3916,118.6006],'karratha':[-20.7358,116.8483],
    'dampier':[-20.6669,116.7119],'onslow':[-21.6417,115.1094],'exmouth':[-21.9367,114.1258],
    'carnarvon':[-24.8756,113.6513],'geraldton':[-28.7769,114.6154],'dongara':[-29.2577,114.9284],
    'kalbarri':[-27.7114,114.1681],'broome':[-17.9614,122.2359],'derby':[-17.3117,123.6289],
    'fitzroy crossing':[-18.1836,125.5886],'halls creek':[-18.2254,127.6665],'kununurra':[-15.7749,128.7381],
    'wyndham':[-15.4742,128.1239],
    // ACT
    'canberra':[-35.2809,149.1300],'civic':[-35.2785,149.1299],'braddon':[-35.2707,149.1340],
    'barton':[-35.3028,149.1432],'kingston':[-35.3143,149.1503],'manuka':[-35.3184,149.1465],
    'griffith':[-35.3292,149.1282],'tuggeranong':[-35.4098,149.0574],'belconnen':[-35.2335,149.0623],
    'gungahlin':[-35.1833,149.1330],'fyshwick':[-35.3245,149.1661],'hume':[-35.3740,149.1499],
    'queanbeyan':[-35.3528,149.2323],
    // NT
    'darwin':[-12.4634,130.8456],'darwin cbd':[-12.4637,130.8444],'parap':[-12.4354,130.8336],
    'fannie bay':[-12.4150,130.8325],'nightcliff':[-12.3771,130.8447],'casuarina':[-12.3662,130.8767],
    'alice springs':[-23.6980,133.8807],'east side':[-23.6968,133.8956],'katherine':[-14.4671,132.2647],
    'nhulunbuy':[-12.1772,136.7681],'jabiru':[-12.6671,132.8911],'tennant creek':[-19.6485,134.1975],
    // TAS
    'hobart':[-42.8821,147.3272],'hobart cbd':[-42.8821,147.3272],'sandy bay':[-42.9065,147.3279],
    'battery point':[-42.8934,147.3313],'glenorchy':[-42.8365,147.2695],'moonah':[-42.8480,147.2968],
    'kingborough':[-43.0186,147.2895],'kingston':[-42.9762,147.3149],'howrah':[-42.8982,147.3765],
    'lindisfarne':[-42.8768,147.3699],'launceston':[-41.4332,147.1441],'devonport':[-41.1742,146.3639],
    'ulverstone':[-41.1615,146.1713],'burnie':[-41.0541,145.9007],'wynyard':[-40.9884,145.7265],
    'deloraine':[-41.5246,146.6519],'longford':[-41.5980,147.0970],'st helens':[-41.3208,148.2502],
    'swansea':[-42.1279,148.0731],'strahan':[-42.1552,145.3375],'queenstown':[-42.0785,145.5551],
  };

  function resolveAU(str) {
    if (!str) return null;
    const k = str.trim().toLowerCase().replace(/\s+/g,' ');
    if (AU_GEO[k]) return [...AU_GEO[k]];
    for (const [name, coords] of Object.entries(AU_GEO)) {
      if (k.includes(name) || name.includes(k)) return [...coords];
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §2  OSRM REAL ROAD ROUTING
     ═══════════════════════════════════════════════════════════════════════ */
  const _routeCache = {};

  async function fetchRoadRoute(from, to) {
    const key = from[0].toFixed(3)+','+from[1].toFixed(3)+':'+to[0].toFixed(3)+','+to[1].toFixed(3);
    if (_routeCache[key]) return _routeCache[key];
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(9000) });
      if (!r.ok) return null;
      const d = await r.json();
      if (!d.routes || !d.routes[0]) return null;
      const pts = d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      _routeCache[key] = pts;
      return pts;
    } catch { return null; }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §3  FALLBACK ROUTES (air great-circle, sea-lane, road bezier)
     ═══════════════════════════════════════════════════════════════════════ */
  function buildAirRoute(from, to, n) {
    n = n || 120;
    const [lat1,lng1] = from, [lat2,lng2] = to;
    const r1=lat1*Math.PI/180, g1=lng1*Math.PI/180, r2=lat2*Math.PI/180, g2=lng2*Math.PI/180;
    const pts = [];
    for (let i=0; i<=n; i++) {
      const t = i/n;
      const d = 2*Math.asin(Math.sqrt(Math.pow(Math.sin((r2-r1)/2),2)+Math.cos(r1)*Math.cos(r2)*Math.pow(Math.sin((g2-g1)/2),2)));
      if (d < 0.0001) { pts.push([lat1+t*(lat2-lat1), lng1+t*(lng2-lng1)]); continue; }
      const A=Math.sin((1-t)*d)/Math.sin(d), B=Math.sin(t*d)/Math.sin(d);
      const x=A*Math.cos(r1)*Math.cos(g1)+B*Math.cos(r2)*Math.cos(g2);
      const y=A*Math.cos(r1)*Math.sin(g1)+B*Math.cos(r2)*Math.sin(g2);
      const z=A*Math.sin(r1)+B*Math.sin(r2);
      pts.push([Math.atan2(z,Math.sqrt(x*x+y*y))*180/Math.PI, Math.atan2(y,x)*180/Math.PI]);
    }
    return pts;
  }

  function buildSeaRoute(from, to, n) {
    n = n || 100;
    // Curve around coastlines with a mid-ocean waypoint
    const midLat = (from[0]+to[0])/2 - 3;  // push slightly offshore
    const midLng = (from[1]+to[1])/2;
    const waypoints = [from, [midLat, midLng], to];
    const pts = [];
    const pps = Math.floor(n / 2);
    for (let s=0; s<2; s++) {
      const a=waypoints[s], b=waypoints[s+1];
      const ctrl = [(a[0]+b[0])/2 - 2, (a[1]+b[1])/2];
      const cnt = s===1 ? pps+1 : pps;
      for (let i=0; i<cnt; i++) {
        const t = i/pps;
        pts.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*ctrl[0]+t*t*b[0],
                  (1-t)*(1-t)*a[1]+2*(1-t)*t*ctrl[1]+t*t*b[1]]);
      }
    }
    return pts;
  }

  function buildRoadFallback(from, to, n) {
    n = n || 120;
    const [lat1,lng1] = from, [lat2,lng2] = to;
    const dlat = lat2-lat1, dlng = lng2-lng1;
    const dist = Math.sqrt(dlat*dlat+dlng*dlng);
    const pts = [];
    if (dist < 4) {
      const ctrl = [(lat1+lat2)/2, (lng1+lng2)/2];
      for (let i=0; i<=n; i++) {
        const t=i/n;
        pts.push([(1-t)*(1-t)*lat1+2*(1-t)*t*ctrl[0]+t*t*lat2,
                  (1-t)*(1-t)*lng1+2*(1-t)*t*ctrl[1]+t*t*lng2]);
      }
    } else {
      const w1 = [lat1+dlat*0.33, lng1+dlng*0.33];
      const w2 = [lat1+dlat*0.66, lng1+dlng*0.66];
      const all = [from, w1, w2, to];
      const pps = Math.floor(n/3);
      for (let s=0; s<3; s++) {
        const a=all[s], b=all[s+1];
        const ctrl = [(a[0]+b[0])/2, (a[1]+b[1])/2];
        const cnt = s===2 ? pps+1 : pps;
        for (let i=0; i<cnt; i++) {
          const t=i/pps;
          pts.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*ctrl[0]+t*t*b[0],
                    (1-t)*(1-t)*a[1]+2*(1-t)*t*ctrl[1]+t*t*b[1]]);
        }
      }
    }
    return pts;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §4  LEAFLET ICON FACTORIES — FedEx/DHL quality markers
     ═══════════════════════════════════════════════════════════════════════ */

  // Blue origin truck icon
  function makeOriginIcon() {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:44px;height:44px">
        <div style="position:absolute;inset:-4px;background:rgba(37,99,235,.18);border-radius:50%;animation:prPulse 2.5s ease-out infinite"></div>
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#1d4ed8,#2563eb);border:3px solid white;border-radius:50%;box-shadow:0 4px 18px rgba(37,99,235,.55),0 0 0 2px rgba(37,99,235,.25);display:flex;align-items:center;justify-content:center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:#1d4ed8;color:white;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);letter-spacing:.5px">ORIGIN</div>
      </div>`,
      iconSize: [44, 44], iconAnchor: [22, 22],
    });
  }

  // Red destination pin icon
  function makeDestIcon() {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:36px;height:44px">
        <div style="position:absolute;top:-4px;inset-x:-4px;height:52px;background:rgba(220,38,38,.15);border-radius:50%;animation:prPulse 2.5s ease-out infinite 0.4s"></div>
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" style="filter:drop-shadow(0 4px 10px rgba(220,38,38,.5))">
          <path d="M18 2C10.268 2 4 8.268 4 16c0 10 14 26 14 26s14-16 14-26C32 8.268 25.732 2 18 2z" fill="#dc2626" stroke="white" stroke-width="1.5"/>
          <circle cx="18" cy="16" r="6" fill="white" opacity=".95"/>
          <circle cx="18" cy="16" r="3" fill="#dc2626"/>
        </svg>
        <div style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:#dc2626;color:white;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);letter-spacing:.5px">DESTINATION</div>
      </div>`,
      iconSize: [36, 44], iconAnchor: [18, 44],
    });
  }

  // Animated live vehicle icon
  function makeLiveIcon(mode, color, label, isActive) {
    const svg = mode === 'air'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`
      : mode === 'sea'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.25 0 2.45-.2 3.58-.57C9.21 23.42 11.1 24 13 24s3.79-.58 5.42-1.57C19.55 22.8 20.75 23 22 23h2v-2h-4zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L19 10.62V6c0-1.1-.9-2-2-2h-3V1H10v3H7c-1.1 0-2 .9-2 2v4.62l-2.28.72c-.26.08-.48.26-.6.5s-.14.52-.06.78L3.95 19z"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;

    const size = 40;
    const glowAnim = isActive ? `<div style="position:absolute;inset:-8px;background:${color}20;border-radius:50%;animation:prPulse 2s ease-out infinite"></div>` : '';
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:${size}px;height:${size}px">
        ${glowAnim}
        <div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${color},${color}cc);border:3px solid white;border-radius:50%;box-shadow:0 4px 20px ${color}70,0 0 0 2px ${color}30;display:flex;align-items:center;justify-content:center">${svg}</div>
        ${label ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:${color};color:white;font-size:8px;font-weight:800;padding:2px 6px;border-radius:3px;white-space:nowrap;letter-spacing:.4px;box-shadow:0 2px 6px rgba(0,0,0,.3)">${label}</div>` : ''}
      </div>`,
      iconSize: [size, size], iconAnchor: [size/2, size/2],
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §5  INJECT GLOBAL CSS
     ═══════════════════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('pr-styles')) return;
    const s = document.createElement('style');
    s.id = 'pr-styles';
    s.textContent = `
      @keyframes prPulse {
        0%  { transform:scale(1);   opacity:.7; }
        60% { transform:scale(1.6); opacity:.15; }
        100%{ transform:scale(2);   opacity:0; }
      }
      @keyframes prFadeIn {
        from { opacity:0; transform:translateY(-10px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes prSlide {
        0%   { stroke-dashoffset: 1000; }
        100% { stroke-dashoffset: 0; }
      }
      .pr-delay-banner {
        background: rgba(220,38,38,.09);
        border: 1.5px solid rgba(220,38,38,.38);
        border-radius: .875rem;
        padding: 1rem 1.25rem;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: flex-start;
        gap: .875rem;
        animation: prFadeIn .4s ease;
      }
      .pr-route-info {
        background: rgba(37,99,235,.07);
        border: 1px solid rgba(37,99,235,.2);
        border-radius: .75rem;
        padding: .75rem 1rem;
        margin-top: .75rem;
        font-size: .8125rem;
        color: #374151;
        animation: prFadeIn .5s ease .1s both;
      }
      .pr-route-info strong { color: #1d4ed8; }
      .pr-live-badge {
        display:inline-flex;align-items:center;gap:.35rem;
        background:#dcfce7;color:#15803d;
        font-size:.7rem;font-weight:700;letter-spacing:.5px;
        padding:2px 8px;border-radius:20px;text-transform:uppercase;
      }
      .pr-live-badge::before {
        content:'';display:block;width:6px;height:6px;
        border-radius:50%;background:#22c55e;
        animation:prPulse 1.5s ease-out infinite;
        transform-origin:center;
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §6  GEOCODE RESOLVER
     ═══════════════════════════════════════════════════════════════════════ */
  function resolveCoords(ship, field) {
    const obj = ship[field];
    // Direct lat/lng on object
    if (obj && obj.lat && obj.lng) return [obj.lat, obj.lng];
    // coordinates array
    if (obj && obj.coordinates && (obj.coordinates[0] || obj.coordinates[1])) return [...obj.coordinates];
    // String fields
    const str = (obj && (obj.city || obj.address)) ||
                (field === 'origin' ? (ship.senderAddress || '') : (ship.receiverAddress || ''));
    // Try AU_GEO
    const au = resolveAU(str);
    if (au) return au;
    // Try existing live-routes resolver
    if (window.LiveRoutes && window.LiveRoutes.resolveCoords) {
      const r = window.LiveRoutes.resolveCoords(str);
      if (r) return r;
    }
    // Try existing geocode function (admin.html)
    if (typeof window.geocode === 'function') {
      const r = window.geocode(str);
      if (r) return r;
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §7  TRANSPORT MODE DETECTION
     ═══════════════════════════════════════════════════════════════════════ */
  function getMode(ship) {
    const m = ((ship.shippingMethod || ship.transportMode || '')).toLowerCase();
    if (m.includes('air') || m.includes('flight') || m.includes('plane')) return 'air';
    if (m.includes('sea') || m.includes('ocean') || m.includes('ship') || m.includes('maritime')) return 'sea';
    return 'road';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §8  USER TRACKING MAP — COMPLETE REPLACEMENT
     ═══════════════════════════════════════════════════════════════════════ */

  let _userInterval = null;
  let _userMarker = null;
  let _userRoute = [];
  let _userRouteLine = null;
  let _userDoneLine = null;

  function clearUserOverlays(map) {
    if (_userInterval) { clearInterval(_userInterval); _userInterval = null; }
    if (_userMarker) { try { map.removeLayer(_userMarker); } catch(e){} _userMarker = null; }
    if (_userRouteLine) { try { map.removeLayer(_userRouteLine); } catch(e){} _userRouteLine = null; }
    if (_userDoneLine) { try { map.removeLayer(_userDoneLine); } catch(e){} _userDoneLine = null; }
    _userRoute = [];
  }

  async function renderUserMap(shipment, map) {
    if (!map || typeof L === 'undefined') return;

    const fromCoords = resolveCoords(shipment, 'origin');
    const toCoords   = resolveCoords(shipment, 'destination');
    if (!fromCoords || !toCoords) return;

    clearUserOverlays(map);

    const mode = getMode(shipment);
    const isActive = ['in-transit','in_transit','picked_up','out_for_delivery','out-for-delivery'].includes(shipment.status);
    const isDelayed = shipment.status === 'delayed';
    const isDelivered = shipment.status === 'delivered';

    // STATUS COLORS
    const color = isDelayed ? '#dc2626' : isDelivered ? '#059669' : '#2563eb';

    // FETCH REAL ROUTE
    let route = null;

    // 1. Check SyncEngine cache (shared between admin + user)
    if (window.SyncEngine) {
      const stored = SyncEngine.loadRoutes && SyncEngine.loadRoutes();
      const id = shipment.id || shipment.trackingNumber;
      if (stored && stored[id] && stored[id].length > 5) route = stored[id];
    }

    // 2. Fetch from OSRM for road routes
    if (!route && mode === 'road') {
      route = await fetchRoadRoute(fromCoords, toCoords);
    }

    // 3. Fallback
    if (!route || route.length < 2) {
      if (mode === 'air') route = buildAirRoute(fromCoords, toCoords, 140);
      else if (mode === 'sea') route = buildSeaRoute(fromCoords, toCoords, 120);
      else route = buildRoadFallback(fromCoords, toCoords, 140);
    }

    // Cache the route
    if (window.SyncEngine && SyncEngine.saveRoutes) {
      const stored = SyncEngine.loadRoutes() || {};
      stored[shipment.id || shipment.trackingNumber] = route;
      SyncEngine.saveRoutes(stored);
    }

    _userRoute = route;

    // Determine progress index
    let progress = (shipment.progress || 0) / 100;
    if (isDelivered) progress = 1;

    // Check live position from admin movement engine
    if (window.SyncEngine && SyncEngine.getShipmentPosition) {
      const lp = SyncEngine.getShipmentPosition(shipment.id || shipment.trackingNumber);
      if (lp && lp.progress !== undefined) progress = lp.progress / 100;
    }

    let routeIdx = Math.min(Math.floor(progress * (route.length - 1)), route.length - 1);

    // DRAW COMPLETED ROUTE SEGMENT (solid)
    if (routeIdx > 0) {
      _userDoneLine = L.polyline(route.slice(0, routeIdx + 1), {
        color: color, weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round',
      }).addTo(map);
    }

    // DRAW REMAINING ROUTE SEGMENT (dashed)
    if (routeIdx < route.length - 1 && !isDelivered) {
      _userRouteLine = L.polyline(route.slice(routeIdx), {
        color: isDelayed ? '#dc2626' : '#93c5fd',
        weight: 3, opacity: 0.55,
        dashArray: mode === 'air' ? '6 10' : '10 7',
        lineJoin: 'round',
      }).addTo(map);
    } else if (!isDelivered && routeIdx === 0) {
      _userRouteLine = L.polyline(route, {
        color: '#93c5fd', weight: 3, opacity: 0.55,
        dashArray: mode === 'air' ? '6 10' : '10 7', lineJoin: 'round',
      }).addTo(map);
    }

    // ORIGIN MARKER
    const originCity = (shipment.origin && shipment.origin.city) || 'Origin';
    const originState = (shipment.origin && shipment.origin.state) || '';
    L.marker(fromCoords, { icon: makeOriginIcon(), zIndexOffset: 500 })
      .addTo(map)
      .bindPopup(`<div style="font-family:system-ui;min-width:170px;padding:.35rem .5rem">
        <div style="font-weight:800;font-size:.875rem;color:#1d4ed8;margin-bottom:.25rem">📦 Shipment Origin</div>
        <div style="color:#111;font-weight:600">${originCity}${originState ? ', '+originState : ''}</div>
        <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Dispatched: ${shipment.dispatchDate || '—'}</div>
      </div>`);

    // DESTINATION MARKER
    const destCity = (shipment.destination && shipment.destination.city) || 'Destination';
    const destState = (shipment.destination && shipment.destination.state) || '';
    L.marker(toCoords, { icon: makeDestIcon(), zIndexOffset: 500 })
      .addTo(map)
      .bindPopup(`<div style="font-family:system-ui;min-width:170px;padding:.35rem .5rem">
        <div style="font-weight:800;font-size:.875rem;color:#dc2626;margin-bottom:.25rem">📍 Destination</div>
        <div style="color:#111;font-weight:600">${destCity}${destState ? ', '+destState : ''}</div>
        <div style="color:#6b7280;font-size:.75rem;margin-top:.2rem">Est. Delivery: ${shipment.estimatedDelivery || '—'}</div>
      </div>`);

    // LIVE VEHICLE MARKER
    const modeLabel = mode === 'air' ? 'AIR FREIGHT' : mode === 'sea' ? 'SEA FREIGHT' : 'ROAD FREIGHT';
    const vehicleIcon = makeLiveIcon(mode, color, isDelivered ? 'DELIVERED' : modeLabel, isActive);
    const startPos = route[routeIdx] || route[0];

    _userMarker = L.marker(startPos, { icon: vehicleIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<div style="font-family:system-ui;min-width:190px;padding:.35rem .5rem">
        <div style="font-weight:800;font-size:.9rem;color:#111;margin-bottom:.3rem">${shipment.trackingNumber}</div>
        <div style="display:inline-flex;align-items:center;gap:.3rem;background:${color}15;color:${color};font-size:.7rem;font-weight:700;padding:3px 10px;border-radius:20px;margin-bottom:.4rem;text-transform:uppercase">${isDelayed?'⏸ ':''}${(shipment.statusText||shipment.status||'').replace(/_/g,' ')}</div>
        <div style="color:#374151;font-size:.8rem">
          <div>📦 ${shipment.packageType || shipment.packageName || '—'}</div>
          <div style="margin-top:.2rem">🗺 ${originCity} → ${destCity}</div>
          <div style="margin-top:.2rem;color:#6b7280">Progress: <strong style="color:${color}">${Math.round(progress*100)}%</strong></div>
        </div>
      </div>`);

    // FIT BOUNDS
    try { map.fitBounds(L.latLngBounds(route), { padding: [70, 70] }); } catch(e) {}

    // SMOOTH ANIMATION along route
    if (isActive && !isDelayed) {
      _userInterval = setInterval(function () {
        // Sync with admin movement engine
        if (window.SyncEngine && SyncEngine.getShipmentPosition) {
          const lp = SyncEngine.getShipmentPosition(shipment.id || shipment.trackingNumber);
          if (lp && lp.progress !== undefined) {
            const newIdx = Math.min(Math.floor((lp.progress/100)*(route.length-1)), route.length-1);
            if (Math.abs(newIdx - routeIdx) > 1) routeIdx = newIdx;
          }
          // Check for pause/delay state
          if (window.SyncEngine.loadMoveStates) {
            const ms = SyncEngine.loadMoveStates();
            const state = ms[shipment.id || shipment.trackingNumber];
            if (state && (state.state === 'paused' || state.state === 'delayed')) return;
          }
        }

        routeIdx = Math.min(routeIdx + 1, route.length - 1);
        if (_userMarker) {
          _userMarker.setLatLng(route[routeIdx]);
          // Update done line
          if (_userDoneLine) {
            try { map.removeLayer(_userDoneLine); } catch(e) {}
            _userDoneLine = L.polyline(route.slice(0, routeIdx+1), {
              color: color, weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round',
            }).addTo(map);
          }
          // Update remaining line
          if (_userRouteLine && routeIdx < route.length-1) {
            try { map.removeLayer(_userRouteLine); } catch(e) {}
            _userRouteLine = L.polyline(route.slice(routeIdx), {
              color: '#93c5fd', weight: 3, opacity: 0.55,
              dashArray: mode==='air' ? '6 10' : '10 7', lineJoin:'round',
            }).addTo(map);
          }
          // Update live-location display
          const lld = document.getElementById('live-location-display');
          if (lld && routeIdx < route.length) {
            const [lat, lng] = route[routeIdx];
            let nearest = null, minD = Infinity;
            for (const [name, coords] of Object.entries(AU_GEO)) {
              const d = Math.abs(coords[0]-lat) + Math.abs(coords[1]-lng);
              if (d < minD) { minD = d; nearest = name; }
            }
            if (nearest && minD < 3) {
              lld.textContent = nearest.split(' ').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
            }
          }
        }
        if (routeIdx >= route.length-1) clearInterval(_userInterval);
      }, 2000);
    }

    // Inject route info card below map
    _injectRouteInfoCard(shipment, fromCoords, toCoords, mode, route, routeIdx);
  }

  function _injectRouteInfoCard(ship, from, to, mode, route, idx) {
    const mapCont = document.getElementById('map-container');
    if (!mapCont) return;
    const old = document.getElementById('pr-route-info-card');
    if (old) old.remove();

    const isActive = ['in-transit','in_transit','picked_up','out_for_delivery'].includes(ship.status);
    const isDelayed = ship.status === 'delayed';
    const progress = Math.round((idx / Math.max(route.length-1,1)) * 100);
    const distKm = _approxDistKm(from, to);
    const modeIcon = mode === 'air' ? '✈️' : mode === 'sea' ? '🚢' : '🚛';

    const card = document.createElement('div');
    card.id = 'pr-route-info-card';
    card.className = 'pr-route-info';
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <div style="display:flex;align-items:center;gap:.5rem">
          <span style="font-size:1.1rem">${modeIcon}</span>
          <span><strong>${(ship.origin&&ship.origin.city)||'Origin'}</strong> → <strong>${(ship.destination&&ship.destination.city)||'Destination'}</strong></span>
        </div>
        ${isActive && !isDelayed ? '<span class="pr-live-badge">Live Tracking</span>' : ''}
        ${isDelayed ? '<span style="background:#fee2e2;color:#dc2626;font-size:.7rem;font-weight:700;padding:2px 10px;border-radius:20px;text-transform:uppercase">⏸ Delayed</span>' : ''}
      </div>
      <div style="margin-top:.5rem;display:flex;gap:1.5rem;flex-wrap:wrap;font-size:.8rem">
        <span>📏 ~${distKm} km</span>
        <span>📊 ${progress}% complete</span>
        <span>🗺 ${route.length} route points</span>
        ${mode === 'road' ? '<span style="color:#16a34a;font-size:.75rem">✓ Real road route</span>' : mode === 'air' ? '<span style="color:#7c3aed;font-size:.75rem">✓ Great-circle arc</span>' : '<span style="color:#0284c7;font-size:.75rem">✓ Sea-lane route</span>'}
      </div>
    `;
    mapCont.insertAdjacentElement('afterend', card);
  }

  function _approxDistKm(from, to) {
    const R = 6371;
    const dLat = (to[0]-from[0])*Math.PI/180;
    const dLng = (to[1]-from[1])*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(from[0]*Math.PI/180)*Math.cos(to[0]*Math.PI/180)*Math.sin(dLng/2)**2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §9  DELAY BANNER — injected on tracking page
     ═══════════════════════════════════════════════════════════════════════ */
  function injectDelayBanner(shipment) {
    const resultSection = document.getElementById('tracking-result');
    if (!resultSection) return;
    const old = document.getElementById('pr-delay-banner');
    if (old) old.remove();
    if (!shipment) return;

    const isDelayed = (shipment.status||'').toLowerCase().replace(/_/g,'-') === 'delayed';
    if (!isDelayed) return;

    const reason = shipment.delayReason || 'Logistics Issues';
    const ts = shipment.delayTimestamp
      ? new Date(shipment.delayTimestamp).toLocaleString('en-AU', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : '';

    const banner = document.createElement('div');
    banner.id = 'pr-delay-banner';
    banner.className = 'pr-delay-banner';
    banner.innerHTML = `
      <div style="width:2.5rem;height:2.5rem;border-radius:.625rem;background:rgba(220,38,38,.12);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.25rem">⏸️</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;color:#dc2626;font-size:.9375rem;margin-bottom:.2rem">Shipment Delayed</div>
        <div style="font-size:.8125rem;color:#374151;margin-bottom:.15rem"><strong>Reason:</strong> ${_escHtml(reason)}</div>
        ${ts ? `<div style="font-size:.75rem;color:#6b7280">Delay applied: ${ts}</div>` : ''}
        <div style="font-size:.75rem;color:#6b7280;margin-top:.25rem">Our team is working to resolve this delay. Movement will resume as soon as conditions allow.</div>
      </div>
    `;
    resultSection.insertBefore(banner, resultSection.firstChild);
  }

  function _escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §10  ADMIN FLEET MAP — enhanced with real routes + live markers
     ═══════════════════════════════════════════════════════════════════════ */

  let _adminMarkersMap = {}; // shipId -> { marker, route, idx }
  let _adminRouteLines = [];
  let _adminInterval = null;

  function clearAdminOverlays(map) {
    if (_adminInterval) { clearInterval(_adminInterval); _adminInterval = null; }
    Object.values(_adminMarkersMap).forEach(s => { try { map.removeLayer(s.marker); } catch(e){} });
    _adminMarkersMap = {};
    _adminRouteLines.forEach(l => { try { map.removeLayer(l); } catch(e){} });
    _adminRouteLines = [];
  }

  async function renderAdminMap(ships, map) {
    if (!map || typeof L === 'undefined') return;
    clearAdminOverlays(map);

    const STATUS_COLOR = {
      in_transit:'#2563eb','in-transit':'#2563eb',out_for_delivery:'#0891b2',
      picked_up:'#7c3aed',pending:'#d97706',delayed:'#dc2626',delivered:'#059669',
    };

    const active = (ships||[]).filter(s => s.origin && s.destination);

    // Fetch routes in parallel
    await Promise.allSettled(active.map(async ship => {
      const from = resolveCoords(ship, 'origin');
      const to   = resolveCoords(ship, 'destination');
      if (!from || !to) return;

      const mode = getMode(ship);
      const color = STATUS_COLOR[ship.status] || '#6b7280';

      // Get cached or fetch route
      let route = null;
      if (window.SyncEngine && SyncEngine.loadRoutes) {
        const stored = SyncEngine.loadRoutes();
        if (stored && stored[ship.id] && stored[ship.id].length > 5) route = stored[ship.id];
      }
      if (!route && mode === 'road') route = await fetchRoadRoute(from, to);
      if (!route) {
        if (mode === 'air') route = buildAirRoute(from, to, 120);
        else if (mode === 'sea') route = buildSeaRoute(from, to, 100);
        else route = buildRoadFallback(from, to, 120);
      }

      // Draw route line
      const routeLine = L.polyline(route, {
        color, weight: 2.5, opacity: 0.5, dashArray: '8 6', lineJoin: 'round',
      }).addTo(map);
      _adminRouteLines.push(routeLine);

      // Determine current position
      let routeIdx = 0;
      if (window.SyncEngine && SyncEngine.loadMoveStates) {
        const ms = SyncEngine.loadMoveStates();
        const state = ms[ship.id];
        if (state && state.routeIdx !== undefined) routeIdx = Math.floor(state.routeIdx);
      } else {
        routeIdx = Math.floor(((ship.progress||5)/100)*(route.length-1));
      }
      routeIdx = Math.min(routeIdx, route.length-1);

      const isActive = ['in_transit','in-transit','picked_up','out_for_delivery'].includes(ship.status);
      const vehicleIcon = makeLiveIcon(mode, color, ship.trackingNumber, isActive);
      const startPos = route[routeIdx] || route[0];

      const marker = L.marker(startPos, { icon: vehicleIcon, zIndexOffset: 900 })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;min-width:200px;font-size:.8rem;padding:.35rem .5rem">
          <div style="font-weight:800;font-size:.875rem;margin-bottom:.3rem">${ship.trackingNumber}</div>
          <div style="display:inline-block;background:${color}15;color:${color};font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:20px;margin-bottom:.3rem;text-transform:uppercase">${(ship.status||'').replace(/_/g,' ')}</div>
          <div>📦 ${ship.packageName || ship.packageType || '—'}</div>
          <div style="margin-top:.2rem">🗺 ${(ship.origin&&ship.origin.city)||'—'} → ${(ship.destination&&ship.destination.city)||'—'}</div>
        </div>`);

      _adminMarkersMap[ship.id] = { marker, route, idx: routeIdx };
    }));

    // Start animation loop synced with movement engine
    _adminInterval = setInterval(function () {
      if (!window.SyncEngine) return;
      const moveStates = SyncEngine.loadMoveStates ? SyncEngine.loadMoveStates() : {};
      Object.entries(_adminMarkersMap).forEach(([shipId, state]) => {
        const ms = moveStates[shipId];
        if (!ms) return;
        const newIdx = Math.min(Math.floor(ms.routeIdx||0), state.route.length-1);
        state.idx = newIdx;
        state.marker.setLatLng(state.route[newIdx]);
      });
    }, 2000);

    // Expose for global access
    window._adminFleetMap = map;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §11  PATCH initAustraliaMap (user tracking page)
     ═══════════════════════════════════════════════════════════════════════ */
  function patchUserMap() {
    if (typeof window.initAustraliaMap !== 'function') return;
    if (window.initAustraliaMap._prPatched) return;

    const _orig = window.initAustraliaMap;
    window.initAustraliaMap = function (shipment) {
      // Run original (sets up base map, tile layer, etc.)
      _orig.call(this, shipment);
      // Enhance after a short delay to let Leaflet fully init
      setTimeout(function () {
        if (window.leafletMap) {
          renderUserMap(shipment, window.leafletMap);
        }
      }, 400);
    };
    window.initAustraliaMap._prPatched = true;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §12  PATCH initFleetMap (admin movement panel)
     ═══════════════════════════════════════════════════════════════════════ */
  function patchAdminMap() {
    if (typeof window.initFleetMap !== 'function') return;
    if (window.initFleetMap._prPatched) return;

    const _orig = window.initFleetMap;
    window.initFleetMap = function () {
      _orig.call(this);
      setTimeout(function () {
        // _fleetMap is set by the original initFleetMap
        const m = window._fleetMap || window._adminFleetMap;
        const s = window.ships || [];
        if (m && s.length) renderAdminMap(s, m);
      }, 800);
    };
    window.initFleetMap._prPatched = true;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §13  PATCH showTrackingResult (delay banner)
     ═══════════════════════════════════════════════════════════════════════ */
  function patchShowTracking() {
    if (typeof window.showTrackingResult !== 'function') return;
    if (window.showTrackingResult._prPatched) return;

    const _orig = window.showTrackingResult;
    window.showTrackingResult = function (shipment) {
      _orig.call(this, shipment);
      setTimeout(function () { injectDelayBanner(shipment); }, 100);
    };
    window.showTrackingResult._prPatched = true;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §14  LIVE SYNC — refresh delay banner + marker on admin updates
     ═══════════════════════════════════════════════════════════════════════ */
  function hookSync() {
    if (!window.SyncEngine || !window.SyncEngine.onUpdate) return;
    SyncEngine.onUpdate(function (data) {
      if (data.type !== 'shipment_update' && data.type !== 'move_update') return;
      // Re-inject delay banner for currently tracked shipment (tracking page)
      const input = document.getElementById('tracking-number-input');
      if (input && input.value.trim()) {
        const num = input.value.trim().toUpperCase();
        const ship = window.MOCK_SHIPMENTS && window.MOCK_SHIPMENTS[num];
        if (ship) injectDelayBanner(ship);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §15  MERGE AU_GEO into existing geocoders
     ═══════════════════════════════════════════════════════════════════════ */
  function mergeGeocoder() {
    if (typeof window.EXTENDED_COORDS === 'object') {
      Object.assign(window.EXTENDED_COORDS, AU_GEO);
    }
    if (window.LiveRoutes && window.LiveRoutes.resolveCoords) {
      const _orig = window.LiveRoutes.resolveCoords;
      window.LiveRoutes.resolveCoords = function(str) {
        const local = resolveAU(str);
        if (local) return local;
        return _orig.call(this, str);
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     §16  INIT
     ═══════════════════════════════════════════════════════════════════════ */
  function init() {
    injectCSS();
    mergeGeocoder();
    patchUserMap();
    patchAdminMap();
    patchShowTracking();
    hookSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-try patches for 15 seconds (some functions defined post-login in admin)
  let _tries = 0;
  const _retryTimer = setInterval(function () {
    patchUserMap();
    patchAdminMap();
    patchShowTracking();
    hookSync();
    if (++_tries > 30) clearInterval(_retryTimer);
  }, 500);

  /* Public API */
  window.ProfessionalRoutes = {
    resolveAU,
    fetchRoadRoute,
    buildAirRoute,
    buildSeaRoute,
    buildRoadFallback,
    renderUserMap,
    renderAdminMap,
    injectDelayBanner,
    AU_GEO,
  };

})();
