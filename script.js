(function() {
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

    window.showToast = function(msg, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast-notify';
        toast.style.background = isError ? '#c0392b' : 'var(--verde-eko)';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    };

    window.addEventListener('click', (e) => {
        Object.values(modales).forEach(modal => { if (e.target === modal) window.cerrarModal(modal); });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.cerrarTodosModales(); });

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

    window.obtenerUbicacion = function(callback) {
        if (!navigator.geolocation) {
            window.showToast('Geolocalizacion no soportada', true);
            return;
        }
        const timeoutId = setTimeout(() => {
            window.showToast('Tiempo de espera agotado para obtener ubicacion', true);
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
                let msg = 'Error al obtener ubicacion';
                if (error.code === 1) msg = 'Permiso denegado para ubicacion';
                else if (error.code === 2) msg = 'Ubicacion no disponible';
                else if (error.code === 3) msg = 'Tiempo de espera agotado';
                window.showToast(msg, true);
            }
        );
    };

    window.mostrarMapa = function(lat, lng, elementoId) {
        const mapaImg = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=14&size=600x200&maptype=mapnik&markers=${lat},${lng},blue-pushpin`;
        const contenedor = document.getElementById(elementoId);
        if (contenedor) {
            contenedor.innerHTML = `<img src="${mapaImg}" alt="Mapa de ubicacion" style="width:100%; border-radius:16px; margin-top:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
        }
    };

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

    // DATOS ESTÁTICOS
    const planesPeso = [
        { id: "NORMAL", nombre: "NORMAL", descripcion: "Lavado + Secado + Doblado", badge: "ACCESIBLE", color: "bg-normal", detergente: "Detergente en polvo", precios: {"1-2":400,"3-4":500,"5-6":600,"7":700} },
        { id: "BASICO", nombre: "BASICO", descripcion: "Prelavado + Lavado + Secado + Doblado", badge: "POPULAR", color: "bg-basico", detergente: "Detergente liquido + suavizante", precios: {"1-2":700,"3-4":900,"5-6":1100,"7":1300} },
        { id: "PREMIUM", nombre: "PREMIUM", descripcion: "Prelavado + Lavado + Secado + Doblado", badge: "LA MEJOR", color: "bg-premium", detergente: "Capsula + fragancia especial", precios: {"1-2":800,"3-4":1000,"5-6":1200,"7":1400} },
        { id: "ESPECIAL", nombre: "ESPECIAL", descripcion: "Ropa de cama + Toallas + aroma premium", badge: "EXCLUSIVO", color: "bg-especial", detergente: "Capsula intensiva + fragancia", precios: {"1-2":900,"3-4":1100,"5-6":1300,"7":1500} }
    ];

    const productos = [
        { marca: "Prodoxa", nombre: "Detergente Liquido Cuidado del Color", tipo: "Detergente Liquido", rendimiento: "18 cargas", descripcion: "Ideal para ropa de color, protege los tonos y elimina manchas dificiles." },
        { marca: "Prodoxa", nombre: "Gel Halc Ropas Blancas", tipo: "Detergente Liquido", rendimiento: "32 lavados", descripcion: "Potente gel para ropa blanca, devuelve el brillo original." },
        { marca: "Tide", nombre: "HE Turbo Clean", tipo: "Detergente Liquido HE", rendimiento: "32 cargas", descripcion: "Alta eficiencia para lavadoras HE, elimina 99% de las manchas." },
        { marca: "Prodoxa", nombre: "Fabric Softener Lavanda", tipo: "Suavizante", rendimiento: "40 cargas", descripcion: "Suavizante con aroma a lavanda, deja la ropa suave y perfumada." },
        { marca: "Downy", nombre: "Free & Gentle", tipo: "Suavizante hipoalergenico", rendimiento: "30 cargas", descripcion: "Hipoalergenico, sin fragancias, ideal para pieles sensibles." }
    ];

    const zonas = [
        { nombre: "Zona Corta", rango: "0-3 km", recogida: "400", entrega: "200", total: "600", lugares: "Habana Vieja, Centro Habana, Cerro" },
        { nombre: "Zona Media", rango: "3-6 km", recogida: "600", entrega: "300", total: "900", lugares: "Vedado, Plaza, Nuevo Vedado, Lawton" },
        { nombre: "Zona Larga", rango: "6-10 km", recogida: "800", entrega: "400", total: "1200", lugares: "Casino Deportivo, Mariano, Playa" }
    ];

    // Imágenes para la galería (16:9)
    const imagenesGaleria = [
        { src: "promo1.jpg", alt: "#1" },
        { src: "promo2.jpg", alt: "#2" },
        { src: "promo3.jpg", alt: "#3" },
        { src: "promo4.jpg", alt: "#4" },
    ];

    function mostrarCarga(mostrar) {
        let loader = document.getElementById('global-loader');
        if (!loader && mostrar) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.position = 'fixed';
            loader.style.top = '50%';
            loader.style.left = '50%';
            loader.style.transform = 'translate(-50%, -50%)';
            loader.style.backgroundColor = 'rgba(0,0,0,0.8)';
            loader.style.color = 'white';
            loader.style.padding = '16px 32px';
            loader.style.borderRadius = '40px';
            loader.style.zIndex = '100000';
            loader.style.fontWeight = 'bold';
            loader.innerHTML = 'Cargando servicios...';
            document.body.appendChild(loader);
        } else if (loader && !mostrar) {
            loader.remove();
        }
    }

    function cargarDatos() {
        mostrarCarga(true);
        try {
            // Pricing grid
            const pricingGrid = document.getElementById('pricingGrid');
            if (pricingGrid) {
                pricingGrid.innerHTML = '';
                planesPeso.forEach(plan => {
                    const card = document.createElement('div');
                    card.className = 'price-card';
                    card.setAttribute('data-plan', plan.id);
                    let listaPrecios = '';
                    for (const [rango, precio] of Object.entries(plan.precios)) {
                        listaPrecios += `<li><span>${rango} kg</span><span>$${precio}</span></li>`;
                    }
                    card.innerHTML = `
                        <div class="price-badge">${plan.badge}</div>
                        <div class="price-header ${plan.color}"><h3>${plan.nombre}</h3><p>${plan.descripcion}</p></div>
                        <div class="price-body">
                            <div class="service-desc">${plan.detergente}</div>
                            <ul class="price-list">${listaPrecios}</ul>
                            <button class="btn-solicitar">Solicitar servicio</button>
                        </div>
                    `;
                    pricingGrid.appendChild(card);
                });
            }

            // Botones solicitar
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

            // Catálogo productos
            const catalogoGrid = document.getElementById('catalogoGrid');
            if (catalogoGrid) {
                catalogoGrid.innerHTML = '';
                productos.forEach(prod => {
                    const card = document.createElement('div');
                    card.className = 'catalogo-card';
                    card.setAttribute('data-producto', JSON.stringify(prod));
                    card.innerHTML = `
                        <div class="catalogo-header">${prod.marca} · ${prod.nombre.substring(0, 20)}</div>
                        <div class="catalogo-body">
                            <div class="producto-marca">${prod.marca}</div>
                            <div class="producto-nombre">${prod.nombre}</div>
                            <div class="producto-tipo">${prod.tipo}</div>
                            <button class="btn-detalle-producto">Ver detalles</button>
                        </div>
                    `;
                    catalogoGrid.appendChild(card);
                });
            }

            // Zonas entrega
            const deliverySection = document.getElementById('deliverySection');
            if (deliverySection) {
                let zonasHtml = `<div class="text-center"><h3 style="color: var(--verde-eko);">Recogida y entrega a domicilio</h3><p>Entrega en 48H · Comodidad garantizada</p></div><div class="delivery-grid">`;
                zonas.forEach(z => {
                    zonasHtml += `
                        <div class="zone-card">
                            <h3>${z.nombre} (${z.rango})</h3>
                            <p>${z.lugares}</p>
                            <p>Recogida: $${z.recogida} | Entrega: $${z.entrega}</p>
                            <div class="zone-price">Total: $${z.total}</div>
                        </div>`;
                });
                zonasHtml += `</div>`;
                deliverySection.innerHTML = zonasHtml;
            }

            registrarEvento('carga', 'completa', 'datos estaticos');
        } catch (error) {
            console.error('Error cargando datos:', error);
            window.showToast('Error al cargar los datos', true);
            registrarEvento('error', 'carga_datos', error.message);
        } finally {
            mostrarCarga(false);
        }
    }

    // Galería de imágenes 16:9 con lightbox
    function initGaleria() {
        const galeriaGrid = document.getElementById('galeriaGrid');
        if (!galeriaGrid) return;

        galeriaGrid.innerHTML = '';
        imagenesGaleria.forEach((img, idx) => {
            const item = document.createElement('div');
            item.className = 'galeria-item';
            item.setAttribute('data-index', idx);
            const picture = document.createElement('img');
            picture.src = img.src;
            picture.alt = img.alt;
            picture.className = 'galeria-img';
            picture.loading = 'lazy';
            item.appendChild(picture);
            galeriaGrid.appendChild(item);
        });

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const closeLightbox = lightbox.querySelector('.lightbox-close');

        function openLightbox(src, alt) {
            lightboxImg.src = src;
            lightboxImg.alt = alt;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeLightboxFn() {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }

        galeriaGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.galeria-item');
            if (item) {
                const idx = parseInt(item.getAttribute('data-index'), 10);
                const imgData = imagenesGaleria[idx];
                openLightbox(imgData.src, imgData.alt);
            }
        });

        closeLightbox.addEventListener('click', closeLightboxFn);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightboxFn();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightboxFn();
            }
        });
    }

    // Comentarios
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
                window.showToast('Correo electronico invalido', true);
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

    // Producto modal
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
                                <div><strong>Descripcion:</strong> ${prod.descripcion}</div>
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

    // Modales externos
    const openReservaBtn = document.getElementById('openReservaBtn');
    const closeReservaBtn = document.getElementById('closeReservaBtn');
    const openAdminAccessBtn = document.getElementById('openAdminAccessBtn');
    const closeClaveModalBtn = document.getElementById('closeClaveModalBtn');
    const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
    const closeHistorialModalBtn = document.getElementById('closeHistorialModalBtn');

    if (openReservaBtn) {
        openReservaBtn.addEventListener('click', () => {
            if (window.resetReservaForm) window.resetReservaForm();
            window.abrirModal(modales.reserva);
        });
    }
    if (closeReservaBtn) closeReservaBtn.addEventListener('click', () => window.cerrarModal(modales.reserva));
    if (openAdminAccessBtn) openAdminAccessBtn.addEventListener('click', () => window.abrirModal(modales.clave));
    if (closeClaveModalBtn) closeClaveModalBtn.addEventListener('click', () => window.cerrarModal(modales.clave));
    if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', () => window.cerrarModal(modales.admin));
    if (closeHistorialModalBtn) closeHistorialModalBtn.addEventListener('click', () => window.cerrarModal(modales.historial));

    // Spam promocional
    let spamInterval = null;
    let spamActivo = false;
    const textosPromocionales = [
        "NUEVO PLAN BABY: Proximamente mas informacion",
        "(AVISO): El cliente debe pagar el cincuenta %. de la mensajería al solicitar nuestro servicio.",
    ];
    let ultimoTexto = '';

    function obtenerTextoAleatorio() {
        let disponibles = textosPromocionales.filter(t => t !== ultimoTexto);
        if (disponibles.length === 0) disponibles = textosPromocionales;
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        ultimoTexto = nuevo;
        return nuevo;
    }

    function mostrarSpam() {
        if (spamActivo) return;
        const texto = obtenerTextoAleatorio();
        const spamDiv = document.createElement('div');
        spamDiv.id = 'spam-overlay';
        spamDiv.innerHTML = `
            <div class="spam-content">
                <h3>LAVANDERIA EKO</h3>
                <p>${texto}</p>
            </div>
        `;
        document.body.appendChild(spamDiv);
        spamActivo = true;
        registrarEvento('spam', 'mostrado', texto.substring(0, 40));

        setTimeout(() => {
            if (spamDiv && spamDiv.parentNode) {
                spamDiv.remove();
                spamActivo = false;
            }
        }, 5000);
    }

    function iniciarSpamPeriodico() {
        if (spamInterval) clearInterval(spamInterval);
        setTimeout(() => {
            mostrarSpam();
            spamInterval = setInterval(mostrarSpam, 45000);
        }, 10000);
    }

    iniciarSpamPeriodico();
    cargarDatos();
    initGaleria();  // Inicializar galería

    // Accordion
    function initAccordion() {
        const accordionItems = document.querySelectorAll('#ekoValues .accordion-item');
        if (!accordionItems.length) return;

        function closeAllItems() {
            accordionItems.forEach(item => {
                item.classList.remove('active');
            });
        }

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (!header) return;

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                closeAllItems();
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccordion);
    } else {
        initAccordion();
    }
})();