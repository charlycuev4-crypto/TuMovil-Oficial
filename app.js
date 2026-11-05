async function confirmarViajePasajero() {
    const nom = sanitizarInput(document.getElementById('nombre-input').value);
    const destIdx = parseInt(document.getElementById('destino-select').value);
    
    if(!nom || nom.length < 2) { 
        alert("Ingresá un nombre válido."); 
        return; 
    }
    if(asientosElegidos.length === 0) { 
        alert("Falta elegir al menos un asiento."); 
        return; 
    }

    const btn = document.getElementById('btn-pedir');
    btn.disabled = true; 
    btn.innerHTML = '<span class="spinner"></span>Asignando unidad inteligente...';

    try {
        // Llamamos a la nueva función automática en Supabase (FIFO + Control de Grupo)
        const { data, error } = await _s.rpc('reservas_asientos_automatico', { 
            p_nombre: nom, 
            p_asientos: asientosElegidos, 
            p_destino_idx: destIdx, 
            p_lat: miLat, 
            p_lon: miLon 
        });

        if (error) throw error;

        // Si hubo colisión de asientos o ningún chofer tiene espacio suficiente para el grupo
        if (data?.colision || data?.sin_espacio) { 
            alert(data.mensaje || "No hay unidades con suficiente lugar disponible en este momento."); 
            btn.disabled = false; 
            actualizarBoton(); 
            renderizarFlotaDisponible(); // Refrescamos la flota visualmente
            return; 
        }

        if (data?.success) {
            localStorage.setItem('usuario_nombre', nom);
            miNombrePasajero = nom;
            
            // Anuncio de seguridad por voz
            anunciarSeguridadVideo();

            // Verificamos el viaje activo asignado automáticamente por el servidor
            await verificarViajesActivosBaseDatos(nom);
        }
    } catch (err) { 
        console.error("Error al reservar:", err);
        alert("Error de red al procesar la reserva."); 
        btn.disabled = false; 
        actualizarBoton(); 
    }
}
