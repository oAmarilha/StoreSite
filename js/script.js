// js/script.js
import { db, storage } from './firebase-config.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", function() {
    const imagesFolder = 'images/';
    const catalog = document.getElementById('catalog');
    const navLinks = document.querySelectorAll('.nav-links a');

    async function fetchAllProducts() {
        const products = [];
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection);

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            products.push({
                category: data.Category,
                name: data.name,
                price: data.price,
                images: data.images
            });
        });

        // Ordena os produtos por nome
        products.sort((a, b) => a.name.localeCompare(b.name));
        return products;
    }

    function renderProducts(filterCategory = 'all') {
        catalog.innerHTML = ''; // Limpa o catálogo

        fetchAllProducts().then(products => {
            const filteredProducts = filterCategory === 'all' ?
                products :
                products.filter(product => product.category === filterCategory);

            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                const productImage = document.createElement('img');
                productImage.src = product.images[0]; // Pegue a primeira imagem
                productImage.alt = product.name;
                productImage.style.cursor = 'pointer';
                productImage.addEventListener('click', () => {
                    window.location.href = `product.html?category=${product.category}&name=${product.name}`;
                });

                const productTitle = document.createElement('h2');
                productTitle.textContent = product.name;

                const productPrice = document.createElement('p');
                productPrice.textContent = `R$ ${product.price.toFixed(2)}`;

                const buyButton = document.createElement('a');
                buyButton.href = `https://wa.me/5519971342856?text=Olá, gostaria de comprar a ${product.name}.`;
                buyButton.target = "_blank"; // Abre em uma nova guia
                buyButton.classList.add('buy-button');
                buyButton.textContent = 'Comprar';

                productCard.appendChild(productImage);
                productCard.appendChild(productTitle);
                productCard.appendChild(productPrice);
                productCard.appendChild(buyButton);

                catalog.appendChild(productCard);
            });
        });
    }

    renderProducts();

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            renderProducts(category);
        });
    });
});
