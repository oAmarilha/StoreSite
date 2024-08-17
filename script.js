document.addEventListener("DOMContentLoaded", function() {
    const imagesFolder = 'images/';
    const catalog = document.getElementById('catalog');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Estrutura das subcategorias
    const categories = {
        'Camisetas': ['Camisa Estilosa'],
        'Calças': ['Calça Jeans'],
        'Tênis': ['Tênis Esportivo'],
        'Vestidos': ['Vestido Floral'],
        'Jaquetas': ['Jaqueta de Couro']
    };

    // Transformando as subcategorias em uma lista de produtos
    const products = [];
    Object.keys(categories).forEach(category => {
        categories[category].forEach(product => {
            products.push({
                category: category,
                name: product
            });
        });
    });

    // Ordenando os produtos por nome
    products.sort((a, b) => a.name.localeCompare(b.name));

    function renderProducts(filterCategory = 'all') {
        catalog.innerHTML = ''; // Limpa o catálogo

        // Filtra produtos de acordo com a categoria selecionada
        const filteredProducts = filterCategory === 'all' ?
            products :
            products.filter(product => product.category === filterCategory);

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const productImage = document.createElement('img');
            productImage.src = `${imagesFolder}${product.category}/${product.name}/produto.jpg`;
            productImage.alt = product.name;
            productImage.style.cursor = 'pointer';
            productImage.addEventListener('click', () => {
                window.location.href = `product.html?category=${product.category}&name=${product.name}`;
            });

            const productTitle = document.createElement('h2');
            productTitle.textContent = product.name;

            // Preço padrão para cada produto
            const productPrice = document.createElement('p');
            productPrice.textContent = 'R$ 99,90'; // Pode ser ajustado conforme necessário

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
    }

    // Renderiza todos os produtos inicialmente
    renderProducts();

    // Adiciona event listeners para os links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            renderProducts(category);
        });
    });
});
