// Modern animations and interactions for the Somnia Security Analyzer

document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeAnimations();
        setupSmoothScrolling();
        setupTabSwitching();
        setupFloatingElements();
        setupFormEnhancements();
        console.log('Modern animations initialized successfully');
    } catch (error) {
        console.error('Error initializing modern animations:', error);
        // Ensure page is still visible even if animations fail
        document.body.style.opacity = '1';
        document.body.style.visibility = 'visible';
    }
});

// Initialize entrance animations
function initializeAnimations() {
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.glass, .card-hover').forEach(el => {
        observer.observe(el);
    });

    // Add stagger animation to feature cards
    const featureCards = document.querySelectorAll('#features .glass');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    // Smooth scroll to analyzer
    window.scrollToAnalyzer = function() {
        const analyzerSection = document.getElementById('analyzer');
        if (analyzerSection) {
            analyzerSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Handle navigation clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = 64; // Height of fixed navigation
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update navigation active state on scroll
    window.addEventListener('scroll', updateActiveNavigation);
}

// Update active navigation based on scroll position
function updateActiveNavigation() {
    const sections = ['analyzer', 'features', 'docs'];
    const scrollPos = window.scrollY + 100;

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const navLink = document.querySelector(`a[href="#${sectionId}"]`);

        if (section && navLink) {
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                navLink.classList.add('text-blue-600');
                navLink.classList.remove('text-gray-700');
            } else {
                navLink.classList.remove('text-blue-600');
                navLink.classList.add('text-gray-700');
            }
        }
    });
}

// Tab switching functionality
function setupTabSwitching() {
    window.switchTab = function(tabName) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(panel => {
            panel.classList.add('hidden');
        });

        // Remove active state from all tabs
        document.querySelectorAll('[id$="-tab"]').forEach(tab => {
            tab.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
            tab.classList.add('text-gray-700', 'hover:text-gray-900');
        });

        // Show selected tab content
        const selectedPanel = document.getElementById(`${tabName}-panel`);
        if (selectedPanel) {
            selectedPanel.classList.remove('hidden');
        }

        // Add active state to selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('bg-white', 'text-blue-600', 'shadow-sm');
            selectedTab.classList.remove('text-gray-700', 'hover:text-gray-900');
        }
    };

    // API section toggle
    window.toggleApiSection = function() {
        const apiSection = document.getElementById('apiSection');
        const toggleIcon = document.getElementById('apiToggleIcon');

        if (apiSection && toggleIcon) {
            if (apiSection.classList.contains('hidden')) {
                apiSection.classList.remove('hidden');
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                apiSection.classList.add('hidden');
                toggleIcon.style.transform = 'rotate(0deg)';
            }
        }
    };

    // API tab switching
    window.switchApiTab = function(tab) {
        const postmanTab = document.getElementById('postman-tab');
        const curlTab = document.getElementById('curl-tab');

        if (tab === 'postman') {
            postmanTab.classList.add('bg-blue-600', 'text-white');
            postmanTab.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            curlTab.classList.remove('bg-blue-600', 'text-white');
            curlTab.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        } else {
            curlTab.classList.add('bg-blue-600', 'text-white');
            curlTab.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            postmanTab.classList.remove('bg-blue-600', 'text-white');
            postmanTab.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        }
    };
}

// Setup floating animations for background elements
function setupFloatingElements() {
    const floatingElements = document.querySelectorAll('.float');

    floatingElements.forEach((element, index) => {
        // Add random animation delays and durations for organic movement
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;

        element.style.animationDelay = `${delay}s`;
        element.style.animationDuration = `${duration}s`;
    });
}

// Enhanced form interactions
function setupFormEnhancements() {
    // Add focus effects to form inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('form-focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('form-focused');
        });
    });

    // Animate button states
    const buttons = document.querySelectorAll('.btn-modern, .btn-modern-outline');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
    });

    // Enhanced analyze button animation
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function(e) {
            if (!this.disabled) {
                // Add pulse effect
                this.classList.add('animate-pulse');

                // Show spinner
                const spinner = document.getElementById('analyzeSpinner');
                if (spinner) {
                    spinner.classList.remove('hidden');
                }

                // Simulate analysis (remove this in production)
                setTimeout(() => {
                    this.classList.remove('animate-pulse');
                    if (spinner) {
                        spinner.classList.add('hidden');
                    }
                }, 3000);
            }
        });
    }
}

// Add parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[class*="float"]');

    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Add loading animations
window.addEventListener('load', () => {
    // Fade in the page content
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // Add stagger animation to navigation items
    const navItems = document.querySelectorAll('nav a, nav button');
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.style.transition = 'all 0.5s ease-out';

        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
});

// Add CSS classes dynamically for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideUpFadeIn 0.6s ease-out forwards;
    }

    .form-focused {
        transform: scale(1.02);
        transition: transform 0.2s ease-out;
    }

    @keyframes slideUpFadeIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .card-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-hover:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .gradient-text {
        background-size: 200% 200%;
        animation: gradient 3s ease infinite;
    }

    .pulse-glow {
        animation: pulseGlow 2s ease-in-out infinite alternate;
    }

    @keyframes pulseGlow {
        from {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
        to {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 40px rgba(147, 197, 253, 0.3);
        }
    }
`;

document.head.appendChild(style);