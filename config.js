
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
        ApiKey: "mx0vglmCjExQHIImo9", // Ganti dengan ApiKey asli
        ApiSecret: "d58a2b54af264d8fa09293f1a8a4a140", // Ganti dengan ApiSecret asli
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
        DATAJSON: 'https://multichecker.vercel.app/JSON/bep20_multi.json',
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
        PAIRDEXS: 
            {
                "1INCH": {
                    "symbolPair": "1INCH",
                    "scAddressPair": "0x111111111117dc0aa78b770fa6a738034120c302",
                    "desPair": "18"
                },
                "AAVE": {
                    "symbolPair": "AAVE",
                    "scAddressPair": "0xfb6115445bff7b52feb98650c87f44907e58f802",
                    "desPair": "18"
                },
                "ACE": {
                    "symbolPair": "ACE",
                    "scAddressPair": "0xc27a719105a987b4c34116223cae8bd8f4b5def4",
                    "desPair": "18"
                },
                "ADA": {
                    "symbolPair": "ADA",
                    "scAddressPair": "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
                    "desPair": "18"
                },
                "AEUR": {
                    "symbolPair": "AEUR",
                    "scAddressPair": "0xa40640458fbc27b6eefedea1e9c9e17d4cee7a21",
                    "desPair": "18"
                },
                "AI": {
                    "symbolPair": "AI",
                    "scAddressPair": "0xbda011d7f8ec00f66c1923b049b94c67d148d8b2",
                    "desPair": "18"
                },
                "ALICE": {
                    "symbolPair": "ALICE",
                    "scAddressPair": "0xac51066d7bec65dc4589368da368b212745d63e8",
                    "desPair": "6"
                },
                "ALPACA": {
                    "symbolPair": "ALPACA",
                    "scAddressPair": "0x8f0528ce5ef7b51152a59745befdd91d97091d2f",
                    "desPair": "18"
                },
                "ALPHA": {
                    "symbolPair": "ALPHA",
                    "scAddressPair": "0xa1faa113cbe53436df28ff0aee54275c13b40975",
                    "desPair": "18"
                },
                "ANKR": {
                    "symbolPair": "ANKR",
                    "scAddressPair": "0xf307910a4c7bbc79691fd374889b36d8531b08e3",
                    "desPair": "18"
                },
                "APE": {
                    "symbolPair": "APE",
                    "scAddressPair": "0xc762043e211571eb34f1ef377e5e8e76914962f9",
                    "desPair": "18"
                },
                "ARPA": {
                    "symbolPair": "ARPA",
                    "scAddressPair": "0x6f769e65c14ebd1f68817f5f1dcdb61cfa2d6f7e",
                    "desPair": "18"
                },
                "ATA": {
                    "symbolPair": "ATA",
                    "scAddressPair": "0xa2120b9e674d3fc3875f415a7df52e382f141225",
                    "desPair": "18"
                },
                "ATM": {
                    "symbolPair": "ATM",
                    "scAddressPair": "0x25e9d05365c867e59c1904e7463af9f312296f9e",
                    "desPair": "2"
                },
                "AVA": {
                    "symbolPair": "AVA",
                    "scAddressPair": "0xd9483ea7214fcfd89b4fb8f513b544920e315a52",
                    "desPair": "18"
                },
                "AXL": {
                    "symbolPair": "AXL",
                    "scAddressPair": "0x8b1f4432f943c465a973fedc6d7aa50fc96f1f65",
                    "desPair": "6"
                },
                "AXS": {
                    "symbolPair": "AXS",
                    "scAddressPair": "0x715d400f88c167884bbcc41c5fea407ed4d2f8a0",
                    "desPair": "18"
                },
                    "BAKE": {
                        "symbolPair": "BAKE",
                        "scAddressPair": "0xe02df9e3e622debdd69fb838bb799e3f168902c5",
                        "desPair": "18"
                    },
                    "BAND": {
                        "symbolPair": "BAND",
                        "scAddressPair": "0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18",
                        "desPair": "18"
                    },
                    "BAT": {
                        "symbolPair": "BAT",
                        "scAddressPair": "0x101d82428437127bf1608f699cd651e6abf9766e",
                        "desPair": "18"
                    },
                    "BCH": {
                        "symbolPair": "BCH",
                        "scAddressPair": "0x8ff795a6f538da4a9c5cc3a5d3e14c015169d6e6",
                        "desPair": "18"
                    },
                    "BEL": {
                        "symbolPair": "BEL",
                        "scAddressPair": "0x844fa82f1e54824655470970f7004dd90546bb28",
                        "desPair": "18"
                    },
                    "BLZ": {
                        "symbolPair": "BLZ",
                        "scAddressPair": "0x935a86a409f997c52b54e1fa82f7187ce0ca5cc6",
                        "desPair": "18"
                    },
                    "BNB": {
                        "symbolPair": "BNB",
                        "scAddressPair": "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
                        "desPair": "18"
                    },
                    "BNT": {
                        "symbolPair": "BNT",
                        "scAddressPair": "0x1f573d6fb3f13d689ff844b4cfcd36e4f9a5c970",
                        "desPair": "18"
                    },
                    "BTCB": {
                        "symbolPair": "BTCB",
                        "scAddressPair": "0x7130d2a12b9bcfaf171db05b2ded3853b7b33870",
                        "desPair": "18"
                    },
                    "BTT": {
                        "symbolPair": "BTT",
                        "scAddressPair": "0x8595f9da7b868b1822194faed312235e43007b49",
                        "desPair": "18"
                    },
                    "CAKE": {
                        "symbolPair": "CAKE",
                        "scAddressPair": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
                        "desPair": "18"
                    },
                    "CEEK": {
                        "symbolPair": "CEEK",
                        "scAddressPair": "0xe0f94ac5462997d2bc57287ac3a3ae4c31345d66",
                        "desPair": "18"
                    },
                    "CELR": {
                        "symbolPair": "CELR",
                        "scAddressPair": "0x1f9f6a696c6fd109cd3956f45dc709d2b3902163",
                        "desPair": "18"
                    },
                    "CRO": {
                        "symbolPair": "CRO",
                        "scAddressPair": "0xa0b73e1ff0b80914abd6fe6eb0b4c383dce9f5cd",
                        "desPair": "18"
                    },
                    "CRV": {
                        "symbolPair": "CRV",
                        "scAddressPair": "0xd533a949740bb3306d119cc777fa900ba034cd52",
                        "desPair": "18"
                    },
                    "CTK": {
                        "symbolPair": "CTK",
                        "scAddressPair": "0xa8c53d99618f4753f3782e16e97f6bc9f9de574b",
                        "desPair": "18"
                    },
                    "CVC": {
                        "symbolPair": "CVC",
                        "scAddressPair": "0x41e5560054824ea6b0732e656e3ad64e20dcb6ff",
                        "desPair": "8"
                    },
                    "DAI": {
                        "symbolPair": "DAI",
                        "scAddressPair": "0x1af3f329e8be154074d8769d1ffa4ee058b1dbce",
                        "desPair": "18"
                    },
                    "DASH": {
                        "symbolPair": "DASH",
                        "scAddressPair": "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",
                        "desPair": "18"
                    },
                    "DOGE": {
                        "symbolPair": "DOGE",
                        "scAddressPair": "0xba2ae424d960c26247dd6c32edc70b295c744c43",
                        "desPair": "8"
                    },
                    "DOT": {
                        "symbolPair": "DOT",
                        "scAddressPair": "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
                        "desPair": "10"
                    },
                        "DUSK": {
                            "symbolPair": "DUSK",
                            "scAddressPair": "0xb2bdc6d19dff9f2b18220ab3e8e92e6e439be769",
                            "desPair": "18"
                        },
                        "ENJ": {
                            "symbolPair": "ENJ",
                            "scAddressPair": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
                            "desPair": "18"
                        },
                        "EOS": {
                            "symbolPair": "EOS",
                            "scAddressPair": "0x56b6fb708fc5732dec1afc8d8556423a2edccbd6",
                            "desPair": "18"
                        },
                        "ETC": {
                            "symbolPair": "ETC",
                            "scAddressPair": "0x2e3d870790dc77a83dd1d18184acc7439a53f475",
                            "desPair": "18"
                        },
                        "FIL": {
                            "symbolPair": "FIL",
                            "scAddressPair": "0x0ba45a8b5d5575935b8158a88c631e9f9c95a2e5",
                            "desPair": "18"
                        },
                        "FTM": {
                            "symbolPair": "FTM",
                            "scAddressPair": "0xad29abb318791d579433d831ed122afeaf29dcfe",
                            "desPair": "18"
                        },
                        "GRT": {
                            "symbolPair": "GRT",
                            "scAddressPair": "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
                            "desPair": "18"
                        },
                        "HBAR": {
                            "symbolPair": "HBAR",
                            "scAddressPair": "0x5c3b77f9e88a2beed16b6ac0ed56cd8e9a1dbe63",
                            "desPair": "8"
                        },
                        "HNT": {
                            "symbolPair": "HNT",
                            "scAddressPair": "0x100eaebd826b2cc5bce3f2b3055b8cb8e8960e6a",
                            "desPair": "8"
                        },
                        "ICP": {
                            "symbolPair": "ICP",
                            "scAddressPair": "0x7e4a8391c728f74df0ffb54eb78560c23dbfbbec",
                            "desPair": "8"
                        },
                        "KAVA": {
                            "symbolPair": "KAVA",
                            "scAddressPair": "0x5fdf9cbf497ef9a3b4c2d123080bc7c3fc8a3a56",
                            "desPair": "6"
                        },
                        "LINK": {
                            "symbolPair": "LINK",
                            "scAddressPair": "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
                            "desPair": "18"
                        },
                        "LTC": {
                            "symbolPair": "LTC",
                            "scAddressPair": "0x4338665cbb7b2485a8855a139b75d5e34ab0db94",
                            "desPair": "18"
                        },
                        "MANA": {
                            "symbolPair": "MANA",
                            "scAddressPair": "0xa1a817e0ef6f45f25699c49445e9fdb1ea8b6b9e",
                            "desPair": "18"
                        },
                        "MATIC": {
                            "symbolPair": "MATIC",
                            "scAddressPair": "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
                            "desPair": "18"
                        },
                        "SHIB": {
                            "symbolPair": "SHIB",
                            "scAddressPair": "0x285bbf02d9d6cf5cc6e7ed6e3b3a90f6ec8f28cf",
                            "desPair": "18"
                        },
                        "SOL": {
                            "symbolPair": "SOL",
                            "scAddressPair": "0x570a2e5eb7d58f3358d9b6ad4e2e375a74dd03a6",
                            "desPair": "18"
                        },
                        "SUSHI": {
                            "symbolPair": "SUSHI",
                            "scAddressPair": "0xe0e514c71282b6f4e823703a39374cf58dc3ea4f",
                            "desPair": "18"
                        },
                        "TRX": {
                            "symbolPair": "TRX",
                            "scAddressPair": "0xe260a9a52b4b4f8b4a2b1fc96a8414fba7f18b56",
                            "desPair": "18"
                        },
                        "UNI": {
                            "symbolPair": "UNI",
                            "scAddressPair": "0xbf5140a22578168fd562dccf235e5d43a02ce9b1",
                            "desPair": "18"
                        },
                        "USDT": {
                            "symbolPair": "USDT",
                            "scAddressPair": "0x55d398326f99059ff775485246999027b3197955",
                            "desPair": "18"
                        },
                        "USDC": {
                            "symbolPair": "USDC",
                            "scAddressPair": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
                            "desPair": "18"
                        },
                        "VET": {
                            "symbolPair": "VET",
                            "scAddressPair": "0xe66747a101bff2dba3697199dcce5b743b454759",
                            "desPair": "18"
                        },
                        "XLM": {
                            "symbolPair": "XLM",
                            "scAddressPair": "0x043a3aa319b5630e197b839e1caf000000000000",
                            "desPair": "18"
                        },
                        "XRP": {
                            "symbolPair": "XRP",
                            "scAddressPair": "0x1d2f0da169cefaee0064cddc9f06a579a91a2e6d",
                            "desPair": "18"
                        },
                        "XTZ": {
                            "symbolPair": "XTZ",
                            "scAddressPair": "0x16939ef78684453bfdfb47825f8a5f714f12623a",
                            "desPair": "18"
                        },
                        "ZIL": {
                            "symbolPair": "ZIL",
                            "scAddressPair": "0xb86abcb37c3a4b64f74f59301aff131a1bee0b25",
                            "desPair": "12"
                        },
                        "ZRX": {
                            "symbolPair": "ZRX",
                            "scAddressPair": "0xe41d2489571d322189246dafa5ebde1f4699f498",
                            "desPair": "18"
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
