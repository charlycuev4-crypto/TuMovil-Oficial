<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>TuMovil PRO - Pasajero</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        :root {
            --bg-dark: #0a0a0a;
            --panel-bg: rgba(15, 15, 15, 0.95);
            --accent: #00d2ff;
            --amarillo: #ffcc00;
            --danger: #ff3b30;
            --success: #34c759;
            --text-main: #ffffff;
            --text-muted: #888888;
            --border-glass: rgba(255, 255, 255, 0.1);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: var(--bg-dark); color: var(--text-main); height: 100vh; overflow: hidden; }

        #map { width: 100%; height: 100vh; position: absolute; top: 0; left: 0; z-index: 1; }

        /* PANEL FLOTANTE DE CONFIGURACIÓN Y RESERVA */
        .glass-panel {
            position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
            background: var(--panel-bg); backdrop-filter: blur(25px);
            border-top: 1px solid var(--border-glass); border-radius: 28px 28px 0 0;
            padding: 16px 20px env(safe-area-inset-bottom, 24px) 20px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.8); max-height: 85vh; overflow-y: auto;
            transition: transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
        }

        .header-title { font-size: 14px; font-weight: 800; color: var(--amarillo); margin-bottom: 12px; text-align: center; letter-spacing: 1px; }

        .form-group { margin-bottom: 12px; }
        .form-row { display: flex; gap: 8px; }
        
        select, input {
            width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass);
            color: #fff; padding: 12px 14px; border-radius: 14px; font-size: 14px; font-weight: 600;
            outline: none; transition: 0.2s;
        }
        select:focus, input:focus { border-color: var(--accent); }

        /* FLOTA Y ASIENTOS */
        #flota-container { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; max-height: 250px; overflow-y: auto; }
        .coche-card {
            background: rgba(255,255,255,0.03); border: 1.5px solid var(--border-glass);
            border-radius: 16px; padding: 10px 14px; transition: 0.2s;
        }
        .coche-card.seleccionado { border-color: var(--amarillo); background: rgba(255,204,0,0.05); }
        .coche-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        
        .asientos-row { display: flex; gap: 6px; }
        .asiento-box {
            flex: 1; height: 38px; border-radius: 10px; display: flex; flex-direction: column;
            align-items: center; justify-content: center; font-size: 11px; font-weight: 800; cursor: pointer;
        }
        .asiento-libre { background: rgba(0, 210, 255, 0.1); color: var(--accent); border: 1px solid rgba(0, 210, 255, 0.3); }
        .asiento-libre.seleccionado { background: var(--amarillo); color: #000; border-color: var(--amarillo); }
        .asiento-ocupado { background: rgba(255, 59, 48, 0.1); color: var(--danger); border: 1px solid rgba(255, 59, 48, 0.3); cursor: not-allowed; }

        /* BOTÓN PRINCIPAL */
        .btn-main {
            width: 100%; background: linear-gradient(135deg, var(--amarillo), #e6b800); color: #000;
            border: none; padding: 14px; border-radius: 16px; font-weight: 900; font-size: 15px;
            cursor: pointer; margin-top: 12px; box-shadow: 0 4px 20px rgba(255,204,0,0.3);
        }
        .btn-main:disabled { background: #333; color: #666; box-shadow: none; cursor: not-allowed; }

        /* MINI PANEL CUANDO EL VIAJE ESTÁ ACTIVO */
        #mini-panel-viaje { display: none; }
        body.viaje-activo #menu-configuracion { display: none; }
        body.viaje-activo #mini-panel-viaje { display: block; }

        .viaje-card-activa {
            background: rgba(20, 20, 20, 0.95); border: 1.5px solid var(--success);
            border-radius: 20px; padding: 16px; text-align: center;
        }
        .btn-cancelar {
            background: rgba(255, 59, 48, 0.1); color: var(--danger); border: 1px solid rgba(255, 59, 48, 0.3);
            padding: 10px; border-radius: 12px; font-weight: 800; font-size: 13px; width: 100%; margin-top: 12px; cursor: pointer;
        }

        /* BANNER DE LLEGADA */
        .banner-llegada {
            position: fixed; top: 20px; left: 20px; right: 20px; z-index: 2000;
            background: var(--success); color: #000; padding: 16px; border-radius: 18px;
            text-align: center; font-weight: 900; box-shadow: 0 10px 30px rgba(52,199,89,0.5);
            transform: translateY(-150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .banner-llegada.visible { transform: translateY(0); }

        /* BANNER DE ANUNCIO DE PARADA */
        .banner-anuncio {
            position: fixed; top: 20px; left: 20px; right: 20px; z-index: 2005;
            background: var(--amarillo); color: #000; padding: 16px; border-radius: 18px;
            text-align: center; font-weight: 900; box-shadow: 0 10px 30px rgba(255,204,0,0.5);
            transform: translateY(-150%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .banner-anuncio.visible { transform: translateY(0); }

        /* TOASTS Y SPINNERS */
        .toast-container { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 10001; display: flex; flex-direction: column; gap: 6px; pointer-events: none; }
        .toast { background: rgba(10,10,10,0.95); backdrop-filter: blur(10px); color: white; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid var(--border-glass); }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sin-coches { text-align: center; color: var(--text-muted); font-size: 13px; padding: 15px; }
    </style>
</head>
<body>

    <div class="banner-llegada" id="banner-llegada">
        <h2>🚗 ¡TU COCHE HA LLEGADO!</h2>
        <p>Sube en los próximos <span id="llegada-timer">30</span> segundos</p>
        <button onclick="confirmarSubida()" style="background:#000; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-weight:800; margin-top:8px; cursor:pointer;">CONFIRMAR SUBIDA</button>
    </div>

    <div class="banner-anuncio" id="panel-anuncio-parada">
        <h2>📢 AVISO DEL CHOFER</h2>
        <p id="anuncio-mensaje-texto" style="margin: 6px 0; font-size: 14px;"></p>
        <button onclick="marcarAnuncioVisto()" style="background:#000; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-weight:800; margin-top:6px; cursor:pointer;">ENTENDIDO</button>
    </div>

    <div class="toast-container" id="toast-container"></div>

    <div id="map"></div>

    <!-- PANEL INFERIOR -->
    <div class="glass-panel" id="panel-principal">
        
        <!-- CONFIGURACIÓN INICIAL DE RESERVA -->
        <div id="menu-configuracion">
            <div class="header-title">TARIFAS Y RESERVA EN TIEMPO REAL</div>
            
            <div class="form-row form-group">
                <input type="text" id="nombre-input" placeholder="Tu Nombre" autocomplete="off">
                <select id="sentido-select">
                    <option value="IDA">Hacia IDA</option>
                    <option value="VUELTA">Hacia VUELTA</option>
                </select>
            </div>

            <div class="form-group">
                <select id="destino-select">
                    <option value="" disabled selected>Seleccioná tu destino final...</option>
                </select>
            </div>

            <div id="flota-container">
                <div class="sin-coches">Seleccioná tu destino para ver coches disponibles.</div>
            </div>

            <button class="btn-main" id="btn-pedir" onclick="confirmarViajePasajero()" disabled>SELECCIONÁ TU DESTINO</button>
        </div>

        <!-- PANEL DE VIAJE ACTIVO -->
        <div id="mini-panel-viaje">
            <div class="viaje-card-activa">
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; letter-spacing: 1px;">ESTADO DE TU VIAJE</div>
                <div id="viaje-status-texto" style="margin: 8px 0; font-size: 15px; font-weight: 800;">
                    <span>Buscando coche en camino...</span>
                </div>
                <div style="background: rgba(255,255,255,0.04); padding: 10px; border-radius: 12px; margin-top: 8px; font-size: 12px; text-align: left;">
                    <div><b>Coche:</b> <span id="info-coche-id">-</span> (<span id="info-chofer-nombre">-</span>)</div>
                    <div><b>Destino:</b> <span id="info-destino-abordo">-</span></div>
                    <div><b>Asientos:</b> <span id="info-asientos-detalles">-</span></div>
                </div>
                <button class="btn-cancelar" id="btn-cancelar" onclick="finalizarViaje()">LIBERAR / CANCELAR VIAJE</button>
            </div>
        </div>

    </div>

<script>
    const _s = supabase.createClient('https://nvumdlxervrewqiiaicl.supabase.co', 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE', { global: { headers: { 'x-app-secret': '2Awy7XGP0SBmBRprB3PBzfvz9VcbDd04' } } });

    function sanitizarInput(t) { return t ? t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]/g, '').trim().substring(0, 20) : ''; }

    function mostrarToast(m, tipo) {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const t = document.createElement('div'); t.className = 'toast';
        if(tipo === 'error') t.style.borderColor = 'var(--danger)';
        if(tipo === 'success') t.style.borderColor = 'var(--success)';
        t.textContent = m; c.appendChild(t); setTimeout(() => t.remove(), 3000);
    }

    function anunciarSeguridadVideo() {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const texto = "¡Atención pasajero! Por tu seguridad y la del chofer, todo el trayecto se encuentra bajo un sistema de cámaras y monitoreo en tiempo real. Buen viaje.";
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-AR'; utterance.rate = 0.95; 
        window.speechSynthesis.speak(utterance);
    }

    const paradas = [
        {n:'Av. Derqui y P197 (Cruce Derqui)', c:[-34.537898, -58.794848]},
        {n:'Fray Antonio Marchena y Carlos Eberth', c:[-34.539274, -58.793441]},
        {n:'Fray Antonio Marchena y Descartes', c:[-34.540553, -58.792168]},
        {n:'Av. Derqui y Gral. Juan Lavalle', c:[-34.541319, -58.791487]},
        {n:'Av. Derqui y José C. Paz', c:[-34.542679, -58.790175]},
        {n:'Av. Derqui y Av. José Altuve', c:[-34.544123, -58.788772]},
        {n:'Av. Derqui y Dr. Enrique Finochietto', c:[-34.545472, -58.787421]},
        {n:'Universidad Tecnológica Robotics', c:[-34.548500, -58.784200]},
        {n:'Parque Industrial', c:[-34.552000, -58.780800]},
        {n:'Base Aérea (Entrada Cuartel V / José C. Paz)', c:[-34.555000, -58.778000]},
        {n:'Av. Derqui y C. Bartolomé Hidalgo', c:[-34.557029, -58.776122]},
        {n:'Fray Antonio Marchena y Pedro de Mendoza', c:[-34.558350, -58.774500]},
        {n:'Fray Antonio Marchena y Marcos Paz', c:[-34.559853, -58.772330]},
        {n:'Fray Antonio Marchena y Miguel Cané', c:[-34.561176, -58.770641]},
        {n:'Los Aromos y Santander', c:[-34.562495, -58.772093]},
        {n:'Los Aromos y Murillo', c:[-34.564006, -58.773679]},
        {n:'Murillo y Moctezuma', c:[-34.565289, -58.772213]},
        {n:'Murillo y Güiraldes', c:[-34.567268, -58.769484]},
        {n:'Murillo y Watt', c:[-34.569090, -58.767095]},
        {n:'A. Prado 2555', c:[-34.571016, -58.764443]},
        {n:'Prado y Payró', c:[-34.571956, -58.763201]},
        {n:'Prado 1744', c:[-34.577371, -58.755909]},
        {n:'Boulevard Caveri', c:[-34.578528, -58.757064]},
        {n:'Caveri y Azara', c:[-34.579296, -58.755864]},
        {n:'Caveri y Vedia', c:[-34.580020, -58.755063]},
        {n:'Caveri y Tablada', c:[-34.580901, -58.753842]},
        {n:'Caveri y Echeverría', c:[-34.581998, -58.752441]},
        {n:'Caveri y Gálvez', c:[-34.583319, -58.750710]},
        {n:'Caveri (Final)', c:[-34.584740, -58.748804]},
        {n:'Libertador y Aero', c:[-34.585554, -58.749812]},
        {n:'Libertador 7300', c:[-34.586494, -58.750574]},
        {n:'Libertador 7200', c:[-34.588041, -58.751542]},
        {n:'Libertador y Maza', c:[-34.588273, -58.751338]},
        {n:'Maza y Albatros', c:[-34.588771, -58.750804]},
        {n:'Maternidad', c:[-34.588244, -58.749877]},
        {n:'Abasto y Roca', c:[-34.586030, -58.747278]}
    ];

    const map = L.map('map', { 
        zoomControl: false, 
        attributionControl: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        tap: false
    }).setView(paradas[0].c, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        updateWhenZooming: false,
        updateWhenIdle: true
    }).addTo(map);

    const puntosRuta = paradas.map(p => p.c);
    const lineaRuta = L.polyline(puntosRuta, {
        color: '#ff3b30',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    paradas.forEach(p => L.circleMarker(p.c, { 
        radius: 6, 
        color: '#000', 
        weight: 1.5, 
        fillColor: '#00d2ff', 
        fillOpacity: 1 
    }).addTo(map));

    const iconP = L.divIcon({ html: '<div style="font-size:26px; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.5));">🚶</div>', iconAnchor: [13, 26], className: 'p-mark' });
    const iconDest = L.divIcon({ html: '<div style="width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-bottom:18px solid #ffcc00; filter: drop-shadow(0 0 6px #ffcc00);"></div>', iconAnchor: [8, 9], className: 'dest-arrow' });
    const iconT = L.divIcon({ html: '<span style="font-size:22px;">🚕</span>', iconAnchor: [11, 11] });
    const iconTPasado = L.divIcon({ html: '<span style="font-size:22px; opacity:0.3; filter: grayscale(1);">🚕</span>', iconAnchor: [11, 11] });
    const iconMiCoche = L.divIcon({ html: '<div style="font-size:28px; filter: drop-shadow(0 0 10px #00d2ff); animation: pulseRing 1.5s infinite;">🚕</div>', iconAnchor: [14, 14] });

    let markerPasajero = L.marker([0,0], { icon: iconP }).addTo(map);
    let markerDestinoFlecha = L.marker([0,0], { icon: iconDest });
    let guiaDestino = L.polyline([], { color: '#ffcc00', dashArray: '6, 6', weight: 3 }).addTo(map);

    let markerTaxis = {}, markerMiCoche = null;
    let miLat = 0, miLon = 0, asientosElegidos = [], miViajeActivo = false;
    let cocheSeleccionado = null, ultimoEstadoBoton = '', gpsListo = false, datosViajeActivo = null;
    let cocheYaPaso = false, pasajeroABordo = false;
    let timerLlegada = null, segundosRestantes = 30, llegadaMostrada = false;
    let miNombrePasajero = '', intervaloPolling = null;

    const selDest = document.getElementById('destino-select');
    if (selDest) {
        paradas.forEach((p, i) => { const opt = document.createElement('option'); opt.value = i; opt.innerText = (i+1) + ". " + p.n; selDest.appendChild(opt); });
    }

    function calcularParadaMasCerca(lat, lon) {
        let minDist = Infinity, idx = -1;
        paradas.forEach((p, i) => {
            const dist = Math.sqrt(Math.pow(lat - p.c[0], 2) + Math.pow(lon - p.c[1], 2));
            if (dist < minDist) { minDist = dist; idx = i; }
        });
        return idx;
    }

    function movilPuedeRecoger(movilParada, paradaPasajero, sentido) {
        return sentido === 'IDA' ? movilParada <= paradaPasajero : movilParada >= paradaPasajero;
    }

    function actualizarColorTrazado(sentido) {
        if (sentido === 'IDA') {
            lineaRuta.setStyle({ color: '#ff3b30' });
        } else {
            lineaRuta.setStyle({ color: '#007aff' });
        }
    }

    navigator.geolocation.watchPosition(p => {
        miLat = p.coords.latitude; miLon = p.coords.longitude;
        markerPasajero.setLatLng([miLat, miLon]);
        actualizarMapaRuta();
        if (!gpsListo) {
            gpsListo = true;
            const btn = document.getElementById('btn-pedir');
            if(btn) {
                btn.disabled = false;
                if (!miViajeActivo) btn.innerText = "SELECCIONÁ TU DESTINO";
            }
        }
    }, (err) => { 
        console.error("Error GPS:", err); 
        const btn = document.getElementById('btn-pedir');
        if(btn) btn.innerText = "GPS NO DISPONIBLE"; 
    }, { enableHighAccuracy: true, timeout: 8000 });

    function actualizarMapaRuta() {
        const destEl = document.getElementById('destino-select');
        if(!destEl) return;
        const val = destEl.value;
        if (val !== "" && miLat !== 0) {
            const dest = paradas[val].c;
            guiaDestino.setLatLngs([[miLat, miLon], dest]);
            markerDestinoFlecha.setLatLng(dest).addTo(map);
            if (!miViajeActivo) map.fitBounds(L.latLngBounds([miLat, miLon], dest), { padding: [50, 50] });
        }
    }

    const destSelect = document.getElementById('destino-select');
    if(destSelect) destSelect.addEventListener('change', () => { actualizarMapaRuta(); renderizarFlotaDisponible(); });
    
    const sentidoSelect = document.getElementById('sentido-select');
    if(sentidoSelect) sentidoSelect.addEventListener('change', (e) => { 
        actualizarColorTrazado(e.target.value);
        renderizarFlotaDisponible(); 
    });

    function seleccionarAsiento(cocheId, numAsiento) {
        if (miViajeActivo) return;
        if (cocheSeleccionado && cocheSeleccionado !== cocheId) {
            asientosElegidos = [];
            document.querySelectorAll('.asiento-libre').forEach(el => el.classList.remove('seleccionado'));
            document.querySelectorAll('.coche-card').forEach(el => el.classList.remove('seleccionado'));
        }
        cocheSeleccionado = cocheId;
        const idx = asientosElegidos.indexOf(numAsiento);
        const el = document.getElementById('as-' + cocheId + '-' + numAsiento);
        
        if (idx > -1) {
            asientosElegidos.splice(idx, 1);
            if (el) el.classList.remove('seleccionado');
        } else {
            asientosElegidos.push(numAsiento);
            if (el) el.classList.add('seleccionado');
        }
        
        document.querySelectorAll('.coche-card').forEach(el => el.classList.remove('seleccionado'));
        const card = document.getElementById('coche-card-' + cocheId);
        if (card) card.classList.add('seleccionado');
        actualizarBoton();
    }

    function actualizarBoton() {
        const btn = document.getElementById('btn-pedir');
        if(!btn) return;
        let txt = '', dis = true;
        const destEl = document.getElementById('destino-select');
        if (!gpsListo) txt = "BUSCANDO GPS...";
        else if (!destEl || !destEl.value) txt = "SELECCIONÁ TU DESTINO";
        else if (asientosElegidos.length > 0) { 
            txt = `RESERVAR VIAJE (${asientosElegidos.length} LUGAR${asientosElegidos.length > 1 ? 'ES' : ''})`; 
            dis = false; 
        }
        else txt = "SELECCIONÁ UN ASIENTO LIBRE";
        
        if (txt !== ultimoEstadoBoton) { btn.innerText = txt; btn.disabled = dis; ultimoEstadoBoton = txt; }
    }

    async function renderizarFlotaDisponible() {
        if (miViajeActivo) return;
        const container = document.getElementById('flota-container');
        if(!container) return;
        const sentido = document.getElementById('sentido-select').value;
        const destIdx = document.getElementById('destino-select').value;
        if (!destIdx || !gpsListo) return;

        container.innerHTML = '<div class="sin-coches"><span class="spinner"></span>Filtrando flota...</div>';
        try {
            const { data: rpcData, error } = await _s.rpc('obtener_flota', { p_sentido: sentido, p_destino_idx: parseInt(destIdx), p_lat: miLat, p_lon: miLon });
            if (error) throw error;
            const moviles = rpcData?.moviles || [];
            const movilesValidos = moviles.map(m => ({ ...m, paradaCalculada: calcularParadaMasCerca(m.latitud, m.longitud), distancia: m.distancia || 0 }))
                                          .filter(m => movilPuedeRecoger(m.paradaCalculada, parseInt(destIdx), sentido))
                                          .sort((a,b) => a.distancia - b.distancia);

            if (movilesValidos.length === 0) { container.innerHTML = '<div class="sin-coches"><b style="color:var(--danger)">Sin unidades cerca</b>Todos ya pasaron tu parada.</div>'; return; }
            
            container.innerHTML = '';
            movilesValidos.forEach(movil => {
                const ocupados = {};
                (movil.asientos_ocupados || []).forEach(r => { ocupados[r.asiento_num] = r.nombre_pasajero; });
                const estaSeleccionado = cocheSeleccionado === movil.id;

                const card = document.createElement('div');
                card.className = 'coche-card ' + (estaSeleccionado ? 'seleccionado' : '');
                card.id = 'coche-card-' + movil.id;
                card.innerHTML = `<div class="coche-header">
                    <div><b style="color:white;">Coche ${movil.id}</b> <span style="color:#666; font-size:11px;">(${movil.chofer || 'Chofer'})</span></div>
                    <div style="color:var(--amarillo);font-size:12px;font-weight:700;">${(movil.distancia * 111).toFixed(1)} km</div>
                </div><div class="asientos-row" id="as-row-${movil.id}"></div>`;
                
                const row = card.querySelector('#as-row-' + movil.id);
                for(let num=1; num<=4; num++) {
                    const box = document.createElement('div');
                    const ocupante = ocupados[num];
                    box.id = 'as-' + movil.id + '-' + num;
                    if(ocupante) {
                        box.className = 'asiento-box asiento-ocupado';
                        box.innerHTML = `<div>${num}</div><div style="font-size:8px;">🔒</div>`;
                    } else {
                        box.className = 'asiento-box asiento-libre ' + (estaSeleccionado && asientosElegidos.includes(num) ? 'seleccionado' : '');
                        box.innerHTML = `<div>${num}</div><div style="font-size:8px;">LIBRE</div>`;
                        box.onclick = () => seleccionarAsiento(movil.id, num);
                    }
                    row.appendChild(box);
                }
                container.appendChild(card);
            });
            actualizarBoton();
        } catch (e) { container.innerHTML = '<div class="sin-coches">Error cargando coches.</div>'; }
    }

    async function confirmarViajePasajero() {
        const nom = sanitizarInput(document.getElementById('nombre-input').value);
        const destIdx = parseInt(document.getElementById('destino-select').value);
        if(!nom || nom.length < 2) { alert("Ingresá un nombre válido."); return; }
        if(!cocheSeleccionado || asientosElegidos.length === 0) { alert("Falta elegir asiento."); return; }

        const btn = document.getElementById('btn-pedir');
        if(btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Procesando reserva...'; }

        try {
            const { data, error } = await _s.rpc('reservar_asientos', { p_nombre: nom, p_id_movil: cocheSeleccionado, p_asientos: asientosElegidos, p_destino_idx: destIdx, p_lat: miLat, p_lon: miLon });
            if (error) throw error;
            if (data?.colision) { alert("¡Esos asientos acaban de ser tomados! Elige otros."); if(btn) btn.disabled=false; actualizarBoton(); renderizarFlotaDisponible(); return; }
            if (data?.success) {
                localStorage.setItem('usuario_nombre', nom);
                miNombrePasajero = nom;
                anunciarSeguridadVideo();
                await verificarViajesActivosBaseDatos(nom);
            }
        } catch (err) { alert("Error de red."); if(btn) { btn.disabled = false; actualizarBoton(); } }
    }

    window.onload = async () => {
        const guardado = localStorage.getItem('usuario_nombre');
        if (guardado) {
            const inputNom = document.getElementById('nombre-input');
            if(inputNom) inputNom.value = guardado;
            miNombrePasajero = guardado;
            await verificarViajesActivosBaseDatos(guardado);
        }
    };

    async function verificarViajesActivosBaseDatos(nombre) {
        try {
            const { data: rpcData } = await _s.rpc('obtener_viaje_activo', { p_nombre: nombre });
            const data = rpcData?.viaje || [];
            if(data.length > 0) {
                miViajeActivo = true; datosViajeActivo = data;
                const primerViaje = data[0];
                asientosElegidos = data.map(v => v.asiento_num);

                document.body.classList.add('viaje-activo');
                
                const cId = document.getElementById('info-coche-id');
                const cNom = document.getElementById('info-chofer-nombre');
                const cDest = document.getElementById('info-destino-abordo');
                const cAs = document.getElementById('info-asientos-detalles');

                if(cId) cId.textContent = primerViaje.id_movil;
                if(cNom) cNom.textContent = primerViaje.estado_movil?.chofer || 'Conductor';
                if(cDest) cDest.textContent = paradas[primerViaje.destino_idx]?.n || 'Destino';
                if(cAs) cAs.textContent = asientosElegidos.join(', ');

                actualizarColorTrazado(primerViaje.estado_movil?.sentido_flujo || 'IDA');

                if (primerViaje.estado_pasajero === 'a_bordo') {
                    pasajeroABordo = true;
                    const st = document.getElementById('viaje-status-texto');
                    if(st) st.innerHTML = '<span>Ya estás a bordo</span>';
                    iniciarEscuchaAnuncios();
                }

                setTimeout(() => {
                    map.invalidateSize();
                    actualizarMapaRuta();
                }, 400);

                if(!pasajeroABordo) { iniciarMonitoreoViajeActivo(); iniciarVerificacionLlegada(); }
                iniciarPollingEstado();
            } else { limpiarUI(); }
        } catch(e) { console.error(e); }
    }

    function iniciarMonitoreoViajeActivo() {
        const track = async () => {
            if(!miViajeActivo || pasajeroABordo) return;
            const viaje = datosViajeActivo[0];
            try {
                const { data } = await _s.rpc('verificar_posicion_coche', { p_id_movil: viaje.id_movil });
                if(!data || !data.encontrado) return;
                
                const paradaCoche = calcularParadaMasCerca(data.lat, data.lon);
                const paradaPasajero = calcularParadaMasCerca(viaje.pasajero_lat || miLat, viaje.pasajero_lon || miLon);
                const sentido = viaje.estado_movil?.sentido_flujo || 'IDA';

                const puedeRecoger = movilPuedeRecoger(paradaCoche, paradaPasajero, sentido);
                
                if(!puedeRecoger && !cocheYaPaso) {
                    cocheYaPaso = true;
                    const st = document.getElementById('viaje-status-texto');
                    if(st) st.innerHTML = '<span style="color:var(--danger)">EL COCHE YA PASÓ</span>';
                    mostrarToast("El coche ya pasó de largo tu parada.", "error");
                }
                
                if (markerMiCoche) map.removeLayer(markerMiCoche);
                markerMiCoche = L.marker([data.lat, data.lon], { icon: cocheYaPaso ? iconTPasado : iconMiCoche }).addTo(map);
                
                const bounds = L.latLngBounds([[miLat, miLon], [data.lat, data.lon]]);
                map.fitBounds(bounds, { padding: [100, 100] });

            } catch(err) { console.error(err); }
        };
        track(); setInterval(track, 8000);
    }

    function iniciarVerificacionLlegada() {
        setInterval(async () => {
            if (!miViajeActivo || pasajeroABordo || llegadaMostrada) return;
            try {
                const { data } = await _s.rpc('verificar_llegada_coche', { p_nombre: miNombrePasajero });
                if (data?.llego) {
                    llegadaMostrada = true;
                    const banner = document.getElementById('banner-llegada');
                    if(banner) banner.classList.add('visible');
                    timerLlegada = setInterval(() => {
                        segundosRestantes--;
                        const timerEl = document.getElementById('llegada-timer');
                        if(timerEl) timerEl.textContent = segundosRestantes;
                        if(segundosRestantes <= 0) { clearInterval(timerLlegada); confirmarSubida(); }
                    }, 1000);
                }
            } catch(e){}
        }, 5000);
    }

    async function confirmarSubida() {
        if(timerLlegada) clearInterval(timerLlegada);
        const banner = document.getElementById('banner-llegada');
        if(banner) banner.classList.remove('visible');
        try {
            await _s.rpc('confirmar_abordo', { p_nombre: miNombrePasajero });
            pasajeroABordo = true; location.reload();
        } catch(e){}
    }

    async function finalizarViaje() {
        if(!confirm("¿Deseas finalizar o liberar tu asiento actual?")) return;
        const btn = document.getElementById('btn-cancelar');
        if(btn) { btn.disabled = true; btn.innerText = "FINALIZANDO..."; }
        try {
            await _s.rpc('finalizar_viaje', { p_nombre: miNombrePasajero });
            limpiarEstadoViaje();
        } catch(e) { limpiarEstadoViaje(); }
    }

    function limpiarEstadoViaje() {
        localStorage.removeItem('usuario_nombre');
        location.reload();
    }

    function limpiarUI() {
        document.body.classList.remove('viaje-activo');
        const menuCfg = document.getElementById('menu-configuracion');
        const miniPanel = document.getElementById('mini-panel-viaje');
        if(menuCfg) menuCfg.style.transform = 'translateY(0)';
        if(miniPanel) miniPanel.style.display = 'none';
    }

    function iniciarPollingEstado() {
        setInterval(async () => {
            if(!miNombrePasajero) return;
            const { data } = await _s.rpc('obtener_viaje_activo', { p_nombre: miNombrePasajero });
            if(!data || !data.viaje || data.viaje.length === 0) { limpiarEstadoViaje(); }
        }, 10000);
    }

    function iniciarEscuchaAnuncios() {
        _s.channel('anuncios-' + miNombrePasajero).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas_activas', filter: 'nombre_pasajero=eq.'+miNombrePasajero }, payload => {
            if (payload.new?.anuncio_parada && !payload.new?.anuncio_visto) {
                const txt = document.getElementById('anuncio-mensaje-texto');
                const panel = document.getElementById('panel-anuncio-parada');
                if(txt) txt.innerText = payload.new.anuncio_parada;
                if(panel) panel.classList.add('visible');
            }
        }).subscribe();
    }

    async function marcarAnuncioVisto() {
        const panel = document.getElementById('panel-anuncio-parada');
        if(panel) panel.classList.remove('visible');
        try { await _s.rpc('marcar_anuncio_visto', { p_nombre: miNombrePasajero }); } catch(e){}
    }

    async function actualizarMapaTaxis() {
        if(miViajeActivo) return;
        try {
            const sentidoEl = document.getElementById('sentido-select');
            const { data } = await _s.rpc('obtener_taxis', { p_sentido: sentidoEl ? sentidoEl.value : 'IDA' });
            if(!data) return;
            const taxis = Array.isArray(data) ? data : data.taxis || [];
            taxis.forEach(t => {
                const lat = t.latitud || t.lat; const lon = t.longitud || t.lon;
                if(markerTaxis[t.id]) markerTaxis[t.id].setLatLng([lat, lon]);
                else markerTaxis[t.id] = L.marker([lat, lon], { icon: iconT }).addTo(map); // <--- CORREGIDO AQUÍ (map en vez de mapa)
            });
        } catch(e){}
    }
    setInterval(actualizarMapaTaxis, 12000); actualizarMapaTaxis();
</script>
</body>
</html>
