// Tailwind configuration
window.tailwind = window.tailwind || {};
tailwind.config = {
    theme: {
        extend: {
            colors: {
                midnight: '#050b14',
                navyDeep: '#0f172a',
                slateNavy: '#1e293b',
                softBlue: '#172554',
                iceBlue: '#38bdf8',
                warmIce: '#7dd3fc',
                paperBlue: '#1c2d42',
                accentGold: '#38bdf8'
            },
            fontFamily: {
                handwriting: ['Caveat', 'cursive'],
                playful: ['Fredoka', 'sans-serif'],
                body: ['Nunito', 'sans-serif']
            },
            animation: {
                'float': 'float 4s ease-in-out infinite',
                'wiggle': 'wiggle 2s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(2deg)' }
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' }
                }
            }
        }
    }
};

// -----------------------------------------------------------------
// MUSIC / SOUND SECTION
// -----------------------------------------------------------------
let audioCtx = null; // Used by the small balloon pop sound
let isPlaying = false;

// Place the MP3 file inside an "assets" folder and name it "dear.mp3".
const backgroundMusic = new Audio('assets/dear.mp3');
backgroundMusic.loop = true;
backgroundMusic.preload = 'auto';

function toggleMusic() {
    const musicText = document.getElementById('musicText');
    const musicIcon = document.getElementById('musicIcon');

    if (isPlaying) {
        backgroundMusic.pause();
        isPlaying = false;
        musicText.innerText = 'Play Music';
        musicIcon.className = 'fi fi-rr-music-alt text-sm flex items-center';
    } else {
        backgroundMusic.play()
            .then(() => {
                isPlaying = true;
                musicText.innerText = 'Pause Music';
                musicIcon.className = 'fi fi-rr-pause text-sm flex items-center';
            })
            .catch(error => {
                console.error('Unable to play music:', error);
                musicText.innerText = 'Play Music';
                alert('Music could not be played. Check that assets/dear.mp3 exists.');
            });
    }
}

function playPopSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// -----------------------------------------------------------------
// 2. Animated Envelope Logic
// -----------------------------------------------------------------
function openEnvelope() {
    const env = document.getElementById('scrapbookEnvelope');
    if (!env.classList.contains('open')) {
        env.classList.add('open');
        setTimeout(fitEnvelope, 60);
        triggerConfetti();
    }
}

// -----------------------------------------------------------------
// 3. Draggable Sticker Engine
// -----------------------------------------------------------------
function toggleStickerMenu() {
    const drawer = document.getElementById('stickerDrawer');
    drawer.classList.toggle('hidden');
}

function spawnSticker(content) {
    const canvas = document.getElementById('stickerCanvas');
    const sticker = document.createElement('div');
    sticker.className = 'draggable-sticker text-4xl select-none pointer-events-auto flex items-center group';
    
    const x = Math.random() * (window.innerWidth - 100) + 20;
    const y = Math.random() * (window.innerHeight - 200) + 100;
    sticker.style.left = `${x}px`;
    sticker.style.top = `${y}px`;

    sticker.innerHTML = `
        <div class="sticker-content">${content}</div>
        <button onclick="this.parentElement.remove()" class="hidden group-hover:flex items-center justify-center ml-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs shadow hover:bg-red-700">
            <i class="fi fi-rr-cross text-[10px]"></i>
        </button>
    `;

    canvas.appendChild(sticker);
    makeDraggable(sticker);
    triggerConfetti();
}

function spawnGifSticker(gifUrl) {
    const canvas = document.getElementById('stickerCanvas');
    const sticker = document.createElement('div');
    sticker.className = 'draggable-sticker select-none pointer-events-auto flex items-center group';
    
    const x = Math.random() * (window.innerWidth - 150) + 20;
    const y = Math.random() * (window.innerHeight - 250) + 100;
    sticker.style.left = `${x}px`;
    sticker.style.top = `${y}px`;

    sticker.innerHTML = `
        <img src="${gifUrl}" class="w-24 h-24 object-contain pointer-events-none" alt="GIF Sticker">
        <button onclick="this.parentElement.remove()" class="hidden group-hover:flex items-center justify-center ml-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs shadow hover:bg-red-700">
            <i class="fi fi-rr-cross text-[10px]"></i>
        </button>
    `;

    canvas.appendChild(sticker);
    makeDraggable(sticker);
}

function clearAllStickers() {
    document.getElementById('stickerCanvas').innerHTML = '';
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function dragTouchStart(e) {
        const touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeTouchElement;
        document.ontouchmove = elementTouchDrag;
    }

    function elementTouchDrag(e) {
        const touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }

    function closeTouchElement() {
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

// -----------------------------------------------------------------
// 4. Tab Navigation System
// -----------------------------------------------------------------
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-iceBlue', 'text-navyDeep', 'shadow-md');
        btn.classList.add('text-warmIce');
    });

    const targetSec = document.getElementById('sec-' + tabName);
    const targetBtn = document.getElementById('tab-' + tabName);

    if (targetSec && targetBtn) {
        targetSec.classList.remove('hidden');
        targetSec.classList.add('block');
        targetBtn.classList.add('bg-iceBlue', 'text-navyDeep', 'shadow-md');
        targetBtn.classList.remove('text-warmIce');
        if (tabName === 'letter') requestAnimationFrame(fitEnvelope);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function startExperience() {
    if (!isPlaying) toggleMusic();
    triggerConfetti();
    switchTab('letter');
    setTimeout(openEnvelope, 400);
}

// -----------------------------------------------------------------
// 5. Countdown Timer
// -----------------------------------------------------------------
// CHANGE THIS: set a specific birthday date/time here if you want the countdown to lock until a date.
// Example: const BIRTHDAY_DATE = '2026-12-25T00:00:00';
// Leave it empty to unlock immediately.
const BIRTHDAY_DATE = '';

function getTarget() {
    if (BIRTHDAY_DATE) { const t = new Date(BIRTHDAY_DATE); if (!isNaN(t)) return t; }
    const t = new Date(); t.setHours(23, 59, 59, 999); return t;
}
function isLocked() {
    const t = BIRTHDAY_DATE ? new Date(BIRTHDAY_DATE) : null;
    return !!t && !isNaN(t) && t - new Date() > 0;
}
let wasLocked = null;
function updateCountdown() {
    const diff = Math.max(0, getTarget() - new Date());
    const vals = { days: Math.floor(diff / 864e5), hours: Math.floor(diff / 36e5) % 24, mins: Math.floor(diff / 6e4) % 60, secs: Math.floor(diff / 1e3) % 60 };
    ['wc', 'hc', 'cd'].forEach(p => Object.keys(vals).forEach(k => {
        const el = document.getElementById(p + '-' + k);
        if (el) el.innerText = String(vals[k]).padStart(2, '0');
    }));

    const locked = isLocked();
    const btn = document.getElementById('start-btn');
    if (btn) btn.disabled = locked;
    document.getElementById('start-btn-icon').className = locked ? 'fi fi-sr-lock' : 'fi fi-sr-play';
    document.getElementById('start-btn-text').innerText = locked ? 'Locked until the big day' : 'Open Surprise & Play Music';
    document.getElementById('welcome-countdown').style.display = locked ? '' : 'none';
    document.getElementById('countdown-status-msg').innerText = locked
        ? '⏳ Counting down to your special moment...'
        : '🎉 It\'s your special day! Enjoy every moment.';
    if (wasLocked === true && !locked) triggerConfettiSequence();
    wasLocked = locked;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Welcome screen, tab shortcuts & small UX helpers
function enterSite() {
    if (isLocked()) return;
    const w = document.getElementById('welcome-screen');
    w.classList.add('hide');
    document.body.style.overflow = '';
    if (!isPlaying) toggleMusic();
    triggerConfettiSequence();
    setTimeout(() => { w.style.display = 'none'; }, 800);
}
document.body.style.overflow = 'hidden';
document.getElementById('start-btn').addEventListener('click', enterSite);
document.querySelectorAll('.nav-trigger').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.target.replace('-page', ''))));
document.getElementById('wishInput').addEventListener('keydown', e => { if (e.key === 'Enter') addWish(); });

// Keeps the opened letter from covering the heading above it
function fitEnvelope() {
    const env = document.getElementById('scrapbookEnvelope');
    const letter = document.getElementById('envelopeLetter');
    if (!env || !letter) return;
    env.style.marginTop = env.classList.contains('open') && letter.offsetHeight ? Math.max(0, letter.offsetHeight - 85) + 'px' : '0px';
}
window.addEventListener('resize', fitEnvelope);

// -----------------------------------------------------------------
// 6. Secret Letter Accordion
// -----------------------------------------------------------------
function toggleSecretWish(event) {
    if(event) event.stopPropagation();
    const box = document.getElementById('secretWishBox');
    const chevron = document.getElementById('secretChevron');
    if (box.classList.contains('hidden')) {
        box.classList.remove('hidden');
        chevron.className = 'fi fi-rr-angle-small-up text-lg';
        triggerConfetti();
    } else {
        box.classList.add('hidden');
        chevron.className = 'fi fi-rr-angle-small-down text-lg';
    }
}

// -----------------------------------------------------------------
// 7. Interactive Balloon & Wish Wall
// -----------------------------------------------------------------
function popBalloon(btn, text) {
    playPopSound();
    triggerConfetti();
    btn.innerHTML = `<span class="text-xl font-handwriting font-bold bg-iceBlue text-navyDeep px-3 py-1.5 rounded-xl border border-navyDeep shadow-lg animate-pulse">${text}</span>`;
    btn.onclick = null;
    btn.classList.remove('animate-bounce');
}

function resetBalloons() {
    const container = document.getElementById('balloon-container');
    container.innerHTML = `
        <button onclick="popBalloon(this, '💖 Pure Joy!')" class="balloon-btn text-5xl sm:text-6xl hover:scale-125 transition-transform animate-bounce text-iceBlue flex items-center justify-center"><i class="fi fi-sr-balloon"></i></button>
        <button onclick="popBalloon(this, '🌟 Good Health!')" class="balloon-btn text-5xl sm:text-6xl hover:scale-125 transition-transform animate-bounce text-warmIce flex items-center justify-center" style="animation-delay: 0.2s;"><i class="fi fi-sr-balloon"></i></button>
        <button onclick="popBalloon(this, '🚀 Big Dreams!')" class="balloon-btn text-5xl sm:text-6xl hover:scale-125 transition-transform animate-bounce text-cyan-400 flex items-center justify-center" style="animation-delay: 0.4s;"><i class="fi fi-sr-balloon"></i></button>
        <button onclick="popBalloon(this, '🍰 Endless Cake!')" class="balloon-btn text-5xl sm:text-6xl hover:scale-125 transition-transform animate-bounce text-blue-300 flex items-center justify-center" style="animation-delay: 0.6s;"><i class="fi fi-sr-balloon"></i></button>
        <button onclick="popBalloon(this, '💙 Endless Love!')" class="balloon-btn text-5xl sm:text-6xl hover:scale-125 transition-transform animate-bounce text-iceBlue flex items-center justify-center" style="animation-delay: 0.8s;"><i class="fi fi-sr-balloon"></i></button>
    `;
}

function addWish() {
    const input = document.getElementById('wishInput');
    const text = input.value.trim();
    if (!text) return;

    const grid = document.getElementById('wishes-grid');
    const bgColors = ['bg-slateNavy border-iceBlue/50', 'bg-softBlue border-iceBlue/50', 'bg-navyDeep border-iceBlue/60'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
    const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

    const note = document.createElement('div');
    note.className = `${randomBg} border-2 border-dashed p-4 rounded-xl shadow transform ${randomRot} relative font-handwriting text-2xl text-warmIce transition-all hover:scale-105`;
    note.innerHTML = '<span class="absolute -top-3 left-1/2 -translate-x-1/2 text-iceBlue text-base flex items-center"><i class="fi fi-sr-marker"></i></span>';
    note.appendChild(document.createTextNode('"' + text + '"'));

    grid.prepend(note);
    input.value = '';
    triggerConfetti();
}

// -----------------------------------------------------------------
// 8. Confetti Animations
// -----------------------------------------------------------------
function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#38bdf8', '#7dd3fc', '#ffffff', '#1e293b']
        });
    }
}

function triggerConfettiSequence() {
    if (typeof confetti === 'function') {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#38bdf8', '#7dd3fc', '#ffffff'] });
            confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#38bdf8', '#7dd3fc', '#ffffff'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    }
}
