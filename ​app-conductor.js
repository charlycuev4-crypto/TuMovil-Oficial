const TARIFA_UNICA = 1500; // TARIFA PLANA UNIFICADA $1500

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

const MI_ID_MOVIL = 1;
const MI_NOMBRE = "Carlos - Ford Fiesta JCP 478";
const _s = supabase.createClient('https://nvumdlxervrewqiiaicl.supabase.co', 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE');

let estaOnline = false, watchId = null, sentidoActual = 'IDA';
let ultimaVezEnviado = 0, ultimaCantidadReservas = 0;
let wakeLock = null, audioContext = null;
let paradasAnunciadas = new Map(), paradasVisitadas = new Set(), historialParadas = [];
let direccionDetectada = 'IDA', historialPosiciones = [], anguloActual = 0, velocidadActual = 0, puntosRastro = [];
const MAX_PUNTOS_RASTRO = 80;
let reservaPendiente = null;
let pollingInterval = null;

const map = L.map('map', { zoomControl: false, rotate: true }).setView(paradas[0].c, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { keepBuffer: 8 }).addTo(map);

const rutaLine = L.polyline(paradas.map(p => p.c), { color: '#ff3b30', weight: 6, opacity: 0.6 }).addTo(map);

paradas.forEach((p, i) => {
    L.circleMarker(p.c, { radius: 5, color: '#000', weight: 2, fillColor: '#00BFFF', fillOpacity: 0.9 })
        .addTo(map).bindTooltip((i + 1) + ". " + p.n, { permanent: false, direction: 'top' });
});

let rastroPolyline = L.polyline([], { color: '#00d2ff', weight: 4, opacity: 0.5, dashArray: '6, 4' }).addTo(map);

function crearIconoAuto(angulo, velocidad) {
    const colorVelocidad = velocidad > 50 ? '#ff3b30' : velocidad > 30 ? '#ffcc00' : '#00d2ff';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="44" height="58">
        <defs>
            <radialGradient id="radarG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:${colorVelocidad};stop-opacity:0.5"/>
                <stop offset="100%" style="stop-color:${colorVelocidad};stop-opacity:0"/>
            </radialGradient>
            <linearGradient id="carG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700"/><stop offset="100%" style="stop-color:#E6B800"/>
            </linearGradient>
        </defs>
        <circle cx="60" cy="80" r="35" fill="url(#radarG)" opacity="0.4">
            <animate attributeName="r" values="25;45;25" dur="2s" repeatCount="indefinite"/>
        </circle>
        <g>
            <rect x="22" y="28" width="76" height="92" rx="18" fill="url(#carG)" stroke="#1a1a1a" stroke-width="2.5"/>
            <rect x="30" y="46" width="60" height="56" rx="10" fill="#fff" opacity="0.2"/>
            <polygon points="60,8 46,26 74,26" fill="${colorVelocidad}" stroke="#1a1a1a" stroke-width="1.5"/>
        </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

let miIcono = L.icon({ iconUrl: crearIconoAuto(0, 0), iconSize: [44, 58], iconAnchor: [22, 29], className: 'auto-radar-icon' });
let markerCoche = L.marker(paradas[0].c, { icon: miIcono, zIndexOffset: 1000 }).addTo(map);

function abrirSheet() {
    document.getElementById('driver-sheet').classList.add('expanded');
    document.getElementById('btn-abrir-sheet').style.display = 'none';
}
function cerrarSheet() {
    document.getElementById('driver-sheet').classList.remove('expanded');
    document.getElementById('btn-abrir-sheet').style.display = 'flex';
}

function mostrarToast(mensaje, tipo) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function activarWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            const indicator = document.getElementById('wakelock-indicator');
            if (indicator) indicator.classList.add('activo');
        }
    } catch (err) {}
}

async function liberarWakeLock() {
    if (wakeLock) { 
        await wakeLock.release(); 
        wakeLock = null; 
        const indicator = document.getElementById('wakelock-indicator');
        if (indicator) indicator.classList.remove('activo'); 
    }
}

function inicializarAudio() {
    try {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
    } catch(e) {}
}

function reproducirAlarma() {
    try {
        inicializarAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch(e) {}
}

function vibrarAlarma() { if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]); }

// 🟢 MOSTRAR EL GLOBO FLOTANTE DE ALERTA CUANDO LLEGA UN VIAJE
function mostrarAlertaReserva(reserva) {
    reservaPendiente = reserva;
    const alerta = document.getElementById('alerta-reserva');
    if (alerta) {
        document.getElementById('alerta-texto').innerHTML = `
            <b>Pasajero:</b> ${reserva.nombre_pasajero}<br>
            <b>Asientos:</b> ${reserva.asientos}<br>
            <b>Destino:</b> ${reserva.destino}
        `;
        alerta.classList.add('mostrar');
    }
    reproducirAlarma();
    vibrarAlarma();
}

function cerrarAlerta() {
    const alerta = document.getElementById('alerta-reserva');
    if (alerta) alerta.classList.remove('mostrar');
}

// 🟢 FUNCIÓN EXPLICITA: EL CHOFER CONFIRMA Y ACEPTA LA SOLICITUD
async function confirmarSolicitudConductor() {
    if (!reservaPendiente) {
        mostrarToast('No hay reserva pendiente', 'warning');
        cerrarAlerta();
        return;
    }

    try {
        const { error } = await _s
            .from('reservas_activas')
            .update({ estado: 'atendido' })
            .eq('id', reservaPendiente.id);

        if (error) throw error;

        mostrarToast('¡Solicitud aceptada con éxito!', 'success');
        cerrarAlerta();
        reservaPendiente = null;
        actualizar();
    } catch (e) {
        mostrarToast('Error al confirmar la solicitud', 'error');
    }
}

async function rechazarSolicitud() {
    if (!reservaPendiente) { cerrarAlerta(); return; }
    try {
        await _s.from('reservas_activas').update({ estado: 'rechazado' }).eq('id', reservaPendiente.id);
    } catch (e) {}
    reservaPendiente = null;
    cerrarAlerta();
}

function calcularAnguloDireccion(lat1, lon1, lat2, lon2) {
    const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function suavizarRotacion(anguloNuevo, anguloActual, factor) {
    let diff = anguloNuevo - anguloActual;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return (anguloActual + diff * factor + 360) % 360;
}

function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function calcularCercana(lat, lon) {
    let min = Infinity, idx = -1, nombre = "";
    paradas.forEach((p, i) => {
        let d = Math.sqrt(Math.pow(p.c[0]-lat,2) + Math.pow(p.c[1]-lon,2));
        if(d < min) { min = d; idx = i; nombre = p.n; }
    });
    return { nombre, idx };
}

async function gestionarConexion() {
    const toggle = document.getElementById('online-toggle');
    const label = document.getElementById('status-label');
    estaOnline = toggle.checked;
    localStorage.setItem('driver_online', estaOnline ? 'true' : 'false');

    if (estaOnline) {
        label.innerText = "CONECTANDO...";
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude, lon = pos.coords.longitude;
            const datos = { esta_online: true, latitud: lat, longitud: lon, sentido_flujo: sentidoActual, disponible_desde: calcularCercana(lat, lon).idx, ultima_actualizacion: new Date().toISOString(), chofer: MI_NOMBRE };
            await _s.from('estado_movil').update(datos).eq('id', MI_ID_MOVIL);
            label.innerText = "EN LÍNEA"; label.style.color = "#34c759";
            activarWakeLock(); 
            iniciarGPS();
            iniciarPolling();
        }, () => { toggle.checked = false; label.innerText = "ERROR GPS"; }, { enableHighAccuracy: true });
    } else {
        detenerSistema();
        label.innerText = "DESCONECTADO"; label.style.color = "#aaa";
    }
}

function detenerSistema() {
    if (watchId) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
    _s.from('estado_movil').update({ esta_online: false }).eq('id', MI_ID_MOVIL).catch(() => {});
    liberarWakeLock();
}

function iniciarGPS() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(async (p) => {
        const lat = p.coords.latitude, lon = p.coords.longitude;
        velocidadActual = Math.round((p.coords.speed || 0) * 3.6);
        const elVel = document.getElementById('txt-velocidad');
        if (elVel) elVel.textContent = velocidadActual;
        
        if (p.coords.heading !== null && p.coords.heading !== undefined && velocidadActual > 3) {
            anguloActual = suavizarRotacion(p.coords.heading, anguloActual, 0.35);
        } else if (historialPosiciones.length > 0) {
            const ant = historialPosiciones[historialPosiciones.length - 1];
            if (calcularDistanciaMetros(ant.lat, ant.lon, lat, lon) > 1.2) {
                anguloActual = suavizarRotacion(calcularAnguloDireccion(ant.lat, ant.lon, lat, lon), anguloActual, 0.25);
            }
        }
        historialPosiciones.push({ lat, lon });
        if(historialPosiciones.length > 10) historialPosiciones.shift();
        
        markerCoche.setLatLng([lat, lon]);
        
        const mapWrapper = document.getElementById('map-wrapper');
        if (estaOnline && velocidadActual > 2) {
            if (mapWrapper) mapWrapper.style.transform = `rotate(${-anguloActual}deg)`;
            map.panTo([lat, lon], { animate: true, duration: 0.4 });
        } else {
            if (mapWrapper) mapWrapper.style.transform = `rotate(0deg)`;
            map.panTo([lat, lon]);
        }

        puntosRastro.push([lat, lon]);
        if (puntosRastro.length > MAX_PUNTOS_RASTRO) puntosRastro.shift();
        rastroPolyline.setLatLngs(puntosRastro);

        const paradaInfo = calcularCercana(lat, lon);
        const elParada = document.getElementById('txt-parada');
        if (elParada) elParada.innerText = paradaInfo.nombre;

        const ahora = Date.now();
        if (estaOnline && (ahora - ultimaVezEnviado > 3500)) {
            ultimaVezEnviado = ahora;
            await _s.from('estado_movil').update({ latitud: lat, longitud: lon, disponible_desde: paradaInfo.idx, sentido_flujo: direccionDetectada, ultima_actualizacion: new Date().toISOString() }).eq('id', MI_ID_MOVIL).catch(() => {});
        }
    }, null, { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 });
}

function iniciarPolling() {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(actualizar, 3000);
}

async function actualizar() {
    if (!estaOnline) return;
    try {
        const { data: reservas, error } = await _s.from('reservas_activas')
            .select('*')
            .eq('id_movil', MI_ID_MOVIL)
            .in('estado', ['en_curso', 'atendido', 'a_bordo']);

        if (!error && reservas) {
            const pendiente = reservas.find(r => r.estado === 'en_curso');
            if (pendiente && (!reservaPendiente || reservaPendiente.id !== pendiente.id)) {
                mostrarAlertaReserva(pendiente);
            }

            let totalPax = 0;
            reservas.forEach(r => { totalPax += (r.asientos || 1); });

            const txtPax = document.getElementById('txt-pax');
            const txtPlata = document.getElementById('txt-plata');
            if (txtPax) txtPax.innerText = totalPax;
            if (txtPlata) txtPlata.innerText = "$" + (totalPax * TARIFA_UNICA);
        }
    } catch (err) {}
}

// 🔄 RECUPERACIÓN AUTOMÁTICA EN SEGUNDO PLANO (Evita que se cuelgue al cambiar de pestaña)
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && estaOnline) {
        if (!watchId) iniciarGPS();
        if (!pollingInterval) iniciarPolling();
        await actualizar();
    }
});

async function cambiarSentido() {
    sentidoActual = (sentidoActual === 'IDA') ? 'VUELTA' : 'IDA';
    direccionDetectada = sentidoActual;
    localStorage.setItem('driver_sentido', sentidoActual);
    const btnSentido = document.getElementById('btn-sentido');
    if (btnSentido) btnSentido.innerText = sentidoActual;
    rutaLine.setStyle({ color: sentidoActual === 'IDA' ? '#ff3b30' : '#007aff' });
    if (estaOnline) { await _s.from('estado_movil').update({ sentido_flujo: sentidoActual }).eq('id', MI_ID_MOVIL); }
}

async function finalizarJornada() {
    if (!confirm("🏁 ¿Estás seguro de que deseas finalizar tu jornada laboral?")) return;
    detenerSistema();
    
    try {
        await _s.from('estado_movil').update({ esta_online: false, ultima_actualizacion: new Date().toISOString() }).eq('id', MI_ID_MOVIL);
    } catch(e) {}

    localStorage.removeItem('driver_online');
    localStorage.removeItem('driver_sentido');

    estaOnline = false;
    const toggle = document.getElementById('online-toggle');
    if (toggle) toggle.checked = false;
    const label = document.getElementById('status-label');
    if (label) { label.innerText = "DESCONECTADO"; label.style.color = "#aaa"; }
    
    const panelAnuncio = document.getElementById('panel-anuncio-parada');
    if (panelAnuncio) panelAnuncio.classList.remove('visible');
    const hud = document.getElementById('hud-paradas');
    if (hud) hud.style.display = 'none';
    const mapWrapper = document.getElementById('map-wrapper');
    if (mapWrapper) mapWrapper.style.transform = `rotate(0deg)`;
    
    mostrarToast('Jornada finalizada correctamente', 'warning');
    setTimeout(() => location.reload(), 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    const sentidoGuardado = localStorage.getItem('driver_sentido');
    if (sentidoGuardado) {
        sentidoActual = sentidoGuardado;
        direccionDetectada = sentidoGuardado;
        const btnSentido = document.getElementById('btn-sentido');
        if (btnSentido) btnSentido.innerText = sentidoActual;
        rutaLine.setStyle({ color: sentidoActual === 'IDA' ? '#ff3b30' : '#007aff' });
    }

    const onlineGuardado = localStorage.getItem('driver_online');
    if (onlineGuardado === 'true') {
        const toggle = document.getElementById('online-toggle');
        if (toggle) toggle.checked = true;
        gestionarConexion();
    }
});

setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) { splash.style.opacity = '0'; setTimeout(() => splash.style.visibility = 'hidden', 600); }
}, 1500);

setInterval(actualizar, 4000);
