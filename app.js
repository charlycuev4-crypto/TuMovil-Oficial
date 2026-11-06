// --- CORRECCIÓN EN LA RENDERIZACIÓN DE LOS ASIENTOS DE LA FLOTA ---
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
            
            // Bucle exacto para los 4 asientos de la flota de la flota
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
                    // Asignación directa del evento táctil para elegir el asiento
                    box.onclick = () => seleccionarAsiento(movil.id, num);
                }
                row.appendChild(box);
            }
            container.appendChild(card);
        });
        actualizarBoton();
