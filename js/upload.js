import { db, storage } from './firebase-config.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js';
import { ref, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productImages = document.getElementById('productImages').files;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productCategory = document.getElementById('productCategory').value;
    const uploadStatus = document.getElementById('uploadStatus');
    const progressBar = document.getElementById('progressBar');

    if (productImages.length === 0) {
        uploadStatus.textContent = 'Por favor, selecione pelo menos uma imagem.';
        return;
    }

    try {
        uploadStatus.textContent = 'Carregando imagens...';
        progressBar.style.display = 'block';  // Exibe a barra de progresso
        progressBar.value = 0;

        const imagePaths = [];

        for (const image of productImages) {
            // Caminho do Firebase Storage: Products/{Categoria}/{Nome Produto}/{Nome da Imagem}
            const storageRef = ref(storage, `Products/${productCategory}/${productName}/${image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, image);

            // Acompanhe o progresso do upload
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.value = progress;
                },
                (error) => {
                    throw new Error(`Erro ao carregar a imagem: ${error.message}`);
                },
                async () => {
                    const snapshot = await uploadTask;
                    const gsUrl = `gs://${snapshot.ref.bucket}/${snapshot.ref.fullPath}`;
                    imagePaths.push(gsUrl);

                    // Atualiza a barra de progresso para 100% ao concluir cada imagem
                    if (imagePaths.length === productImages.length) {
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
                    }
                }
            );
        }
    } catch (error) {
        uploadStatus.textContent = `Erro ao carregar o produto: ${error.message}`;
        progressBar.style.display = 'none';  // Esconde a barra de progresso em caso de erro
    }
});

// Botão para voltar à tela inicial
document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});
