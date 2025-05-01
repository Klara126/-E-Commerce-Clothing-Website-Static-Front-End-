// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation and Search
    const searchIcon = document.getElementById('search-icon');
    const searchContainer = document.querySelector('.search-container');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Product Related
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const modal = document.getElementById('quick-view-modal');
    const closeModal = document.querySelector('.close-modal');
    
    // Cart Related
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    const removeItemBtns = document.querySelectorAll('.remove-item');
    
    // Filter and Sort
    const filterCheckboxes = document.querySelectorAll('.filter-option input, .color-option input');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const sortSelect = document.getElementById('sort-by');
    const viewOptions = document.querySelectorAll('.view-option');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyPriceBtn = document.getElementById('apply-price');
    
    // Checkout
    const nextStepBtns = document.querySelectorAll('.next-step');
    const prevStepBtns = document.querySelectorAll('.prev-step');
    const editBtns = document.querySelectorAll('.edit-btn');
    const placeOrderBtn = document.getElementById('place-order');
    
    // Cart Data
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Initialize
    updateCartCount();
    updateCartDisplay();
    
    // Toggle search container
    if (searchIcon) {
        searchIcon.addEventListener('click', function(e) {
            e.preventDefault();
            searchContainer.classList.toggle('active');
        });
    }
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Add to cart functionality
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productCard = this.closest('.product-card') || this.closest('.product-quick-view');
                const productName = productCard.querySelector('h3')?.textContent || productCard.querySelector('h2')?.textContent;
                const productPrice = productCard.querySelector('.product-price').textContent.replace('$', '');
                const productImage = productCard.querySelector('img').getAttribute('src');
                
                // Check if product is already in cart
                const existingItem = cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: productId,
                        name: productName,
                        price: parseFloat(productPrice.split(' ')[0]),
                        image: productImage,
                        quantity: 1
                    });
                }
                
                // Save to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count
                updateCartCount();
                
                // Show notification
                showNotification(`${productName} added to cart!`);
            });
        });
    }
    
    // Quick view functionality
    if (quickViewButtons && modal) {
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                const productImage = productCard.querySelector('img').getAttribute('src');
                
                // Update modal content
                document.getElementById('modal-product-title').textContent = productName;
                document.getElementById('modal-product-price').textContent = productPrice;
                document.querySelector('.product-quick-view-image img').setAttribute('src', productImage);
                document.getElementById('modal-product-description').textContent = `This ${productName} is a high-quality item that will be a great addition to your wardrobe. Made with premium materials for comfort and durability.`;
                
                // Set the add to cart button data-id
                document.getElementById('modal-add-to-cart').setAttribute('data-id', productId);
                
                // Show modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Close modal
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Quantity buttons in cart
    if (quantityBtns) {
        quantityBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                let value = parseInt(input.value);
                
                if (this.classList.contains('minus') && value > 1) {
                    value--;
                } else if (this.classList.contains('plus') && value < 10) {
                    value++;
                }
                
                input.value = value;
                
                // Update cart if on cart page
                if (window.location.pathname.includes('cart.html')) {
                    const cartItem = this.closest('.cart-item');
                    const productId = cartItem.getAttribute('data-id');
                    
                    // Update cart data
                    const cartItemIndex = cart.findIndex(item => item.id === productId);
                    if (cartItemIndex !== -1) {
                        cart[cartItemIndex].quantity = value;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        
                        // Update item total
                        const price = cart[cartItemIndex].price;
                        const totalElement = cartItem.querySelector('.cart-item-total');
                        totalElement.textContent = `$${(price * value).toFixed(2)}`;
                        
                        // Update cart totals
                        updateCartTotals();
                    }
                }
            });
        });
    }
    
    // Remove item from cart
    if (removeItemBtns) {
        removeItemBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const cartItem = this.closest('.cart-item');
                const productId = cartItem.getAttribute('data-id');
                
                // Remove from cart array
                cart = cart.filter(item => item.id !== productId);
                
                // Save to localStorage
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Remove from DOM
                cartItem.remove();
                
                // Update cart count
                updateCartCount();
                
                // Update cart totals
                updateCartTotals();
                
                // Check if cart is empty
                updateCartDisplay();
            });
        });
    }
    
    // Filter products
    if (filterCheckboxes && document.getElementById('product-grid')) {
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', filterProducts);
        });
    }
    
    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Uncheck all checkboxes
            filterCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Reset price inputs
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            
            // Reset products
            filterProducts();
        });
    }
    
    // Apply price filter
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', filterProducts);
    }
    
    // Sort products
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }
    
    // View options (grid/list)
    if (viewOptions) {
        viewOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                viewOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Get view type
                const viewType = this.getAttribute('data-view');
                
                // Update product grid
                const productGrid = document.getElementById('product-grid');
                if (productGrid) {
                    if (viewType === 'list') {
                        productGrid.classList.add('list-view');
                    } else {
                        productGrid.classList.remove('list-view');
                    }
                }
            });
        });
    }
    
    // Checkout steps
    if (nextStepBtns) {
        nextStepBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const currentStep = this.closest('.checkout-step');
                const nextStepId = this.getAttribute('data-next');
                const nextStep = document.getElementById(nextStepId);
                
                // Hide current step
                currentStep.classList.remove('active');
                
                // Show next step
                nextStep.classList.add('active');
                
                // Update progress
                updateCheckoutProgress(nextStepId);
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
        });
    }
    
    // Previous step
    if (prevStepBtns) {
        prevStepBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const currentStep = this.closest('.checkout-step');
                const prevStepId = this.getAttribute('data-prev');
                const prevStep = document.getElementById(prevStepId);
                
                // Hide current step
                currentStep.classList.remove('active');
                
                // Show previous step
                prevStep.classList.add('active');
                
                // Update progress
                updateCheckoutProgress(prevStepId);
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
        });
    }
    
    // Edit step
    if (editBtns) {
        editBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const stepId = this.getAttribute('data-step');
                const step = document.getElementById(stepId);
                
                // Hide all steps
                document.querySelectorAll('.checkout-step').forEach(s => {
                    s.classList.remove('active');
                });
                
                // Show selected step
                step.classList.add('active');
                
                // Update progress
                updateCheckoutProgress(stepId);
                
                // Scroll to top
                window.scrollTo(0, 0);
            });
        });
    }
    
    // Place order
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            alert('Thank you for your order! This is a demo, so no actual order has been placed.');
            
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
    
    // Check URL parameters for category filter
    if (window.location.search && document.getElementById('product-grid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const sale = urlParams.get('sale');
        
        if (category) {
            // Check the corresponding checkbox
            const checkbox = document.querySelector(`.filter-option input[value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
                
                // Update page title
                const pageTitle = document.getElementById('product-page-title');
                if (pageTitle) {
                    pageTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`;
                }
            }
        }
        
        if (sale === 'true') {
            // Check the sale checkbox
            const saleCheckbox = document.querySelector('.filter-option input[value="true"]');
            if (saleCheckbox) {
                saleCheckbox.checked = true;
                
                // Update page title
                const pageTitle = document.getElementById('product-page-title');
                if (pageTitle) {
                    pageTitle.textContent = 'Sale Items';
                }
            }
        }
        
        // Apply filters
        filterProducts();
    }
    
    // Helper Functions
    
    // Update cart count
    function updateCartCount() {
        if (cartCountElement) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }
    
    // Update cart display (empty or with items)
    function updateCartDisplay() {
        if (emptyCart && cartContent) {
            if (cart.length === 0) {
                emptyCart.style.display = 'block';
                cartContent.style.display = 'none';
            } else {
                emptyCart.style.display = 'none';
                cartContent.style.display = 'block';
            }
        }
    }
    
    // Update cart totals
    function updateCartTotals() {
        const subtotalElement = document.getElementById('cart-subtotal');
        const shippingElement = document.getElementById('cart-shipping');
        const taxElement = document.getElementById('cart-tax');
        const totalElement = document.getElementById('cart-total');
        
        if (subtotalElement && totalElement) {
            // Calculate subtotal
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            
            // Set shipping cost
            const shipping = subtotal > 0 ? 5.99 : 0;
            
            // Calculate tax (10%)
            const tax = subtotal * 0.1;
            
            // Calculate total
            const total = subtotal + shipping + tax;
            
            // Update elements
            subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
            if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
            if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }
    
    // Filter products
    function filterProducts() {
        const productGrid = document.getElementById('product-grid');
        const productCards = productGrid.querySelectorAll('.product-card');
        const productCount = document.getElementById('product-count');
        
        // Get filter values
        const selectedCategories = Array.from(document.querySelectorAll('.filter-option input[name="category"]:checked')).map(cb => cb.value);
        const selectedSizes = Array.from(document.querySelectorAll('.filter-option input[name="size"]:checked')).map(cb => cb.value);
        const selectedColors = Array.from(document.querySelectorAll('.color-option input:checked')).map(cb => cb.value);
        const onSale = document.querySelector('.filter-option input[name="sale"]:checked') !== null;
        
        // Get price range
        const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;
        
        // Get sort value
        const sortBy = sortSelect ? sortSelect.value : 'featured';
        
        // Filter products
        let visibleCount = 0;
        
        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const price = parseFloat(card.getAttribute('data-price'));
            const color = card.getAttribute('data-color');
            const isSale = card.getAttribute('data-sale') === 'true';
            
            // Check if product matches filters
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
            const matchesPrice = price >= minPrice && price <= maxPrice;
            const matchesColor = selectedColors.length === 0 || selectedColors.includes(color);
            const matchesSale = !onSale || isSale;
            
            // Show or hide product
            if (matchesCategory && matchesPrice && matchesColor && matchesSale) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update product count
        if (productCount) {
            productCount.textContent = visibleCount;
        }
        
        // Sort products
        sortProducts(sortBy);
    }
    
    // Sort products
    function sortProducts(sortBy) {
        const productGrid = document.getElementById('product-grid');
        const productCards = Array.from(productGrid.querySelectorAll('.product-card'));
        
        // Sort products
        productCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));
            
            switch (sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    // For demo purposes, we'll just reverse the order
                    return -1;
                case 'bestselling':
                    // For demo purposes, we'll just use a random order
                    return 0.5 - Math.random();
                default:
                    // Featured - no specific sort
                    return 0;
            }
        });
        
        // Reorder products in the DOM
        productCards.forEach(card => {
            productGrid.appendChild(card);
        });
    }
    
    // Update checkout progress
    function updateCheckoutProgress(stepId) {
        const steps = document.querySelectorAll('.progress-step');
        
        steps.forEach(step => {
            step.classList.remove('active');
        });
        
        if (stepId === 'shipping-step') {
            steps[0].classList.add('active');
        } else if (stepId === 'payment-step') {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
        } else if (stepId === 'review-step') {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
            steps[2].classList.add('active');
        }
    }
    
    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1100;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .product-grid.list-view {
            grid-template-columns: 1fr;
        }
        
        .product-grid.list-view .product-card {
            display: flex;
            height: 200px;
        }
        
        .product-grid.list-view .product-image {
            width: 200px;
            height: 100%;
            flex-shrink: 0;
        }
        
        .product-grid.list-view .product-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
});