(function() {
    const ADMIN_PASSWORD = 'eko76**lavan';
    const MAX_ATTEMPTS = 3;
    const BLOCK_TIME = 30000;
    let adminAttempts = 0;
    let blockedUntil = 0;

    const claveModal = document.getElementById('claveModal');
    const adminModal = document.getElementById('adminModal');
    const validarBtn = document.getElementById('validarClaveBtn');
    const verHistorialBtn = document.getElementById('verHistorialBtn');
    const historialModal = document.getElementById('historialModal');
    const limpiarHistorialBtn = document.getElementById('limpiarHistorialBtn');

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : 'N/A';
    }

    if (validarBtn) {
        validarBtn.addEventListener('click', () => {
            const ahora = Date.now();
            if (ahora < blockedUntil) {
                const segundos = Math.ceil((blockedUntil - ahora) / 1000);
                window.showToast(`Demasiados intentos. Espere ${segundos}s`, true);
                return;
            }
            const clave = document.getElementById('claveAcceso').value;
            if (clave === ADMIN_PASSWORD) {
                adminAttempts = 0;
                window.cerrarModal(claveModal);
                window.abrirModal(adminModal);
                document.getElementById('claveAcceso').value = '';
            } else {
                adminAttempts++;
                window.showToast(`Clave incorrecta. Intento ${adminAttempts}/${MAX_ATTEMPTS}`, true);
                if (adminAttempts >= MAX_ATTEMPTS) {
                    blockedUntil = Date.now() + BLOCK_TIME;
                    adminAttempts = 0;
                    window.showToast('Bloqueado 30 segundos', true);
                }
                document.getElementById('claveAcceso').value = '';
            }
        });
    }

    const adminForm = document.getElementById('adminForm');
    if (adminForm && adminForm.children.length === 0) {
        adminForm.innerHTML = `
            <div class="admin-section"><h4>Datos del Cliente</h4><div class="admin-grid">
                <div class="form-group"><label>Orden No *</label><input type="text" id="ordenNo" required></div>
                <div class="form-group"><label>Teléfono *</label><input type="tel" id="adminTelefono" required></div>
                <div class="form-group"><label>Fecha de recepción *</label><input type="date" id="fechaRecepcion" required></div>
                <div class="form-group"><label>Domicilio (zona) *</label><select id="domicilioZona" required><option value="Zona Corta $600">Zona Corta ($600)</option><option value="Zona Media $900">Zona Media ($900)</option><option value="Zona Larga $1200">Zona Larga ($1200)</option></select></div>
                <div class="form-group"><label>Dirección *</label><input type="text" id="adminDireccion" required></div>
            </div></div>
            <div class="admin-section"><h4>Detalles del Servicio</h4><div class="admin-grid">
                <div class="form-group"><label>Servicio *</label><input type="text" id="adminServicio" required></div>
                <div class="form-group"><label>Productos / Kg / Cantidad *</label><input type="text" id="productosKgCantidad" required></div>
                <div class="form-group"><label>Planchado</label><input type="text" id="planchado"></div>
                <div class="form-group"><label>Observaciones</label><textarea rows="2" id="observaciones"></textarea></div>
            </div></div>
            <div class="admin-section"><h4>Pesos y Pagos</h4><div class="admin-grid">
                <div class="form-group"><label>Bulto Total *</label><input type="text" id="bultoTotal" required></div>
                <div class="form-group"><label>Pesó Total *</label><input type="text" id="pesoTotal" required></div>
                <div class="form-group"><label>Pago Total *</label><input type="text" id="pagoTotal" required></div>
            </div></div>
            <div class="admin-section"><h4>Firmas</h4><div class="admin-grid">
                <div class="form-group"><label>Firma del encargado *</label><input type="text" id="firmaEncargado" required></div>
                <div class="form-group"><label>Firma del cliente *</label><input type="text" id="firmaCliente" required></div>
            </div></div>
            <div class="modal-buttons"><button type="button" id="descargarTxtBtn" class="btn-modal btn-enviar">Descargar TXT</button></div>
        `;
        const descargarBtn = document.getElementById('descargarTxtBtn');
        if (descargarBtn) {
            descargarBtn.addEventListener('click', () => {
                const orden = getVal('ordenNo');
                const telefono = getVal('adminTelefono');
                const fecha = getVal('fechaRecepcion');
                const zona = getVal('domicilioZona');
                const direccion = getVal('adminDireccion');
                const servicio = getVal('adminServicio');
                const productos = getVal('productosKgCantidad');
                const planchado = getVal('planchado');
                const observaciones = getVal('observaciones');
                const bulto = getVal('bultoTotal');
                const peso = getVal('pesoTotal');
                const pago = getVal('pagoTotal');
                const firmaEnc = getVal('firmaEncargado');
                const firmaCli = getVal('firmaCliente');

                const txt = `============================================
           ORDEN DE SERVICIO - EKO
============================================

[ DATOS DEL CLIENTE ]
--------------------------------------------
Número de orden:       ${orden}
Teléfono:              ${telefono}
Fecha de recepción:    ${fecha}
Zona de domicilio:     ${zona}
Dirección completa:    ${direccion}

[ DETALLES DEL SERVICIO ]
--------------------------------------------
Servicio solicitado:   ${servicio}
Productos/Kg/Cantidad: ${productos}
Planchado:             ${planchado === '' ? 'No aplica' : planchado}
Observaciones:         ${observaciones === '' ? 'Ninguna' : observaciones}

[ PESOS Y PAGOS ]
--------------------------------------------
Bulto total:           ${bulto}
Peso total:            ${peso} kg
Pago total:            $${pago}

[ FIRMAS ]
--------------------------------------------
Encargado:             ${firmaEnc}
Cliente:               ${firmaCli}

============================================
Documento generado por Lavandería EKO
============================================`;
                const blob = new Blob([txt], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `orden_${orden || 'sinnumero'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
                window.showToast('Archivo TXT descargado', false);
            });
        }
    }

    if (verHistorialBtn) {
        verHistorialBtn.addEventListener('click', () => {
            const { reservas, comentarios } = window.obtenerHistorial();
            const container = document.getElementById('historialContainer');
            if (!container) return;
            let html = '<h4>Reservas</h4>';
            if (reservas.length === 0) html += '<p>No hay reservas guardadas.</p>';
            reservas.forEach((r, i) => {
                html += `<div class="historial-item"><strong>Reserva ${i+1}</strong><br>
                Cliente: ${r.cliente.nombre}<br>
                Tel: ${r.cliente.telefono}<br>
                Dirección: ${r.cliente.direccion}<br>
                Carnet: ${r.cliente.carnet}<br>
                Fecha/Hora: ${r.cliente.fechaHora}<br>
                Plan: ${r.servicio.plan}<br>
                Pesos: ${r.servicio.pesos.map(p=>`${p.rango} ($${p.precioUnitario})`).join(', ')}<br>
                Extras: ${Object.keys(r.extras).filter(k=>r.extras[k]).join(', ') || 'Ninguno'}<br>
                Total: $${r.total}<br>
                Registro: ${new Date(r.fechaRegistro).toLocaleString()}
                </div>`;
            });
            html += '<h4>Comentarios</h4>';
            if (comentarios.length === 0) html += '<p>No hay comentarios.</p>';
            comentarios.forEach((c, i) => {
                html += `<div class="historial-item"><strong>Comentario ${i+1}</strong><br>
                Nombre: ${c.nombre}<br>
                Email: ${c.email}<br>
                Mensaje: ${c.mensaje}<br>
                Fecha: ${new Date(c.fechaRegistro).toLocaleString()}
                </div>`;
            });
            container.innerHTML = html;
            window.abrirModal(historialModal);
        });
    }

    if (limpiarHistorialBtn) {
        limpiarHistorialBtn.addEventListener('click', () => {
            if (confirm('¿Eliminar todo el historial permanentemente?')) {
                window.limpiarHistorial();
                window.cerrarModal(historialModal);
            }
        });
    }
})();