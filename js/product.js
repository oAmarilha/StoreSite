// js/product.js

import { db, storage } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

let currentImageIndex = 0; // Índice da imagem atual
const modal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const images = []; // Array para armazenar URLs das imagens

// Função para buscar um produto pelo nome
async function fetchProductByName(name) {
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const imageUrls = await Promise.all(data.images.map(async (imagePath) => {
            const imageRef = ref(storage, imagePath);
            return getDownloadURL(imageRef);
        }));

        return {
            category: data.category,
            name: data.name,
            price: data.price,
            images: imageUrls
        };
    } else {
        console.error('Produto não encontrado!');
        return null;
    }
}

// Função para renderizar os detalhes do produto
function renderProductDetails(product) {
    if (product) {
        const title = document.createElement('h2');
        title.textContent = product.name;

        const price = document.createElement('p');
        price.textContent = `R$ ${product.price.toFixed(2)}`;

        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('product-images');

        // Adiciona as imagens ao contêiner
        product.images.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = product.name;
            img.addEventListener('click', () => {
                images.length = 0; // Limpa o array de imagens
                images.push(...product.images); // Adiciona todas as imagens
                currentImageIndex = index;
                showImage(currentImageIndex);
            });

            imagesContainer.appendChild(img);
        });

        const productInfo = document.querySelector('.product-info');
        productInfo.appendChild(title);
        productInfo.appendChild(price);
        productInfo.appendChild(imagesContainer);
    }
}

// Função para exibir a imagem no modal
function showImage(index) {
    if (images.length > 0) {
        modalImage.src = images[index];
        modal.style.display = 'flex';
    }
}

// Função para exibir a próxima imagem
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showImage(currentImageIndex);
}

// Função para exibir a imagem anterior
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showImage(currentImageIndex);
}

// Evento para fechar o modal
document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
});

// Eventos para os botões de navegação
prevButton.addEventListener('click', showPrevImage);
nextButton.addEventListener('click', showNextImage);

// Função para obter os parâmetros da URL
function getQueryParams() {
    const query = new URLSearchParams(window.location.search);
    return {
        category: query.get('category'),
        name: query.get('name')
    };
}

// Função para carregar o produto com base na URL
async function loadProduct() {
    const { name } = getQueryParams();
    if (name) {
        const product = await fetchProductByName(name);
        renderProductDetails(product);
    }
}

// Chama a função para carregar o produto ao carregar a página
loadProduct();
