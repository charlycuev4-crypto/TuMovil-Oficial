const _s = supabase.createClient(
    'https://nvumdlxervrewqiiaicl.supabase.co',
    'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE',
    { global: { headers: { 'x-app-secret': '2Awy7XGP0SBmBRprB3PBzfvz9VcbDd04' } } }
);

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
    utterance.lang = 'es-AR';
    utterance.rate = 0.95; 
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
            actualizarColorTrazado(e.target.value);
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
        if (splash) {
            splash.style.opacity = '0'; 
            setTimeout(() => {
                splash.style.visibility = 'hidden';
                splash.style.display = 'none';
            }, 500); 
        }
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

// CORRECCIÓN: Margen de tolerancia de 3 paradas para pruebas locales en el mismo lugar
function movilPuedeRecoger(movilParada, paradaPasajero, sentido) {
    const margen = 3;
    return sentido === 'IDA' ? movilParada <= (paradaPasajero + margen) : movilParada >= (paradaPasajero - margen);
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
        const btnPedir = document.getElementById('btn-pedir');
        if (btnPedir) {
            btnPedir.disabled = false;
            if (!miViajeActivo) btnPedir.innerText = "SELECCIONÁ TU DESTINO";
        }
    }
}, (err) => { 
    console.error("Error GPS:", err); 
    const btnPedir = document.getElementById('btn-pedir');
    if (btnPedir) btnPedir.innerText = "GPS NO DISPONIBLE"; 
}, { enableHighAccuracy: true, timeout: 8000 });

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
    const sentidoEl = document.getElementById('sentido-select');
    const destEl = document.getElementById('destino-select');
    const sentido = sentidoEl ? sentidoEl.value : 'IDA';
    const destIdx = destEl ? destEl.value : '';
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
    const nombreInput = document.getElementById('nombre-input');
    const destEl = document.getElementById('destino-select');
    const nom = sanitizarInput(nombreInput ? nombreInput.value : '');
    const destIdx = parseInt(destEl ? destEl.value : 0);
    
    if(!nom || nom.length < 2) { alert("Ingresá un nombre válido."); return; }
    if(!cocheSeleccionado || asientosElegidos.length === 0) { alert("Falta elegir asiento."); return; }

    const btn = document.getElementById('btn-pedir');
    if (btn) {
        btn.disabled = true; 
        btn.innerHTML = '<span class="spinner"></span>Procesando reserva...';
    }

    try {
        const { data, error } = await _s.rpc('reservar_asientos', { p_nombre: nom, p_id_movil: cocheSeleccionado, p_asientos: asientosElegidos, p_destino_idx: destIdx, p_lat: miLat, p_lon: miLon });
        if (error) throw error;
        if (data?.colision) { 
            alert("¡Esos asientos acaban de ser tomados! Elige otros."); 
            if (btn) btn.disabled = false;
            actualizarBoton();
            renderizarFlotaDisponible(); 
            return; 
        }
        if (data?.success) {
            localStorage.setItem('usuario_nombre', nom);
            miNombrePasajero = nom;
            anunciarSeguridadVideo();
            await verificarViajesActivosBaseDatos(nom);
        }
    } catch (err) { 
        alert("Error de red."); 
        if (btn) btn.disabled = false; 
        actualizarBoton(); 
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
            
            const cId = document.getElementById('info-coche-id');
            const cNom = document.getElementById('info-chofer-nombre');
            const cDest = document.getElementById('info-destino-abordo');
            const cAs = document.getElementById('info-asientos-detalles');

            if (cId) cId.textContent = primerViaje.id_movil;
            if (cNom) cNom.textContent = primerViaje.estado_movil?.chofer || 'Conductor';
            if (cDest) cDest.textContent = paradas[primerViaje.destino_idx]?.n || 'Destino';
            if (cAs) cAs.textContent = asientosElegidos.join(', ');

            actualizarColorTrazado(primerViaje.estado_movil?.sentido_flujo || 'IDA');

            if (primerViaje.estado_pasajero === 'a_bordo') {
                pasajeroABordo = true;
                const statusTxt = document.getElementById('viaje-status-texto');
                if (statusTxt) statusTxt.innerHTML = '<span>Ya estás a bordo</span>';
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
            
            const statusTxt = document.getElementById('viaje-status-texto');
            if(!puedeRecoger && !cocheYaPaso) {
                cocheYaPaso = true;
                if (statusTxt) statusTxt.innerHTML = '<span style="color:var(--danger)">EL COCHE YA PASÓ</span>';
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
                if (banner) banner.classList.add('visible');
                timerLlegada = setInterval(() => {
                    segundosRestantes--;
                    const timerEl = document.getElementById('llegada-timer');
                    if (timerEl) timerEl.textContent = segundosRestantes;
                    if(segundosRestantes <= 0) { clearInterval(timerLlegada); confirmarSubida(); }
                }, 1000);
            }
        } catch(e){}
    }, 5000);
}

async function confirmarSubida() {
    if(timerLlegada) clearInterval(timerLlegada);
    const banner = document.getElementById('banner-llegada');
    if (banner) banner.classList.remove('visible');
    try {
        await _s.rpc('confirmar_abordo', { p_nombre: miNombrePasajero });
        pasajeroABordo = true; location.reload();
    } catch(e){}
}

async function finalizarViaje() {
    if(!confirm("¿Deseas finalizar o liberar tu asiento actual?")) return;
    const btn = document.getElementById('btn-cancelar');
    if (btn) {
        btn.disabled = true; 
        btn.innerText = "FINALIZANDO...";
    }
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
    if (menuCfg) menuCfg.style.transform = 'translateY(0)';
    if (miniPanel) miniPanel.style.display = 'none';
}

function iniciarPollingEstado() {
    intervaloPolling = setInterval(async () => {
        if(!miNombrePasajero) return;
        const { data } = await _s.rpc('obtener_viaje_activo', { p_nombre: miNombrePasajero });
        if(!data || !data.viaje || data.viaje.length === 0) { limpiarEstadoViaje(); }
    }, 10000);
}

function iniciarEscuchaAnuncios() {
    _s.channel('anuncios-' + miNombrePasajero).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservas_activas', filter: 'nombre_pasajero=eq.'+miNombrePasajero }, payload => {
        if (payload.new?.anuncio_parada && !payload.new?.anuncio_visto) {
            const anuncioTexto = document.getElementById('anuncio-mensaje-texto');
            const panelAnuncio = document.getElementById('panel-anuncio-parada');
            if (anuncioTexto) anuncioTexto.innerText = payload.new.anuncio_parada;
            if (panelAnuncio) panelAnuncio.classList.add('visible');
        }
    }).subscribe();
}

async function marcarAnuncioVisto() {
    const panelAnuncio = document.getElementById('panel-anuncio-parada');
    if (panelAnuncio) panelAnuncio.classList.remove('visible');
    try { await _s.rpc('marcar_anuncio_visto', { p_nombre: miNombrePasajero }); } catch(e){}
}

async function actualizarMapaTaxis() {
    if(miViajeActivo) return;
    try {
        const sentidoEl = document.getElementById('sentido-select');
        const sentidoVal = sentidoEl ? sentidoEl.value : 'IDA';
        const { data } = await _s.rpc('obtener_taxis', { p_sentido: sentidoVal });
        if(!data) return;
        const taxis = Array.isArray(data) ? data : data.taxis || [];
        taxis.forEach(t => {
            const lat = t.latitud || t.lat; const lon = t.longitud || t.lon;
            if(markerTaxis[t.id]) markerTaxis[t.id].setLatLng([lat, lon]);
            else markerTaxis[t.id] = L.marker([lat, lon], { icon: iconT }).addTo(map);
        });
    } catch(e){}
}
setInterval(actualizarMapaTaxis, 12000); actualizarMapaTaxis();
