<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>TuMovil - Pasajero</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #05050f; --card: rgba(15, 15, 25, 0.95); --accent: #00d2ff; --amarillo: #ffcc00; --danger: #ff3b30; --success: #34c759; }
        body { background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 100vh; overflow: hidden; color: #fff; }
        
        #map { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }

        #splash {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at center, #1a1a3e 0%, #05050f 100%);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 99999; transition: opacity 0.6s ease, visibility 0.6s;
        }
        #splash .logo-ring {
            width: 120px; height: 120px; border: 3px solid var(--accent); border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 30px rgba(0, 210, 255, 0.3); animation: pulseRing 2s infinite;
        }
        @keyframes pulseRing { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        #splash h1 { color: var(--accent); margin-top: 20px; font-size: 26px; letter-spacing: 3px; font-weight: 800; }
        #splash p { color: #666; margin-top: 6px; font-size: 13px; }

        .top-bar {
            position: absolute; top: env(safe-area-inset-top, 12px); left: 12px; right: 12px;
            z-index: 1000; background: rgba(10, 10, 15, 0.9); backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; border-radius: 20px;
            display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .tarifa-badge { color: var(--amarillo); font-weight: 900; font-size: 11px; letter-spacing: 0.5px; }

        .bottom-panel {
            position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
            background: var(--card); backdrop-filter: blur(25px);
            border-top: 1px solid rgba(255,255,255,0.12); border-radius: 28px 28px 0 0;
            padding: 16px 16px env(safe-area-inset-bottom, 20px) 16px;
            box-shadow: 0 -8px 36px rgba(0,0,0,0.8); max-height: 80vh; overflow-y: auto;
            transition: transform 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
        }

        .input-group { margin-bottom: 10px; }
        .input-group label { display: block; font-size: 9px; color: #888; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; text-transform: uppercase; }
        .input-custom, .select-custom {
            width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            padding: 12px; border-radius: 14px; color: #fff; font-size: 13px; font-weight: 600; outline: none;
        }
        .select-custom option { background: #111; color: #fff; }

        .row-selectors { display: flex; gap: 8px; margin-bottom: 10px; }
        .row-selectors > div { flex: 1; }

        .flota-container { display: flex; flex-direction: column; gap: 10px; max-height: 220px; overflow-y: auto; margin-bottom: 12px; }
        .coche-card {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px; padding: 10px; transition: 0.2s;
        }
        .coche-card.seleccionado { border-color: var(--amarillo); background: rgba(255,204,0,0.05); }
        .coche-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
        
        .asientos-row { display: flex; gap: 6px; }
        .asiento-box {
            flex: 1; height: 38px; border-radius: 10px; display: flex; flex-direction: column;
            align-items: center; justify-content: center; font-size: 11px; font-weight: 800; cursor: pointer;
        }
        .asiento-libre { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #aaa; }
        .asiento-libre.seleccionado { background: var(--amarillo); color: #000; border-color: var(--amarillo); }
        .asiento-ocupado { background: rgba(255,59,48,0.15); border: 1px solid rgba(255,59,48,0.3); color: var(--danger); cursor: not-allowed; }

        .btn-principal {
            width: 100%; background: linear-gradient(135deg, var(--amarillo) 0%, #e6b800 100%);
            color: #000; border: none; padding: 15px; border-radius: 16px; font-weight: 900;
            font-size: 14px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
            box-shadow: 0 4px 20px rgba(255,204,0,0.3); transition: transform 0.1s;
        }
        .btn-principal:active { transform: scale(0.98); }
        .btn-principal:disabled { background: #333; color: #666; box-shadow: none; cursor: not-allowed; }

        /* VISTA DE VIAJE ACTIVO */
        #mini-panel-viaje { display: none; }
        body.viaje-activo #menu-configuracion { display: none; }
        body.viaje-activo #mini-panel-viaje { display: block; }

        .viaje-activo-card {
            background: rgba(10,25,50,0.95); border: 1px solid var(--accent);
            border-radius: 20px; padding: 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .viaje-activo-titulo { color: var(--accent); font-size: 11px; font-weight: 900; letter-spacing: 2px; margin-bottom: 6px; }
        .viaje-activo-Info { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 12px; }
        .btn-cancelar-viaje {
            background: rgba(255,59,48,0.1); color: var(--danger); border: 1px solid rgba(255,59,48,0.3);
            width: 100%; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 12px; cursor: pointer; margin-top: 10px;
        }

        .banner-llegada {
            position: fixed; top: 75px; left: 16px; right: 16px; z-index: 10001;
            background: var(--amarillo); color: #000; padding: 14px; border-radius: 16px;
            text-align: center; font-weight: 900; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: none; animation: slideDown 0.3s ease;
        }
        .banner-llegada.visible { display: block; }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .toast-container { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 10002; display: flex; flex-direction: column; gap: 6px; pointer-events: none; }
        .toast { background: rgba(10,10,10,0.95); backdrop-filter: blur(10px); color: white; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); }
        .spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>

    <div id="splash">
        <div class="logo-ring"><span style="font-size: 45px;">🚕</span></div>
        <h1>TUMOVIL</h1>
        <p>Pasajero Oficial</p>
    </div>

    <div class="toast-container" id="toast-container"></div>

    <div class="banner-llegada" id="banner-llegada">
        🚗 ¡Tu coche ha llegado! Subiendo en <span id="llegada-timer">30</span>s...
        <br><button onclick="confirmarSubida()" style="margin-top:8px; background:#000; color:#fff; border:none; padding:6px 16px; border-radius:8px; font-size:11px; cursor:pointer;">YA ESTOY ADENTRO</button>
    </div>

    <div id="map"></div>

    <div class="top-bar">
        <span style="font-weight: 900; font-size: 13px; color: var(--accent);">TUMOVIL PASAJERO</span>
        <span class="tarifa-badge">TARIFA FIJA: $1500</span>
    </div>

    <div class="bottom-panel">
        <!-- PANEL DE CONFIGURACIÓN / SOLICITUD -->
        <div id="menu-configuracion">
            <div class="row-selectors">
                <div class="input-group">
                    <label>Sentido</label>
                    <select id="sentido-select" class="select-custom">
                        <option value="IDA">Hacia IDA</option>
                        <option value="VUELTA">Hacia VUELTA</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Tu Nombre</label>
                    <input type="text" id="nombre-input" class="input-custom" placeholder="Ej. Carlos" maxlength="20">
                </div>
            </div>

            <div class="input-group">
                <label>Tu Destino</label>
                <select id="destino-select" class="select-custom">
                    <option value="">Seleccioná tu parada...</option>
                </select>
            </div>

            <div class="input-group">
                <label>Unidades Disponibles</label>
                <div class="flota-container" id="flota-container">
                    <div style="text-align:center; color:#666; font-size:12px; padding:15px;">Seleccioná tu destino para ver coches</div>
                </div>
            </div>

            <button id="btn-pedir" class="btn-principal" onclick="confirmarViajePasajero()" disabled>SELECCIONÁ TU DESTINO</button>
        </div>

        <!-- PANEL DE VIAJE ACTIVO -->
        <div id="mini-panel-viaje">
            <div class="viaje-activo-card">
                <div class="viaje-activo-titulo" id="viaje-status-texto">🚗 VIAJE EN CURSO • SEGURO MONITORIZADO</div>
                <div class="viaje-activo-Info">
                    Coche <span id="info-coche-id">-</span> (<span id="info-chofer-nombre">Chofer</span>)<br>
                    <span style="font-size:12px; color:var(--amarillo);">Destino: <span id="info-destino-abordo">-</span></span><br>
                    <span style="font-size:11px; color:#aaa;">Asientos: <span id="info-asientos-detalles">-</span></span>
                </div>
                <button class="btn-cancelar-viaje" id="btn-cancelar" onclick="finalizarViaje()">CANCELAR / LIBERAR RESERVA</button>
            </div>
        </div>
    </div>

<script>
    const _s = supabase.createClient('https://nvumdlxervrewqiiaicl.supabase.co', 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE');

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

    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView(paradas[0].c, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const lineaRuta = L.polyline(paradas.map(p => p.c), { color: '#ff3b30', weight: 5, opacity: 0.8 }).addTo(map);
    paradas.forEach(p => L.circleMarker(p.c, { radius: 6, color: '#000', weight: 1.5, fillColor: '#00d2ff', fillOpacity: 1 }).addTo(map));

    const iconP = L.divIcon({ html: '<div style="font-size:26px;">🚶</div>', iconAnchor: [13, 26], className: 'p-mark' });
    const iconDest = L.divIcon({ html: '<div style="width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-bottom:18px solid #ffcc00;"></div>', iconAnchor: [8, 9] });
    const iconT = L.divIcon({ html: '<span style="font-size:22px;">🚕</span>', iconAnchor: [11, 11] });
    const iconTPasado = L.divIcon({ html: '<span style="font-size:22px; opacity:0.3; filter: grayscale(1);">🚕</span>', iconAnchor: [11, 11] });
    const iconMiCoche = L.divIcon({ html: '<div style="font-size:28px;">🚕</div>', iconAnchor: [14, 14] });

    let markerPasajero = L.marker([0,0], { icon: iconP }).addTo(map);
    let markerDestinoFlecha = L.marker([0,0], { icon: iconDest });
    let guiaDestino = L.polyline([], { color: '#ffcc00', dashArray: '6, 6', weight: 3 }).addTo(map);

    let markerTaxis = {}, markerMiCoche = null;
    let miLat = 0, miLon = 0, asientosElegidos = [], miViajeActivo = false;
    let cocheSeleccionado = null, ultimoEstadoBoton = '', gpsListo = false, datosViajeActivo = null;
    let cocheYaPaso = false, pasajeroABordo = false;
    let timerLlegada = null, segundosRestantes = 30, llegadaMostrada = false;
    let miNombrePasajero = '', intervaloPolling = null;

    document.addEventListener('DOMContentLoaded', () => {
        const selDest = document.getElementById('destino-select');
        if (selDest) {
            paradas.forEach((p, i) => { 
                const opt = document.createElement('option'); 
                opt.value = i; 
                opt.innerText = (i+1) + ". " + p.n; 
                selDest.appendChild(opt); 
            });
            selDest.addEventListener('change', () => { actualizarMapaRuta(); renderizarFlotaDisponible(); });
        }

        const sentidoSel = document.getElementById('sentido-select');
        if (sentidoSel) {
            sentidoSel.addEventListener('change', (e) => { 
                lineaRuta.setStyle({ color: e.target.value === 'IDA' ? '#ff3b30' : '#007aff' });
                renderizarFlotaDisponible(); 
            });
        }

        const guardado = localStorage.getItem('usuario_nombre');
        if (guardado) {
            const nombreInput = document.getElementById('nombre-input');
            if (nombreInput) nombreInput.value = guardado;
            miNombrePasajero = guardado;
            verificarViajesActivosBaseDatos(guardado).catch(err => console.error(err));
        }

        setTimeout(() => { 
            const splash = document.getElementById('splash');
            if (splash) { splash.style.opacity = '0'; setTimeout(() => splash.style.display = 'none', 500); }
        }, 1200);
    });

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

    navigator.geolocation.watchPosition(p => {
        miLat = p.coords.latitude; miLon = p.coords.longitude;
        markerPasajero.setLatLng([miLat, miLon]);
        actualizarMapaRuta();
        if (!gpsListo) {
            gpsListo = true;
            const btn = document.getElementById('btn-pedir');
            if (btn && !miViajeActivo) btn.innerText = "SELECCIONÁ TU DESTINO";
        }
    }, (err) => { console.error("GPS Error", err); }, { enableHighAccuracy: true });

    function actualizarMapaRuta() {
        const destEl = document.getElementById('destino-select');
        if (!destEl) return;
        const val = destEl.value;
        if (val !== "" && miLat !== 0) {
            const dest = paradas[val].c;
            guiaDestino.setLatLngs([[miLat, miLon], dest]);
            markerDestinoFlecha.setLatLng(dest).addTo(map);
            if (!miViajeActivo) map.fitBounds(L.latLngBounds([miLat, miLon], dest), { padding: [50, 50] });
        }
    }

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
        if (!btn) return;
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
        if (!container) return;
        const sentido = document.getElementById('sentido-select')?.value || 'IDA';
        const destIdx = document.getElementById('destino-select')?.value || '';
        if (!destIdx || !gpsListo) return;

        container.innerHTML = '<div style="text-align:center; color:#888; font-size:12px; padding:10px;"><span class="spinner"></span>Buscando unidades...</div>';
        try {
            const { data: rpcData, error } = await _s.rpc('obtener_flota', { p_sentido: sentido, p_destino_idx: parseInt(destIdx), p_lat: miLat, p_lon: miLon });
            if (error) throw error;
            const moviles = (rpcData?.moviles || []).map(m => ({ ...m, paradaCalculada: calcularParadaMasCerca(m.latitud, m.longitud), distancia: m.distancia || 0 }))
                                                  .filter(m => movilPuedeRecoger(m.paradaCalculada, parseInt(destIdx), sentido))
                                                  .sort((a,b) => a.distancia - b.distancia);

            if (moviles.length === 0) { container.innerHTML = '<div style="text-align:center; color:var(--danger); font-size:12px; padding:10px;">Sin unidades cerca en este sentido.</div>'; return; }
            
            container.innerHTML = '';
            moviles.forEach(movil => {
                const ocupados = {};
                (movil.asientos_ocupados || []).forEach(r => { ocupados[r.asiento_num] = r.nombre_pasajero; });
                const estaSeleccionado = cocheSeleccionado === movil.id;

                const card = document.createElement('div');
                card.className = 'coche-card ' + (estaSeleccionado ? 'seleccionado' : '');
                card.id = 'coche-card-' + movil.id;
                card.innerHTML = `<div class="coche-header">
                    <div><b style="color:white;">Coche ${movil.id}</b> <span style="color:#888; font-size:11px;">(${movil.chofer || 'Chofer'})</span></div>
                    <div style="color:var(--amarillo); font-size:11px; font-weight:700;">${(movil.distancia * 111).toFixed(1)} km</div>
                </div><div class="asientos-row" id="as-row-${movil.id}"></div>`;
                
                const row = card.querySelector('#as-row-' + movil.id);
                for(let num=1; num<=4; num++) {
                    const box = document.createElement('div');
                    const ocupante = ocupados[num];
                    box.id = 'as-' + movil.id + '-' + num;
                    if(ocupante) {
                        box.className = 'asiento-box asiento-ocupado';
                        box.innerHTML = `<div>${num}</div><div style="font-size:7px;">🔒</div>`;
                    } else {
                        box.className = 'asiento-box asiento-libre ' + (estaSeleccionado && asientosElegidos.includes(num) ? 'seleccionado' : '');
                        box.innerHTML = `<div>${num}</div><div style="font-size:7px;">LIBRE</div>`;
                        box.onclick = () => seleccionarAsiento(movil.id, num);
                    }
                    row.appendChild(box);
                }
                container.appendChild(card);
            });
            actualizarBoton();
        } catch (e) { container.innerHTML = '<div style="color:var(--danger); text-align:center; font-size:12px;">Error cargando flota.</div>'; }
    }

    // FUNCIÓN BLINDADA CORREGIDA PARA EVITAR EL BLOQUEO EN "PROCESANDO RESERVA"
    async function confirmarViajePasajero() {
        const nom = sanitizarInput(document.getElementById('nombre-input')?.value || '');
        const destIdx = parseInt(document.getElementById('destino-select')?.value || 0);
        
        if(!nom || nom.length < 2) { alert("Ingresá un nombre válido."); return; }
        if(!cocheSeleccionado || asientosElegidos.length === 0) { alert("Falta elegir asiento."); return; }

        const btn = document.getElementById('btn-pedir');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Procesando reserva...'; }

        try {
            const { data, error } = await _s.rpc('reservar_asientos', { 
                p_nombre: nom, p_id_movil: cocheSeleccionado, p_asientos: asientosElegidos, 
                p_destino_idx: destIdx, p_lat: miLat, p_lon: miLon 
            });
            
            if (error) throw error;
            
            if (data && (data.colision === true || data === 'colision')) { 
                alert("¡Esos asientos acaban de ser tomados! Elige otros."); 
                if (btn) btn.disabled = false; actualizarBoton(); renderizarFlotaDisponible(); 
                return; 
            }

            // FORZAR ÉXITO Y TRANSICIÓN INMEDIATA
            localStorage.setItem('usuario_nombre', nom);
            miNombrePasajero = nom;
            anunciarSeguridadVideo();
            
            setTimeout(async () => {
                await verificarViajesActivosBaseDatos(nom);
            }, 300);

        } catch (err) { 
            console.error("Error al reservar:", err);
            alert("Error al procesar la reserva. Intenta de nuevo."); 
            if (btn) btn.disabled = false; actualizarBoton(); 
        }
    }

    async function verificarViajesActivosBaseDatos(nombre) {
        try {
            const { data: rpcData } = await _s.rpc('obtener_viaje_activo', { p_nombre: nombre });
            const data = rpcData?.viaje || [];
            if(data.length > 0) {
                miViajeActivo = true; datosViajeActivo = data;
                const primerViaje = data[0];
                asientosElegidos = data.map(v => v.asiento_num);

                document.body.classList.add('viaje-activo');
                
                document.getElementById('info-coche-id').textContent = primerViaje.id_movil;
                document.getElementById('info-chofer-nombre').textContent = primerViaje.estado_movil?.chofer || 'Conductor';
                document.getElementById('info-destino-abordo').textContent = paradas[primerViaje.destino_idx]?.n || 'Destino';
                document.getElementById('info-asientos-detalles').textContent = asientosElegidos.join(', ');

                if (primerViaje.estado_pasajero === 'a_bordo') {
                    pasajeroABordo = true;
                    document.getElementById('viaje-status-texto').innerHTML = '<span>Ya estás a bordo</span>';
                }

                setTimeout(() => { map.invalidateSize(); actualizarMapaRuta(); }, 400);

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

                if(!movilPuedeRecoger(paradaCoche, paradaPasajero, sentido) && !cocheYaPaso) {
                    cocheYaPaso = true;
                    mostrarToast("El coche ya pasó de largo tu parada.", "error");
                }
                
                if (markerMiCoche) map.removeLayer(markerMiCoche);
                markerMiCoche = L.marker([data.lat, data.lon], { icon: cocheYaPaso ? iconTPasado : iconMiCoche }).addTo(map);
                map.fitBounds(L.latLngBounds([[miLat, miLon], [data.lat, data.lon]]), { padding: [100, 100] });
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
                    document.getElementById('banner-llegada').classList.add('visible');
                    timerLlegada = setInterval(() => {
                        segundosRestantes--;
                        document.getElementById('llegada-timer').textContent = segundosRestantes;
                        if(segundosRestantes <= 0) { clearInterval(timerLlegada); confirmarSubida(); }
                    }, 1000);
                }
            } catch(e){}
        }, 5000);
    }

    async function confirmarSubida() {
        if(timerLlegada) clearInterval(timerLlegada);
        document.getElementById('banner-llegada').classList.remove('visible');
        try { await _s.rpc('confirmar_abordo', { p_nombre: miNombrePasajero }); pasajeroABordo = true; location.reload(); } catch(e){}
    }

    async function finalizarViaje() {
        if(!confirm("¿Deseas finalizar o liberar tu asiento actual?")) return;
        try { await _s.rpc('finalizar_viaje', { p_nombre: miNombrePasajero }); limpiarEstadoViaje(); } catch(e) { limpiarEstadoViaje(); }
    }

    function limpiarEstadoViaje() { localStorage.removeItem('usuario_nombre'); location.reload(); }
    function limpiarUI() { document.body.classList.remove('viaje-activo'); }

    function iniciarPollingEstado() {
        setInterval(async () => {
            if(!miNombrePasajero) return;
            const { data } = await _s.rpc('obtener_viaje_activo', { p_nombre: miNombrePasajero });
            if(!data || !data.viaje || data.viaje.length === 0) { limpiarEstadoViaje(); }
        }, 10000);
    }

    async function actualizarMapaTaxis() {
        if(miViajeActivo) return;
        try {
            const sentidoVal = document.getElementById('sentido-select')?.value || 'IDA';
            const { data } = await _s.rpc('obtener_taxis', { p_sentido: sentidoVal });
            if(!data) return;
            (Array.isArray(data) ? data : data.taxis || []).forEach(t => {
                const lat = t.latitud || t.lat; const lon = t.longitud || t.lon;
                if(markerTaxis[t.id]) markerTaxis[t.id].setLatLng([lat, lon]);
                else markerTaxis[t.id] = L.marker([lat, lon], { icon: iconT }).addTo(map);
            });
        } catch(e){}
    }
    setInterval(actualizarMapaTaxis, 12000); actualizarMapaTaxis();
</script>
</body>
</html>
