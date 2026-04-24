const canvas = document.getElementById('spark-canvas');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isMobile = window.matchMedia('(max-width: 720px)').matches;

let particlesArray = [];
let mouse = { x: null, y: null, radius: 0 };

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mouse.radius = Math.min(window.innerWidth, window.innerHeight) / 6;
    isMobile = window.matchMedia('(max-width: 720px)').matches;
}

resizeCanvas();

function updatePointer(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
}

window.addEventListener('pointermove', updatePointer);

// create particle
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    // method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    // check particle position, check mouse position, move the particle, draw the particle
    update() {
        //check if particle is still within canvas
        if (this.x > window.innerWidth || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > window.innerHeight || this.y < 0) {
            this.directionY = -this.directionY;
        }

        //check collision detection - mouse position / particle position
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < mouse.radius + this.size){
            if (mouse.x < this.x && this.x < window.innerWidth - this.size * 10) {
                this.x += 10;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 10;
            }
            if (mouse.y < this.y && this.y < window.innerHeight - this.size * 10) {
                this.y += 10;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 10;
            }
        }
        // move particle
        this.x += this.directionX;
        this.y += this.directionY;
        // draw particle
        this.draw();
    }
}

// create particle array
function init() {
    particlesArray = [];
    const area = window.innerWidth * window.innerHeight;
    const density = window.innerWidth < 720 ? 18000 : 10000;
    const numberOfParticles = Math.floor(area / density);

    for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 4) + 1;
        const x = (Math.random() * (window.innerWidth - size * 4)) + size * 2;
        const y = (Math.random() * (window.innerHeight - size * 4)) + size * 2;
        const directionX = (Math.random() * 3) - 1.5;
        const directionY = (Math.random() * 3) - 1.5;
        const color = 'rgba(0, 209, 178, 0.75)';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// animation loop
function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
    if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
    }
}

// check if particles are close enough to draw line between them
function connect() {
    if (isMobile) {
        return;
    }
    let opacityValue = 1;
    const maxDistance = (window.innerWidth / 7) * (window.innerHeight / 7);
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = (dx * dx) + (dy * dy);
            if (distance < maxDistance) {
                opacityValue = 1 - (distance / 22000);
                ctx.strokeStyle = `rgba(255, 107, 53, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// resize event
window.addEventListener('resize', function () {
    resizeCanvas();
    init();
});

// mouse out event
window.addEventListener('pointerleave', function () {
    mouse.x = undefined;
    mouse.y = undefined;
});

if (!isMobile) {
    init();
    animate();
}
