document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. PRELOADER ANIMATION (3 DETIK KUNCI)
    // ==========================================
    const welcomeTextContainer = document.getElementById("welcomeText");
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
        preloader.style.opacity = "0";
        setTimeout(() => { preloader.style.visibility = "hidden"; }, 800);
    }, 3000); 

    // ==========================================
    // 2. CAROUSEL SWIPER 3D
    // ==========================================
    const swiper = new Swiper('.hero-carousel-container', {
        effect: 'creative', speed: 1200, grabCursor: true, 
        creativeEffect: {
            prev: { shadow: true, translate: ['-30%', 0, -1], scale: 0.85, opacity: 0 },
            next: { translate: ['100%', 0, 0], opacity: 1 },
        },
        autoplay: { delay: 3500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true }, loop: true 
    });

    // ==========================================
    // 3. INIT TESTIMONI & SCROLL REVEAL
    // ==========================================
    loadTestimonialsAuto('container-testi-stok', 'stok', 500);
    loadTestimonialsAuto('container-testi-rekber', 'rekber', 500);
    initScrollReveal();
});

// LOGIKA AUTO-LOOP TESTIMONI (ASCENDING)
function loadTestimonialsAuto(containerId, folderName, maxFiles) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    for (let i = 1; i <= maxFiles; i++) {
        const item = document.createElement("div");
        item.className = "testi-item"; 
        item.innerHTML = `<img src="static/img/testimoni/${folderName}/${i}.jpg" onerror="this.onerror=null; this.src='static/img/testimoni/${folderName}/${i}.png'; this.onerror=function(){ this.parentElement.remove(); }">`;
        container.prepend(item);
    }
}

// LOGIKA MODAL POP-UP
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(event) {
    const modal = document.getElementById('aboutStoreModal');
    if (event.target === modal) { modal.style.display = "none"; }
}

// LOGIKA EXPAND/TUTUP TESTIMONI
function toggleTesti(containerId, btnId) {
    const container = document.getElementById(containerId);
    const btn = document.getElementById(btnId);
    
    if (container.classList.contains('show-all')) {
        container.classList.remove('show-all');
        btn.innerHTML = `<i class="fa-solid fa-angle-down"></i> Tampilkan Seluruh Testi`;
        document.getElementById("testimoni").scrollIntoView({ behavior: 'smooth' });
    } else {
        container.classList.add('show-all');
        btn.innerHTML = `<i class="fa-solid fa-angle-up"></i> Tutup Testi`;
    }
}

// FIX: LOGIKA SCROLL REVEAL ANIMATION (Mulus & Anti-Hilang)
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { 
                entry.target.classList.add('active'); 
                obs.unobserve(entry.target); // KUNCI: Begitu muncul, jangan diobserve lagi agar tak hilang
            } 
        });
    }, { threshold: 0.02, rootMargin: "0px 0px -20px 0px" });
    
    reveals.forEach(reveal => { observer.observe(reveal); });

    // Pengaman: Jika HP nyangkut saat di-scroll, otomatis munculkan semua setelah 1,5 detik
    setTimeout(() => {
        reveals.forEach(reveal => reveal.classList.add('active'));
    }, 1500);
}

// LOGIKA KIRIM ULASAN KE WA ADMIN
function sendReviewToAdmin() {
    const name = document.getElementById("reviewName").value;
    const rating = document.getElementById("reviewRating").value;
    const text = document.getElementById("reviewText").value;

    if (!name || !text) { alert("Harap isi Nama dan Ulasan Anda terlebih dahulu!"); return; }

    const adminWA = "6285266953530"; 
    const message = `Halo Admin Dileppp,%0A%0ASaya ingin mengirimkan ulasan untuk DYLF STOREacc:%0A%0A*Nama:* ${name}%0A*Rating:* ${rating} Bintang%0A*Ulasan:* "${text}"%0A%0AMohon ditinjau untuk ditampilkan di website ya!`;
    window.open(`https://wa.me/${adminWA}?text=${message}`, "_blank");

    document.getElementById("reviewName").value = "";
    document.getElementById("reviewRating").value = "5";
    document.getElementById("reviewText").value = "";
    alert("Terima kasih! Ulasan Anda telah diteruskan ke Admin untuk peninjauan.");
}
