// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    // Flash Deals Countdown Timer
    function startCountdown() {
        try {
            let hours = 12;
            let minutes = 45;
            let seconds = 30;

            setInterval(() => {
                if (seconds > 0) {
                    seconds--;
                } else {
                    if (minutes > 0) {
                        minutes--;
                        seconds = 59;
                    } else {
                        if (hours > 0) {
                            hours--;
                            minutes = 59;
                            seconds = 59;
                        } else {
                            // Reset timer when it reaches zero
                            hours = 12;
                            minutes = 45;
                            seconds = 30;
                        }
                    }
                }

                // Update the display
                document.querySelectorAll('.countdown-timer').forEach(timer => {
                    timer.innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                });
            }, 1000);
        } catch (error) {
            console.error('Error in countdown timer:', error);
        }
    }

    // Initialize countdown
    startCountdown();

    // Search functionality
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Implement search functionality here
                console.log('Search for:', this.value);
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Product hover effect
    document.querySelectorAll('.group').forEach(product => {
        product.addEventListener('mouseenter', function() {
            this.querySelector('img').classList.add('opacity-75');
        });
        
        product.addEventListener('mouseleave', function() {
            this.querySelector('img').classList.remove('opacity-75');
        });
    });

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                console.log('Newsletter subscription for:', emailInput.value);
                // Add subscription logic here
                emailInput.value = '';
                alert('Thank you for subscribing!');
            }
        });
    }
});
