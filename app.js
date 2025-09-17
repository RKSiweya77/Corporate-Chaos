// Main application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    initializeSearch();
    
    // Category interactions
    initializeCategories();
    
    // Product card interactions
    initializeProductCards();
    
    // Seller card interactions
    initializeSellerCards();
    
    // Newsletter subscription
    initializeNewsletter();
});

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (searchInput && searchSuggestions) {
        // Sample product database
        const products = [
            { name: 'iPhone 13', category: 'Electronics', price: 999 },
            { name: 'Samsung Galaxy Watch', category: 'Electronics', price: 299 },
            { name: 'Nike Air Max', category: 'Fashion', price: 129 },
            { name: 'Sony Headphones', category: 'Electronics', price: 199 },
            { name: 'Gaming Laptop', category: 'Electronics', price: 1299 },
            { name: 'Smart TV', category: 'Electronics', price: 799 },
        ];

        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            searchSuggestions.classList.remove('hidden');
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.add('hidden');
            }
        });

        // Live search
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 0) {
                const matchedProducts = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );

                // Update suggestions
                searchSuggestions.innerHTML = `
                    <div class="p-2">
                        <div class="text-sm text-gray-500 mb-2">Search Results</div>
                        <div class="space-y-2">
                            ${matchedProducts.map(product => `
                                <a href="#" class="block hover:bg-gray-100 p-2 rounded">
                                    <div class="flex justify-between items-center">
                                        <span>${product.name}</span>
                                        <span class="text-gray-600">$${product.price}</span>
                                    </div>
                                    <span class="text-sm text-gray-500">${product.category}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                if (matchedProducts.length === 0) {
                    searchSuggestions.innerHTML = `
                        <div class="p-4 text-center text-gray-500">
                            No products found
                        </div>
                    `;
                }
                
                searchSuggestions.classList.remove('hidden');
            } else {
                // Show default suggestions
                searchSuggestions.innerHTML = `
                    <div class="p-2">
                        <div class="text-sm text-gray-500 mb-2">Popular Searches</div>
                        <div class="space-y-2">
                            <a href="#" class="block hover:bg-gray-100 p-2 rounded">iPhone</a>
                            <a href="#" class="block hover:bg-gray-100 p-2 rounded">Samsung Watch</a>
                            <a href="#" class="block hover:bg-gray-100 p-2 rounded">Nike Shoes</a>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// Category interactions
function initializeCategories() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('div').classList.add('bg-opacity-60');
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('div').classList.remove('bg-opacity-60');
        });
        
        card.addEventListener('click', function() {
            const category = this.querySelector('h3').textContent;
            // Navigate to category page (to be implemented)
            console.log(`Navigating to ${category} category`);
        });
    });
}

// Product card interactions
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Quick view functionality
        card.querySelector('button').addEventListener('click', function(e) {
            e.preventDefault();
            const productName = card.querySelector('h3').textContent;
            const productPrice = card.querySelector('.text-xl').textContent;
            
            // Show quick view modal (to be implemented)
            showQuickViewModal(productName, productPrice);
        });
        
        // Hover effects
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-xl');
            this.querySelector('img').classList.add('scale-105');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-xl');
            this.querySelector('img').classList.remove('scale-105');
        });
    });
}

// Seller card interactions
function initializeSellerCards() {
    const sellerCards = document.querySelectorAll('.seller-card');
    
    sellerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-xl');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-xl');
        });
        
        // Visit store button
        card.querySelector('button').addEventListener('click', function() {
            const sellerName = card.querySelector('h3').textContent;
            // Navigate to seller's store (to be implemented)
            console.log(`Visiting ${sellerName}'s store`);
        });
    });
}

// Newsletter subscription
function initializeNewsletter() {
    const newsletterForm = document.querySelector('footer form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (emailInput && emailInput.value) {
                // Subscribe to newsletter (to be implemented)
                console.log(`Subscribing email: ${emailInput.value}`);
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }
}

// Quick view modal (to be implemented)
function showQuickViewModal(productName, productPrice) {
    console.log(`Quick view: ${productName} - ${productPrice}`);
    // Implement modal functionality
}
