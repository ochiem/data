// jQuery API Functions for CEX and DEX Price Fetching
const GasPriceUSD = {
    BSC: 0,
    Ethereum: 0,
    Polygon: 0
};

const CONFIG_API = {
    GATE: {
        ApiKey: "577bb104ebb7977925c0ba7a292a722e",
        ApiSecret: "48b2cd4b122f076d2ebf8833359dfeffd268c5a0ce276b4cbe6ba5aa52e7f7cc",
        WARNA: "#D5006D",  // Pink tua
    },
    BINANCE: {
        ApiKey: "2U7YGMEUDri6tP3YEzmK3CcZWb9yQ5j3COp9s7pRRUv4vu8hJAlwH4NkbNK74hDU",
        ApiSecret: "XHjPVjLzbs741xoznV3xz1Wj5SFrcechNBjvezyXLcg8GLWF21VW32f0YhAsQ9pn",
        WARNA: "#e0a50c",  // Orange tua
    },
    MEXC: {
        ApiKey: "mx0vglBh22wwHBY0il", // Ganti dengan ApiKey asli
        ApiSecret: "429877e0b47c41b68dd77613cdfded64", // Ganti dengan ApiSecret asli
        WARNA: "#1448ce",  // Biru muda
    }
    
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
        },
        INDODAX: {
            address : '0x3C02290922a3618A4646E3BbCa65853eA45FE7C6',
            chainCEX : 'POLYGON',
            },   
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
            },
            INDODAX: {
                address : '0xaBa3002AB1597433bA79aBc48eeAd54DC10A45F2',
                chainCEX : 'ARB',
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
            },
            INDODAX: {
                address : '0x3C02290922a3618A4646E3BbCa65853eA45FE7C6',
                chainCEX : 'ETH'
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
            },
            INDODAX: {
                address : '0xaBa3002AB1597433bA79aBc48eeAd54DC10A45F2',
                chainCEX : 'BSC',
            } 
        }
    },
    base: {
        Kode_Chain: 8453,
        WALLET_CEX: {
            GATEIO: {
                address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                chainCEX: 'BASEEVM'
            },
            BINANCE: {
                address: '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
                chainCEX: 'BASE'
            },
            MEXC: {
                address: '0x4e3ae00E8323558fA5Cac04b152238924AA31B60',
                chainCEX: 'BASE'
            },  
            INDODAX: {
                address : '0xaBa3002AB1597433bA79aBc48eeAd54DC10A45F2',
                chainCEX : 'BASE',
            } 
        }
    }
 };

function getCEXKeyAlias(name) {
    const map = {
        "BINANCE": "BINANCE",
        "Binance": "BINANCE",
        "MEXC": "MEXC",
        "Gateio": "GATEIO",
        "GATE": "GATEIO",
        "GATEIO": "GATEIO",
        "INDODAX": "INDODAX",
        "Indodax": "INDODAX"
    };
    return map[name] || name.toUpperCase();
}

var settings = JSON.parse(localStorage.getItem('MULTI_SETTING') || '{}');
var timeoutApi = settings.TimeoutCount || 5000;

function withTimeout(promise, timeout) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout))
    ]);
}

async function fetchWithCountdown(cellId,dexName, promiseFn) {
    const cell = $(`#${cellId}`);
    let countdown = Math.floor(timeoutApi / 1000);

    //cell.html(`⏳ ${countdown--}s`);
    cell.html(`⏳ ${dexName} ${countdown--}s`);
    const interval = setInterval(() => {
        if (countdown > 0) {
            cell.html(`⏳ ${dexName} ${countdown--}s`);
        }
    }, 1000);

    try {
        const result = await withTimeout(promiseFn(), timeoutApi);
        clearInterval(interval);
        return result;
    } catch (err) {
        clearInterval(interval);
// ✅ Tangani error structured dari getMagpiePrice()
        if (err.name === 'TimeoutError') {
            console.warn(`🕒 Timeout pada ${dexName}: permintaan melebihi batas waktu`);
        } else if (err.exchange && err.error) {
            console.error(`❌ Error ${err.exchange}: ${err.error} (status: ${err.status || 'unknown'})`);
        } else {
            console.error(`💥 Error tidak diketahui dari ${dexName}:`, err);
        }

        throw err;
    }
    
}

function calculateSignature(exchange, apiSecret, dataToSign, hashMethod = "HmacSHA256") {
    if (!apiSecret || !dataToSign) {
        console.error(`[${exchange}] API Secret atau Data untuk Signature tidak valid!`);
        return null;
    }

    switch (exchange.toUpperCase()) {
        case "OKX":
            const hmac = CryptoJS.HmacSHA256(dataToSign, apiSecret);
            return CryptoJS.enc.Base64.stringify(hmac);
        default:
            return CryptoJS.HmacSHA256(dataToSign, apiSecret).toString(CryptoJS.enc.Hex);
    }
}

const CEXAPIs = {
    getBinanceOrderBook: async function(pair) {
        if (pair.baseSymbol === 'USDT' && pair.quoteSymbol === 'USDT') {
            //console.warn('⏭️ Skip Binance USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await withTimeout(fetch(`https://data-api.binance.vision/api/v3/depth?symbol=${pair.baseSymbol}USDT&limit=5`), timeoutApi);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await withTimeout(fetch(`https://data-api.binance.visionapi/v3/depth?symbol=${pair.quoteSymbol}USDT&limit=5`), timeoutApi);
            const quoteData = await quoteResp.json();
            quotePriceUSDT = parseFloat(quoteData.asks[0][0]);
        }

        return {
            buy: parseFloat(baseData.asks[0][0]),
            sell: parseFloat(baseData.bids[0][0]),
            topAsks: baseData.asks.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            topBids: baseData.bids.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            quotePriceUSDT
        };
    },

    getMEXCOrderBook: async function(pair) {
        if (pair.baseSymbol === 'USDT' && pair.quoteSymbol === 'USDT') {
          //  console.warn('⏭️ Skip MEXC USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await withTimeout(fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair.baseSymbol}USDT&limit=5`), timeoutApi);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await withTimeout(fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair.quoteSymbol}USDT&limit=5`), timeoutApi);
            const quoteData = await quoteResp.json();
            quotePriceUSDT = parseFloat(quoteData.asks[0][0]);
        }

        return {
            buy: parseFloat(baseData.asks[0][0]),
            sell: parseFloat(baseData.bids[0][0]),
            topAsks: baseData.asks.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            topBids: baseData.bids.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            quotePriceUSDT
        };
    },

    getGateOrderBook: async function(pair) {
        if (pair.baseSymbol === 'USDT' && pair.quoteSymbol === 'USDT') {
           // console.warn('⏭️ Skip Gate.io USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await withTimeout(fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair.baseSymbol}_USDT&limit=5`), timeoutApi);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await withTimeout(fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair.quoteSymbol}_USDT&limit=5`), timeoutApi);
            const quoteData = await quoteResp.json();
            quotePriceUSDT = parseFloat(quoteData.asks[0][0]);
        }

        return {
            buy: parseFloat(baseData.asks[0][0]),
            sell: parseFloat(baseData.bids[0][0]),
            topAsks: baseData.asks.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            topBids: baseData.bids.slice(0, 5).map(x => ({ price: parseFloat(x[0]), qty: parseFloat(x[1]) })),
            quotePriceUSDT
        };
    },
    
    getIndodaxOrderBook: async function (pair) {
        const base = pair.baseSymbol.toLowerCase();
        const quote = pair.quoteSymbol.toLowerCase();

        // Jika pair adalah USDT/USDT
        if (base === 'usdt' && quote === 'usdt') {
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await withTimeout(fetch(`https://indodax.com/api/depth/${base}idr?limit=5`), timeoutApi);
        const baseData = await baseResp.json();

        // ✅ Ambil rate USDT/IDR global agar konsisten dengan CellResult()
        const usdtToIDR = window.ExchangeRates?.IndodaxUSDT || 16000; // fallback default
        const rateIDRtoUSDT = 1 / usdtToIDR;

        if (!baseData?.sell?.length || !baseData?.buy?.length) {
            console.warn(`❌ Order book Indodax kosong untuk ${base}IDR`);
            return {
                buy: 0,
                sell: 0,
                topAsks: [],
                topBids: [],
                quotePriceUSDT: rateIDRtoUSDT
            };
        }

        const topAsks = baseData.buy.map(([price, qty]) => ({
            price: parseFloat(price) * rateIDRtoUSDT, // ✅ harga beli → dikonversi ke USDT
            qty: parseFloat(qty)
        }));

        const topBids = baseData.sell.map(([price, qty]) => ({
            price: parseFloat(price) * rateIDRtoUSDT, // ✅ harga jual → dikonversi ke USDT
            qty: parseFloat(qty)
        }));

        return {
            // ✅ BENAR: buy = harga jual (bid), sell = harga beli (ask)
            buy: topBids[0].price,
            sell: topAsks[0].price,
            topAsks,
            topBids,
            quotePriceUSDT: rateIDRtoUSDT
        };
    }

};

// DEX API Functions
const DEXAPIs = {
    // KyberSwap API
    getKyberSwapPrice: function(tokenIn, tokenOut, amountIn, chainName) {
        const net = chainName === 'avax' ? 'avalanche' : chainName;
        const url = `https://aggregator-api.kyberswap.com/${net}/api/v1/routes?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn}&gasInclude=true`;
 
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'GET',
                timeout: timeoutApi,
                success: function(data) {
                    if (data && data.data && data.data.routeSummary) {
                        const route = data.data.routeSummary;
                        resolve({
                            exchange: 'KyberSwap',
                            amountIn: amountIn,
                            amountOut: route.amountOut,
                            price: parseFloat(route.amountOut) / parseFloat(amountIn),
                            gasEstimate: route.gasEstimate || 0,
                            gasPrice: route.gasPrice || 0,
                            fee: parseFloat(route.gasUsd),
                            rawRate: parseFloat(amountIn) / parseFloat(route.amountOut),
                            timestamp: Date.now()
                        });
                    } else {
                        reject({ exchange: 'KyberSwap', error: 'Invalid response', status: 'invalid_data' });
                    }
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'KYBERSWAP',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    // ODOS API
    getODOSPrice: function(inputTokens, outputTokens, userAddr,amountIn, chainId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://api.odos.xyz/sor/quote/v2',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    chainId: parseInt(chainId),
                    inputTokens,
                    outputTokens,
                    userAddr,
                    slippageLimitPercent: 0.3,
                    sourceBlacklist: [],
                    sourceWhitelist: [],
                    simulate: false,
                    referralCode: 0
                }),
                timeout: timeoutApi,
                success: function(data) {
                    if (data && data.outAmounts && data.outAmounts.length > 0) {
                        resolve({
                            exchange: 'ODOS',
                            amountIn: amountIn,
                            outAmounts: data.outAmounts,
                            amountOut: data.outAmounts?.[0] || '0',
                            price: parseFloat(data.outAmounts[0]) / parseFloat(amountIn),
                            rawRate: parseFloat(amountIn) / parseFloat(data.outAmounts[0]),
                            fee: parseFloat(data.gasEstimateValue),
                            timestamp: Date.now()
                        });

                    } else {
                        reject({ exchange: 'ODOS', error: 'Invalid response', status: 'invalid_data' });
                    }
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'ODOS',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    getHinkalPrice: function(inputTokens, outputTokens, userAddr,amountIn, chainId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://ethmainnet.server.hinkal.pro/OdosSwapData`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    chainId: parseInt(chainId),
                    inputTokens,
                    outputTokens,
                    userAddr,
                    slippageLimitPercent: 0.3,
                    sourceBlacklist: [],
                    sourceWhitelist: [],
                    simulate: false,
                    referralCode: 0
                }),
                timeout: timeoutApi,
                success: function(data) {
                    if (data && data.outAmounts && data.outAmounts.length > 0) {
                        resolve({
                            exchange: 'ODOS 2',
                            amountIn: amountIn,
                            outAmounts: data.odosResponse.outValues[0],
                            amountOut: data.odosResponse.outValues[0]?.[0] || '0',
                            price: parseFloat(data.odosResponse.outValues[0]) / parseFloat(amountIn),
                            rawRate: parseFloat(amountIn) / parseFloat(data.odosResponse.outValues[0]),
                            fee: parseFloat(data.odosResponse.gasEstimateValue),
                            timestamp: Date.now()
                        });

                    } else {
                        reject({ exchange: 'ODOS 2', error: 'Invalid response', status: 'invalid_data' });
                    }
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'HINKAL',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    // Matcha API
    get0xPrice: function(sellToken, buyToken, sellAmount, chainId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://matcha.xyz/api/swap/price?chainId=${chainId}&buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}`,
                method: 'GET',
                timeout: timeoutApi,
                success: function (data) {
                    let feeETH = 0;

                    // Hitung fee dalam ETH
                    if (data.totalNetworkFee) {
                        feeETH = parseFloat(data.totalNetworkFee) / 1e18;
                    } else if (data.estimatedGas && data.gasPrice) {
                        feeETH = (parseFloat(data.estimatedGas) * parseFloat(data.gasPrice)) / 1e18;
                    }

                    // Tentukan harga gas berdasarkan chain
                    let gasPriceUSD = 0;
                    switch (chainId.toString()) {
                        case "1":
                            gasPriceUSD = GasPriceUSD.Ethereum;
                            break;
                        case "56":
                            gasPriceUSD = GasPriceUSD.BSC;
                            break;
                        case "137":
                            gasPriceUSD = GasPriceUSD.Polygon;
                            break;
                        default:
                            gasPriceUSD = 0;
                    }

                    // Fee dalam USDT
                    const feeUSDT = feeETH * gasPriceUSD;

                    resolve({
                        exchange: 'Matcha',
                        sellToken: sellToken,
                        buyToken: buyToken,
                        sellAmount: sellAmount,
                        buyAmount: data.buyAmount,
                        price: parseFloat(data.price),
                        gasPrice: parseFloat(data.gasPrice || 0),
                        estimatedGas: parseFloat(data.estimatedGas || 0),
                        fee: feeUSDT,      // fee dalam USDT
                        rawRate: 1 / parseFloat(data.price),
                        timestamp: Date.now()
                    });
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'MATCHA',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    // Magpie API
    getMagpiePrice: function(fromToken, toToken, amount, chainName) {
        const url = `https://api.magpiefi.xyz/aggregator/quote?network=${chainName}&fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&sellAmount=${amount}&gasless=true&slippage=0.1`;

        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'GET',
                timeout: timeoutApi,
                success: function(data) {
                    if (data && data.amountOut) {
                       //  amount_out = parseFloat(response.amountOut) / Math.pow(10, des_output);
                        resolve({
                            exchange: 'Magpie',
                            amountOut: data.amountOut ,
                            price: parseFloat(data.amountOut) / parseFloat(amount),
                            fee: parseFloat(data.fees[0].value),
                            rawRate: parseFloat(amount) / parseFloat(data.amountOut),
                            timestamp: Date.now()
                        });
                    } else {
                        reject({ exchange: 'Magpie', error: 'Invalid response format', status: 'invalid_data' });
                    }
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'MAGPIE',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },
    getFlyTradePrice: function(fromToken, toToken, amount, chainName, fromAddress, toAddress) {
        const url = `https://api.fly.trade/aggregator/quote?network=${chainName}&fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&fromAddress=${fromAddress}&toAddress=${toAddress}&sellAmount=${amount}&slippage=0.005&gasless=false`;

        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: 'GET',
                timeout: timeoutApi,
                success: function(data) {
                    if (data && data.amountOut) {
                        const amountIn = parseFloat(data.typedData?.message?.amountIn || amount);
                        const amountOut = parseFloat(data.amountOut);
                        const fee = parseFloat(data.fees?.[0]?.value || 0);

                        resolve({
                            exchange: 'FlyTrade',
                            amountOut: amountOut,
                            price: amountOut / amountIn,
                            fee: fee,
                            rawRate: amountIn / amountOut,
                            timestamp: Date.now()
                        });
                    } else {
                        reject({ exchange: 'FlyTrade', error: 'Invalid response format', status: 'invalid_data' });
                    }
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'FlyTrade',
                        error: errText,
                        status,
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }
            });
        });
    },

    getOKXDEXPrice: function(fromToken, toToken, amountIn, chainName) {
        const apiKeys = [
        
            {
            ApiKeyOKX : "f47557fc-3fcc-45e0-b297-bd1244ccf93c",
            secretKeyOKX : "C9689A761F2B7A51E8FA03E874905604",
            PassphraseOKX : "Sukses-2025",
            ProjectOKX: "5e5cd09efbe202ba8ff5b0d6cc67765c"
            },{
            ApiKeyOKX : "4e34bc4c-3cdb-404c-b21e-892fcb20c08e",
            secretKeyOKX : "7C693E2F8ED3EEC9DB100A6F547684F3",
            PassphraseOKX : "Sukses-2025",
            ProjectOKX: "51c6d463f648cfaac41cc9c3d1a60e040",
            },{
            ApiKeyOKX : "1f460b15-76bc-4c26-ba36-af6c0acf41f8",
            secretKeyOKX : "10858E91E66DA673AAD7B1EB63335557",
            PassphraseOKX : "Sukses-2025",
            ProjectOKX: "6a82f552b5489a4172b44741d48e1655"
            },
            {
            ProjectOKX : "346d87e69f7038d66def274f35111654",
            ApiKeyOKX : "e9d2ec06-24eb-468e-9590-9dabd8e5f2e9",
            secretKeyOKX : "E9D97914D154F1446EB057A1D4B7A673",
            PassphraseOKX : "211293-Dd"
            },
            {
            ProjectOKX : "bc4a68edd9f763493c41d86e1ed135d9",
            ApiKeyOKX : "eb630b79-862d-4751-bfb9-a44e61730812",
            secretKeyOKX : "ED5709291C78EC01B913B37F11E324A7",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "6dbac47726ef6e7aed71cb0e0159c0a4",
            ApiKeyOKX : "bf099815-cbb3-424c-a4be-20b9b1d6ee40",
            secretKeyOKX : "A41A8E3D311CDF762ED73333FC47B3A1",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "1a97d60d4f20802f407d0773b566820a",
            ApiKeyOKX : "97a59ab5-d561-4666-9974-96bf85746933",
            secretKeyOKX : "CDF2B02006AD182F53FA20104E890213",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "1a97d60d4f20802f407d0773b566820a",
            ApiKeyOKX : "97a59ab5-d561-4666-9974-96bf85746933",
            secretKeyOKX : "CDF2B02006AD182F53FA20104E890213",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "314eabf2463dacb891af50c6e48b25fb",
            ApiKeyOKX : "bbee0aed-c60e-4431-922c-b5df4db8f46d",
            secretKeyOKX : "3C8600681DF86B2FB29C041F8E9ECBDA",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "66f6b0feb7d4ca900e64abb412b24043",
            ApiKeyOKX : "a7c49a4d-0d18-40a8-80e6-59ba30d20e71",
            secretKeyOKX : "DF8E561B5BC86543834A9B1B93B61A65",
            PassphraseOKX : "999999-Dd"
            },
            {
            ProjectOKX : "fb0d5484dcad49c2b2fb31cbecfe753d",
            ApiKeyOKX : "3d7d292a-aef2-45af-a8f0-0eb89eb34abd",
            secretKeyOKX : "0E3E221267C52F8978E5376C1DED72F7",
            PassphraseOKX : "999999-Dd"
            },
            {
            ApiKeyOKX : "f47557fc-3fcc-45e0-b297-bd1244ccf93c",
            secretKeyOKX : "C9689A761F2B7A51E8FA03E874905604",
            PassphraseOKX : "Sukses-2025",
            ProjectOKX: "5e5cd09efbe202ba8ff5b0d6cc67765c"
            },
            {
            ApiKeyOKX : "fb713c1b-634b-40b4-a6e3-02e441e14504",
            secretKeyOKX : "459160A7AD08A2F38DA205599FAB3CCE",
            PassphraseOKX : "Bismillah-100493",
            ProjectOKX: "d54877fe8feb85d57133cf4f7533c711"
            },

        {
            ApiKeyOKX: "47953eea-d5aa-43f9-9d56-34966978d693",
            secretKeyOKX: "11C0BD3536C759C5A5E5F7A70077A483",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "22747ba1b56f9da3a7c10140cb95ffa5"
        },{
            ApiKeyOKX: "fb673273-7b7e-4857-b30d-316e5600e13c",
            secretKeyOKX: "C6F812C9670DE4327408BB21B09F38BC",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "ebb6d5612181cb993230ca49c7b50cb8"
        },{
            ApiKeyOKX: "6db77592-fb30-466e-ae0e-c7f3ae15ce7c",
            secretKeyOKX: "BAFD1D91B6D359DCB92629FD44852307",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "df27a64d6c0130624609cc5b56c274d0"
        },{
            ApiKeyOKX: "9ed6219f-980c-417a-a544-055c937b4296",
            secretKeyOKX: "17CEA820AF94463DB8AC6AEC283287D0",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "c95a51b2e06febfbe3976621beb95975"
        },{
            ApiKeyOKX: "7540524b-85a7-440b-84e4-f71280ec8919",
            secretKeyOKX: "A992D6F2890740F8509587868C8A37A3",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "55b213a813f3fd8080a209acdc4aec9b"
        },{
            ApiKeyOKX: "46df841b-4e72-4f3f-a91c-1d1a9b315708",
            secretKeyOKX: "DA06455105A85C3F770C6E01AC42F9DA",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "3174e031e2d03982662688a2734d542e"
        },{
            ApiKeyOKX: "3a3e9296-6c13-4562-84d8-7f4824fb7ac7",
            secretKeyOKX: "1DD3C44F3CA652D4478F739E15C84515",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "9c6ae2d2465046deb6e2965b28a07c42"
        },{
            ApiKeyOKX: "d675d069-4054-4932-a8b1-303b981b8124",
            secretKeyOKX: "2D957A6AAFA1DB1D521296FB0D89F151",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "54e89c9d24d9fb531c527661c84f42dc"
        },{
            ApiKeyOKX: "32ecce69-add4-4fda-984e-7cb34a22797f",
            secretKeyOKX: "5FB9974EA1AC161A27DB68BA51531534",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "35379ea55673bc3516eb8026539be558"
        },{
            ApiKeyOKX: "cccd8b36-a09a-4578-9837-48135f0ff230",
            secretKeyOKX: "EEA4E6EE19EBCDB8CD59F52A9FC8B3CD",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "bab376dfe9e2815c5902e7694bed486e"
        },{
            ApiKeyOKX: "8a059b63-002c-471d-b495-5e55b15bf12a",
            secretKeyOKX: "CAC05FFFD91F84230AA5E8BA0E06B172",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "df1bcaf4acca274c769fc170a7f9dcbb"
        },{
            ApiKeyOKX: "75b75f5e-dbd3-4948-a5ce-77af8871e6ac",
            secretKeyOKX: "5D9F841F0B57E8D51DC574EBE487748C",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "ca2ed1bae58cacd15cf1006a933a2c94"
        },{
            ApiKeyOKX: "54aa3296-d6ab-4873-a5bb-b00d2b006015",
            secretKeyOKX: "971AC2D6264E45F895D446D878B55AE4",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "7304207d79c2df4956d5fdd9f1afc2c2"
        },{
            ApiKeyOKX: "3f6b0085-2d3a-4fc0-8917-a555d1cd259c",
            secretKeyOKX: "68A12A595AA5EA5EFC03DDBAD452DBD6",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "591778696ad3438a4266b0bbd6297d2e"
        },{
            ApiKeyOKX: "3b96a61f-68fd-4d4c-94d9-ff357ef2fb83",
            secretKeyOKX: "3E29ED11AF70FCC530C39948BFAA2405",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "0fbd7084efbd79e915f99701aa989c28"
        },{
            ApiKeyOKX: "94e7d78e-708f-48ff-814d-70a1f3e6fd49",
            secretKeyOKX: "2FD013E26D1309B2B532407FFD4BC097",
            PassphraseOKX: "2017-Ochiem",
            ProjectOKX: "8607ef99dc6e31a80e21b16f914a0f18"
        },
        ];
        

        const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

        const chainIdMap = {
            bsc: 56,
            ethereum: 1,
            polygon: 137,
            arbitrum: 42161,
            base: 8453,
            solana: 501
        };

        const chainId = chainIdMap[chainName.toLowerCase()] || 1;
        const queryString = `/api/v5/dex/aggregator/quote?amount=${amountIn}&chainId=${chainId}&fromTokenAddress=${fromToken}&toTokenAddress=${toToken}`;
        const timestamp = new Date().toISOString();
        const method = "GET";
        const dataToSign = timestamp + method + queryString;
        const signature = calculateSignature("OKX", selectedKey.secretKeyOKX, dataToSign, "HmacSHA256");

        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://www.okx.com${queryString}`,
                method: method,
                headers: {
                    'OK-ACCESS-KEY': selectedKey.ApiKeyOKX,
                    'OK-ACCESS-SIGN': signature,
                    'OK-ACCESS-TIMESTAMP': timestamp,
                    'OK-ACCESS-PASSPHRASE': selectedKey.PassphraseOKX
                },
                timeout: timeoutApi,
                success: function (data) {
                    const result = data?.data?.[0];
                    if (!result) {
                        reject({ exchange: 'OKXDEX', error: 'Invalid response format' });
                        return;
                    }
                    
                    resolve({
                        exchange: 'OKXDEX',
                        amountOut: result.toTokenAmount || "0",
                        price: parseFloat(result.amountOut) / parseFloat(amountIn),
                        rawRate: parseFloat(amountIn) / parseFloat(result.amountOut), 
                        fee: parseFloat(result.tradeFee || 0),
                        timestamp: Date.now()
                    });

                },
               error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'OKXDEX',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    getParaSwapPrice: function (fromToken, toToken, amountIn, fromDecimals, toDecimals, networkId, direction) {
        let apiUrl;
        if (direction === 'cex_to_dex') {
            apiUrl = `https://apiv5.paraswap.io/prices/?srcToken=${fromToken}&destToken=${toToken}&amount=${amountIn}&srcDecimals=${fromDecimals}&destDecimals=${toDecimals}&partner=unidex&side=SELL&network=${networkId}&excludeDEXS=ParaSwapPool,ParaSwapLimitOrders&version=6.2`;
        } else {
            apiUrl = `https://api.zeroswap.io/quote/paraswap?fromChain=${networkId}&fromTokenAddress=${fromToken}&toTokenDecimals=${toDecimals}&fromTokenDecimals=${fromDecimals}&sellAmount=${amountIn}&slippage=1&toTokenAddress=${toToken}`;
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                url: apiUrl,
                method: 'GET',
                timeout: timeoutApi,
                success: function (response) {
                    let amountOut, price, fee;

                    if (response?.priceRoute) {
                        // Response dari ParaSwap langsung
                        const pr = response.priceRoute;
                        amountOut = parseFloat(pr.destAmount);
                        fee = parseFloat(pr.gasCostUSD || 0);
                    } else if (response?.quote?.estimation) {
                        // Response dari ZeroSwap (proxy Paraswap)
                        const est = response.quote.estimation;
                        amountOut = parseFloat(est.buyAmount);
                        fee = 0; // ZeroSwap tidak menyediakan gasUSD
                    } else {
                        return reject({ exchange: 'ParaSwap', error: 'Unrecognized response format' });
                    }

                    if (!amountOut || isNaN(amountOut) || amountOut === 0) {
                        return reject({ exchange: 'ParaSwap', error: 'Invalid destAmount' });
                    }

                    resolve({
                        exchange: 'ParaSwap',
                        amountIn: parseFloat(amountIn),
                        amountOut: amountOut,
                        price: amountOut / parseFloat(amountIn),
                        rawRate: parseFloat(amountIn) / amountOut,
                        fee: fee,
                        gasEstimate: 0,
                        gasPrice: 0,
                        timestamp: Date.now()
                    });
                },
                error: function (xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'PARASWAP',
                        error: errText,
                        status,
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }
            });
        });
    },

    getAltDexPrice: function ( dexSlug,direction,inputAddress, outputAddress, rawAmountIn, decimalsIn, decimalsOut, chainId, userAddr, quotePriceUSDT ) {
        return new Promise((resolve, reject) => {
            const gasGwei = Number(localStorage.getItem('gasGWEI') || 0);
            const estimatedGas = 250000;

            let gasPriceUSD = 0;
            switch (String(chainId)) {
                case '1':
                case '42161':
                case '8453':
                    gasPriceUSD = GasPriceUSD.Ethereum;
                    break;
                case '56':
                    gasPriceUSD = GasPriceUSD.BSC;
                    break;
                case '137':
                    gasPriceUSD = GasPriceUSD.Polygon;
                    break;
                default:
                    gasPriceUSD = 0;
            }

            const payload = {
                chainId,
                aggregatorSlug: dexSlug,
                sender: userAddr,
                inToken: {
                    chainId,
                    type: 'TOKEN',
                    address: inputAddress.toLowerCase(),
                    decimals: decimalsIn
                },
                outToken: {
                    chainId,
                    type: 'TOKEN',
                    address: outputAddress.toLowerCase(),
                    decimals: decimalsOut
                },
                amountInWei: String(rawAmountIn),
                slippageBps: "100",
                gasPriceGwei: gasGwei
            };

            $.ajax({
                url: 'https://bzvwrjfhuefn.up.railway.app/swap',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: function (res) {
                    const amountOut = parseFloat(res.amountOutWei) / Math.pow(10, decimalsOut);
                    const normalizedIn = parseFloat(rawAmountIn) / Math.pow(10, decimalsIn);
                    const priceRaw = amountOut / normalizedIn;
                    const rawRate = normalizedIn / amountOut;
                    const fee = ((gasGwei * estimatedGas) / 1e9) * gasPriceUSD;

                    resolve({
                        exchange: 'SWOOP',
                        amountOut: res.amountOutWei,
                        price: priceRaw * quotePriceUSDT,
                        rawRate,
                        fee,
                        isFallback: true,
                        gasEstimate: estimatedGas,
                        gasPrice: gasGwei,
                        timestamp: Date.now()
                    });
                },
                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'SWOOP',
                        error: errText,
                        status,             // jQuery's internal error status (e.g., 'timeout', 'error')
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }

            });
        });
    },

    getLiFiPrice: function(fromToken, toToken, amountIn, fromDecimals, toDecimals, chainId, token, direction) {
        let apiUrl = "https://api-v1.marbleland.io/api/v1/jumper/api/p/lifi/advanced/routes";

        const requestData = {
            fromAmount: amountIn.toString(),
            fromChainId: parseInt(chainId),
            fromTokenAddress: fromToken,
            toChainId: parseInt(chainId),
            toTokenAddress: toToken,
            options: {
                integrator: "swap.marbleland.io",
                order: "CHEAPEST",
                maxPriceImpact: 0.4,
                allowSwitchChain: false,
                bridges: {
                    deny: [
                        "hop", "cbridge", "optimism", "arbitrum", "across", "omni", "celercircle", "allbridge",
                        "thorswap", "symbiosis", "squid", "mayan", "mayanWH", "mayanMCTP", "relay", "polygon",
                        "glacis", "stargateV2", "stargateV2Bus", "chainflip"
                    ]
                },
                exchanges: {
                    deny: ["jupiter", "enso", "bebop", "dodo", "stable", "aftermath", "superswap", "bluefin7k", "liquidswap", "lifidexaggregator",]
                   
                }
            }
        };

        // if (direction === 'dex_to_cex') {
        //     apiUrl = "https://li.quest/v1/advanced/routes"; 
        //     requestData.options.integrator = "equalizer";
        //     requestData.options.allowSwitchChain = true;
        //     requestData.options.slippage = 0.005;
        //     requestData.fromAddress = settings?.WalletAddress || "0x0000000000000000000000000000000000000000";
        // }

        return new Promise((resolve, reject) => {
            $.ajax({
                url: apiUrl,
                method: 'POST',
                contentType: 'application/json',
                headers: direction === 'dex_to_cex' ? { 'x-lifi-api-key': '36e8ccb2-d4e1-4321-8ca7-d78bae3d1461.5eacae7f-1e16-4ea9-9d5d-f9dcb03f7d50' } : {},
                data: JSON.stringify(requestData),
                timeout: timeoutApi,

                success: function(response) {
                    const bestRoute = response.routes?.[0];
                    if (!bestRoute) return reject({ exchange: 'LiFi', error: 'No route found' });

                   // console.log(`${direction} : ${token.symbol} → ${token.pairSymbol}`);

                    // console.table(response.routes.map(route => ({
                    //     tool: route.steps?.[0]?.tool || 'Unknown',
                    //     toAmount: route.toAmount,
                    //     gasCostUSD: route.gasCostUSD,
                    //     action: route.steps?.[0]?.action?.toToken?.symbol + ' via ' + route.steps?.[0]?.tool,
                    //     estimateToAmount: route.steps?.[0]?.estimate?.toAmount || '-'
                    // })));

                    const rawOut = bestRoute.toAmount
                        ?? bestRoute.steps?.[0]?.estimate?.toAmount
                        ?? bestRoute.steps?.[0]?.includedSteps?.[0]?.estimate?.toAmount
                        ?? "0";

                    const feeUSD = parseFloat(
                        bestRoute.gasCostUSD
                        ?? bestRoute.steps?.[0]?.estimate?.gasCosts?.[0]?.amountUSD
                        ?? 0
                    );

                    const dexUsed = bestRoute.steps?.[0]?.tool || 'Unknown';

                    resolve({
                        exchange: dexUsed,
                        amountOut: rawOut,
                        price: parseFloat(rawOut) / parseFloat(amountIn),
                        rawRate: parseFloat(amountIn) / parseFloat(rawOut),
                        fee: feeUSD,
                        timestamp: Date.now()
                    });
                },

                error: function(xhr, status, error) {
                    let errText = 'Unknown error';
                    let httpStatus = xhr.status || 0;
                    let statusText = xhr.statusText || 'No status text';
                    let responseText = xhr.responseText;

                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }

                    reject({
                        exchange: 'LIFI',
                        error: errText,
                        status,
                        httpCode: httpStatus,
                        httpText: statusText,
                        rawResponse: responseText
                    });
                }
            });
        });
    }

};

// Utility Functions
const PriceUtils = {
     // Tambahan normalisasi dan perhitungan fee dalam USD
    normalizeAmount(amount, decimals) {
        return parseFloat(amount) / Math.pow(10, decimals);
    },

    getGasFeeUSD(chain, gasEstimate = 210000, gasPriceGwei = 5) {
        const nativePrice = GasPriceUSD[chain] || 0;
        const gasInNative = (gasEstimate * gasPriceGwei) / 1e9;
        return gasInNative * nativePrice;
    },
    // Convert token symbol to CEX format
    formatCEXSymbol: function(tokenSymbol, pairSymbol) {
        return `${tokenSymbol}${pairSymbol}`;
    },

    // Convert token symbol to Gate.io format
    formatGateSymbol: function(tokenSymbol, pairSymbol) {
        return `${tokenSymbol}_${pairSymbol}`;
    },

    // Get chain ID from chain name
    getChainId: function(chainName) {
        const chainMap = {
            "BSC": 56,
            "Ethereum": 1,
            "Polygon": 137,
            "Arbitrum": 42161,
            "Base": 8453,
            "Aolana": 501
        };
        return chainMap[chainName] || '1';
    },

    // Calculate amount with decimals
    calculateAmount: function(amount, decimals) {
        return BigInt(Math.round(Math.pow(10, decimals) * amount));
    },

    // Calculate PNL
    calculatePNL: function(buyPrice, sellPrice, amount, fee) {
        const revenue = sellPrice * amount;
        const cost = buyPrice * amount + fee;
        return revenue - cost;
    },

    // Format fee display
    formatFee: function(fee) {
        return `$${fee.toFixed(4)}`;
    },

    // Format PNL display
    formatPNL: function(pnl) {
        const sign = pnl >= 0 ? '+' : '';
        return `${sign}$${pnl.toFixed(2)}`;
    },

    formatPrice(val) {
        const price = parseFloat(val);
        if (isNaN(price)) return '-';
        if (price === 0) return '$0.0000';

        if (price >= 1) {
            return `${price.toFixed(4)}`;
        }

        let strPrice = price.toFixed(20).replace(/0+$/, '');
        let match = strPrice.match(/0\.(0*)(\d+)/); // nol dan angka signifikan

        if (match) {
            const zeroCount = match[1].length;
            let significant = match[2].substring(0, 4).padEnd(4, '0');

            if (zeroCount >= 2) {
                return `0.{${zeroCount}}${significant}`;
            } else {
                return `0.${match[1]}${significant}`;
            }
        }

        return `${price.toFixed(8)}`;
    },

    formatFee(val) {
        return `$${parseFloat(val).toFixed(2)}`;
    },

    formatPNL(val) {
        const prefix = val >= 0 ? '+' : '';
        return `${prefix}${parseFloat(val).toFixed(2)}`;
    }

};

async function checkAllCEXWalletsPerChain() {
    $('#loadingOverlay').fadeIn(150);
    const results = {};

    console.log("🚀 Memulai pengecekan wallet & fee WD semua CEX...");
    $('#infostatus').html('🚀 Memulai pengecekan semua wallet & fee WD CEX...');

    // ✅ Hanya panggil sekali per CEX
    $('#infostatus').html('📡 Ambil Data dari BINANCE...');
    const binanceData = await fetchBinance();

    $('#infostatus').html('📡 Ambil Data dari MEXC...');
    const mexcData = await fetchMexc();

    $('#infostatus').html('📡 Ambil Data dari GATE...');
    const gateData = await fetchGate();

    // 🔁 Proses berdasarkan kombinasi chain dan cexKey
    for (const chainName in CEXWallets) {
        const walletList = CEXWallets[chainName].WALLET_CEX;

        for (const cexName in walletList) {
            const cexKey = getCEXKeyAlias(cexName);
            const chainCEX = walletList[cexName].chainCEX;
            const storageKey = `${chainCEX}_${cexKey}`;

            let allData = [];
            if (cexKey === "BINANCE") allData = binanceData;
            else if (cexKey === "MEXC") allData = mexcData;
            else if (cexKey === "GATEIO") allData = gateData;

            results[storageKey] = allData.filter(item =>
                item.chain?.toUpperCase() === chainCEX.toUpperCase()
            );

           // console.log(`📦 Loaded data for ${storageKey}: ${results[storageKey].length} token(s)`);
            $('#infostatus').html(`Hasil Data ${storageKey}: ${results[storageKey].length} token(s)`);
        }
    }

   // console.log("🔧 Menyisipkan info wallet ke setiap token di MULTI_TOKENS...");

    const tokenMulti = JSON.parse(localStorage.getItem("MULTI_TOKENS") || "[]");

    const tokenMultiUpdated = tokenMulti.map((token, idx) => {
        const { symbol, pairSymbol, chain, selectedCexs } = token;
        const cexInfo = {};
        const chainConfig = CEXWallets[chain.toLowerCase()];

        console.log(`\n📍 [${idx + 1}] Token: ${symbol} on ${chain}`);

        for (const cex of selectedCexs || []) {
            const cexKey = getCEXKeyAlias(cex);
            const chainCEX = chainConfig?.WALLET_CEX?.[cexKey]?.chainCEX;
            const key = `${chainCEX}_${cexKey}`;
            const walletList = results[key];

            console.log(`🔍 Cek di: ${key} (CEX ${cex})`);

            if (!walletList || !Array.isArray(walletList)) {
                console.warn(`⛔️ Tidak ada wallet list untuk ${key}`);
                continue;
            }

            const addToCexInfo = (tokenName) => {
                const symbolClean = tokenName?.toUpperCase().replace(/[^A-Z0-9]/g, '');
                const match = walletList.find(entry =>
                    entry.tokenName?.toUpperCase().replace(/[^A-Z0-9]/g, '') === symbolClean ||
                    entry.token?.toUpperCase().replace(/[^A-Z0-9]/g, '') === symbolClean
                );

                if (match) {
                    if (!cexInfo[cex]) cexInfo[cex] = {};
                    cexInfo[cex][symbolClean] = {
                        depo: !!match.depositEnable,
                        wd: !!match.withdrawEnable,
                        feewd: parseFloat(match.feeWDs || 0)
                    };
                    console.log(`✅ MATCHED: ${symbolClean} in ${key} | fee: ${match.feeWDs}, depo: ${match.depositEnable}, wd: ${match.withdrawEnable}`);
                } else {
                    console.warn(`❌ NOT FOUND: ${symbolClean} in ${key}`);
                }
            };

            // Cek token utama (symbol) & pasangannya (pairSymbol)
            addToCexInfo(symbol);
            if (pairSymbol) addToCexInfo(pairSymbol);
        }

        return {
            ...token,
            cexInfo: Object.keys(cexInfo).length > 0 ? cexInfo : token.cexInfo || {}
        };
    });

    try {
        localStorage.setItem("MULTI_TOKENS", JSON.stringify(tokenMultiUpdated));
        console.log("✅ MULTI_TOKENS updated:", tokenMultiUpdated);

        app.logAction(`UPDATE WALLETS`);
        setTimeout(() => {
            $('#loadingOverlay').fadeOut(200);
            alert("🎉 Update wallet berhasil! Halaman akan direfresh.");
            location.reload();
        }, 800);

    } catch (e) {
        $('#loadingOverlay').fadeOut(200);
        console.error("❌ Gagal menyimpan MULTI_TOKENS:", e);
        alert("❌ Gagal menyimpan MULTI_TOKENS: " + e.message);
    }
}

async function fetchBinance() {
    const { ApiKey, ApiSecret } = CONFIG_API.BINANCE;
    const timestamp = Date.now().toString();
    const queryString = `timestamp=${timestamp}`;
    const signature = calculateSignature("BINANCE", ApiSecret, queryString, "HmacSHA256");

    const url = `https://api-gcp.binance.com/sapi/v1/capital/config/getall?${queryString}&signature=${signature}`;
    const response = await $.ajax({
        url,
        headers: { "X-MBX-ApiKey": ApiKey },
        method: "GET"
    });

    const result = [];

    for (const item of response) {
        if (!item.trading || !Array.isArray(item.networkList)) continue;

        for (const net of item.networkList) {
            result.push({
                cex: "BINANCE",
                tokenName: item.coin,
                chain: net.network,
                feeWDs: parseFloat(net.withdrawFee || 0),
                depositEnable: !!net.depositEnable,
                withdrawEnable: !!net.withdrawEnable
            });
        }
    }

    console.log("✅ fetchBinance():", result.length, "items");
    return result;
}

async function fetchMexc() {
    const { ApiKey, ApiSecret } = CONFIG_API.MEXC;
    const timestamp = Date.now();
    const queryString = `recvWindow=5000&timestamp=${timestamp}`;
    const signature = calculateSignature("MEXC", ApiSecret, queryString);

    const url = `https://cors-anywhere.herokuapp.com/https://api.mexc.com/api/v3/capital/config/getall?${queryString}&signature=${signature}`;
    const response = await $.ajax({
        url,
        headers: { "X-MEXC-APIKEY": ApiKey },
        method: "GET"
    });

    const result = [];

    for (const item of response) {
        if (!Array.isArray(item.networkList)) continue;

        for (const net of item.networkList) {
            result.push({
                cex: "MEXC",
                tokenName: item.coin,
                chain: net.netWork,
                feeWDs: parseFloat(net.withdrawFee || 0),
                depositEnable: !!net.depositEnable,
                withdrawEnable: !!net.withdrawEnable
            });
        }
    }

    console.log("✅ fetchMexc():", result.length, "items");
    return result;
}

async function fetchGate() {
    const { ApiKey, ApiSecret } = CONFIG_API.GATE;
    const host = "https://cors-anywhere.herokuapp.com/https://api.gateio.ws";
    const timestamp = Math.floor(Date.now() / 1000);
    const method = "GET";
    const prefix = "/api/v4";

    const buildSignature = (url, body) => {
        const bodyHash = CryptoJS.SHA512(body).toString(CryptoJS.enc.Hex);
        const signString = `${method}\n${prefix}${url}\n\n${bodyHash}\n${timestamp}`;
        return CryptoJS.HmacSHA512(signString, ApiSecret).toString(CryptoJS.enc.Hex);
    };

    const headers = {
        KEY: ApiKey,
        SIGN: buildSignature("/wallet/withdraw_status", ""),
        Timestamp: timestamp
    };

    const wdData = await $.ajax({
        url: `${host}${prefix}/wallet/withdraw_status`,
        method,
        headers
    });

    const statusData = await $.ajax({
        url: `${host}${prefix}/spot/currencies`,
        method,
        headers
    });

    const result = [];

    for (const item of statusData) {
        if (!Array.isArray(item.chains)) continue;

        for (const chain of item.chains) {
            const feeItem = wdData.find(f =>
                f.currency?.toUpperCase() === item.currency?.toUpperCase() &&
                f.withdraw_fix_on_chains &&
                f.withdraw_fix_on_chains[chain.name]
            );

            result.push({
                cex: "GATEIO",
                tokenName: item.currency,
                chain: chain.name,
                feeWDs: feeItem ? parseFloat(feeItem.withdraw_fix_on_chains[chain.name]) : 0,
                depositEnable: !chain.deposit_disabled,
                withdrawEnable: !chain.withdraw_disabled
            });
        }
    }

    console.log("✅ fetchGate():", result.length, "items");
    return result;
}


// Export for use in main application
window.CEXAPIs = CEXAPIs;
window.DEXAPIs = DEXAPIs;
window.PriceUtils = PriceUtils;

