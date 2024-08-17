import { db, storage } from './firebase-config.js';
import { collection, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", function() {
    const catalog = document.getElementById('catalog');
    const navLinks = document.querySelectorAll('.nav-links a');

    async function fetchAllProducts() {
        const products = [];
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection);

        const querySnapshot = await getDocs(q);
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const imageUrls = await Promise.all(data.images.map(async (imagePath) => {
                const imageRef = ref(storage, imagePath);
                return getDownloadURL(imageRef);
            }));

            products.push({
                category: data.category || 'Outras', // Garantir que a categoria esteja presente
                name: data.name,
                price: data.price,
                images: imageUrls
            });
        }

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

                // Verifica se há imagens e usa a primeira
                const productImage = document.createElement('img');
                productImage.src = product.images.length > 0 ? product.images[0] : ''; // Usa a primeira imagem ou define como vazio
                productImage.alt = product.name;
                productImage.style.cursor = 'pointer';
                productImage.addEventListener('click', () => {
                    const category = encodeURIComponent(product.category);
                    const name = encodeURIComponent(product.name);
                    window.location.href = `product.html?category=${category}&name=${name}`;
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

    // Função para aplicar o filtro de categoria
    function applyFilter(category) {
        renderProducts(category);
    }

    // Inicializa o catálogo com todos os produtos
    renderProducts();

    // Adiciona eventos de clique aos links de navegação para aplicar o filtro
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            applyFilter(category);
        });
    });
});
