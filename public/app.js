// Global state management
const state = {
    cartCount: 0,
    currentCategory: 'new', // Changed from 'featured' to 'new'
    currentPage: 'products',
    isLoading: false,
    products: [], // Store all products
    filteredProducts: [], // Store filtered products
    cart: new Map(), // Store cart items with product ID as key
    cartTotal: 0,
    currentFilter: 'all'
};

// Cache DOM elements
const elements = {
    hamburger: null,
    sidebar: null,
    sidebarClose: null,
    navLinks: null,
    productsContainer: null,
    categoryTitle: null,
    cartCount: null,
    searchInput: null,
    cartModal: document.querySelector('.cart-modal'),
    cartItems: document.querySelector('.cart-items'),
    cartTotal: document.querySelector('.total-amount'),
    checkoutButton: document.querySelector('.checkout-button'),
    contactForm: document.getElementById('contactForm'),
    checkoutPage: document.getElementById('checkout-page'),
    checkoutItems: document.querySelector('.checkout-items'),
    confirmOrderBtn: document.querySelector('.confirm-order-btn'),
    productModal: document.querySelector('.product-modal'),
    productModalDetails: document.querySelector('.product-modal-details'),
    closeModal: document.querySelector('.close-modal'),
    productsPage: document.getElementById('products-page'),
    contactPage: document.getElementById('contact-page'),
    checkoutPage: document.getElementById('checkout-page')
};

function initializeCheckout() {
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            navigateToPage('products');
            // Reset category to 'new' and fetch products
            state.currentCategory = 'new';
            fetchProducts('new');
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    cacheElements();
    initializeMenu();
    initializeSearch();
    initializeCart();
    initializeModal();
    initializeContactForm();
    initializeCategories();
    initializeCheckout();
    
    // Check initial hash
    const hash = window.location.hash.slice(1);
    if (hash === 'contact') {
        navigateToPage('contact');
    } else {
        await fetchProducts('new'); // Changed from 'featured' to 'new'
        // Update active nav link
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.category === 'new');
        });
    }
});

function cacheElements() {
    elements.hamburger = document.querySelector('.hamburger');
    elements.sidebar = document.querySelector('.sidebar');
    elements.sidebarClose = document.querySelector('.sidebar-close');
    elements.navLinks = document.querySelectorAll('.nav-links a, .sidebar a');
    elements.productsContainer = document.getElementById('products-container');
    elements.categoryTitle = document.querySelector('.category-title h2');
    elements.cartCount = document.querySelector('.cart-count');
    elements.searchInput = document.getElementById('search-input');
}

function initializeMenu() {
    elements.hamburger?.addEventListener('click', toggleSidebar);
    elements.sidebarClose?.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.sidebar?.classList.contains('active') && 
            !elements.sidebar.contains(e.target) && 
            !elements.hamburger?.contains(e.target)) {
            closeSidebar();
        }
    });

    // Initialize navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

function initializeSearch() {
    elements.searchInput?.addEventListener('input', handleSearch);
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Filter based on search term
    state.filteredProducts = state.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    // Apply category filtering after search
    filterProducts();
}

async function fetchProducts(category) {
    try {
        state.isLoading = true;
        elements.productsContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        const response = await fetch(`/api/products/${category}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        state.products = products.map(product => ({
            ...product,
            category: product.category || 'sekalaista' // Ensure all products have a category
        }));
        state.filteredProducts = state.products;
        filterProducts(); // Apply any active filters
    } catch (error) {
        console.error('Error:', error);
        elements.productsContainer.innerHTML = '<p>Error loading products. Please try again.</p>';
    } finally {
        state.isLoading = false;
    }
}

function displayProducts(products) {
    if (!elements.productsContainer) return;
    
    elements.productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const card = createProductCard(product);
        elements.productsContainer.appendChild(card);
    });
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 loading="lazy"
                 onerror="this.src='/images/placeholder.jpg'">
            ${state.cart.has(product.id) ? '<div class="cart-indicator"><i class="fas fa-shopping-cart"></i></div>' : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${product.price.toFixed(2)} €</p>
            <button class="add-to-cart ${state.cart.has(product.id) ? 'in-cart' : ''}" 
                    data-product-id="${product.id}">
                <i class="fas ${state.cart.has(product.id) ? 'fa-check' : 'fa-shopping-cart'}"></i>
                ${state.cart.has(product.id) ? 'Korissa' : 'Lisää koriin'}
            </button>
        </div>
    `;

    // Add click event to show modal with full details
    div.addEventListener('click', (e) => {
        // Don't show modal if clicking the add to cart button
        if (!e.target.closest('.add-to-cart')) {
            showProductModal(product);
        }
    });

    return div;
}

function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <button class="close-modal">&times;</button>
            <div class="modal-grid">
                <div class="modal-image-container">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         class="modal-image"
                         onerror="this.src='/images/placeholder.jpg'">
                </div>
                <div class="modal-info">
                    <h2>${product.name}</h2>
                    <button class="add-to-cart modal-cart-button ${state.cart.has(product.id) ? 'in-cart' : ''}" 
                            data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> 
                        ${state.cart.has(product.id) ? 'Korissa' : 'Lisää koriin'}
                    </button>
                    <p class="modal-price">${product.price.toFixed(2)} €</p>
                    <p class="modal-description">${product.description}</p>
                    <div class="spec-item">
                        <i class="fas fa-ruler-combined"></i>
                        <span>Mitat: ${product.dimensions}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function closeProductModal() {
    elements.productModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

// Initialize modal events
function initializeModal() {
    elements.closeModal.addEventListener('click', closeProductModal);
    
    // Close modal when clicking outside
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) {
            closeProductModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.productModal.style.display === 'block') {
            closeProductModal();
        }
    });
}

function addToCart(productId, event) {
    // Prevent event bubbling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // If product is already in cart, remove it
    if (state.cart.has(productId)) {
        removeFromCart(productId);
        return; // Exit function after removing
    }

    // Add new item to cart
    state.cart.set(productId, {
        ...product,
        quantity: 1
    });

    state.cartCount++;
    state.cartTotal = calculateCartTotal();
    updateCartUI();
    
    // Show notification
    showNotification(`${product.name} lisätty ostoskoriin`, 'success');
    
    // Update all related buttons
    updateCartButtons(productId, true);
    
    // Add visual indicator to product card
    addCartIndicator(productId);
}

function updateCartUI() {
    // Update cart count badge
    elements.cartCount.textContent = state.cartCount;
    
    // Calculate current total
    state.cartTotal = calculateCartTotal();
    
    // Update all total amount displays
    const totalElements = document.querySelectorAll('.total-amount');
    totalElements.forEach(element => {
        element.textContent = `${state.cartTotal.toFixed(2)} €`;
    });
    
    // Update cart items
    elements.cartItems.innerHTML = '';
    state.cart.forEach((item) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.quantity} x ${item.price.toFixed(2)} € = ${itemTotal} €</p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-item">
                <i class="fas fa-times"></i>
            </button>
        `;
        elements.cartItems.appendChild(cartItem);
    });
}

function removeFromCart(productId) {
    if (!state.cart.has(productId)) return;
    
    const item = state.cart.get(productId);
    state.cartCount -= item.quantity;
    state.cart.delete(productId);
    state.cartTotal = calculateCartTotal();
    
    updateCartUI();
    
    // Update checkout UI if on checkout page
    if (state.currentPage === 'checkout') {
        updateCheckoutUI();
    }
    
    // Update all cart buttons and indicators
    updateCartButtons(productId, false);
    
    // Show notification
    showNotification(`${item.name} poistettu ostoskorista`, 'error');
}

function initializeCart() {
    // Ensure cart modal is closed by default
    elements.cartModal.classList.remove('active');
    
    document.querySelector('.cart').addEventListener('click', toggleCart);
    
    // Use event delegation for add to cart buttons
    document.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (addToCartBtn && !addToCartBtn.classList.contains('in-cart')) {
            const productId = parseInt(addToCartBtn.dataset.productId);
            addToCart(productId, e);
        }
    });

    // Close cart modal when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.cartModal.contains(e.target) && 
            !e.target.closest('.cart') &&
            elements.cartModal.classList.contains('active')) {
            toggleCart();
        }
    });

    elements.checkoutButton.addEventListener('click', () => {
        elements.cartModal.classList.remove('active'); // Close cart modal
        navigateToPage('checkout');
    });
}

function toggleCart() {
    // Only toggle if clicked
    if (event && event.type === 'click') {
        elements.cartModal.classList.toggle('active');
        
        // Update cart total when opening
        if (elements.cartModal.classList.contains('active')) {
            state.cartTotal = calculateCartTotal();
            elements.cartTotal.textContent = `${state.cartTotal.toFixed(2)} €`;
            updateCartUI();
        }
    }
}

function handleNavigation(e) {
    e.preventDefault();
    const link = e.target;
    
    if (link.dataset.category) {
        navigateToPage('products');
        updateCategory(link.dataset.category);
    } else if (link.dataset.page) {
        navigateToPage(link.dataset.page);
    }

    if (elements.sidebar?.classList.contains('active')) {
        closeSidebar();
    }
}

function updateCategory(category) {
    state.currentCategory = category;
    
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });
    
    const titles = {
        'featured': 'Suositut tuotteet',
        'new': 'Uudet tuotteet',
        'sale': 'Tarjoustuotteet'
    };
    
    if (elements.categoryTitle) {
        elements.categoryTitle.textContent = titles[category];
    }
    
    fetchProducts(category);
}

function toggleSidebar() {
    elements.sidebar?.classList.toggle('active');
}

function closeSidebar() {
    elements.sidebar?.classList.remove('active');
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form data
        if (!validateContactForm(data)) {
            throw new Error('Tarkista pakolliset kentät');
        }
        
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Viestin lähetys epäonnistui');
        
        showNotification('Viesti lähetetty onnistuneesti!', 'success');
        form.reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function validateContactForm(data) {
    const required = ['name', 'email', 'subject', 'message'];
    return required.every(field => data[field]?.trim());
}

function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add show class after a small delay for animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
        
        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            // Wait for animation to complete before removing element
            setTimeout(() => {
                notification.remove();
            }, 500); // Match this with CSS transition duration
        }, 3000);
    });
}

function initializeCheckoutPage() {
    // Add click handler for the title
    const siteTitle = document.querySelector('.site-title');
    if (siteTitle) {
        siteTitle.addEventListener('click', () => {
            navigateToPage('products');
            window.location.hash = ''; // Clear the hash
        });
    }

    if (window.location.pathname === '/kassa.html') {
        // Load cart data from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const cartTotal = parseFloat(localStorage.getItem('cartTotal') || '0');

        // Restore cart state
        state.cart = new Map(cartItems);
        state.cartTotal = cartTotal;

        // Update checkout UI
        updateCheckoutUI();

        // Handle order confirmation
        document.querySelector('.confirm-order-btn')?.addEventListener('click', handleOrderConfirmation);
    }
}

function showCheckoutPage() {
    state.isCheckoutPage = true;
    elements.cartModal.classList.remove('active');
    document.querySelector('.products-grid').style.display = 'none';
    elements.checkoutPage.classList.add('active');
    updateCheckoutUI();
}

function updateCheckoutUI() {
    if (!elements.checkoutItems) return;
    
    elements.checkoutItems.innerHTML = '';
    let subtotal = 0;
    
    state.cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
            <button onclick="removeFromCart(${item.id})" class="remove-item">
                <i class="fas fa-times"></i>
            </button>
            <div class="checkout-item-details">
                <h4 title="${item.name}">${item.name}</h4>
                <p class="item-quantity">${item.quantity} kpl</p>
                <p class="item-total">${itemTotal.toFixed(2)} €</p>
            </div>
        `;
        elements.checkoutItems.appendChild(itemElement);
    });

    const shipping = 5.90;
    const total = subtotal + shipping;

    // Update all price displays
    document.querySelector('.subtotal').textContent = `${subtotal.toFixed(2)} €`;
    document.querySelector('.shipping').textContent = `${shipping.toFixed(2)} €`;
    document.querySelector('.total-amount').textContent = `${total.toFixed(2)} €`;
}

function updateQuantity(productId, change) {
    const item = state.cart.get(productId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        state.cartCount += change;
        state.cartTotal = calculateCartTotal(); // Use helper function
        updateCartUI();
        if (state.isCheckoutPage) {
            updateCheckoutUI();
        }
    }
}

async function handleOrderConfirmation() {
    try {
        // Here you would typically send the order to your backend
        const orderData = {
            items: Array.from(state.cart.values()),
            total: state.cartTotal + 5.90
        };
        
        console.log('Order submitted:', orderData);
        showNotification('Tilaus vastaanotettu! Kiitos tilauksestasi.', 'success');
        
        // Clear cart and reset UI
        state.cart.clear();
        state.cartCount = 0;
        state.cartTotal = 0;
        updateCartUI();
        
        // Redirect to home after short delay
        setTimeout(() => {
            state.isCheckoutPage = false;
            elements.checkoutPage.classList.remove('active');
            document.querySelector('.products-grid').style.display = 'grid';
        }, 2000);
    } catch (error) {
        showNotification('Tilauksen käsittelyssä tapahtui virhe. Yritä uudelleen.', 'error');
    }
}

function navigateToPage(pageName) {
    // Hide all pages
    elements.productsPage.style.display = 'none';
    elements.contactPage.style.display = 'none';
    elements.checkoutPage.style.display = 'none';

    // Show selected page
    switch(pageName) {
        case 'contact':
            elements.contactPage.style.display = 'block';
            break;
        case 'checkout':
            elements.checkoutPage.style.display = 'block';
            updateCheckoutUI();
            break;
        case 'products':
            elements.productsPage.style.display = 'block';
            // Ensure products container is visible
            if (elements.productsContainer) {
                elements.productsContainer.style.display = 'grid';
            }
            break;
    }

    state.currentPage = pageName;
    updateActiveNavLink();
}

function updateActiveNavLink() {
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.category === state.currentCategory);
    });
}

// Handle URL hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash === 'contact') {
        navigateToPage('contact');
    }
});

// Update initialization
document.addEventListener('DOMContentLoaded', async () => {
    cacheElements();
    initializeMenu();
    initializeSearch();
    initializeCart();
    initializeModal();
    initializeContactForm();
    initializeCategories();
    
    // Check initial hash
    const hash = window.location.hash.slice(1);
    if (hash === 'contact') {
        navigateToPage('contact');
    } else {
        await fetchProducts('new'); // Changed from 'featured' to 'new'
        // Update active nav link
        elements.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.category === 'new');
        });
    }
});

// Add this new function to handle cart indicators
function addCartIndicator(productId) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const cardButton = card.querySelector(`[data-product-id="${productId}"]`);
        if (cardButton) {
            const indicator = document.createElement('div');
            indicator.className = 'cart-indicator';
            indicator.innerHTML = '<i class="fas fa-shopping-cart"></i>';
            
            // Remove existing indicator if present
            const existingIndicator = card.querySelector('.cart-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            card.querySelector('.product-image-container').appendChild(indicator);
        }
    });
}

// New helper function to calculate cart total
function calculateCartTotal() {
    let total = 0;
    state.cart.forEach((item) => {
        total += item.price * item.quantity;
    });
    return total;
}

function initializeCategories() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            state.currentFilter = button.dataset.filter;
            filterProducts();
        });
    });
}

function filterProducts() {
    // Start with products that match the search term (if any)
    let productsToFilter = state.filteredProducts;
    
    // If a specific category filter is selected (not 'all')
    if (state.currentFilter !== 'all') {
        productsToFilter = productsToFilter.filter(product => 
            product.category && product.category.toLowerCase() === state.currentFilter.toLowerCase()
        );
    }
    
    // Update the display
    if (productsToFilter.length === 0) {
        elements.productsContainer.innerHTML = '<p class="no-products">Ei tuotteita tässä kategoriassa</p>';
    } else {
        displayProducts(productsToFilter);
    }
}

// New helper function to update cart buttons
function updateCartButtons(productId, isInCart) {
    const buttons = document.querySelectorAll(`.add-to-cart[data-product-id="${productId}"]`);
    buttons.forEach(button => {
        if (isInCart) {
            button.innerHTML = '<i class="fas fa-check"></i> Korissa';
            button.classList.add('in-cart');
        } else {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Lisää koriin';
            button.classList.remove('in-cart');
        }
    });

    // Update cart indicators
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const indicator = card.querySelector('.cart-indicator');
        const cardButton = card.querySelector(`[data-product-id="${productId}"]`);
        
        if (cardButton) {
            if (isInCart && !indicator) {
                // Add indicator
                const newIndicator = document.createElement('div');
                newIndicator.className = 'cart-indicator';
                newIndicator.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                card.querySelector('.product-image-container').appendChild(newIndicator);
            } else if (!isInCart && indicator) {
                // Remove indicator
                indicator.remove();
            }
        }
    });
}

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    initializeCheckout();
});

// Add CSS to ensure modals are hidden by default
document.addEventListener('DOMContentLoaded', () => {
    // Add style to hide modals by default
    const style = document.createElement('style');
    style.textContent = `
        .cart-modal {
            display: none;
        }
        .cart-modal.active {
            display: block;
        }
        .product-modal {
            display: none;
        }
    `;
    document.head.appendChild(style);
});
