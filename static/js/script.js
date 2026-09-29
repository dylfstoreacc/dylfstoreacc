// INISIALISASI GOOGLE TRANSLATE (Tersembunyi)
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ms',
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. INIT THEME (Light/Dark Mode)
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const themeIcon = document.getElementById('themeIcon');
        if(themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    // 2. PRELOADER ANIMASI TEKS
    const welcomeTextContainer = document.getElementById("welcomeText");
    if(welcomeTextContainer) {
        welcomeTextContainer.innerHTML = ""; 
        const textToAnimate = "Welcome To DYLF STOREacc"; 
        const words = textToAnimate.split(" ");
        let letterDelayCounter = 0;
        
        words.forEach((word) => {
            const wordContainer = document.createElement("span");
            wordContainer.className = "word-box";
            
            if(word === "DYLF") wordContainer.classList.add("text-logo-dylf");
            if(word === "STOREacc") wordContainer.classList.add("text-logo-store");
            
            word.split("").forEach((char) => {
                const charSpan = document.createElement("span");
                charSpan.className = "letter-box";
                charSpan.textContent = char;
                charSpan.style.animationDelay = `${letterDelayCounter * 0.1}s`;
                wordContainer.appendChild(charSpan);
                letterDelayCounter++;
            });
            welcomeTextContainer.appendChild(wordContainer);
        });

        setTimeout(() => {
            const preloader = document.getElementById("preloader");
            if(preloader) {
                preloader.style.opacity = "0";
                setTimeout(() => { preloader.style.visibility = "hidden"; }, 800);
            }
        }, 3000); 
    }

    // 3. SWIPER CAROUSEL
    const swiper = new Swiper('.hero-carousel-container', {
        effect: 'fade', speed: 800, autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true }, loop: true 
    });

    // 4. LOAD DATA STREAMING CANGGIH (Memuat foto satu per satu secara instan tanpa menunggu semua beres)
    // Parameter: (previewId, modalId, folderName, isKatalog, typeName, maksimalCekAngka)
    loadDataStream('preview-testi-stok', 'full-testi-stok', 'stok', false, '', 150);
    loadDataStream('preview-testi-rekber', 'full-testi-rekber', 'rekber', false, '', 100);
    loadDataStream('preview-testi-topup', 'full-testi-topup', 'topup', false, '', 50);
    loadDataStream('preview-testi-convert', 'full-testi-convert', 'convert', false, '', 50);

    loadDataStream(null, 'katalog-stok-grid', 'stok', true, 'Stok Akun', 100);
    loadDataStream(null, 'katalog-topup-grid', 'topup', true, 'Topup Item', 50);
    
    // 5. JALANKAN ANIMASI SCROLL
    initScrollReveal();

    // 6. SIDEBAR MENU LOGIC
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if(menuBtn && closeBtn && overlay) {
        menuBtn.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        sidebarLinks.forEach(link => link.addEventListener('click', toggleSidebar));
    }
});

// FUNGSI UBAH TEMA (DARK/LIGHT MODE)
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    if(document.body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// FUNGSI GANTI BAHASA AUTO TRANSLATE
function changeLang(googleCode, langText, btnElement, flagCode) {
    document.getElementById('currentFlag').src = `https://flagcdn.com/w20/${flagCode}.png`;
    document.getElementById('currentLang').innerText = langText;
    
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    function triggerTranslate() {
        let selectField = document.querySelector(".goog-te-combo");
        if (selectField) {
            selectField.value = googleCode;
            selectField.dispatchEvent(new Event("change"));
        }
    }
    triggerTranslate();
    setTimeout(triggerTranslate, 500); 

    closeModal('langModal');
}

// SISTEM SMART SCANNER PROGRESSIVE/STREAMING (Bebas Lag & Muncul Seketika)
function loadDataStream(previewId, fullId, folderName, isKatalog, waType, maxCheck) {
    const preview = document.getElementById(previewId);
    const full = document.getElementById(fullId);
    
    // Tampilkan Loading Spinner Besar
    if (preview && !isKatalog) {
        preview.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 1.5rem;"></i></div>`;
    }
    if (full) {
        full.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 2rem;"></i><p class="text-muted" style="margin-top: 15px; font-size: 0.9rem;">Memuat Data...</p></div>`;
    }

    let validItems = [];
    let pendingChecks = maxCheck;

    // Lakukan pencarian dari angka terbesar secara paralel
    for (let i = maxCheck; i >= 1; i--) {
        checkImg(i).then(src => {
            pendingChecks--;
            if (src) {
                validItems.push({ id: i, src: src });
                // Urutkan otomatis setiap kali ada foto baru ditemukan
                validItems.sort((a, b) => b.id - a.id);
                // Render Ulang secara instan (Streaming)
                renderDOM();
            } else if (pendingChecks === 0 && validItems.length === 0) {
                // Jika semua dicek dan 100% kosong
                renderEmpty();
            }
        });
    }

    function checkImg(i) {
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve(img.src);
            img.onerror = () => {
                let imgPng = new Image();
                imgPng.onload = () => resolve(imgPng.src);
                imgPng.onerror = () => resolve(null);
                imgPng.src = `static/img/${isKatalog ? 'katalog' : 'testimoni'}/${folderName}/${i}.png`;
            };
            img.src = `static/img/${isKatalog ? 'katalog' : 'testimoni'}/${folderName}/${i}.jpg`;
        });
    }

    function renderDOM() {
        let fullHTML = '';
        let previewHTML = '';

        validItems.forEach((item, index) => {
            if (isKatalog) {
                const msg = encodeURIComponent(`Halo Admin Dileppp, saya tertarik dengan [${waType}] yang ada di Katalog Web (Gambar No. ${item.id}). Apakah masih tersedia?`);
                fullHTML += `
                <div class="katalog-item-card">
                    <div class="katalog-img-box"><img src="${item.src}" loading="lazy"></div>
                    <div class="katalog-action">
                        <a href="https://wa.me/6285266953530?text=${msg}" target="_blank" class="btn-primary" style="width: 100%; padding: 10px; font-size: 0.85rem;"><i class="fa-brands fa-whatsapp"></i> Tanyakan Admin</a>
                    </div>
                </div>`;
            } else {
                const testiHTML = `<div class="testi-item"><img src="${item.src}" loading="lazy"></div>`;
                fullHTML += testiHTML;
                // Hanya 4 Foto untuk Preview Beranda
                if (index < 4) previewHTML += testiHTML;
            }
        });

        if (full) full.innerHTML = fullHTML;
        if (preview && !isKatalog) preview.innerHTML = previewHTML;
    }

    function renderEmpty() {
        let emptyHTML = '';
        if(isKatalog) {
            emptyHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 30px 10px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);"><i class="fa-solid fa-box-open text-muted" style="font-size: 3rem; margin-bottom: 15px;"></i><h4 style="color: var(--putih); margin-bottom: 5px;">Stok Belum Tersedia</h4><p class="text-muted" style="font-size:0.9rem;">Saat ini belum ada ${waType} yang dipublikasikan. Silakan hubungi admin.</p></div>`;
        } else {
            emptyHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 20px;"><p class="text-muted" style="font-size:0.85rem;">Belum ada testimoni.</p></div>`;
        }
        if (full) full.innerHTML = emptyHTML;
        if (preview && !isKatalog) preview.innerHTML = emptyHTML;
    }
}

// FUNGSI BUKA TUTUP MODAL
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) { modal.style.display = "none"; }
    });
}

// FUNGSI SCROLL REVEAL OPTIMAL
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { 
                entry.target.classList.add('active'); 
                obs.unobserve(entry.target); 
            } 
        });
    }, { root: null, threshold: 0.05 }); 
    
    reveals.forEach(reveal => observer.observe(reveal));
}
