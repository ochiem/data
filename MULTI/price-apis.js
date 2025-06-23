// jQuery API Functions for CEX and DEX Price Fetching
const GasPriceUSD = {
    BSC: 0,
    Ethereum: 0,
    Polygon: 0
};

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
            console.warn('⏭️ Skip Binance USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair.baseSymbol}USDT&limit=5`);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair.quoteSymbol}USDT&limit=5`);
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
            console.warn('⏭️ Skip MEXC USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair.baseSymbol}USDT&limit=5`);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await fetch(`https://api.mexc.com/api/v3/depth?symbol=${pair.quoteSymbol}USDT&limit=5`);
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
            console.warn('⏭️ Skip Gate.io USDT/USDT ');
            return {
                buy: 1, sell: 1, topAsks: [], topBids: [], quotePriceUSDT: 1
            };
        }

        const baseResp = await fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair.baseSymbol}_USDT&limit=5`);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await fetch(`https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${pair.quoteSymbol}_USDT&limit=5`);
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
                //timeout: 15000,
                success: function(data) {
                    // console.log("kyber",data);
                    // console.log("url",url);
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
                    try {
                        const res = JSON.parse(xhr.responseText);
                        const fieldErr = res?.details?.[0]?.fieldViolations?.[0];
                        if (fieldErr) {
                            errText = `${fieldErr.field} → ${fieldErr.description}`;
                        } else {
                            errText = res.message || error?.toString() || status;
                        }
                    } catch {
                        errText = error?.toString() || status;
                    }
                    reject({ exchange: 'KyberSwap', error: errText, status });
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
                //timeout: 15000,
                success: function(data) {
                    if (data && data.outAmounts && data.outAmounts.length > 0) {
                        // resolve({
                        //     exchange: 'ODOS',
                        //     amountIn: amountIn,
                        //     outAmounts: data.outAmounts,
                        //     fee: parseFloat(data.gasEstimateValue),
                        //     timestamp: Date.now()
                        // });
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
                    const errText = `${xhr.status} ${xhr.statusText || status}`;
                    reject({ exchange: 'ODOS', error: errText, status });
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
                    try {
                        const res = JSON.parse(xhr.responseText);
                        const issue = res?.issues?.[0];
                        if (issue?.message) {
                            errText = `${issue.path?.[0] || 'field'} → ${issue.message}`;
                        } else {
                            errText = res.message || error?.toString() || status;
                        }
                    } catch {
                        errText = error?.toString() || status;
                    }
                    reject({
                        exchange: 'Matcha',
                        error: errText,
                        status: status
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
                //timeout: 15000,
                success: function(data) {
                    if (data && data.amountOut) {
                        resolve({
                            exchange: 'Magpie',
                            amountOut: data.amountOut,
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
                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }
                    reject({ exchange: 'Magpie', error: errText, status });
                }
            });
        });
    },

    getOKXDEXPrice: function(fromToken, toToken, amountIn, chainName) {
        const apiKeys = [
            {
                ApiKeyOKX: "47953eea-d5aa-43f9-9d56-34966978d693",
                secretKeyOKX: "11C0BD3536C759C5A5E5F7A70077A483",
                PassphraseOKX: "2017-Ochiem"
            },
            {
                ApiKeyOKX: "fb673273-7b7e-4857-b30d-316e5600e13c",
                secretKeyOKX: "C6F812C9670DE4327408BB21B09F38BC",
                PassphraseOKX: "2017-Ochiem"
            }
        ];

        const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

        const chainIdMap = {
            bsc: 56,
            ethereum: 1,
            polygon: 137
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
               error: function (xhr, status, error) {
                    let errText = 'Unknown error';
                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.msg || res.message || status;
                    } catch {
                        errText = error?.toString() || status;
                    }
                    reject({ exchange: 'OKXDEX', error: errText, status });
                }
            });
        });
    },
    getParaSwapPrice: function (fromToken, toToken, amountIn, fromDecimals, toDecimals, networkId) {
        const apiUrl = `https://api.paraswap.io/prices?` +  `srcToken=${fromToken}` + `&srcDecimals=${fromDecimals}` + `&destToken=${toToken}` + `&destDecimals=${toDecimals}` +  `&side=SELL` + `&network=${networkId}` + `&amount=${amountIn}` + `&version=6.2`;

        return new Promise((resolve, reject) => {
            $.ajax({
                url: apiUrl,
                method: 'GET',
                success: function (response) {
                    if (!response || !response.priceRoute) {
                        return reject({ exchange: 'ParaSwap', error: 'Invalid response format' });
                    }

                    const amountOut = parseFloat(response.priceRoute.destAmount);
                    const gasCost = parseFloat(response.priceRoute.gasCostUSD || 0);

                    if (!amountOut || isNaN(amountOut) || amountOut === 0) {
                        return reject({ exchange: 'ParaSwap', error: 'Zero or invalid destAmount' });
                    }

                    resolve({
                        exchange: 'ParaSwap',
                        amountIn: amountIn,
                        amountOut: amountOut,
                        price: parseFloat(amountOut) / parseFloat(amountIn),
                        rawRate: parseFloat(amountIn) / parseFloat(amountOut), 

                        // price: amountOut / amountIn,
                        // rawRate: amountIn / amountOut,
                         fee: gasCost,
                        gasEstimate: 0,    // konsisten dengan DEX lain
                        gasPrice: 0,       // walaupun tidak tersedia
                        timestamp: Date.now()
                    });
                },
                error: function (xhr, status, error) {
                    let errText = 'Unknown error';
                    try {
                        const res = JSON.parse(xhr.responseText);
                        errText = res.message || error?.toString() || status;
                    } catch {
                        errText = error?.toString() || status;
                    }
                    reject({
                        exchange: 'ParaSwap',
                        error: errText,
                        status: status
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
            'BSC': '56',
            'Ethereum': '1',
            'Polygon': '137'
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
            return `${price.toFixed(3)}`;
        }

        let strPrice = price.toFixed(20).replace(/0+$/, '');
        let match = strPrice.match(/0\.(0*)(\d+)/); // nol dan angka signifikan

        if (match) {
            const zeroCount = match[1].length;
            let significant = match[2].substring(0, 4).padEnd(4, '0');

            if (zeroCount >= 2) {
                return `0.{${zeroCount}}${significant}$`;
            } else {
                return `0.${match[1]}${significant}$`;
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

// Export for use in main application
window.CEXAPIs = CEXAPIs;
window.DEXAPIs = DEXAPIs;
window.PriceUtils = PriceUtils;

