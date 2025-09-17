// Seller Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components
    initializeDashboard();
    initializeCharts();
    initializeRealTimeUpdates();
});

function initializeDashboard() {
    // Add New Product Button
    const addProductBtn = document.querySelector('button');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductModal);
    }

    // Order Detail Buttons
    document.querySelectorAll('table button').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.closest('tr').querySelector('td').textContent;
            showOrderDetails(orderId);
        });
    });

    // Profile Menu Toggle
    const profileImg = document.querySelector('.rounded-full');
    if (profileImg) {
        profileImg.addEventListener('click', toggleProfileMenu);
    }

    // Sidebar Navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleNavigation(this.textContent.trim());
        });
    });
}

// Add Product Modal
function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Add New Product</h3>
                <button class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                    </label>
                    <input type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option>Electronics</option>
                        <option>Fashion</option>
                        <option>Home & Living</option>
                        <option>Beauty</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Price
                    </label>
                    <input type="number" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea rows="4"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Product Images
                    </label>
                    <input type="file" multiple accept="image/*"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeBtn = modal.querySelector('button');
    const cancelBtn = modal.querySelector('button[type="button"]');
    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission
        console.log('Adding new product...');
        closeModal();
    });
}

// Order Details Modal
function showOrderDetails(orderId) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Order Details - ${orderId}</h3>
                <button class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-4">
                <div class="border-b pb-4">
                    <h4 class="font-semibold mb-2">Customer Information</h4>
                    <p>Name: John Doe</p>
                    <p>Email: john@example.com</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
                <div class="border-b pb-4">
                    <h4 class="font-semibold mb-2">Shipping Address</h4>
                    <p>123 Main St</p>
                    <p>Apt 4B</p>
                    <p>New York, NY 10001</p>
                </div>
                <div class="border-b pb-4">
                    <h4 class="font-semibold mb-2">Order Summary</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span>iPhone 13</span>
                            <span>$999</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Shipping</span>
                            <span>$10</span>
                        </div>
                        <div class="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>$1,009</span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-4">
                    <button class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Close
                    </button>
                    <button class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                        Update Status
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('button');
    const closeModal = () => modal.remove();

    closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
}

// Profile Menu
function toggleProfileMenu() {
    const menu = document.createElement('div');
    menu.className = 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50';
    menu.innerHTML = `
        <div class="py-1">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
        </div>
    `;

    const profileImg = document.querySelector('.rounded-full');
    profileImg.parentNode.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && !profileImg.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Navigation Handler
function handleNavigation(section) {
    console.log(`Navigating to ${section}`);
    // Implement navigation logic
}

// Real-time Updates
function initializeRealTimeUpdates() {
    setInterval(updateDashboardStats, 30000); // Update every 30 seconds
}

function updateDashboardStats() {
    // Simulate fetching new data
    const newStats = {
        sales: Math.floor(Math.random() * 10000),
        orders: Math.floor(Math.random() * 100),
        products: Math.floor(Math.random() * 50),
        reviews: Math.floor(Math.random() * 200)
    };

    // Update DOM
    // Implementation would go here
}

// Charts (using Chart.js - would need to include the library)
function initializeCharts() {
    // Sales Chart
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Sales ($)',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    // Orders Chart
    const ordersData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Orders',
            data: [65, 89, 76, 95, 82, 110],
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1
        }]
    };

    // Implementation would require Chart.js library
}
