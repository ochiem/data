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
        this.autoRefreshInterval = null;
        this.countdownInterval = null;
        this.isRefreshing = false;
        this.currentEditingToken = null;
        
        this.init();
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
            this.generateEmptyTable();
            this.initPNLSignalStructure(); 
            $('#CheckPrice').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Scanning...');
            await this.refreshPrices();
            $('#CheckPrice').prop('disabled', false).html('<i class="bi bi-arrow-clockwise"></i>Check Price');
        });

        // Auto refresh toggle
        $('#autoRefreshToggle').on('click', () => {
            this.toggleAutoRefresh();
        });

      //  Save token button
        $('#saveTokenBtn').on('click', () => {
            this.saveToken();
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
            const dataStr = JSON.stringify(this.tokens, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'tokens.json';
            link.click();

            URL.revokeObjectURL(url);
        });

        $('#importTokensBtn').on('click', () => {
            $('#importTokensInput').click();
        });

        $('#importTokensInput').on('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTokens = JSON.parse(e.target.result);
                    if (Array.isArray(importedTokens)) {
                        this.tokens = importedTokens;
                        this.saveTokensToStorage();
                        this.loadTokenTable();
                        this.updateStats();
                        this.showAlert('Token berhasil diimpor', 'success');
                    } else {
                        this.showAlert('File tidak valid', 'danger');
                    }
                } catch (err) {
                    this.showAlert('Gagal membaca file JSON', 'danger');
                }
            };
            reader.readAsText(file);
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

        const activeTokens = this.tokens.filter(t => t.isActive);
        if (activeTokens.length === 0) {
            tbody.html(`<tr><td colspan="13" class="text-center text-muted py-5">Belum ada token aktif</td></tr>`);
            return;
        }

        for (const token of activeTokens) {
            for (const cex of token.selectedCexs) {
                const rowId = `token-row-${token.id}-${cex.replace(/\W+/g, '')}`;

                // CEX → DEX
                const dexCEXtoDEX = dexOrder.map(dex => {
                    const isDexSelected = token.selectedDexs?.includes(dex);
                    const icon = isDexSelected ? '🔒' : '---';
                    const bgClass = isDexSelected ? '' : 'bg-secondary bg-gradient';
                    return `<td class="dex-price-cell cex_to_dex-${dex} text-muted text-center ${bgClass}">${icon}</td>`;
                }).join('');

                // DEX → CEX
                const dexDEXtoCEX = dexOrder.map(dex => {
                    const isDexSelected = token.selectedDexs?.includes(dex);
                    const icon = isDexSelected ? '🔒' : '---';
                    const bgClass = isDexSelected ? '' : 'bg-secondary bg-gradient';
                    return `<td class="dex-price-cell dex_to_cex-${dex} text-muted text-center ${bgClass}">${icon}</td>`;
                }).join('');

                // Detail tengah
                const detailHTML = this.createTokenDetailContent(token, cex);

                // Baris tabel
                const rowHTML = `
                    <tr id="${rowId}" class="token-data-row text-center">
                        <td class="cex-order-buy-${cex} text-dark">${cex} 🔒</td>
                        ${dexCEXtoDEX}
                        <td class="token-detail-cell">${detailHTML}</td>
                        ${dexDEXtoCEX}
                        <td class="cex-order-sell-${cex} text-dark">${cex} 🔒</td>
                    </tr>
                `;

                tbody.append(rowHTML);
            }
        }
    }

    // LocalStorage operations
    loadTokens() {
        const tokens = localStorage.getItem('TOKEN_MULTI');
        return tokens ? JSON.parse(tokens) : [];
    }

    saveTokensToStorage() {
        localStorage.setItem('TOKEN_MULTI', JSON.stringify(this.tokens));
        this.updateStats();
        this.loadTokenTable();
    }

    loadSettings() {
        const settings = localStorage.getItem('SETT_MULTI');
        return settings ? JSON.parse(settings) : {
            tokensPerBatch: 5,
            delayBetweenCalls: 0,
            refreshInterval: 30,
            autoRetryCount: 3,
            retryDelay: 5000
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

        this.tokens.forEach((token, index) => {
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
                    <td>${cexBadges}</td>
                    <td>${dexBadges}</td>
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
                bsc: 'bg-warning',
                ethereum: 'bg-primary',
                polygon: 'bg-info',
                arbitrum: 'bg-secondary',
                base: 'bg-success',
                solana: 'bg-danger',
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
            'bg-info': 'text-info',
            'bg-secondary': 'text-secondary',
            'bg-dark': 'text-dark',
            'bg-warning': 'text-warning',
        };
        return map[badgeClass.split(' ')[0]] || 'text-secondary';
    }

    loadSettingsForm() {
        $('#tokensPerBatch').val(this.settings.tokensPerBatch);
        $('#delayBetweenCalls').val(this.settings.delayBetweenCalls);
        $('#refreshInterval').val(this.settings.refreshInterval);
        $('#autoRetryCount').val(this.settings.autoRetryCount);
        $('#retryDelay').val(this.settings.retryDelay);
    }

    updateStats() {
        const activeTokens = this.tokens.filter(t => t.isActive);
        const bscCount = activeTokens.filter(t => t.chain === 'BSC').length;
        const ethCount = activeTokens.filter(t => t.chain === 'Ethereum').length;
        const polyCount = activeTokens.filter(t => t.chain === 'Polygon').length;

        $('#totalTokens').text(this.tokens.length);
        $('#activeTokens').text(activeTokens.length);
        $('#bscCount').text(bscCount);
        $('#ethCount').text(ethCount);
        $('#polyCount').text(polyCount);
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
            if (this.autoRefreshInterval) {
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

        if (formData.selectedCexs.length === 0) {
            this.showAlert('Please select at least one CEX', 'warning');
            return false;
        }

        if (formData.selectedDexs.length === 0) {
            this.showAlert('Please select at least one DEX', 'warning');
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
        // tokensPerBatch: jumlah token yang diproses per batch (jika ada pagination).
        // delayBetweenCalls: jeda antar-panggilan API (menghindari rate-limit).
        // refreshInterval: interval auto-refresh harga (jika diaktifkan).
        // autoRetryCount, retryDelay: retry saat gagal ambil data harga.
        this.settings = {
            tokensPerBatch: parseInt($('#tokensPerBatch').val()),
            delayBetweenCalls: parseInt($('#delayBetweenCalls').val()),
            refreshInterval: parseInt($('#refreshInterval').val()),
            autoRetryCount: parseInt($('#autoRetryCount').val()),
            retryDelay: parseInt($('#retryDelay').val())
        };

        this.saveSettingsToStorage();
        this.showAlert('Settings saved successfully!', 'success');
        $('#settingsModal').modal('hide');

        // Restart auto-refresh if it's running
        if (this.autoRefreshInterval) {
            this.stopAutoRefresh();
            this.startAutoRefresh();
        }
    }

    async refreshPrices() {
        if (this.isRefreshing) return;

        const activeTokens = this.tokens.filter(t => t.isActive);
        if (activeTokens.length === 0) {
            this.showAlert('No active tokens to monitor', 'info');
            $('#priceTableBody').html(`<tr><td colspan="13" class="text-center text-muted py-5">
                <i class="bi bi-info-circle me-2"></i>
                Tidak ada DATA KOIN, Silakan ke Management TOKEN
            </td></tr>`);
            return;
        }

        this.isRefreshing = true;
        $('#manualRefreshBtn').addClass('loading');

        const totalTokens = activeTokens.length;
        let currentIndex = 0;

        try {
            const priceData = {};

            for (const token of activeTokens) {
                currentIndex++;
                const percent = Math.round((currentIndex / totalTokens) * 100);
                $('#scanProgressText').text(`Progress: ${currentIndex} dari ${totalTokens}`);
                $('#scanProgressPercent').text(`${percent}%`);
                $('#scanProgressBar').css('width', `${percent}%`);

                const tokenId = token.id;
                priceData[tokenId] = {
                    token,
                    cex_data: {},
                    dex_data: {}
                };

                await this.fetchCEXPrices(token, priceData[tokenId]);

                for (const cexName of token.selectedCexs) {
                    await this.fetchDEXPrices(token, priceData[tokenId], 'cex_to_dex', cexName);
                    await this.fetchDEXPrices(token, priceData[tokenId], 'dex_to_cex', cexName);

                    this.updateTokenRow(token, priceData[tokenId], cexName);
                    this.printPriceAnalysis(token, priceData[tokenId]);
                }

            }

            this.showAlert('Scanner Selesai..', 'success');
            if (this._isAutoRefreshActive) this.startCountdown();

        } catch (err) {
            console.error('❌ Gagal saat refreshPrices:', err);
            this.showAlert('Error saat refresh: ' + err.message, 'danger');
        } finally {
            this.isRefreshing = false;
            $('#manualRefreshBtn').removeClass('loading');
        }
    }

    setDexCellLoading(token, cexName, dexName, direction) {
        const rowId = `token-row-${token.id}-${cexName.replace(/\W+/g, '')}`;
        const className = direction === 'cex_to_dex'
            ? `.cex_to_dex-${dexName}`
            : `.dex_to_cex-${dexName}`;
        $(`#${rowId} ${className}`).html(`<div class="text-muted">${dexName} ⏳</div>`);
    }

    async fetchCEXPrices(token, tokenPriceData, direction) {
        if (!this.gasTokenPrices) this.gasTokenPrices = {};
        const promises = [];

        const baseSymbol = token.symbol.toUpperCase();       // token pertama
        const quoteSymbol = token.pairSymbol.toUpperCase();  // token kedua

        // Set USDT = 1
        if (baseSymbol === 'USDT') this.gasTokenPrices['USDT'] = 1;
        if (quoteSymbol === 'USDT') this.gasTokenPrices['USDT'] = 1;

        const allSymbols = [baseSymbol, quoteSymbol];
        const uniqueSymbols = [...new Set(allSymbols)];

        for (const tokenSymbol of uniqueSymbols) {
            token.selectedCexs.forEach(cex => {
                const pair = { baseSymbol: tokenSymbol, quoteSymbol: 'USDT' };

                const assignData = (data) => {
                    tokenPriceData.cex_data[cex] = tokenPriceData.cex_data[cex] || {};
                    tokenPriceData.cex_data[cex][`${tokenSymbol}ToUSDT`] = data;
                    if (data.buy) this.gasTokenPrices[tokenSymbol] = data.buy;
                };

                switch (cex) {
                    case 'Binance':
                        promises.push(
                            CEXAPIs.getBinanceOrderBook(pair)
                                .then(assignData)
                                .catch(err => console.warn(`Binance ${tokenSymbol}/USDT error: ${err.message}`))
                        );
                        break;
                    case 'MEXC':
                        promises.push(
                            CEXAPIs.getMEXCOrderBook(pair)
                                .then(assignData)
                                .catch(err => console.warn(`MEXC ${tokenSymbol}/USDT error: ${err.message}`))
                        );
                        break;
                    case 'Gateio':
                        promises.push(
                            CEXAPIs.getGateOrderBook(pair)
                                .then(assignData)
                                .catch(err => console.warn(`Gateio ${tokenSymbol}/USDT error: ${err.message}`))
                        );
                        break;
                }
            });
        }

        await Promise.allSettled(promises);
    }

    getCEXRate(cexData, symbol, type = 'buy') {
        if (!cexData) return 0;
        const key = Object.keys(cexData).find(k => k.toUpperCase().includes(symbol.toUpperCase()));
        return Number(cexData?.[key]?.[type] || 0);
    }

    async fetchDEXPrices(token, tokenPriceData, direction) {
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

        // ✅ CEX yang tersedia
        const cexName = token.selectedCexs.find(name => tokenPriceData.cex_data?.[name]);
        const cexData = tokenPriceData.cex_data?.[cexName];
        if (!cexData) {
            console.warn(`❗ Tidak ada data CEX untuk ${token.symbol}/${token.pairSymbol}`);
            return;
        }

        // ✅ Ambil harga dari CEX berdasarkan simbol token
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

        // Tentukan arah swap
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
        const dexList = token.selectedDexs || [];

        await Promise.allSettled(dexList.map(async dex => {
            this.setDexCellLoading(token, cexName, dex, direction); // ⏳

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

                tokenPriceData.dex_data[dexName] = tokenPriceData.dex_data[dexName] || {};
                tokenPriceData.dex_data[dexName][direction] = {
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

                const html = this.createDEXCell(token, cexData, tokenPriceData.dex_data[dexName][direction], direction, dexName);
                const rowId = `token-row-${token.id}-${cexName.replace(/\W+/g, '')}`;
                const selector = direction === 'cex_to_dex' ? `.cex_to_dex-${dexName}` : `.dex_to_cex-${dexName}`;
                $(`#${rowId} ${selector}`).html($(html).html());
            };

            try {
                switch (dex) {
                    case 'KyberSwap': {
                        const data = await DEXAPIs.getKyberSwapPrice(inputContract, outputContract, rawAmountIn, network);
                        handleResult('KyberSwap', data);
                        break;
                    }
                    case 'Matcha': {
                        const data = await DEXAPIs.get0xPrice(inputContract, outputContract, rawAmountIn, chainId);
                        handleResult('Matcha', data, 'buyAmount');
                        break;
                    }
                    case 'OKXDEX': {
                        const data = await DEXAPIs.getOKXDEXPrice(inputContract, outputContract, rawAmountIn, network);
                        handleResult('OKXDEX', data);
                        break;
                    }
                    case 'ODOS': {
                        const inputTokens = [{ tokenAddress: inputContract, amount: rawAmountIn.toString() }];
                        const outputTokens = [{ tokenAddress: outputContract, proportion: 1 }];
                        const odosData = await DEXAPIs.getODOSPrice(
                            inputTokens,
                            outputTokens,
                            '0x0000000000000000000000000000000000000000',
                            rawAmountIn.toString(),
                            chainId
                        );
                        const result = { ...odosData, amountOut: odosData.outAmounts?.[0] || '0' };
                        handleResult('ODOS', result);
                        break;
                    }
                    case 'Magpie': {
                        const data = await DEXAPIs.getMagpiePrice(inputContract, outputContract, rawAmountIn, network);
                        handleResult('Magpie', data);
                        break;
                    }
                    case 'ParaSwap': {
                        const data = await DEXAPIs.getParaSwapPrice( inputContract, outputContract, rawAmountIn, inputDecimals,  outputDecimals, chainId);
                        handleResult('ParaSwap', data);
                        break;
                    }

                }
            } catch (err) {
                tokenPriceData.dex_data[dex] = tokenPriceData.dex_data[dex] || {};
                tokenPriceData.dex_data[dex][direction] = { error: true };

                const rowId = `token-row-${token.id}-${cexName.replace(/\W+/g, '')}`;
                const selector = direction === 'cex_to_dex' ? `.cex_to_dex-${dex}` : `.dex_to_cex-${dex}`;
                $(`#${rowId} ${selector}`).html('<div class="text-danger">❌</div>');
            }
        }));
    }

    printPriceAnalysis(token, tokenPriceData) {
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

                console.log(`\n✅ CEX → DEX (${cex} → ${dex})`);
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

                console.log(`\n🔁 DEX → CEX (${dex} → ${cex})`);
                console.log(`Modal: $${modalDEXtoCEX}`);
                console.log(`Beli ${quoteSymbol} @ $${buyPrice}`);
                console.log(`Swap ${quoteSymbol} → ${baseSymbol} @ $${sellPrice}`);
                console.log(`FeeSwap: $${fee.toFixed(6)}`);
                console.log(`PNL: ${PriceUtils.formatPNL(pnl)}`);
            }
        });
    }

    createEmptyRow(token, dexData, availableDexs) {
        let rowHtml = `
            <tr>
                <td class="text-center align-middle fw-bold">
                    <div class="d-flex flex-column align-items-center">
                        <span class="badge bg-secondary mb-1">${token.symbol}/${token.pairSymbol}</span>
                        <small class="text-muted">${token.chain}</small>
                    </div>
                </td>
                <td class="text-center align-middle">
                    <span class="text-muted">No CEX data</span>
                </td>
        `;

        // Add empty DEX columns
        availableDexs.forEach(() => {
            rowHtml += '<td class="text-center"><span class="text-muted">N/A</span></td>';
            rowHtml += '<td class="text-center"><span class="text-muted">N/A</span></td>';
        });

        // Detail Token column
        rowHtml += `
            <td class="text-center align-middle">
                <div class="d-flex flex-column gap-1">
                    <a href="https://defillama.com/protocol/${token.symbol.toLowerCase()}" 
                       target="_blank" class="btn btn-sm btn-outline-info" title="View on DeFiLlama">
                        <i class="bi bi-graph-up"></i> DeFiLlama
                    </a>
                    <a href="${this.getExplorerUrl(token.contractAddress, token.chain)}" 
                       target="_blank" class="btn btn-sm btn-outline-secondary" title="View Contract">
                        <i class="bi bi-file-earmark-code"></i> Contract
                    </a>
                    <a href="${this.getTradeUrl(token.contractAddress, token.chain)}" 
                       target="_blank" class="btn btn-sm btn-outline-success" title="Trade">
                        <i class="bi bi-arrow-left-right"></i> Trade
                    </a>
                </div>
            </td>
        </tr>
        `;
        return rowHtml;
    }

   updateTokenRow(token, priceData, targetCexName = null) {
        const tokenId = token.id;
        const cexData = priceData.cex_data || {};
        const dexData = priceData.dex_data || {};
        const tbody = $('#priceTableBody');

        const cexNames = Object.keys(cexData);
        for (const cexName of cexNames) {
            if (targetCexName && cexName !== targetCexName) continue;

            const rowId = `token-row-${tokenId}-${cexName.replace(/\W+/g, '')}`;
            const $row = $(`#${rowId}`);
            if ($row.length === 0) return;

            const newRow = this.createCEXRow(token, cexName, cexData[cexName], dexData);
            const $newRow = typeof newRow === 'string' ? $(newRow) : newRow;

            // Ambil semua <td> baru dan update ke row lama
            const $tds = $row.find('td');
            const $newTds = $newRow.find('td');

            $tds.each((i, td) => {
                $(td).html($newTds.eq(i).html());
            });
        }
    }

    // Create rows for a token
    createTokenRows(token, priceData, tbody) {
        const cexData = priceData.cex_data || {};
        const dexData = priceData.dex_data || {};
        
        // If no CEX data, create a single row
        if (Object.keys(cexData).length === 0) {
            const row = this.createEmptyRow(token, dexData);
            tbody.append(row);
            return;
        }

        // Create rows for each CEX
        const cexNames = Object.keys(cexData);
        cexNames.forEach((cexName, index) => {
            const cexInfo = cexData[cexName];
            const row = this.createCEXRow(token, cexName, cexInfo, dexData);
            tbody.append(row);
        });
    }

    createCEXRow(token, cexName, cexInfo, dexData) {
        const baseSymbol = token.symbol.toUpperCase();
        const quoteSymbol = token.pairSymbol.toUpperCase();

        const pairKeyBase = `${baseSymbol}ToUSDT`;
        const pairKeyQuote = `${quoteSymbol}ToUSDT`;

        const baseCexInfo = {
            ...cexInfo[pairKeyBase],
            buy: cexInfo[pairKeyBase]?.buy,
            sell: cexInfo[pairKeyBase]?.sell
        };

        const dexToCexSymbol = baseSymbol;
        const pairKeySell = `${dexToCexSymbol}ToUSDT`;
        const quoteCexInfo = {
            ...cexInfo[pairKeySell],
            buy: cexInfo[pairKeySell]?.buy,
            sell: cexInfo[pairKeySell]?.sell
        };

        let row = '<tr>';

        // ✅ CEX BUY: kita JUAL ke CEX (lihat BID)
        row += `<td class="cex-price-cell">`;
        row += baseCexInfo.topAsks
            ? baseCexInfo.topAsks.map(x => {
                const priceFormatted = PriceUtils.formatPrice(x.price);
                const volume = (x.price * x.qty).toFixed(2);
                return `<div class="text-success">${priceFormatted} : $${volume}</div>`;
            }).join('')
            : '<div class="text-muted">N/A</div>';
        row += `</td>`;

        // ✅ DEX columns: CEX → DEX
        dexOrder.forEach(dexName => {
            const dexInfo = dexData[dexName]?.['cex_to_dex'];
            row += this.createDEXCell(token, baseCexInfo, dexInfo, 'cex_to_dex', dexName);
        });

        // ✅ Token detail
        row += `<td class="token-detail-cell">${this.createTokenDetailContent(token, cexName)}</td>`;

        // ✅ DEX columns: DEX → CEX
        dexOrder.forEach(dexName => {
            const dexInfo = dexData[dexName]?.['dex_to_cex'];
            row += this.createDEXCell(token, quoteCexInfo, dexInfo, 'dex_to_cex', dexName);
        });

        // ✅ CEX SELL: kita BELI dari CEX (lihat ASK)
        row += `<td class="cex-price-cell">`;
        row += quoteCexInfo.topBids
            ? quoteCexInfo.topBids.map(x => {
                const priceFormatted = PriceUtils.formatPrice(x.price);
                const volume = (x.price * x.qty).toFixed(2);
                return `<div class="text-danger">${priceFormatted} : $${volume}</div>`;
            }).join('')
            : '<div class="text-muted">N/A</div>';
        row += `</td>`;

        row += '</tr>';
        return row;
    }

    createDEXCell(token, cexInfo, dexInfo, direction, dexName) {
        const linkSwap = direction === 'cex_to_dex'
            ? this.generateDexLink(dexName, token.chain, token.symbol, token.contractAddress, token.pairSymbol, token.pairContractAddress)
            : this.generateDexLink(dexName, token.chain, token.pairSymbol, token.pairContractAddress, token.symbol, token.contractAddress);

        if (!(token.selectedDexs || []).includes(dexName)) {
            return `<td class="dex-price-cell text-muted text-center bg-secondary-subtle">
                <div class="price-info">&nbsp;</div>
                <div class="fee-info">---</div>
                <div class="pnl-info">&nbsp;</div>
            </td>`;
        }

        // Handle error
        if (!dexInfo || dexInfo.error) {
            const errorMsg = (dexInfo?.error?.message || dexInfo?.error || 'Fetch Error').toString().substring(0, 120);
            return `<td class="dex-price-cell text-danger text-center bg-danger-subtle">
                <div class="price-info">&nbsp;</div>
                <div class="fee-info" title="${dexName}: ${errorMsg}">❌</div>
                <div class="pnl-info">&nbsp;</div>
            </td>`;
        }

        const fee = dexInfo.fee || 0;
        const modal = direction === 'cex_to_dex' ? token.modalCexToDex : token.modalDexToCex;

        let buyPrice = 0;
        let sellPrice = 0;

        if (direction === 'cex_to_dex') {
            buyPrice = cexInfo?.buy || 0;
            sellPrice = dexInfo?.price || 0;
        } else {
            buyPrice = dexInfo?.rawRate || 0;
            sellPrice = cexInfo?.sell || 0;
        }

        // ⏳ Jika belum ada harga valid
        if (!buyPrice || !sellPrice) {
            return `<td class="dex-price-cell text-center text-muted bg-light-subtle">
                <div class="text-muted small">⚠️</div>
            </td>`;
        }

        // ✅ Kalkulasi PNL
        const qty = modal / buyPrice;
        const pnl = PriceUtils.calculatePNL(buyPrice, sellPrice, qty, fee);
        const isPNLPositive = pnl > fee;
        const tdClass = isPNLPositive ? 'bg-success' : '';
        const pnlClass = pnl >= 0 ? 'pnl-positive' : 'pnl-negative';

        // ✅ CEX & DEX Links
        const cexLinks = this.GeturlExchanger(token.selectedCexs[0]?.toUpperCase() || '', token.symbol, token.pairSymbol);
        const cexLink = direction === 'cex_to_dex' ? cexLinks.tradeToken : cexLinks.tradePair;
        const buyLink = direction === 'cex_to_dex' ? cexLink : linkSwap;
        const sellLink = direction === 'cex_to_dex' ? linkSwap : cexLink;

        const tooltip = `
            ${direction.replace(/_/g, ' ').toUpperCase()} ${dexName}
            Modal: $${modal}
            Buy @: $${buyPrice}
            Sell @: $${sellPrice}
            Fee: $${fee}
            PNL: $${pnl.toFixed(4)}
        `.trim();

       if (isPNLPositive) {
            this.pnlSignals = this.pnlSignals || {};
            const dexKey = dexName.toUpperCase();
            this.pnlSignals[dexKey] = this.pnlSignals[dexKey] || [];

            const fromSymbol = direction === 'cex_to_dex' ? token.symbol : token.pairSymbol;
            const toSymbol = direction === 'cex_to_dex' ? token.pairSymbol : token.symbol;
            const fromSide = direction === 'cex_to_dex' ? (token.selectedCexs[0] || 'CEX') : dexName;
            const toSide = direction === 'cex_to_dex' ? dexName : (token.selectedCexs[0] || 'CEX');
            const chainLabel = token.chain?.toUpperCase() || 'CHAIN';

            const modalText = `$${modal}`;
            const pnlText = `$${pnl.toFixed(2)}`;
            const rowId = `token-row-${token.id}-${(token.selectedCexs[0] || 'CEX').replace(/\W+/g, '')}`;
            const linkHref = `#${rowId}`;

            // Warna teks
            const cexColor = this.getTextColorClassFromBadge(this.getBadgeColor(fromSide, 'cex'));
            const dexColor = this.getTextColorClassFromBadge(this.getBadgeColor(toSide, 'dex'));
            const chainColor = this.getTextColorClassFromBadge(this.getBadgeColor(token.chain, 'chain'));

            const signalText = `<a href="${linkHref}" class="text-decoration-none text-dark">
                <span class="${cexColor} fw-bold">${fromSide.toUpperCase()}</span> → 
                <span class="${dexColor} fw-bold">${toSide.toUpperCase()}</span> 
                <span class="${chainColor} fw-bold">[${chainLabel}]</span> : 
                <span class="text-secondary fw-bold">${modalText} (${fromSymbol} → ${toSymbol}) = </span>
                <span class="text-success fw-bold"> PNL: ${pnlText}</span>
            </a>`;

            this.pnlSignals[dexKey].push(signalText);

            const listEl = document.getElementById(`pnl-list-${dexKey}`);
            if (listEl) {
                listEl.innerHTML = `${this.pnlSignals[dexKey].join(' | ')}`;
            }
        }


        return `<td class="dex-price-cell align-middle ${tdClass}" title="${tooltip}">
            <div class="price-info">
                <span class="text-success">
                    <a href="${buyLink}" target="_blank">${PriceUtils.formatPrice(buyPrice)}</a>
                </span><br>
                <span class="text-danger">
                    <a href="${sellLink}" target="_blank">${PriceUtils.formatPrice(sellPrice)}</a>
                </span>
            </div>
            <div class="fee-info">Swap: ${PriceUtils.formatFee(fee)}</div>
            <div class="pnl-info ${pnlClass}">PNL: ${PriceUtils.formatPNL(pnl)}</div>
        </td>`;
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

    renderPNLSignals() {
        const signalDiv = $('#dexSignals');
        signalDiv.empty();

        if (!this.pnlSignals || Object.keys(this.pnlSignals).length === 0) {
            signalDiv.html('<div class="text-muted small">Tidak ada sinyal PNL positif</div>');
            return;
        }

        for (const [dex, signals] of Object.entries(this.pnlSignals)) {
            const html = `<div><strong>${dex.toUpperCase()} :</strong><br>• ${signals.join('<br>• ')}</div><hr>`;
            signalDiv.append(html);
        }
    }

    updatePNLSignals(allTokenPriceData) {
        const dexSummary = {}; // untuk menyimpan DEX → list sinyal

        // Loop semua token
        for (const tokenData of allTokenPriceData) {
            const { token, priceData } = tokenData;

            for (const dex of dexOrder) {
                const dexInfoCEXtoDEX = priceData.dex_data?.[dex]?.cex_to_dex;
                const dexInfoDEXtoCEX = priceData.dex_data?.[dex]?.dex_to_cex;

                [dexInfoCEXtoDEX, dexInfoDEXtoCEX].forEach(info => {
                    if (info && !info.error && info.pnl > info.fee) {
                        const key = dex.toUpperCase();
                        const direction = info.from + ' → ' + info.to;
                        const msg = `${token.symbol}/${token.pairSymbol} (${direction}) = PNL: ${info.pnl.toFixed(2)}$`;

                        if (!dexSummary[key]) dexSummary[key] = [];
                        dexSummary[key].push(msg);
                    }
                });
            }
        }

        // Render ke HTML
        const signalDiv = $('#dexSignals');
        signalDiv.empty();

        if (Object.keys(dexSummary).length === 0) {
            signalDiv.html('<div class="text-muted">Tidak ada sinyal PNL positif saat ini</div>');
            return;
        }

        for (const [dex, messages] of Object.entries(dexSummary)) {
            const dexHTML = `<div><strong>${dex} :</strong><br>• ${messages.join('<br>• ')}</div><hr>`;
            signalDiv.append(dexHTML);
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
            OKXDEX: `https://www.okx.com/web3/dex-swap?inputChain=${chainCode}&inputCurrency=${tokenAddress}&outputChain=501&outputCurrency=${pairAddress}`,
            ParaSwap: `https://app.ParaSwap.xyz/#/swap/${tokenAddress}-${pairAddress}?version=6.2&network=${chainName}`,
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
    GeturlExchanger(cex, NameToken, NamePair) {
        const token = NameToken.toUpperCase();
        const pair = NamePair.toUpperCase();

        let baseUrlTradeToken = token === "USDT" ? "#" : null;
        let baseUrlTradePair = pair === "USDT" ? "#" : null;
        let baseUrlWithdraw = null;
        let baseUrlDeposit = null;

        if (cex === "GATEIO") {
            if (baseUrlTradeToken !== "#") baseUrlTradeToken = `https://www.gate.com/trade/${token}_USDT`;
            if (baseUrlTradePair !== "#") baseUrlTradePair = `https://www.gate.com/trade/${pair}_USDT`;
            baseUrlWithdraw = `https://www.gate.com/myaccount/withdraw/${token}`;
            baseUrlDeposit = `https://www.gate.com/myaccount/deposit/${pair}`;
        } else if (cex === "BINANCE") {
            if (baseUrlTradeToken !== "#") baseUrlTradeToken = `https://www.binance.com/en/trade/${token}_USDT`;
            if (baseUrlTradePair !== "#") baseUrlTradePair = `https://www.binance.com/en/trade/${pair}_USDT`;
            baseUrlWithdraw = `https://www.binance.com/en/my/wallet/account/main/withdrawal/crypto/${token}`;
            baseUrlDeposit = `https://www.binance.com/en/my/wallet/account/main/deposit/crypto/${pair}`;
        } else if (cex === "MEXC") {
            if (baseUrlTradeToken !== "#") baseUrlTradeToken = `https://www.mexc.com/exchange/${token}_USDT?_from=search`;
            if (baseUrlTradePair !== "#") baseUrlTradePair = `https://www.mexc.com/exchange/${pair}_USDT?_from=search`;
            baseUrlWithdraw = `https://www.mexc.com/assets/withdraw/${token}`;
            baseUrlDeposit = `https://www.mexc.com/assets/deposit/${pair}`;
        }

        return {
            tradeToken: baseUrlTradeToken,
            tradePair: baseUrlTradePair,
            withdrawUrl: baseUrlWithdraw,
            depositUrl: baseUrlDeposit
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

        const tokenSC = `<a href="${url.tradeToken}" target="_blank">${tokenSymbol}</a>`;
        const pairSC = `<a href="${url.tradePair}" target="_blank">${pairSymbol}</a>`;

        const stokTokenLink = this.generateStokLinkCEX(token.contractAddress, token.chain, cexUpper);
        const stokPairLink = this.generateStokLinkCEX(token.pairContractAddress, token.chain, cexUpper);

        const tokenLink = `<a href="${explorerUrl}/token/${token.contractAddress}" target="_blank">${tokenSymbol}</a> : <a href="${stokTokenLink}" target="_blank">#STOK</a>`;
        const pairLink = `<a href="${explorerUrl}/token/${token.pairContractAddress}" target="_blank">${pairSymbol}</a> : <a href="${stokPairLink}" target="_blank">#STOK</a>`;

        const linkOKDEX = `<a href="https://www.okx.com/web3/dex-swap?inputChain=${chainId}&inputCurrency=${token.contractAddress}&outputChain=501&outputCurrency=${token.pairContractAddress}" target="_blank" class="uk-text-secondary">#OK</a>`;
        const linkUNIDEX = `<a href="https://app.unidex.exchange/?chain=${token.chain}&from=${token.contractAddress}&to=${token.pairContractAddress}" target="_blank" class="uk-text-warning">#UN</a>`;
        const linkDEFIL = `<a href="https://swap.defillama.com/?chain=${token.chain}&from=${token.contractAddress}&to=${token.pairContractAddress}" target="_blank" class="uk-text-primary">#DF</a>`;
        const link1INCH = `<a href="https://app.1inch.io/advanced/swap?network=${chainId}&src=${token.contractAddress}&dst=${token.pairContractAddress}" target="_blank" class="uk-text-danger">#1NC</a>`;

        return `
            <div class="text-center">
                <div><strong>${token.modalCexToDex}$ ⇔ ${token.modalDexToCex}$</strong></div>
                <div class="text-secondary">
                    <span class="badge ${cexBadgeColor}">${cexUpper}</span>
                    ON <span class="badge ${chainBadgeColor}">${chain}</span>
                </div>
                <div class="text-secondary">
                    ${tokenSC}
                    <a href="${url.withdrawUrl}" target="_blank" class="text-success">[WD]</a>
                    VS
                    ${pairSC}
                    <a href="${url.depositUrl}" target="_blank" class="text-success">[DP]</a>
                </div>
                <div>${tokenLink}</div>
                <div>${pairLink}</div>
                <div class="mt-1">
                    ${linkUNIDEX} ${linkOKDEX} ${linkDEFIL} ${link1INCH}
                </div>
            </div>
        `;
        }

    // Create empty row when no CEX data
    createEmptyRows(token, dexData) {
        const rows = [];
        const dexList = ['KyberSwap', 'Matcha', 'Magpie', 'ODOS'];
        const selectedDexs = token.selectedDexs || [];
        const selectedCexs = token.selectedCexs || [];

        // Loop setiap CEX sebagai satu baris
        selectedCexs.forEach(cex => {
            let row = '<tr>';

            // Kolom harga CEX
            row += `<td class="cex-price-cell text-muted">${cex}</td>`;

            // Kolom CEX → DEX (harga beli dari CEX, jual ke DEX)
            dexList.forEach(dex => {
                row += `<td class="dex-price-cell text-muted">${
                    selectedDexs.includes(dex) ? 'N/A' : '---'
                }</td>`;
            });

            // Kolom detail token
            row += `<td class="token-detail-cell">${this.createTokenDetailContent(token)}</td>`;

            // Kolom DEX → CEX (beli di DEX, jual ke CEX)
            dexList.forEach(dex => {
                row += `<td class="dex-price-cell text-muted">${
                    selectedDexs.includes(dex) ? 'N/A' : '---'
                }</td>`;
            });

            row += '</tr>';
            rows.push(row);
        });

        return rows.join('\n');
    }
    
    // Auto refresh functionality
    toggleAutoRefresh() {
        if (this.autoRefreshInterval) {
            this.stopAutoRefresh();
        } else {
            this.startAutoRefresh();
        }
    }

    // ✅ Final fix: countdown dimulai setelah scan SELESAI, termasuk untuk auto-refresh berikutnya
    startAutoRefresh() {
        const interval = this.settings.refreshInterval * 1000;

        this._autoIntervalMs = interval;
        this._isAutoRefreshActive = true;

        $('#autoRefreshToggle').html('<i class="bi bi-pause-fill"></i> Stop Auto');
        $('#autoRefreshStatus').text('Enabled');
        this.showAlert('Auto refresh started', 'info');

        this.refreshPrices(); // Awal
    }

    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        const totalTime = this.settings.refreshInterval;
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

}

// Initialize the application when DOM is ready
$(document).ready(function() {
    window.app = new TokenPriceMonitor();
    $(document).on('click', 'a[href^="#token-row-"]', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('.token-data-row').removeClass('highlight-row'); // hapus highlight lama
            target.addClass('highlight-row');
            $('html, body').animate({ scrollTop: target.offset().top - 100 }, 500);
        }
    });
});

