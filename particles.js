(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const COLORS = ['#ff3366', '#4a9eff', '#00cc88', '#ffd700'];
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;
    const MOUSE_FORCE = 0.02;

    let width, height, particles, mouse, animId, isVisible = true;

    mouse = { x: -9999, y: -9999 };

    function resize() {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    }

    function getParticleCount() {
        if (width < 640) return 35;
        if (width < 1024) return 55;
        return 80;
    }

    function createParticle() {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 2.5 + 1,
            color: color,
            opacity: Math.random() * 0.5 + 0.3
        };
    }

    function init() {
        resize();
        const count = getParticleCount();
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function drawParticle(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = particles[i].color;
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }

    function drawMouseConnections() {
        if (mouse.x === -9999) return;
        for (let i = 0; i < particles.length; i++) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const opacity = (1 - dist / MOUSE_RADIUS) * 0.3;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = '#ff3366';
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    function update() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Mouse interaction
            if (mouse.x !== -9999) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Clamp velocity
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.5) {
                p.vx = (p.vx / speed) * 1.5;
                p.vy = (p.vy / speed) * 1.5;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;
        }
    }

    function animate() {
        if (!isVisible) {
            animId = requestAnimationFrame(animate);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        update();
        drawConnections();
        drawMouseConnections();
        for (let i = 0; i < particles.length; i++) {
            drawParticle(particles[i]);
        }
        animId = requestAnimationFrame(animate);
    }

    // Mouse tracking
    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Touch tracking
    canvas.addEventListener('touchmove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
    }, { passive: true });

    canvas.addEventListener('touchend', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Visibility
    var observer = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(canvas.parentElement);

    // Resize with debounce
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            // Adjust particle count
            var target = getParticleCount();
            while (particles.length > target) particles.pop();
            while (particles.length < target) particles.push(createParticle());
        }, 200);
    });

    init();
    animate();
})();
