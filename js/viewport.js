// js/viewport.js

import { db, storage } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

const images = []; // Array para armazenar URLs das imagens
let currentImageIndex = 0;

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

// Função para obter os parâmetros da URL
function getQueryParams() {
    const query = new URLSearchParams(window.location.search);
    return {
        category: query.get('category'),
        name: query.get('name')
    };
}

// Função para exibir as imagens no HTML
async function displayProductImages() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostra o loading
    const { name } = getQueryParams();
    if (name) {
        const product = await fetchProductByName(name);
        if (product) {
            const title = document.getElementById('title')
            title.textContent = product.name;
            const price = document.getElementById('price');
            price.textContent = `R$ ${product.price.toFixed(2)}`;
            const topImagesContainer = document.querySelector('.top-images');
            const bottomImagesContainer = document.querySelector('.bottom-images');
            
            // Limpar as imagens existentes
            topImagesContainer.innerHTML = '';
            bottomImagesContainer.innerHTML = '';
            
            // Adicionar as imagens nas seções
            product.images.forEach((url, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.alt = `Imagem ${index + 1}`;
                imgElement.classList.add('product-image'); // Adiciona uma classe para estilizar se necessário
                imgElement.style.cursor = 'pointer'; // Indica que a imagem é clicável

                imgElement.addEventListener('click', () => openModal(index)); // Adiciona evento de clique

                if (index < 2) {
                    topImagesContainer.appendChild(imgElement);
                } else {
                    bottomImagesContainer.appendChild(imgElement);
                }
            });

            // Salva as imagens e o índice atual para navegação
            images.push(...product.images);
        }
    }
    loading.style.display = 'none'; // Esconde o loading após o carregamento
}

// Função para abrir o modal
function openModal(index) {
    console.log('openModal chamado com index:', index); // Adiciona log para depuração
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const counter = document.getElementById('image-counter');
    modal.style.display = 'flex';
    modalImage.src = images[index];
    currentImageIndex = index;
    counter.textContent = `${currentImageIndex + 1} de ${images.length}`; // Atualiza o contador

    // Adiciona evento de clique para fechar o modal ao clicar fora da imagem
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
}

// Função para mostrar a imagem anterior
function showPrevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = images.length - 1; // Vai para a última imagem
    }
    document.getElementById('modal-image').src = images[currentImageIndex];
    document.getElementById('image-counter').textContent = `${currentImageIndex + 1} de ${images.length}`; // Atualiza o contador
}

// Função para mostrar a próxima imagem
function showNextImage() {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0; // Vai para a primeira imagem
    }
    document.getElementById('modal-image').src = images[currentImageIndex];
    document.getElementById('image-counter').textContent = `${currentImageIndex + 1} de ${images.length}`; // Atualiza o contador
}

// Adiciona eventos para os botões de navegação
document.querySelector('.close').addEventListener('click', closeModal);
document.querySelector('.prev').addEventListener('click', showPrevImage);
document.querySelector('.next').addEventListener('click', showNextImage);

// Chamar a função para exibir as imagens após o carregamento do documento
document.addEventListener('DOMContentLoaded', displayProductImages);
