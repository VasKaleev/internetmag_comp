let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('db.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
            updateCartCount();
        });
});

function toggleSubMenu(id) {
    const submenu = document.getElementById(id);
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
}

function filterCategory(category) {
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

function filterProducts() {
    const search = document.getElementById('search').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(search) &&
        product.price >= minPrice &&
        product.price <= maxPrice
    );

    displayProducts(filteredProducts);
}

function sortProducts() {
    const sort = document.getElementById('sort').value;
    let sortedProducts = [...products];

    if (sort === 'name_asc') {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'price_asc') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
        sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_asc') {
        sortedProducts.sort((a, b) => a.rating - b.rating);
    } else if (sort === 'rating_desc') {
        sortedProducts.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'date_asc') {
        sortedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === 'date_desc') {
        sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    displayProducts(sortedProducts);
}

function displayProducts(products, page = 1, itemsPerPage = 21) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    paginatedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <img src="images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price} руб.</p>
            <button onclick="addToCart(${product.id})">Добавить в корзину</button>
            <button onclick="viewProduct(${product.id})">Подробнее</button>
        `;
        productsContainer.appendChild(productElement);
    });

    displayPagination(products.length, page, itemsPerPage);
}

function displayPagination(totalItems, currentPage, itemsPerPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.onclick = () => displayProducts(products, i, itemsPerPage);
        pagination.appendChild(pageButton);
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

function openCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'flex';
    updateCartModal();
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none';
}

function updateCartModal() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="images/${item.image}" alt="${item.name}" width="50">
            <span>${item.name} - ${item.quantity} x ${item.price} руб.</span>
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
            <button onclick="removeFromCart(${item.id})">Удалить</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

function changeQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartModal();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
}

function placeOrder() {
    alert('Заказ оформлен!');
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    closeCartModal();
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const image = document.getElementById('product-modal-image');
    const description = document.getElementById('product-modal-description');
    const price = document.getElementById('product-modal-price');

    title.textContent = product.name;
    image.src = `images/${product.image}`;
    description.textContent = product.description;
    price.textContent = `Цена: ${product.price} руб.`;

    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}