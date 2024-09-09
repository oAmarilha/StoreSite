document.addEventListener("DOMContentLoaded", function() {
    const headerHtml = `
    <header>
        <div class="new-header__inner">
            <div class="new-header__left"></div>
            <div class="nav-center">
                <div style="width:33%;" class="high">
                    <a class="Margem-letra cor-bloco" href="index.html"><samp class="letra-boloco-selecionado">HIGH</samp></a>
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
    
    // Função para remover a classe de todos os elementos
    function removeCorBloco() {
        highElement.classList.remove('cor-bloco');
        brandsElement.classList.remove('cor-bloco');
        allElement.classList.remove('cor-bloco');
    }

    // Adiciona a classe ao HIGH quando o mouse entra
    highElement.addEventListener('mouseenter', function() {
        removeCorBloco(); // Remove a classe de todos
        highElement.classList.add('cor-bloco'); // Adiciona ao HIGH
    });

    // Evento para "hover" no elemento BRANDS
    brandsElement.addEventListener('mouseenter', function() {
        removeCorBloco(); // Remove a classe de todos
        brandsElement.classList.add('cor-bloco'); // Adiciona ao elemento atual
    });

    // Evento para "hover" no elemento ALL
    allElement.addEventListener('mouseenter', function() {
        removeCorBloco(); // Remove a classe de todos
        allElement.classList.add('cor-bloco'); // Adiciona ao elemento atual
    });

    // Mantém a classe no elemento clicado
    highElement.addEventListener('click', function() {
        removeCorBloco(); // Remove de todos
        highElement.classList.add('cor-bloco'); // Adiciona ao clicado
    });

    brandsElement.addEventListener('click', function() {
        removeCorBloco(); // Remove de todos
        brandsElement.classList.add('cor-bloco'); // Adiciona ao clicado
    });

    allElement.addEventListener('click', function() {
        removeCorBloco(); // Remove de todos
        allElement.classList.add('cor-bloco'); // Adiciona ao clicado
    });
});