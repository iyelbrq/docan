(() => {
    "use strict";

    const page = document.querySelector(".product-page");
    if (!page || !window.fetch) return;

    const nf = new Intl.NumberFormat("id-ID");
    const digits = (value) => Number(String(value ?? "").replace(/\D/g, "") || 0);
    const csrf = () =>
        page.querySelector('.quick-stock-form input[name="_token"]')?.value ||
        document.querySelector('meta[name="csrf-token"]')?.content ||
        "";

    let toastTimer = null;
    const toast = (message, ok = true) => {
        let el = document.getElementById("js-stock-toast");
        if (!el) {
            el = document.createElement("div");
            el.id = "js-stock-toast";
            el.className = "toast";
            document.body.appendChild(el);
        }
        el.style.background = ok ? "#1d342c" : "#b21f2d";
        el.textContent = (ok ? "✓ " : "✕ ") + message;
        el.hidden = false;
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            el.hidden = true;
        }, 4200);
    };

    const rowFor = (id) =>
        page.querySelector(`.price-variant-row[data-product-id="${id}"]`);

    const defaultQty = (row) => (row?.dataset.balance === "1" ? 100000 : 1);

    // Refresh the stock number shown in a row without reloading the page.
    const applyStock = (row, stock) => {
        if (!row) return;
        const isBalance = row.dataset.balance === "1";
        const badge = row.querySelector(".stock-badge");
        if (badge) {
            const small = badge.querySelector("small");
            if (isBalance) {
                if (badge.firstChild) badge.firstChild.nodeValue = "Rp";
                if (small) small.textContent = nf.format(stock);
            } else {
                if (badge.firstChild) badge.firstChild.nodeValue = nf.format(stock);
                if (small) small.textContent = "stok";
                badge.classList.toggle("low", Number(stock) < 5);
            }
        }
        if (isBalance) {
            const amount = row.querySelector(".inventory-info p b");
            if (amount) amount.textContent = "Rp " + nf.format(stock);
        }
        row.classList.remove("stock-flash");
        void row.offsetWidth;
        row.classList.add("stock-flash");
    };

    const resetInput = (row) => {
        const input = row?.querySelector('.quick-stock-form input[name="quantity"]');
        if (input) input.value = nf.format(defaultQty(row));
    };

    const post = async (url, body) => {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "same-origin",
            body,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(
                data.message ||
                    Object.values(data.errors || {}).flat()[0] ||
                    "Perubahan stok gagal disimpan.",
            );
        }
        return data;
    };

    // ----- Per-row + Stok / - Stok -----
    page.addEventListener("submit", async (event) => {
        const form = event.target.closest(".quick-stock-form");
        if (!form) return;
        event.preventDefault();

        const direction =
            event.submitter && event.submitter.value === "decrease"
                ? "decrease"
                : "increase";
        const row = form.closest(".price-variant-row");
        const input = form.querySelector('input[name="quantity"]');
        const quantity = digits(input.value);
        if (quantity < 1) {
            toast("Isi jumlah lebih dari 0 terlebih dahulu.", false);
            return;
        }

        const buttons = form.querySelectorAll("button");
        buttons.forEach((button) => (button.disabled = true));

        const body = new FormData();
        body.append("_token", csrf());
        body.append("quantity", String(quantity));
        body.append("direction", direction);

        try {
            const data = await post(form.action, body);
            applyStock(row, data.stock);
            resetInput(row);
            refreshBulkCount();
            toast(data.message || "Stok berhasil diperbarui.");
        } catch (exception) {
            toast(exception.message, false);
        } finally {
            buttons.forEach((button) => (button.disabled = false));
        }
    });

    // ----- Bulk: tambah semua stok sekaligus -----
    const bar = document.getElementById("bulk-stock-bar");
    const countEl = document.getElementById("bulk-stock-count");
    const applyButton = document.getElementById("bulk-stock-apply");

    const filledRows = () =>
        [...page.querySelectorAll(".quick-stock-form")]
            .map((form) => {
                const row = form.closest(".price-variant-row");
                const quantity = digits(
                    form.querySelector('input[name="quantity"]')?.value,
                );
                return { row, id: row?.dataset.productId, quantity };
            })
            .filter((entry) => entry.id && entry.quantity >= 1);

    function refreshBulkCount() {
        if (!bar) return;
        const rows = filledRows();
        countEl.textContent = String(rows.length);
        bar.hidden = rows.length === 0;
    }

    if (bar && applyButton) {
        page.addEventListener("input", (event) => {
            if (
                event.target.matches('.quick-stock-form input[name="quantity"]')
            ) {
                refreshBulkCount();
            }
        });
        refreshBulkCount();

        applyButton.addEventListener("click", async () => {
            const rows = filledRows();
            if (!rows.length) return;

            applyButton.disabled = true;
            applyButton.textContent = "Menyimpan…";

            const body = new FormData();
            body.append("_token", csrf());
            body.append("direction", "increase");
            rows.forEach((entry, index) => {
                body.append(`items[${index}][product_id]`, entry.id);
                body.append(`items[${index}][quantity]`, String(entry.quantity));
            });

            try {
                const data = await post(applyButton.dataset.url, body);
                (data.results || []).forEach((result) => {
                    const row = rowFor(result.id);
                    applyStock(row, result.stock);
                    resetInput(row);
                });
                if ((data.errors || []).length) {
                    const first = data.errors[0];
                    const name =
                        rowFor(first.id)
                            ?.querySelector(".inventory-info h3, header h3")
                            ?.textContent?.trim() || "Salah satu produk";
                    toast(`${data.message} Contoh: ${name} — ${first.message}`, false);
                } else {
                    toast(data.message || "Semua stok berhasil diperbarui.");
                }
                refreshBulkCount();
            } catch (exception) {
                toast(exception.message, false);
            } finally {
                applyButton.disabled = false;
                applyButton.textContent = "Tambah semua stok";
            }
        });
    }
})();
