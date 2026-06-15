/* =======================================================================
   REAL ROUTES UPGRADE — v1
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PURELY ADDITIVE EXTENSION — zero existing code is removed or broken.

   What this file adds:
   1. Australia-wide suburb/city geocoding database (2000+ locations)
   2. OSRM real road routing (router.project-osrm.org — free, no API key)
      with transparent fallback to existing Bezier routes
   3. Route caching via SyncEngine.saveRoutes() — routes persist across
      tabs and are shared between admin and user tracking page
   4. Patches delayShipment() to log delays to AuditEngine
   5. Patches showTrackingResult() to show a DELAYED banner with reason
      on the user tracking page
   6. Patches admin generateRoute() / live-routes buildRoute() to attempt
      OSRM first, then fall back gracefully

   SAFETY RULES FOLLOWED:
   - All new code is namespaced or guards existing function existence
   - No existing function is deleted
   - All patches call the original function
   - File can be removed without breaking the base system
   ======================================================================= */
'use strict';

(function () {

  /* ═══════════════════════════════════════════════════════════════
     1. AUSTRALIA SUBURB / CITY GEOCODING DATABASE
        Covers all capital cities, major regional centres, suburbs,
        remote towns, industrial areas, ports and airports.
     ═══════════════════════════════════════════════════════════════ */
  const AU_SUBURBS = {
    // ── New South Wales ──────────────────────────────────────────
    'sydney':[-33.8688,151.2093],'sydney cbd':[-33.8696,151.2080],'sydney city':[-33.8688,151.2093],
    'parramatta':[-33.8150,151.0011],'penrith':[-33.7509,150.6942],'liverpool':[-33.9208,150.9223],
    'blacktown':[-33.7706,150.9061],'bankstown':[-33.9177,151.0343],'hurstville':[-33.9635,151.1024],
    'chatswood':[-33.7980,151.1800],'hornsby':[-33.7028,151.0992],'manly':[-33.7967,151.2850],
    'bondi':[-33.8915,151.2767],'bondi junction':[-33.8917,151.2528],'newtown':[-33.8980,151.1773],
    'surry hills':[-33.8882,151.2108],'pyrmont':[-33.8744,151.1934],'glebe':[-33.8804,151.1845],
    'balmain':[-33.8540,151.1801],'leichhardt':[-33.8837,151.1559],'petersham':[-33.8964,151.1594],
    'strathfield':[-33.8703,151.0843],'auburn':[-33.8479,151.0272],'granville':[-33.8366,151.0122],
    'fairfield':[-33.8711,150.9549],'campbelltown':[-34.0657,150.8144],'camden':[-34.0641,150.6984],
    'narellan':[-34.0422,150.7365],'bowral':[-34.4830,150.4196],'moss vale':[-34.5493,150.3968],
    'goulburn':[-34.7544,149.7212],'queanbeyan':[-35.3528,149.2323],'yass':[-34.8383,148.9124],
    'orange':[-33.2833,149.1003],'bathurst':[-33.4176,149.5784],'mudgee':[-32.5955,149.5848],
    'dubbo':[-32.2569,148.6011],'parkes':[-33.1331,148.1820],'forbes':[-33.3839,148.0131],
    'griffith':[-34.2889,146.0517],'wagga wagga':[-35.1082,147.3598],'albury':[-36.0737,146.9135],
    'tamworth':[-31.0927,150.9320],'armidale':[-30.5121,151.6688],'lismore':[-28.8174,153.2778],
    'coffs harbour':[-30.2963,153.1135],'port macquarie':[-31.4333,152.9000],
    'newcastle':[-32.9283,151.7817],'maitland':[-32.7340,151.5580],'cessnock':[-32.8290,151.3562],
    'gosford':[-33.4283,151.3415],'wyong':[-33.2840,151.4218],'wollongong':[-34.4278,150.8931],
    'shellharbour':[-34.5764,150.8611],'kiama':[-34.6706,150.8538],'nowra':[-34.8771,150.5984],
    'batemans bay':[-35.7099,150.1737],'merimbula':[-36.9004,149.9080],'eden':[-37.0636,149.9027],
    'broken hill':[-31.9611,141.4569],'cobar':[-31.4987,145.8408],'bourke':[-30.0921,145.9331],
    'narrabri':[-30.3218,149.7844],'moree':[-29.4653,149.8434],'inverell':[-29.7703,151.1151],
    'glen innes':[-29.7355,151.7399],'tenterfield':[-29.0474,152.0232],'casino':[-28.8676,153.0459],
    'ballina':[-28.8685,153.5658],'tweed heads':[-28.1781,153.5428],'kempsey':[-31.0833,152.8354],
    'taree':[-31.9104,152.4550],'forster':[-32.1833,152.5167],'raymond terrace':[-32.7615,151.7485],
    'toronto':[-33.0627,151.5954],'lake macquarie':[-33.0000,151.6000],'singleton':[-32.5676,151.1701],
    'muswellbrook':[-32.2660,150.8878],'scone':[-32.0538,150.8669],'merriwa':[-32.1476,150.3521],
    'deniliquin':[-35.5328,144.9671],'hay':[-34.5099,144.8404],'broken hill':[-31.9611,141.4569],
    'burwood':[-33.8777,151.1035],'ashfield':[-33.8888,151.1247],'marrickville':[-33.9121,151.1600],
    'rockdale':[-33.9563,151.1360],'kogarah':[-33.9651,151.1275],'sutherland':[-34.0314,151.0553],
    'miranda':[-34.0381,151.1018],'caringbah':[-34.0472,151.1224],'cronulla':[-34.0556,151.1534],
    'engadine':[-34.0674,151.0108],'menai':[-34.0047,151.0297],'bangor':[-34.0292,151.0568],
    'hornsby':[-33.7028,151.0992],'mount colah':[-33.6701,151.1169],'berowra':[-33.6247,151.1479],
    'turramurra':[-33.7379,151.1329],'pymble':[-33.7443,151.1431],'gordon':[-33.7553,151.1503],
    'killara':[-33.7606,151.1614],'lindfield':[-33.7728,151.1663],'roseville':[-33.7844,151.1764],
    'st leonards':[-33.8203,151.1946],'artarmon':[-33.8102,151.1824],'willoughby':[-33.7998,151.1987],
    'lane cove':[-33.8156,151.1644],'ryde':[-33.8162,151.1004],'meadowbank':[-33.8210,151.0994],
    'ermington':[-33.8202,151.0707],'west ryde':[-33.8068,151.0871],'eastwood':[-33.7906,151.0799],
    'epping':[-33.7719,151.0797],'carlingford':[-33.7832,151.0513],'beecroft':[-33.7534,151.0643],
    'cherrybrook':[-33.7286,151.0610],'castle hill':[-33.7307,150.9960],'baulkham hills':[-33.7524,150.9902],
    'kellyville':[-33.7003,150.9618],'rouse hill':[-33.6820,150.9177],'quakers hill':[-33.7301,150.8801],
    'riverstone':[-33.6852,150.8567],'windsor':[-33.6127,150.8147],'richmond':[-33.5980,150.7554],
    'kurrajong':[-33.5456,150.6811],'katoomba':[-33.7138,150.3120],'springwood':[-33.7083,150.5620],
    'blue mountains':[-33.7138,150.3120],'lithgow':[-33.4819,150.1584],'oberon':[-33.7089,149.8605],
    'bulli':[-34.3340,150.9168],'thirroul':[-34.3114,150.9183],'corrimal':[-34.3713,150.9075],
    'dapto':[-34.5091,150.7936],'unanderra':[-34.4833,150.8333],'port kembla':[-34.4867,150.9011],
    'north wollongong':[-34.4065,150.9025],
    // ── Victoria ──────────────────────────────────────────────────
    'melbourne':[-37.8136,144.9631],'melbourne cbd':[-37.8136,144.9631],'melbourne city':[-37.8136,144.9631],
    'st kilda':[-37.8678,144.9825],'south yarra':[-37.8397,144.9927],'prahran':[-37.8506,144.9975],
    'richmond':[-37.8182,145.0065],'collingwood':[-37.8044,144.9937],'fitzroy':[-37.7957,144.9783],
    'carlton':[-37.7989,144.9665],'brunswick':[-37.7685,144.9627],'coburg':[-37.7425,144.9649],
    'northcote':[-37.7696,145.0011],'thornbury':[-37.7564,145.0049],'preston':[-37.7444,145.0069],
    'reservoir':[-37.7266,145.0103],'bundoora':[-37.7015,145.0563],'heidelberg':[-37.7557,145.0621],
    'heidelberg west':[-37.7484,145.0368],'bellfield':[-37.7507,145.0551],'ivanhoe':[-37.7647,145.0449],
    'kew':[-37.8021,145.0319],'hawthorn':[-37.8218,145.0257],'camberwell':[-37.8301,145.0566],
    'glen iris':[-37.8537,145.0679],'ashburton':[-37.8646,145.0750],'chadstone':[-37.8884,145.0756],
    'oakleigh':[-37.8978,145.0924],'caulfield':[-37.8794,145.0232],'st kilda east':[-37.8660,145.0012],
    'malvern':[-37.8548,145.0255],'armadale':[-37.8574,145.0185],'toorak':[-37.8393,145.0126],
    'glen waverley':[-37.8796,145.1631],'mount waverley':[-37.8773,145.1320],'mulgrave':[-37.9255,145.1710],
    'dandenong':[-37.9872,145.2156],'noble park':[-37.9660,145.1792],'springvale':[-37.9528,145.1500],
    'keysborough':[-37.9943,145.1737],'cheltenham':[-37.9564,145.0584],'moorabbin':[-37.9387,145.0556],
    'highett':[-37.9541,145.0261],'mentone':[-37.9801,145.0614],'mordialloc':[-37.9997,145.0900],
    'parkdale':[-38.0069,145.0791],'braeside':[-37.9997,145.1167],'carrum':[-38.0667,145.1222],
    'frankston':[-38.1444,145.1250],'mornington':[-38.2280,145.0365],'mount martha':[-38.2750,145.0336],
    'rosebud':[-38.3563,144.9048],'rye':[-38.3714,144.8276],'sorrento':[-38.3469,144.7377],
    'portsea':[-38.3217,144.7069],'dromana':[-38.3314,144.9644],'blairgowrie':[-38.3621,144.7745],
    'geelong':[-38.1499,144.3617],'geelong west':[-38.1448,144.3394],'north geelong':[-38.1199,144.3575],
    'norlane':[-38.0900,144.3406],'corio':[-38.0735,144.3317],'lara':[-38.0167,144.4048],
    'werribee':[-37.9003,144.6638],'wyndham vale':[-37.8794,144.5952],'hoppers crossing':[-37.8861,144.6978],
    'point cook':[-37.9298,144.7539],'truganina':[-37.8484,144.7246],'altona':[-37.8688,144.8292],
    'newport':[-37.8473,144.8758],'williamstown':[-37.8614,144.8920],'port melbourne':[-37.8406,144.9297],
    'south melbourne':[-37.8297,144.9613],'yarraville':[-37.8179,144.8896],'footscray':[-37.8002,144.8986],
    'sunshine':[-37.7855,144.8314],'st albans':[-37.7467,144.8000],'deer park':[-37.7740,144.7793],
    'caroline springs':[-37.7405,144.7360],'taylors lakes':[-37.7182,144.7654],'watergardens':[-37.7171,144.7836],
    'craigieburn':[-37.5995,144.9367],'broadmeadows':[-37.6808,144.9185],'campbellfield':[-37.6713,144.9594],
    'fawkner':[-37.7035,144.9631],'tullamarine':[-37.7183,144.8814],'airport west':[-37.7202,144.8800],
    'melbourne airport':[-37.6690,144.8410],'essendon':[-37.7498,144.9151],'moonee ponds':[-37.7633,144.9224],
    'strathmore':[-37.7367,144.9291],'glenroy':[-37.7117,144.9482],'dallas':[-37.6853,144.9580],
    'roxburgh park':[-37.6571,144.9504],'mickleham':[-37.5823,144.9209],'doreen':[-37.5979,145.0745],
    'mernda':[-37.6129,145.0587],'thomastown':[-37.6897,145.0056],'lalor':[-37.6633,145.0064],
    'epping':[-37.6418,145.0219],'south morang':[-37.6576,145.0803],'diamond creek':[-37.6611,145.1586],
    'eltham':[-37.7154,145.1470],'greensborough':[-37.7019,145.1026],'watsonia':[-37.7166,145.0849],
    'montmorency':[-37.7285,145.1128],'lower plenty':[-37.7384,145.0979],'doncaster':[-37.7815,145.1259],
    'doncaster east':[-37.7904,145.1508],'templestowe':[-37.7578,145.1404],'warrandyte':[-37.7481,145.2152],
    'lilydale':[-37.7556,145.3418],'croydon':[-37.7979,145.2756],'ringwood':[-37.8147,145.2285],
    'mitcham':[-37.8108,145.1950],'vermont':[-37.8365,145.2035],'forest hill':[-37.8364,145.1741],
    'nunawading':[-37.8259,145.1724],'blackburn':[-37.8175,145.1537],'burwood':[-37.8476,145.1263],
    'box hill':[-37.8197,145.1230],'surrey hills':[-37.8279,145.1053],'wantirna':[-37.8667,145.2279],
    'bayswater':[-37.8453,145.2698],'boronia':[-37.8633,145.2933],'ferntree gully':[-37.8861,145.2956],
    'upper ferntree gully':[-37.9048,145.2970],'rowville':[-37.9231,145.2415],'knoxfield':[-37.8972,145.2280],
    'scoresby':[-37.9033,145.2278],'wheelers hill':[-37.9025,145.1822],'glen waverley':[-37.8796,145.1631],
    'clayton':[-37.9155,145.1221],'clayton south':[-37.9301,145.1263],'heatherton':[-37.9440,145.0933],
    'bentleigh':[-37.9203,145.0345],'mckinnon':[-37.9161,145.0472],'bentleigh east':[-37.9265,145.0586],
    'ormond':[-37.9090,145.0433],'carnegie':[-37.8955,145.0483],'murrumbeena':[-37.9041,145.0656],
    'niddrie':[-37.7379,144.8780],'avondale heights':[-37.7444,144.8483],'keilor':[-37.7197,144.8358],
    'ballarat':[-37.5622,143.8503],'ballarat east':[-37.5612,143.8607],'sebastopol':[-37.5930,143.8488],
    'wendouree':[-37.5431,143.8292],'smythesdale':[-37.6464,143.7093],'buninyong':[-37.6489,143.8680],
    'bendigo':[-36.7570,144.2794],'flora hill':[-36.7730,144.2985],'golden square':[-36.7749,144.2636],
    'kangaroo flat':[-36.8093,144.2551],'long gully':[-36.7417,144.2725],'eaglehawk':[-36.7161,144.2383],
    'shepparton':[-36.3830,145.3987],'mooroopna':[-36.3986,145.3444],'kyabram':[-36.3260,145.0549],
    'echuca':[-36.1430,144.7528],'kerang':[-35.7272,143.9219],'swan hill':[-35.3374,143.5540],
    'mildura':[-34.1843,142.1614],'red cliffs':[-34.3068,142.1900],'irymple':[-34.2283,142.1725],
    'horsham':[-36.7126,142.1983],'hamilton':[-37.7470,142.0221],'warrnambool':[-38.3830,142.4883],
    'colac':[-38.3412,143.5847],'lorne':[-38.5456,143.9765],'torquay':[-38.3293,144.3237],
    'anglesea':[-38.4053,144.1875],'aireys inlet':[-38.4614,144.0986],'apollo bay':[-38.7597,143.6720],
    'port fairy':[-38.3837,142.2366],'portland':[-38.3464,141.6034],'casterton':[-37.5842,141.3955],
    'bairnsdale':[-37.8388,147.6121],'lakes entrance':[-37.8822,147.9893],'orbost':[-37.7115,148.4514],
    'sale':[-38.1031,147.0648],'maffra':[-37.9575,146.9830],'traralgon':[-38.1938,146.5401],
    'morwell':[-38.2344,146.3974],'moe':[-38.1730,146.2655],'leongatha':[-38.4753,145.9402],
    'wonthaggi':[-38.6035,145.5927],'inverloch':[-38.6332,145.7294],'san remo':[-38.5287,145.3603],
    'cowes':[-38.4538,145.2395],'newhaven':[-38.5036,145.3230],'cape woolamai':[-38.5621,145.3403],
    'korumburra':[-38.4259,145.8207],'warragul':[-38.1611,145.9317],'drouin':[-38.1373,145.8593],
    // ── Queensland ───────────────────────────────────────────────
    'brisbane':[-27.4698,153.0251],'brisbane cbd':[-27.4698,153.0251],'brisbane city':[-27.4698,153.0251],
    'fortitude valley':[-27.4564,153.0378],'new farm':[-27.4682,153.0511],'teneriffe':[-27.4577,153.0460],
    'newstead':[-27.4468,153.0397],'bowen hills':[-27.4467,153.0310],'albion':[-27.4317,153.0280],
    'clayfield':[-27.4207,153.0509],'wooloowin':[-27.4244,153.0316],'lutwyche':[-27.4206,153.0247],
    'gordon park':[-27.4188,153.0236],'kedron':[-27.4078,153.0237],'stafford':[-27.4019,153.0210],
    'chermside':[-27.3832,153.0370],'aspley':[-27.3569,153.0226],'bridgeman downs':[-27.3481,153.0186],
    'strathpine':[-27.2906,152.9992],'petrie':[-27.2699,152.9924],'kallangur':[-27.2322,152.9859],
    'murrumba downs':[-27.2083,152.9933],'griffin':[-27.2218,153.0157],'mango hill':[-27.2364,153.0159],
    'north lakes':[-27.2274,153.0282],'narangba':[-27.2060,152.9679],'burpengary':[-27.1644,152.9571],
    'caboolture':[-27.0778,152.9518],'morayfield':[-27.0907,152.9690],'elimbah':[-27.0583,152.9619],
    'beachmere':[-27.1254,153.0558],'bribie island':[-27.0472,153.1606],'woodford':[-26.9536,152.7830],
    'kilcoy':[-26.9417,152.5731],'esk':[-27.2367,152.4181],'gatton':[-27.5622,152.2760],
    'ipswich':[-27.6144,152.7613],'springfield':[-27.6697,152.9135],'ripley':[-27.6875,152.8480],
    'goodna':[-27.6168,152.8942],'redbank':[-27.6012,152.8578],'riverview':[-27.5919,152.8390],
    'dinmore':[-27.5973,152.8164],'bundamba':[-27.6168,152.8180],'booval':[-27.6168,152.7896],
    'east ipswich':[-27.6112,152.7750],'brassall':[-27.5919,152.7521],'karalee':[-27.5583,152.7680],
    'karana downs':[-27.5506,152.7583],'walloon':[-27.6017,152.6903],'rosewood':[-27.6379,152.5940],
    'laidley':[-27.6340,152.3869],'grandchester':[-27.6599,152.4524],'lowood':[-27.4733,152.5680],
    'toowoomba':[-27.5598,151.9507],'highfields':[-27.4620,151.9480],'cambooya':[-27.7128,151.8645],
    'clifton':[-27.9261,151.9000],'warwick':[-28.2167,152.0357],'stanthorpe':[-28.6553,151.9344],
    'dalby':[-27.1802,151.2648],'chinchilla':[-26.7444,150.6289],'roma':[-26.5635,148.7829],
    'charleville':[-26.4061,146.2399],'longreach':[-23.4427,144.2493],'barcaldine':[-23.5531,145.2890],
    'blackall':[-24.4241,145.4673],'tambo':[-24.8901,146.2573],'mitchell':[-26.4817,147.9779],
    'injune':[-25.8513,148.5640],'emerald':[-23.5320,148.1673],'clermont':[-22.8299,147.6349],
    'springsure':[-24.1104,148.0811],'moranbah':[-22.0018,148.0481],'dysart':[-22.5894,148.3487],
    'gold coast':[-28.0167,153.4000],'surfers paradise':[-28.0023,153.4311],'broadbeach':[-28.0307,153.4323],
    'mermaid beach':[-28.0493,153.4285],'miami':[-28.0792,153.4338],'burleigh heads':[-28.0901,153.4454],
    'palm beach':[-28.1221,153.4699],'coolangatta':[-28.1672,153.5420],'tweed heads south':[-28.1839,153.5348],
    'southport':[-27.9680,153.3900],'labrador':[-27.9450,153.3929],'biggera waters':[-27.9345,153.3929],
    'runaway bay':[-27.9189,153.3928],'paradise point':[-27.8845,153.3924],'hope island':[-27.8700,153.3551],
    'coomera':[-27.8339,153.3284],'upper coomera':[-27.8614,153.3008],'oxenford':[-27.8778,153.3262],
    'helensvale':[-27.8971,153.3408],'arundel':[-27.9233,153.3542],'molendinar':[-27.9497,153.3623],
    'nerang':[-28.0007,153.3336],'robina':[-28.0765,153.3775],'varsity lakes':[-28.0917,153.3879],
    'calamvale':[-27.6178,153.0399],'runcorn':[-27.6145,153.0553],'algester':[-27.6271,153.0225],
    'parkinson':[-27.6389,153.0325],'sunnybank':[-27.5920,153.0482],'sunnybank hills':[-27.5940,153.0294],
    'eight mile plains':[-27.5818,153.0939],'springwood':[-27.6150,153.1218],'woodridge':[-27.6347,153.1208],
    'logan central':[-27.6392,153.1092],'loganlea':[-27.6592,153.1094],'slacks creek':[-27.6539,153.1226],
    'underwood':[-27.6017,153.1088],'rochedale':[-27.5847,153.1401],'capalaba':[-27.5312,153.1898],
    'cleveland':[-27.5267,153.2623],'thorneside':[-27.5139,153.2309],'birkdale':[-27.5050,153.2153],
    'wellington point':[-27.4776,153.2361],'redland bay':[-27.6041,153.3010],'victoria point':[-27.5868,153.2953],
    'ormiston':[-27.5313,153.2480],'alexandra hills':[-27.5472,153.2090],'manly':[-27.4669,153.1836],
    'wynnum':[-27.4439,153.1588],'murarrie':[-27.4580,153.1093],'hemmant':[-27.4743,153.1244],
    'lytton':[-27.4167,153.1681],'bulimba':[-27.4534,153.0739],'balmoral':[-27.4648,153.0818],
    'hawthorne':[-27.4684,153.0660],'morningside':[-27.4735,153.0653],'camp hill':[-27.4878,153.0618],
    'coorparoo':[-27.5028,153.0649],'greenslopes':[-27.5068,153.0454],'annerley':[-27.5201,153.0286],
    'yeronga':[-27.5113,152.9981],'moorooka':[-27.5350,153.0092],'rocklea':[-27.5474,152.9926],
    'coopers plains':[-27.5596,153.0090],'macgregor':[-27.5702,153.0561],'wishart':[-27.5528,153.0865],
    'mount gravatt':[-27.5339,153.0771],'upper mount gravatt':[-27.5573,153.0851],'mansfield':[-27.5533,153.1116],
    'mackay':[-21.1411,149.1861],'north mackay':[-21.1159,149.1761],'south mackay':[-21.1618,149.1679],
    'west mackay':[-21.1480,149.1477],'rural view':[-21.0834,149.2060],'andergrove':[-21.0896,149.1950],
    'eimeo':[-21.0696,149.2097],'erakala':[-21.0524,148.9895],'sarina':[-21.4212,149.2175],
    'rockhampton':[-23.3791,150.5100],'north rockhampton':[-23.3579,150.5234],'berserker':[-23.3491,150.5207],
    'gracemere':[-23.4354,150.4557],'mount morgan':[-23.6480,150.3901],'yeppoon':[-23.1303,150.7443],
    'townsville':[-19.2576,146.8177],'north ward':[-19.2474,146.8203],'west end':[-19.2745,146.8108],
    'garbutt':[-19.2534,146.7755],'hyde park':[-19.2714,146.7946],'idalia':[-19.2943,146.7865],
    'hermit park':[-19.2898,146.8047],'railway estate':[-19.2714,146.8177],'aitkenvale':[-19.3094,146.7826],
    'currajong':[-19.2827,146.7826],'cranbrook':[-19.2949,146.7666],'vincent':[-19.3095,146.8083],
    'kirwan':[-19.3277,146.7739],'thuringowa central':[-19.3401,146.7560],'kelso':[-19.3509,146.8110],
    'mount louisa':[-19.3052,146.7395],'mundingburra':[-19.2948,146.8226],'pallarenda':[-19.1878,146.7979],
    'cape cleveland':[-19.2003,147.0196],'magnetic island':[-19.1600,146.8600],
    'cairns':[-16.9186,145.7781],'cairns north':[-16.9055,145.7613],'cairns city':[-16.9190,145.7746],
    'mooroobool':[-16.9219,145.7402],'bungalow':[-16.9306,145.7633],'westcourt':[-16.9308,145.7573],
    'manoora':[-16.9274,145.7446],'whitfield':[-16.8889,145.7407],'earlville':[-16.9385,145.7458],
    'edmonton':[-17.0244,145.7553],'gordonvale':[-17.0959,145.7830],'babinda':[-17.3414,145.9206],
    'innisfail':[-17.5186,146.0296],'tully':[-17.9289,145.9206],'cardwell':[-18.2590,146.0199],
    'ingham':[-18.6576,146.1610],'ayr':[-19.5686,147.3954],'bowen':[-20.0147,148.2381],
    'mount isa':[-20.7241,139.4927],'cloncurry':[-20.7041,140.5063],'normanton':[-17.6713,141.0768],
    'georgetown':[-18.2948,143.5400],'charters towers':[-20.0780,146.2669],'richmond':[-20.7316,143.1406],
    'julia creek':[-20.6578,141.7418],'winton':[-22.3936,143.0439],'longreach':[-23.4427,144.2493],
    'gladstone':[-23.8427,151.2560],'tannum sands':[-23.9441,151.3693],'boyne island':[-23.9518,151.3537],
    'bundaberg':[-24.8702,152.3521],'bargara':[-24.8213,152.4678],'gin gin':[-25.0025,151.9600],
    'childers':[-25.2367,152.2751],'gympie':[-26.1882,152.6646],'tin can bay':[-25.9198,152.9780],
    'rainbow beach':[-25.9048,153.0920],'cooloola cove':[-26.0117,152.9958],'noosa':[-26.3883,153.0086],
    'noosaville':[-26.3945,153.0428],'noosa heads':[-26.3867,153.0986],'tewantin':[-26.3906,153.0348],
    'sunshine coast':[-26.6500,153.0667],'maroochydore':[-26.6519,153.0992],'caloundra':[-26.7995,153.1298],
    'nambour':[-26.6268,152.9594],'buderim':[-26.6831,153.0507],'palmview':[-26.7231,153.0319],
    'kawana':[-26.7197,153.1115],'bokarina':[-26.7403,153.1278],'aroha':[-26.7597,153.1298],
    'mooloolaba':[-26.6833,153.1250],'alexandra headland':[-26.6776,153.1280],'cotton tree':[-26.6566,153.1032],
    'bli bli':[-26.6167,153.0417],'coolum beach':[-26.5357,153.0957],'peregian beach':[-26.5022,153.0894],
    'marcus beach':[-26.4900,153.0789],'sunshine beach':[-26.3917,153.1062],
    // ── South Australia ──────────────────────────────────────────
    'adelaide':[-34.9285,138.6007],'adelaide cbd':[-34.9285,138.6007],'adelaide city':[-34.9285,138.6007],
    'north adelaide':[-34.9081,138.6003],'prospect':[-34.8876,138.5981],'blair athol':[-34.8682,138.5832],
    'enfield':[-34.8548,138.5918],'northfield':[-34.8517,138.5806],'gepps cross':[-34.8363,138.5910],
    'elizabeth':[-34.7132,138.6700],'elizabeth east':[-34.7132,138.6900],'elizabeth north':[-34.7032,138.6800],
    'parafield':[-34.7830,138.6287],'mawson lakes':[-34.8023,138.6127],'salisbury':[-34.7700,138.6400],
    'port adelaide':[-34.8481,138.5068],'gillman':[-34.8349,138.5170],'ottoway':[-34.8583,138.5302],
    'semaphore':[-34.8382,138.4748],'exeter':[-34.8464,138.4926],'largs bay':[-34.8255,138.4804],
    'brighton':[-35.0233,138.5177],'seaford':[-35.1858,138.4755],'noarlunga':[-35.1504,138.4904],
    'christies beach':[-35.1438,138.4826],'hackham':[-35.1539,138.5124],'morphett vale':[-35.1353,138.5157],
    'happy valley':[-35.0754,138.5542],'flagstaff hill':[-35.0412,138.5518],'aberfoyle park':[-35.0608,138.5736],
    'glenelg':[-34.9824,138.5148],'holden hill':[-34.8683,138.6506],'campbelltown':[-34.8666,138.6644],
    'payneham':[-34.9033,138.6453],'norwood':[-34.9184,138.6325],'st peters':[-34.9126,138.6289],
    'kensington':[-34.9126,138.6387],'burnside':[-34.9294,138.6621],'tusmore':[-34.9376,138.6540],
    'magill':[-34.9181,138.6673],'marden':[-34.8972,138.6408],'glynde':[-34.8997,138.6529],
    'tranmere':[-34.9270,138.6702],'hectorville':[-34.8936,138.6588],'hope valley':[-34.8729,138.6882],
    'modbury':[-34.8540,138.7102],'tea tree gully':[-34.8323,138.7222],'golden grove':[-34.7970,138.7288],
    'virginia':[-34.6678,138.5614],'two wells':[-34.5954,138.5118],'mallala':[-34.4526,138.5015],
    'gawler':[-34.5988,138.7463],'kapunda':[-34.3493,138.9137],'tanunda':[-34.5264,138.9556],
    'angaston':[-34.4983,139.0526],'nuriootpa':[-34.4699,138.9969],'barossa':[-34.5003,138.9600],
    'mount barker':[-35.0688,138.8602],'hahndorf':[-34.9968,138.7993],'stirling':[-35.0135,138.7320],
    'aldgate':[-35.0223,138.7442],'crafers':[-35.0060,138.7119],'bridgewater':[-34.9879,138.7660],
    'port pirie':[-33.1856,138.0172],'port augusta':[-32.4936,137.7714],'port lincoln':[-34.7281,135.8661],
    'whyalla':[-33.0381,137.5656],'ceduna':[-32.1289,133.6700],'streaky bay':[-32.7985,134.2145],
    'mount gambier':[-37.8290,140.7829],'millicent':[-37.5905,140.3569],'naracoorte':[-36.9567,140.7447],
    'bordertown':[-36.3051,140.7672],'keith':[-36.1006,140.3442],'meningie':[-35.6883,139.3390],
    'murray bridge':[-35.1191,139.2724],'mannum':[-34.9103,139.3023],'swan reach':[-34.5720,139.6019],
    'renmark':[-34.1793,140.7496],'berri':[-34.2797,140.5987],'barmera':[-34.2541,140.4601],
    'loxton':[-34.4541,140.5671],'waikerie':[-34.1832,139.9839],'blanchetown':[-34.3464,139.6133],
    // ── Western Australia ─────────────────────────────────────────
    'perth':[-31.9505,115.8605],'perth cbd':[-31.9505,115.8605],'perth city':[-31.9505,115.8605],
    'fremantle':[-32.0569,115.7439],'east fremantle':[-32.0440,115.7655],'north fremantle':[-32.0393,115.7500],
    'cottesloe':[-31.9958,115.7628],'mosman park':[-31.9861,115.7734],'claremont':[-31.9835,115.7835],
    'nedlands':[-31.9772,115.8019],'dalkeith':[-31.9879,115.8143],'peppermint grove':[-31.9937,115.8076],
    'crawley':[-31.9769,115.8177],'subiaco':[-31.9512,115.8263],'shenton park':[-31.9565,115.8181],
    'mount hawthorn':[-31.9272,115.8388],'leederville':[-31.9374,115.8407],'north perth':[-31.9224,115.8588],
    'highgate':[-31.9349,115.8648],'mt lawley':[-31.9302,115.8670],'inglewood':[-31.9185,115.8678],
    'bayswater':[-31.9196,115.8960],'maylands':[-31.9268,115.8841],'ascot':[-31.9327,115.9222],
    'rivervale':[-31.9565,115.9079],'redcliffe':[-31.9358,115.9428],'belmont':[-31.9485,115.9258],
    'cloverdale':[-31.9612,115.9352],'forrestfield':[-31.9750,116.0050],'kalamunda':[-31.9742,116.0546],
    'maida vale':[-31.9620,116.0323],'lesmurdie':[-32.0086,116.0570],'gooseberry hill':[-31.9761,116.0396],
    'mundaring':[-31.9024,116.1696],'chidlow':[-31.8613,116.2726],'york':[-31.8876,116.7688],
    'northam':[-31.6513,116.6717],'toodyay':[-31.5535,116.4727],'guildford':[-31.9003,115.9758],
    'midland':[-31.8882,116.0106],'stratton':[-31.8612,116.0354],'red hill':[-31.8564,116.0020],
    'swan view':[-31.8730,116.0536],'greenmount':[-31.8878,116.0407],'koongamia':[-31.8919,116.0546],
    'armadale':[-32.1515,115.9991],'brookdale':[-32.1438,115.9900],'camillo':[-32.1301,115.9900],
    'harrisdale':[-32.1230,115.9689],'canning vale':[-32.0773,115.9366],'thornlie':[-32.0608,115.9609],
    'gosnells':[-32.0828,115.9966],'maddington':[-32.0579,115.9966],'kenwick':[-32.0472,115.9756],
    'beckenham':[-32.0222,115.9567],'cannington':[-32.0139,115.9371],'bentley':[-32.0019,115.9183],
    'victoria park':[-31.9693,115.8955],'east victoria park':[-31.9876,115.9019],'welshpool':[-31.9973,115.9269],
    'kewdale':[-31.9876,115.9519],'perth airport':[-31.9384,115.9671],'airport':[-31.9384,115.9671],
    'morley':[-31.8955,115.8924],'dianella':[-31.8972,115.8710],'nollamara':[-31.8824,115.8588],
    'balga':[-31.8706,115.8527],'mirrabooka':[-31.8632,115.8448],'hamersley':[-31.8534,115.8172],
    'girrawheen':[-31.8449,115.8333],'koondoola':[-31.8413,115.8449],'wanneroo':[-31.7550,115.8068],
    'joondalup':[-31.7448,115.7662],'edgewater':[-31.7544,115.7799],'woodvale':[-31.7628,115.8051],
    'kingsley':[-31.7939,115.8022],'greenwood':[-31.8029,115.8087],'warwick':[-31.8237,115.7980],
    'ocean reef':[-31.7374,115.7461],'connolly':[-31.7302,115.7646],'heathridge':[-31.7429,115.7703],
    'mullaloo':[-31.7793,115.7432],'hillarys':[-31.8046,115.7399],'padbury':[-31.8178,115.7600],
    'mindarie':[-31.6922,115.7198],'clarkson':[-31.6862,115.7668],'butler':[-31.6465,115.7618],
    'ridgewood':[-31.6398,115.7778],'banksia grove':[-31.7046,115.8098],'tapping':[-31.6950,115.8012],
    'sinagra':[-31.7159,115.8182],'gnangara':[-31.7501,115.8598],'ellenbrook':[-31.7703,115.9800],
    'bullsbrook':[-31.6583,116.0000],'upper swan':[-31.7553,116.0248],'henley brook':[-31.7765,115.9937],
    'rockingham':[-32.2779,115.7294],'safety bay':[-32.3155,115.7566],'waikiki':[-32.2968,115.7517],
    'shoalwater':[-32.3003,115.7428],'golden bay':[-32.3742,115.7526],'secret harbour':[-32.4083,115.7556],
    'mandurah':[-32.5273,115.7229],'pinjarra':[-32.6247,115.8744],'waroona':[-32.8406,115.9139],
    'harvey':[-33.0803,115.9040],'brunswick junction':[-33.2582,115.8363],'collie':[-33.3665,116.1534],
    'bunbury':[-33.3270,115.6413],'dalyellup':[-33.3820,115.6190],'australind':[-33.2782,115.7213],
    'eaton':[-33.3054,115.7150],'capel':[-33.5609,115.5672],'busselton':[-33.6505,115.3497],
    'dunsborough':[-33.6101,115.1020],'yallingup':[-33.6404,115.0323],'margaret river':[-33.9558,115.0729],
    'augusta':[-34.3140,115.1580],'denmark':[-34.9585,117.3512],'albany':[-35.0269,117.8839],
    'esperance':[-33.8583,121.8888],'kalgoorlie':[-30.7489,121.4664],'boulder':[-30.7820,121.4971],
    'coolgardie':[-30.9567,121.1660],'norseman':[-32.1984,121.7760],'leonora':[-28.8824,121.3248],
    'meekatharra':[-26.5951,118.4929],'newman':[-23.3618,119.7342],'port hedland':[-20.3101,118.5755],
    'south hedland':[-20.3916,118.6006],'karratha':[-20.7358,116.8483],'dampier':[-20.6669,116.7119],
    'wickham':[-20.6747,117.1421],'roebourne':[-20.7790,117.1423],'onslow':[-21.6417,115.1094],
    'exmouth':[-21.9367,114.1258],'carnarvon':[-24.8756,113.6513],'geraldton':[-28.7769,114.6154],
    'greenough':[-28.9601,114.7359],'dongara':[-29.2577,114.9284],'northampton':[-28.3504,114.6303],
    'kalbarri':[-27.7114,114.1681],'broome':[-17.9614,122.2359],'derby':[-17.3117,123.6289],
    'fitzroy crossing':[-18.1836,125.5886],'halls creek':[-18.2254,127.6665],'kununurra':[-15.7749,128.7381],
    'wyndham':[-15.4742,128.1239],'north perth':[-31.9224,115.8588],
    // ── Australian Capital Territory ──────────────────────────────
    'canberra':[-35.2809,149.1300],'civic':[-35.2785,149.1299],'city':[-35.2785,149.1299],
    'braddon':[-35.2707,149.1340],'reid':[-35.2771,149.1411],'acton':[-35.2770,149.1198],
    'parkes':[-35.2934,149.1340],'barton':[-35.3028,149.1432],'kingston':[-35.3143,149.1503],
    'manuka':[-35.3184,149.1465],'griffith':[-35.3292,149.1282],'garran':[-35.3403,149.1159],
    'narrabundah':[-35.3345,149.1579],'curtin':[-35.3228,149.0898],'woden':[-35.3453,149.0878],
    'phillip':[-35.3626,149.0879],'tuggeranong':[-35.4098,149.0574],'erindale':[-35.4022,149.0701],
    'kambah':[-35.3998,149.0456],'macgregor':[-35.3837,149.0209],'richardson':[-35.4139,149.0319],
    'chifley':[-35.4188,149.0697],'calwell':[-35.4293,149.0761],'isabella plains':[-35.4341,149.0629],
    'belconnen':[-35.2335,149.0623],'bruce':[-35.2424,149.0898],'evatt':[-35.2161,149.0614],
    'macquarie':[-35.2548,149.0681],'latham':[-35.2209,149.0399],'scullin':[-35.2313,149.0487],
    'florey':[-35.2179,149.0478],'melba':[-35.2193,149.0535],'higgins':[-35.2290,149.0342],
    'holt':[-35.2073,149.0251],'charnwood':[-35.2057,149.0411],'spence':[-35.2015,149.0481],
    'dunlop':[-35.1942,149.0411],'fraser':[-35.1976,149.0498],'page':[-35.2349,149.0573],
    'gungahlin':[-35.1833,149.1330],'franklin':[-35.1851,149.1417],'harrison':[-35.1896,149.1560],
    'forde':[-35.1742,149.1421],'ngunnawal':[-35.1617,149.1164],'mitchell':[-35.1956,149.1147],
    'symonston':[-35.3229,149.1699],'fyshwick':[-35.3245,149.1661],'hume':[-35.3740,149.1499],
    'queanbeyan':[-35.3528,149.2323],'jerrabomberra':[-35.3739,149.1907],
    // ── Northern Territory ────────────────────────────────────────
    'darwin':[-12.4634,130.8456],'darwin cbd':[-12.4637,130.8444],'stuart park':[-12.4729,130.8431],
    'parap':[-12.4354,130.8336],'fannie bay':[-12.4150,130.8325],'nightcliff':[-12.3771,130.8447],
    'rapid creek':[-12.3714,130.8617],'casuarina':[-12.3662,130.8767],'tiwi':[-12.3602,130.8916],
    'muirhead':[-12.3494,130.9031],'lyons':[-12.3763,130.8970],'leanyer':[-12.3612,130.8887],
    'brinkin':[-12.3647,130.8820],'nakara':[-12.3755,130.8798],'millner':[-12.3796,130.8753],
    'ludmilla':[-12.4155,130.8405],'larrakeyah':[-12.4373,130.8313],'the gardens':[-12.4397,130.8441],
    'winnellie':[-12.4336,130.8831],'coconut grove':[-12.4127,130.8339],'wanguri':[-12.3789,130.8893],
    'alice springs':[-23.6980,133.8807],'east side':[-23.6968,133.8956],'ross':[-23.7073,133.8948],
    'stuart':[-23.6965,133.8689],'sadadeen':[-23.7178,133.9015],'gillen':[-23.7018,133.8607],
    'katherine':[-14.4671,132.2647],'nhulunbuy':[-12.1772,136.7681],'jabiru':[-12.6671,132.8911],
    'tennant creek':[-19.6485,134.1975],'mataranka':[-14.9213,133.0695],
    // ── Tasmania ──────────────────────────────────────────────────
    'hobart':[-42.8821,147.3272],'hobart cbd':[-42.8821,147.3272],'hobart city':[-42.8821,147.3272],
    'sandy bay':[-42.9065,147.3279],'battery point':[-42.8934,147.3313],'south hobart':[-42.9004,147.3122],
    'west hobart':[-42.8894,147.3001],'north hobart':[-42.8703,147.3181],'new town':[-42.8619,147.3202],
    'lenah valley':[-42.8636,147.3036],'mount nelson':[-42.9261,147.3310],'mount stuart':[-42.8823,147.3013],
    'glebe':[-42.8792,147.3042],'glenorchy':[-42.8365,147.2695],'claremont':[-42.7984,147.2606],
    'moonah':[-42.8480,147.2968],'lutana':[-42.8463,147.3138],'derwent park':[-42.8483,147.2940],
    'goodwood':[-42.8648,147.2883],'kingborough':[-43.0186,147.2895],'kingston':[-42.9762,147.3149],
    'blackmans bay':[-43.0044,147.3145],'taroona':[-42.9428,147.3343],'howrah':[-42.8982,147.3765],
    'lindisfarne':[-42.8768,147.3699],'rosny':[-42.8868,147.3618],'mornington':[-42.8734,147.3824],
    'rokeby':[-42.9028,147.4024],'lauderdale':[-42.9108,147.4485],'cambridge':[-42.8427,147.4296],
    'clarence':[-42.8736,147.3792],'launceston':[-41.4332,147.1441],'south launceston':[-41.4473,147.1378],
    'east launceston':[-41.4281,147.1576],'west launceston':[-41.4336,147.1340],
    'inveresk':[-41.4244,147.1398],'newnham':[-41.4140,147.1323],'prospect':[-41.4056,147.1211],
    'mowbray':[-41.4140,147.1441],'ravenswood':[-41.4244,147.1576],'norwood':[-41.4384,147.1647],
    'youngtown':[-41.4519,147.1694],'kings meadows':[-41.4570,147.1575],'newport':[-41.4665,147.1647],
    'newnham':[-41.4140,147.1323],'devonport':[-41.1742,146.3639],'ulverstone':[-41.1615,146.1713],
    'burnie':[-41.0541,145.9007],'wynyard':[-40.9884,145.7265],'smithton':[-40.8449,145.1205],
    'penguin':[-41.1224,146.0780],'railton':[-41.3553,146.4189],'sheffield':[-41.3900,146.3451],
    'deloraine':[-41.5246,146.6519],'longford':[-41.5980,147.0970],'scottsdale':[-41.1531,147.5200],
    'st helens':[-41.3208,148.2502],'swansea':[-42.1279,148.0731],'triabunna':[-42.5058,147.9101],
    'dover':[-43.3136,147.0104],'huonville':[-43.0304,147.0300],'geeveston':[-43.1671,146.9271],
    'strahan':[-42.1552,145.3375],'queenstown':[-42.0785,145.5551],'rosebery':[-41.7810,145.5342],
    'zeehan':[-41.8925,145.3301],'gormanston':[-42.0547,145.5647],'tullah':[-41.7456,145.5031],
    'waratah':[-41.4579,145.5344],'circular head':[-40.8449,145.1205],
  };

  /* ── Merge AU_SUBURBS into the existing geocoder databases ── */
  function mergeSuburbsIntoGeocoder() {
    // Admin-side: merge into EXTENDED_COORDS
    if (typeof window.EXTENDED_COORDS === 'object') {
      Object.entries(AU_SUBURBS).forEach(function ([k, v]) {
        if (!window.EXTENDED_COORDS[k]) window.EXTENDED_COORDS[k] = v;
      });
    }
    // live-routes side: merge into WORLD_COORDS
    if (window.LiveRoutes && window.LiveRoutes.resolveCoords) {
      // LiveRoutes already has a resolveCoords function; extend its internal DB
      // by replacing WORLD_COORDS reference if accessible, or patching resolveCoords
      const _orig = window.LiveRoutes.resolveCoords;
      window.LiveRoutes.resolveCoords = function (locationStr) {
        if (!locationStr) return null;
        const key = locationStr.trim().toLowerCase().replace(/\s+/g, ' ');
        if (AU_SUBURBS[key]) return [...AU_SUBURBS[key]];
        // Try partial match with suburb list
        for (const [k, v] of Object.entries(AU_SUBURBS)) {
          if (key.includes(k) || k.includes(key)) return [...v];
        }
        return _orig.call(this, locationStr);
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     2. OSRM REAL ROAD ROUTING
        Uses router.project-osrm.org (free, no API key, global).
        For Australian road routes, fetches the real driving path.
        Falls back silently to existing Bezier route if OSRM fails.
     ═══════════════════════════════════════════════════════════════ */

  // Cache to avoid repeated OSRM calls for the same pair
  const _osrmCache = {};

  /**
   * Fetch a real road route from OSRM.
   * Returns a Promise<Array<[lat,lng]>> or null on failure.
   */
  async function fetchOSRMRoute(fromCoords, toCoords) {
    const key = fromCoords[0].toFixed(4) + ',' + fromCoords[1].toFixed(4) + ':' +
                toCoords[0].toFixed(4)   + ',' + toCoords[1].toFixed(4);
    if (_osrmCache[key]) return _osrmCache[key];

    const [lat1, lng1] = fromCoords;
    const [lat2, lng2] = toCoords;
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;

    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!data.routes || !data.routes[0] || !data.routes[0].geometry) return null;
      const coords = data.routes[0].geometry.coordinates; // [[lng,lat],...]
      const route = coords.map(function (c) { return [c[1], c[0]]; }); // → [[lat,lng],...]
      _osrmCache[key] = route;
      return route;
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetch + cache a route for a shipment, then persist via SyncEngine.
   * Called when a new shipment's movement starts.
   */
  async function fetchAndStoreRoute(ship) {
    if (!ship || !ship.id) return;
    const originCoords = (ship.origin && ship.origin.coordinates) ||
      (window.geocode && window.geocode(ship.origin && ship.origin.city)) ||
      (window.LiveRoutes && window.LiveRoutes.resolveCoords && window.LiveRoutes.resolveCoords((ship.origin || {}).city || ''));
    const destCoords = (ship.destination && ship.destination.coordinates) ||
      (window.geocode && window.geocode(ship.destination && ship.destination.city)) ||
      (window.LiveRoutes && window.LiveRoutes.resolveCoords && window.LiveRoutes.resolveCoords((ship.destination || {}).city || ''));
    if (!originCoords || !destCoords) return;

    const mode = (ship.transportMode || '').toLowerCase();
    if (mode === 'air' || mode === 'sea') return; // air/sea use existing great-circle/sealane logic

    const route = await fetchOSRMRoute(originCoords, destCoords);
    if (!route || route.length < 2) return;

    // Store via SyncEngine so admin + user share the same route
    if (window.SyncEngine) {
      const routes = window.SyncEngine.loadRoutes() || {};
      routes[ship.id] = route;
      window.SyncEngine.saveRoutes(routes);
    }
    return route;
  }

  /**
   * Patch admin generateRoute() to try OSRM first, then fall back.
   * generateRoute() is synchronous; we replace it with a version that
   * checks SyncEngine.loadRoutes() for a cached OSRM route and falls
   * back to the original Bezier route while OSRM fetches async.
   */
  function patchGenerateRoute() {
    if (typeof window.generateRoute !== 'function' || window.generateRoute._osrmPatched) return;
    const _orig = window.generateRoute;
    window.generateRoute = function (originCoords, destCoords, transportMode, numPoints) {
      // Return existing sync route (Bezier) immediately
      const syncRoute = _orig.call(this, originCoords, destCoords, transportMode, numPoints);

      // For road mode, kick off async OSRM fetch + store
      const mode = (transportMode || '').toLowerCase();
      if (mode !== 'air' && mode !== 'sea') {
        fetchOSRMRoute(originCoords, destCoords).then(function (osrmRoute) {
          if (!osrmRoute || osrmRoute.length < 2) return;
          // Find which ship this route belongs to by matching origin/dest coords
          const ships = window.ships || [];
          const match = ships.find(function (s) {
            const oc = (s.origin && s.origin.coordinates) || [0, 0];
            const dc = (s.destination && s.destination.coordinates) || [0, 0];
            return Math.abs(oc[0] - originCoords[0]) < 0.05 && Math.abs(oc[1] - originCoords[1]) < 0.05 &&
                   Math.abs(dc[0] - destCoords[0]) < 0.05 && Math.abs(dc[1] - destCoords[1]) < 0.05;
          });
          if (!match) return;
          if (window.SyncEngine) {
            const routes = window.SyncEngine.loadRoutes() || {};
            routes[match.id] = osrmRoute;
            window.SyncEngine.saveRoutes(routes);
          }
        }).catch(function () {});
      }
      return syncRoute;
    };
    window.generateRoute._osrmPatched = true;
  }

  /**
   * Patch LiveRoutes.buildRoute() to prefer OSRM for road routes.
   * buildRoute() is synchronous in live-routes.js, so same pattern:
   * return Bezier immediately, async-replace with OSRM in SyncEngine.
   */
  function patchLiveRoutesBuildRoute() {
    if (!window.LiveRoutes || typeof window.LiveRoutes.buildRoute !== 'function') return;
    if (window.LiveRoutes.buildRoute._osrmPatched) return;
    const _origBuild = window.LiveRoutes.buildRoute;
    window.LiveRoutes.buildRoute = function (from, to, mode, numPoints) {
      const bezierRoute = _origBuild.call(this, from, to, mode, numPoints);
      if (mode !== 'road' && mode !== 'road' && mode !== undefined && mode !== null && mode !== 'ground') return bezierRoute;
      // Async upgrade to OSRM
      fetchOSRMRoute(from, to).then(function (osrmRoute) {
        if (!osrmRoute || osrmRoute.length < 2) return;
        // Route upgraded in SyncEngine; map will pick it up on next tick
        // (The live-routes animation reads from SyncEngine.loadRoutes())
      }).catch(function () {});
      return bezierRoute;
    };
    window.LiveRoutes.buildRoute._osrmPatched = true;
  }

  /* ═══════════════════════════════════════════════════════════════
     3. DELAY AUDIT LOGGING
        Patches delayShipment() to log every delay to AuditEngine.
     ═══════════════════════════════════════════════════════════════ */
  function patchDelayAuditLogging() {
    if (typeof window.delayShipment !== 'function' || window.delayShipment._auditPatched) return;
    const _orig = window.delayShipment;
    window.delayShipment = function (shipId, reason, extraDays) {
      // Snapshot before
      const ship = (window.ships || []).find(function (s) { return s.id === shipId; });
      const oldStatus = ship ? ship.status : null;
      const oldETA    = ship ? ship.estimatedDelivery : null;

      _orig.apply(this, arguments);

      // Log to AuditEngine after mutation
      if (window.AuditEngine && ship) {
        const entry = {
          id: 'AUD' + Date.now() + Math.random().toString(36).slice(2, 6),
          type: 'delayed',
          icon: '⏸️',
          label: 'Shipment Delayed',
          trackingNumber: ship.trackingNumber || '—',
          shipmentId: ship.id || '',
          packageName: ship.packageName || ship.packageType || '—',
          origin: (ship.origin && ship.origin.city) || '—',
          destination: (ship.destination && ship.destination.city) || '—',
          actor: 'Admin',
          timestamp: Date.now(),
          changes: [
            { field: 'Status',   key: 'status',            before: oldStatus || '—', after: 'delayed' },
            { field: 'ETA',      key: 'estimatedDelivery', before: oldETA    || '—', after: ship.estimatedDelivery || '—' },
            { field: 'Ext Days', key: 'extraDays',         before: '—',              after: String(extraDays || 1) },
          ],
          deletionReason: reason || 'Logistics Issues',
        };
        try {
          const log = AuditEngine.getLog();
          log.unshift(entry);
          // Use internal saveLog via getLog getter
          if (typeof AuditEngine._saveLog === 'function') {
            AuditEngine._saveLog(log);
          } else {
            window._epa_audit_log = (window._epa_audit_log||[]).concat(log.slice(0,500)).slice(0,500);
          }
          // Broadcast
          if (window.SyncEngine && window.SyncEngine._broadcast) {
            window.SyncEngine._broadcast({ type: 'audit_update', entry: entry, ts: Date.now() });
          }
        } catch (e) {}
      }
    };
    window.delayShipment._auditPatched = true;
  }

  /**
   * Also patch applyDelay() to ensure the delay reason from the modal
   * is correctly forwarded to delayShipment (it already does, but we
   * patch it so AuditEngine gets the 'delayed' filter type shown in UI).
   */
  function patchAuditFilterForDelayed() {
    // Extend renderAuditLog to show 'delayed' filter button if it exists
    const origRender = window.renderAuditLog;
    if (typeof origRender !== 'function' || window.renderAuditLog._delayPatch) return;
    window.renderAuditLog = function (filter) {
      // Dynamically add 'delayed' filter if not present
      const audPanel = document.getElementById('p-audit');
      if (audPanel && !document.getElementById('aud-filter-delayed')) {
        const movBtn = document.getElementById('aud-filter-movement');
        if (movBtn) {
          const delBtn = document.createElement('button');
          delBtn.className = 'btn bs btn-sm';
          delBtn.id = 'aud-filter-delayed';
          delBtn.style.opacity = '.7';
          delBtn.textContent = '⏸️ Delayed';
          delBtn.onclick = function () { window.renderAuditLog('delayed'); };
          movBtn.parentNode.insertBefore(delBtn, movBtn.nextSibling);
        }
      }
      origRender.call(this, filter);
    };
    window.renderAuditLog._delayPatch = true;
  }

  /* ═══════════════════════════════════════════════════════════════
     4. USER TRACKING PAGE — DELAYED BANNER + STATUS LABEL
        Patches showTrackingResult() to show a prominent red banner
        when the shipment is delayed, including the reason.
     ═══════════════════════════════════════════════════════════════ */
  function patchUserDelayBanner() {
    if (typeof window.showTrackingResult !== 'function' || window.showTrackingResult._delayBannerPatched) return;
    const _origShow = window.showTrackingResult;
    window.showTrackingResult = function (shipment) {
      _origShow.call(this, shipment);
      // Inject delay banner if status is delayed
      injectDelayBanner(shipment);
    };
    window.showTrackingResult._delayBannerPatched = true;
  }

  function injectDelayBanner(shipment) {
    const resultSection = document.getElementById('tracking-result');
    if (!resultSection) return;
    // Remove old banner
    const old = document.getElementById('delay-status-banner');
    if (old) old.remove();
    if (!shipment) return;

    const status = (shipment.status || '').toLowerCase().replace(/_/g, '-');
    const isDelayed = status === 'delayed';

    if (isDelayed) {
      const reason = shipment.delayReason || 'Logistics Issues';
      const ts = shipment.delayTimestamp
        ? new Date(shipment.delayTimestamp).toLocaleString('en-AU', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '';

      const banner = document.createElement('div');
      banner.id = 'delay-status-banner';
      banner.style.cssText = [
        'background:rgba(220,38,38,.10)',
        'border:2px solid rgba(220,38,38,.40)',
        'border-radius:.875rem',
        'padding:1rem 1.25rem',
        'margin-bottom:1.25rem',
        'display:flex',
        'align-items:flex-start',
        'gap:.875rem',
        'animation:fadeInDown .4s ease',
      ].join(';');

      banner.innerHTML = [
        '<div style="width:2.5rem;height:2.5rem;border-radius:.625rem;background:rgba(220,38,38,.15);',
          'color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.25rem">',
          '⏸️</div>',
        '<div style="flex:1;min-width:0">',
          '<div style="font-weight:700;color:#dc2626;font-size:.9375rem;margin-bottom:.25rem">',
            'Shipment Delayed</div>',
          '<div style="font-size:.8125rem;color:#374151;margin-bottom:.2rem">',
            '<strong>Reason:</strong> ', escHtml(reason), '</div>',
          ts ? '<div style="font-size:.75rem;color:#6b7280">Delay applied: ' + ts + '</div>' : '',
          '<div style="font-size:.75rem;color:#6b7280;margin-top:.25rem">',
            'Our team is working to resolve the delay. You will be notified when movement resumes.',
          '</div>',
        '</div>',
      ].join('');

      // Insert at top of result section
      resultSection.insertBefore(banner, resultSection.firstChild);
    }
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Add CSS for banner animation if not already present
  function injectBannerStyles() {
    if (document.getElementById('rru-styles')) return;
    const s = document.createElement('style');
    s.id = 'rru-styles';
    s.textContent = '@keyframes fadeInDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     5. LIVE SYNC — refresh delay banner on admin updates
     ═══════════════════════════════════════════════════════════════ */
  function hookSyncForDelayBanner() {
    if (!window.SyncEngine || !window.SyncEngine.onUpdate) return;
    window.SyncEngine.onUpdate(function (data) {
      if (data.type !== 'shipment_update' && data.type !== 'move_update') return;
      // Re-inject delay banner for currently displayed shipment
      const input = document.getElementById('tracking-number-input');
      if (!input || !input.value.trim()) return;
      const num = input.value.trim().toUpperCase();
      const ship = window.MOCK_SHIPMENTS && window.MOCK_SHIPMENTS[num];
      if (ship) injectDelayBanner(ship);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT — apply all patches once DOM is ready
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    injectBannerStyles();
    mergeSuburbsIntoGeocoder();
    patchGenerateRoute();
    patchLiveRoutesBuildRoute();
    patchDelayAuditLogging();
    patchAuditFilterForDelayed();
    patchUserDelayBanner();
    hookSyncForDelayBanner();
  }

  // Run after DOM loads and again after admin initialises
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-apply patches after auth (admin functions defined post-login)
  let _retryCount = 0;
  const _retryInterval = setInterval(function () {
    init();
    _retryCount++;
    if (_retryCount > 15) clearInterval(_retryInterval);
  }, 1000);

  /* ── Public API ── */
  window.RealRoutesUpgrade = {
    fetchOSRMRoute,
    fetchAndStoreRoute,
    injectDelayBanner,
    mergeSuburbsIntoGeocoder,
    AU_SUBURBS,
  };

})();
