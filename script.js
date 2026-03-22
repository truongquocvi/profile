// Matrix Background Effect
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/`~';
const letters = chars.split('');
const fontSize = 14;
let columns = canvas.width / fontSize;
let drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    const isLightMode = document.body.classList.contains('light-mode');
    
    ctx.fillStyle = isLightMode ? 'rgba(240, 242, 245, 0.15)' : 'rgba(46, 52, 54, 0.15)'; // Background blending
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        // Draw tail (overwrite previous highlight with matrix color)
        ctx.fillStyle = isLightMode ? '#4e9a06' : '#8ae234';
        ctx.fillText(letters[Math.floor(Math.random() * letters.length)], i * fontSize, (drops[i] - 1) * fontSize);
        
        // Draw head (Highlight: White in Dark mode, Black in Light mode)
        ctx.fillStyle = isLightMode ? '#000000' : '#ffffff';
        ctx.fillText(letters[Math.floor(Math.random() * letters.length)], i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

window.addEventListener('resize', () => { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    columns = canvas.width / fontSize;
    while (drops.length < columns) drops.push(Math.random() * canvas.height / fontSize);
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Header Typing Effect
    const titleEl = document.getElementById('header-title');
    if (titleEl) {
        const textToType = "Truong_Quoc_Vi";
        let typeIdx = 0;
        const typeHeader = () => {
            if (typeIdx < textToType.length) {
                const char = textToType.charAt(typeIdx);
                titleEl.innerHTML += char === '_' ? '_<wbr>' : char;
                typeIdx++;
                setTimeout(typeHeader, 120);
            }
        };
        setTimeout(typeHeader, 300);
    }
    
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    let isLightMode = savedTheme === 'light' || (!savedTheme && systemPrefersLight);
    
    const updateTheme = () => {
        if (isLightMode) {
            document.body.classList.add('light-mode');
            themeBtn.textContent = '🌙 Dark';
        } else {
            document.body.classList.remove('light-mode');
            themeBtn.textContent = '☀️ Light';
        }
    };
    updateTheme(); // Apply immediately on page load

    themeBtn.addEventListener('click', () => {
        isLightMode = !isLightMode;
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
        updateTheme();
    });

    // Language Toggle
    const langBtn = document.getElementById('lang-toggle');
    const savedLang = localStorage.getItem('lang');
    const systemLangIsVi = navigator.language.startsWith('vi');
    
    let isViMode = savedLang === 'vi' || (!savedLang && systemLangIsVi);
    
    const updateLang = () => {
        if (isViMode) {
            document.body.classList.add('lang-vi');
            langBtn.textContent = 'EN';
        } else {
            document.body.classList.remove('lang-vi');
            langBtn.textContent = 'VI';
        }
    };
    updateLang(); // Apply immediately on page load

    langBtn.addEventListener('click', () => {
        isViMode = !isViMode;
        localStorage.setItem('lang', isViMode ? 'vi' : 'en');
        updateLang();
    });

    // --- POPOVER CLIPPING FIX (PORTALING) ---
    const jobs = document.querySelectorAll('.gl-job');
    let hideTimeout;

    // Move popovers to document.body to prevent clipping by section containers
    jobs.forEach(job => {
        const popover = job.querySelector('.gl-popover');
        if (popover) {
            document.body.appendChild(popover);
            job._popover = popover; // Save reference to job
        }
    });

    function adjustPopoverPosition(job) {
        const popover = job._popover;
        if (!popover) return;
        
        const rect = job.getBoundingClientRect();
        
        // Absolute vertical position (accounting for page scroll)
        let top = rect.bottom + window.scrollY + 12;
        popover.style.top = `${top}px`;
        
        // Calculate expected coordinates beforehand to avoid mobile layout stretching
        const popWidth = popover.offsetWidth || 340;
        const screenWidth = document.documentElement.clientWidth || window.innerWidth;
        const jobCenter = rect.left + (rect.width / 2);
        
        let calculatedLeft = jobCenter - (popWidth / 2);
        const padding = 10; // Safe padding from screen edges

        // Keep popover within screen bounds
        if (calculatedLeft < padding) {
            calculatedLeft = padding; // If overflows left, pin 10px from left edge
        } else if (calculatedLeft + popWidth > screenWidth - padding) {
            calculatedLeft = screenWidth - popWidth - padding; // If overflows right, pin 10px from right edge
        }

        popover.style.left = `${calculatedLeft + window.scrollX}px`;
        popover.style.transform = 'none';

        // Update arrow position to always point to the center of the Job
        const popRect = popover.getBoundingClientRect();
        let arrowPos = rect.left + (rect.width / 2) - popRect.left;
        arrowPos = Math.max(15, Math.min(arrowPos, popRect.width - 15));
        popover.style.setProperty('--arrow-pos', `${arrowPos}px`);
    }

    function showPopover(job) {
        clearTimeout(hideTimeout);
        jobs.forEach(j => {
            if (j !== job && j._popover) {
                j._popover.classList.remove('gl-pop-visible');
                j.classList.remove('active');
            }
        });
        if (job._popover) {
            job._popover.classList.add('gl-pop-visible');
            adjustPopoverPosition(job);
        }
    }

    function hidePopover(job) {
        if (!job.classList.contains('active') && job._popover) {
            job._popover.classList.remove('gl-pop-visible');
        }
    }

    jobs.forEach(job => {
        job.addEventListener('mouseenter', () => showPopover(job));
        job.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => hidePopover(job), 100); });
        
        if (job._popover) {
            job._popover.addEventListener('mouseenter', () => clearTimeout(hideTimeout)); // Prevent hiding when hovering over the popover
            job._popover.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => hidePopover(job), 100); });
            job._popover.addEventListener('click', (e) => e.stopPropagation());
        }

        job.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = job.classList.contains('active');
            jobs.forEach(j => j.classList.remove('active'));
            if (!isActive) {
                job.classList.add('active');
                showPopover(job);
            } else if (job._popover) {
                job._popover.classList.remove('gl-pop-visible');
            }
        });
    });

    document.addEventListener('click', () => {
        jobs.forEach(j => {
            j.classList.remove('active');
            if (j._popover) j._popover.classList.remove('gl-pop-visible');
        });
    });

    // Update popover position even when scrolling section or page
    const updatePositions = () => {
        jobs.forEach(job => {
            if (job._popover && job._popover.classList.contains('gl-pop-visible')) adjustPopoverPosition(job);
        });
    };
    window.addEventListener('scroll', updatePositions, true); // true: capture all child scroll events
    window.addEventListener('resize', updatePositions);

    // Form Submission Logic
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Set UI to loading state
        submitBtn.textContent = './send_message.sh --running...';
        submitBtn.disabled = true;
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        const isVi = document.body.classList.contains('lang-vi');

        try {
            // URL pointing to the Google Apps Script Web App URL
            const gas_url = 'https://script.google.com/macros/s/AKfycbzhmY8PLvtaXvfKBA4cYnMZS-PuR2aM2to8h-NLeklC6yN-3DBGBs3OglhPzOWrntQ3DQ/exec';
            const response = await fetch(gas_url, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Server response was not ok');
            const result = await response.json();

            formStatus.textContent = isVi ? '✔ Gửi tin nhắn thành công!' : '✔ Message sent successfully!';
            formStatus.classList.add('status-success');
            contactForm.reset();
        } catch (error) {
            formStatus.textContent = isVi ? '✖ Gửi thất bại. Vui lòng liên hệ trực tiếp qua email hoặc điện thoại.' : '✖ Failed to send. Please contact me directly via email or phone.';
            formStatus.classList.add('status-error');
        } finally {
            submitBtn.textContent = './send_message.sh';
            submitBtn.disabled = false;
            formStatus.style.display = 'block';
        }
    });

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    });
    scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Automatically get the current year for the footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});