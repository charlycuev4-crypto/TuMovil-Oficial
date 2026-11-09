
    const TARIFA_UNICA = 1500;
    const _s = supabase.createClient('https://nvumdlxervrewqiiaicl.supabase.co', 'sb_publishable_oVmiLSfe_AJ5iDpeAXIukA_CLdHuwkE');

    let MI_ID_MOVIL = 1; // Cambiar según el número de unidad (1, 2, 3...)
    let MI_NOMBRE = localStorage.getItem('driver_nombre_completo') || 'Carlos Cuevas - Ford Fiesta (JCP 478)';

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

    let map, markerCoche;
    let estaOnline = false, watchId = null, sentidoActual = 'IDA';
    let velocidadActual = 0;
    let reservaPendiente = null;
    let ultimaReservaAlertaId = null;

    let asientos = {
        1: { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null },
        2: { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null },
        3: { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null },
        4: { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null }
    };

    let indiceParadaActual = 0;
    let ultimaLlegadaIdx = -1;
    let anunciosIniciados = false;
    const RADIO_LLEGADA = 45;

    function indiceSiguiente(i) {
        return sentidoActual === 'IDA' ? (i + 1) % paradas.length : (i - 1 + paradas.length) % paradas.length;
    }
    function indiceAnterior(i) {
        return sentidoActual === 'IDA' ? (i - 1 + paradas.length) % paradas.length : (i + 1) % paradas.length;
    }

    function anunciar(texto) {
        try {
            if (!window.speechSynthesis) return;
            speechSynthesis.cancel();
            const voz = new SpeechSynthesisUtterance(texto);
            voz.lang = 'es-ES';
            voz.rate = 1;
            voz.pitch = 1;
            speechSynthesis.speak(voz);
        } catch (e) {}
    }

    function procesarAnunciosParadas(lat, lon) {
        if (!paradas.length || !map) return;
        let idxCercana = 0, distMin = Infinity;
        const miPos = L.latLng(lat, lon);
        for (let i = 0; i < paradas.length; i++) {
            const d = map.distance(miPos, paradas[i].c);
            if (d < distMin) { distMin = d; idxCercana = i; }
        }

        if (!anunciosIniciados) {
            anunciosIniciados = true;
            indiceParadaActual = idxCercana;
            ultimaLlegadaIdx = idxCercana;
            const sig = indiceSiguiente(indiceParadaActual);
            anunciar('Próxima parada: ' + paradas[sig].n);
        }

        const esperada = indiceSiguiente(indiceParadaActual);
        if (idxCercana === esperada && distMin < RADIO_LLEGADA) {
            if (ultimaLlegadaIdx !== idxCercana) {
                ultimaLlegadaIdx = idxCercana;
                indiceParadaActual = idxCercana;
                anunciar('Hemos llegado a ' + paradas[idxCercana].n);
                const sig = indiceSiguiente(indiceParadaActual);
                setTimeout(() => anunciar('Próxima parada: ' + paradas[sig].n), 2600);
            }
        } else if (idxCercana !== indiceParadaActual && idxCercana !== esperada) {
            indiceParadaActual = indiceAnterior(idxCercana);
            ultimaLlegadaIdx = -1;
        }

        const sig = indiceSiguiente(indiceParadaActual);
        const dSig = map.distance(miPos, paradas[sig].c);
        const elParada = document.getElementById('txt-parada');
        if (elParada) elParada.innerText = paradas[sig].n + ' · ' + Math.round(dSig) + 'm';
    }

    function reiniciarAnuncios() {
        anunciosIniciados = false;
        ultimaLlegadaIdx = -1;
    }

    function crearIconoAuto(angulo, velocidad) {
        const colorVelocidad = velocidad > 50 ? '#ff0055' : velocidad > 30 ? '#ffcc00' : '#00f3ff';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="50" height="75">
            <ellipse cx="60" cy="30" rx="20" ry="15" fill="${colorVelocidad}" opacity="0.15"/>
            <g transform="translate(30,40)">
                <ellipse cx="30" cy="85" rx="25" ry="10" fill="#000" opacity="0.3"/>
                <path d="M5,20 L55,20 L60,80 L0,80 Z" fill="#FFD700" stroke="#000" stroke-width="1"/>
                <path d="M12,25 L48,25 L52,55 L8,55 Z" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
                <rect x="8" y="18" width="10" height="4" rx="2" fill="${colorVelocidad}"/>
                <rect x="42" y="18" width="10" height="4" rx="2" fill="${colorVelocidad}"/>
            </g>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    window.addEventListener('DOMContentLoaded', () => {
        map = L.map('map', { zoomControl: false }).setView(paradas[0].c, 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.polyline(paradas.map(p => p.c), { color: '#ff0055', weight: 6, opacity: 0.65 }).addTo(map);

        paradas.forEach((p, i) => {
            L.circleMarker(p.c, { radius: 5, color: '#000', weight: 2, fillColor: '#00f3ff', fillOpacity: 0.9 })
                .addTo(map).bindTooltip((i + 1) + ". " + p.n);
        });

        let miIcono = L.icon({ iconUrl: crearIconoAuto(0, 0), iconSize: [50, 75], iconAnchor: [25, 37] });
        markerCoche = L.marker(paradas[0].c, { icon: miIcono, zIndexOffset: 1000 }).addTo(map);

        iniciarJornadaBase();
        configurarPersistenciaSegundoPlano();
    });

    function configurarPersistenciaSegundoPlano() {
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && estaOnline) {
                if (!watchId) iniciarGPS();
                escucharReservas();
                actualizarEstadisticas();
            }
        });
    }

    function iniciarJornadaBase() {
        const sentidoGuardado = localStorage.getItem('driver_sentido');
        if (sentidoGuardado) {
            sentidoActual = sentidoGuardado;
            document.getElementById('btn-sentido').innerText = sentidoActual;
        }

        const onlineGuardado = localStorage.getItem('driver_online');
        if (onlineGuardado === 'true') {
            document.getElementById('online-toggle').checked = true;
            gestionarConexion();
        }

        setInterval(escucharReservas, 2500);
        setInterval(actualizarEstadisticas, 3500);
    }

    function abrirSheet() { document.getElementById('driver-sheet').classList.add('expanded'); }
    function cerrarSheet() { document.getElementById('driver-sheet').classList.remove('expanded'); }

    async function gestionarConexion() {
        const toggle = document.getElementById('online-toggle');
        const label = document.getElementById('status-label');
        estaOnline = toggle.checked;
        localStorage.setItem('driver_online', estaOnline ? 'true' : 'false');

        if (estaOnline) {
            label.innerText = "CONECTANDO...";
            label.style.color = "#ffcc00";

            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude, lon = pos.coords.longitude;
                
                await _s.from('estado_movil').upsert({
                    id: MI_ID_MOVIL,
                    chofer: MI_NOMBRE,
                    esta_online: true,
                    latitud: lat,
                    longitud: lon,
                    sentido_flujo: sentidoActual
                });

                label.innerText = "EN LÍNEA";
                label.style.color = "#39ff14";
                reiniciarAnuncios();
                iniciarGPS();
            }, () => {
                toggle.checked = false;
                label.innerText = "ERROR GPS";
                label.style.color = "#ff0055";
            }, { enableHighAccuracy: true });
        } else {
            if (watchId) { navigator.geolocation.clearWatch(watchId); watchId = null; }
            if (window.speechSynthesis) speechSynthesis.cancel();
            await _s.from('estado_movil').update({ esta_online: false }).eq('id', MI_ID_MOVIL);
            label.innerText = "DESCONECTADO";
            label.style.color = "#76889b";
        }
    }

    function iniciarGPS() {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        watchId = navigator.geolocation.watchPosition(async (p) => {
            const lat = p.coords.latitude, lon = p.coords.longitude;
            velocidadActual = Math.round((p.coords.speed || 0) * 3.6);
            document.getElementById('txt-velocidad').textContent = velocidadActual;

            let nuevoIcono = L.icon({ iconUrl: crearIconoAuto(0, velocidadActual), iconSize: [50, 75], iconAnchor: [25, 37] });
            if (markerCoche) {
                markerCoche.setLatLng([lat, lon]);
                markerCoche.setIcon(nuevoIcono);
            }

            if (map) map.panTo([lat, lon]);
            if (estaOnline) procesarAnunciosParadas(lat, lon);

            await _s.from('estado_movil').update({ latitud: lat, longitud: lon }).eq('id', MI_ID_MOVIL);
        }, null, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
    }

    async function escucharReservas() {
        if (!estaOnline) return;

        try {
            const { data: reservas, error } = await _s
                .from('reservas_activas')
                .select('*')
                .eq('id_movil', MI_ID_MOVIL)
                .eq('estado', 'en_curso')
                .limit(1);

            if (error) throw error;

            if (reservas && reservas.length > 0) {
                const r = reservas[0];
                if (ultimaReservaAlertaId !== r.id) {
                    ultimaReservaAlertaId = r.id;
                    reservaPendiente = r;

                    document.getElementById('alerta-texto').innerHTML = `
                        <b>Pasajero:</b> ${r.nombre_pasajero}<br>
                        <b>Ruta:</b> ${r.destino}<br>
                        <b>Asientos:</b> ${r.asientos}
                    `;

                    document.getElementById('alerta-reserva').classList.add('mostrar');
                    sonarAlarma();
                }
            }
        } catch (e) {}
    }

    function sonarAlarma() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
    }

    function cerrarAlerta() {
        document.getElementById('alerta-reserva').classList.remove('mostrar');
    }

    async function atenderSolicitud() {
        if (!reservaPendiente) return;

        try {
            const numAsientosReq = parseInt(reservaPendiente.asientos) || 1;
            let asignados = 0;

            for (let i = 1; i <= 4; i++) {
                if (!asientos[i].ocupado && asignados < numAsientosReq) {
                    asientos[i].ocupado = true;
                    asientos[i].nombre = reservaPendiente.nombre_pasajero;
                    asientos[i].destino = reservaPendiente.destino;
                    asientos[i].idReserva = reservaPendiente.id;
                    asientos[i].estado = 'atendido';
                    asignados++;
                }
            }

            await _s
                .from('reservas_activas')
                .update({
                    estado: 'atendido',
                    chofer_nombre: MI_NOMBRE.split(' - ')[0],
                    auto_modelo: MI_NOMBRE
                })
                .eq('id', reservaPendiente.id);

            actualizarPillsUI();
            cerrarAlerta();
            reservaPendiente = null;
        } catch (e) {}
    }

    async function rechazarSolicitud() {
        if (!reservaPendiente) { cerrarAlerta(); return; }
        try {
            await _s.from('reservas_activas').update({ estado: 'rechazado' }).eq('id', reservaPendiente.id);
        } catch (e) {}
        reservaPendiente = null;
        cerrarAlerta();
    }

    async function gestionarAsiento(numSeat) {
        const seat = asientos[numSeat];
        if (!seat.ocupado || !seat.idReserva) return;

        const idReservaActual = seat.idReserva;

        if (seat.estado === 'atendido' || !seat.estado) {
            for (let i = 1; i <= 4; i++) {
                if (asientos[i].idReserva === idReservaActual) {
                    asientos[i].estado = 'a_bordo';
                }
            }

            await _s.from('reservas_activas')
                .update({ estado: 'a_bordo' })
                .eq('id', idReservaActual);

            actualizarPillsUI();
        } else if (seat.estado === 'a_bordo') {
            await _s.from('reservas_activas')
                .update({ estado: 'finalizado' })
                .eq('id', idReservaActual);

            for (let i = 1; i <= 4; i++) {
                if (asientos[i].idReserva === idReservaActual) {
                    asientos[i] = { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null };
                }
            }

            actualizarPillsUI();
        }
    }

    async function actualizarEstadisticas() {
        if (!MI_ID_MOVIL) return;
        try {
            const { data: reservas } = await _s.from('reservas_activas').select('*').eq('id_movil', MI_ID_MOVIL).in('estado', ['en_curso', 'atendido', 'a_bordo']);
            if (reservas) {
                let totalPax = 0;
                reservas.forEach(r => totalPax += (r.asientos || 1));
                document.getElementById('txt-pax').innerText = totalPax;
                document.getElementById('txt-plata').innerText = "$" + (totalPax * TARIFA_UNICA);
            }
        } catch (err) {}
    }

    function actualizarPillsUI() {
        for (let i = 1; i <= 4; i++) {
            const pill = document.getElementById(`pill${i}`);
            const nombreEl = document.getElementById(`nombre-pax-${i}`);
            const destinoEl = document.getElementById(`destino-pax-${i}`);
            const seat = asientos[i];

            if (seat.ocupado) {
                if (seat.estado === 'a_bordo') {
                    pill.className = 'pill a-bordo';
                    destinoEl.innerText = '🚀 A BORDO';
                } else {
                    pill.className = 'pill active';
                    destinoEl.innerText = '🚗 EN CAMINO';
                }
                nombreEl.innerText = seat.nombre;
            } else {
                pill.className = 'pill';
                nombreEl.innerText = 'Libre';
                destinoEl.innerText = '-';
            }
        }
    }

    async function confirmarVaciar() {
        for (let i = 1; i <= 4; i++) {
            if (asientos[i].idReserva) {
                await _s.from('reservas_activas').update({ estado: 'finalizado' }).eq('id', asientos[i].idReserva);
            }
            asientos[i] = { ocupado: false, nombre: 'Libre', destino: '-', idReserva: null, estado: null };
        }
        actualizarPillsUI();
        cerrarSheet();
    }

    async function cambiarSentido() {
        sentidoActual = (sentidoActual === 'IDA') ? 'VUELTA' : 'IDA';
        localStorage.setItem('driver_sentido', sentidoActual);
        document.getElementById('btn-sentido').innerText = sentidoActual;
        reiniciarAnuncios();
        if (estaOnline) { await _s.from('estado_movil').update({ sentido_flujo: sentidoActual }).eq('id', MI_ID_MOVIL); }
    }

    async function finalizarJornada() {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (window.speechSynthesis) speechSynthesis.cancel();
        await _s.from('estado_movil').update({ esta_online: false }).eq('id', MI_ID_MOVIL);
        localStorage.clear();
        location.reload();
    }
</script>
