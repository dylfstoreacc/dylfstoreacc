// INISIALISASI GOOGLE TRANSLATE (Tersembunyi)
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ms',
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. PRELOADER ANIMASI TEKS
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

    // 2. SWIPER CAROUSEL
    const swiper = new Swiper('.hero-carousel-container', {
        effect: 'fade', speed: 800, autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true }, loop: true 
    });

    // 3. LOAD DATA TESTIMONI DENGAN SMART SCANNER
    // Anda TIDAK PERLU lagi mengubah angka maksimal secara manual. Sistem akan melacak sendiri!
    loadTestimonialsDynamic('preview-testi-stok', 'full-testi-stok', 'stok');
    loadTestimonialsDynamic('preview-testi-rekber', 'full-testi-rekber', 'rekber');
    loadTestimonialsDynamic('preview-testi-topup', 'full-testi-topup', 'topup');
    loadTestimonialsDynamic('preview-testi-convert', 'full-testi-convert', 'convert');
    
    // 4. JALANKAN ANIMASI SCROLL
    initScrollReveal();

    // 5. SIDEBAR MENU LOGIC
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

// FUNGSI GANTI BAHASA AUTO TRANSLATE
function changeLang(googleCode, langText, btnElement) {
    document.getElementById('currentFlag').src = `https://flagcdn.com/w20/${googleCode === 'en' ? 'gb' : googleCode}.png`;
    document.getElementById('currentLang').innerText = langText.toUpperCase();
    
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    let selectField = document.querySelector(".goog-te-combo");
    if (selectField) {
        selectField.value = googleCode;
        selectField.dispatchEvent(new Event("change"));
    }
    closeModal('langModal');
}

// SISTEM SMART SCANNER TESTIMONI (Otomatis Deteksi File Baru JPG/PNG)
async function loadTestimonialsDynamic(previewId, fullId, folderName) {
    const previewContainer = document.getElementById(previewId);
    const fullContainer = document.getElementById(fullId);
    if(!previewContainer || !fullContainer) return;

    // Menampilkan efek loading sementara
    previewContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 1.5rem;"></i><p class="text-muted" style="margin-top: 10px; font-size: 0.85rem;">Memuat Data Testimoni...</p></div>`;

    let validImages = [];
    let emptyCount = 0;
    let i = 1;

    // Sistem akan melacak angka terus menerus sampai menemukan 5 angka yang "kosong" (tidak ada file) berturut-turut
    while(emptyCount < 5 && i <= 600) { 
        let foundSrc = await new Promise((resolve) => {
            let img = new Image();
            img.onload = () => resolve(img.src);
            img.onerror = () => {
                // Jika JPG tidak ada, lacak otomatis versi PNG (seperti file convert 1.png milik Anda)
                let imgPng = new Image();
                imgPng.onload = () => resolve(imgPng.src);
                imgPng.onerror = () => resolve(null); // Jika keduanya tidak ada, laporkan kosong
                imgPng.src = `static/img/testimoni/${folderName}/${i}.png`;
            };
            img.src = `static/img/testimoni/${folderName}/${i}.jpg`;
        });

        if (foundSrc) {
            validImages.push(foundSrc);
            emptyCount = 0; // Reset hitungan kosong jika file ditemukan
        } else {
            emptyCount++; // Tambah hitungan jika file kosong
        }
        i++;
    }

    // Balik urutan: Paksa file dengan angka terbesar (terbaru) berada paling atas!
    validImages.reverse();

    previewContainer.innerHTML = "";
    fullContainer.innerHTML = "";

    // Jika folder ternyata benar-benar kosong
    if(validImages.length === 0) {
        const emptyHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center; font-size:0.85rem;">Belum ada testimoni.</p>`;
        previewContainer.innerHTML = emptyHTML;
        fullContainer.innerHTML = emptyHTML;
        return;
    }

    // Render file yang berhasil ditemukan
    validImages.forEach((src, index) => {
        const itemHTML = `<div class="testi-item"><img src="${src}" loading="lazy"></div>`;
        
        // Semua file masuk ke dalam Pop-up Full
        fullContainer.insertAdjacentHTML('beforeend', itemHTML);
        
        // HANYA 4 foto teratas yang dimasukkan ke layar beranda (Preview)
        if (index < 4) {
            previewContainer.insertAdjacentHTML('beforeend', itemHTML);
        }
    });
}

// FUNGSI BUKA TUTUP MODAL
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
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
