(function () {
    var categories = window.PRODUCT_CATEGORIES || [];
    var legacyMap = window.LEGACY_CATEGORY_MAP || {};
    var catalog3Products = window.CATALOG3_PRODUCTS || [];
    var legacyProducts = window.PRODUCTS || [];

    var categoryBySlug = {};
    categories.forEach(function (cat) {
        categoryBySlug[cat.slug] = cat;
    });

    // Normalize & merge Catalog3 products first (newest showcase items), followed by existing catalog products
    var allProducts = catalog3Products.map(function (p) {
        return Object.assign({}, p, {
            categorySlug: p.categorySlug,
            subCategory: p.subCategory || p.category,
            brand: p.brand || ""
        });
    }).concat(legacyProducts.map(function (p) {
        var slug = legacyMap[p.category] || "general-hardware-tools";
        var master = categoryBySlug[slug];
        return Object.assign({}, p, {
            categorySlug: slug,
            subCategory: p.category,
            category: master ? master.name : p.category,
            brand: p.brand || (p.sourcePdf === "alraihan products2.pdf" ? "Pro Hardware" : "Electrical Series")
        });
    }));

    var productsByCategory = {};
    categories.forEach(function (cat) {
        productsByCategory[cat.slug] = [];
    });
    allProducts.forEach(function (product) {
        if (!productsByCategory[product.categorySlug]) {
            productsByCategory[product.categorySlug] = [];
        }
        productsByCategory[product.categorySlug].push(product);
    });

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
    }

    function whatsappUrl(product) {
        var lines = [
            "Hello Al Raihan Hardwares,",
            "",
            "I would like more details / specification sheet for:",
            "",
            "Product: " + product.name
        ];
        if (product.code) lines.push("Model / Code: " + product.code);
        lines.push("Category: " + product.category, "", "Please share availability and technical details.");
        return "https://wa.me/971568656399?text=" + encodeURIComponent(lines.join("\n"));
    }

    function findProduct(id) {
        return allProducts.find(function (p) { return p.id === id; });
    }

    // Premium Architectural Category Card (for both index.html and products.html)
    function categoryCard(cat, index, isHomePage) {
        var count = (productsByCategory[cat.slug] || []).length;
        var num = String(index + 1).padStart(2, "0");
        var brandsHtml = (cat.brands || []).slice(0, 3).map(function (b) {
            return '<span class="cat-brand-pill">' + escapeHtml(b) + "</span>";
        }).join("");
        var href = isHomePage ? ("products.html?category=" + encodeURIComponent(cat.slug)) : ("?category=" + encodeURIComponent(cat.slug));
        var dataAttr = isHomePage ? "" : ' data-open-category="' + escapeHtml(cat.slug) + '"';

        return '<a class="category-showcase-card" href="' + href + '"' + dataAttr + ">" +
            '<div class="cat-card-media">' +
            '<img src="' + escapeHtml(cat.image) + '" alt="' + escapeHtml(cat.name) + '" loading="lazy">' +
            '<span class="cat-card-index">' + num + "</span>" +
            '<span class="cat-card-count">' + count + (count === 1 ? " Item" : " Items") + "</span>" +
            "</div>" +
            '<div class="cat-card-body">' +
            '<h3 class="cat-card-title">' + escapeHtml(cat.name) + "</h3>" +
            '<p class="cat-card-tagline">' + escapeHtml(cat.tagline) + "</p>" +
            (brandsHtml ? '<div class="cat-card-brands">' + brandsHtml + "</div>" : "") +
            '<div class="cat-card-footer">' +
            '<span class="cat-card-cta">Explore Collection</span>' +
            '<span class="cat-card-arrow" aria-hidden="true"><i class="bi bi-arrow-right"></i></span>' +
            "</div>" +
            "</div>" +
            "</a>";
    }

    // Premium Editorial Product Showcase Card (NOT e-commerce — no prices, no cart, no chunky Buy/Enquire button)
    function showcaseProductCard(product) {
        var kicker = product.brand || product.subCategory || product.category;
        var codeBadge = product.code ? '<span class="showcase-code">' + escapeHtml(product.code) + "</span>" : "";
        var specChips = (product.specifications || []).slice(0, 2).map(function (spec) {
            var shortSpec = spec.length > 44 ? spec.slice(0, 42).trim() + "…" : spec;
            return '<span class="showcase-spec-chip">' + escapeHtml(shortSpec) + "</span>";
        }).join("");

        return '<article class="showcase-card" data-detail="' + escapeHtml(product.id) + '" tabindex="0" role="button" aria-label="View specifications for ' + escapeHtml(product.name) + '">' +
            '<div class="showcase-media">' +
            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
            "</div>" +
            '<div class="showcase-body">' +
            '<div class="showcase-meta">' +
            '<span class="showcase-kicker">' + escapeHtml(kicker) + "</span>" +
            codeBadge +
            "</div>" +
            '<h3 class="showcase-title">' + escapeHtml(product.name) + "</h3>" +
            (product.description ? '<p class="showcase-desc">' + escapeHtml(product.description) + "</p>" : "") +
            (specChips ? '<div class="showcase-specs">' + specChips + "</div>" : "") +
            '<div class="showcase-footer">' +
            '<span class="showcase-view-link">View Specifications <i class="bi bi-arrow-up-right"></i></span>' +
            "</div>" +
            "</div>" +
            "</article>";
    }

    // Specification Sheet Modal
    function openDetails(id) {
        var product = findProduct(id);
        var modal = document.getElementById("product-modal");
        if (!product || !modal) return;
        var specs = (product.specifications || []).map(function (line) {
            return '<li><i class="bi bi-check2-circle"></i><span>' + escapeHtml(line) + "</span></li>";
        }).join("");
        modal.querySelector(".product-dialog").innerHTML =
            '<div class="spec-dialog-media">' +
            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
            "</div>" +
            '<div class="spec-dialog-body">' +
            '<button type="button" class="product-close" data-close-modal aria-label="Close">&times;</button>' +
            '<div class="spec-dialog-badges">' +
            '<span class="spec-cat-badge">' + escapeHtml(product.category) + "</span>" +
            (product.brand ? '<span class="spec-brand-badge">' + escapeHtml(product.brand) + "</span>" : "") +
            "</div>" +
            '<h2 class="spec-dialog-title">' + escapeHtml(product.name) + "</h2>" +
            (product.code ? '<p class="spec-dialog-code">Model / Reference: <strong>' + escapeHtml(product.code) + "</strong></p>" : "") +
            (product.description ? '<p class="spec-dialog-desc">' + escapeHtml(product.description) + "</p>" : "") +
            (specs ? '<div class="spec-dialog-list-wrap"><h4>Key Specifications &amp; Variants</h4><ul class="spec-dialog-list">' + specs + "</ul></div>" : "") +
            '<div class="spec-dialog-actions">' +
            '<a class="spec-inquiry-link" href="' + whatsappUrl(product) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Request Product Inquiry</a>' +
            "</div>" +
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

    // 1. Homepage Featured Categories Showcase
    var featuredCatsEl = document.getElementById("featured-categories");
    if (featuredCatsEl) {
        var featuredCats = categories.filter(function (c) { return c.featured; }).slice(0, 8);
        featuredCatsEl.innerHTML = featuredCats.map(function (cat, idx) {
            return categoryCard(cat, idx, true);
        }).join("");
    }

    // 1b. Homepage Major Brands Infinite Left-Sliding Marquee
    var majorBrands = window.MAJOR_BRANDS;
    if (majorBrands) {
        function renderBrandTrack(trackId, list) {
            var el = document.getElementById(trackId);
            if (!el || !list || !list.length) return;
            var groupHtml = list.map(function (brand) {
                return '<div class="brand-tile" title="' + escapeHtml(brand.name + " — " + brand.category) + '">' +
                    '<div class="brand-tile-logo">' +
                    '<img src="' + escapeHtml(brand.logo) + '" alt="' + escapeHtml(brand.name) + ' logo" loading="lazy">' +
                    "</div>" +
                    '<span class="brand-tile-cat">' + escapeHtml(brand.category) + "</span>" +
                    "</div>";
            }).join("");
            // Render two identical groups side-by-side for seamless -50% infinite loop
            el.innerHTML = '<div class="brands-marquee-group">' + groupHtml + '</div>' +
                '<div class="brands-marquee-group" aria-hidden="true">' + groupHtml + "</div>";
        }
        renderBrandTrack("brands-track-1", majorBrands.row1);
        renderBrandTrack("brands-track-2", majorBrands.row2);
    }

    // 2. Products Page: Categorized Showcase Experience
    var catalogueEl = document.getElementById("product-catalogue");
    if (catalogueEl) {
        var categoriesView = document.getElementById("categories-view");
        var categoryDetailView = document.getElementById("category-detail-view");
        var categoriesGrid = document.getElementById("categories-grid");
        var globalSearch = document.getElementById("catalogue-search");
        var globalSearchClear = document.getElementById("catalogue-clear");
        var searchResultsWrap = document.getElementById("global-search-results");
        var searchResultsGrid = document.getElementById("global-search-grid");
        var searchResultsCount = document.getElementById("global-search-count");

        var detailBackBtn = document.getElementById("category-back-btn");
        var detailBreadcrumb = document.getElementById("category-breadcrumb-name");
        var detailTitle = document.getElementById("category-detail-title");
        var detailDesc = document.getElementById("category-detail-desc");
        var detailBrands = document.getElementById("category-detail-brands");
        var detailCount = document.getElementById("category-detail-count");
        var detailSubfilters = document.getElementById("category-subfilters");
        var detailSearch = document.getElementById("category-inner-search");
        var detailGrid = document.getElementById("category-products-grid");
        var detailEmpty = document.getElementById("category-empty");

        var activeCategorySlug = null;
        var activeSubCategory = "All";

        function getCategoryFromUrl() {
            var params = new URLSearchParams(window.location.search);
            var slug = params.get("category");
            return slug && categoryBySlug[slug] ? slug : null;
        }

        function setUrlCategory(slug, push) {
            var url = new URL(window.location.href);
            if (slug) {
                url.searchParams.set("category", slug);
            } else {
                url.searchParams.delete("category");
            }
            if (push) {
                window.history.pushState({ category: slug }, "", url.toString());
            } else {
                window.history.replaceState({ category: slug }, "", url.toString());
            }
        }

        function renderCategoriesDirectory() {
            var query = globalSearch ? globalSearch.value.trim().toLowerCase() : "";
            if (!query) {
                categoriesGrid.innerHTML = categories.map(function (cat, idx) {
                    return categoryCard(cat, idx, false);
                }).join("");
                categoriesGrid.style.display = "grid";
                if (searchResultsWrap) searchResultsWrap.style.display = "none";
                return;
            }

            // Filter categories & matching products when user searches globally
            var matchingCats = categories.filter(function (cat) {
                var text = [cat.name, cat.tagline, cat.description].concat(cat.brands || []).join(" ").toLowerCase();
                return text.indexOf(query) !== -1;
            });

            var matchingProducts = allProducts.filter(function (p) {
                var text = [p.name, p.code, p.category, p.subCategory, p.brand, p.description].concat(p.specifications || []).join(" ").toLowerCase();
                return text.indexOf(query) !== -1;
            });

            if (matchingCats.length) {
                categoriesGrid.innerHTML = matchingCats.map(function (cat) {
                    var origIdx = categories.indexOf(cat);
                    return categoryCard(cat, origIdx, false);
                }).join("");
                categoriesGrid.style.display = "grid";
            } else {
                categoriesGrid.innerHTML = "";
                categoriesGrid.style.display = "none";
            }

            if (searchResultsWrap && searchResultsGrid && searchResultsCount) {
                searchResultsWrap.style.display = "block";
                searchResultsCount.textContent = matchingProducts.length + (matchingProducts.length === 1 ? " matching product" : " matching products") + ' for "' + globalSearch.value.trim() + '"';
                searchResultsGrid.innerHTML = matchingProducts.length
                    ? matchingProducts.slice(0, 48).map(showcaseProductCard).join("")
                    : '<div class="catalogue-empty" style="display:block; grid-column: 1 / -1;"><h3 class="h5">No matching products found</h3><p class="mb-0">Try a different keyword or browse our categories above.</p></div>';
            }
        }

        function renderCategoryProducts() {
            var cat = categoryBySlug[activeCategorySlug];
            if (!cat) return;
            var items = productsByCategory[cat.slug] || [];
            var query = detailSearch ? detailSearch.value.trim().toLowerCase() : "";

            var visible = items.filter(function (p) {
                var subOk = activeSubCategory === "All" || p.subCategory === activeSubCategory;
                if (!subOk) return false;
                if (!query) return true;
                var haystack = [p.name, p.code, p.brand, p.subCategory, p.description].concat(p.specifications || []).join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            });

            detailGrid.innerHTML = visible.map(showcaseProductCard).join("");
            detailCount.textContent = visible.length + (visible.length === 1 ? " Product in Showcase" : " Products in Showcase");
            if (detailEmpty) {
                detailEmpty.style.display = visible.length ? "none" : "block";
            }
        }

        function openCategory(slug, pushHistory) {
            var cat = categoryBySlug[slug];
            if (!cat) {
                showCategoriesView(pushHistory);
                return;
            }
            activeCategorySlug = slug;
            activeSubCategory = "All";
            if (detailSearch) detailSearch.value = "";

            categoriesView.style.display = "none";
            categoryDetailView.style.display = "block";

            detailBreadcrumb.textContent = cat.name;
            detailTitle.textContent = cat.name;
            detailDesc.textContent = cat.description;
            detailBrands.innerHTML = (cat.brands || []).map(function (b) {
                return '<span class="detail-brand-tag">' + escapeHtml(b) + "</span>";
            }).join("");

            // Build sub-category pills only when there are 2+ distinct sub-categories
            var items = productsByCategory[cat.slug] || [];
            var subs = [];
            items.forEach(function (p) {
                if (p.subCategory && subs.indexOf(p.subCategory) === -1) subs.push(p.subCategory);
            });
            if (subs.length > 1) {
                detailSubfilters.style.display = "flex";
                detailSubfilters.innerHTML =
                    '<button type="button" class="subfilter-pill is-active" data-sub="All">All (' + items.length + ")</button>" +
                    subs.map(function (sub) {
                        var c = items.filter(function (x) { return x.subCategory === sub; }).length;
                        return '<button type="button" class="subfilter-pill" data-sub="' + escapeHtml(sub) + '">' + escapeHtml(sub) + " (" + c + ")</button>";
                    }).join("");
            } else {
                detailSubfilters.style.display = "none";
                detailSubfilters.innerHTML = "";
            }

            renderCategoryProducts();
            if (pushHistory) setUrlCategory(slug, true);
            window.scrollTo({ top: Math.max(0, catalogueEl.offsetTop - 90), behavior: "smooth" });
        }

        function showCategoriesView(pushHistory) {
            activeCategorySlug = null;
            categoryDetailView.style.display = "none";
            categoriesView.style.display = "block";
            renderCategoriesDirectory();
            if (pushHistory) setUrlCategory(null, true);
            window.scrollTo({ top: Math.max(0, catalogueEl.offsetTop - 90), behavior: "smooth" });
        }

        // Event bindings
        categoriesGrid.addEventListener("click", function (event) {
            var card = event.target.closest("[data-open-category]");
            if (!card) return;
            event.preventDefault();
            openCategory(card.getAttribute("data-open-category"), true);
        });

        if (detailBackBtn) {
            detailBackBtn.addEventListener("click", function () {
                showCategoriesView(true);
            });
        }

        if (detailSubfilters) {
            detailSubfilters.addEventListener("click", function (event) {
                var btn = event.target.closest("button[data-sub]");
                if (!btn) return;
                activeSubCategory = btn.getAttribute("data-sub");
                detailSubfilters.querySelectorAll("button").forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
                renderCategoryProducts();
            });
        }

        if (detailSearch) {
            detailSearch.addEventListener("input", renderCategoryProducts);
        }

        if (globalSearch) {
            globalSearch.addEventListener("input", renderCategoriesDirectory);
        }

        if (globalSearchClear) {
            globalSearchClear.addEventListener("click", function () {
                if (globalSearch) globalSearch.value = "";
                renderCategoriesDirectory();
            });
        }

        window.addEventListener("popstate", function () {
            var slug = getCategoryFromUrl();
            if (slug) {
                openCategory(slug, false);
            } else {
                showCategoriesView(false);
            }
        });

        // Initial render based on URL ?category=...
        var initialSlug = getCategoryFromUrl();
        if (initialSlug) {
            openCategory(initialSlug, false);
        } else {
            categoryDetailView.style.display = "none";
            categoriesView.style.display = "block";
            renderCategoriesDirectory();
        }
    }

    // Modal click & keyboard handlers
    document.addEventListener("click", function (event) {
        var detail = event.target.closest("[data-detail]");
        if (detail) {
            openDetails(detail.getAttribute("data-detail"));
            return;
        }
        if (event.target.closest("[data-close-modal]")) {
            closeDetails();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeDetails();
        if ((event.key === "Enter" || event.key === " ") && document.activeElement && document.activeElement.hasAttribute("data-detail")) {
            event.preventDefault();
            openDetails(document.activeElement.getAttribute("data-detail"));
        }
    });

    var modal = document.getElementById("product-modal");
    if (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeDetails();
        });
    }
})();
