(function() {
    const planesData = [
        { 
            id: "BASICO", nombre: "BASICO", descripcion: "lavado + secado + doblado", 
            detergente: "Detergente líquido + suavizante Aromatizado", proceso: "simple",
            incluye: "buena limpieza y resultado", precios: {"1-2 kg":600,"3-4 kg":800,"5-6 kg":1000,"7 kg":1200}, 
            badge: "Popular", propuesta: "lo necesario para cuidar tus prendas"
        },
        { 
            id: "PREMIUM", nombre: "PREMIUM", descripcion: "Prelavado + Lavado + Secado + Doblado", 
            detergente: "Cápsula + fragancia especial o perfume", proceso: "cuidadoso y preservador",
            incluye: "Maximo cuidado y preservación para tu ropa", precios: {"1-2 kg":800,"3-4 kg":1000,"5-6 kg":1200,"7 kg":1400}, 
            badge: "Recomendado", propuesta: "Experiencia premium: aroma por días, acabados impecables."
        },
        { 
            id: "ESPECIAL", nombre: "ESPECIAL", descripcion: "Ropa de cama + Toallas + aroma premium", 
            detergente: "Cápsula intensiva + fragancia", proceso: "intenso y cuidadoso",
            incluye: "Tratado único y exclusivo para todas tus prendas", precios: {"1-2 kg":900,"3-4 kg":1100,"5-6 kg":1300,"7 kg":1500}, 
            badge: "Trato Unico", propuesta: "Cuidado especial para hogar: frescura y suavidad garantizadas."
        },
        { 
            id: "BABY_BASIC", nombre: "BABY EKKO 1", descripcion: "Lavado Especializado para Ropa de Bebé", 
            detergente: "Detergente neutro hipoalergénico", proceso: "cuidadoso",
            incluye: "Doblado básico, cuidado para pieles sensibles", precios: {"Hasta 5 kg":1500}, 
            badge: "Basico", propuesta: "Ideal para tu bebé: sin químicos agresivos, aroma delicado y suavidad extrema."
        },
        { 
            id: "BABY_PREMIUM", nombre: "BABY EKKO 2", descripcion: "Lavado Especializado + Recogida y Entrega a Domicilio", 
            detergente: "Detergente neutro hipoalergénico + antimanchas suave", proceso: "máxima delicadeza y cuidado",
            incluye: "Recogida a domicilio, doblado profesional, empaque higiénico, entrega a domicilio", precios: {"Hasta 5 kg":2000}, 
            badge: "Premium", propuesta: "Servicio completo: máxima comodidad y cuidado premium para la ropa de tu bebé."
        }
    ];

    const productos = [
        { marca: "Prodoxa", nombre: "Detergente Líquido Cuidado del Color", tipo: "Detergente Líquido", descripcion: "Ideal para ropa de color, protege los tonos y elimina manchas difíciles." },
        { marca: "Prodoxa", nombre: "Gel Halc Ropas Blancas", tipo: "Detergente Líquido", descripcion: "Potente gel para ropa blanca, devuelve el brillo original." },
        { marca: "Tide", nombre: "HE Turbo Clean", tipo: "Detergente Líquido HE", descripcion: "Alta eficiencia para lavadoras HE, elimina 99% de las manchas." },
        { marca: "Prodoxa", nombre: "Fabric Softener Lavanda", tipo: "Suavizante", descripcion: "Suavizante con aroma a lavanda, deja la ropa suave y perfumada." },
        { marca: "Downy", nombre: "Free & Gentle", tipo: "Suavizante hipoalergénico", descripcion: "Hipoalergénico, sin fragancias, ideal para pieles sensibles." }
    ];

    const zonas = [
        { nombre: "Zona Corta", rango: "0-3 km", recogida: "400", entrega: "200", total: "600", lugares: "Habana Vieja, Centro Habana, Cerro" },
        { nombre: "Zona Media", rango: "3-6 km", recogida: "600", entrega: "300", total: "900", lugares: "Vedado, Plaza, Nuevo Vedado, Lawton" },
        { nombre: "Zona Larga", rango: "6-10 km", recogida: "800", entrega: "400", total: "1200", lugares: "Casino Deportivo, Mariano, Playa" }
    ];

    const imagenesCarrusel = [
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post1.webp", alt: "Post1" },
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post2.webp", alt: "Post2" },
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post3.webp", alt: "Post3" },
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post4.webp", alt: "Post4" },
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post5.webp", alt: "Post5" },
        { src: "https://github.com/koowexa-dev/lavanderia_ekko_website/raw/refs/heads/main/img/post6.webp", alt: "Post6" },
    ];

    const slidesBanner = [
        { texto: "📱 Descarga nuestra App EKKO", boton: "Acceder", url: "#" },
        { texto: "🎁 Promociones exclusivas", boton: "Acceder", url: "#" },
        { texto: "💬 Canal de WhatsApp", boton: "Acceder", url: "#" },
        { texto: "📘 Síguenos en Facebook", boton: "Acceder", url: "#" }
    ];

    function scrollToApp() {
        const appSection = document.getElementById('app');
        if(appSection) {
            appSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    const pricingGrid = document.getElementById('pricingGrid');
    if(pricingGrid){
        pricingGrid.innerHTML = '';
        planesData.forEach(plan => {
            const card = document.createElement('div'); 
            card.className = 'price-card';
            card.setAttribute('data-plan', plan.id);
            let listaPrecios = '';
            for(const [rango, precio] of Object.entries(plan.precios)) {
                listaPrecios += `<li><span>${rango}</span><span>$${precio} CUP</span></li>`;
            }
            card.innerHTML = `
                <div class="plan-badge">${plan.badge}</div>
                <div class="plan-header">
                    <div class="plan-nombre">${plan.nombre}</div>
                    <div class="plan-descripcion">${plan.descripcion}</div>
                </div>
                <div class="plan-body">
                    <div class="tech-section">
                        <h4>🧼 Características técnicas</h4>
                        <div class="tech-list">
                            <div class="tech-item"><span>🧴</span> <span><strong>Producto:</strong> ${plan.detergente}</span></div>
                            <div class="tech-item"><span>⚙️</span> <span><strong>Proceso:</strong> ${plan.proceso}</span></div>
                            <div class="tech-item"><span>📦</span> <span><strong>Incluye:</strong> ${plan.incluye}</span></div>
                        </div>
                    </div>
                    <div class="prices-section">
                        <h4>⚖️ Peso y precio (CUP)</h4>
                        <ul class="price-list">${listaPrecios}</ul>
                    </div>
                    <div class="propuesta">
                        <span>💡</span> <span>${plan.propuesta}</span>
                    </div>
                    <button class="btn-solicitar">📲 Solicitar ahora</button>
                </div>
            `;
            const btn = card.querySelector('.btn-solicitar');
            if(btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    scrollToApp();
                });
            }
            pricingGrid.appendChild(card);
        });
    }

    const catalogoGrid = document.getElementById('catalogoGrid');
    if(catalogoGrid){
        catalogoGrid.innerHTML = '';
        productos.forEach(prod => {
            const card = document.createElement('div'); card.className = 'catalogo-card';
            card.innerHTML = `<div class="catalogo-header">${prod.marca}</div><div class="catalogo-body"><div class="producto-marca">${prod.marca}</div><div class="producto-nombre">${prod.nombre}</div><div class="producto-tipo">${prod.tipo}</div><div class="producto-detalle">${prod.descripcion}</div></div>`;
            catalogoGrid.appendChild(card);
        });
    }

    const deliverySection = document.getElementById('deliverySection');
    if(deliverySection){
        let zonasHtml = `<div class="text-center"><h3 style="color: var(--verde-eko);">Servicio a Domicilio</h3><p>Entrega en 48H · Comodidad garantizada en toda La Habana</p></div><div class="delivery-grid">`;
        zonas.forEach(z => { zonasHtml += `<div class="zone-card"><h3>${z.nombre} (${z.rango})</h3><p>${z.lugares}</p><p>Recogida: $${z.recogida} | Entrega: $${z.entrega}</p><div class="zone-price">Total: $${z.total}</div></div>`; });
        zonasHtml += `</div><div class="delivery-note"><strong>Nota importante:</strong> El cliente debe realizar un pago del 50% por adelantado en la recogida y el otro 50% en la entrega del servicio a domicilio.</div>`;
        deliverySection.innerHTML = zonasHtml;
    }

    let currentIndex = 0;
    const slidesContainer = document.getElementById('carouselSlides');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let totalSlides = imagenesCarrusel.length;

    function buildCarousel(){
        if(!slidesContainer) return;
        slidesContainer.innerHTML = '';
        if(dotsContainer) dotsContainer.innerHTML = '';
        imagenesCarrusel.forEach((img, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-slide';
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.alt = img.alt;
            imgElement.loading = 'lazy';
            slideDiv.appendChild(imgElement);
            slidesContainer.appendChild(slideDiv);
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.dataset.index = idx;
            dot.addEventListener('click', () => goToSlide(idx));
            if(dotsContainer) dotsContainer.appendChild(dot);
        });
        updateDots();
    }

    function updateDots(){
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot,i)=>{
            if(i === currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    function goToSlide(index){
        if(index < 0) index = totalSlides-1;
        if(index >= totalSlides) index = 0;
        currentIndex = index;
        if(slidesContainer) slidesContainer.style.transform = `translateX(-${currentIndex*100}%)`;
        updateDots();
    }

    function nextSlide(){ goToSlide(currentIndex+1); }
    function prevSlide(){ goToSlide(currentIndex-1); }

    if(prevBtn && nextBtn && slidesContainer){
        buildCarousel();
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        if(totalSlides > 0) goToSlide(0);
    }

    const dropdown = document.getElementById('navDropdown');
    if(dropdown) {
        dropdown.addEventListener('change', function(e){
            const targetId = this.value;
            if(targetId && targetId !== ""){
                const targetElement = document.querySelector(targetId);
                if(targetElement) targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                this.value = "";
            }
        });
    }

    const bannerSlidesContainer = document.getElementById('bannerSlides');
    const bannerDotsContainer = document.getElementById('bannerDots');
    const bannerPrevBtn = document.getElementById('bannerPrev');
    const bannerNextBtn = document.getElementById('bannerNext');
    let currentBannerIndex = 0;
    let totalBannerSlides = slidesBanner.length;
    let bannerInterval;

    function buildBanner() {
        if (!bannerSlidesContainer) return;
        bannerSlidesContainer.innerHTML = '';
        bannerDotsContainer.innerHTML = '';
        slidesBanner.forEach((slide, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'banner-slide';
            const target = slide.url.startsWith('http') ? '_blank' : '_self';
            slideDiv.innerHTML = `
                <div class="slide-texto">${slide.texto}</div>
                <a href="${slide.url}" class="slide-boton" target="${target}">${slide.boton}</a>
            `;
            bannerSlidesContainer.appendChild(slideDiv);

            const dot = document.createElement('span');
            dot.className = 'banner-dot';
            dot.dataset.index = idx;
            dot.addEventListener('click', () => goToBannerSlide(idx));
            bannerDotsContainer.appendChild(dot);
        });
        updateBannerDots();
        goToBannerSlide(0);
        startBannerAuto();
    }

    function updateBannerDots() {
        const dots = document.querySelectorAll('.banner-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentBannerIndex);
        });
    }

    function goToBannerSlide(index) {
        if (index < 0) index = totalBannerSlides - 1;
        if (index >= totalBannerSlides) index = 0;
        currentBannerIndex = index;
        const offset = -currentBannerIndex * 100;
        bannerSlidesContainer.style.transform = 'translateX(' + offset + '%)';
        updateBannerDots();
    }

    function nextBannerSlide() {
        goToBannerSlide(currentBannerIndex + 1);
    }

    function prevBannerSlide() {
        goToBannerSlide(currentBannerIndex - 1);
    }

    function startBannerAuto() {
        clearInterval(bannerInterval);
        bannerInterval = setInterval(nextBannerSlide, 4000);
    }

    function stopBannerAuto() {
        clearInterval(bannerInterval);
    }

    if (bannerPrevBtn && bannerNextBtn && bannerSlidesContainer) {
        buildBanner();
        bannerPrevBtn.addEventListener('click', function() { stopBannerAuto(); prevBannerSlide(); startBannerAuto(); });
        bannerNextBtn.addEventListener('click', function() { stopBannerAuto(); nextBannerSlide(); startBannerAuto(); });
        const slider = document.querySelector('.banner-slider');
        if (slider) {
            slider.addEventListener('mouseenter', stopBannerAuto);
            slider.addEventListener('mouseleave', startBannerAuto);
        }
    }
})();