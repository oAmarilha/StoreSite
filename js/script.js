import { db, storage } from './firebase-config.js';
import { collection, getDocs, query } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", function() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostra o loading
    const catalog = document.getElementById('catalog');

    // Função para obter os parâmetros da URL
    function getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            func: urlParams.get('func'),
            category: urlParams.get('category'),
        };
    }

    // Captura os parâmetros da URL e chama a função correspondente
    const queryParams = getQueryParams();
    if (queryParams.func === 'renderProducts' && queryParams.category !== "all") {
        renderProducts(queryParams.category);
        const allLink = document.querySelector('.all .Margem-letra'); // Elemento onde o texto "ALL" está
        // Atualiza o texto do link "ALL" com o texto do link clicado
        allLink.innerHTML = `<samp class="letra-boloco">${queryParams.category}</samp>`;
        removeCategory(queryParams.category);
        addCategory('all', 'Todos')
    }
    else
    {    
        // Inicializa o catálogo com todos os produtos
        renderProducts();
    }

    // Função para adicionar um novo link como o primeiro
    function addCategory(category, label) {
        const dropdownContent = document.querySelector('.dropdown-content');
        const newLinkHTML = `<a href="#" data-category="${category}">${label}</a>`;
        dropdownContent.insertAdjacentHTML('afterbegin', newLinkHTML); // Adiciona o novo link como o primeiro elemento
    }

    function removeCategory(category) {
        const dropdownLinks = document.querySelectorAll('.dropdown-content a'); // Seleciona todos os links no dropdown
        dropdownLinks.forEach(link => {
            if (link.getAttribute('data-category') === category) {
                link.remove(); // Remove o link que corresponde à categoria
            }
        });
    }

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
        catalog.innerHTML = ''; // Limpa o catálogo
        loading.style.display = 'flex'; // Mostra o loading
    
        fetchAllProducts().then(products => {
            const filteredProducts = filterCategory === 'all' ?
                products :
                products.filter(product => product.category === filterCategory);
            
            // Cria o elemento da mensagem se ainda não existir
            let noProductsMessage = document.querySelector('.no-products-message');
            if (!noProductsMessage) {
                noProductsMessage = document.createElement('div');
                noProductsMessage.classList.add('no-products-message');
                noProductsMessage.textContent = 'Nenhum produto encontrado.';
                catalog.appendChild(noProductsMessage); // Adiciona ao DOM dentro do catálogo
            }
    
            // Atualiza a visibilidade da mensagem
            if (filteredProducts.length === 0) {
                noProductsMessage.style.display = 'block'; // Exibe a mensagem
            } else {
                noProductsMessage.style.display = 'none'; // Esconde a mensagem
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
                        window.location.href = `viewport.html?grid=productpage&category=${category}&name=${name}`;
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
            }
            loading.style.display = 'none'; // Esconde o loading após o carregamento
        });
    }

    const bannerDiv = document.querySelector('.banner');

// Fetch banner images from Firestore
async function fetchBannerImages() {
    const bannerCollection = collection(db, 'banner');
    const querySnapshot = await getDocs(bannerCollection);
    const imageUrls = [];

    for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        let imagePaths = [];
        if (Array.isArray(data.imagePath)) {
            imagePaths = data.imagePath;
        } else if (typeof data.imagePath === 'string') {
            imagePaths = [data.imagePath];
        }

        for (const imagePath of imagePaths) {
            try {
                const imageRef = ref(storage, imagePath.trim());
                const imageUrl = await getDownloadURL(imageRef);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error("Error fetching image URL:", error);
            }
        }
    }

    return imageUrls;
}

// Render banner images with smooth transitions
async function renderBanner() {
    const imageUrls = await fetchBannerImages();

    if (imageUrls.length === 0) {
        bannerDiv.innerHTML = '<p>No banners available</p>';
        return;
    }

    let currentIndex = 0;
    let autoSlideInterval;

    // Create image elements and set initial opacity
    imageUrls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.style.opacity = index === 0 ? '1' : '0';
        img.classList.add('banner-image', 'fade');
        bannerDiv.appendChild(img);
    });

    const images = bannerDiv.querySelectorAll('.banner-image');

    // Function to show a specific image with a fade effect
    function showImage(index) {
        images[currentIndex].style.opacity = '0'; // Fade out the current image
        currentIndex = index;
        images[currentIndex].style.opacity = '1'; // Fade in the next image
        updateDots();
    }

    // Function to show the next image
    function showNextImage() {
        showImage((currentIndex + 1) % imageUrls.length);
    }

    // Function to show the previous image
    function showPreviousImage() {
        showImage((currentIndex - 1 + imageUrls.length) % imageUrls.length);
    }

    // Create dots for navigation
    const dotsContainer = document.createElement('div');
    dotsContainer.classList.add('dots-container');
    imageUrls.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => showImage(index));
        dotsContainer.appendChild(dot);
    });
    bannerDiv.appendChild(dotsContainer);

    // Update dot appearance based on the current image
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Automatic scrolling
    autoSlideInterval = setInterval(showNextImage, 7000);

    // User controls for next and previous
    const nextButton = document.createElement('button');
    nextButton.classList.add('arrow', 'next');
    nextButton.innerHTML = '&#9654;'; // Right arrow symbol
    nextButton.addEventListener('click', () => {
        clearInterval(autoSlideInterval); // Stop auto-slide when user interacts
        showNextImage();
        autoSlideInterval = setInterval(showNextImage, 7000); // Restart auto-slide
    });
    bannerDiv.appendChild(nextButton);

    const prevButton = document.createElement('button');
    prevButton.classList.add('arrow', 'prev');
    prevButton.innerHTML = '&#9664;'; // Left arrow symbol
    prevButton.addEventListener('click', () => {
        clearInterval(autoSlideInterval);
        showPreviousImage();
        autoSlideInterval = setInterval(showNextImage, 7000);
    });
    bannerDiv.appendChild(prevButton);
}

renderBanner();
});
