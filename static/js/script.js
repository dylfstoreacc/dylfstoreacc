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

    // 4. LOAD DATA TESTIMONI SMART SCANNER
    loadTestimonialsDynamic('preview-testi-stok', 'full-testi-stok', 'stok');
    loadTestimonialsDynamic('preview-testi-rekber', 'full-testi-rekber', 'rekber');
    loadTestimonialsDynamic('preview-testi-topup', 'full-testi-topup', 'topup');
    loadTestimonialsDynamic('preview-testi-convert', 'full-testi-convert', 'convert');
    
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

// FUNGSI GANTI BAHASA AUTO TRANSLATE (Pasti Berfungsi)
function changeLang(googleCode, langText, btnElement, flagCode) {
    document.getElementById('currentFlag').src = `https://flagcdn.com/w20/${flagCode}.png`;
    document.getElementById('currentLang').innerText = langText;
    
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    // Trigger Google Translate dengan aman
    function triggerTranslate() {
        let selectField = document.querySelector(".goog-te-combo");
        if (selectField) {
            selectField.value = googleCode;
            selectField.dispatchEvent(new Event("change"));
        }
    }
    
    triggerTranslate();
    // Beri jeda 1 detik jika widget Google belum sepenuhnya dimuat (Fallback aman)
    setTimeout(triggerTranslate, 1000); 

    closeModal('langModal');
}

// SISTEM SMART SCANNER TESTIMONI (Deteksi File Otomatis)
async function loadTestimonialsDynamic(previewId, fullId, folderName) {
    const previewContainer = document.getElementById(previewId);
    const fullContainer = document.getElementById(fullId);
    if(!previewContainer || !fullContainer) return;

    previewContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin text-cyan" style="font-size: 1.5rem;"></i></div>`;

    let validImages = [];
    let emptyCount = 0;
    let i = 1;

    while(emptyCount < 5 && i <= 600) { 
        let foundSrc = await new Promise((resolve) => {
            let img = new Image();
            img.onload = () => resolve(img.src);
            img.onerror = () => {
                let imgPng = new Image();
                imgPng.onload = () => resolve(imgPng.src);
                imgPng.onerror = () => resolve(null); 
                imgPng.src = `static/img/testimoni/${folderName}/${i}.png`;
            };
            img.src = `static/img/testimoni/${folderName}/${i}.jpg`;
        });

        if (foundSrc) {
            validImages.push(foundSrc);
            emptyCount = 0; 
        } else {
            emptyCount++; 
        }
        i++;
    }

    validImages.reverse();
    previewContainer.innerHTML = "";
    fullContainer.innerHTML = "";

    if(validImages.length === 0) {
        const emptyHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center; font-size:0.85rem;">Belum ada testimoni.</p>`;
        previewContainer.innerHTML = emptyHTML;
        fullContainer.innerHTML = emptyHTML;
        return;
    }

    validImages.forEach((src, index) => {
        const itemHTML = `<div class="testi-item"><img src="${src}" loading="lazy"></div>`;
        fullContainer.insertAdjacentHTML('beforeend', itemHTML);
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
