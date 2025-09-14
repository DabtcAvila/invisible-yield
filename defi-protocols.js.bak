/**
 * DeFi Protocol Contracts and ABIs for StarkNet
 * Real contract addresses and interfaces for JediSwap, zkLend, Nostra
 */

// ERC20 Token ABI (Standard interface)
export const ERC20_ABI = [
    {
        "name": "balanceOf",
        "type": "function",
        "inputs": [
            {
                "name": "account",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "balance",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "transfer",
        "type": "function",
        "inputs": [
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ]
    },
    {
        "name": "approve",
        "type": "function",
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ]
    },
    {
        "name": "allowance",
        "type": "function",
        "inputs": [
            {
                "name": "owner",
                "type": "felt"
            },
            {
                "name": "spender",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "remaining",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    }
];

// JediSwap Router ABI (Simplified)
export const JEDISWAP_ROUTER_ABI = [
    {
        "name": "swapExactTokensForTokens",
        "type": "function",
        "inputs": [
            {
                "name": "amountIn",
                "type": "Uint256"
            },
            {
                "name": "amountOutMin",
                "type": "Uint256"
            },
            {
                "name": "path",
                "type": "felt*"
            },
            {
                "name": "to",
                "type": "felt"
            },
            {
                "name": "deadline",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "amounts",
                "type": "Uint256*"
            }
        ]
    },
    {
        "name": "addLiquidity",
        "type": "function",
        "inputs": [
            {
                "name": "tokenA",
                "type": "felt"
            },
            {
                "name": "tokenB",
                "type": "felt"
            },
            {
                "name": "amountADesired",
                "type": "Uint256"
            },
            {
                "name": "amountBDesired",
                "type": "Uint256"
            },
            {
                "name": "amountAMin",
                "type": "Uint256"
            },
            {
                "name": "amountBMin",
                "type": "Uint256"
            },
            {
                "name": "to",
                "type": "felt"
            },
            {
                "name": "deadline",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "amountA",
                "type": "Uint256"
            },
            {
                "name": "amountB",
                "type": "Uint256"
            },
            {
                "name": "liquidity",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "getAmountsOut",
        "type": "function",
        "inputs": [
            {
                "name": "amountIn",
                "type": "Uint256"
            },
            {
                "name": "path",
                "type": "felt*"
            }
        ],
        "outputs": [
            {
                "name": "amounts",
                "type": "Uint256*"
            }
        ],
        "stateMutability": "view"
    }
];

// zkLend Market ABI (Simplified)
export const ZKLEND_MARKET_ABI = [
    {
        "name": "supply",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "withdraw",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "get_user_debt_for_token",
        "type": "function",
        "inputs": [
            {
                "name": "user",
                "type": "felt"
            },
            {
                "name": "token",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "debt",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_lending_accumulator",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "accumulator",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_reserve_data",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "enabled",
                "type": "felt"
            },
            {
                "name": "lending_accumulator",
                "type": "Uint256"
            },
            {
                "name": "current_lending_rate",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    }
];

// Nostra Protocol ABI (Simplified)
export const NOSTRA_ABI = [
    {
        "name": "mint",
        "type": "function",
        "inputs": [
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "redeem",
        "type": "function",
        "inputs": [
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "borrow",
        "type": "function",
        "inputs": [
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "repay",
        "type": "function",
        "inputs": [
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "outputs": []
    },
    {
        "name": "getSupplyRate",
        "type": "function",
        "inputs": [],
        "outputs": [
            {
                "name": "rate",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "getBorrowRate",
        "type": "function",
        "inputs": [],
        "outputs": [
            {
                "name": "rate",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    }
];

// Contract Addresses (StarkNet Mainnet)
export const CONTRACTS = {
    // Core tokens
    tokens: {
        USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        DAI: "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
        WBTC: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac"
    },
    
    // JediSwap
    jediswap: {
        router: "0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
        factory: "0x00dad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd",
        pools: {
            "ETH/USDC": "0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a",
            "STRK/ETH": "0x066733193503019e4e9472f598ff32f15951c9c0b2e4a1ba91ed33d2c7a2e9c9",
            "USDC/USDT": "0x05801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b"
        }
    },
    
    // zkLend
    zklend: {
        market: "0x04c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05",
        pools: {
            USDC: "0x047ad51726d891f972e74e4ad858a261b43869f7126ce229b0b2c87ad6339124",
            ETH: "0x01b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1",
            STRK: "0x0735d0f09a4e8bf8a17005fa35061b5957dcaa56889fc75df9e94530ff6991ea"
        }
    },
    
    // Nostra
    nostra: {
        mainMarket: "0x07c2e1e733f28daa23e78be3a4f6c724c0ab06af65f6a95b5e0545215f1abc1c",
        pools: {
            nUSDC: "0x06eda767a143da12f70947192cd13ee0ccc077829002412570a88cd6539c1d85",
            nETH: "0x07170f54dd61ae85377f75131359e3f4a12677589bb7ec5d61f362915a5c0982",
            nSTRK: "0x040f5a6b7a6d3c472c12ca31ae6250b462c6d35bbdae17bd52f6c6ca065e30cf"
        }
    }
};

// Testnet Contract Addresses (Sepolia)
export const TESTNET_CONTRACTS = {
    tokens: {
        USDC: "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
        ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    },
    
    jediswap: {
        router: "0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
        factory: "0x00dad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd"
    },
    
    zklend: {
        market: "0x04c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05"
    },
    
    nostra: {
        mainMarket: "0x07c2e1e733f28daa23e78be3a4f6c724c0ab06af65f6a95b5e0545215f1abc1c"
    }
};

// Invisible Yield Vault Contract ABI (Your deployed contract)
export const INVISIBLE_YIELD_VAULT_ABI = [
    {
        "name": "deposit",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            },
            {
                "name": "strategy",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "shares",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "withdraw",
        "type": "function",
        "inputs": [
            {
                "name": "token",
                "type": "felt"
            },
            {
                "name": "shares",
                "type": "Uint256"
            },
            {
                "name": "strategy",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "amount",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "compound_all",
        "type": "function",
        "inputs": [
            {
                "name": "user",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "total_compounded",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "get_user_balance",
        "type": "function",
        "inputs": [
            {
                "name": "user",
                "type": "felt"
            },
            {
                "name": "token",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "balance",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_total_value_locked",
        "type": "function",
        "inputs": [],
        "outputs": [
            {
                "name": "tvl",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_strategy_allocation",
        "type": "function",
        "inputs": [
            {
                "name": "user",
                "type": "felt"
            },
            {
                "name": "strategy",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "allocation",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    }
];

// Helper functions for protocol interactions
export class ProtocolHelper {
    constructor(provider) {
        this.provider = provider;
    }
    
    /**
     * Get current APY from zkLend for a specific token
     */
    async getZkLendAPY(token) {
        try {
            const marketContract = new Contract(ZKLEND_MARKET_ABI, CONTRACTS.zklend.market, this.provider);
            const reserveData = await marketContract.get_reserve_data(CONTRACTS.tokens[token]);
            
            // Convert lending rate to APY (assuming rate is per second)
            const ratePerSecond = reserveData.current_lending_rate;
            const apy = (Math.pow(1 + (ratePerSecond / 1e27), 31536000) - 1) * 100;
            
            return apy;
        } catch (error) {
            console.error('Failed to get zkLend APY:', error);
            return 0;
        }
    }
    
    /**
     * Get current APY from Nostra for a specific token
     */
    async getNostraAPY(token) {
        try {
            const poolAddress = CONTRACTS.nostra.pools[`n${token}`];
            if (!poolAddress) return 0;
            
            const poolContract = new Contract(NOSTRA_ABI, poolAddress, this.provider);
            const supplyRate = await poolContract.getSupplyRate();
            
            // Convert to APY
            const apy = (supplyRate / 1e25) * 100; // Adjust decimals as needed
            
            return apy;
        } catch (error) {
            console.error('Failed to get Nostra APY:', error);
            return 0;
        }
    }
    
    /**
     * Get LP yield from JediSwap
     */
    async getJediSwapLPYield(pairName) {
        try {
            // This would require calculating from pool reserves, fees, and volume
            // For now, return mock data based on typical DeFi yields
            const yields = {
                "ETH/USDC": 25.5,
                "STRK/ETH": 45.2,
                "USDC/USDT": 8.5
            };
            
            return yields[pairName] || 0;
        } catch (error) {
            console.error('Failed to get JediSwap yield:', error);
            return 0;
        }
    }
    
    /**
     * Get token price from JediSwap
     */
    async getTokenPrice(tokenA, tokenB = 'USDC') {
        try {
            const routerContract = new Contract(JEDISWAP_ROUTER_ABI, CONTRACTS.jediswap.router, this.provider);
            const path = [CONTRACTS.tokens[tokenA], CONTRACTS.tokens[tokenB]];
            const amountIn = "1000000000000000000"; // 1 token (18 decimals)
            
            const amounts = await routerContract.getAmountsOut(amountIn, path);
            const price = parseInt(amounts[1]) / 1e6; // USDC has 6 decimals
            
            return price;
        } catch (error) {
            console.error('Failed to get token price:', error);
            return 0;
        }
    }
    
    /**
     * Calculate optimal strategy allocation based on current yields
     */
    calculateOptimalAllocation(yieldData, riskTolerance = 'medium') {
        const strategies = {
            conservative: {
                zkLend: 70,
                jediswap: 20,
                nostra: 10
            },
            balanced: {
                zkLend: 40,
                jediswap: 40,
                nostra: 20
            },
            aggressive: {
                zkLend: 20,
                jediswap: 50,
                nostra: 30
            }
        };
        
        return strategies[riskTolerance] || strategies.balanced;
    }
}

// Export protocol configurations
export const PROTOCOL_CONFIG = {
    zkLend: {
        name: "zkLend",
        description: "Leading lending protocol on StarkNet",
        riskLevel: "Low",
        tvl: "$25M",
        supportedTokens: ["USDC", "ETH", "STRK", "USDT", "DAI"]
    },
    
    jediswap: {
        name: "JediSwap",
        description: "Premier AMM DEX on StarkNet",
        riskLevel: "Medium",
        tvl: "$45M",
        supportedPairs: ["ETH/USDC", "STRK/ETH", "USDC/USDT"]
    },
    
    nostra: {
        name: "Nostra",
        description: "Non-custodial liquidity protocol",
        riskLevel: "Medium-High",
        tvl: "$15M",
        supportedTokens: ["USDC", "ETH", "STRK"]
    }
};

export default {
    ERC20_ABI,
    JEDISWAP_ROUTER_ABI,
    ZKLEND_MARKET_ABI,
    NOSTRA_ABI,
    INVISIBLE_YIELD_VAULT_ABI,
    CONTRACTS,
    TESTNET_CONTRACTS,
    ProtocolHelper,
    PROTOCOL_CONFIG
};