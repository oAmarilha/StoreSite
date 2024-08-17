import { storage } from './firebase-config.js';
import { ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-storage.js';

/**
 * Obtém a URL HTTPS para um arquivo armazenado no Firebase Storage.
 * @param {string} gsPath - O caminho do arquivo no formato `gs://`.
 * @returns {Promise<string>} - Uma promessa que resolve para a URL HTTPS do arquivo.
 */
export async function getImageUrl(gsPath) {
    // Remove o prefixo 'gs://' e obtém o caminho relativo
    const relativePath = gsPath.replace('gs://', '');

    // Cria uma referência ao arquivo no Firebase Storage
    const fileRef = ref(storage, relativePath);

    try {
        // Obtém a URL de download do arquivo
        const url = await getDownloadURL(fileRef);
        return url;
    } catch (error) {
        console.error('Erro ao obter URL da imagem:', error);
        throw error;
    }
}
