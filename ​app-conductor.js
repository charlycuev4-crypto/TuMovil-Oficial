const TARIFA_UNICA = 1500;
const _s = supabase.createClient('https://nvumdlxervrewqiiaicl.supabase.co', 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE');

let MI_ID_MOVIL = localStorage.getItem('driver_id_movil');
let MI_NOMBRE = localStorage.getItem('driver_nombre_completo');

const paradas = [
    { n: 'Av. Derqui y P197 (Cruce Derqui)', c: [-34.537898, -58.794848] },
    { n: 'Fray Antonio Marchena y Carlos Eberth', c: [-34.539274, -58.793441] },
    { n: 'Fray Antonio Marchena y Descartes', c: [-34.540553, -58.792168] },
    { n: 'Av. Derqui y Gral. Juan Lavalle', c: [-34.541319, -58.791487] },
    { n: 'Av. Derqui y José C. Paz', c: [-34.542679, -58.790175] },
    { n: 'Av. Derqui y Av. José Altuve', c: [-34.544123, -58.788772] },
    { n: 'Av. Derqui y Dr. Enrique Finochietto', c: [-34.545472, -58.787421] },
    { n: 'Universidad Tecnológica Robotics', c: [-34.548500, -58.784200] },
    { n: 'Parque Industrial', c: [-34.552000, -58.780800] },
    { n: 'Base Aérea (Entrada Cuartel V / José C. Paz)', c: [-34.555000, -58.778000] },
    { n: 'Av. Derqui y C. Bartolomé Hidalgo', c: [-34.557029, -58.776122] },
    { n: 'Fray Antonio Marchena y Pedro de Mendoza', c: [-34.558350, -58.774500] },
    { n: 'Fray Antonio Marchena y Marcos Paz', c: [-34.559853, -58.772330] },
    { n: 'Fray Antonio Marchena y Miguel Cané', c: [-34.561176, -58.770641] },
    { n: 'Los Aromos y Santander', c: [-34.562495, -58.772093] },
    { n: 'Los Aromos y Murillo', c: [-34.564006, -58.773679] },
    { n: 'Murillo y Moctezuma', c: [-34.565289, -58.772213] },
    { n: 'Murillo y Güiraldes', c: [-34.567268, -58.769484] },
    { n: 'Murillo y Watt', c: [-34.569090, -58.767095] },
    { n: 'A. Prado 2555', c: [-34.571016, -58.764443] },
    { n: 'Prado y Payró', c: [-34.571956, -58.763201] },
    { n: 'Prado 1744', c: [-34.577371, -58.755909] },
    { n: 'Boulevard Caveri', c: [-34.578528, -58.757064] },
    { n: 'Caveri y Azara', c: [-34.579296, -58.755864] },
    { n: 'Caveri y Vedia', c: [-34.580020, -58.755063] },
    { n: 'Caveri y Tablada', c: [-34.580901, -58.753842] },
    { n: 'Caveri y Echeverría', c: [-34.581998, -58.752441] },
    { n: 'Caveri y Gálvez', c: [-34.583319, -58.750710] },
    { n: 'Caveri (Final)', c: [-34.584740, -58.748804] },
    { n: 'Libertador y Aero', c: [-34.585554, -58.749812] },
    { n: 'Libertador 7300', c: [-34.586494, -58.750574] },
    { n: 'Libertador 7200', c: [-34.588041, -58.751542] },
    { n: 'Libertador y Maza', c: [-34.588273, -58.751338] },
    { n: 'Maza y Albatros', c: [-34.588771, -58.750804] },
    { n: 'Maternidad', c: [-34.588244, -58.749877] },
    { n: 'Abasto y Roca', c: [-34.586030, -58.747278] }
];

let map, markerCoche, rutaLine, rastroPolyline;
let estaOnline = false, watchId = null, sentidoActual = 'IDA';
let velocidadActual = 0;

function crearIconoAuto(angulo, velocidad) {
    const colorVelocidad = velocidad > 50 ? '#ff0055' : velocidad > 30 ? '#ffcc00' : '#00f3ff';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="50" height="75">
        <defs>
            <linearGradient id="carBodyG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#FFFACD;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </linearGradient>
            <filter id="neonGlow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g fill="none" stroke="${colorVelocidad}" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.8">
            <ellipse cx="60" cy="90" rx="30" ry="40">
                <animate attributeName="rx" values="30;55;30" dur="2s" repeatCount="indefinite" />
                <animate attributeName="ry" values="40;70;40" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </ellipse>
        </g>
        <ellipse cx="60" cy="30" rx="20" ry="15" fill="${colorVelocidad}" opacity="0.15" filter="url(#neonGlow)"/>
        <g transform="translate(30,40)">
            <ellipse cx="30" cy="85" rx="25" ry="10" fill="#000" opacity="0.3"/>
            <path d="M5,20 L55,20 L60,80 L0,80 Z" fill="url(#carBodyG)" stroke="#000" stroke-width="1"/>
            <path d="M12,25 L48,25 L52,55 L8,55 Z" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
            <path d="M15,30 L45,30 L48,50 L12,50 Z" fill="#fff" opacity="0.1"/>
            <rect x="8" y="18" width="10" height="4" rx="2" fill="${colorVelocidad}" filter="url(#neonGlow)"/>
            <rect x="42" y="18" width="10" height="4" rx="2" fill="${colorVelocidad}" filter="url(#neonGlow)"/>
            <rect x="10" y="78" width="12" height="3" rx="1" fill="#ff3b30"/>
            <rect x="38" y="78" width="12" height="3" rx="1" fill="#ff3b30"/>
        </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

window.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { zoomControl: false, rotate: true }).setView(paradas[0].c, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { keepBuffer: 8 }).addTo(map);

    rutaLine = L.polyline(paradas.map(p => p.c), { color: '#ff0055', weight: 6, opacity: 0.65 }).addTo(map);

    paradas.forEach((p, i) => {
        L.circleMarker(p.c, { radius: 5, color: '#000', weight: 2, fillColor: '#00f3ff', fillOpacity: 0.9 })
            .addTo(map).bindTooltip((i + 1) + ". " + p.n, { permanent: false, direction: 'top' });
    });

    rastroPolyline = L.polyline([], { color: '#00f3ff', weight: 4, opacity: 0.5, dashArray: '6, 4' }).addTo(map);

    let miIcono = L.icon({ iconUrl: crearIconoAuto(0, 0), iconSize: [50, 75], iconAnchor: [25, 37], className: 'auto-radar-icon' });
    markerCoche = L.marker(paradas[0].c, { icon: miIcono, zIndexOffset: 1000 }).addTo(map);

    if (!MI_ID_MOVIL || !MI_NOMBRE) {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'flex';
    } else {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.style.display = 'none';
        iniciarJornadaBase();
    }
});

async function guardarDatosChofer() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const patente = document.getElementById('input-patente').value.trim();
    const auto = document.getElementById('input-auto').value.trim();

    if (!nombre || !patente || !auto) {
        alert('Por favor complete todos los campos.');
        return;
    }

    MI_NOMBRE = `${nombre} - ${auto} (${patente})`;
    MI_ID_MOVIL = Math.floor(Math.random() * 90000) + 1000; 

    localStorage.setItem('driver_id_movil', MI_ID_MOVIL);
    localStorage.setItem('driver_nombre_completo', MI_NOMBRE);

    try {
        await _s.from('estado_movil').upsert({
            id: MI_ID_MOVIL,
            chofer: MI_NOMBRE,
            esta_online: false,
            sentido_flujo: 'IDA'
        });
    } catch(e) { console.warn("Supabase sync:", e); }

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';

    location.reload();
}

function iniciarJornadaBase() {
    const sentidoGuardado = localStorage.getItem('driver_sentido');
    if (sentidoGuardado) {
        sentidoActual = sentidoGuardado;
        const btnSentido = document.getElementById('btn-sentido');
        if (btnSentido) btnSentido.innerText = sentidoActual;
        if (rutaLine) rutaLine.setStyle({ color: sentidoActual === 'IDA' ? '#ff0055' : '#00f3ff' });
    }

    const onlineGuardado = localStorage.getItem('driver_online');
    if (onlineGuardado === 'true') {
        const toggle = document.getElementById('online-toggle');
        if (toggle) toggle.checked = true;
        gestionarConexion();
    }

    setInterval(actualizar, 4000);
}

function abrirSheet() { document.getElementById('driver-sheet').classList.add('expanded'); }
function cerrarSheet() { document.getElementById('driver-sheet').classList.remove('expanded'); }

async function gestionarConexion() {
    const toggle = document.getElementById('online-toggle');
    const label = document.getElementById('status-label');
    estaOnline = toggle ? toggle.checked : false;
    localStorage.setItem('driver_online', estaOnline ? 'true' : 'false');

    if (estaOnline) {
        if (label) { label.innerText = "CONECTANDO..."; label.style.color = "#ffcc00"; }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude, lon = pos.coords.longitude;
            await _s.from('estado_movil').update({ 
                esta_online: true, latitud: lat, longitud: lon, 
                sentido_flujo: sentidoActual, chofer: MI_NOMBRE 
            }).eq('id', MI_ID_MOVIL);
            if (label) { label.innerText = "EN LÍNEA"; label.style.color = "#39ff14"; }
            iniciarGPS();
            cerrarSheet();
        }, () => { 
            if (toggle) toggle.checked = false; 
            if (label) { label.innerText = "ERROR GPS"; label.style.color = "#ff0055"; }
        }, { enableHighAccuracy: true });
    } else {
        if (watchId) { navigator.geolocation.clearWatch(watchId); watchId = null; }
        await _s.from('estado_movil').update({ esta_online: false }).eq('id', MI_ID_MOVIL);
        if (label) { label.innerText = "DESCONECTADO"; label.style.color = "#76889b"; }
    }
}

function iniciarGPS() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(async (p) => {
        const lat = p.coords.latitude, lon = p.coords.longitude;
        velocidadActual = Math.round((p.coords.speed || 0) * 3.6);
        const txtVel = document.getElementById('txt-velocidad');
        if (txtVel) txtVel.textContent = velocidadActual;
        
        let nuevoIcono = L.icon({ iconUrl: crearIconoAuto(0, velocidadActual), iconSize: [50, 75], iconAnchor: [25, 37], className: 'auto-radar-icon' });
        if (markerCoche) {
            markerCoche.setLatLng([lat, lon]);
            markerCoche.setIcon(nuevoIcono);
        }
        
        if (map) map.panTo([lat, lon]);

        const txtParada = document.getElementById('txt-parada');
        if (txtParada) txtParada.innerText = "En movimiento";
    }, null, { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 });
}

async function actualizar() {
    if (!MI_ID_MOVIL) return;
    try {
        const { data: reservas } = await _s.from('reservas_activas').select('*').eq('id_movil', MI_ID_MOVIL).eq('estado', 'en_curso');
        if (reservas) {
            const txtPax = document.getElementById('txt-pax');
            const txtPlata = document.getElementById('txt-plata');
            if (txtPax) txtPax.innerText = reservas.length;
            if (txtPlata) txtPlata.innerText = "$" + (reservas.length * TARIFA_UNICA);
        }
    } catch (err) { console.error("Error polling:", err); }
}

async function cambiarSentido() {
    sentidoActual = (sentidoActual === 'IDA') ? 'VUELTA' : 'IDA';
    localStorage.setItem('driver_sentido', sentidoActual);
    document.getElementById('btn-sentido').innerText = sentidoActual;
    if (estaOnline) { await _s.from('estado_movil').update({ sentido_flujo: sentidoActual }).eq('id', MI_ID_MOVIL); }
}

async function liberarAsiento(n) {
    if (confirm('¿Liberar asiento ' + n + '?')) {
        await _s.rpc('finalizar_asiento_individual', { p_id_movil: MI_ID_MOVIL, p_asiento: n });
        actualizar();
    }
}

async function finalizarJornada() {
    if (!confirm("🏁 ¿Finalizar jornada?")) return;
    if (watchId) navigator.geolocation.clearWatch(watchId);
    await _s.from('estado_movil').update({ esta_online: false }).eq('id', MI_ID_MOVIL);
    localStorage.clear();
    location.reload();
}
