(function () {
    var products = window.PRODUCTS || [];

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
    }

    function whatsappUrl(product) {
        var lines = [
            "Hello Al Raihan Hardwares,",
            "",
            "I am interested in the following product:",
            "",
            "Product: " + product.name
        ];
        if (product.code) lines.push("Product Code: " + product.code);
        lines.push("Category: " + product.category, "", "Please share more information and availability.");
        return "https://wa.me/971568656399?text=" + encodeURIComponent(lines.join("\n"));
    }

    function findProduct(id) {
        return products.find(function (product) { return product.id === id; });
    }

    function card(product) {
        var code = product.code ? '<p class="product-code">' + escapeHtml(product.code) + "</p>" : "";
        var description = product.description ? '<p class="product-desc">' + escapeHtml(product.description) + "</p>" : "";
        return '<article class="product-card">' +
            '<button type="button" class="product-media" data-detail="' + escapeHtml(product.id) + '" aria-label="View ' + escapeHtml(product.name) + '">' +
            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" width="900" height="900" loading="lazy">' +
            "</button>" +
            '<div class="product-body">' +
            '<p class="product-category">' + escapeHtml(product.category) + "</p>" +
            "<h3>" + escapeHtml(product.name) + "</h3>" +
            code + description +
            '<a class="btn btn-secondary text-light rounded-pill product-enquire" href="' + whatsappUrl(product) + '" target="_blank" rel="noopener">Enquire Now</a>' +
            "</div></article>";
    }

    function openDetails(id) {
        var product = findProduct(id);
        var modal = document.getElementById("product-modal");
        if (!product || !modal) return;
        var specs = (product.specifications || []).map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
        }).join("");
        modal.querySelector(".product-dialog").innerHTML =
            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" width="900" height="900">' +
            '<div class="product-dialog-body">' +
            '<button type="button" class="product-close" data-close-modal aria-label="Close">&times;</button>' +
            '<p class="product-category">' + escapeHtml(product.category) + "</p>" +
            "<h2>" + escapeHtml(product.name) + "</h2>" +
            (product.code ? "<p class=\"product-code\">Code: " + escapeHtml(product.code) + "</p>" : "") +
            (product.description ? "<p>" + escapeHtml(product.description) + "</p>" : "") +
            (specs ? "<ul>" + specs + "</ul>" : "") +
            '<a class="btn btn-secondary text-light rounded-pill" href="' + whatsappUrl(product) + '" target="_blank" rel="noopener">Enquire Now</a>' +
            "</div>";
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
    }

    function closeDetails() {
        var modal = document.getElementById("product-modal");
        if (!modal) return;
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
    }

    var featured = document.getElementById("featured-products");
    if (featured) {
        featured.innerHTML = products.filter(function (product) { return product.featured; }).slice(0, 8).map(card).join("");
    }

    var catalogue = document.getElementById("product-catalogue");
    if (catalogue) {
        var filters = document.getElementById("catalogue-filters");
        var grid = document.getElementById("catalogue-grid");
        var count = document.getElementById("catalogue-count");
        var empty = document.getElementById("catalogue-empty");
        var search = document.getElementById("catalogue-search");
        var categories = Array.from(new Set(products.map(function (product) { return product.category; }))).sort();
        var active = "All";

        filters.innerHTML = '<button type="button" class="is-active" data-category="All">All Products</button>' +
            categories.map(function (category) {
                return '<button type="button" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + "</button>";
            }).join("");

        function matches(product) {
            var query = search.value.trim().toLowerCase();
            var haystack = [product.name, product.code, product.category, product.description].concat(product.specifications || []).join(" ").toLowerCase();
            return (active === "All" || product.category === active) && (!query || haystack.indexOf(query) !== -1);
        }

        function render() {
            var visible = products.filter(matches);
            grid.innerHTML = visible.map(card).join("");
            count.textContent = visible.length + (visible.length === 1 ? " product" : " products");
            empty.style.display = visible.length ? "none" : "block";
        }

        filters.addEventListener("click", function (event) {
            var button = event.target.closest("button");
            if (!button) return;
            active = button.getAttribute("data-category");
            filters.querySelectorAll("button").forEach(function (item) { item.classList.remove("is-active"); });
            button.classList.add("is-active");
            render();
        });

        search.addEventListener("input", render);
        document.getElementById("catalogue-clear").addEventListener("click", function () {
            search.value = "";
            active = "All";
            filters.querySelectorAll("button").forEach(function (item) {
                item.classList.toggle("is-active", item.getAttribute("data-category") === "All");
            });
            render();
        });
        render();
    }

    document.addEventListener("click", function (event) {
        var detail = event.target.closest("[data-detail]");
        if (detail) openDetails(detail.getAttribute("data-detail"));
        if (event.target.closest("[data-close-modal]")) closeDetails();
    });

    var modal = document.getElementById("product-modal");
    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeDetails();
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeDetails();
        });
    }
})();
