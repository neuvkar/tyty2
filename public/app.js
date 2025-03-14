function createProductCard(product) {
    const isInCart = state.cart.has(product.id);
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="product-image"
                 loading="lazy"
                 onerror="this.src='/images/placeholder.jpg'">
            ${isInCart ? `
                <button class="remove-from-cart-small" data-product-id="${product.id}">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${product.price.toFixed(2)} €</p>
            <button class="add-to-cart-btn ${isInCart ? 'in-cart' : ''}" data-product-id="${product.id}">
                <i class="fas fa-cart-plus"></i>
                ${isInCart ? 'Korissa' : 'Lisää koriin'}
            </button>
        </div>
    `;

    // Add click event to show modal with full details
    div.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.remove-from-cart-small')) {
            showProductModal(product);
        }
    });

    return div;
}

function updateProductButtons(productId, inCart) {
    // Update add to cart buttons
    document.querySelectorAll(`.add-to-cart-btn[data-product-id="${productId}"]`).forEach(button => {
        button.classList.toggle('in-cart', inCart);
        button.innerHTML = `
            <i class="fas fa-cart-plus"></i>
            ${inCart ? 'Korissa' : 'Lisää koriin'}
        `;
    });

    // Update remove buttons
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const imageContainer = card.querySelector('.product-image-container');
        const existingButton = card.querySelector(`button[data-product-id="${productId}"]`);
        
        if (inCart && !existingButton) {
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-from-cart-small';
            removeButton.setAttribute('data-product-id', productId);
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            imageContainer.appendChild(removeButton);
        } else if (!inCart && existingButton) {
            existingButton.remove();
        }
    });
}
