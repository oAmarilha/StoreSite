// js/product.js
import { db, storage } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const name = urlParams.get('name');

    const productInfo = document.getElementById('product-info');

    async function fetchProductImages() {
        const productCollection = collection(db, 'products');
        const q = query(productCollection, where('category', '==', category), where('name', '==', name));
        
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            productInfo.innerHTML = '<p>Produto não encontrado.</p>';
            return;
        }

        const productDoc = querySnapshot.docs[0].data();
        const imageUrls = await Promise.all(productDoc.images.map(async (imagePath) => {
            const imageRef = ref(storage, imagePath);
            return getDownloadURL(imageRef);
        }));

        return imageUrls;
    }

    async function renderProductImages() {
        const imageUrls = await fetchProductImages();
        productInfo.innerHTML = ''; // Limpa a área de informações do produto

        if (imageUrls.length === 0) {
            productInfo.innerHTML = '<p>Sem imagens disponíveis.</p>';
            return;
        }

        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('product-images');

        imageUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Imagem do produto';
            imagesContainer.appendChild(img);
        });

        productInfo.appendChild(imagesContainer);
    }

    renderProductImages();
});
