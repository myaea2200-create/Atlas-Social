// Canvas Setup
const canvas = document.getElementById('liquid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let bubbles = [];

// Mouse & Touch interaction tracking
let mouse = { x: null, y: null, radius: 150 };
let targetMouse = { x: null, y: null };

// Multi-layered Wave configuration
const waves = [
    { yOffset: 0.5, length: 0.005, amplitude: 30, speed: 0.015, color: 'rgba(22, 255, 118, 0.18)' },
    { yOffset: 0.6, length: 0.007, amplitude: 45, speed: 0.01,  color: 'rgba(14, 186, 83, 0.24)' },
    { yOffset: 0.7, length: 0.004, amplitude: 60, speed: 0.008, color: 'rgba(10, 134, 33, 0.16)' }
];

let time = 0;

// Resize canvas to window dimensions
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mouse tracking
window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
});

// Mobile touch tracking
window.addEventListener('touchmove', (e) => {
    targetMouse.x = e.touches[0].clientX;
    targetMouse.y = e.touches[0].clientY;
});

// Floating Particle / Bubble Class
class Bubble {
    constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 200;
        this.size = Math.random() * 8 + 2;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Repel bubbles away from the cursor
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouse.radius - distance) / mouse.radius;
                
                this.x -= forceDirectionX * force * 5;
                this.y -= forceDirectionY * force * 5;
            }
        }

        // Loop bubbles back to the bottom when they leave the screen
        if (this.y < -50 || this.x < -50 || this.x > width + 50) {
            this.y = height + 50;
            this.x = Math.random() * width;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
    }
}

// Generate bubbles
for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
}

// Main Canvas Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Easing for smooth mouse interaction
    if (mouse.x === null && targetMouse.x !== null) {
        mouse.x = targetMouse.x;
        mouse.y = targetMouse.y;
    } else if (targetMouse.x !== null) {
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;
    }

    // Render Sine Waves
    waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        let mouseShift = mouse.x ? (mouse.x / width - 0.5) * 100 : 0;

        for (let i = 0; i <= width; i++) {
            let y = Math.sin(i * wave.length + time * wave.speed) * wave.amplitude;
            y += Math.sin(i * wave.length * 2 - time * wave.speed * 1.5) * (wave.amplitude * 0.3);
            
            let baseY = height * wave.yOffset;
            
            // Mouse interaction: ripple effect on hover
            if (mouse.x !== null) {
                let dx = mouse.x - i;
                let distance = Math.abs(dx);
                if (distance < 300) {
                    let impact = Math.cos((distance / 300) * (Math.PI / 2));
                    y += impact * 20 * (index + 1);
                }
            }

            ctx.lineTo(i, baseY + y + mouseShift);
        }

        ctx.lineTo(width, height);
        ctx.fillStyle = wave.color;
        ctx.fill();
        ctx.closePath();
    });

    // Update and draw floating bubbles
    bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
    });

    time++;
    requestAnimationFrame(animate);
}

// Kick off animation loop
animate();

/* Card */
    const name = " As Coders, our goal is to build digital solutions that protect our environment. Through this project, we aim to raise environmental consciousness and build a community dedicated to real-world solutions. On our platform, you can post your daily habits, tips, and suggestions to save our planet.";
    const target = document.getElementById("card-num");
    let i = 0;

    function typeWriter() {
      if (i < name.length) {
        target.textContent += name.charAt(i);
        i++;
        setTimeout(typeWriter, 40);
      }
    }

    window.onload = typeWriter;