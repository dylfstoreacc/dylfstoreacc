function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ms',
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. INIT THEME
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const themeIcon = document.getElementById('themeIcon');
        if(themeIcon) { themeIcon.classList.replace('fa-moon', 'fa-sun'); }
    }

    // 2. PRELOADER ANIMASI
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
                setTimeout(() => { preloader.remove(); }, 500); // Hapus total dari memori agar ringan
            }
        }, 2500); 
    }

    // 3. SWIPER CAROUSEL
    const swiper = new Swiper('.hero-carousel-container', {
        effect: 'fade', speed: 800, autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true }, loop: true 
    });

    // 4. BATCHED SCANNER (Loading Cerdas Tanpa Memberatkan Jaringan)
    // Cukup set angka tertinggi perkiraan stok, script akan melompat dan menarik secara otomatis
    loadBatchedImages('preview-testi-stok', 'full-testi-stok', 'stok', false, '', 150);
    loadBatchedImages('preview-testi-rekber', 'full-testi-rekber', 'rekber', false, '', 100);
    loadBatchedImages('preview-testi-topup', 'full-testi-topup', 'topup', false, '', 50);
    loadBatchedImages('preview-testi-convert', 'full-testi-convert', 'convert', false, '', 50);

    loadBatchedImages(null, 'katalog-stok-grid', 'stok', true, 'Stok Akun', 100);
    loadBatchedImages(null, 'katalog-topup-grid', 'topup', true, 'Topup Item', 50);
    
    // 5. ANIMASI SCROLL
    initScrollReveal();

    // 6. SIDEBAR LOGIC
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if(menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        sidebarLinks.forEach(link => link.addEventListener('click', toggleSidebar));
    }
});

// FUNGSI TEMA
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    if(document.body.classList.contains('light-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// FUNGSI GANTI BAHASA
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

// BATCHED IMAGE SCANNER (Sistem anti-lag jaringan: Mengecek 10 gambar sekaligus lalu berhenti jika kosong)
async function loadBatchedImages(previewId, fullId, folderName, isKatalog, waType, startMax) {
    const preview = document.getElementById(previewId);
    const full = document.getElementById(fullId);
    
    if (preview && !isKatalog) {
        preview.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 1.5rem;"></i></div>`;
    }
    if (full) {
        full.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 2rem;"></i><p class="text-muted" style="margin-top: 15px; font-size: 0.9rem;">Memuat Data...</p></div>`;
    }

    let validItems = [];
    let consecutiveEmpty = 0;
    let batchSize = 10;
    let currentId = 1;
    let keepScanning = true;

    // Memindai secara progresif dari 1 sampai batas agar jaringan tidak overload
    while(keepScanning && currentId <= startMax) {
        let promises = [];
        let batchStart = currentId;
        
        for(let b = 0; b < batchSize; b++) {
            promises.push(checkImg(batchStart + b, folderName, isKatalog));
        }

        let results = await Promise.all(promises);
        let batchHasFound = false;

        results.forEach((src, index) => {
            if (src) {
                validItems.push({id: batchStart + index, src: src});
                batchHasFound = true;
                consecutiveEmpty = 0; // Reset
            } else {
                consecutiveEmpty++;
            }
        });

        if (consecutiveEmpty >= 5) {
            keepScanning = false; // Stop pencarian jika 5x berturut-turut kosong
        }
        currentId += batchSize;
    }

    // Urutkan dari angka terbesar ke terkecil
    validItems.sort((a, b) => b.id - a.id);

    renderDOM();

    function checkImg(i, folder, katalogFlag) {
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve(img.src);
            img.onerror = () => {
                let imgPng = new Image();
                imgPng.onload = () => resolve(imgPng.src);
                imgPng.onerror = () => resolve(null);
                imgPng.src = `static/img/${katalogFlag ? 'katalog' : 'testimoni'}/${folder}/${i}.png`;
            };
            img.src = `static/img/${katalogFlag ? 'katalog' : 'testimoni'}/${folder}/${i}.jpg`;
        });
    }

    function renderDOM() {
        let fullHTML = '';
        let previewHTML = '';

        if(validItems.length === 0) {
            if(isKatalog) {
                fullHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 30px 10px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);"><i class="fa-solid fa-box-open text-muted" style="font-size: 3rem; margin-bottom: 15px;"></i><h4 style="color: var(--putih); margin-bottom: 5px;">Stok Belum Tersedia</h4><p class="text-muted" style="font-size:0.9rem;">Saat ini belum ada ${waType} yang dipublikasikan. Silakan hubungi admin.</p></div>`;
            } else {
                fullHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 20px;"><p class="text-muted" style="font-size:0.85rem;">Belum ada testimoni.</p></div>`;
            }
            if (full) full.innerHTML = fullHTML;
            if (preview && !isKatalog) preview.innerHTML = fullHTML;
            return;
        }

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
                if (index < 4) previewHTML += testiHTML;
            }
        });

        if (full) full.innerHTML = fullHTML;
        if (preview && !isKatalog) preview.innerHTML = previewHTML;
    }
}

// MODAL CONTROLLER
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) { modal.style.display = "none"; }
    });
}

// SCROLL REVEAL (Anti-Layer Explosion)
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
