// Advanced Flow Simulation Module
class FlowSimulation {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            particleCount: options.particleCount || 100,
            flowSpeed: options.flowSpeed || 1,
            turbulence: options.turbulence || 0.1,
            phaseTypes: options.phaseTypes || ['gas', 'liquid'],
            temperature: options.temperature || 293.15, // Kelvin
            pressure: options.pressure || 101325, // Pa
            ...options
        };

        this.particles = [];
        this.isRunning = false;
        this.animationId = null;
        this.time = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createParticles();
        this.setupControls();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;
        this.container.appendChild(this.canvas);

        // Handle resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
        });
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = {
                id: i,
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.options.flowSpeed,
                vy: (Math.random() - 0.5) * this.options.flowSpeed,
                size: Math.random() * 5 + 2,
                phase: this.options.phaseTypes[Math.floor(Math.random() * this.options.phaseTypes.length)],
                density: Math.random() * 0.5 + 0.5,
                temperature: this.options.temperature + (Math.random() - 0.5) * 20,
                life: 1.0,
                maxLife: Math.random() * 100 + 50
            };

            // Set particle properties based on phase
            this.setPhaseProperties(particle);
            this.particles.push(particle);
        }
    }

    setPhaseProperties(particle) {
        switch (particle.phase) {
            case 'gas':
                particle.color = `rgba(0, 170, 255, ${particle.density * 0.3})`;
                particle.size *= 0.8;
                particle.buoyancy = -0.02;
                break;
            case 'liquid':
                particle.color = `rgba(0, 100, 200, ${particle.density * 0.7})`;
                particle.size *= 1.2;
                particle.buoyancy = 0.01;
                break;
            case 'vapor':
                particle.color = `rgba(200, 200, 255, ${particle.density * 0.2})`;
                particle.size *= 0.6;
                particle.buoyancy = -0.05;
                break;
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Apply flow forces
            this.applyFlowForces(particle);

            // Apply phase change
            this.checkPhaseChange(particle);

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Apply boundaries
            this.applyBoundaries(particle);

            // Update life
            particle.life -= 1 / particle.maxLife;
            if (particle.life <= 0) {
                this.resetParticle(particle);
            }
        });
    }

    applyFlowForces(particle) {
        // Turbulence
        const turbulenceX = (Math.random() - 0.5) * this.options.turbulence;
        const turbulenceY = (Math.random() - 0.5) * this.options.turbulence;

        // Buoyancy
        particle.vy += particle.buoyancy;

        // Flow field (simplified)
        const flowX = Math.sin(this.time * 0.01 + particle.y * 0.01) * 0.1;
        const flowY = Math.cos(this.time * 0.01 + particle.x * 0.01) * 0.1;

        particle.vx += turbulenceX + flowX;
        particle.vy += turbulenceY + flowY;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
    }

    checkPhaseChange(particle) {
        // Simplified phase change based on temperature and pressure
        const criticalTemp = 373.15; // Water boiling point

        if (particle.phase === 'liquid' && particle.temperature > criticalTemp) {
            particle.phase = 'vapor';
            this.setPhaseProperties(particle);
        } else if (particle.phase === 'vapor' && particle.temperature < criticalTemp) {
            particle.phase = 'liquid';
            this.setPhaseProperties(particle);
        }

        // Gradual temperature change
        particle.temperature += (Math.random() - 0.5) * 0.5;
    }

    applyBoundaries(particle) {
        if (particle.x < 0) {
            particle.x = this.canvas.width;
        } else if (particle.x > this.canvas.width) {
            particle.x = 0;
        }

        if (particle.y < 0) {
            particle.y = this.canvas.height;
        } else if (particle.y > this.canvas.height) {
            particle.y = 0;
        }
    }

    resetParticle(particle) {
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
        particle.life = 1.0;
        particle.temperature = this.options.temperature + (Math.random() - 0.5) * 20;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Add glow effect for vapor
            if (particle.phase === 'vapor') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = particle.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });

        // Draw flow lines
        this.drawFlowField();
    }

    drawFlowField() {
        const gridSize = 50;
        this.ctx.strokeStyle = 'rgba(0, 170, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                const flowX = Math.sin(this.time * 0.01 + y * 0.01) * 10;
                const flowY = Math.cos(this.time * 0.01 + x * 0.01) * 10;

                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + flowX, y + flowY);
                this.ctx.stroke();

                // Arrow head
                const angle = Math.atan2(flowY, flowX);
                const arrowLength = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(x + flowX, y + flowY);
                this.ctx.lineTo(
                    x + flowX - arrowLength * Math.cos(angle - Math.PI / 6),
                    y + flowY - arrowLength * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(x + flowX, y + flowY);
                this.ctx.lineTo(
                    x + flowX - arrowLength * Math.cos(angle + Math.PI / 6),
                    y + flowY - arrowLength * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
            }
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.time++;
        this.updateParticles();
        this.render();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    setupControls() {
        // Create control panel
        const controls = document.createElement('div');
        controls.className = 'flow-controls';
        controls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            z-index: 10;
        `;

        controls.innerHTML = `
            <h6>Flow Controls</h6>
            <div class="mb-2">
                <label class="small">Flow Speed:</label>
                <input type="range" class="form-range" id="flowSpeed" min="0" max="5" step="0.1" value="${this.options.flowSpeed}">
            </div>
            <div class="mb-2">
                <label class="small">Turbulence:</label>
                <input type="range" class="form-range" id="turbulence" min="0" max="1" step="0.01" value="${this.options.turbulence}">
            </div>
            <div class="mb-2">
                <label class="small">Temperature (K):</label>
                <input type="range" class="form-range" id="temperature" min="273" max="473" step="1" value="${this.options.temperature}">
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" id="startSim">Start</button>
                <button class="btn btn-sm btn-secondary" id="stopSim">Stop</button>
                <button class="btn btn-sm btn-outline-primary" id="resetSim">Reset</button>
            </div>
        `;

        this.container.appendChild(controls);

        // Bind control events
        controls.querySelector('#flowSpeed').addEventListener('input', (e) => {
            this.options.flowSpeed = parseFloat(e.target.value);
        });

        controls.querySelector('#turbulence').addEventListener('input', (e) => {
            this.options.turbulence = parseFloat(e.target.value);
        });

        controls.querySelector('#temperature').addEventListener('input', (e) => {
            this.options.temperature = parseFloat(e.target.value);
        });

        controls.querySelector('#startSim').addEventListener('click', () => this.start());
        controls.querySelector('#stopSim').addEventListener('click', () => this.stop());
        controls.querySelector('#resetSim').addEventListener('click', () => {
            this.stop();
            this.createParticles();
            this.start();
        });
    }

    // Public API methods
    setFlowSpeed(speed) {
        this.options.flowSpeed = speed;
    }

    setTurbulence(turbulence) {
        this.options.turbulence = turbulence;
    }

    setTemperature(temperature) {
        this.options.temperature = temperature;
    }

    getParticleCount() {
        return this.particles.length;
    }

    getPhaseDistribution() {
        const distribution = {};
        this.particles.forEach(particle => {
            distribution[particle.phase] = (distribution[particle.phase] || 0) + 1;
        });
        return distribution;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlowSimulation;
} else {
    window.FlowSimulation = FlowSimulation;
}
