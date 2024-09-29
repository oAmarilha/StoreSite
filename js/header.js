document.addEventListener("DOMContentLoaded", function() {
    const headerHtml = `
    <header>
        <div class="new-header__inner">
            <div class="new-header__left"></div>
            <div class="nav-center">
                <div style="width:33%;" class="high">
                    <a class="Margem-letra" href="index.html"><samp class="letra-boloco-selecionado">HIGH</samp></a>
                </div>
                <div style="width:33%;" class="brands">
                    <a class="Margem-letra"><samp class="letra-boloco">BRANDS</samp></a>
                </div>
                <div style="width:33%;" class="all">
                    <a class="Margem-letra" href="index.html"><samp class="letra-boloco">ALL</samp></a>
                    <div class="dropdown-content">
                        <a href="#" data-category="Camisetas">Camisetas</a>
                        <a href="#" data-category="Calças">Calças</a>
                        <a href="#" data-category="Tênis">Tênis</a>
                        <a href="#" data-category="Mochilas">Mochilas</a>
                        <a href="#" data-category="Jaquetas">Jaquetas</a>
                    </div>
                </div>
            </div>
            <div class="new-header__right"></div>
        </div>
    </header>
    `;

    const headerElement = document.querySelector('header');
    if (headerElement) {
        headerElement.innerHTML = headerHtml;
    }

    // Agora adicionamos o código para manipular a classe cor-bloco
    const highElement = document.querySelector('.high a');
    const brandsElement = document.querySelector('.brands a');
    const allElement = document.querySelector('.all a');
    const dropdown = document.querySelector('.dropdown-content');
    
    // Função para remover a classe de todos os elementos
    function removeCorBloco() {
        highElement.classList.remove('cor-bloco');
        brandsElement.classList.remove('cor-bloco');
        allElement.classList.remove('cor-bloco');
    }

    // Função para obter os parâmetros da URL
    function getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            grid: urlParams.get('grid'),
            func: urlParams.get('func'),
            category: urlParams.get('category'),
        };
    }

    const pagelocation = getQueryParams();
    checkButtonSelected();
    function checkButtonSelected(){
        if(pagelocation.func === 'renderProducts'){
            allElement.classList.add('cor-bloco');
        }
        else if(pagelocation.grid === 'productpage'){
            brandsElement.classList.add('cor-bloco');
        }
        else
        {
            highElement.classList.add('cor-bloco');
        }
    }

    // Função genérica para adicionar eventos de mouse e clique
    function adicionarEventos(elemento) {
        // Adiciona a classe ao elemento quando o mouse entra
        elemento.addEventListener('mouseenter', function() {
            removeCorBloco(); // Remove a classe de todos
            if(elemento !== dropdown){
                elemento.classList.add('cor-bloco'); // Adiciona ao elemento atual
            }
            else
            {
                allElement.classList.add('cor-bloco');
            }
        });

        // Mantém a classe no elemento clicado
        elemento.addEventListener('click', function() {
            removeCorBloco(); // Remove de todos
            elemento.classList.add('cor-bloco'); // Adiciona ao clicado
        });

        elemento.addEventListener('mouseleave', function(){
            removeCorBloco();
            checkButtonSelected(); // Chama a função se o mouse não está no dropdown
        })
    }

    // Adicionar eventos para os botões desejados
    const elementos = [
        highElement, 
        brandsElement, 
        allElement,
        dropdown]; // Lista dos elementos

    // Chama a função para cada elemento, passando o dropdown relevante
    elementos.forEach(adicionarEventos);
    
    // Função para aplicar o filtro de categoria
    function applyFilter(category) {
        window.location.href = `index.html?func=renderProducts&category=${category}`;
    }

    if (dropdown) {
        dropdown.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.getAttribute('data-category');
            applyFilter(category);
        });
    }
});