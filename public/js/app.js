let cart = JSON.parse(localStorage.getItem('cart')) || [];

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('active');
    
    // Body Scroll Lock
    if (sidebar.classList.contains('active')) {
        document.body.classList.add('no-scroll');
        // Close nav if open
        document.querySelector('.nav-links').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

function toggleMobileNav() {
    const nav = document.querySelector('.nav-links');
    const toggle = document.querySelector('.menu-toggle');
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
    
    // Body Scroll Lock
    if (nav.classList.contains('active')) {
        document.body.classList.add('no-scroll');
        // Close cart if open
        document.getElementById('cart-sidebar').classList.remove('active');
    } else {
        document.body.classList.remove('no-scroll');
    }
}

// Close mobile menu on resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        document.querySelector('.nav-links').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
        document.getElementById('cart-sidebar').classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update count in header
    if (cartCount) {
        cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Update sidebar items
    if (cartItems) {
        cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartItems.innerHTML += `
                <div style="display: flex; margin-bottom: 2rem; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 1.5rem;">
                    <img src="${item.image_url}" style="width: 70px; height: 70px; object-fit: cover; margin-right: 20px;" loading="lazy">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px;">${item.name}</div>
                        <div style="font-size: 0.85rem; color: var(--accent-color); font-weight: 600;">${item.price} DH <span style="color: #999; font-weight: 300; font-size: 0.7rem; margin-left: 10px;">x ${item.quantity}</span></div>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ccc; cursor: pointer; font-size: 1.2rem; transition: 0.3s;" onmouseover="this.style.color='#000'" onmouseout="this.style.color='#ccc'">&times;</button>
                </div>
            `;
        });
        
        if (cartTotal) {
            cartTotal.innerText = total.toFixed(2) + ' DH';
        }
    }
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    
    if (currentQty + 1 > product.stock_quantity) {
        alert(`Désolé, il ne reste que ${product.stock_quantity} unités en stock pour ce modèle.`);
        return;
    }

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    
    // Open cart with scroll lock
    document.getElementById('cart-sidebar').classList.add('active');
    document.body.classList.add('no-scroll');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    
    if (cart.length === 0) {
        document.body.classList.remove('no-scroll');
        document.getElementById('cart-sidebar').classList.remove('active');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function goToCheckout() {
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }
    window.location.href = 'checkout.html';
}

function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const img = modal.querySelector('.modal-img img');
    const brand = modal.querySelector('.modal-brand');
    const title = modal.querySelector('.modal-title');
    const price = modal.querySelector('.modal-price');
    const desc = modal.querySelector('.modal-desc');
    const addToCartBtn = modal.querySelector('.btn-luxe');

    img.src = product.image_url;
    brand.innerText = product.category || 'Luxury Collection';
    title.innerText = product.name;
    price.innerText = parseFloat(product.price).toFixed(2) + ' DH';
    desc.innerText = product.description || 'Une pièce d\'exception de notre collection.';
    
    // Set onclick for the "Add to Cart" button in modal
    addToCartBtn.onclick = () => {
        addToCart(product);
        closeProductModal();
    };

    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
        if (document.getElementById('cart-sidebar').classList.contains('active')) {
            toggleCart();
        }
    }
});

// Initialize UI
document.addEventListener('DOMContentLoaded', updateCartUI);
