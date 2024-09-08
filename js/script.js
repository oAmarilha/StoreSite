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
            const category = encodeURIComponent(product.category);
            const name = encodeURIComponent(product.name);
            productImage.addEventListener('click', () => {
                window.location.href = `viewport.html?category=${category}&name=${name}`;
            });

            const productTitle = document.createElement('h2');
            productTitle.textContent = product.name;

            const productPrice = document.createElement('p');
            productPrice.textContent = `R$ ${product.price.toFixed(2)}`;

            const buyButton = document.createElement('a');
            buyButton.href = `viewport.html?category=${category}&name=${name}`;
            buyButton.target = "_self";
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

    const bannerDiv = document.querySelector('.banner');

    // Fetch banner images from Firestore
    async function fetchBannerImages() {
        const bannerCollection = collection(db, 'banner');
        const querySnapshot = await getDocs(bannerCollection);
        const imageUrls = [];

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            
            // Check if imagePath is an array or a single string
            let imagePaths = [];
            
            if (Array.isArray(data.imagePath)) {
                // If it's an array, use it directly
                imagePaths = data.imagePath;
            } else if (typeof data.imagePath === 'string') {
                // If it's a string, handle it as a single image path
                imagePaths = [data.imagePath];
            }

            // Process each imagePath
            for (const imagePath of imagePaths) {
                try {
                    const imageRef = ref(storage, imagePath.trim()); // Trim any extra spaces
                    const imageUrl = await getDownloadURL(imageRef);
                    imageUrls.push(imageUrl);
                } catch (error) {
                    console.error("Error fetching image URL:", error);
                }
            }
        }

        return imageUrls;
    }


    // Render banner images with automatic scrolling
    async function renderBanner() {
        const imageUrls = await fetchBannerImages();

        if (imageUrls.length === 0) {
            bannerDiv.innerHTML = '<p>No banners available</p>';
            return;
        }

        let currentIndex = 0;

        // Create image elements
        imageUrls.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.style.display = index === 0 ? 'block' : 'none';
            img.classList.add('banner-image');
            bannerDiv.appendChild(img);
        });

        // Function to show the next image
        function showNextImage() {
            bannerDiv.querySelectorAll('.banner-image')[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % imageUrls.length;
            bannerDiv.querySelectorAll('.banner-image')[currentIndex].style.display = 'block';
        }

        // Function to show the previous image
        function showPreviousImage() {
            bannerDiv.querySelectorAll('.banner-image')[currentIndex].style.display = 'none';
            currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
            bannerDiv.querySelectorAll('.banner-image')[currentIndex].style.display = 'block';
        }

        // Automatic scrolling
        setInterval(showNextImage, 5000); // Change every 5 seconds

        // User controls for next and previous
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', showNextImage);
        bannerDiv.appendChild(nextButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', showPreviousImage);
        bannerDiv.appendChild(prevButton);
    }

    renderBanner();
});
