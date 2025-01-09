
const CONFIG_CEX = {
    GATE: {
        ApiKey: "d04cdb7f01e598b3493bda6aa913092b",
        ApiSecret: "e363aa06b129632617f91adae2ed46bef809c13c3df1d91bbfa52f5f33cc4c9d",
        WARNA: "#D5006D",  // Pink tua
    },
    BINANCE: {
        ApiKey: "2U7YGMEUDri6tP3YEzmK3CcZWb9yQ5j3COp9s7pRRUv4vu8hJAlwH4NkbNK74hDU",
        ApiSecret: "XHjPVjLzbs741xoznV3xz1Wj5SFrcechNBjvezyXLcg8GLWF21VW32f0YhAsQ9pn",
        WARNA: "#e0a50c",  // Orange tua
    },
     MEXC: {
        ApiKey: "mx0vglzxhkkcmeQ3bg", // Ganti dengan ApiKey asli
        ApiSecret: "ed2ced1270b24130b42f205443040bcf", // Ganti dengan ApiSecret asli
        WARNA: "#1448ce",  // Biru muda
    },
    KUCOIN: {
        ApiKey: "651e1c4379c8be0001bab637",
        ApiSecret: "a184c3c1-65f2-4042-a043-c5c23c6ba258",
        ApiPassphrase: "Arekpinter123",
        WARNA: "#096309",  // Hijau tua
    },
    BYBIT: {
        ApiKey: "c006zQZk7RSBh7lmCn",
        ApiSecret: "2mvUqoYtJLku0JOC8fHyVVmkocCGtFIjScqT",
        WARNA: "#17181f",  // Hitam pekat
    },
    BITGET: {
        ApiKey: "xxx", // Ganti dengan ApiKey asli
        ApiSecret: "xxx", // Ganti dengan ApiSecret asli
        WARNA: "#1448ce",  // Biru muda
    },
    OKX: {
       ApiKey: "4d6226e8-c858-42b5-a32e-60b6ce8b4bdc", // Ganti dengan ApiKey asli
       ApiSecret: "3EB8717DE58187BAE45E282EB0045CE3", // Ganti dengan ApiSecret asli
       ApiPassphrase:"Macpro-2025",
       WARNA: "#17181f",  // Hitam pekat
   }
};


const CONFIG_CHAINS = {
    
    polygon: { 
        Kode_Chain: 137, 
        Nama_Chain: "polygon", 
        URL_Chain: "https://polygonscan.com", 
        ICON: "https://s2.coinmarketcap.com/static/img/coins/200x200/3890.png",
        WARNA:"#a05df6",
        DATAJSON: 'https://multichecker.vercel.app/JSON/poly_multi.json',
        BaseFEEDEX : "POLUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
            "okx"
        ],
        WALLET_CEX: {
           GATE: {
               address : '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
               address2 : '#',
               chainCEX : 'MATIC',
           },
           BINANCE: {
               address : '0x290275e3db66394C52272398959845170E4DCb88',
               address2 : '0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245',
               chainCEX : 'MATIC',
           },
           KUCOIN: {
               address : '0x9AC5637d295FEA4f51E086C329d791cC157B1C84',
               address2 : '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
               chainCEX : 'Polygon POS',
           }, 
           BITGET: {
               address : '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
               address2 : '0x51971c86b04516062c1e708CDC048CB04fbe959f',
               chainCEX : 'Polygon',
           }, 
           BYBIT: {
               address : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
               address2 : '#',
               chainCEX : 'Polygon PoS',
           },
           MEXC: {
            address : '0x51E3D44172868Acc60D68ca99591Ce4230bc75E0',
            address2 : '#',
            chainCEX : 'MATIC',
            },
           OKX: {
                address : '0x06959153B974D0D5fDfd87D561db6d8d4FA0bb0B',
                address2 : '#',
                chainCEX : 'Polygon',
            },     
        },
        PAIRDEXS: {
           "USDT": {
                symbolPair: 'USDT',
                scAddressPair: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
                desPair: '6',
            },
           "POL": {
                symbolPair: 'POL',
                scAddressPair: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
                desPair: '18',
            },
            "USDC":{
                symbolPair: 'USDC',
                scAddressPair: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                desPair: '6',
            }
        }
    },
    arbitrum: { 
        Kode_Chain: 42161, 
        Nama_Chain: "arbitrum", 
        URL_Chain: "https://arbiscan.io" ,
        WARNA:"#a6b0c3",
        ICON:"https://wiki.dextrac.com:3443/images/1/11/Arbitrum_Logo.png",
        DATAJSON: 'https://multichecker.vercel.app/JSON/arb_multi.json',
        BaseFEEDEX : "ETHUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
            "okx"
        ],
        WALLET_CEX: {
            GATE: {
                address : '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                address2 : '#',
                chainCEX : 'ARBEVM',
            },
            BINANCE: {
                address : '0x290275e3db66394C52272398959845170E4DCb88',
                address2 : '0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245',
                chainCEX : 'ARBITRUM',
            },
            KUCOIN: {
                address : '0x03E6FA590CAdcf15A38e86158E9b3D06FF3399Ba',
                address2 : '#',
                chainCEX : 'ARBITRUM',
            }, 
            BITGET: {
                address : '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
                address2 : '#',
                chainCEX : 'ArbitrumOne',
            }, 
            BYBIT: {
                address : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                address2 : '#',
                chainCEX : 'Arbitrum One',
            },
            MEXC: {
                address : '0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB',
                address2 : '#',
                chainCEX : 'ARB',
            },
             OKX: {
                address : '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
                address2 : '#',
                chainCEX : 'Arbitrum One',
            }, 
        },    
        PAIRDEXS: {  
                // "ARB":{
                //     symbolPair: 'ARB',
                //     scAddressPair: '0x912ce59144191c1204e64559fe8253a0e49e6548',
                //     desPair: '18',
                // },
                "USDT":{
                    symbolPair: 'USDT',
                    scAddressPair: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
                    desPair: '6',
                },
                "USDC":{
                    symbolPair: 'USDC',
                    scAddressPair: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                    desPair: '6',
                }
            },           
    },
    ethereum: { 
        Kode_Chain: 1, 
        Nama_Chain: "ethereum", 
        URL_Chain: "https://etherscan.io" ,
        WARNA:"#8098ee",
        ICON:"https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png",
        DATAJSON: 'https://multichecker.vercel.app/JSON/erc20_multi.json',
        BaseFEEDEX : "ETHUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
            "okx"
        ],
          WALLET_CEX: {
            GATE: {
                address : '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                address2 : '#',
                chainCEX : 'ETH',
            },
            BINANCE: {
                address : '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
                address2 : '0x28C6c06298d514Db089934071355E5743bf21d60',
                chainCEX : 'ETH',
            },
            KUCOIN: {
                address : '0x58edF78281334335EfFa23101bBe3371b6a36A51',
                address2 : '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
                chainCEX : 'ERC20',
            }, 
            BITGET: {
                address : '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
                address2 : '0x51971c86b04516062c1e708CDC048CB04fbe959f',
                chainCEX : 'ERC20',
            }, 
            BYBIT: {
                address : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                address2 : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                chainCEX : 'Ethereum',
            },
            MEXC: {
                address : '0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB',
                address2 : '#',
                chainCEX : 'ETH',
            },
            OKX: {
                address : '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
                address2 : '#',
                chainCEX : 'ERC20',
            }, 
          },
        PAIRDEXS: {  
            "ETH":{
                symbolPair: 'ETH',
                scAddressPair: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                desPair: '18',
            },
            "USDT":{
                symbolPair: 'USDT',
                scAddressPair: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                desPair: '6',
            },
            "BNT":{
                symbolPair: 'BNT',
                scAddressPair: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
                desPair: '18',
            },
            // "USDC":{
            //     symbolPair: 'USDC',
            //     scAddressPair: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            //     desPair: '6',
            // }
        } 
    }, 
    bsc: { 
        Kode_Chain: 56, 
        Nama_Chain: "bsc", 
        URL_Chain: "https://bscscan.com" , 
        WARNA:"#f6cc6a",
        ICON:"https://cryptologos.cc/logos/bnb-bnb-logo.png",
        DATAJSON: 'https://multichecker.vercel.app/TRIANGULAR/token.json',
        BaseFEEDEX : "BNBUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
           // "magpiefi",
            "okx"
        ],
        WALLET_CEX: {
            GATE: {
                address : '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                address2 : '#',
                chainCEX : 'BSC',
            },
            BINANCE: {
                address : '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
                address2 : '0xe2fc31F816A9b94326492132018C3aEcC4a93aE1',
                chainCEX : 'BSC',
            },
            KUCOIN: {
                address : '0x58edF78281334335EfFa23101bBe3371b6a36A51',
                address2 : '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
                chainCEX : 'BEP20',
            }, 
            BITGET: {
                address : '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
                address2 : '0x51971c86b04516062c1e708CDC048CB04fbe959f',
                chainCEX : 'BEP20',
            }, 
            BYBIT: {
                address : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                address2 : '#',
                chainCEX : 'BNB Smart Chain',
            },  
            MEXC: {
                address : '0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB',
                address2 : '#',
                chainCEX : 'BSC',
            }, 
            OKX: {
                address : '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
                address2 : '#',
                chainCEX : 'BSC',
            }, 
        },
        PAIRDEXS: {
            "BNB": {
                symbolPair: "BNB",
                scAddressPair: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                desPair: "18"
            },
            "USDT": {
                symbolPair: "USDT",
                scAddressPair: "0x55d398326f99059fF775485246999027B3197955",
                desPair: "18"
            },
            "NON": {
                symbolPair: "NON",
                scAddressPair: "0x",
                desPair: "18"
            }
        }        
    },
    solana: { 
        Kode_Chain: 501, 
        Nama_Chain: "solana", 
        URL_Chain: "https://solscan.io/" , 
        WARNA:"#d483f4",
        ICON:"https://cdn.iconscout.com/icon/premium/png-256-thumb/solana-sol-7152167-5795323.png",
        DATAJSON: 'https://multichecker.vercel.app/JSON/sol_multi.json',
        BaseFEEDEX : "SOLUSDT",
        DEXS: [
            "jupiter",
        ],
         
        PAIRDEXS: {
            "USDT":{
                symbolPair: 'USDT',
                scAddressPair: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
                desPair: '6',
            },
            "SOL":{
                symbolPair: 'SOL',
                scAddressPair: 'So11111111111111111111111111111111111111112',
                desPair: '9',
            },
            "USDC":{
                symbolPair: 'USDC',
                scAddressPair: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                desPair: '6',
            }
        },
        
          WALLET_CEX: { 
            GATE: {
                address : 'HiRpdAZifEsZGdzQ5Xo5wcnaH3D2Jj9SoNsUzcYNK78J',
                address2 : 'u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w',
                chainCEX : 'SOL',
            },
            BINANCE: {
                address : '28nYGHJyUVcVdxZtzKByBXEj127XnrUkrE3VaGuWj1ZU',
                address2 : '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S',
                chainCEX : 'SOL',
            },
            KUCOIN: {
                address : 'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6',
                address2 : 'EkUy8BB574iEVAQE9dywEiMhp9f2mFBuFu6TBKAkQxFY',
                chainCEX : 'SOL',
            }, 
            BITGET: {
                address : 'A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR',
                address2 : '#',
                chainCEX : 'SOL',
            }, 
            BYBIT: {
                address : 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
                address2 : '42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd',
                chainCEX : 'SOL',
            },  
            MEXC: {
                address : 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
                address2 : '42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd',
                chainCEX : 'SOL',
            }, 
            OKX: {
                address : 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
                address2 : '42brAgAVNzMBP7aaktPvAmBSPEkehnFQejiZc53EpJFd',
                chainCEX : 'Solana',
            }, 
        }
    },
    avax: { 
        Kode_Chain: 43114, 
        Nama_Chain: "avax", 
        URL_Chain: "https://snowtrace.io" , 
        WARNA:"#f28d8e",
        ICON:"https://cryptologos.cc/logos/avalanche-avax-logo.png",
        DATAJSON: 'https://multichecker.vercel.app/JSON/avax_multi.json',
        BaseFEEDEX : "AVAXUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
            "okx"
        ],
        WALLET_CEX: {
            GATE: {
                address : '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                address2 : '#',
                chainCEX : 'AVAX_C',
            },
            BINANCE: {
                address : '0x6D8bE5cdf0d7DEE1f04E25FD70B001AE3B907824',
                address2 : '0xe2fc31F816A9b94326492132018C3aEcC4a93aE1',
                chainCEX : 'AVAXC',
            },
            KUCOIN: {
                address : '0x58edF78281334335EfFa23101bBe3371b6a36A51',
                address2 : '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
                chainCEX : 'AVAX C-Chain',
            }, 
            BITGET: {
                address : '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
                address2 : '0x51971c86b04516062c1e708CDC048CB04fbe959f',
                chainCEX : 'AVAXC-Chain',
            }, 
            BYBIT: {
                address : '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                address2 : '#',
                chainCEX : 'CAVAX',
            },  
            MEXC: {
                address : '0xffB3118124cdaEbD9095fA9a479895042018cac2',
                address2 : '#',
                chainCEX : 'AVAX_CCHAIN',
            }, 
            OKX: {
                address : '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
                address2 : '#',
                chainCEX : 'Avalanche C-Chain',
            }, 
        },
        PAIRDEXS: {
            "USDT":{
                symbolPair: 'USDT',
                scAddressPair: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
                desPair: '6',
            },
            "AVAX":{
                symbolPair: 'AVAX',
                scAddressPair: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
                desPair: '18',
            }
        }
    },
    base: { 
        Kode_Chain: 8453, 
        Nama_Chain: "base", 
        URL_Chain: "https://basescan.org/", 
        WARNA:"#1e46f9",
        ICON:"https://avatars.githubusercontent.com/u/108554348?v=4",
        DATAJSON: 'https://multichecker.vercel.app/JSON/base_multi.json',
        BaseFEEDEX : "ETHUSDT",
        DEXS: [
            "1inch",
            "odos",
            "kyberswap",
            "paraswap",
            "0x",
            "okx"            
        ],
        WALLET_CEX: {
            GATE: {
                address: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
                chainCEX: 'BASEEVM',
            },
            BINANCE: {
                address: '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
                address2: '0x28C6c06298d514Db089934071355E5743bf21d60',
                chainCEX: 'BASE',
            },
            KUCOIN: {
                address: '0x58edF78281334335EfFa23101bBe3371b6a36A51',
                address2: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
                chainCEX: 'Base',
            },
            BYBIT: {
                address: '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                address2: '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
                chainCEX: 'BASE',
            },
            BITGET: {
                address: '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
                address2: '0x51971c86b04516062c1e708CDC048CB04fbe959f',
                chainCEX: 'BASE',
            },
            MEXC: {
                address : '0x4e3ae00E8323558fA5Cac04b152238924AA31B60',
                address2 : '#',
                chainCEX : 'BASE',
            },
            OKX: {
                address : '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b',
                address2 : '#',
                chainCEX : 'Base',
            },   
        },        
        PAIRDEXS: {
        //    "USDT": {
        //         symbolPair: 'USDT',
        //         scAddressPair: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
        //         desPair: '6',
        //     },
           "ETH": {
                symbolPair: 'ETH',
                scAddressPair: '0x4200000000000000000000000000000000000006',
                desPair: '18',
            },
            "USDC":{
                symbolPair: 'USDC',
                scAddressPair: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                desPair: '6',
            }
        }        
    },     
};

// Fungsi untuk mendapatkan data chain berdasarkan nama chain
function getChainData(chainName) {
    const chainData = CONFIG_CHAINS[chainName]; // base
    
    if (!chainData) {
        console.log(`Chain dengan nama ${chainName} tidak ditemukan.`);
        return null;
    }

    return {
        Kode_Chain: chainData.Kode_Chain,
        Nama_Chain: chainData.Nama_Chain,
        DEXS: chainData.DEXS,
        PAIRDEXS: chainData.PAIRDEXS,
        URL_Chain: chainData.URL_Chain, 
        DATAJSON: chainData.DATAJSON, 
        BaseFEEDEX: chainData.BaseFEEDEX, 
        CEXCHAIN: chainData.WALLET_CEX,
        ICON_CHAIN: chainData.ICON,
        COLOR_CHAIN: chainData.WARNA,
    };
}
