import { db, storage } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

// Função para mostrar a visualização das imagens selecionadas
const displayImagePreviews = (files) => {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = ''; // Limpa imagens anteriores
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.marginRight = '10px';
            img.alt = `Imagem ${index + 1}`;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
};

// Função para atualizar o contador de arquivos
const updateFileCounter = (current, total) => {
    document.getElementById('currentFileNumber').textContent = `Arquivo: ${current + 1}`;
    document.getElementById('totalFilesNumber').textContent = total;
};

// Função para realizar o upload de uma imagem e atualizar o array imagePaths
const uploadImage = (image, index, productCategory, productName, imagePaths) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `Products/${productCategory}/${productName}/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.value = progress;
            },
            (error) => {
                reject(new Error(`Erro ao carregar a imagem: ${error.message}`));
            },
            async () => {
                const snapshot = await uploadTask;
                const gsUrl = `gs://${snapshot.ref.bucket}/${snapshot.ref.fullPath}`;
                imagePaths[index] = gsUrl;  // Armazena o URL no índice correto
                resolve();
            }
        );
    });
};

document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productImages = Array.from(document.getElementById('productImages').files);
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productCategory = document.getElementById('productCategory').value;
    const uploadStatus = document.getElementById('uploadStatus');
    const progressBar = document.getElementById('progressBar');

    if (productImages.length === 0) {
        uploadStatus.textContent = 'Por favor, selecione pelo menos uma imagem.';
        return;
    }

    try {
        // Exibe a visualização das imagens selecionadas
        displayImagePreviews(productImages);
        updateFileCounter(0, productImages.length); // Inicializa o contador

        uploadStatus.textContent = 'Carregando imagens...';
        progressBar.style.display = 'block';  // Exibe a barra de progresso
        progressBar.value = 0;

        const imagePaths = new Array(productImages.length);

        // Realiza o upload das imagens uma por vez
        for (let i = 0; i < productImages.length; i++) {
            await uploadImage(productImages[i], i, productCategory, productName, imagePaths);
            updateFileCounter(i, productImages.length); // Atualiza o contador de arquivos
        }

        progressBar.value = 100;
        uploadStatus.textContent = 'Salvando dados do produto...';

        // Criar um documento no Firestore com o ID igual ao nome do produto
        await setDoc(doc(db, 'products', productName), {
            name: productName,
            images: imagePaths,
            price: productPrice,
            category: productCategory
        });

        uploadStatus.textContent = 'Produto carregado com sucesso!';
        progressBar.style.display = 'none';  // Esconde a barra de progresso após o upload completo
    } catch (error) {
        uploadStatus.textContent = `Erro ao carregar o produto: ${error.message}`;
        progressBar.style.display = 'none';  // Esconde a barra de progresso em caso de erro
    }
});

// Botão para voltar à tela inicial
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});
