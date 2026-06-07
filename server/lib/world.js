const CONFIG = require('./config');

const PLANETS = [
  { id:'p01', name:'Aargau', type:'Core Worlds', x:812.2005265403981,y:1428.974416430364, pop:4874948800, loyalty:46, suspicion:0, desc:'Zug Sector. Human population. Bank of Aargau. Wealth: Luxury.' },
  { id:'p02', name:'Abregado-rae', type:'Core Worlds', x:757.6649160413856,y:1077.807511223595, pop:181386000, loyalty:44, suspicion:0, desc:'Abregado Sector. Gados population. Hardline Council. Wealth: Medium.' },
  { id:'p03', name:'Agamar', type:'Outer Rim Territories', x:933.475850956687,y:1942.502399894198, pop:312700000, loyalty:45, suspicion:1, desc:'Agamar Sector. Agamarian population. Agamarian Council. Wealth: Low.' },
  { id:'p04', name:'Aleron', type:'Colonies', x:824.3097301682177,y:1776.7825644264972, pop:20687000000, loyalty:51, suspicion:0, desc:'Tapani Sector. Human population. Trade Cooperative. Wealth: Medium.' },
  { id:'p05', name:'Almania', type:'Outer Rim Territories', x:683.75,y:1568.6875, pop:135100000, loyalty:50, suspicion:1, desc:'Mortex Sector. Human population. Oligarchy. Wealth: Low.' },
  { id:'p06', name:'Alsakan', type:'Core Worlds', x:1269.6102256204463,y:2139.705119870493, pop:1079859120000, loyalty:49, suspicion:0, desc:'Alsaka Sector. Human population. Monarchy. Wealth: Ecumenopolis.' },
  { id:'p07', name:'Alzoc III', type:'Outer Rim Territories', x:1081.3179188637,y:307.29855659733, pop:616788400, loyalty:48, suspicion:1, desc:'Sujimis Sector. Talz population. Democracy. Wealth: Low.' },
  { id:'p08', name:'Ando', type:'Mid Rim', x:1385.3989610397432,y:746.3512075424009, pop:246790000, loyalty:51, suspicion:0, desc:'Lambda Sector. Aqualish population. Dictatorship. Wealth: Low.' },
  { id:'p09', name:'Ansion', type:'Mid Rim', x:515.1272900943999,y:1807.3649327128153, pop:103870000, loyalty:53, suspicion:0, desc:'Churnis Sector. Armalat population. Oligarchy. Wealth: Low.' },
  { id:'p10', name:'Aridus', type:'Expansion Region', x:1366.9063483545835,y:1863.3794202868644, pop:392470000, loyalty:48, suspicion:0, desc:'Narvath Sector. Chubbits population. Tribal. Wealth: Low.' },
  { id:'p11', name:'Arkania', type:'Colonies', x:889.75,y:1569.75, pop:727944720000, loyalty:50, suspicion:0, desc:'Perave Sector. Arkanian population. Corporate Meritocracy. Wealth: Poor.' },
  { id:'p12', name:'Arkanis', type:'Outer Rim Territories', x:1484.9570497383208,y:611.365190781835, pop:18740900000, loyalty:49, suspicion:1, desc:'Arkanis Sector. Human population. Regency. Wealth: Very High.' },
  { id:'p13', name:'Axum', type:'Core Worlds', x:745.2905473706211,y:768.6250711497771, pop:2898943000, loyalty:49, suspicion:0, desc:'Azure Sector. Human population. Military Regime. Wealth: Very High.' },
  { id:'p14', name:'Bakura', type:'Wild Space', x:224.375,y:656.75, pop:1768063200, loyalty:50, suspicion:1, desc:'Bakura Sector. Kurtzen population. Democracy. Wealth: Luxury.' },
  { id:'p15', name:'Balmorra', type:'Colonies', x:1763.170758888656,y:941.512679149888, pop:11874600000, loyalty:57, suspicion:0, desc:'Balmorra Sector. Human population. Corporatocracy. Wealth: High.' },
  { id:'p16', name:'Barnaba', type:'Colonies', x:1833.5278836167176,y:1096.722617620335, pop:762000000, loyalty:47, suspicion:0, desc:'Tapani Sector. Human population. Noble House. Wealth: Low.' },
  { id:'p17', name:'Bastion', type:'Outer Rim Territories', x:659.0235200658623,y:2210.4157979891474, pop:1546899500, loyalty:51, suspicion:1, desc:'Braxant Sector. Human population. Military Dictatorship. Wealth: High.' },
  { id:'p18', name:'Batonn', type:'Outer Rim Territories', x:659.0235200658623,y:2210.4157979891474, pop:913866000, loyalty:50, suspicion:1, desc:'Batonn Sector. Human population. Dictatorship. Wealth: Medium.' },
  { id:'p19', name:'Bespin', type:'Outer Rim Territories', x:652.30600564459,y:444.65231063961, pop:224800000, loyalty:47, suspicion:1, desc:'Anoat Sector. Human population. Guild. Wealth: Very High.' },
  { id:'p20', name:'Bestine', type:'Inner Rim', x:886.0,y:886.0, pop:928500000, loyalty:54, suspicion:0, desc:'Bestine Sector. H\'kig population. Informal Council. Wealth: Medium.' },
  { id:'p21', name:'Bilbringi', type:'Inner Rim', x:621.0165305770853,y:1643.1393827822396, pop:1459138, loyalty:52, suspicion:0, desc:'Bilbringi Sector. Human population. Corporatocracy. Wealth: Medium.' },
  { id:'p22', name:'Bimmisaari', type:'Mid Rim', x:1564.75,y:1547.625, pop:317833900, loyalty:49, suspicion:0, desc:'Halla Sector. Furred Bimm population. Elder Council. Wealth: Luxury.' },
  { id:'p23', name:'Bonadan', type:'Outer Rim Territories', x:1641.75,y:2158.5, pop:12606411476, loyalty:52, suspicion:1, desc:'Corporate Sector. Various population. Corporate Board. Wealth: High.' },
  { id:'p24', name:'Borosk', type:'Outer Rim Territories', x:649.0453646132717,y:1987.0173295334846, pop:501972000, loyalty:54, suspicion:1, desc:'Prefsbelt Sector. Human population. Military Dictatorship. Wealth: Medium.' },
  { id:'p25', name:'Botajef', type:'Outer Rim Territories', x:1170.3701560268835,y:1859.132890389543, pop:57794200000, loyalty:50, suspicion:1, desc:'Belsmuth Sector. Jefi population. Governorship. Wealth: Medium.' },
  { id:'p26', name:'Bothawui', type:'Mid Rim', x:1492.5,y:934.5, pop:3712900000, loyalty:50, suspicion:0, desc:'Bothan Space. Bothan population. Bothan Council. Wealth: Medium.' },
  { id:'p27', name:'Boz Pity', type:'Mid Rim', x:1595.5,y:1513.0, pop:391720000, loyalty:51, suspicion:0, desc:'Halla Sector. Various population. Democracy. Wealth: Low.' },
  { id:'p28', name:'Brigia', type:'Outer Rim Territories', x:1465.1252506185267,y:1371.0800487207157, pop:587100000, loyalty:49, suspicion:1, desc:'Tion Hegemony. Brigian population. Dictatorship. Wealth: Poor.' },
  { id:'p29', name:'Byblos', type:'Colonies', x:987.75,y:1138.75, pop:63300550000, loyalty:47, suspicion:0, desc:'Byblos Sector. Human population. Corporatocracy. Wealth: High.' },
  { id:'p30', name:'Byss', type:'Deep Core', x:701.5383152847035,y:1238.6743039435346, pop:23600772000, loyalty:48, suspicion:0, desc:'Beshqek Sector. Human population. Dictatorship. Wealth: High.' },
  { id:'p31', name:'Carida', type:'Colonies', x:939.7449121969216,y:1522.0473465040434, pop:176790000, loyalty:50, suspicion:0, desc:'Carida Sector. Caridan population. Merchant Council. Wealth: Medium.' },
  { id:'p32', name:'Cato Neimoidia', type:'Colonies', x:1015.5,y:1289.0, pop:792780000, loyalty:52, suspicion:0, desc:'Rachuk Sector. Neimoidian population. Federation. Wealth: Luxury.' },
  { id:'p33', name:'Centares', type:'Mid Rim', x:1515.0,y:1515.0, pop:1334890000, loyalty:53, suspicion:0, desc:'Maldrood Sector. Human population. Governorship. Wealth: High.' },
  { id:'p34', name:'Centrality', type:'Outer Rim Territories', x:1199.6950426306262,y:683.7722574073914, pop:23487955000, loyalty:50, suspicion:1, desc:'Centrality. Centran population. Governorship. Wealth: Medium.' },
  { id:'p35', name:'Cerea', type:'Mid Rim', x:475.0,y:475.0, pop:587422000, loyalty:51, suspicion:0, desc:'Semagi Sector. Cerean population. Council of Elders. Wealth: Low.' },
  { id:'p36', name:'Chandrila', type:'Core Worlds', x:823.4258466917346,y:1492.1720849989117, pop:1329000000, loyalty:53, suspicion:0, desc:'Bormea Sector. Human population. Chandrilan House. Wealth: Medium.' },
  { id:'p37', name:'Christophsis', type:'Outer Rim Territories', x:1452.0437751666,y:636.74965645849, pop:95289344000, loyalty:52, suspicion:1, desc:'Savareen Sector. Human population. Mercantile Oligarchy. Wealth: Ecumenopolis.' },
  { id:'p38', name:'Ciutric', type:'Outer Rim Territories', x:1057.0620585281072,y:2006.0956059624891, pop:72648550000, loyalty:56, suspicion:1, desc:'Ciutric Sector. Human population. Dictatorship. Wealth: High.' },
  { id:'p39', name:'Clak\'dor VII', type:'Outer Rim Territories', x:343.3,y:1431.3, pop:5782980000, loyalty:48, suspicion:1, desc:'Mayagil Sector. Aalagar population. Government Assembly. Wealth: Low.' },
  { id:'p40', name:'Commenor', type:'Colonies', x:1035.625,y:1338.5, pop:31978520000, loyalty:50, suspicion:0, desc:'Commenor Sector. Human population. Democracy. Wealth: Medium.' },
  { id:'p41', name:'Cona', type:'Inner Rim', x:1147.9878592563598,y:1311.506302405749, pop:949467550, loyalty:54, suspicion:0, desc:'Inner Cluster. Arcona population. Socialist. Wealth: Medium.' },
  { id:'p42', name:'Contruum', type:'Mid Rim', x:1233.1942263893388,y:1616.6228784877442, pop:4320950000, loyalty:50, suspicion:0, desc:'Truum Sector. Human population. Corporatocracy. Wealth: Medium.' },
  { id:'p43', name:'Corellia', type:'Core Worlds', x:938.5,y:1230.625, pop:58179480000, loyalty:49, suspicion:0, desc:'Corellian Sector. Human population. Corporate Diktat. Wealth: Very High.' },
  { id:'p44', name:'Corulag', type:'Core Worlds', x:817.2386623563523,y:1487.9294443117926, pop:2134720000, loyalty:50, suspicion:0, desc:'Bormea Sector. Various population. Democracy. Wealth: High.' },
  { id:'p45', name:'Coruscant', type:'Core Worlds', x:760.824799469813,y:1454.8280081174973, pop:1210450440000, loyalty:47, suspicion:0, desc:'Corusca Sector. Various population. Galactic City Authority. Wealth: Ecumenopolis.' },
  { id:'p46', name:'Cronese Mandate', type:'Outer Rim Territories', x:1135.259937195002,y:1758.2210114203506, pop:21337950000, loyalty:59, suspicion:1, desc:'Chandaar Sector. Various population. Kingdom. Wealth: Low.' },
  { id:'p47', name:'Csilla', type:'Unknown Regions', x:48.790367901871775,y:1588.1618305449856, pop:8623750000, loyalty:52, suspicion:1, desc:'Chiss Space. Chiss population. Oligarchy. Wealth: High.' },
  { id:'p48', name:'Dac', type:'Outer Rim Territories', x:1040.568409222576,y:1810.558075364693, pop:28432900000, loyalty:51, suspicion:1, desc:'Calamari Sector. Various population. Monarchy. Wealth: High.' },
  { id:'p49', name:'Dantooine', type:'Outer Rim Territories', x:757.3113626507924,y:2112.127955404217, pop:348191500, loyalty:57, suspicion:1, desc:'Raioballo Sector. Human population. Tribal. Wealth: Low.' },
  { id:'p50', name:'Deko Neimoidia', type:'Colonies', x:1015.5,y:1289.0, pop:1342780000, loyalty:43, suspicion:0, desc:'Rachuk Sector. Neimoidian population. Federation. Wealth: Luxury.' },
  { id:'p51', name:'Denon', type:'Inner Rim', x:1033.25,y:1072.25, pop:672980660000, loyalty:54, suspicion:0, desc:'Iseno Sector. Human population. Denon City Authority. Wealth: Ecumenopolis.' },
  { id:'p52', name:'Desargorr', type:'Outer Rim Territories', x:1675.8430714121178,y:2042.1243840667494, pop:917365000, loyalty:49, suspicion:1, desc:'Allied Tion Sector. Various population. Local Government. Wealth: Medium.' },
  { id:'p53', name:'Dolomar', type:'Core Worlds', x:1529.4719677065025,y:2175.767565711007, pop:2319775000, loyalty:43, suspicion:0, desc:'Dolomar Sector. Human population. Democracy. Wealth: Medium.' },
  { id:'p54', name:'Dorin', type:'Expansion Region', x:592.5554826343268,y:1674.4288578497444, pop:671856900, loyalty:48, suspicion:0, desc:'Deadalis Sector. Kel Dor population. Representative Republic. Wealth: Medium.' },
  { id:'p55', name:'Drall', type:'Core Worlds', x:920.2994757142916,y:1389.6416017268625, pop:200975900, loyalty:50, suspicion:0, desc:'Corellian Sector. Drall population. Confederation of Clans. Wealth: High.' },
  { id:'p56', name:'Dubrillion', type:'Outer Rim Territories', x:719.1275964667187,y:2181.424419960499, pop:2156850000, loyalty:51, suspicion:1, desc:'Myto Sector. Chazrach population. Monarchy. Wealth: Medium.' },
  { id:'p57', name:'Duro', type:'Core Worlds', x:945.75,y:1233.9375, pop:18730749000, loyalty:44, suspicion:0, desc:'Duro Sector. Duros population. Corporatocracy. Wealth: High.' },
  { id:'p58', name:'Elom', type:'Outer Rim Territories', x:1509.0447768566153,y:1943.9719775076856, pop:237560980, loyalty:51, suspicion:1, desc:'Sertar Sector. Human population. Local Government. Wealth: High.' },
  { id:'p59', name:'Empress Teta', type:'Deep Core', x:765.0895372438443,y:1392.4700288516085, pop:397337395000, loyalty:54, suspicion:0, desc:'Koros Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p60', name:'Entralla', type:'Outer Rim Territories', x:653.3666658163698,y:2061.9233739399724, pop:11455980000, loyalty:51, suspicion:1, desc:'Velcar Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p61', name:'Eriadu', type:'Outer Rim Territories', x:946.1088732276005,y:463.1549416771886, pop:23118950000, loyalty:42, suspicion:1, desc:'Seswenna Sector. Human population. Local Government. Wealth: High.' },
  { id:'p62', name:'Esseles', type:'Core Worlds', x:1755.7461376861975,y:1420.577523403774, pop:1895880000, loyalty:44, suspicion:0, desc:'Darpa Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p63', name:'Ession', type:'Outer Rim Territories', x:1075.6112036921954,y:1126.5055211692659, pop:35890440000, loyalty:47, suspicion:1, desc:'Corporate Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p64', name:'Etti IV', type:'Outer Rim Territories', x:810.375,y:1570.375, pop:42980440870, loyalty:51, suspicion:1, desc:'Corporate Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p65', name:'Falleen', type:'Mid Rim', x:1326.0,y:1326.0, pop:984990200, loyalty:55, suspicion:0, desc:'Doldur Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p66', name:'Fedalle', type:'Core Worlds', x:920.2994757142916,y:1389.6416017268625, pop:2188409500, loyalty:43, suspicion:0, desc:'Fedalle Sector. Human population. Local Government. Wealth: High.' },
  { id:'p67', name:'Felucia', type:'Outer Rim Territories', x:1566.2415203282,y:1893.6319600176, pop:487522000, loyalty:56, suspicion:1, desc:'Thanium Worlds. Human population. Local Government. Wealth: Medium.' },
  { id:'p68', name:'Foerost', type:'Core Worlds', x:1820.0376997000078,y:1416.603209143939, pop:1921440800, loyalty:48, suspicion:0, desc:'Foerost Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p69', name:'Fondor', type:'Colonies', x:790.75,y:1013.0, pop:5922495200, loyalty:50, suspicion:0, desc:'Tapani Sector. Human population. Local Government. Wealth: High.' },
  { id:'p70', name:'Fresia', type:'Core Worlds', x:1757.5,y:1197.5, pop:7129300000, loyalty:43, suspicion:0, desc:'Torranix Sector. Human population. Local Government. Wealth: Very High.' },
  { id:'p71', name:'Galantos', type:'Core Worlds', x:1269.6102256204463,y:2139.705119870493, pop:697448700, loyalty:51, suspicion:0, desc:'Farlax Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p72', name:'Gand', type:'Outer Rim Territories', x:1786.25,y:1653.5, pop:2764850000, loyalty:44, suspicion:1, desc:'Shadola Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p73', name:'Ganthel', type:'Core Worlds', x:848.5281374238571,y:1498.3592693342944, pop:833489000, loyalty:50, suspicion:0, desc:'Bormea Sector. Human population. Local Government. Wealth: High.' },
  { id:'p74', name:'Garel', type:'Outer Rim Territories', x:1864.0,y:1864.0, pop:1979000000, loyalty:54, suspicion:1, desc:'Lothal Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p75', name:'Garnib', type:'Outer Rim Territories', x:714.0,y:714.0, pop:1207844600, loyalty:59, suspicion:1, desc:'Bozhnee Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p76', name:'Garos IV', type:'Mid Rim', x:253.14422766478404,y:918.443320413677, pop:931466700, loyalty:54, suspicion:0, desc:'Msst Sector. Human population. Local Government. Wealth: High.' },
  { id:'p77', name:'Geonosis', type:'Outer Rim Territories', x:1523.5,y:641.75, pop:112476980000, loyalty:45, suspicion:1, desc:'Arkanis Sector. Human population. Local Government. Wealth: Poor.' },
  { id:'p78', name:'Gerrenthum', type:'Outer Rim Territories', x:650.2730736486787,y:459.5310194236075, pop:243099470000, loyalty:49, suspicion:1, desc:'Anoat Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p79', name:'Giju', type:'Colonies', x:763.5869353338229,y:1031.5804054035245, pop:3863440980, loyalty:48, suspicion:0, desc:'Herglic Space. Human population. Local Government. Wealth: Medium.' },
  { id:'p80', name:'Glee Anselm', type:'Mid Rim', x:545.1793282948281,y:1733.1187206882278, pop:300000000, loyalty:51, suspicion:0, desc:'Jalor Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p81', name:'Grizmallt', type:'Core Worlds', x:838.0,y:838.0, pop:173460980000, loyalty:52, suspicion:0, desc:'Corusca Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p82', name:'Gyndine', type:'Expansion Region', x:1131.5,y:1185.0, pop:7367890000, loyalty:47, suspicion:0, desc:'Circarpous Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p83', name:'Hapes', type:'Inner Rim', x:1180.0,y:1180.0, pop:578655900, loyalty:55, suspicion:0, desc:'Hapes Cluster. Human population. Local Government. Wealth: High.' },
  { id:'p84', name:'Haruun Kal', type:'Mid Rim', x:967.6756300537902,y:605.2834046956847, pop:58705300, loyalty:52, suspicion:0, desc:'Dustig Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p85', name:'Ibaar', type:'Outer Rim Territories', x:1771.0000869958146,y:1678.9996764603638, pop:1347890000, loyalty:46, suspicion:1, desc:'Ibaar Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p86', name:'Iphigin', type:'Core Worlds', x:406.5863991822648,y:816.0012254892758, pop:1600000000, loyalty:59, suspicion:0, desc:'Abregado Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p87', name:'Iridonia', type:'Mid Rim', x:625.0,y:625.0, pop:2000000000, loyalty:49, suspicion:0, desc:'Glythe Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p88', name:'Ithor', type:'Mid Rim', x:889.7171074279734,y:1829.0200778866533, pop:2436899500, loyalty:47, suspicion:0, desc:'Ottega Sector. Human population. Local Government. Wealth: High.' },
  { id:'p89', name:'Jakku', type:'Inner Rim', x:422.8498551495555,y:1080.4591616530447, pop:293348300, loyalty:50, suspicion:0, desc:'Western Reaches. Human population. Local Government. Wealth: Poor.' },
  { id:'p90', name:'Javin', type:'Outer Rim Territories', x:1699.0510970554626,y:827.5619578403271, pop:1516980000, loyalty:50, suspicion:1, desc:'Javin Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p91', name:'Kalarba', type:'Mid Rim', x:1243.8685381215148,y:838.7073417995731, pop:913440700, loyalty:49, suspicion:0, desc:'Hevvrol Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p92', name:'Kamino', type:'Wild Space', x:952.0,y:952.0, pop:1167890000, loyalty:50, suspicion:1, desc:'Abrion Sector. Human population. Local Government. Wealth: Very High.' },
  { id:'p93', name:'Kashyyyk', type:'Mid Rim', x:1322.25,y:1459.75, pop:298960500, loyalty:53, suspicion:0, desc:'Mytaranor Sector. Human population. Local Government. Wealth: Very High.' },
  { id:'p94', name:'Kattada', type:'Colonies', x:1207.5616055713,y:1975.4795699399, pop:800000000, loyalty:47, suspicion:0, desc:'Kattada Sector. Human population. Local Government. Wealth: High.' },
  { id:'p95', name:'Khomm', type:'Deep Core', x:969.0,y:969.0, pop:726755920, loyalty:51, suspicion:0, desc:'Khomm Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p96', name:'Kijimi', type:'Mid Rim', x:1505.4303371462,y:1641.9019459152, pop:613537000, loyalty:52, suspicion:0, desc:'Bryx Sector. Human population. Local Government. Wealth: High.' },
  { id:'p97', name:'Kuat', type:'Core Worlds', x:982.8125,y:1382.5625, pop:35824656673, loyalty:44, suspicion:0, desc:'Kuat Sector. Human population. Local Government. Wealth: Luxury.' },
  { id:'p98', name:'Lantillies', type:'Mid Rim', x:1279.625,y:1595.375, pop:68767980000, loyalty:53, suspicion:0, desc:'Lantillian Sector. Human population. Local Government. Wealth: High.' },
  { id:'p99', name:'Lianna', type:'Outer Rim Territories', x:1593.9074330518756,y:1884.5537316204384, pop:79180455000, loyalty:57, suspicion:1, desc:'Allied Tion Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p100', name:'Loronar', type:'Colonies', x:978.75,y:1156.875, pop:127450990000, loyalty:49, suspicion:0, desc:'Byblos Sector. Human population. Local Government. Wealth: Luxury.' },
  { id:'p101', name:'Lothal', type:'Outer Rim Territories', x:1871.3580964102,y:1772.0095936535, pop:1389740000, loyalty:49, suspicion:1, desc:'Lothal Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p102', name:'Lwhekk', type:'Unknown Regions', x:575.5849198858497,y:2183.5457403040587, pop:10241789000, loyalty:47, suspicion:1, desc:'Ssi-ruuk Star Cluster. Human population. Local Government. Wealth: Poor.' },
  { id:'p103', name:'Malastare', type:'Mid Rim', x:1007.0,y:1007.0, pop:2214667800, loyalty:56, suspicion:0, desc:'Dustig Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p104', name:'Manaan', type:'Inner Rim', x:1568.5,y:856.625, pop:102423669000, loyalty:54, suspicion:0, desc:'Inner Cluster. Human population. Local Government. Wealth: Poor.' },
  { id:'p105', name:'Mandalore', type:'Outer Rim Territories', x:1193.2426932523,y:1767.5901762711, pop:498744900, loyalty:51, suspicion:1, desc:'Mandalore Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p106', name:'Maridun', type:'Outer Rim Territories', x:1366.9063483545835,y:1863.3794202868644, pop:293682900, loyalty:45, suspicion:1, desc:'Rolion Sector. Human population. Local Government. Wealth: Poor.' },
  { id:'p107', name:'Metellos', type:'Core Worlds', x:1357.6450198781713,y:2071.1157620953977, pop:935766500000, loyalty:50, suspicion:0, desc:'Corusca Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p108', name:'Minntooine', type:'Outer Rim Territories', x:757.3113626507924,y:2112.127955404217, pop:1870390400, loyalty:53, suspicion:1, desc:'Calamari Sector. Human population. Local Government. Wealth: Very High.' },
  { id:'p109', name:'Moraga', type:'Outer Rim Territories', x:1403.4743781338243,y:1745.5372835328167, pop:1231890000, loyalty:56, suspicion:1, desc:'Moraga Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p110', name:'Mrlsst', type:'Colonies', x:1412.0,y:1412.0, pop:10344576900, loyalty:51, suspicion:0, desc:'Tapani Sector. Human population. Local Government. Wealth: High.' },
  { id:'p111', name:'Muunilinst', type:'Outer Rim Territories', x:661.8519471906085,y:2095.1573926557403, pop:10972060000, loyalty:51, suspicion:1, desc:'Obtrexta Sector. Human population. Local Government. Wealth: Luxury.' },
  { id:'p112', name:'Mygeeto', type:'Outer Rim Territories', x:699.3286065934955,y:2030.1035687865779, pop:1389440000, loyalty:44, suspicion:1, desc:'Albarrio Sector. Human population. Local Government. Wealth: Luxury.' },
  { id:'p113', name:'N\'Zoth', type:'Core Worlds', x:1242.4,y:967.4, pop:2846400000, loyalty:42, suspicion:0, desc:'Farlax Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p114', name:'Naboo', type:'Mid Rim', x:1159.0,y:1159.0, pop:1176400000, loyalty:49, suspicion:0, desc:'Chommell Sector. Human population. Local Government. Wealth: Luxury.' },
  { id:'p115', name:'Nal Hutta', type:'Mid Rim', x:1594.5,y:1202.0, pop:7945330000, loyalty:55, suspicion:0, desc:'Hutt Space. Human population. Local Government. Wealth: Low.' },
  { id:'p116', name:'Nar Shaddaa', type:'Mid Rim', x:1596.25,y:1059.25, pop:109245955000, loyalty:50, suspicion:0, desc:'Hutt Space. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p117', name:'Narg', type:'Outer Rim Territories', x:1014.5927680506755,y:1296.5965765813976, pop:1364780000, loyalty:55, suspicion:1, desc:'Rayter Sector. Human population. Local Government. Wealth: High.' },
  { id:'p118', name:'Neimoidia', type:'Colonies', x:991.7172606141328,y:1377.6207864466912, pop:900345000, loyalty:57, suspicion:0, desc:'Balmorra Sector. Human population. Local Government. Wealth: High.' },
  { id:'p119', name:'Nubia', type:'Core Worlds', x:948.25,y:1227.125, pop:1634900000, loyalty:50, suspicion:0, desc:'Corellian Sector. Human population. Local Government. Wealth: High.' },
  { id:'p120', name:'Obroa-skai', type:'Inner Rim', x:1111.0,y:1111.0, pop:1134540000, loyalty:45, suspicion:0, desc:'Nouane Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p121', name:'Onderon', type:'Inner Rim', x:1202.5,y:1465.5, pop:1452850900, loyalty:47, suspicion:0, desc:'Japrael Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p122', name:'Ord Mantell', type:'Mid Rim', x:765.0895372438443,y:1746.5537495307722, pop:4873400000, loyalty:48, suspicion:0, desc:'Bright Jewel Sector. Human population. Local Government. Wealth: High.' },
  { id:'p123', name:'Ord Trasi', type:'Outer Rim Territories', x:778.5,y:2052.5, pop:2285349, loyalty:55, suspicion:1, desc:'Relgim Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p124', name:'Orinda', type:'Mid Rim', x:734.5,y:1856.0, pop:4873980000, loyalty:59, suspicion:0, desc:'Irishi Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p125', name:'Prakith', type:'Deep Core', x:934.75,y:1553.8125, pop:3975583300, loyalty:50, suspicion:0, desc:'Sector 5. Human population. Local Government. Wealth: High.' },
  { id:'p126', name:'Raithal', type:'Colonies', x:934.75,y:1553.8125, pop:2133560000, loyalty:46, suspicion:0, desc:'Barma Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p127', name:'Ralltiir', type:'Core Worlds', x:1256.0,y:1256.0, pop:13278339000, loyalty:58, suspicion:0, desc:'Darpa Sector. Human population. Local Government. Wealth: High.' },
  { id:'p128', name:'Rendili', type:'Core Worlds', x:953.8870478206526,y:1286.4040116736264, pop:523856970000, loyalty:47, suspicion:0, desc:'Corellian Sector. Human population. Local Government. Wealth: Ecumenopolis.' },
  { id:'p129', name:'Rhinnal ', type:'Core Worlds', x:1863.933475207739,y:1197.8388873300114, pop:304789000, loyalty:51, suspicion:0, desc:'Darpa Sector. Human population. Local Government. Wealth: Very High.' },
  { id:'p130', name:'Rishi', type:'Outer Rim Territories', x:1608.5,y:829.25, pop:2348950000, loyalty:44, suspicion:1, desc:'Abrion Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p131', name:'Roche', type:'Mid Rim', x:1663.9000546605205,y:941.3076020781921, pop:1618476256, loyalty:50, suspicion:0, desc:'Roche Sector. Human population. Local Government. Wealth: Medium.' },
  { id:'p132', name:'Rodia', type:'Outer Rim Territories', x:1481.0681482351322,y:661.0533840399685, pop:1927609800, loyalty:52, suspicion:1, desc:'Savareen Sector. Human population. Local Government. Wealth: High.' },
  { id:'p133', name:'Rothana', type:'Outer Rim Territories', x:1776.9434701665332,y:794.0131972595595, pop:6733458900, loyalty:49, suspicion:1, desc:'Quiberon Sector. Human population. Local Government. Wealth: High.' },
  { id:'p134', name:'Ryloth', type:'Outer Rim Territories', x:1555.2813652198,y:543.76511473246, pop:1744987000, loyalty:55, suspicion:1, desc:'Gaulus Sector. Human population. Local Government. Wealth: Low.' },
  { id:'p135', name:'Saleucami', type:'Outer Rim Territories', x:1628.113363682,y:1643.3161594775, pop:1845988000, loyalty:48, suspicion:1, desc:'Suolriep Sector. Pantoran, others population. Corporate. Wealth: High.' },
  { id:'p136', name:'Salliche', type:'Core Worlds', x:716.5,y:1429.75, pop:5357565200, loyalty:52, suspicion:0, desc:'Torranix Sector. Sallichen, Human population. Republic. Wealth: Medium.' },
  { id:'p137', name:'Sarapin', type:'Core Worlds', x:1618.5724980258642,y:1613.104988611938, pop:1577400000, loyalty:49, suspicion:0, desc:'Sarapin Sector. Humans population. Corporate. Wealth: Luxury.' },
  { id:'p138', name:'Sedri', type:'Outer Rim Territories', x:616.0667831087795,y:847.8210306426705, pop:1144000000, loyalty:52, suspicion:1, desc:'Tion Hegemony. Sedrian population. Tribal. Wealth: Medium.' },
  { id:'p139', name:'Selonia', type:'Core Worlds', x:578.0597936200026,y:428.1531560084545, pop:319000900, loyalty:56, suspicion:0, desc:'Corellian Sector. Selonian population. Corporate. Wealth: Medium.' },
  { id:'p140', name:'Sernpidal', type:'Outer Rim Territories', x:842.1641763931781,y:2264.8630201405117, pop:14487300200, loyalty:50, suspicion:1, desc:'Dalonbian Sector. Sernpidalian population. Tribal. Wealth: Low.' },
  { id:'p141', name:'Shawken', type:'Core Worlds', x:1644.0513580429065,y:1777.6027238344848, pop:19450338000, loyalty:46, suspicion:0, desc:'Farrfin Sector. Shawkenese population. Monarchy. Wealth: High.' },
  { id:'p142', name:'Shili', type:'Expansion Region', x:847.1139238614838,y:1669.4791103814387, pop:14850990000, loyalty:49, suspicion:0, desc:'Ehosiq Sector. Togruta population. Tribal. Wealth: Low.' },
  { id:'p143', name:'Skako', type:'Core Worlds', x:845.875,y:1465.5, pop:372890000000, loyalty:48, suspicion:0, desc:'Alderaan Sector. Skakoan population. Techno Union. Wealth: Ecumenopolis.' },
  { id:'p144', name:'Skor II', type:'Outer Rim Territories', x:845.875,y:1465.5, pop:1943880000, loyalty:57, suspicion:1, desc:'Airam Sector. Squibs population. Monarchy. Wealth: Medium.' },
  { id:'p145', name:'Skye', type:'Outer Rim Territories', x:375.4737008100567,y:278.6000717874997, pop:6232766800, loyalty:48, suspicion:1, desc:'Varada Sector. S\'kytri population. Oligarchy. Wealth: Very High.' },
  { id:'p146', name:'Sluis Van', type:'Outer Rim Territories', x:951.0586206959064,y:365.57420587344507, pop:15487000000, loyalty:48, suspicion:1, desc:'Sluis Sector. Sluissi population. Oligarchy. Wealth: Medium.' },
  { id:'p147', name:'Socorro', type:'Outer Rim Territories', x:1373.0,y:1373.0, pop:844670300, loyalty:51, suspicion:1, desc:'Kibilini Sector. Human population. Tribal. Wealth: High.' },
  { id:'p148', name:'Sullust', type:'Outer Rim Territories', x:943.9875528840408,y:521.1376977344855, pop:21680990000, loyalty:48, suspicion:1, desc:'Brema Sector. Sullustan population. Corporate. Wealth: Medium.' },
  { id:'p149', name:'Taanab', type:'Inner Rim', x:1181.75,y:1579.25, pop:1687947500, loyalty:47, suspicion:0, desc:'Zeemacht Cluster. Human population. Corporate. Wealth: High.' },
  { id:'p150', name:'Takodana', type:'Mid Rim', x:538.461813873556,y:704.8086841476913, pop:719478900, loyalty:56, suspicion:0, desc:'Tashtor Sector. Various population. Tribal. Wealth: Medium.' },
  { id:'p151', name:'Tallaan', type:'Colonies', x:1269.6102256204463,y:2139.705119870493, pop:67400844000, loyalty:52, suspicion:0, desc:'Tapani Sector. Various population. Trade Comission. Wealth: High.' },
  { id:'p152', name:'Taris', type:'Outer Rim Territories', x:1080.0605795992583,y:1787.0991648984868, pop:1476890000, loyalty:50, suspicion:1, desc:'Ojoster Sector. Various population. Republic. Wealth: Medium.' },
  { id:'p153', name:'Tatooine', type:'Outer Rim Territories', x:1512.6666870117,y:648.83332824707, pop:923753984, loyalty:41, suspicion:1, desc:'Arkanis Sector. Various population. Tribal. Wealth: Medium.' },
  { id:'p154', name:'Telos IV', type:'Outer Rim Territories', x:1357.6450198781713,y:2071.1157620953977, pop:794328000, loyalty:45, suspicion:1, desc:'Kwymar Sector. Various population. Republic. Wealth: Medium.' },
  { id:'p155', name:'Tepasi', type:'Core Worlds', x:868.1503506017837,y:1470.4285514774256, pop:15489300000, loyalty:42, suspicion:0, desc:'Alderaan Sector. Humans population. Oligarchy. Wealth: Very High.' },
  { id:'p156', name:'Terminus', type:'Outer Rim Territories', x:676.75,y:150.0, pop:500000, loyalty:49, suspicion:1, desc:'Kallea Sector. Humans population. Corporate. Wealth: Poor.' },
  { id:'p157', name:'Teyr', type:'Colonies', x:429.21381618023435,y:1765.645632622809, pop:1389400000, loyalty:48, suspicion:0, desc:'Teyr Sector. Humans population. Democracy. Wealth: Medium.' },
  { id:'p158', name:'Thyferra', type:'Inner Rim', x:841.0,y:841.0, pop:5597265000, loyalty:43, suspicion:0, desc:'Jaso Sector. Vratix population. Democracy. Wealth: Luxury.' },
  { id:'p159', name:'Tibrin', type:'Mid Rim', x:858.4276323604687,y:498.510280736516, pop:372655900, loyalty:51, suspicion:0, desc:'Hadar Sector. Ishi Tib population. Dictatorship. Wealth: Medium.' },
  { id:'p160', name:'Tion Hegemony', type:'Outer Rim Territories', x:1721.164139054503,y:1424.8986346261502, pop:59456750000, loyalty:50, suspicion:1, desc:'Tion Hegemony. Various population. Oligarchy. Wealth: Medium.' },
  { id:'p161', name:'Tirahnn', type:'Inner Rim', x:1063.375,y:1590.875, pop:9233904000, loyalty:50, suspicion:0, desc:'Zeemacht Cluster. Humans population. Oligarchy. Wealth: Very High.' },
  { id:'p162', name:'Toydaria', type:'Mid Rim', x:1553.5,y:1244.0, pop:292466700, loyalty:55, suspicion:0, desc:'Hutt Space. Toydarian population. Monarchy. Wealth: High.' },
  { id:'p163', name:'Trandosha', type:'Mid Rim', x:1383.2776406961834,y:1405.9050576941531, pop:142873000, loyalty:56, suspicion:0, desc:'Mytaranor Sector. Trandoshan population. Tribal. Wealth: Low.' },
  { id:'p164', name:'Umbara', type:'Expansion Region', x:1247.6899154037,y:1419.8704166226, pop:1783465000, loyalty:57, suspicion:0, desc:'Ghost Nebula. Umbaran population. Oligarchy. Wealth: Low.' },
  { id:'p165', name:'Vandelhelm', type:'Expansion Region', x:900.146932450475,y:755.8971490884193, pop:258972000, loyalty:50, suspicion:0, desc:'Epsi Collective. Humans population. Monarchy. Wealth: Very High.' },
  { id:'p166', name:'Woostri', type:'Expansion Region', x:1018.3221532562767,y:1134.6412187614637, pop:18000000000, loyalty:55, suspicion:0, desc:'Woostri Sector. Woodsoid population. Republic. Wealth: Medium.' },
  { id:'p167', name:'Yaga Minor', type:'Outer Rim Territories', x:648.5875091538695,y:2013.578884036422, pop:4127900000, loyalty:50, suspicion:1, desc:'Prefsbelt Sector. Yagai population. Oligarchy. Wealth: Medium.' },
  { id:'p168', name:'Zeltros', type:'Inner Rim', x:1180.625,y:1366.75, pop:5315035245, loyalty:48, suspicion:0, desc:'Airon Sector. Zeltron population. Monarchy. Wealth: High.' },
  { id:'p169', name:'Zygerria', type:'Outer Rim Territories', x:1596.0,y:1596.0, pop:879490000, loyalty:52, suspicion:1, desc:'Chorlian Sector. Zygerrians population. Monarchy. Wealth: Medium.' },
];

const LANES = [
  ['p01','p113'],['p01','p30'],['p01','p53'],['p01','p68'],['p02','p11'],['p02','p119'],
  ['p02','p55'],['p02','p70'],['p03','p08'],['p03','p116'],['p03','p49'],['p03','p56'],
  ['p03','p88'],['p03','p90'],['p04','p110'],['p04','p20'],['p04','p50'],['p05','p102'],
  ['p05','p12'],['p05','p150'],['p05','p27'],['p05','p48'],['p05','p98'],['p06','p127'],
  ['p06','p57'],['p06','p71'],['p07','p106'],['p07','p147'],['p07','p159'],['p07','p17'],
  ['p07','p33'],['p07','p60'],['p08','p10'],['p08','p116'],['p08','p88'],['p09','p122'],
  ['p09','p54'],['p09','p91'],['p10','p116'],['p10','p20'],['p100','p168'],['p100','p29'],
  ['p100','p66'],['p101','p106'],['p101','p147'],['p101','p56'],['p101','p88'],['p101','p90'],
  ['p102','p138'],['p102','p48'],['p102','p99'],['p103','p165'],['p103','p17'],['p103','p33'],
  ['p104','p166'],['p104','p32'],['p104','p35'],['p105','p108'],['p105','p12'],['p105','p144'],
  ['p105','p146'],['p105','p52'],['p105','p99'],['p106','p109'],['p106','p147'],['p106','p60'],
  ['p107','p139'],['p107','p45'],['p107','p66'],['p108','p111'],['p108','p146'],['p108','p18'],
  ['p108','p58'],['p109','p112'],['p109','p152'],['p109','p154'],['p109','p19'],['p109','p63'],
  ['p11','p118'],['p11','p21'],['p11','p69'],['p110','p20'],['p110','p31'],['p110','p89'],
  ['p111','p117'],['p111','p14'],['p111','p148'],['p111','p61'],['p112','p123'],['p112','p154'],
  ['p112','p24'],['p112','p63'],['p113','p141'],['p113','p53'],['p114','p166'],['p114','p25'],
  ['p114','p35'],['p115','p37'],['p115','p42'],['p115','p47'],['p115','p77'],['p116','p145'],
  ['p116','p46'],['p116','p65'],['p117','p130'],['p117','p14'],['p117','p153'],['p117','p23'],
  ['p117','p61'],['p118','p21'],['p118','p32'],['p118','p70'],['p119','p143'],['p119','p55'],
  ['p119','p59'],['p119','p70'],['p12','p18'],['p12','p52'],['p12','p76'],['p120','p126'],
  ['p120','p163'],['p120','p40'],['p121','p20'],['p121','p50'],['p121','p65'],['p122','p18'],
  ['p122','p54'],['p122','p58'],['p122','p76'],['p123','p132'],['p123','p160'],['p123','p67'],
  ['p123','p74'],['p124','p22'],['p124','p24'],['p124','p80'],['p124','p82'],['p125','p128'],
  ['p125','p30'],['p125','p59'],['p125','p95'],['p126','p15'],['p126','p40'],['p126','p41'],
  ['p127','p155'],['p127','p57'],['p127','p71'],['p128','p13'],['p128','p62'],['p128','p73'],
  ['p129','p29'],['p129','p36'],['p129','p66'],['p129','p81'],['p13','p62'],['p13','p73'],
  ['p130','p133'],['p130','p156'],['p130','p64'],['p130','p92'],['p131','p142'],['p131','p26'],
  ['p131','p38'],['p131','p84'],['p132','p134'],['p132','p169'],['p132','p28'],['p132','p47'],
  ['p133','p135'],['p133','p167'],['p133','p34'],['p133','p72'],['p134','p138'],['p134','p37'],
  ['p134','p39'],['p134','p85'],['p135','p140'],['p135','p38'],['p135','p75'],['p135','p78'],
  ['p136','p31'],['p136','p43'],['p136','p68'],['p136','p86'],['p137','p44'],['p137','p70'],
  ['p137','p97'],['p138','p144'],['p138','p48'],['p138','p99'],['p139','p40'],['p139','p45'],
  ['p139','p71'],['p14','p148'],['p14','p61'],['p140','p145'],['p140','p46'],['p140','p65'],
  ['p140','p78'],['p141','p50'],['p141','p53'],['p141','p73'],['p142','p26'],['p142','p51'],
  ['p142','p96'],['p143','p157'],['p143','p55'],['p143','p69'],['p143','p81'],['p144','p146'],
  ['p144','p52'],['p144','p99'],['p145','p147'],['p145','p49'],['p145','p90'],['p146','p148'],
  ['p146','p52'],['p147','p152'],['p148','p153'],['p148','p61'],['p149','p21'],['p149','p69'],
  ['p149','p76'],['p15','p158'],['p15','p41'],['p15','p79'],['p150','p164'],['p150','p27'],
  ['p150','p87'],['p151','p16'],['p151','p50'],['p151','p51'],['p152','p154'],['p152','p19'],
  ['p152','p60'],['p153','p156'],['p153','p25'],['p153','p92'],['p154','p160'],['p154','p63'],
  ['p155','p57'],['p155','p79'],['p155','p86'],['p156','p167'],['p156','p64'],['p156','p92'],
  ['p157','p29'],['p157','p69'],['p157','p83'],['p158','p41'],['p158','p79'],['p159','p165'],
  ['p159','p33'],['p159','p88'],['p16','p161'],['p16','p51'],['p16','p94'],['p160','p169'],
  ['p160','p67'],['p160','p74'],['p161','p51'],['p161','p94'],['p162','p166'],['p162','p23'],
  ['p162','p25'],['p162','p35'],['p163','p28'],['p163','p42'],['p163','p93'],['p164','p27'],
  ['p164','p83'],['p164','p98'],['p165','p33'],['p165','p89'],['p166','p35'],['p167','p34'],
  ['p167','p72'],['p168','p83'],['p168','p87'],['p169','p28'],['p169','p74'],['p17','p19'],
  ['p17','p33'],['p17','p60'],['p18','p23'],['p18','p58'],['p19','p24'],['p19','p63'],
  ['p19','p80'],['p21','p54'],['p22','p24'],['p22','p67'],['p22','p82'],['p22','p93'],
  ['p23','p25'],['p23','p61'],['p23','p91'],['p24','p28'],['p24','p67'],['p25','p35'],
  ['p25','p92'],['p26','p38'],['p26','p96'],['p27','p48'],['p27','p98'],['p28','p42'],
  ['p29','p83'],['p30','p95'],['p31','p89'],['p32','p44'],['p34','p72'],['p34','p75'],
  ['p34','p84'],['p36','p66'],['p36','p81'],['p37','p39'],['p37','p47'],['p37','p77'],
  ['p37','p85'],['p38','p75'],['p38','p78'],['p38','p96'],['p39','p48'],['p39','p85'],
  ['p39','p87'],['p40','p45'],['p41','p82'],['p43','p68'],['p43','p86'],['p44','p70'],
  ['p44','p97'],['p45','p71'],['p46','p49'],['p46','p65'],['p47','p77'],['p48','p99'],
  ['p49','p56'],['p49','p90'],['p50','p53'],['p52','p58'],['p52','p76'],['p53','p73'],
  ['p55','p69'],['p55','p81'],['p56','p60'],['p56','p88'],['p57','p86'],['p59','p70'],
  ['p59','p95'],['p60','p63'],['p61','p91'],['p62','p94'],['p62','p97'],['p63','p80'],
  ['p64','p72'],['p64','p92'],['p67','p74'],['p72','p75'],['p72','p84'],['p74','p77'],
  ['p74','p93'],['p75','p78'],['p77','p85'],['p78','p90'],['p85','p99'],
];

const BASE_WATCHED_LANES = [['p01', 'p02'], ['p01', 'p06'], ['p01', 'p143']];
const STARTING_PLANET = 'p153';
const PLAYER_COLORS = ['#40c880','#3a8fe8','#e8a030','#e84090','#00d4c8','#c040e0','#e84040','#e8d030','#a0d4ff','#40e8d4','#e040a0','#a080e0'];
const ALERT_LEVELS = ['DORMANT','ELEVATED','MANHUNT','PURGE','ANNIHILATION'];

const FACTION_NAME_POOL = [
  'Ember Compact','Iron Accord','Pale Meridian','Voidborn Pact',
  'Shattered Crown','Free Sector Coalition','Rift Union','Last Light Front',
  'Constellation Bloc','Deep Current Alliance',
];
const TRAITOR_FACTION_NAMES = [
  'Sector Liberation Front',"People's Compact",'Free Worlds Union',
  'Democratic Resistance Network','Open Skies Coalition',
];

function getNeighbors(id) {
  return LANES.filter(([a,b])=>a===id||b===id).map(([a,b])=>a===id?b:a);
}
function isAdjacent(a, b) {
  return LANES.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
}
function reachableIn(fromId, steps) {
  let f = new Set([fromId]);
  for (let i=0;i<steps;i++){const n=new Set(f);f.forEach(id=>getNeighbors(id).forEach(x=>n.add(x)));f=n;}
  return [...f];
}
function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}
function buildInitialPlanetState() {
  const planets = PLANETS.map(p => ({
    ...p,
    econ_output:   CONFIG.PLANET_ECON[p.id]?.output   ?? 0,
    econ_capacity: CONFIG.PLANET_ECON[p.id]?.capacity ?? 3,
    controlled_by: 'neutral',
  }));

  // 12 highest-loyalty Core/Deep Core worlds assigned to governors (3 each)
  const GOVS = ['crassus','siris','maren','vektis'];
  planets
    .filter(p => p.type === 'Core Worlds' || p.type === 'Deep Core')
    .sort((a, b) => b.loyalty - a.loyalty)
    .slice(0, 12)
    .forEach((p, i) => {
      planets.find(x => x.id === p.id).controlled_by = `empire:${GOVS[Math.floor(i / 3)]}`;
    });

  return planets;
}

function buildInitialGovernorState() {
  return {
    siris: {
      lastConfirmedPlanet: STARTING_PLANET, lastConfirmedRound: 0,
      suspectPlanets: ['p153','p148','p25','p156','p117','p92'], confidence: 'LOW',
      probableRegion: 'Outer Rim Territories',
      patrolTokens: {'p153':true,'p152':true,'p154':true}, productionPool: 6,
    },
    crassus: { sweepTargets: [], lastSweepRound: 0, productionPool: 8 },
    maren: { propagandaTargets: [], informerNetworks: ['p04','p11'], bountyActive: false, productionPool: 4 },
    vektis: { predictedPlanets: [], analysisDepth: 0, productionPool: 5 },
  };
}
function buildInitialVektisMemory() {
  return { visitedPlanets: {[STARTING_PLANET]:1}, actionTypes: [], routePatterns: [], roundsSinceConfirm: 0 };
}
function buildTraitorFaction(sessionId, homePlanet) {
  const name = TRAITOR_FACTION_NAMES[Math.floor(Math.random()*TRAITOR_FACTION_NAMES.length)];
  return { name, ideology: 'liberation_front', home_planet: homePlanet || 'p04',
    is_traitor: true, resource_pool: 8, reputation: 62 };
}

function getRecruitmentMultiplier(factionIdeology, planetType) {
  const ideo = CONFIG.FACTIONS.IDEOLOGIES[factionIdeology];
  if (!ideo) return 1;
  if (ideo.bonus_types?.includes(planetType)) return ideo.bonus_multiplier || 1.3;
  return 1;
}
function getPlayerRank(contributionPct) {
  const ranks = CONFIG.FACTIONS.RANKS;
  if (contributionPct >= ranks.commander)   return 'commander';
  if (contributionPct >= ranks.cell_leader) return 'cell_leader';
  if (contributionPct >= ranks.operative)   return 'operative';
  return 'sympathiser';
}

// ─────────────────────────────────────────────
// Sector system for criminality tracking
// ─────────────────────────────────────────────
const SECTORS = {
  'Deep Core': ['p30', 'p50', 'p74', 'p93'],
  'Core Worlds': ['p01', 'p02', 'p06', 'p13', 'p36', 'p43', 'p44', 'p45', 'p57', 'p58', 'p63', 'p70', 'p73', 'p76', 'p81', 'p84', 'p85', 'p86', 'p89', 'p90', 'p92', 'p96', 'p97', 'p99'],
  'Inner Rim': ['p20', 'p21', 'p41', 'p51', 'p52', 'p54', 'p55', 'p61', 'p71', 'p75', 'p80', 'p83', 'p94'],
  'Colonies': ['p04', 'p11', 'p15', 'p16', 'p31', 'p32', 'p40', 'p48', 'p49', 'p59', 'p60', 'p65', 'p66', 'p68', 'p72', 'p79', 'p87', 'p91'],
  'Expansion Region': ['p10', 'p56', 'p62', 'p64', 'p67', 'p78', 'p82'],
  'Mid Rim': ['p08', 'p09', 'p22', 'p26', 'p27', 'p33', 'p35', 'p42', 'p53', 'p69', 'p77', 'p88', 'p95', 'p98'],
  'Outer Rim Territories': ['p03', 'p05', 'p07', 'p12', 'p17', 'p18', 'p19', 'p23', 'p24', 'p25', 'p28', 'p29', 'p34', 'p37', 'p38', 'p39', 'p46', 'p47', 'p57', 'p58', 'p63', 'p70', 'p73', 'p76', 'p81', 'p84', 'p85', 'p86', 'p89', 'p90', 'p92', 'p96', 'p97', 'p99'],
  'Wild Space': ['p14', 'p47'],
  'Unknown Regions': ['p47', 'p74'],
};

// Map planets to their sector
const PLANET_TO_SECTOR = {};
Object.entries(SECTORS).forEach(([sector, planets]) => {
  planets.forEach(planetId => {
    PLANET_TO_SECTOR[planetId] = sector;
  });
});

// Sector adjacency graph
const SECTOR_ADJACENCY = {
  'Deep Core': ['Core Worlds', 'Inner Rim'],
  'Core Worlds': ['Deep Core', 'Inner Rim', 'Colonies', 'Mid Rim'],
  'Inner Rim': ['Deep Core', 'Core Worlds', 'Colonies', 'Mid Rim', 'Expansion Region'],
  'Colonies': ['Core Worlds', 'Inner Rim', 'Mid Rim', 'Expansion Region'],
  'Expansion Region': ['Inner Rim', 'Colonies', 'Mid Rim', 'Outer Rim Territories'],
  'Mid Rim': ['Core Worlds', 'Inner Rim', 'Colonies', 'Expansion Region', 'Outer Rim Territories'],
  'Outer Rim Territories': ['Expansion Region', 'Mid Rim', 'Wild Space', 'Unknown Regions'],
  'Wild Space': ['Outer Rim Territories'],
  'Unknown Regions': ['Outer Rim Territories'],
};

const CRIMINALITY_LEVELS = {
  0: { name: 'Civilian', label: 'CIVILIAN' },
  1: { name: 'Wanted', label: 'WANTED', detentionChance: 0.20 },
  2: { name: 'Fugitive', label: 'FUGITIVE', detentionChance: 0.40 },
  3: { name: 'Outlaw', label: 'OUTLAW', hostile: true, detentionChance: 0.60 },
  4: { name: 'Terrorist', label: 'TERRORIST', hostile: true, detentionChance: 0.80 },
};

function getPlanetSector(planetId) {
  return PLANET_TO_SECTOR[planetId] || null;
}

function getAdjacentSectors(sectorName) {
  return SECTOR_ADJACENCY[sectorName] || [];
}

module.exports = {
  PLANETS, LANES, BASE_WATCHED_LANES, STARTING_PLANET, PLAYER_COLORS,
  ALERT_LEVELS, FACTION_NAME_POOL, TRAITOR_FACTION_NAMES,
  SECTORS, PLANET_TO_SECTOR, SECTOR_ADJACENCY, CRIMINALITY_LEVELS,
  getNeighbors, isAdjacent, reachableIn, generateGameCode,
  buildInitialPlanetState, buildInitialGovernorState, buildInitialVektisMemory,
  buildTraitorFaction, getRecruitmentMultiplier, getPlayerRank,
  getPlanetSector, getAdjacentSectors,
};