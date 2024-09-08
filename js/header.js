document.addEventListener("DOMContentLoaded", function() {
    const headerHtml = `
    <header>
        <div class="new-header__inner">
            <div class="new-header__left"></div>
            <div class="nav-center">
                <div style="width:33%;">
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
});
