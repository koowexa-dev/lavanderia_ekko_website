// script.js - Versión optimizada con spam mejorado y sin testimonios
(function() {
    // ==================== MODALES ====================
    const modales = {
        reserva: document.getElementById('reservaModal'),
        clave: document.getElementById('claveModal'),
        admin: document.getElementById('adminModal'),
        producto: document.getElementById('productoModal'),
        historial: document.getElementById('historialModal')
    };

    window.abrirModal = function(modal) { if (modal) modal.style.display = 'flex'; };
    window.cerrarModal = function(modal) { if (modal) modal.style.display = 'none'; };
    window.cerrarTodosModales = function() { Object.values(modales).forEach(m => window.cerrarModal(m)); };

    // ==================== TOAST ====================
    window.showToast = function(msg, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast-notify';
        toast.style.background = isError ? '#c0392b' : '#1e2a36';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    };

    // Cerrar modales al hacer clic fuera o Escape
    window.addEventListener('click', (e) => {
        Object.values(modales).forEach(modal => { if (e.target === modal) window.cerrarModal(modal); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.cerrarTodosModales(); });

    // ==================== ALMACENAMIENTO LOCAL ====================
    window.guardarReservaEnLocalStorage = function(reserva) {
        try {
            let reservas = JSON.parse(localStorage.getItem('eko_reservas') || '[]');
            reservas.push(reserva);
            localStorage.setItem('eko_reservas', JSON.stringify(reservas));
        } catch (e) {
            console.error('Error guardando reserva:', e);
            window.showToast('No se pudo guardar localmente', true);
        }
    };

    window.guardarComentarioEnLocalStorage = function(comentario) {
        try {
            let comentarios = JSON.parse(localStorage.getItem('eko_comentarios') || '[]');
            comentarios.push(comentario);
            localStorage.setItem('eko_comentarios', JSON.stringify(comentarios));
        } catch (e) {
            console.error('Error guardando comentario:', e);
            window.showToast('No se pudo guardar el comentario', true);
        }
    };

    window.obtenerHistorial = function() {
        try {
            const reservas = JSON.parse(localStorage.getItem('eko_reservas') || '[]');
            const comentarios = JSON.parse(localStorage.getItem('eko_comentarios') || '[]');
            return { reservas, comentarios };
        } catch (e) {
            console.error('Error leyendo historial:', e);
            return { reservas: [], comentarios: [] };
        }
    };

    window.limpiarHistorial = function() {
        try {
            localStorage.removeItem('eko_reservas');
            localStorage.removeItem('eko_comentarios');
            window.showToast('Historial limpiado', false);
        } catch (e) {
            console.error('Error limpiando historial:', e);
            window.showToast('Error al limpiar historial', true);
        }
    };

    // ==================== GEOLOCALIZACIÓN ====================
    window.obtenerUbicacion = function(callback) {
        if (!navigator.geolocation) {
            window.showToast('Geolocalización no soportada', true);
            return;
        }
        const timeoutId = setTimeout(() => {
            window.showToast('Tiempo de espera agotado para obtener ubicación', true);
        }, 10000);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                    .then(res => res.json())
                    .then(data => {
                        const direccion = data.display_name || `${lat}, ${lng}`;
                        callback({ lat, lng, direccion });
                    })
                    .catch(() => callback({ lat, lng, direccion: `${lat}, ${lng}` }));
            },
            (error) => {
                clearTimeout(timeoutId);
                let msg = 'Error al obtener ubicación';
                if (error.code === 1) msg = 'Permiso denegado para ubicación';
                else if (error.code === 2) msg = 'Ubicación no disponible';
                else if (error.code === 3) msg = 'Tiempo de espera agotado';
                window.showToast(msg, true);
            }
        );
    };

    window.mostrarMapa = function(lat, lng, elementoId) {
        const mapaImg = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=600x200&maptype=mapnik&markers=${lat},${lng},blue-pushpin`;
        const contenedor = document.getElementById(elementoId);
        if (contenedor) {
            contenedor.innerHTML = `<img src="${mapaImg}" alt="Mapa de ubicación" style="width:100%; border-radius:16px; margin-top:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
        }
    };

    // ==================== NOTIFICACIONES PUSH ====================
    let notificacionesActivadas = false;
    const btnNotificaciones = document.getElementById('solicitarNotificacionesBtn');
    if (btnNotificaciones && 'Notification' in window) {
        btnNotificaciones.addEventListener('click', () => {
            if (Notification.permission === 'granted') {
                notificacionesActivadas = true;
                window.showToast('Notificaciones ya activadas', false);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') {
                        notificacionesActivadas = true;
                        window.showToast('¡Notificaciones activadas! Recibirás promociones especiales.', false);
                        new Notification('¡Gracias por activar las notificaciones!', {
                            body: 'Recibirás ofertas exclusivas de Lavandería EKO.',
                            icon: 'eko.jpg'
                        });
                    } else {
                        window.showToast('No se activaron las notificaciones', true);
                    }
                });
            } else {
                window.showToast('Las notificaciones están bloqueadas en este navegador', true);
            }
        });
    } else if (btnNotificaciones) {
        btnNotificaciones.style.display = 'none';
    }

    function enviarNotificacionPromocional(texto) {
        if (notificacionesActivadas && Notification.permission === 'granted') {
            new Notification('🎁 Lavandería EKO', { body: texto, icon: 'eko.jpg' });
        }
    }

    // ==================== ANALYTICS SIMPLE ====================
    function registrarEvento(categoria, accion, etiqueta = '') {
        const evento = {
            categoria, accion, etiqueta,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        console.log('[ANALYTICS]', evento);
    }

    let tiempoInicio = Date.now();
    window.addEventListener('beforeunload', () => {
        const tiempoTotal = Math.round((Date.now() - tiempoInicio) / 1000);
        registrarEvento('session', 'duracion', `${tiempoTotal}s`);
    });

    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-header')) {
            registrarEvento('click', 'header_button', target.textContent.trim());
        } else if (target.classList.contains('btn-solicitar')) {
            registrarEvento('click', 'solicitar_servicio', 'plan_card');
        } else if (target.classList.contains('btn-comentario')) {
            registrarEvento('click', 'enviar_comentario');
        }
    });

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 50) {
                registrarEvento('scroll', 'profundidad', `~${Math.round(scrollPercent)}%`);
            }
        }, 500);
    });

    // ==================== SPAM INTELIGENTE OPTIMIZADO ====================
    let imagenesPromocionales = [];
    let intervaloSpam = null;
    let spamActivo = false;
    let spamCount = 0;
    let ultimoTexto = '';
    let ultimaImagen = '';
    let paginaVisible = true;
    let spamPaused = false;

    const SPAM_CONFIG = {
        intervaloMin: 15000,        // 15 segundos mínimo
        intervaloMax: 30000,        // 30 segundos máximo
        duracionSpam: 6000,         // 6 segundos en pantalla
        maxSpamsPorSesion: 15,      // 15 spams máximo
        pausarSiModalAbierto: true,
        usarVisibilityAPI: true
    };

    const textosPromocionales = [
        "✨ Plan NORMAL: Lavado + Secado + Doblado desde $400/kg",
        "💧 Plan BÁSICO: Prelavado + lavado líquido + suavizante",
        "🌟 Plan PREMIUM: Cápsula de alta eficiencia + fragancia especial",
        "🌸 Plan ESPECIAL: Ideal para ropa de cama y toallas, aroma premium",
        "🚚 Recogida y entrega a domicilio en 48 horas",
        "🧴 Detergentes ecológicos: Prodoxá, Tide, Downy para piel sensible",
        "🧺 Servicio de planchado disponible",
        "🌿 Lavado eco-friendly, cuidamos el medio ambiente",
        "📍 Cubrimos zonas: Habana Vieja, Centro Habana, Vedado, Playa y más",
        "🎁 Pregunta por nuestras promociones al realizar múltiples servicios",
        "💪 Confianza y calidad: más de 1000 clientes satisfechos",
        "📱 Reserva fácil desde nuestra web o por WhatsApp"
    ];

    function obtenerTextoAleatorio() {
        let disponibles = textosPromocionales.filter(t => t !== ultimoTexto);
        if (disponibles.length === 0) disponibles = textosPromocionales;
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        ultimoTexto = nuevo;
        return nuevo;
    }

    function obtenerImagenAleatoria() {
        if (imagenesPromocionales.length === 0) return null;
        let disponibles = imagenesPromocionales.filter(img => img !== ultimaImagen);
        if (disponibles.length === 0) disponibles = imagenesPromocionales;
        const nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
        ultimaImagen = nueva;
        return nueva;
    }

    function hayModalAbierto() {
        return Object.values(modales).some(modal => modal && modal.style.display === 'flex');
    }

    function mostrarSpam() {
        if (spamActivo) return;
        if (SPAM_CONFIG.maxSpamsPorSesion > 0 && spamCount >= SPAM_CONFIG.maxSpamsPorSesion) {
            if (intervaloSpam) clearInterval(intervaloSpam);
            intervaloSpam = null;
            console.log('Límite de spams alcanzado.');
            return;
        }
        if (!paginaVisible && SPAM_CONFIG.usarVisibilityAPI) return;
        if (SPAM_CONFIG.pausarSiModalAbierto && hayModalAbierto()) return;

        const imagen = obtenerImagenAleatoria();
        if (!imagen) return;

        const texto = obtenerTextoAleatorio();
        const spamDiv = document.createElement('div');
        spamDiv.id = 'spam-overlay';
        spamDiv.innerHTML = `
            <div class="spam-content">
                <img src="${imagen}" alt="Promoción EKO" class="spam-imagen" loading="lazy" onerror="this.style.display='none'">
                <div class="spam-icon">🧺</div>
                <h3>LAVANDERÍA EKO</h3>
                <p>${texto}</p>
                <div class="spam-timer">Oferta válida por tiempo limitado</div>
            </div>
        `;
        document.body.appendChild(spamDiv);
        spamActivo = true;
        spamCount++;
        registrarEvento('spam', 'mostrado', `#${spamCount} - ${texto.substring(0, 40)}`);
        
        // Notificación push cada 3 spams
        if (spamCount % 3 === 0 && spamCount > 0) {
            enviarNotificacionPromocional(`✨ ¡No te pierdas esta oferta! ${texto.substring(0, 60)}`);
        }

        setTimeout(() => {
            if (spamDiv && spamDiv.parentNode) {
                spamDiv.style.opacity = '0';
                setTimeout(() => {
                    if (spamDiv.parentNode) spamDiv.remove();
                    spamActivo = false;
                }, 500);
            } else {
                spamActivo = false;
            }
        }, SPAM_CONFIG.duracionSpam);
    }

    function obtenerIntervaloAleatorio() {
        const min = SPAM_CONFIG.intervaloMin;
        const max = SPAM_CONFIG.intervaloMax;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function programarSiguienteSpam() {
        if (intervaloSpam) clearInterval(intervaloSpam);
        const intervalo = obtenerIntervaloAleatorio();
        intervaloSpam = setInterval(() => {
            mostrarSpam();
        }, intervalo);
        console.log(`Próximo spam en ${intervalo / 1000} segundos`);
    }

    function iniciarSpamPeriodico() {
        if (intervaloSpam) clearInterval(intervaloSpam);
        spamCount = 0;
        ultimoTexto = '';
        ultimaImagen = '';
        setTimeout(() => {
            mostrarSpam();
            programarSiguienteSpam();
        }, 3000);
    }

    if (SPAM_CONFIG.usarVisibilityAPI) {
        document.addEventListener('visibilitychange', () => {
            paginaVisible = !document.hidden;
            if (!paginaVisible) {
                if (intervaloSpam) {
                    clearInterval(intervaloSpam);
                    intervaloSpam = null;
                    spamPaused = true;
                }
            } else {
                if (spamPaused && (SPAM_CONFIG.maxSpamsPorSesion === 0 || spamCount < SPAM_CONFIG.maxSpamsPorSesion)) {
                    programarSiguienteSpam();
                    spamPaused = false;
                }
            }
        });
    }

    // ==================== CARGA DE DATOS DESDE XML ====================
    async function cargarDatos() {
        try {
            const response = await fetch('service.xml');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            // Features
            const features = xmlDoc.querySelectorAll('features feature');
            const featuresContainer = document.getElementById('featuresList');
            if (featuresContainer) {
                featuresContainer.innerHTML = '';
                features.forEach(f => {
                    const span = document.createElement('span');
                    span.className = 'feature-chip';
                    span.textContent = f.textContent.trim();
                    featuresContainer.appendChild(span);
                });
            }

            // Planes de servicio
            const planesPeso = xmlDoc.querySelectorAll('planesPeso plan');
            const pricingGrid = document.getElementById('pricingGrid');
            if (pricingGrid) {
                pricingGrid.innerHTML = '';
                planesPeso.forEach(plan => {
                    const id = plan.getAttribute('id');
                    const nombre = plan.getAttribute('nombre');
                    const descripcion = plan.getAttribute('descripcion');
                    const badge = plan.getAttribute('badge');
                    const color = plan.getAttribute('color');
                    const detergente = plan.getAttribute('detergente');
                    const precios = plan.querySelectorAll('precio');
                    let listaPrecios = '';
                    precios.forEach(p => {
                        const rango = p.getAttribute('rango');
                        const precio = p.textContent;
                        listaPrecios += `<li><span>${rango} kg</span><span>$${precio}</span></li>`;
                    });
                    const card = document.createElement('div');
                    card.className = 'price-card';
                    card.setAttribute('data-plan', id);
                    card.innerHTML = `
                        <div class="price-badge">${badge}</div>
                        <div class="price-header ${color}"><h3>${nombre}</h3><p>${descripcion}</p></div>
                        <div class="price-body">
                            <div class="service-desc">${detergente}</div>
                            <ul class="price-list">${listaPrecios}</ul>
                            <button class="btn-solicitar">Solicitar servicio</button>
                        </div>
                    `;
                    pricingGrid.appendChild(card);
                });
            }

            // Evento para botones "Solicitar servicio"
            document.body.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-solicitar')) {
                    const card = e.target.closest('.price-card');
                    if (card) {
                        const plan = card.getAttribute('data-plan');
                        if (plan && window.setPlanAndOpenServiceTab) {
                            window.abrirModal(modales.reserva);
                            window.setPlanAndOpenServiceTab(plan);
                        } else if (plan) {
                            window.showToast('Error: formulario de reserva no disponible', true);
                        }
                    }
                }
            });

            // Productos
            const productos = xmlDoc.querySelectorAll('productos producto');
            const catalogoGrid = document.getElementById('catalogoGrid');
            if (catalogoGrid) {
                catalogoGrid.innerHTML = '';
                productos.forEach(prod => {
                    const marca = prod.getAttribute('marca');
                    const nombre = prod.getAttribute('nombre');
                    const tipo = prod.getAttribute('tipo');
                    const rendimiento = prod.getAttribute('rendimiento');
                    const descripcion = prod.getAttribute('descripcion');
                    const card = document.createElement('div');
                    card.className = 'catalogo-card';
                    card.setAttribute('data-producto', JSON.stringify({ marca, nombre, tipo, rendimiento, descripcion }));
                    card.innerHTML = `
                        <div class="catalogo-header">${marca} · ${nombre.substring(0, 20)}</div>
                        <div class="catalogo-body">
                            <div class="producto-marca">${marca}</div>
                            <div class="producto-nombre">${nombre}</div>
                            <div class="producto-tipo">${tipo}</div>
                            <button class="btn-detalle-producto">Ver detalles</button>
                        </div>
                    `;
                    catalogoGrid.appendChild(card);
                });
            }

            // Zonas de entrega
            const zonas = xmlDoc.querySelectorAll('zonas zona');
            const deliverySection = document.getElementById('deliverySection');
            if (deliverySection) {
                let zonasHtml = `<div class="text-center"><h3 style="color: var(--verde-eko);">Recogida y entrega a domicilio</h3><p>Entrega en 48H · Comodidad garantizada</p></div><div class="delivery-grid">`;
                zonas.forEach(z => {
                    const nombre = z.getAttribute('nombre');
                    const rango = z.getAttribute('rango');
                    const recogida = z.getAttribute('recogida');
                    const entrega = z.getAttribute('entrega');
                    const total = z.getAttribute('total');
                    const lugares = z.getAttribute('lugares');
                    zonasHtml += `
                        <div class="zone-card">
                            <h3>📍 ${nombre} (${rango})</h3>
                            <p>${lugares}</p>
                            <p>Recogida: $${recogida} | Entrega: $${entrega}</p>
                            <div class="zone-price">Total: $${total}</div>
                        </div>`;
                });
                zonasHtml += `</div>`;
                deliverySection.innerHTML = zonasHtml;
            }

            // Imágenes promocionales
            const promos = xmlDoc.querySelectorAll('promociones imagen');
            imagenesPromocionales = [];
            promos.forEach(promo => {
                const src = promo.getAttribute('src');
                if (src) imagenesPromocionales.push(src);
            });

            if (imagenesPromocionales.length > 0) {
                iniciarSpamPeriodico();
            }

            registrarEvento('carga', 'completa', 'service.xml');
        } catch (error) {
            console.error('Error cargando service.xml:', error);
            window.showToast('Error al cargar los datos del servicio', true);
            registrarEvento('error', 'carga_xml', error.message);
        }
    }

    // ==================== COMENTARIOS ====================
    const comentarioForm = document.getElementById('comentarioForm');
    if (comentarioForm) {
        comentarioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('comentarioNombre').value.trim();
            const email = document.getElementById('comentarioEmail').value.trim();
            const mensaje = document.getElementById('comentarioMensaje').value.trim();
            if (!nombre || !email || !mensaje) {
                window.showToast('Complete todos los campos', true);
                return;
            }
            if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) {
                window.showToast('Correo electrónico inválido', true);
                return;
            }
            const comentario = { nombre, email, mensaje, fechaRegistro: new Date().toISOString() };
            window.guardarComentarioEnLocalStorage(comentario);
            const asunto = `Comentario de ${nombre}`;
            const cuerpo = `Nombre: ${nombre}%0AEmail: ${email}%0A%0AComentario:%0A${mensaje}`;
            window.location.href = `mailto:ekolavanderia76@gmail.com?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
            window.showToast('Comentario guardado localmente y abriendo correo', false);
            comentarioForm.reset();
            registrarEvento('comentario', 'enviado', nombre);
        });
    }

    // ==================== MODAL DE PRODUCTO ====================
    const productoModal = document.getElementById('productoModal');
    const closeProductoBtn = document.getElementById('closeProductoModalBtn');
    if (closeProductoBtn) {
        closeProductoBtn.addEventListener('click', () => window.cerrarModal(productoModal));
    }
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detalle-producto')) {
            const card = e.target.closest('.catalogo-card');
            if (card) {
                const data = card.getAttribute('data-producto');
                if (data) {
                    try {
                        const prod = JSON.parse(data);
                        const container = document.getElementById('productoInfoContainer');
                        if (container) {
                            container.innerHTML = `
                                <div><strong>Marca:</strong> ${prod.marca}</div>
                                <div><strong>Nombre:</strong> ${prod.nombre}</div>
                                <div><strong>Tipo:</strong> ${prod.tipo}</div>
                                <div><strong>Rendimiento:</strong> ${prod.rendimiento}</div>
                                <div><strong>Descripción:</strong> ${prod.descripcion}</div>
                            `;
                            window.abrirModal(productoModal);
                            registrarEvento('producto', 'ver_detalles', prod.nombre);
                        }
                    } catch (err) {
                        window.showToast('Error al cargar producto', true);
                    }
                }
            }
        }
    });

    // ==================== BOTONES DE MODALES ====================
    const openReservaBtn = document.getElementById('openReservaBtn');
    const closeReservaBtn = document.getElementById('closeReservaBtn');
    const openAdminAccessBtn = document.getElementById('openAdminAccessBtn');
    const closeClaveModalBtn = document.getElementById('closeClaveModalBtn');
    const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
    const closeHistorialModalBtn = document.getElementById('closeHistorialModalBtn');

    if (openReservaBtn) openReservaBtn.addEventListener('click', () => window.abrirModal(modales.reserva));
    if (closeReservaBtn) closeReservaBtn.addEventListener('click', () => window.cerrarModal(modales.reserva));
    if (openAdminAccessBtn) openAdminAccessBtn.addEventListener('click', () => window.abrirModal(modales.clave));
    if (closeClaveModalBtn) closeClaveModalBtn.addEventListener('click', () => window.cerrarModal(modales.clave));
    if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', () => window.cerrarModal(modales.admin));
    if (closeHistorialModalBtn) closeHistorialModalBtn.addEventListener('click', () => window.cerrarModal(modales.historial));

    cargarDatos();
})();