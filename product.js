document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const name = urlParams.get('name');

    const productInfo = document.getElementById('product-info');
    const productImages = document.getElementById('product-images');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close');

    // Carrega informações do produto
    if (category && name) {
        // Atualize com os detalhes do produto conforme necessário
        productInfo.innerHTML = `
            <h2>${name}</h2>
            <p>Categoria: ${category}</p>
            <p>Preço: R$ 99,90</p> <!-- Ajuste conforme necessário -->
        `;

        // Carrega as imagens do produto
        const imagesFolder = `images/${category}/${name}/`;
        for (let i = 1; i <= 3; i++) { // Ajuste o número de imagens conforme necessário
            const img = document.createElement('img');
            img.src = `${imagesFolder}imagem${i}.jpg`;
            img.alt = `${name} - Imagem ${i}`;
            img.classList.add('product-image');
            img.addEventListener('click', () => {
                modal.style.display = "flex";
                modalImg.src = img.src;
            });
            productImages.appendChild(img);
        }
    } else {
        productInfo.innerHTML = `<p>Produto não encontrado.</p>`;
    }

    // Fecha o modal quando clicar no X
    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Fecha o modal quando clicar fora da imagem
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
