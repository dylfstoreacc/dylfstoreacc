// INISIALISASI GOOGLE TRANSLATE (Tersembunyi)
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ms',
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const themeIcon = document.getElementById('themeIcon');
        if(themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
    }

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

    new Swiper('.hero-carousel-container', { speed: 800, autoplay: { delay: 3000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, loop: true });

    // MULAI LOAD DATA PROGRESSIVE INSTAN (Streaming tanpa lag)
    setTimeout(() => {
        loadDataStreamProgressive('preview-testi-stok', 'full-testi-stok', 'stok', false, '');
        loadDataStreamProgressive('preview-testi-rekber', 'full-testi-rekber', 'rekber', false, '');
        loadDataStreamProgressive('preview-testi-topup', 'full-testi-topup', 'topup', false, '');
        loadDataStreamProgressive('preview-testi-convert', 'full-testi-convert', 'convert', false, '');

        loadDataStreamProgressive(null, 'katalog-stok-grid', 'stok', true, 'Stok Akun');
        loadDataStreamProgressive(null, 'katalog-topup-grid', 'topup', true, 'Topup Item');
    }, 500);
    
    initScrollReveal();

    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function toggleSidebar() { sidebar.classList.toggle('active'); overlay.classList.toggle('active'); }

    if(menuBtn && closeBtn && overlay) {
        menuBtn.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
        sidebarLinks.forEach(link => link.addEventListener('click', toggleSidebar));
    }
});

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    if(document.body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// FUNGSI GANTI BAHASA AUTO TRANSLATE (Dipercepat Secara Paksa)
function changeLang(googleCode, langText, btnElement, flagCode) {
    document.getElementById('currentFlag').src = `https://flagcdn.com/w20/${flagCode}.png`;
    document.getElementById('currentLang').innerText = langText;
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    function triggerTranslate() {
        let selectField = document.querySelector(".goog-te-combo");
        if (selectField && selectField.value !== googleCode) { 
            selectField.value = googleCode; 
            selectField.dispatchEvent(new Event("change")); 
        }
    }
    
    // Tembak beberapa kali dalam hitungan milidetik agar sangat responsif
    triggerTranslate();
    setTimeout(triggerTranslate, 100); 
    setTimeout(triggerTranslate, 300); 
    setTimeout(triggerTranslate, 600); 
    
    closeModal('langModal');
}

window.zoomImage = function(src) {
    document.getElementById('zoomedImageSrc').src = src;
    openModal('imageZoomModal');
}

// SISTEM SMART SCANNER PROGRESSIVE (STREAMING SECEPAT KILAT BEBAS LAG)
async function loadDataStreamProgressive(previewId, fullId, folderName, isKatalog, waType) {
    const preview = document.getElementById(previewId);
    const full = document.getElementById(fullId);
    
    // Set wadah rendering dan Spinner di awal
    if (preview && !isKatalog) {
        preview.innerHTML = `<div id="content-${previewId}" style="display:contents;"></div><div id="spinner-${previewId}" style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 1.5rem;"></i></div>`;
    }
    if (full) {
        full.innerHTML = `<div id="content-${fullId}" style="display:contents;"></div><div id="spinner-${fullId}" style="grid-column: 1/-1; text-align: center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 2rem;"></i><p class="text-muted" style="margin-top: 15px; font-size: 0.9rem;">Memuat Data...</p></div>`;
    }

    const contentFull = document.getElementById(`content-${fullId}`);
    const contentPreview = preview ? document.getElementById(`content-${previewId}`) : null;
    const spinnerFull = document.getElementById(`spinner-${fullId}`);
    const spinnerPreview = preview ? document.getElementById(`spinner-${previewId}`) : null;

    let consecutiveEmpty = 0;
    let i = 1;
    let foundAny = false;
    const batchSize = 5; // Tarik per 5 gambar agar HP tidak memanas dan langsung nampil

    // Lacak terus sampai ketemu 5 angka kosong (tidak ada foto) berturut-turut
    while (consecutiveEmpty < 5 && i <= 500) {
        let promises = [];
        for (let j = 0; j < batchSize; j++) {
            promises.push(checkImg(i + j));
        }
        
        let results = await Promise.all(promises);
        
        for (let res of results) {
            if (res) {
                consecutiveEmpty = 0;
                foundAny = true;
                
                // RENDER LANGSUNG KE LAYAR (Streaming)
                if (isKatalog) {
                    const msg = encodeURIComponent(`Halo Admin Dileppp, saya tertarik dengan [${waType}] yang ada di Katalog Web (Gambar No. ${res.id}). Apakah masih tersedia?`);
                    const cardId = `katalog-card-${folderName}-${res.id}`;
                    
                    const html = `
                    <div class="katalog-item-card" id="${cardId}">
                        <div class="katalog-img-box" onclick="zoomImage('${res.src}')" style="cursor: zoom-in;" title="Klik untuk perbesar">
                            <img src="${res.src}" loading="lazy">
                            <div class="zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
                        </div>
                        <div class="katalog-desc" id="${cardId}-desc">
                            <i class="fa-solid fa-spinner fa-spin text-cyan"></i> Memuat keterangan...
                        </div>
                        <div class="katalog-action">
                            <a href="https://wa.me/6285266953530?text=${msg}" target="_blank" class="btn-primary" style="width: 100%; padding: 10px; font-size: 0.85rem;"><i class="fa-brands fa-whatsapp"></i> Tanyakan Admin</a>
                        </div>
                    </div>`;
                    
                    if (contentFull) contentFull.insertAdjacentHTML('afterbegin', html); // Tampilkan di paling atas
                    
                    // Ambil teks deskripsi harga
                    fetch(`static/img/katalog/${folderName}/${res.id}.txt`)
                        .then(r => { if(r.ok) return r.text(); throw new Error('No desc'); })
                        .then(text => {
                            let formattedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
                            let descEl = document.getElementById(`${cardId}-desc`);
                            if(descEl) descEl.innerHTML = `<div style="color: var(--putih);">${formattedText}</div>`;
                        })
                        .catch(() => {
                            let descEl = document.getElementById(`${cardId}-desc`);
                            if(descEl) descEl.innerHTML = `<span style="font-size:0.85rem; font-style:italic;">Detail spesifikasi & harga silakan tanyakan langsung ke admin.</span>`;
                        });

                } else {
                    const html = `<div class="testi-item"><img src="${res.src}" loading="lazy"></div>`;
                    if (contentFull) contentFull.insertAdjacentHTML('afterbegin', html);
                    if (contentPreview) {
                        contentPreview.insertAdjacentHTML('afterbegin', html);
                        if (contentPreview.children.length > 4) {
                            contentPreview.lastElementChild.remove(); // Jaga agar beranda maksimal cuma 4 foto
                        }
                    }
                }
            } else {
                consecutiveEmpty++;
                if(consecutiveEmpty >= 5) break;
            }
        }
        i += batchSize;
    }

    // Tugas Selesai, matikan spinner
    if (spinnerFull) spinnerFull.remove();
    if (spinnerPreview) spinnerPreview.remove();

    // Jika tidak ada foto sama sekali di folder GitHub Abang
    if (!foundAny) {
        const emptyHTML = isKatalog 
            ? `<div style="grid-column: 1/-1; text-align:center; padding: 30px 10px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);"><i class="fa-solid fa-box-open text-muted" style="font-size: 3rem; margin-bottom: 15px;"></i><h4 style="color: var(--putih); margin-bottom: 5px;">Stok Belum Tersedia</h4><p class="text-muted" style="font-size:0.9rem;">Saat ini belum ada ${waType} yang dipublikasikan.</p></div>`
            : `<div style="grid-column: 1/-1; text-align:center; padding: 20px;"><p class="text-muted" style="font-size:0.85rem;">Belum ada testimoni.</p></div>`;
        if (contentFull) contentFull.innerHTML = emptyHTML;
        if (contentPreview && !isKatalog) contentPreview.innerHTML = emptyHTML;
    }

    // Fungsi Lacak Gambar
    function checkImg(id) {
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve({ id: id, src: img.src });
            img.onerror = () => {
                let imgPng = new Image();
                imgPng.onload = () => resolve({ id: id, src: imgPng.src });
                imgPng.onerror = () => resolve(null);
                imgPng.src = `static/img/${isKatalog ? 'katalog' : 'testimoni'}/${folderName}/${id}.png`;
            };
            img.src = `static/img/${isKatalog ? 'katalog' : 'testimoni'}/${folderName}/${id}.jpg`;
        });
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

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { entry.target.classList.add('active'); obs.unobserve(entry.target); } 
        });
    }, { root: null, threshold: 0.05 }); 
    reveals.forEach(reveal => observer.observe(reveal));
}
