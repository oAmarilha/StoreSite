// js/product.js
import { db, storage } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const name = urlParams.get('name');

    const productInfo = document.getElementById('product-info');
    const productImages = document.getElementById('product-images');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close');

    if (category && name) {
        const productDoc = doc(db, 'products', name);
        getDoc(productDoc).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                productInfo.innerHTML = `
                    <h2>${data.name}</h2>
                    <p>Categoria: ${data.Category}</p>
                    <p>Preço: R$ ${data.price.toFixed(2)}</p>
                `;

                data.images.forEach(imagePath => {
                    const img = document.createElement('img');
                    const imageRef = ref(storage, imagePath);
                    getDownloadURL(imageRef).then(url => {
                        img.src = url;
                        img.alt = `${data.name} - Imagem`;
                        img.classList.add('product-image');
                        img.addEventListener('click', () => {
                            modal.style.display = 'block';
                            modalImg.src = url;
                        });
                        productImages.appendChild(img);
                    });
                });
            } else {
                productInfo.innerHTML = '<p>Produto não encontrado.</p>';
            }
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
