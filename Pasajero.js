const SUPABASE_URL = 'https://nvumdlxervrewqiiaicl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE';
const _s = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const paradas = [
    { id: 1, n: 'Av. Derqui y P197 (Cruce Derqui)', c: [-34.537898, -58.794848] },
    { id: 2, n: 'Fray Antonio Marchena y Carlos Eberth', c: [-34.539274, -58.793441] },
    { id: 3, n: 'Fray Antonio Marchena y Descartes', c: [-34.540553, -58.792168] },
    { id: 4, n: 'Av. Derqui y Gral. Juan Lavalle', c: [-34.541319, -58.791487] },
    { id: 5, n: 'Av. Derqui y José C. Paz', c: [-34.542679, -58.790175] },
    { id: 6, n: 'Av. Derqui y Av. José Altuve', c: [-34.544123, -58.788772] },
    { id: 7, n: 'Av. Derqui y Dr. Enrique Finochietto', c: [-34.545472, -58.787421] },
    { id: 8, n: 'Universidad Tecnológica Robotics', c: [-34.548500, -58.784200] },
    { id: 9, n: 'Parque Industrial', c: [-34.552000, -58.780800] },
    { id: 10, n: 'Base Aérea (Entrada Cuartel V)', c: [-34.555000, -58.778000] },
    { id: 11, n: 'Av. Derqui y C. Bartolomé Hidalgo', c: [-34.557029, -58.776122] },
    { id: 12, n: 'Fray Antonio Marchena y Pedro de Mendoza', c: [-34.558350, -58.774500] },
    { id: 13, n: 'Fray Antonio Marchena y Marcos Paz', c: [-34.559853, -58.772330] },
    { id: 14, n: 'Fray Antonio Marchena y Miguel Cané', c: [-34.561176, -58.770641] },
    { id: 15, n: 'Los Aromos y Santander', c: [-34.562495, -58.772093] },
    { id: 16, n: 'Los Aromos y Murillo', c: [-34.564006, -58.773679] },
    { id: 17, n: 'Murillo y Moctezuma', c: [-34.565289, -58.772213] },
    { id: 18, n: 'Murillo y Güiraldes', c: [-34.567268, -58.769484] },
    { id: 19, n: 'Murillo y Watt', c: [-34.569090, -58.767095] },
    { id: 20, n: 'A. Prado 2555', c: [-34.571016, -58.764443] },
    { id: 21, n: 'Prado y Payró', c: [-34.571956, -58.763201] },
    { id: 22, n: 'Prado 1744', c: [-34.577371, -58.755909] },
    { id: 23, n: 'Boulevard Caveri', c: [-34.578528, -58.757064] },
    { id: 24, n: 'Caveri y Azara', c: [-34.579296, -58.755864] },
    { id: 25, n: 'Caveri y Vedia', c: [-34.580020, -58.755063] },
    { id: 26, n: 'Caveri y Tablada', c: [-34.580901, -58.753842] },
    { id: 27, n: 'Caveri y Echeverría', c: [-34.581998, -58.752441] },
    { id: 28, n: 'Caveri y Gálvez', c: [-34.583319, -58.750710] },
    { id: 29, n: 'Caveri (Final)', c: [-34.584740, -58.748804] },
    { id: 30, n: 'Libertador y Aero', c: [-34.585554, -58.749812] },
    { id: 31, n: 'Libertador 7300', c: [-34.586494, -58.750574] },
    { id: 32, n: 'Libertador 7200', c: [-34.588041, -58.751542] },
    { id: 33, n: 'Libertador y Maza', c: [-34.588273, -58.751338] },
    { id: 34, n: 'Maza y Albatros', c: [-34.588771, -58.750804] },
    { id: 35, n: 'Maternidad', c: [-34.588244, -58.749877] },
    { id: 36, n: 'Abasto y Roca', c: [-34.586030, -58.747278] }
];

let map, paradaSeleccionada = null, cantidadAsientos = 1, sentidoPasajero = 'IDA';
let marcadores = [];
let ubicacionSubidaTexto = "Cruce Derqui";
let paradaSubidaIndex = 0;
let miReservaID = null;
let marcadorAutoChofer = null;
let marcadorPasajero = null;
let cocheYaPaso = false;
let gpsListo = false;
let intervaloViaje = null;
let marcadorTaxisFlota = {};

window.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { zoomControl: false }).setView(paradas[0].c, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    setTimeout(() => { map.invalidateSize(); }, 300);

    const select = document.getElementById('select-paradas');
    paradas.forEach((p, idx) => {
        let opt = document.createElement('option');
        opt.value = idx;
        opt.innerText = (idx + 1) + ". " + p.n;
        select.appendChild(opt);

        let circle = L.circleMarker(p.c, {
            radius: 8, color: '#000', weight: 2,
            fillColor: '#00f3ff', fillOpacity: 0.9
        }).addTo(map);

        circle.bindPopup(`
            <div class="popup-content">
                <div class="popup-title">${p.n}</div>
                <button class="btn-popup-select" onclick="confirmarParada(${idx})">Elegir como Destino</button>
            </div>
        `);
        marcadores[idx] = circle;
    });

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            if (!marcadorPasajero) {
                map.setView([lat, lon], 16);
                setTimeout(() => { map.invalidateSize(); }, 300);
                
                marcadorPasajero = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'custom-pax-marker',
                        html: '<div style="background:#00f3ff; width:18px; height:18px; border-radius:50%; border:3px solid #000; box-shadow:0 0 12px #00f3ff;"></div>',
                        iconSize: [18, 18]
                    })
                }).addTo(map).bindPopup("Estás aquí").openPopup();
            } else {
                marcadorPasajero.setLatLng([lat, lon]);
                if (!miReservaID) {
                    map.panTo([lat, lon]);
                }
            }

            paradaSubidaIndex = calcularParadaMasCerca(lat, lon);
            ubicacionSubidaTexto = paradas[paradaSubidaIndex].n;
            gpsListo = true;
            document.getElementById('txt-subida').innerText = ubicacionSubidaTexto;
        }, () => {
            document.getElementById('txt-subida').innerText = 'GPS no disponible';
        }, { enableHighAccuracy: true });
    }

    setAsientos(1);

    const guardadaID = localStorage.getItem('mi_reserva_id');
    if (guardadaID) {
        miReservaID = guardadaID;
        document.getElementById('form-reserva-container').style.display = 'none';
        document.getElementById('panel-estado-viaje').style.display = 'block';
        document.getElementById('card-superior').style.display = 'none';
        iniciarSeguimientoViaje();
    } else {
        actualizarRadarFlota();
        setInterval(actualizarRadarFlota, 8000);
    }
});

function calcularParadaMasCerca(lat, lon) {
    let minDist = Infinity, idx = 0;
    const miPos = L.latLng(lat, lon);
    paradas.forEach((p, i) => {
        const dist = map.distance(miPos, p.c);
        if (dist < minDist) { minDist = dist; idx = i; }
    });
    return idx;
}

function movilPuedeRecoger(movilParadaIdx, pasajeroParadaIdx, sentido) {
    return sentido === 'IDA' ? movilParadaIdx <= pasajeroParadaIdx : movilParadaIdx >= pasajeroParadaIdx;
}

function cambiarSentidoPasajero() {
    sentidoPasajero = (sentidoPasajero === 'IDA') ? 'VUELTA' : 'IDA';
    document.getElementById('btn-sentido-pax').innerText = "SENTIDO: " + sentidoPasajero;
    actualizarRadarFlota();
}

function confirmarParada(idx) {
    paradaSeleccionada = paradas[idx];
    document.getElementById('select-paradas').value = idx;
    marcadores.forEach((m) => { if (m) m.setStyle({ fillColor: '#00f3ff', radius: 8 }); });
    if (marcadores[idx]) marcadores[idx].setStyle({ fillColor: '#ffcc00', radius: 12 });
    map.closePopup();
    map.panTo(paradaSeleccionada.c);
}

function seleccionarParadaDesdeLista(val) {
    if (val === "") return;
    confirmarParada(parseInt(val));
}

function setAsientos(num) {
    cantidadAsientos = num;
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById('seat-' + i);
        if (i <= num) { btn.classList.add('selected'); } else { btn.classList.remove('selected'); }
    }
}

function anunciarSeguridadVideo() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const texto = "¡Atención pasajero! Por tu seguridad y la del chofer, todo el trayecto se encuentra bajo un sistema de cámaras y monitoreo en tiempo real con GPS. Buen viaje.";
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-AR';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

async function actualizarRadarFlota() {
    if (miReservaID) return;
    try {
        const { data: flota } = await _s
            .from('estado_movil')
            .select('*')
            .eq('esta_online', true);

        if (!flota) return;

        flota.forEach(m => {
            if (!m.latitud || !m.longitud) return;
            if (marcadorTaxisFlota[m.id]) {
                marcadorTaxisFlota[m.id].setLatLng([m.latitud, m.longitud]);
            } else {
                marcadorTaxisFlota[m.id] = L.marker([m.latitud, m.longitud], {
                    icon: L.divIcon({
                        className: 'taxi-icon',
                        html: '<div style="background:#ffcc00; width:22px; height:22px; border-radius:50%; border:2px solid #000; text-align:center; font-size:11px; line-height:18px; box-shadow:0 0 10px #ffcc00;">🚕</div>',
                        iconSize: [22, 22]
                    })
                }).addTo(map).bindPopup(`Coche ${m.id} - ${m.chofer || 'Chofer'}`);
            }
        });
    } catch (e) {
        console.error("Error actualizando radar de flota:", e);
    }
}

function iniciarSeguimientoViaje() {
    if (intervaloViaje) clearInterval(intervaloViaje);
    intervaloViaje = setInterval(verificarEstadoViajeYAuto, 2000);
}

async function solicitarReserva() {
    const nombrePasajero = document.getElementById('input-nombre-pasajero').value.trim();
    if (!nombrePasajero) { alert("Por favor escribe tu Nombre y Apellido."); return; }
    if (!paradaSeleccionada) { alert("Por favor selecciona una parada de destino."); return; }

    const btnPedir = document.getElementById('btn-pedir');
    btnPedir.innerText = "BUSCANDO MÓVIL...";
    btnPedir.disabled = true;

    try {
        const idMovilFijo = 1;
        const detalleRuta = `Sube en: ${ubicacionSubidaTexto} ➔ Baja en: ${paradaSeleccionada.n}`;

        const { data: resData, error: errReserva } = await _s
            .from('reservas_activas')
            .insert({
                id_movil: idMovilFijo,
                nombre_pasajero: nombrePasajero,
                destino: detalleRuta,
                asientos: cantidadAsientos,
                sentido: sentidoPasajero,
                estado: 'en_curso'
            })
            .select()
            .single();

        if (errReserva) throw errReserva;

        miReservaID = resData.id;
        localStorage.setItem('mi_reserva_id', miReservaID);
        cocheYaPaso = false;

        anunciarSeguridadVideo();

        document.getElementById('form-reserva-container').style.display = 'none';
        document.getElementById('panel-estado-viaje').style.display = 'block';
        document.getElementById('card-superior').style.display = 'none';

        document.getElementById('txt-coche-titulo').innerText = `Coche ${idMovilFijo}`;
        document.getElementById('txt-chofer-nombre').innerText = 'Carlos - Ford Fiesta JCP 478';
        document.getElementById('txt-destino-resumen').innerText = paradaSeleccionada.n;
        document.getElementById('txt-asientos-resumen').innerText = cantidadAsientos;

        iniciarSeguimientoViaje();

    } catch (e) {
        console.error(e);
        alert("Error de conexión al reservar.");
        btnPedir.innerText = "RESERVAR VIAJE";
        btnPedir.disabled = false;
    }
}

function volverAFormulario(mensaje) {
    localStorage.removeItem('mi_reserva_id');
    miReservaID = null;
    if (intervaloViaje) { clearInterval(intervaloViaje); intervaloViaje = null; }
    document.getElementById('panel-estado-viaje').style.display = 'none';
    document.getElementById('form-reserva-container').style.display = 'block';
    document.getElementById('card-superior').style.display = 'block';
    document.getElementById('btn-pedir').innerText = "RESERVAR VIAJE";
    document.getElementById('btn-pedir').disabled = false;
    if (mensaje) alert(mensaje);
}

async function verificarEstadoViajeYAuto() {
    if (!miReservaID) return;

    try {
        const idConsulta = isNaN(miReservaID) ? miReservaID : Number(miReservaID);

        const { data: reserva, error } = await _s
            .from('reservas_activas')
            .select('*')
            .eq('id', idConsulta)
            .maybeSingle();

        if (error || !reserva) return;

        if (reserva.estado === 'rechazado') {
            volverAFormulario("El chofer no pudo tomar tu viaje en este momento.");
            return;
        }

        if (reserva.estado === 'finalizado') {
            localStorage.removeItem('mi_reserva_id');
            miReservaID = null;
            if (intervaloViaje) { clearInterval(intervaloViaje); intervaloViaje = null; }
            alert("¡Llegaste a destino! El viaje ha finalizado.");
            location.reload();
            return;
        }

        const idMovilNum = Number(reserva.id_movil);
        const { data: movilInfo } = await _s
            .from('estado_movil')
            .select('*')
            .eq('id', idMovilNum)
            .maybeSingle();

        let nombreChoferFinal = "Carlos - Ford Fiesta JCP 478";
        if (movilInfo && movilInfo.chofer) {
            nombreChoferFinal = movilInfo.chofer;
        }

        document.getElementById('txt-chofer-nombre').innerText = nombreChoferFinal;
        document.getElementById('txt-coche-titulo').innerText = `Coche ${reserva.id_movil}`;

        const tituloBox = document.getElementById('titulo-estado-caja');
        const subBox = document.getElementById('sub-estado-caja');

        if (reserva.estado === 'atendido' || reserva.estado === 'en_camino' || reserva.estado === 'aceptado') {
            tituloBox.innerHTML = '🚗 ¡VIAJE ACEPTADO!';
            subBox.innerText = 'El chofer aceptó tu solicitud y va en camino.';
        } else if (reserva.estado === 'a_bordo') {
            tituloBox.innerHTML = '🚀 ESTÁS A BORDO';
            subBox.innerText = 'Viaje en curso hacia tu destino.';
        } else {
            tituloBox.innerHTML = '🚗 SOLICITUD ENVIADA';
            subBox.innerText = 'Esperando que el chofer acepte...';
        }

        if (movilInfo && movilInfo.latitud && movilInfo.longitud) {
            const lat = movilInfo.latitud;
            const lon = movilInfo.longitud;

            if (gpsListo) {
                const paradaCocheIdx = calcularParadaMasCerca(lat, lon);
                const puedeRecoger = movilPuedeRecoger(paradaCocheIdx, paradaSubidaIndex, reserva.sentido);

                if (!puedeRecoger && !cocheYaPaso && reserva.estado === 'en_curso') {
                    cocheYaPaso = true;
                    document.getElementById('caja-estado-contenedor').style.borderColor = 'var(--danger)';
                    document.getElementById('caja-estado-contenedor').style.background = 'rgba(255, 59, 48, 0.15)';
                    tituloBox.innerHTML = '⚠️ ¡EL COCHE YA PASÓ!';
                    subBox.innerText = 'El móvil ya pasó de largo tu parada en este sentido.';
                }
            }

            if (!marcadorAutoChofer) {
                marcadorAutoChofer = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'custom-car-marker',
                        html: '<div style="background:#ffcc00; width:24px; height:24px; border-radius:50%; border:3px solid #000; box-shadow:0 0 15px #ffcc00; text-align:center; font-size:10px; font-weight:900; line-height:18px;">🚗</div>',
                        iconSize: [24, 24]
                    })
                }).addTo(map);
            } else {
                marcadorAutoChofer.setLatLng([lat, lon]);
            }
        }
    } catch (e) {
        console.error("Error sincronizando estado:", e);
    }
}

document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && miReservaID) {
        if (!intervaloViaje) iniciarSeguimientoViaje();
        await verificarEstadoViajeYAuto();
    }
});

async function finalizarViaje() {
    if (!confirm("¿Deseas finalizar tu viaje?")) return;
    try {
        if (miReservaID) {
            await _s.from('reservas_activas').update({ estado: 'finalizado' }).eq('id', miReservaID);
        }
    } catch(e) {}
    localStorage.removeItem('mi_reserva_id');
    location.reload();
}
