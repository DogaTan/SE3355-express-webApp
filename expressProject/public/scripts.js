document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const productList = document.getElementById("productList");
    const categoryList = document.getElementById("categoryList");

    // API'den ürünleri ve kategorileri güncelleme
    const updateProductsAndCategories = (query) => {
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
                const { products, categories } = data;

                // Ürünleri güncelle
                productList.innerHTML = '';
                if (products.length > 0) {
                    products.forEach((product) => {
                        const productCard = `
                            <div class="col-md-4 mb-4">
                                <a href="/detail/${product.id}" class="card-link text-decoration-none text-dark">
                                    <div class="card h-100 shadow-sm">
                                        <img src="/${product.image}" class="card-img-top" alt="${product.description}">
                                        <div class="card-body text-center">
                                            <h5 class="card-title">${product.description}</h5>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                        productList.insertAdjacentHTML('beforeend', productCard);
                    });
                } else {
                    productList.innerHTML = '<p class="text-danger">Ürün bulunamadı.</p>';
                }

                // Kategorileri güncelle
                categoryList.innerHTML = '';
                for (const category in categories) {
                    const categoryItem = `
                        <li class="list-group-item">
                            <a href="/category/${category}" class="category-link categoryLink">
                                ${category} <span class="text-muted">( ${categories[category]} )</span>
                            </a>
                        </li>
                    `;
                    categoryList.insertAdjacentHTML('beforeend', categoryItem);
                }
            })
            .catch((err) => console.error('API hatası:', err));
    };

    // Dinamik arama (input değiştikçe)
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        updateProductsAndCategories(query);
    });

    // Tam sayfa arama butonuna tıklama
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    });

    // Enter tuşu ile tam sayfa arama
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        }
    });
});
