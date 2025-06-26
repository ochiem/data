// Token Price Monitor Application - Updated for Frontend API Calls
const dexOrder = ['KyberSwap', 'Matcha','OKXDEX', 'Magpie', 'ODOS','ParaSwap'];
const chainCodeMap = {
            bsc: 56,
            ethereum: 1,
            polygon: 137,
            arbitrum: 42161,
            base: 8453,
            solana: 501
        };
// URL eksplorasi
const explorerUrls = {
    '1': 'https://etherscan.io',
    '56': 'https://bscscan.com',
    '137': 'https://polygonscan.com',
     '42161': 'https://arbiscan.io',
     '8453': 'https://basescan.org/',
     '501': 'https://solscan.io/',     
};

const CEXWallets = {
    polygon: {
        Kode_Chain: 137,
        WALLET_CEX: {
        GATEIO: {
            address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
            chainCEX: 'MATIC'
        },
        BINANCE: {
            address: '0x290275e3db66394C52272398959845170E4DCb88',
            chainCEX: 'MATIC'
        },
        MEXC: {
            address: '0x51E3D44172868Acc60D68ca99591Ce4230bc75E0',
            chainCEX: 'MATIC'
        }
        }
    },
    arbitrum: {
        Kode_Chain: 42161,
        WALLET_CEX: {
        GATEIO: {
            address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
            chainCEX: 'ARBEVM'
        },
        BINANCE: {
            address: '0x290275e3db66394C52272398959845170E4DCb88',
            chainCEX: 'ARBITRUM'
        },
        MEXC: {
            address: '0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB',
            chainCEX: 'ARB'
        }
        }
    },
    ethereum: {
        Kode_Chain: 1,
        WALLET_CEX: {
        GATEIO: {
            address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
            chainCEX: 'ETH'
        },
        BINANCE: {
            address: '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
            chainCEX: 'ETH'
        },
        MEXC: {
            address: '0x75e89d5979E4f6Fba9F97c104c2F0AFB3F1dcB88',
            chainCEX: 'ETH'
        }
        }
    },
    bsc: {
        Kode_Chain: 56,
        WALLET_CEX: {
        GATEIO: {
            address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
            chainCEX: 'BSC'
        },
        BINANCE: {
            address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
            chainCEX: 'BSC'
        },
        MEXC: {
            address: '0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB',
            chainCEX: 'BSC'
        }
        }
    }
 };

class TokenPriceMonitor {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
        this.tokens = this.loadTokens();
        this.settings = this.loadSettings();
        this.currentEditingToken = null;        
        this.init();
        this.searchKeyword = '';
        this.sortAscending = true;
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.loadTokenTable();
        this.loadSettingsForm();
        this.updateStats();
        this.fetchGasTokenPrices();
        this.SearchCoin(); 
        this.generateEmptyTable();
    }

    // Bind event handlers
    bindEvents() {
        $('#CheckPrice').on('click', async () => {
            const tabToken = $('#mainTabs .nav-item:has(a[href="#tokenManagement"])');
            const tabSetting = $('#mainTabs .nav-item:has(a[href="#apiSettings"])');
            tabToken.hide();
            tabSetting.hide();

            $('#sortByToken').prop('disabled', true);

            // Tampilkan tombol Stop
            $('#StopScan').removeClass('d-none');

            this.initPNLSignalStructure();
            this.sendStatusTELE(this.settings.UserName, 'ONLINE');

            $('#CheckPrice').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Scanning...');

            await this.CheckPricess();

            tabToken.show();
            tabSetting.show();

            // Sembunyikan tombol Stop kembali
            $('#StopScan').addClass('d-none');

            $('#sortByToken').prop('disabled', false);
            $('#CheckPrice').prop('disabled', false).html('<i class="bi bi-arrow-clockwise"></i>Check Price');
        });

       $('#StopScan').on('click', () => {
            location.reload(); // ⬅️ ini langsung reload halaman
        });

      //  Save token button
        $('#saveTokenBtn').on('click', () => {
            this.saveToken();
        });

        $(document).on('click', 'a.nav-link.active[href="#priceMonitoring"]', function(e) {
            e.preventDefault(); // Mencegah default tab switching jika perlu
            location.reload();  // Melakukan reload halaman
        });


        // Save settings button
        $('#saveSettingsBtn').on('click', () => {
            this.saveSettings();
        });

        // Token form reset when modal opens
        $('#tokenModal').on('show.bs.modal', () => {
            if (!this.currentEditingToken) {
                this.resetTokenForm();
            }
        });

        // Clear editing token when modal closes
        $('#tokenModal').on('hidden.bs.modal', () => {
            this.currentEditingToken = null;
            $('#modalTitle').text('Add New Token');
        });

        $('#exportTokensBtn').on('click', () => {
            const tokens = app.tokens;
            if (!tokens.length) return app.showAlert('❌ Tidak ada token untuk diexport!', 'warning');

            const maxCex = 3;
            const maxDex = 6;

            const headers = [
                'id', 'symbol', 'pairSymbol', 'contractAddress', 'pairContractAddress',
                'decimals', 'pairDecimals', 'chain',
                'modalCexToDex', 'modalDexToCex'
            ];

            for (let i = 0; i < maxCex; i++) headers.push(`selectedCexs/${i}`);
            for (let i = 0; i < maxDex; i++) headers.push(`selectedDexs/${i}`);
            headers.push('isActive');

            const rows = tokens.map(t => {
                const row = [
                    t.id,
                    t.symbol,
                    t.pairSymbol,
                    t.contractAddress,
                    t.pairContractAddress,
                    t.decimals,
                    t.pairDecimals,
                    t.chain,
                    t.modalCexToDex,
                    t.modalDexToCex
                ];

                for (let i = 0; i < maxCex; i++) {
                    row.push(t.selectedCexs?.[i] || '');
                }

                for (let i = 0; i < maxDex; i++) {
                    row.push(t.selectedDexs?.[i] || '');
                }

                row.push(t.isActive);
                return row;
            });

            const csvText = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');

            const blob = new Blob([csvText], { type: 'text/tab-separated-values;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'tokens-export.csv';
            link.click();
        });



        $('#importTokensBtn').on('click', () => {
            $('#importTokensInput').click();
        });

        $('#importTokensInput').on('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (event) => {
                const csvText = event.target.result;
                const lines = csvText.split('\n').map(line => line.trim()).filter(Boolean);

                if (lines.length < 2) {
                    app.showAlert('❌ Format file tidak valid atau kosong.', 'danger');
                    return;
                }

                const delimiter = lines[0].includes('\t') ? '\t' : (
                    lines[0].includes(',') ? ',' : null
                );

                if (!delimiter) {
                    app.showAlert('❌ Format file tidak valid. Gunakan Tab atau Koma sebagai pemisah.', 'danger');
                    return;
                }

                const headers = lines[0].split(delimiter);
                const tokens = [];
                let errorCount = 0;

                lines.slice(1).forEach((line, index) => {
                    const values = line.split(delimiter);
                    const token = {};
                    const selectedCexs = [];
                    const selectedDexs = [];

                    headers.forEach((h, i) => {
                        const val = values[i]?.trim() ?? '';

                        if (h.startsWith('selectedCexs/')) {
                            if (val) selectedCexs.push(val);
                        } else if (h.startsWith('selectedDexs/')) {
                            if (val) selectedDexs.push(val);
                        } else if (h === 'isActive') {
                            token[h] = val.toLowerCase() === 'true';
                        } else if (['modalCexToDex', 'modalDexToCex', 'decimals', 'pairDecimals', 'id'].includes(h)) {
                            token[h] = Number(val);
                        } else {
                            token[h] = val;
                        }
                    });

                    token.selectedCexs = selectedCexs;
                    token.selectedDexs = selectedDexs;

                    if (!token.symbol || !token.chain) {
                        console.warn(`⛔ Baris ${index + 2} dilewati (symbol/chain kosong):`, token);
                        errorCount++;
                        return;
                    }

                    tokens.push(token);
                });

                if (tokens.length === 0) {
                    app.showAlert('❌ Semua baris gagal diimpor. Periksa format dan isi file.', 'danger');
                    return;
                }

                // ✅ Penempatan yang benar DI SINI
                localStorage.setItem('TOKEN_MULTI', JSON.stringify(tokens));
                app.tokens = tokens;
                app.loadTokenTable();
                app.updateStats();

                const msg = errorCount > 0
                    ? `✅ Import selesai, ${tokens.length} token berhasil. ⚠️ ${errorCount} baris dilewati karena tidak valid.`
                    : `✅ Import berhasil, ${tokens.length} token dimuat.`;

                app.showAlert(msg, 'success');
            };

            reader.readAsText(file);
        });

        // Pencarian Monitoring
        $('#monitoringSearch').on('input', (e) => {
            this.searchKeyword = e.target.value;
            this.generateEmptyTable();
        });

        $('#sortByToken').on('click', () => {
            this.sortAscending = !this.sortAscending;
            const icon = this.sortAscending ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up';
            $('#sortIcon').attr('class', `bi ${icon}`);

            // ✅ Tambahkan ini untuk ubah urutan token
            this.tokens.sort((a, b) => this.sortAscending
                ? a.symbol.localeCompare(b.symbol)
                : b.symbol.localeCompare(a.symbol));

            this.generateEmptyTable();
        });

    }

    fetchGasTokenPrices() {
        $.getJSON("https://api.binance.com/api/v3/ticker/price?symbols=[\"BNBUSDT\",\"ETHUSDT\",\"MATICUSDT\",\"SOLUSDT\"]")
            .done(response => {
                for (const item of response) {
                    const price = parseFloat(item.price);

                    if (item.symbol === 'BNBUSDT') {
                        GasPriceUSD.BSC = price;
                        $('#bnbPrice').text(`$${price.toFixed(2)}`);
                    }

                    if (item.symbol === 'ETHUSDT') {
                        GasPriceUSD.Ethereum = price;
                        GasPriceUSD.Base = price;        // Base ikut harga ETH
                        GasPriceUSD.Arbitrum = price;    // Arbitrum juga ikut harga ETH
                        $('#ethPrice').text(`$${price.toFixed(2)}`);
                    }

                    if (item.symbol === 'MATICUSDT') {
                        GasPriceUSD.Polygon = price;
                        $('#maticPrice').text(`$${price.toFixed(2)}`);
                    }

                    if (item.symbol === 'SOLUSDT') {
                        GasPriceUSD.Solana = price;
                        $('#solPrice').text(`$${price.toFixed(2)}`);
                    }
                }

                // console.log('[✔] Fetched gas token prices:', GasPriceUSD);
            })
            .fail(err => {
                console.warn('[✘] Failed to fetch gas token prices', err);
            });
    }

    generateEmptyTable() {
        const tbody = $('#priceTableBody');
        tbody.empty();
        if (typeof this.sortAscending === 'undefined') {
                this.sortAscending = true;
            }
        const activeTokens = this.tokens
            .filter(t => t.isActive)
            .filter(t => {
                const keyword = (this.searchKeyword || '').toLowerCase();
                return (
                    t.symbol.toLowerCase().includes(keyword) ||
                    t.pairSymbol.toLowerCase().includes(keyword)
                );
            })
            .sort((a, b) => {
                const symbolA = a.symbol.toLowerCase();
                const symbolB = b.symbol.toLowerCase();
                if (this.sortAscending) {
                    return symbolA.localeCompare(symbolB);
                } else {
                    return symbolB.localeCompare(symbolA);
                }
            });

       // console.log("VIEW TABLE",activeTokens);    
        if (activeTokens.length === 0) {
            tbody.html(`<tr><td colspan="16" class="text-center text-danger py-7">DATA TIDAK DITEMUAKN / TIDAK ADA DAFTAR TOKEN</td></tr>`);
            return;
        }

        for (const token of activeTokens) {
            for (const cex of token.selectedCexs) {
                const rowId = `token-row-${token.id}-${cex.replace(/\W+/g, '').toLowerCase()}`;

                // Kolom CEX → DEX
                const dexCEXtoDEX = dexOrder.map(dex => {
                    const isDexSelected = token.selectedDexs?.includes(dex);
                    const icon = isDexSelected ? '🔒' : '⛔';
                    const bgClass = isDexSelected ? '' : 'abu';
                    const cellId = `cell_${token.symbol}_${token.pairSymbol}_${token.chain}_${cex}_${dex}`.toLowerCase().replace(/\W+/g, '');
                    return `<td id="${cellId}" class="dex-price-cell text-center ${bgClass}">${icon}</td>`;
                }).join('');

                // Kolom DEX → CEX
                const dexDEXtoCEX = dexOrder.map(dex => {
                    const isDexSelected = token.selectedDexs?.includes(dex);
                    const icon = isDexSelected ? '🔒' : '⛔';
                    const bgClass = isDexSelected ? '' : 'abu';
                    const cellId = `cell_${token.pairSymbol}_${token.symbol}_${token.chain}_${dex}_${cex}`.toLowerCase().replace(/\W+/g, '');
                    return `<td id="${cellId}" class="dex-price-cell text-center ${bgClass}">${icon}</td>`;
                }).join('');

                // Konten detail token
                const detailHTML = this.createTokenDetailContent(token, cex);

                // Hanya 1 kolom (1 <td>) untuk orderbook cex_to_dex dan dex_to_cex
                const orderbookLeftId = `orderbook_cex_to_dex_${cex}_${token.chain}_${token.symbol}_${token.pairSymbol}`;
                const orderbookRightId = `orderbook_dex_to_cex_${cex}_${token.chain}_${token.pairSymbol}_${token.symbol}`;

                const rowHTML = `
                <tr id="${rowId}" class="token-data-row text-center" style=" font-size: 12px">
                    <td id="${orderbookLeftId.toLowerCase()}" class="orderbook-cex text-muted ">${cex}🔒</td>
                    ${dexCEXtoDEX}
                    <td class="token-detail-cell">${detailHTML}</td>
                    ${dexDEXtoCEX}
                    <td id="${orderbookRightId.toLowerCase()}" class="orderbook-dex text-muted ">${cex}🔒</td>
                </tr>
                `;

                tbody.append(rowHTML);
            }
        }
    }
 
    generateOrderBook(token, priceData, cexName, direction) {
        const base = token.symbol.toUpperCase();        // e.g. AUCTION
        const quote = token.pairSymbol.toUpperCase();   // e.g. BNB
        const chain = token.chain.toLowerCase();        // e.g. bsc

        const cexData = priceData.analisis_data?.[direction]?.[cexName];
        if (!cexData) return; 

        const baseToUSDT = cexData[`${base}ToUSDT`] || {};

        // 🛠️ Format orderbook 5 baris
        const formatOrder = (orders = [], type = 'buy', tokenSymbol = '') => {
            const colorClass = type === 'buy' ? 'text-success' : 'text-danger';

            if (tokenSymbol === 'USDT') {
                const dummy = `<span class="${colorClass}">1.0000$ : 10000.00$</span>`;
                return `${dummy}<br>${dummy}<br>${dummy}`;
            }

            const sorted = [...(orders || [])].sort((a, b) => {
                const pa = parseFloat(a.price);
                const pb = parseFloat(b.price);
                return type === 'buy' ? pa - pb : pb - pa;  // ✅ BUY: rendah→tinggi | SELL: tinggi→rendah
            });

            return sorted.slice(0, 5).map(o => {
                const price = parseFloat(o.price);
                const qty = parseFloat(o.qty);
                const volume = price * qty;

                const priceStr = PriceUtils.formatPrice(price);
                const volumeStr = volume.toFixed(2);

                return `<span class="${colorClass}">${priceStr}$ : ${volumeStr}$</span>`;
            }).join('<br>');
        };

        // 🔁 Orderbook Teks → hanya 1 orderbook base ditampilkan
        const leftText = [ 
            `<span class="text-secondary fw-bold">${base} → ${quote}</span>`,
            formatOrder(baseToUSDT.topBids, 'buy', base) 
        ].filter(Boolean).join('<br>');

        const rightText = [
            `<span class="text-secondary fw-bold">${quote} → ${base}</span>`,
            formatOrder(baseToUSDT.topAsks, 'sell', base)  // SELL base
        ].filter(Boolean).join('<br>');

        // 🧩 ID target kolom
        const orderbookLeftId = `orderbook_cex_to_dex_${cexName.toLowerCase()}_${chain}_${base.toLowerCase()}_${quote.toLowerCase()}`;
        const orderbookRightId = `orderbook_dex_to_cex_${cexName.toLowerCase()}_${chain}_${quote.toLowerCase()}_${base.toLowerCase()}`;

        if (direction === 'cex_to_dex') {
            $(`#${orderbookLeftId}`).html(leftText || '-');
        } else if (direction === 'dex_to_cex') {
            $(`#${orderbookRightId}`).html(rightText || '-');
        }
    }

    // LocalStorage operations
    loadTokens() {
        const tokens = JSON.parse(localStorage.getItem('TOKEN_MULTI') || '[]');
        return tokens.map(t => ({ ...t, id: String(t.id) }));
    }


    saveTokensToStorage() {
        localStorage.setItem('TOKEN_MULTI', JSON.stringify(this.tokens));
        this.updateStats();
        this.loadTokenTable();
    }

    loadSettings() {
        const settings = localStorage.getItem('SETT_MULTI');
        return settings ? JSON.parse(settings) : {
            tokensPerBatch: 3, // jumlah anggota
            UserName: 'XXX', // jeda antar member
            delayBetweenGrup: 1000, // jeda batch
            TimeoutCount: 3000, // timeout waktu tunggu
            WalletAddress: '-'
        };
    }

    saveSettingsToStorage() {
        localStorage.setItem('SETT_MULTI', JSON.stringify(this.settings));
    }

   // Token management
    addToken(tokenData) {
        const token = {
            id: Date.now().toString(),
            symbol: tokenData.symbol,
            pairSymbol: tokenData.pairSymbol,
            contractAddress: tokenData.contractAddress,
            pairContractAddress: tokenData.pairContractAddress,
            decimals: parseInt(tokenData.decimals),
            pairDecimals: parseInt(tokenData.pairDecimals),
            chain: tokenData.chain,
            modalCexToDex: parseFloat(tokenData.modalCexToDex),
            modalDexToCex: parseFloat(tokenData.modalDexToCex),
            selectedCexs: tokenData.selectedCexs,
            selectedDexs: tokenData.selectedDexs,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.tokens.push(token);
        this.saveTokensToStorage();
        this.loadTokenTable();      // ⬅️ update tabel tampilan
        this.updateStats();         // ⬅️ update statistik
        this.showAlert(`Token ${token.symbol} berhasil ditambahkan`, 'success');
        return token;
    }

    SearchCoin() {
        $('#tokenSearch').on('keyup', () => {
            const keyword = $('#tokenSearch').val().toLowerCase();
            const rows = $('#tokenTableBody tr');
            rows.each(function() {
                const rowText = $(this).text().toLowerCase();
                $(this).toggle(rowText.includes(keyword));
            });
        });
    }

    updateToken(tokenId, tokenData) {
        const index = this.tokens.findIndex(t => t.id === tokenId);
        if (index !== -1) {
            this.tokens[index] = {
                ...this.tokens[index],
                ...tokenData,
                updatedAt: new Date().toISOString()
            };
            this.saveTokensToStorage();
          //  this.showAlert(`Token ${this.tokens[index].symbol} berhasil diperbarui`, 'info');
            return this.tokens[index];
        }
        this.showAlert(`Token tidak ditemukan`, 'danger');
        this.loadTokenTable();
        this.updateStats();
        return null;
    }

    deleteToken(tokenId) {
        const token = this.tokens.find(t => t.id === tokenId);
        if (!token) {
            this.showAlert(`Token tidak ditemukan`, 'danger');
            return false;
        }

        const konfirmasi = confirm(`Yakin ingin menghapus token ${token.symbol}?`);
        if (!konfirmasi) return false;

        this.tokens = this.tokens.filter(t => t.id !== tokenId);
        this.saveTokensToStorage();
        this.showAlert(`Token ${token.symbol} berhasil dihapus`, 'warning');
        this.loadTokenTable();
        this.updateStats();
        return true;
    }

    toggleTokenStatus(tokenId) {
        const token = this.tokens.find(t => t.id === tokenId);
        if (token) {
            token.isActive = !token.isActive;
            this.saveTokensToStorage();
            const status = token.isActive ? 'diaktifkan' : 'dinonaktifkan';
            this.showAlert(`Token ${token.symbol} telah ${status}`, 'info');
            return token;
        }
        showAlert(`Token tidak ditemukan`, 'danger');
            this.loadTokenTable();
            this.updateStats();
        return null;
    }

    // UI Updates
    loadTokenTable() {
        const tbody = $('#tokenTableBody');
        tbody.empty();

        if (this.tokens.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        No tokens added yet
                    </td>
                </tr>
            `);
            return;
        }

        // Urutkan token: yang aktif (isActive: true) di atas
        const sortedTokens = this.tokens.slice().sort((a, b) => {
            return (b.isActive === true) - (a.isActive === true);
        });

        sortedTokens.forEach((token, index) => {
            const cexBadges = token.selectedCexs.map(cex => 
                `<span class="badge ${this.getBadgeColor(cex, 'cex')} exchange-badge">${cex}</span>`
            ).join('');

            const dexBadges = token.selectedDexs.map(dex => 
                `<span class="badge ${this.getBadgeColor(dex, 'dex')} exchange-badge">${dex}</span>`
            ).join('');

            const chainBadge = `<span class="badge ${this.getBadgeColor(token.chain, 'chain')}">${token.chain}</span>`;

            const statusBadge = token.isActive 
                ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-secondary">Inactive</span>';

            tbody.append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <strong>${token.symbol}/${token.pairSymbol}</strong>
                        <br><small class="text-muted">${this.shortenAddress(token.contractAddress)} / ${this.shortenAddress(token.pairContractAddress)}</small>
                    </td>
                    <td>${chainBadge}</td>
                    <td><strong>Modal: $${token.modalCexToDex}</strong> <br/>${cexBadges}</td>
                    <td><strong>Modal: $${token.modalDexToCex}</strong> <br/>${dexBadges}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="app.editToken('${token.id}')" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="app.toggleTokenStatus('${token.id}')" title="Toggle Status">
                                <i class="bi bi-power"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="app.deleteToken('${token.id}')" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `);
        });
    }


    shortenAddress(address, start = 6, end = 6) {
        if (!address || address.length <= start + end) return address;
        return address.substring(0, start) + "..." + address.substring(address.length - end);
    }

    getBadgeColor(name, type) {
        if (type === 'cex') {
            const colors = {
                Binance: 'bg-warning text-dark',
                MEXC: 'bg-primary',
                Gateio: 'bg-danger text-light',
            };
            return colors[name] || 'bg-primary';
        }
        if (type === 'dex') {
            const colors = {
                KyberSwap: 'bg-success',
                Matcha: 'bg-primary',
                ODOS: 'bg-danger',
                Magpie: 'bg-info',
                ParaSwap: 'bg-secondary',
                OKXDEX: 'bg-dark',
            };
            return colors[name] || 'bg-secondary';
        }
        if (type === 'chain') {
            const colors = {
                bsc: 'bg-warning text-dark',
                ethereum: 'bg-primary',
                polygon: 'bg-info text-dark',
                arbitrum: 'bg-secondary',
                base: 'bg-danger text-light',
                solana: 'bg-danger text-light',
            };
            return colors[name.toLowerCase()] || 'bg-dark';
        }
        return 'bg-secondary';
    }

    getTextColorClassFromBadge(badgeClass) {
        const map = {
            'bg-success': 'text-success',
            'bg-primary': 'text-primary',
            'bg-danger': 'text-danger',
            'bg-light': 'text-light',
            'bg-info': 'text-info',
            'bg-secondary': 'text-secondary',
            'bg-dark': 'text-dark',
            'bg-warning': 'text-warning',
        };
        return map[badgeClass.split(' ')[0]] || 'text-success';
    }

    loadSettingsForm() {
        $('#tokensPerBatch').val(this.settings.tokensPerBatch);
        $('#UserName').val(this.settings.UserName);
        $('#delayBetweenGrup').val(this.settings.delayBetweenGrup);
        $('#TimeoutCount').val(this.settings.TimeoutCount);
        $('#WalletAddress').val(this.settings.WalletAddress);
    }

    updateStats() {
        const activeTokens = this.tokens.filter(t => t.isActive);
        const count = (chain) => activeTokens.filter(t => t.chain?.toLowerCase() === chain.toLowerCase()).length;

        const targets = ['Monitoring', 'Management'];

        for (const target of targets) {
            $(`#totalTokens${target}`).text(this.tokens.length);
            $(`#activeTokens${target}`).text(activeTokens.length);
            $(`#bscCount${target}`).text(count('BSC'));
            $(`#ethCount${target}`).text(count('Ethereum'));
            $(`#polyCount${target}`).text(count('Polygon'));
            $(`#arbCount${target}`).text(count('Arbitrum'));
            $(`#baseCount${target}`).text(count('Base'));
            $(`#solCount${target}`).text(count('Solana'));
        }

        // ✅ Tambahkan ini untuk hitung total baris monitoring (token × cex aktif)
        let totalBaris = 0;
        activeTokens.forEach(token => {
            if (Array.isArray(token.selectedCexs)) {
                totalBaris += token.selectedCexs.length;
            }
        });

        $('#totalBarisMonitoring').text(totalBaris);
    }

    // Form operations
    resetTokenForm() {
        $('#tokenForm')[0].reset();
        $('#tokenDecimals').val(18);
        $('#pairDecimals').val(18);
        $('#modalCexToDex').val(100);
        $('#modalDexToCex').val(100);
        $('input[type="checkbox"]').prop('checked', false);
    }

    saveToken() {
        const formData = this.getTokenFormData();
        
        if (!this.validateTokenForm(formData)) {
            return;
        }

        try {
            if (this.currentEditingToken) {
                this.updateToken(this.currentEditingToken.id, formData);
                this.showAlert('Token updated successfully!', 'success');
            } else {
                this.addToken(formData);
                this.showAlert('Token added successfully!', 'success');
            }

            $('#tokenModal').modal('hide');
            this.resetTokenForm();
            
            // Refresh prices if auto-refresh is enabled
            if (this.autodelayBetweenGrup) {
                this.refreshPrices();
            }
        } catch (error) {
            this.showAlert('Error saving token: ' + error.message, 'danger');
        }
    }

    getTokenFormData() {
        const selectedCexs = [];
        $('input[id^="cex"]:checked').each(function() {
            selectedCexs.push($(this).val());
        });

        const selectedDexs = [];
        $('input[id^="dex"]:checked').each(function() {
            selectedDexs.push($(this).val());
        });

        return {
            symbol: $('#tokenSymbol').val().trim().toUpperCase(),
            pairSymbol: $('#pairSymbol').val().trim().toUpperCase(),
            contractAddress: $('#tokenContract').val().trim(),
            pairContractAddress: $('#pairContract').val().trim(),
            decimals: $('#tokenDecimals').val(),
            pairDecimals: $('#pairDecimals').val(),
            chain: $('#tokenChain').val(),
            modalCexToDex: $('#modalCexToDex').val(),
            modalDexToCex: $('#modalDexToCex').val(),
            selectedCexs: selectedCexs,
            selectedDexs: selectedDexs
        };
    }

    validateTokenForm(formData) {
        // 🔸 Validasi token
        if (!formData.symbol || !formData.pairSymbol) {
            this.showAlert('Please enter token and pair symbols', 'warning');
            return false;
        }

        if (!formData.contractAddress || !formData.pairContractAddress) {
            this.showAlert('Please enter contract addresses', 'warning');
            return false;
        }

        if (!formData.chain) {
            this.showAlert('Please select a chain', 'warning');
            return false;
        }

        if (!formData.selectedCexs || formData.selectedCexs.length === 0) {
            this.showAlert('Please select at least one CEX', 'warning');
            return false;
        }

        if (!formData.selectedDexs || formData.selectedDexs.length === 0) {
            this.showAlert('Please select at least one DEX', 'warning');
            return false;
        }

        // 🔸 Ambil nilai dari form #settingsForm
        const userName = $('#UserName').val()?.trim();
        const tokensPerBatch = parseInt($('#tokensPerBatch').val());
        const delayBetweenGrup = parseInt($('#delayBetweenGrup').val());
        const timeoutCount = parseInt($('#TimeoutCount').val());
        const walletAddress = $('#WalletAddress').val()?.trim(); // catatan: ID inputnya retryDelay

        // 🔸 Validasi form settings
        if (!userName || userName === 'XXX') {
            this.showAlert('Please enter a valid User Name in Settings', 'danger');
            return false;
        }

        if (!walletAddress || walletAddress === '-') {
            this.showAlert('Please enter a valid Wallet Address in Settings', 'danger');
            return false;
        }

        if (!tokensPerBatch || tokensPerBatch < 1 || tokensPerBatch > 5) {
            this.showAlert('Jumlah Anggota (Tokens Per Batch) harus antara 1-5', 'danger');
            return false;
        }

        if (!delayBetweenGrup || delayBetweenGrup < 300 || delayBetweenGrup > 5000) {
            this.showAlert('Delay antar grup harus antara 300–5000 ms', 'danger');
            return false;
        }

        if (!timeoutCount || timeoutCount < 1000 || timeoutCount > 5000) {
            this.showAlert('Timeout harus antara 1000–5000 ms', 'danger');
            return false;
        }

        // ✅ Semua valid
        return true;
    }

    svalidateTokenForm(formData) {
        // Validasi form token
        if (!formData.symbol || !formData.pairSymbol) {
            this.showAlert('Please enter token and pair symbols', 'warning');
            return false;
        }

        if (!formData.contractAddress || !formData.pairContractAddress) {
            this.showAlert('Please enter contract addresses', 'warning');
            return false;
        }

        if (!formData.chain) {
            this.showAlert('Please select a chain', 'warning');
            return false;
        }

        if (!formData.selectedCexs || formData.selectedCexs.length === 0) {
            this.showAlert('Please select at least one CEX', 'warning');
            return false;
        }

        if (!formData.selectedDexs || formData.selectedDexs.length === 0) {
            this.showAlert('Please select at least one DEX', 'warning');
            return false;
        }

        if (
            !settingsForm.UserName || settingsForm.UserName === 'XXX' || settingsForm.UserName.trim() === '' ||
            !settingsForm.WalletAddress || settingsForm.WalletAddress === '-' || settingsForm.WalletAddress.trim() === ''
        ) {
            this.showAlert('Silakan lengkapi pengaturan aplikasi (UserName & WalletAddress)', 'danger');
            return false;
        }

        return true;
    }

    editToken(tokenId) {
        const token = this.tokens.find(t => t.id === tokenId);

        if (!token) return;

        this.currentEditingToken = token;
        $('#modalTitle').text('Edit Token');

        // Populate form
        $('#tokenSymbol').val(token.symbol);
        $('#pairSymbol').val(token.pairSymbol);
        $('#tokenContract').val(token.contractAddress);
        $('#pairContract').val(token.pairContractAddress);
        $('#tokenDecimals').val(token.decimals);
        $('#pairDecimals').val(token.pairDecimals);
        $('#tokenChain').val(token.chain);
        $('#modalCexToDex').val(token.modalCexToDex);
        $('#modalDexToCex').val(token.modalDexToCex);

        // Set checkboxes
        $('input[type="checkbox"]').prop('checked', false);
        token.selectedCexs.forEach(cex => {
            $(`input[value="${cex}"]`).prop('checked', true);
        });
        token.selectedDexs.forEach(dex => {
            $(`input[value="${dex}"]`).prop('checked', true);
        });

        $('#tokenModal').modal('show');
    }

    saveSettings() {
        this.settings = {
            tokensPerBatch: parseInt($('#tokensPerBatch').val()),
            UserName: $('#UserName').val(),
            delayBetweenGrup: parseInt($('#delayBetweenGrup').val()),
            TimeoutCount: parseInt($('#TimeoutCount').val()),
            WalletAddress: $('#WalletAddress').val()
        };

        this.saveSettingsToStorage();
        this.showAlert('Settings saved successfully!', 'success');
        $('#settingsModal').modal('hide');
    }

    async CheckPricess() {
        const activeTokens = this.tokens
            .filter(t => t.isActive)
            .sort((a, b) => {
                const symbolA = a.symbol.toLowerCase();
                const symbolB = b.symbol.toLowerCase();
                return this.sortAscending
                    ? symbolA.localeCompare(symbolB)
                    : symbolB.localeCompare(symbolA);
            });

       // console.log("CLICKED CHECK",activeTokens);
        if (activeTokens.length === 0) {
            this.showAlert('No active tokens to monitor', 'info');
            $('#priceTableBody').html(`<tr><td colspan="13" class="text-center text-muted py-5">
                <i class="bi bi-info-circle me-2"></i> Tidak ada DATA KOIN, Silakan ke Management TOKEN
            </td></tr>`);
            return;
        }

        // 🔧 Ambil setting dari localStorage
        const settings = this.loadSettings();

        if (
            !settings ||
            settings.WalletAddress === '-' ||
            settings.UserName === 'XXX'
        ) {
            this.showAlert('SILAKAN SETTING APLIKASI', 'danger');
            $('#manualRefreshBtn').prop('disabled', true); // disable tombol
            return;
        }
        const tokensPerBatch = settings.tokensPerBatch || 3;
        const UserName = settings.UserName || 1000;
        const delayBetweenGrup = settings.delayBetweenGrup || 1300;

        const totalTokens = activeTokens.length;
        let currentIndex = 0;

        const chunkArray = (arr, size) => {
            const result = [];
            for (let i = 0; i < arr.length; i += size) {
                result.push(arr.slice(i, i + size));
            }
            return result;
        };

        const tokenBatches = chunkArray(activeTokens, tokensPerBatch); // batch isi X token

        this.isRefreshing = true;
        $('#manualRefreshBtn').addClass('loading');

        // 🕒 Mulai timer
        const startTime = new Date();
        const startStr = startTime.toLocaleTimeString(); // HH:MM:SS
        $('#scanTimeInfo').html(`<span class="text-secondary">&nbsp;🕒 Mulai: ${startStr}</span>&nbsp;`);

        try {
            for (const batch of tokenBatches) {
                await Promise.allSettled(batch.map(async token => {
                    currentIndex++;
                    const percent = Math.round((currentIndex / totalTokens) * 100);
                    $('#scanProgressText').text(`Progress: ${currentIndex} dari ${totalTokens}`);
                    $('#scanProgressPercent').text(`${percent}%`);
                    $('#scanProgressBar').css('width', `${percent}%`);

                    const priceData = {
                        token,
                        analisis_data: {
                            cex_to_dex: {},
                            dex_to_cex: {}
                        }
                    };

                    for (const cexName of token.selectedCexs) {
                        await this.fetchCEXPrices(token, priceData, cexName, 'cex_to_dex');
                        this.generateOrderBook(token, priceData, cexName, 'cex_to_dex');

                        await this.fetchCEXPrices(token, priceData, cexName, 'dex_to_cex');
                        this.generateOrderBook(token, priceData, cexName, 'dex_to_cex');

                        for (const dexName of token.selectedDexs) {
                            await this.fetchDEXPrices(token, priceData, dexName, cexName, 'cex_to_dex');
                        }

                        for (const dexName of token.selectedDexs) {
                            await this.fetchDEXPrices(token, priceData, dexName, cexName, 'dex_to_cex');
                        }
                    }
                    console.log(priceData);
                }));

                if (delayBetweenGrup > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayBetweenGrup));
                }
            }

            // 🕓 Hitung durasi selesai
            const endTime = new Date();
            const durationSec = Math.floor((endTime - startTime) / 1000);
            const minutes = Math.floor(durationSec / 60).toString().padStart(2, '0');
            const seconds = (durationSec % 60).toString().padStart(2, '0');

            $('#scanTimeInfo').append(`<span class="text-success">&nbsp;&nbsp;✅ Durasi: ${minutes}:${seconds}</span>&nbsp;`);
            this.showAlert('Scanner selesai.', 'success');

        } catch (err) {
            console.error('❌ Error saat refreshPrices:', err);
            this.showAlert('Error saat refresh: ' + err.message, 'danger');
        } finally {
            this.isRefreshing = false;
            $('#manualRefreshBtn').removeClass('loading');
        }
    }

    updateTokenDEXCell(token, priceData, cexName, dexName, direction) {
         if (!(token.selectedDexs || []).includes(dexName)) return;
        let cellId;

        if (direction === 'cex_to_dex') {
            cellId = `cell_${token.symbol}_${token.pairSymbol}_${token.chain}_${cexName}_${dexName}`;
        } else if (direction === 'dex_to_cex') {
            cellId = `cell_${token.pairSymbol}_${token.symbol}_${token.chain}_${dexName}_${cexName}`;
        } else {
            console.warn('Unknown direction:', direction);
            return;
        }

        // Normalisasi: lowercase dan hilangkan karakter non-alfanumerik
        cellId = cellId.toLowerCase().replace(/\W+/g, '');
        const $cell = $('#' + cellId);

        // Ambil data dari priceData
        const value = priceData?.dex_data?.[dexName]?.[direction]?.[cexName];
        if (!value) return;

        const price = value.price ?? '---';
        const fee = value.fee ?? 0;
        const pnl = value.pnl ?? 0;

        // Penentuan warna PNL
        let classPNL = 'text-muted';
        if (pnl > fee) classPNL = 'text-success';
        else if (pnl < 0) classPNL = 'text-danger';

        $cell
            .removeClass()
            .addClass(`dex-price-cell text-center ${classPNL}`)
            .html(`${price} <br><small class="text-secondary">PNL: ${pnl}</small>`);
    }

    setDexCellLoading(token, cexName, dexName, direction) {
        const cellId = direction === 'cex_to_dex'
            ? `cell_${token.symbol}_${token.pairSymbol}_${token.chain}_${cexName}_${dexName}`
            : `cell_${token.pairSymbol}_${token.symbol}_${token.chain}_${dexName}_${cexName}`;

        const safeId = cellId.toLowerCase().replace(/\W+/g, '');
        const $cell = $('#' + safeId);

        if ($cell.length) {
            $cell
                .removeClass()
                .addClass('dex-price-cell text-info text-center align-middle')
                .html(`
                    <div class="text-info small">
                        ${dexName}&nbsp;
                        <span class="spinner-border spinner-border-sm me-1"></span>
                    </div>
                    <div class="fee-info">&nbsp;</div>
                    <div class="pnl-info">&nbsp;</div>
                `);
        }
    }

    async fetchCEXPrices(token, tokenPriceData, cexName, direction) {
        if (!this.gasTokenPrices) this.gasTokenPrices = {};
        const promises = [];

        const baseSymbol = token.symbol.toUpperCase();
        const quoteSymbol = token.pairSymbol.toUpperCase();

        if (baseSymbol === 'USDT') this.gasTokenPrices['USDT'] = 1;
        if (quoteSymbol === 'USDT') this.gasTokenPrices['USDT'] = 1;

        // ✅ Siapkan struktur penyimpanan
        tokenPriceData.analisis_data = tokenPriceData.analisis_data || {};
        tokenPriceData.analisis_data[direction] = tokenPriceData.analisis_data[direction] || {};
        tokenPriceData.analisis_data[direction][cexName] = tokenPriceData.analisis_data[direction][cexName] || {};

        const symbols = [baseSymbol, quoteSymbol];

        for (const symbol of symbols) {
            const pair = { baseSymbol: symbol, quoteSymbol: 'USDT' };

            const assignData = (data) => {
                tokenPriceData.analisis_data[direction][cexName][`${symbol}ToUSDT`] = data;
                if (data.buy) this.gasTokenPrices[symbol] = data.buy;
            };

            switch (cexName) {
                case 'Binance':
                    promises.push(
                        CEXAPIs.getBinanceOrderBook(pair).then(assignData).catch(err =>
                            console.warn(`Binance ${symbol}/USDT error: ${err.message}`)
                        )
                    );
                    break;
                case 'MEXC':
                    promises.push(
                        CEXAPIs.getMEXCOrderBook(pair).then(assignData).catch(err =>
                            console.warn(`MEXC ${symbol}/USDT error: ${err.message}`)
                        )
                    );
                    break;
                case 'Gateio':
                    promises.push(
                        CEXAPIs.getGateOrderBook(pair).then(assignData).catch(err =>
                            console.warn(`Gateio ${symbol}/USDT error: ${err.message}`)
                        )
                    );
                    break;
            }
        }

        await Promise.allSettled(promises);
    }

    getCEXRate(cexData, symbol, type = 'buy') {
        if (!cexData) return 0;
        const key = Object.keys(cexData).find(k => k.toUpperCase().includes(symbol.toUpperCase()));
        return Number(cexData?.[key]?.[type] || 0);
    }

   async fetchDEXPrices(token, tokenPriceData, dexName, cexName, direction) {
        const chainId = PriceUtils.getChainId(token.chain);
        const network = token.chain.toLowerCase();
        const tokenDecimals = token.decimals;
        const pairDecimals = token.pairDecimals;
        const gasFeeUSD = PriceUtils.getGasFeeUSD(token.chain, 210000, 5);

        const baseSymbol = token.symbol.toUpperCase();
        const quoteSymbol = token.pairSymbol.toUpperCase();
        const modal = direction === 'cex_to_dex' ? token.modalCexToDex : token.modalDexToCex;

        const isBaseUSDT = baseSymbol === 'USDT';
        const isQuoteUSDT = quoteSymbol === 'USDT';

        const cexData = tokenPriceData.analisis_data?.[direction]?.[cexName];
        if (!cexData) {
            console.warn(`❗ Tidak ada data CEX untuk ${token.symbol}/${token.pairSymbol}`);
            return;
        }

        const getCEXRate = (symbol, type = 'buy') => {
            const key = Object.keys(cexData).find(k => k.toUpperCase().includes(symbol));
            return Number(cexData?.[key]?.[type] || 0);
        };

        const baseBuy = isBaseUSDT ? 1 : getCEXRate(baseSymbol, 'buy');
        const baseSell = isBaseUSDT ? 1 : getCEXRate(baseSymbol, 'sell');
        const quoteBuy = isQuoteUSDT ? 1 : getCEXRate(quoteSymbol, 'buy');
        const quoteSell = isQuoteUSDT ? 1 : getCEXRate(quoteSymbol, 'sell');

        if (!baseBuy || !baseSell || !quoteBuy || !quoteSell) {
            console.warn(`[CEX] Harga tidak lengkap:`, { baseBuy, baseSell, quoteBuy, quoteSell });
            return;
        }

        let inputContract, outputContract, inputDecimals, outputDecimals;
        if (direction === 'cex_to_dex') {
            inputContract = token.contractAddress;
            outputContract = token.pairContractAddress;
            inputDecimals = tokenDecimals;
            outputDecimals = pairDecimals;
        } else {
            inputContract = token.pairContractAddress;
            outputContract = token.contractAddress;
            inputDecimals = pairDecimals;
            outputDecimals = tokenDecimals;
        }

        const inputAmountToken = direction === 'cex_to_dex'
            ? (isBaseUSDT ? modal : modal / baseBuy)
            : (isQuoteUSDT ? modal : modal / quoteBuy);

        const rawAmountIn = PriceUtils.calculateAmount(inputAmountToken, inputDecimals);

        this.setDexCellLoading(token, cexName, dexName, direction);

        const handleResult = (dexName, data, rawOutProp = 'amountOut') => {
            const outRaw = data[rawOutProp] || '0';
            const normalizedIn = PriceUtils.normalizeAmount(rawAmountIn, inputDecimals);
            const normalizedOut = PriceUtils.normalizeAmount(outRaw, outputDecimals);

            let price = 0;
            if (direction === 'cex_to_dex') {
                price = normalizedOut / normalizedIn;
            } else {
                price = normalizedOut > 0 ? modal / normalizedOut : 0;
            }

            const priceInUSDT = price * (direction === 'cex_to_dex'
                ? (isQuoteUSDT ? 1 : quoteBuy)
                : (isBaseUSDT ? 1 : baseSell));

            const pairKey = `${baseSymbol}To${quoteSymbol}`;
            tokenPriceData.analisis_data[direction][dexName] = tokenPriceData.analisis_data[direction][dexName] || {};
            tokenPriceData.analisis_data[direction][dexName][pairKey] = {
                    exchange: dexName,
                    amountIn: rawAmountIn,
                    amountOut: outRaw,
                    price: priceInUSDT,
                    rawRate: price,
                    fee: data.fee || gasFeeUSD,
                    from: direction === 'cex_to_dex' ? baseSymbol : quoteSymbol,
                    to: direction === 'cex_to_dex' ? quoteSymbol : baseSymbol,
                    rateSymbol: `${direction === 'cex_to_dex' ? quoteSymbol : baseSymbol}/${direction === 'cex_to_dex' ? baseSymbol : quoteSymbol}`,
                    quotePriceUSDT: direction === 'cex_to_dex' ? quoteBuy : baseSell,
                    baseBuy, baseSell, quoteBuy, quoteSell,
                    gasEstimate: data.gasEstimate || 0,
                    gasPrice: data.gasPrice || 0,
                    timestamp: Date.now()
            };

            const dexInfo = tokenPriceData.analisis_data[direction][dexName][pairKey];
            const html = this.CellResult(token, cexData, dexInfo, direction, dexName);
            const cellId = direction === 'cex_to_dex'
                ? `cell_${token.symbol}_${token.pairSymbol}_${token.chain}_${cexName}_${dexName}`
                : `cell_${token.pairSymbol}_${token.symbol}_${token.chain}_${dexName}_${cexName}`;

            $(`#${cellId.toLowerCase().replace(/\W+/g, '')}`).html(html);
        };

        try {
            switch (dexName) {
                case 'KyberSwap':
                    handleResult('KyberSwap', await DEXAPIs.getKyberSwapPrice(inputContract, outputContract, rawAmountIn, network));
                    break;
                case 'Matcha':
                    handleResult('Matcha', await DEXAPIs.get0xPrice(inputContract, outputContract, rawAmountIn, chainId), 'buyAmount');
                    break;
                case 'OKXDEX':
                    handleResult('OKXDEX', await DEXAPIs.getOKXDEXPrice(inputContract, outputContract, rawAmountIn, network));
                    break;
                case 'ODOS':
                    const odosIn = [{ tokenAddress: inputContract, amount: rawAmountIn.toString() }];
                    const odosOut = [{ tokenAddress: outputContract, proportion: 1 }];
                    const odosData = await DEXAPIs.getODOSPrice(odosIn, odosOut, '0x0000000000000000000000000000000000000000', rawAmountIn.toString(), chainId);

                    if (odosData?.status === 'timeout' || odosData?.error) {
                        throw new Error(`ODOS error: ${odosData.error || odosData.status}`);
                    }

                    handleResult('ODOS', { ...odosData, amountOut: odosData.outAmounts?.[0] || '0' });
                    break;
                case 'Magpie':
                    handleResult('Magpie', await DEXAPIs.getMagpiePrice(inputContract, outputContract, rawAmountIn, network));
                    break;
                case 'ParaSwap':
                    handleResult('ParaSwap', await DEXAPIs.getParaSwapPrice(inputContract, outputContract, rawAmountIn, inputDecimals, outputDecimals, chainId));
                    break;
                default:
                    console.warn(`[⚠️ fetchDEXPrices] DEX tidak dikenal: ${dexName}`);
                break;
            }
        } catch (err) {
            console.error(`❌ DEX ${dexName} gagal →`,token, err);
            this.CellResult(token, cexData, { error: err?.error || err?.message || 'Unknown DEX error' }, direction, dexName);
        }
    }

    printPriceAnalysis(token, tokenPriceData,direction) {
        const baseSymbol = token.symbol.toUpperCase();
        const quoteSymbol = token.pairSymbol.toUpperCase();
        const cex = token.selectedCexs?.[0];
        const dexList = token.selectedDexs || [];

        const cexData = tokenPriceData.cex_data?.[cex] || {};
        const baseBuy = cexData?.[`${baseSymbol}ToUSDT`]?.buy || 1;
        const baseSell = cexData?.[`${baseSymbol}ToUSDT`]?.sell || 1;
        const quoteBuy = cexData?.[`${quoteSymbol}ToUSDT`]?.buy || 1;
        const quoteSell = cexData?.[`${quoteSymbol}ToUSDT`]?.sell || 1;

        const modalCEXtoDEX = token.modalCexToDex;
        const modalDEXtoCEX = token.modalDexToCex;

        console.log(`\n📊 ANALISA PELUANG ${baseSymbol}/${quoteSymbol}`);

        dexList.forEach(dex => {
            const dexData = tokenPriceData.dex_data?.[dex];
            if (!dexData) return;

            // ▶️ CEX → DEX
            const dexCEXtoDEX = dexData.cex_to_dex;
            if (dexCEXtoDEX && !dexCEXtoDEX.error) {
                const buyPrice = baseBuy;
                const sellPrice = dexCEXtoDEX.price;
                const qty = buyPrice > 0 ? modalCEXtoDEX / buyPrice : 0;
                const fee = dexCEXtoDEX.fee || 0;
                const pnl = PriceUtils.calculatePNL(buyPrice, sellPrice, qty, fee);

               // console.log(`\n✅ CEX → DEX (${cex} → ${dex})`);
                console.log(`\n✅ CEX → DEX (${direction})`);
                console.log(`Modal: $${modalCEXtoDEX}`);
                console.log(`Beli ${baseSymbol} @ $${buyPrice}`);
                console.log(`Swap ${baseSymbol} → ${quoteSymbol} @ $${sellPrice}`);
                console.log(`FeeSwap: $${fee.toFixed(6)}`);
                console.log(`PNL: ${PriceUtils.formatPNL(pnl)}`);
            }

            // ▶️ DEX → CEX (❗ FIXED)
            const dexDEXtoCEX = dexData.dex_to_cex;
            if (dexDEXtoCEX && !dexDEXtoCEX.error) {
                const buyPrice = dexDEXtoCEX.rawRate;   // beli quote token (misal: BNB)
                const sellPrice = baseSell;             // jual base token (misal: AUCTION → USDT)
                const qty = buyPrice > 0 ? modalDEXtoCEX / buyPrice : 0;
                const fee = dexDEXtoCEX.fee || 0;
                const pnl = PriceUtils.calculatePNL(buyPrice, sellPrice, qty, fee);

                //console.log(`\n🔁 DEX → CEX (${dex} → ${cex})`);
                console.log(`\n🔁 DEX → CEX (${direction})`);
                console.log(`Modal: $${modalDEXtoCEX}`);
                console.log(`Beli ${quoteSymbol} @ $${buyPrice}`);
                console.log(`Swap ${quoteSymbol} → ${baseSymbol} @ $${sellPrice}`);
                console.log(`FeeSwap: $${fee.toFixed(6)}`);
                console.log(`PNL: ${PriceUtils.formatPNL(pnl)}`);
            }
        });
    }

    CellResult(token, cexInfo, dexInfo, direction, dexName) {
        const cexName = token.selectedCexs[0] || 'CEX';

        let cellId = direction === 'cex_to_dex'
            ? `cell_${token.symbol}_${token.pairSymbol}_${token.chain}_${cexName}_${dexName}`
            : `cell_${token.pairSymbol}_${token.symbol}_${token.chain}_${dexName}_${cexName}`;
        const cleanCellId = cellId.toLowerCase().replace(/\W+/g, '');

        const $cell = $('#' + cleanCellId);
        if (!$cell.length) return;

        const linkSwap = direction === 'cex_to_dex'
            ? this.generateDexLink(dexName, token.chain, token.symbol, token.contractAddress, token.pairSymbol, token.pairContractAddress)
            : this.generateDexLink(dexName, token.chain, token.pairSymbol, token.pairContractAddress, token.symbol, token.contractAddress);

        // 🔴 Jika DEX tidak dipilih
        if (!(token.selectedDexs || []).includes(dexName)) {
            $cell
                .removeClass()
                .addClass('dex-price-cell text-muted text-center')
                .html(`
                    <div class="price-info">&nbsp;</div>
                    <div class="fee-info">---</div>
                    <div class="pnl-info">&nbsp;</div>
                `);
            return;
        }

        // ❌ Jika terjadi error
        if (!dexInfo || dexInfo.error) {
            const errorMsg = (dexInfo?.error?.message || dexInfo?.error || 'Fetch Error').toString().substring(0, 120);
            $cell
                .removeClass()
                .addClass('dex-price-cell text-danger text-center bg-danger-subtle')
                .html(`
                    <div class="price-info">&nbsp;</div>
                    <div class="fee-info" title="${dexName}: ${errorMsg}">❌</div>
                    <div class="pnl-info">&nbsp;</div>
                `);
            return;
        }

        // ✅ Jika data valid
        const fee = dexInfo.fee || 0;
        const modal = direction === 'cex_to_dex' ? token.modalCexToDex : token.modalDexToCex;

        const base = token.symbol.toUpperCase() === 'USDT' ? token.pairSymbol.toUpperCase() : token.symbol.toUpperCase();
        const cexKey = `${base}ToUSDT`;
        const cexData = cexInfo?.[cexKey] || {};

        let buyPrice = 0, sellPrice = 0;
        if (direction === 'cex_to_dex') {
            buyPrice = cexData.buy || 0;
            sellPrice = dexInfo?.price || 0;
        } else {
            buyPrice = dexInfo?.rawRate || 0;
            sellPrice = cexData.sell || 0;
        }

        if (!buyPrice || !sellPrice) {
            $cell
                .removeClass()
                .addClass('dex-price-cell text-center text-muted')
                .html(`<div class="text-muted small">⚠️</div>`);
            return;
        }

        const feeTrade = modal*0.001; // dari dexInfo
        const feeWD = 0.000;  // biaya withdraw, bisa diganti dinamis
        const totalFee = feeTrade + feeWD + fee;

        const qty = modal / buyPrice;
        const pnl = PriceUtils.calculatePNL(buyPrice, sellPrice, qty, totalFee);
        const isPNLPositive = pnl > fee;
        const tdStyle = isPNLPositive ? 'background-color:rgb(183, 235, 212) !important;' : '';
        const pnlClass = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';

        const fromSymbol = direction === 'cex_to_dex' ? token.symbol : token.pairSymbol;
        const toSymbol   = direction === 'cex_to_dex' ? token.pairSymbol : token.symbol;
        const cexLinks = this.GeturlExchanger(cexName.toUpperCase(),toSymbol, fromSymbol);
        const cexLink = cexLinks.tradeLink || '#';
        const buyLink = direction === 'cex_to_dex' ? cexLink : linkSwap;
        const sellLink = direction === 'cex_to_dex' ? linkSwap : cexLink;

        const tokenReceived = qty.toFixed(6);
        const pairReceived = (qty * sellPrice).toFixed(6);

        const tooltipLAMA = `            
            ${direction.replace(/_/g, ' ').toUpperCase()} via ${dexName}
            ${fromSymbol} => ${toSymbol}
            Modal: $${modal} 
            Buy ${fromSymbol}@: $${buyPrice.toFixed(8)}
            Token Qty: ${tokenReceived} ${fromSymbol}

            Sell ${toSymbol}@: $${sellPrice.toFixed(8)}
            Est Result: ${pairReceived} ${toSymbol}

            Fee Trade: $${feeTrade.toFixed(2)}
            Fee WD: $${feeWD.toFixed(2)}
            Fee Swap: $${fee.toFixed(2)}
            Total Fee: $${totalFee.toFixed(2)}
            PNL: $${pnl.toFixed(2)}
        `.trim();

        const tooltip = (direction === 'cex_to_dex') ? `
            CEX → DEX via ${dexName}

            Modal: $${modal}
            Harga beli ${token.symbol}: $${buyPrice.toFixed(8)}
            ⇒ Jumlah: ${qty.toFixed(4)} ${token.symbol}

            Swap rate (DEX): 1 ${token.symbol} = ${sellPrice.toFixed(8)} ${token.pairSymbol}
            ⇒ Hasil: ${(qty * sellPrice).toFixed(4)} ${token.pairSymbol}

            Konversi ${token.pairSymbol} ke USDT via CEX:
            Harga ${token.pairSymbol} di CEX: $${cexInfo?.[`${token.pairSymbol.toUpperCase()}ToUSDT`]?.buy?.toFixed(6) || 'N/A'}
            ⇒ Nilai akhir: $${(qty * sellPrice * (cexInfo?.[`${token.pairSymbol.toUpperCase()}ToUSDT`]?.buy || 0)).toFixed(2)}

            Fee Trade: $${feeTrade.toFixed(2)}
            Fee Swap: $${fee.toFixed(2)}
            Fee Withdraw: $${feeWD.toFixed(2)}
            Total Fee: $${totalFee.toFixed(2)}

            PNL: $${pnl.toFixed(2)}
            `.trim() : `
            DEX → CEX via ${dexName}

            Modal: $${modal}
            Harga beli ${token.pairSymbol}: $${buyPrice.toFixed(8)}
            ⇒ Jumlah: ${qty.toFixed(4)} ${token.pairSymbol}

            Swap rate (DEX): 1 ${token.pairSymbol} = ${sellPrice.toFixed(68)} ${token.symbol}
            ⇒ Hasil: ${(qty * sellPrice).toFixed(4)} ${token.symbol}

            Konversi ${token.symbol} ke USDT via CEX:
            Harga ${token.symbol} di CEX: $${cexInfo?.[`${token.symbol.toUpperCase()}ToUSDT`]?.sell?.toFixed(6) || 'N/A'}
            ⇒ Nilai akhir: $${(qty * sellPrice * (cexInfo?.[`${token.symbol.toUpperCase()}ToUSDT`]?.sell || 0)).toFixed(2)}

            Fee Trade: $${feeTrade.toFixed(2)}
            Fee Swap: $${fee.toFixed(2)}
            Fee Withdraw: $${feeWD.toFixed(2)}
            Total Fee: $${totalFee.toFixed(2)}

            PNL: $${pnl.toFixed(2)}
            `.trim();

        console.log("ALUR PROSES",tooltip);
        // ✅ Simpan sinyal PNL jika untung
        if (isPNLPositive) {
            this.pnlSignals = this.pnlSignals || {};
            const dexKey = dexName.toUpperCase();
            this.pnlSignals[dexKey] = this.pnlSignals[dexKey] || [];

            const fromSide = direction === 'cex_to_dex' ? cexName : dexName;
            const toSide = direction === 'cex_to_dex' ? dexName : cexName;
            const chainLabel = token.chain?.toUpperCase() || 'CHAIN';

            const modalText = `$${modal}`;
            const pnlText = `$${pnl.toFixed(2)}`;
            const cexColor = this.getTextColorClassFromBadge(this.getBadgeColor(cexName, 'cex'));
            const chainColor = this.getTextColorClassFromBadge(this.getBadgeColor(token.chain, 'chain'));
            const rowId = `token-row-${token.id}-${cexName.replace(/\W+/g, '').toLowerCase()}`;

            const directionLabel = direction === 'cex_to_dex'
                ? ` <span class="text-success fw-bold"> DARI </span> <span class="${cexColor} fw-bold">${fromSide.toUpperCase()}</span>`
                : ` <span class="text-danger fw-bold"> KE </span> <span class="${cexColor} fw-bold">${toSide.toUpperCase()}</span>`;

            const signalText = `<a href="#${rowId}" class="text-decoration-none text-dark">
                ${directionLabel}
                <span class="${chainColor} fw-bold">[${chainLabel}]</span> : 
                <span class="text-secondary fw-bold">${modalText} (${fromSymbol} → ${toSymbol}) = </span>
                <span class="text-success fw-bold"> PNL: ${pnlText}</span>
            </a>`;

            this.pnlSignals[dexKey].push(signalText);

            const listEl = document.getElementById(`pnl-list-${dexKey}`);
            if (listEl) {
                listEl.innerHTML = `${this.pnlSignals[dexKey].join(' | ')}`;
            }

            const modalValue = parseFloat(modal);
            const feeWD = 0.000;
            this.sendInfoSignal(this.settings.UserName || 'Anon',  token, cexName,  dexName,  buyPrice,  sellPrice, feeWD, fee, pnl, direction, modalValue );
        }

        // ✅ Update isi cell
        $cell
            .attr('style', tdStyle)
            .attr('title', tooltip)
            .removeClass()
            .addClass('dex-price-cell align-middle')
            .html(`
                <div class="price-info">
                    <span class="text-success">
                        <a href="${buyLink}" target="_blank">${PriceUtils.formatPrice(buyPrice)}</a>
                    </span><br>
                    <span class="text-danger">
                        <a href="${sellLink}" target="_blank">${PriceUtils.formatPrice(sellPrice)}</a>
                    </span>
                </div>
                <div class="fee-info">WD: XXX </div>
                <div class="fee-info">Swap: ${PriceUtils.formatFee(fee)}</div>
                <div class="pnl-info ${pnlClass}">PNL: ${PriceUtils.formatPNL(pnl)}</div>
            `);
    }

    initPNLSignalStructure() {
        const container = $('#dexSignals');
        container.empty();
        this.pnlSignals = {};

        for (const dex of dexOrder) {
            const dexKey = dex.toUpperCase();
            this.pnlSignals[dexKey] = [];

            const color = this.getBadgeColor(dex, 'dex');
            const html = `
                <div id="pnl-${dexKey}">
                    <span class="badge ${color} me-1">${dex.toUpperCase()} : </span>
                    <span id="pnl-list-${dexKey}"></span>
                </div>
            `;
            container.append(html);
        }
    }

    generateDexLink(dex, tokenChain, tokenSymbol, tokenAddress, pairSymbol, pairAddress) {
        const chainName = tokenChain.toLowerCase(); // e.g. 'bsc', 'ethereum'        
        const chainCode = chainCodeMap[chainName] || 1;

        const links = {
            kyberswap: `https://kyberswap.com/swap/${chainName}/${tokenAddress}-to-${pairAddress}`,
            matcha: `https://matcha.xyz/tokens/${chainName}/${tokenAddress.toLowerCase()}?buyChain=${chainCode}&buyAddress=${pairAddress.toLowerCase()}`,
            magpie: `https://app.magpiefi.xyz/swap/${chainName}/${tokenSymbol.toUpperCase()}/${chainName}/${pairSymbol.toUpperCase()}`,
            odos: "https://app.odos.xyz",
            okxdex: `https://www.okx.com/web3/dex-swap?inputChain=${chainCode}&inputCurrency=${tokenAddress}&outputChain=501&outputCurrency=${pairAddress}`,
            paraswap: `https://app.ParaSwap.xyz/#/swap/${tokenAddress}-${pairAddress}?version=6.2&network=${chainName}`,
        };

        return links[dex.toLowerCase()] || null;
    }

    generateStokLinkCEX(tokenAddress, chain, cex) {
        const chainKey = chain.toLowerCase();
        const cexKey = cex.toUpperCase();
        const chainData = CEXWallets[chainKey];
        if (!chainData) return '#STOK';

        const wallet = chainData.WALLET_CEX?.[cexKey]?.address;
        const explorer = explorerUrls[chainData.Kode_Chain] || explorerUrls['1'];

        if (!wallet) return '#STOK';

        return `${explorer}/token/${tokenAddress}?a=${wallet}`;
    }

    // ✅ Tambahkan fungsi ini dalam class
    GeturlExchanger(cex, NameToken, NamePair, direction = 'cex_to_dex') {
        const token = NameToken.toUpperCase();
        const pair = NamePair.toUpperCase();
        const dir = direction.toLowerCase();

        let tradeLink = '#';
        let withdrawUrl = null;
        let depositUrl = null;

        // ✅ Tentukan simbol untuk trade berdasarkan arah dan posisi USDT
        let symbolForTrade = 'BTC'; // fallback jika tidak ada pilihan

        if (token === 'USDT') {
            symbolForTrade = pair;
        } else if (pair === 'USDT') {
            symbolForTrade = token;
        } else {
            symbolForTrade = pair;
        }

        switch (cex.toUpperCase()) {
            case 'BINANCE':
                tradeLink = `https://www.binance.com/en/trade/${symbolForTrade}_USDT`;
                withdrawUrl = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${symbolForTrade}`;
                depositUrl = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${symbolForTrade}`;
                break;

            case 'GATEIO':
                tradeLink = `https://www.gate.io/trade/${symbolForTrade}_USDT`;
                withdrawUrl = `https://www.gate.io/myaccount/withdraw/${symbolForTrade}`;
                depositUrl = `https://www.gate.io/myaccount/deposit/${symbolForTrade}`;
                break;

            case 'MEXC':
                tradeLink = `https://www.mexc.com/exchange/${symbolForTrade}_USDT?_from=search`;
                withdrawUrl = `https://www.mexc.com/assets/withdraw/${symbolForTrade}`;
                depositUrl = `https://www.mexc.com/assets/deposit/${symbolForTrade}`;
                break;
        }

        return {
            tradeLink,
            withdrawUrl,
            depositUrl
        };
    }

    // Create token detail content
    createTokenDetailContent(token, cex) {
        const chainId = PriceUtils.getChainId(token.chain);
        const explorerUrl = explorerUrls[chainId] || explorerUrls['1'];

        const tokenSymbol = token.symbol.toUpperCase();
        const pairSymbol = token.pairSymbol.toUpperCase();
        const chain = token.chain.toUpperCase();
        const cexUpper = cex.toUpperCase();

        const cexBadgeColor = this.getBadgeColor(cex, 'cex');
        const chainBadgeColor = this.getBadgeColor(token.chain, 'chain');

        const url = this.GeturlExchanger(cexUpper, tokenSymbol, pairSymbol);
        const url2 = this.GeturlExchanger(cexUpper, pairSymbol, tokenSymbol);

        const tokenSC = `<a href="${url2.tradeLink}" target="_blank">${tokenSymbol}</a>`;
        const pairSC = `<a href="${url.tradeLink}" target="_blank">${pairSymbol}</a>`;

        const stokTokenLink = this.generateStokLinkCEX(token.contractAddress, token.chain, cexUpper);
        const stokPairLink = this.generateStokLinkCEX(token.pairContractAddress, token.chain, cexUpper);

        const tokenLink = `<i class="bi bi-wallet"></i> <a href="${explorerUrl}/token/${token.contractAddress}" target="_blank">${tokenSymbol}</a>: <a href="${stokTokenLink}" target="_blank">#1</a>`;
        const pairLink = `<i class="bi bi-wallet"></i> <a href="${explorerUrl}/token/${token.pairContractAddress}" target="_blank">${pairSymbol}</a>: <a href="${stokPairLink}" target="_blank">#2</a>`;

        const linkOKDEX = `<a href="https://www.okx.com/web3/dex-swap?inputChain=${chainId}&inputCurrency=${token.contractAddress}&outputChain=501&outputCurrency=${token.pairContractAddress}" target="_blank" class="text-dark">#OKX</a>`;
        const linkUNIDEX = `<a href="https://app.unidex.exchange/?chain=${token.chain}&from=${token.contractAddress}&to=${token.pairContractAddress}" target="_blank" class="text-info">#UNX</a>`;
        const linkDEFIL = `<a href="https://swap.defillama.com/?chain=${token.chain}&from=${token.contractAddress}&to=${token.pairContractAddress}" target="_blank" class="text-success">#DFL</a>`;
        const link1INCH = `<a href="https://app.1inch.io/advanced/swap?network=${chainId}&src=${token.contractAddress}&dst=${token.pairContractAddress}" target="_blank" class="text-danger">#1NC</a>`;

        return `
            <div class="text-center">
                <div><strong>${token.modalCexToDex}$ ⇔ ${token.modalDexToCex}$</strong></div>
                <div class="text-secondary fs-6">
                    <span class="badge ${cexBadgeColor}">${cexUpper}</span>
                    ON <span class="badge ${chainBadgeColor}">${chain}</span>
                </div>

                <div class="text-secondary">
                    💹 ${tokenSC}
                    <a href="${url.withdrawUrl}" target="_blank" class="text-success">[WD]</a>
                    VS
                    💹 ${pairSC}
                    <a href="${url.depositUrl}" target="_blank" class="text-success">[DP]</a>
                </div>
                <div>${tokenLink} | ${pairLink}</div>
                <div class="mt-1">
                   ${linkOKDEX} ${linkUNIDEX}  ${linkDEFIL} ${link1INCH}
                </div>
            </div>
        `;
    }

    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        const totalTime = this.settings.delayBetweenGrup;
        let timeLeft = totalTime;

        this.countdownInterval = setInterval(() => {
            timeLeft--;

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            $('#countdown').text(timeString);

            const progress = ((totalTime - timeLeft) / totalTime) * 100;
            $('#refreshProgress').css('width', `${progress}%`);

            if (timeLeft <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;

                // Saat countdown selesai → jalankan scan token
                this.refreshPrices(); // Ini akan memanggil countdown lagi setelah selesai
            }
        }, 1000);
    }

    stopAutoRefresh() {
        this._isAutoRefreshActive = false;

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        $('#autoRefreshToggle').html('<i class="bi bi-play-fill"></i> Start Auto');
        $('#autoRefreshStatus').text('Disabled');
        $('#countdown').text('--');
        $('#refreshProgress').css('width', '0%');
        this.showAlert('Auto refresh stopped', 'info');
    }

    // Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        $('body').append(alertHtml);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            $(`#${alertId}`).alert('close');
        }, 3000);
    }

    sendStatusTELE(user, status) {
        var users = [
            { chat_id: -1002079288809 }
        ];

         // Ambil hanya token yang aktif
        const activeTokens = this.tokens.filter(t => t.isActive);

        // Hitung jumlah per chain
        const bscCount = activeTokens.filter(t => t.chain === 'BSC').length;
        const ethCount = activeTokens.filter(t => t.chain === 'Ethereum').length;
        const polyCount = activeTokens.filter(t => t.chain === 'Polygon').length;
        const baseCount = activeTokens.filter(t => t.chain === 'Base').length;
        const arbCount = activeTokens.filter(t => t.chain === 'Arbitrum').length;
        const solCount = activeTokens.filter(t => t.chain === 'Solana').length;
        var apiUrl = 'https://api.telegram.org/bot8053447166:AAH7YYbyZ4eBoPX31D8h3bCYdzEeIaiG4JU/sendMessage';

       // var message = "MULTI ARBITRAGE: #" + user.toUpperCase() + " is <b>[ " + status + " ]</b>";
        let message =
        `#${user.toUpperCase()} is <b>${status}</b> in MULTIALL\n` +
        `-------------------------------------------\n` +
        `• <b>BSC</b>: ${bscCount} ` +
        `• <b>Ethereum</b>: ${ethCount} \n` +
        `• <b>Polygon</b>: ${polyCount} ` +
        `• <b>Base</b>: ${baseCount} \n` +
        `• <b>Arbitrum</b>: ${arbCount} ` ;
        // Loop melalui daftar pengguna
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var chatId = user.chat_id; // Ganti dengan ID chat pengguna

            // Membuat permintaan POST menggunakan jQuery
            $.ajax({
            url: apiUrl,
            method: "POST",
            data: {
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
                disable_web_page_preview: true
            },
            success: function(response) {
                // console.log("Message sent successfully");
            },
            error: function(xhr, status, error) {
                console.log("Error sending message:", error);
            }
            });
          }
    }

    sendInfoSignal(user, token, cex, dex, buyPrice, sellPrice, feeWD, feeSwap, pnl, direction, modal) {
        const users = [
            { chat_id: -1002079288809 }
        ];

        const apiUrl = 'https://api.telegram.org/bot8053447166:AAH7YYbyZ4eBoPX31D8h3bCYdzEeIaiG4JU/sendMessage';

        const fromSymbol = direction === 'cex_to_dex' ? token.symbol : token.pairSymbol;
        const toSymbol   = direction === 'cex_to_dex' ? token.pairSymbol : token.symbol;
        const scIn       = direction === 'cex_to_dex' ? token.contractAddress : token.pairContractAddress;
        const scOut      = direction === 'cex_to_dex' ? token.pairContractAddress : token.contractAddress;

        const chainName  = token.chain.toLowerCase();
        const chainIdMap = {
            'ethereum': '1',
            'bsc': '56',
            'polygon': '137',
            'arbitrum': '42161',
            'base': '8453',
        };
        const chainId = chainIdMap[chainName];
        const explorerBase = explorerUrls[chainId] || 'https://etherscan.io';

        const linkBuy  = `<a href="${explorerBase}/token/${scIn}" target="_blank">${fromSymbol}</a>`;
        const linkSell = `<a href="${explorerBase}/token/${scOut}" target="_blank">${toSymbol}</a>`;

        // ✅ Ambil 1 link utama CEX (pakai simbol yang benar)
        const cexTradeObj = this.GeturlExchanger(cex.toUpperCase(), fromSymbol, toSymbol);
        const cexTradeLink = cexTradeObj?.tradeLink || '#';

        const dexTradeLink = `https://swap.defillama.com/?chain=${token.chain}&from=${scIn}&to=${scOut}`;
        const totalFee = feeWD + feeSwap;

        const message =
            `<b>#SIGNAL_MULTIALL</b>\n` +
            `<b>USER:</b> ~ #${user}\n` +
            `--------------------------------------------\n` +
            `<b>MARKET:</b> <a href="${cexTradeLink}" target="_blank">${cex.toUpperCase()}</a> VS <a href="${dexTradeLink}" target="_blank">${dex.toUpperCase()}</a>\n` +
            `<b>CHAIN:</b> ${token.chain.toUpperCase()}\n` +
            `<b>TOKEN-PAIR:</b> <b>#${fromSymbol}_${toSymbol}</b>\n` +
            `<b>MODAL:</b> $${modal} | <b>PROFIT:</b> $${pnl.toFixed(2)}\n` +
            `<b>BUY:</b> ${linkBuy} @ ${buyPrice.toFixed(9)}\n` +
            `<b>SELL:</b> ${linkSell} @ ${sellPrice.toFixed(9)}\n` +
            `<b>FEE WD:</b> ${feeWD.toFixed(3)}\n` +
            `<b>FEE TOTAL:</b> $${totalFee.toFixed(2)} | <b>SWAP:</b> $${feeSwap.toFixed(2)}\n` +
            `--------------------------------------------`;

        users.forEach(user => {
            $.ajax({
                url: apiUrl,
                method: "POST",
                data: {
                    chat_id: user.chat_id,
                    text: message,
                    parse_mode: "HTML",
                    disable_web_page_preview: true
                },
                success: function () {
                   // console.log("✅ Signal berhasil dikirim ke Telegram");
                },
                error: function (xhr, status, error) {
                    console.error("❌ Gagal kirim ke Telegram:", error);
                }
            });
        });
    }

}

// Initialize the application when DOM is ready
$(document).ready(function() {
    window.app = new TokenPriceMonitor();
    $(document).on('click', 'a[href^="#cell_"]', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('.dex-price-cell').removeClass('highlight-cell'); // buat class ini di CSS
            target.addClass('highlight-cell');
            $('html, body').animate({ scrollTop: target.offset().top - 120 }, 300);
        }
    });


    const settings = localStorage.getItem('SETT_MULTI');
    const parsed = settings ? JSON.parse(settings) : null;

    if (!parsed || parsed.UserName === 'XXX' || parsed.UserName === null || parsed.WalletAddress === '-' || parsed.WalletAddress === null || parsed.UserName === '' || parsed.WalletAddress === '') {
        $('#CheckPrice').prop('disabled', true);
        alert("SILAKAN SETTING APP DAHULU!!");
    }

     $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        if ($(e.target).attr('href') === '#tokenManagement') {
            app.updateStats();
        }
    });
});

