// Multi-Flows.com - Main JavaScript
class MultiFlowsApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.startAnimations();
    }

    init() {
        // Initialize components
        this.initScrollAnimations();
        this.initParticleSystem();
        this.initFlowSimulation();
        this.initContactForm();
    }

    bindEvents() {
        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // Resize events
        window.addEventListener('resize', this.handleResize.bind(this));

        // Form events
        const form = document.querySelector('#contactForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Service card interactions
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', this.animateServiceCard.bind(this));
            card.addEventListener('mouseleave', this.resetServiceCard.bind(this));
        });
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // Parallax effects
        this.updateParallax(scrollY);

        // Update navigation
        this.updateNavigation(scrollY);

        // Trigger animations
        this.triggerScrollAnimations();
    }

    initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.scrollObserver.observe(el);
        });
    }

    initParticleSystem() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-system';
        document.querySelector('.hero').appendChild(particleContainer);

        this.createParticles(particleContainer, 50);
    }

    createParticles(container, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';

                // Random properties
                const size = Math.random() * 4 + 2;
                const startY = Math.random() * window.innerHeight;
                const animationDuration = Math.random() * 8 + 4;

                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.top = startY + 'px';
                particle.style.left = '-10px';
                particle.style.animationDuration = animationDuration + 's';

                container.appendChild(particle);

                // Remove particle after animation
                setTimeout(() => {
                    if (container.contains(particle)) {
                        container.removeChild(particle);
                    }
                }, animationDuration * 1000);
            }, i * 200);
        }

        // Restart particle system
        setTimeout(() => {
            this.createParticles(container, count);
        }, 10000);
    }

    initFlowSimulation() {
        const flowContainer = document.querySelector('.flow-animation');
        if (!flowContainer) return;

        this.flowSimulation = {
            bubbles: [],
            container: flowContainer,
            running: true
        };

        this.startFlowSimulation();
    }

    startFlowSimulation() {
        const createBubble = () => {
            if (!this.flowSimulation.running) return;

            const bubble = document.createElement('div');
            bubble.className = 'flow-bubble';

            const size = Math.random() * 20 + 10;
            const startX = Math.random() * (this.flowSimulation.container.offsetWidth - size);
            const speed = Math.random() * 3 + 2;

            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = startX + 'px';
            bubble.style.bottom = '-' + size + 'px';
            bubble.style.background = `radial-gradient(circle,
                rgba(255,255,255,0.8) 0%,
                rgba(0,170,255,0.4) 100%)`;
            bubble.style.borderRadius = '50%';
            bubble.style.position = 'absolute';
            bubble.style.animation = `bubbleRise ${speed}s ease-in-out`;

            this.flowSimulation.container.appendChild(bubble);
            this.flowSimulation.bubbles.push(bubble);

            setTimeout(() => {
                if (this.flowSimulation.container.contains(bubble)) {
                    this.flowSimulation.container.removeChild(bubble);
                    const index = this.flowSimulation.bubbles.indexOf(bubble);
                    if (index > -1) {
                        this.flowSimulation.bubbles.splice(index, 1);
                    }
                }
            }, speed * 1000);
        };

        // Create bubbles at intervals
        setInterval(createBubble, 800);
    }

    initContactForm() {
        const form = document.querySelector('#contactForm');
        if (!form) return;

        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });
    }

    validateField(event) {
        const field = event.target;
        const value = field.value.trim();
        const fieldName = field.name || field.id;

        let isValid = true;
        let errorMessage = '';

        // Validation rules
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters';
                }
                break;
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    showFieldValidation(field, isValid, errorMessage) {
        // Remove existing error
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            field.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error text-danger small mt-1';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    }

    clearFieldError(event) {
        const field = event.target;
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate all fields
        let isFormValid = true;
        const fields = form.querySelectorAll('input[required], textarea[required], select[required]');

        fields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please correct the errors below', 'error');
            return;
        }

        // Submit form
        this.submitContactForm(data, form);
    }

    async submitContactForm(data, form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call (replace with actual endpoint)
            await this.delay(2000);

            // Success
            submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
            submitBtn.classList.add('btn-success');

            this.showNotification('Thank you! Your message has been sent successfully.', 'success');

            // Reset form
            setTimeout(() => {
                form.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-success');

                // Clear validation states
                form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
                    field.classList.remove('is-valid', 'is-invalid');
                });
            }, 3000);

        } catch (error) {
            // Error
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Error';
            submitBtn.classList.add('btn-danger');

            this.showNotification('Sorry, there was an error sending your message. Please try again.', 'error');

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-danger');
            }, 3000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Manual close
        notification.querySelector('.btn-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }

    updateParallax(scrollY) {
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    updateNavigation(scrollY) {
        const header = document.querySelector('.header');
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active navigation item
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    animateServiceCard(event) {
        const card = event.currentTarget;
        const icon = card.querySelector('.service-icon');

        card.style.transform = 'translateY(-10px) scale(1.02)';
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    resetServiceCard(event) {
        const card = event.currentTarget;
        const icon = card.querySelector('.service-icon');

        card.style.transform = 'translateY(0) scale(1)';
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    }

    startAnimations() {
        // Start continuous animations
        this.animateFlowLines();
        this.animateBackgroundElements();
    }

    animateFlowLines() {
        const flowContainer = document.querySelector('.flow-viz');
        if (!flowContainer) return;

        const createFlowLine = () => {
            const line = document.createElement('div');
            line.className = 'flow-line';
            line.style.top = Math.random() * 80 + 10 + '%';
            line.style.width = Math.random() * 200 + 100 + 'px';
            line.style.left = '-200px';

            flowContainer.appendChild(line);

            setTimeout(() => {
                if (flowContainer.contains(line)) {
                    flowContainer.removeChild(line);
                }
            }, 4000);
        };

        setInterval(createFlowLine, 1000);
    }

    animateBackgroundElements() {
        // Add subtle background animations
        const hero = document.querySelector('.hero');
        if (hero) {
            setInterval(() => {
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    pointer-events: none;
                    animation: rippleEffect 4s ease-out;
                    width: 100px;
                    height: 100px;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;

                hero.appendChild(ripple);

                setTimeout(() => {
                    if (hero.contains(ripple)) {
                        hero.removeChild(ripple);
                    }
                }, 4000);
            }, 3000);
        }
    }

    handleResize() {
        // Recalculate particle system
        const particleSystem = document.querySelector('.particle-system');
        if (particleSystem) {
            // Clear existing particles
            particleSystem.innerHTML = '';
            // Restart with new dimensions
            this.createParticles(particleSystem, 30);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external use
    stopAnimations() {
        if (this.flowSimulation) {
            this.flowSimulation.running = false;
        }
    }

    startAnimations() {
        if (this.flowSimulation) {
            this.flowSimulation.running = true;
            this.startFlowSimulation();
        }
    }
}

// Additional utility functions
const Utils = {
    // Smooth scroll to element
    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    // Throttle function calls
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Debounce function calls
    debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        }
    },

    // Format numbers
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Get browser info
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";

        if (userAgent.indexOf("Chrome") > -1) {
            browserName = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            browserName = "Safari";
        } else if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Firefox";
        } else if (userAgent.indexOf("Edge") > -1) {
            browserName = "Edge";
        }

        return { name: browserName, userAgent };
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.multiFlowsApp = new MultiFlowsApp();

    // Add ripple effect CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MultiFlowsApp, Utils };
}
