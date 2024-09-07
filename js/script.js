import { db, storage } from './firebase-config.js';
import { collection, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", function() {
    const catalog = document.getElementById('catalog');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const noProductsMessageContainer = document.querySelector('.no-products-message-container');

    // Função para buscar todos os produtos do Firestore
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

    // Função para renderizar produtos no catálogo
function renderProducts(filterCategory = 'all') {
    const loading = document.getElementById('loading');
    catalog.innerHTML = ''; // Limpa o catálogo
    noProductsMessageContainer.style.display = 'none'; // Esconde a mensagem de nenhum produto
    loading.style.display = 'flex'; // Mostra o loading

    fetchAllProducts().then(products => {
        const filteredProducts = filterCategory === 'all' ?
            products :
            products.filter(product => product.category === filterCategory);

        if (filteredProducts.length === 0) {
            noProductsMessageContainer.style.display = 'flex'; // Mostra a mensagem se não houver produtos
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const productImage = document.createElement('img');
            productImage.src = product.images.length > 0 ? product.images[0] : ''; 
            productImage.alt = product.name;
            productImage.style.cursor = 'pointer';
            productImage.addEventListener('click', () => {
                const category = encodeURIComponent(product.category);
                const name = encodeURIComponent(product.name);
                window.location.href = `viewport.html?category=${category}&name=${name}`;
            });

            const productTitle = document.createElement('h2');
            productTitle.textContent = product.name;

            const productPrice = document.createElement('p');
            productPrice.textContent = `R$ ${product.price.toFixed(2)}`;

            const buyButton = document.createElement('a');
            buyButton.href = `https://wa.me/5519971342856?text=Olá, gostaria de comprar a ${product.name}.`;
            buyButton.target = "_blank";
            buyButton.classList.add('buy-button');
            buyButton.textContent = 'Comprar';

            productCard.appendChild(productImage);
            productCard.appendChild(productTitle);
            productCard.appendChild(productPrice);
            productCard.appendChild(buyButton);

            catalog.appendChild(productCard);
        });

        loading.style.display = 'none'; // Esconde o loading após o carregamento
    });
}


    // Função para aplicar o filtro de categoria
    function applyFilter(category) {
        renderProducts(category);
        setActiveLink(category);
        closeMobileNav();
    }

    // Função para definir o link ativo na navegação
    function setActiveLink(category) {
        navLinks.forEach(link => {
            if (link.getAttribute('data-category') === category) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        mobileNavLinks.forEach(link => {
            if (link.getAttribute('data-category') === category) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Função para abrir/fechar o menu móvel
    function toggleMobileNav() {
        const mobileNav = document.querySelector('.mobile-nav-links');
        mobileNav.classList.toggle('open');
    }

    // Função para fechar o menu móvel
    function closeMobileNav() {
        const mobileNav = document.querySelector('.mobile-nav-links');
        mobileNav.classList.remove('open');
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

    // Adiciona eventos de clique aos links de navegação móvel para aplicar o filtro
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            if (link.classList.contains('manage-link')) {
                return; // Ignora o link "Gerenciar Coleções"
            }
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            applyFilter(category);
        });
    });

    // Adiciona evento de clique para o botão de alternar menu móvel
    mobileNavToggle.addEventListener('click', () => {
        toggleMobileNav();
    });
});
