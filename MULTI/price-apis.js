// jQuery API Functions for CEX and DEX Price Fetching
const GasPriceUSD = {
    BSC: 0,
    Ethereum: 0,
    Polygon: 0
};
const settings = JSON.parse(localStorage.getItem('SETT_MULTI') || '{}');
const timeoutApi = settings.timeoutApi || 5000;

function withTimeout(promise, timeout = 5000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout))
    ]);
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

        const baseResp = await withTimeout(fetch(`https://api.binance.com/api/v3/depth?symbol=${pair.baseSymbol}USDT&limit=5`), timeoutApi);
        const baseData = await baseResp.json();

        let quotePriceUSDT = 1;
        if (pair.quoteSymbol !== 'USDT') {
            const quoteResp = await withTimeout(fetch(`https://api.binance.com/api/v3/depth?symbol=${pair.quoteSymbol}USDT&limit=5`), timeoutApi);
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
                timeout: timeoutApi,
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
                timeout: timeoutApi,
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

    //calculatePNL: function(buyPrice, sellPrice, amount) {
    //     const feeRate = 0.001; // 0.1%
    //     const cost = buyPrice * amount;
    //     const fee = cost * feeRate;
    //     const revenue = sellPrice * amount;
    //     return revenue - (cost + fee); // total modal = cost + fee
    // },

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

// Export for use in main application
window.CEXAPIs = CEXAPIs;
window.DEXAPIs = DEXAPIs;
window.PriceUtils = PriceUtils;

