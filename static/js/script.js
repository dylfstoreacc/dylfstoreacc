// INISIALISASI GOOGLE TRANSLATE (Tersembunyi)
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'id',
        includedLanguages: 'id,en,ms',
        autoDisplay: false
    }, 'google_translate_element');
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. PRELOADER ANIMASI TEKS KEMBALI
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

    // 3. LOAD DATA TESTIMONI (Preview 4 + Modal Full)
    loadTestimonialPopups('preview-testi-stok', 'full-testi-stok', 'stok', 12); // Max Files sesuaikan (contoh: 12)
    loadTestimonialPopups('preview-testi-rekber', 'full-testi-rekber', 'rekber', 12);
    loadTestimonialPopups('preview-testi-topup', 'full-testi-topup', 'topup', 12);
    loadTestimonialPopups('preview-testi-convert', 'full-testi-convert', 'convert', 12);
    
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

// FUNGSI TESTIMONI POPUP
function loadTestimonialPopups(previewId, fullId, folderName, maxFiles) {
    const previewContainer = document.getElementById(previewId);
    const fullContainer = document.getElementById(fullId);
    if(!previewContainer || !fullContainer) return;
    
    previewContainer.innerHTML = "";
    fullContainer.innerHTML = "";
    
    for (let i = 1; i <= maxFiles; i++) {
        const itemHTML = `<div class="testi-item"><img src="static/img/testimoni/${folderName}/${i}.jpg" loading="lazy" onerror="this.src='https://via.placeholder.com/150/1F2937/06B6D4?text=Testi+${i}';"></div>`;
        
        // Modal Full: Seluruh foto masuk
        fullContainer.insertAdjacentHTML('afterbegin', itemHTML);
        
        // Home Preview: HANYA 4 Foto terbaru yang masuk
        if(i > maxFiles - 4) {
            previewContainer.insertAdjacentHTML('afterbegin', itemHTML);
        }
    }
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
