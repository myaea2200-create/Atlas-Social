const sporeContainer = document.getElementById('sporeContainer');

if (sporeContainer) {
    for (let i = 0; i < 35; i++) {
        const spore = document.createElement('div');
        spore.className = 'spore';

        const size = Math.random() * 6 + 3;
        spore.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 8 + 6}s;
            animation-delay: ${Math.random() * 5}s;
        `;

        sporeContainer.appendChild(spore);
    }
}

const canvas = document.getElementById('liquid-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let mouse = { x: null, y: null };

    const waves = [
        { yOffset: 0.5, length: 0.005, amplitude: 30, speed: 0.015, color: 'rgba(59, 162, 57, 0.2)' },
        { yOffset: 0.6, length: 0.007, amplitude: 45, speed: 0.01,  color: 'rgba(185, 229, 138, 0.25)' },
        { yOffset: 0.7, length: 0.004, amplitude: 60, speed: 0.008, color: 'rgba(208, 223, 171, 0.2)' }
    ];

    let time = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    resize();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        waves.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let i = 0; i <= width; i++) {
                let y = Math.sin(i * wave.length + time * wave.speed) * wave.amplitude;
                let baseY = height * wave.yOffset;

                if (mouse.x !== null) {
                    let distance = Math.abs(mouse.x - i);
                    if (distance < 300) {
                        y += Math.cos((distance / 300) * (Math.PI / 2)) * 20 * (index + 1);
                    }
                }

                ctx.lineTo(i, baseY + y);
            }

            ctx.lineTo(width, height);
            ctx.fillStyle = wave.color;
            ctx.fill();
        });

        time++;
        requestAnimationFrame(animate);
    }

    animate();
}
