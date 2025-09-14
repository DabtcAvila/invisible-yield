// REAL User API Routes for Invisible Yield Backend
// StarkNet Hackathon 2024 - PRODUCTION READY

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const UserModel = require('../models/User');

const router = express.Router();
const userModel = new UserModel();

// Rate limiters
const registerLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 5, // 5 requests
    duration: 3600, // per hour
});

const generalLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100, // 100 requests
    duration: 3600, // per hour
});

// Middleware for rate limiting
const rateLimitMiddleware = (limiter) => {
    return async (req, res, next) => {
        try {
            await limiter.consume(req.ip);
            next();
        } catch (rejRes) {
            res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: rejRes.msBeforeNext || 3600000
            });
        }
    };
};

// ============================================================================
// USER REGISTRATION
// ============================================================================

/**
 * POST /api/users/register
 * Register new user with ChipiPay integration
 */
router.post('/register', rateLimitMiddleware(registerLimiter), async (req, res) => {
    try {
        const { username, address, email, provider = 'ChipiPay' } = req.body;
        
        // Validation
        if (!username || !address || !email) {
            return res.status(400).json({
                success: false,
                error: 'Username, address, and email are required'
            });
        }
        
        // Validate StarkNet address format
        if (!address.startsWith('0x') || address.length !== 66) {
            return res.status(400).json({
                success: false,
                error: 'Invalid StarkNet address format'
            });
        }
        
        // Validate username format
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return res.status(400).json({
                success: false,
                error: 'Username must be 3-20 characters, alphanumeric and underscore only'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        console.log(`📝 Registering user: ${username} (${email}) with address: ${address}`);
        
        // Register user in database
        const user = await userModel.registerUser({
            username,
            address,
            email: email.toLowerCase(),
            provider
        });
        
        // Log activity
        await userModel.logActivity(user.id, 'USER_REGISTERED', {
            provider,
            timestamp: new Date().toISOString()
        }, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        console.log(`✅ User registered successfully: @${username}`);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                address: user.address,
                provider: user.provider
            }
        });
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// USER LOOKUP
// ============================================================================

/**
 * GET /api/users/username/:address
 * Get username by StarkNet address
 */
router.get('/username/:address', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address.startsWith('0x')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid address format'
            });
        }
        
        const username = await userModel.getUsernameByAddress(address);
        
        if (!username) {
            return res.status(404).json({
                success: false,
                error: 'Username not found for this address'
            });
        }
        
        res.json({
            success: true,
            username: username,
            address: address
        });
        
    } catch (error) {
        console.error('❌ Username lookup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/users/address/:username
 * Get StarkNet address by username
 */
router.get('/address/:username', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { username } = req.params;
        
        // Remove @ if present
        const cleanUsername = username.replace(/^@/, '');
        
        const address = await userModel.getAddressByUsername(cleanUsername);
        
        if (!address) {
            return res.status(404).json({
                success: false,
                error: `Username @${cleanUsername} not found`
            });
        }
        
        res.json({
            success: true,
            username: cleanUsername,
            address: address
        });
        
    } catch (error) {
        console.error('❌ Address lookup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/users/profile/:address
 * Get full user profile by address
 */
router.get('/profile/:address', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { address } = req.params;
        
        const user = await userModel.getUserByAddress(address);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get additional data
        const [paymentHistory, yieldPositions] = await Promise.all([
            userModel.getPaymentHistory(user.id, 10),
            userModel.getYieldPositions(user.id)
        ]);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                address: user.address,
                email: user.email,
                provider: user.provider,
                gaslessQuota: user.gasless_quota,
                totalYieldEarned: user.total_yield_earned,
                kycVerified: user.kyc_verified,
                createdAt: user.created_at,
                recentPayments: paymentHistory,
                yieldPositions: yieldPositions
            }
        });
        
    } catch (error) {
        console.error('❌ Profile lookup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// ============================================================================
// PAYMENT RECORDING
// ============================================================================

/**
 * POST /api/users/payments/record
 * Record a payment transaction
 */
router.post('/payments/record', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { 
            fromAddress, 
            toAddress, 
            amount, 
            token = 'USDC', 
            message, 
            txHash, 
            invisible = true 
        } = req.body;
        
        // Validation
        if (!fromAddress || !toAddress || !amount || !txHash) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        // Get user IDs
        const [fromUser, toUser] = await Promise.all([
            userModel.getUserByAddress(fromAddress),
            userModel.getUserByAddress(toAddress)
        ]);
        
        if (!fromUser || !toUser) {
            return res.status(404).json({
                success: false,
                error: 'One or both users not found'
            });
        }
        
        // Record payment
        const payment = await userModel.recordPayment({
            fromUserId: fromUser.id,
            toUserId: toUser.id,
            amount: parseFloat(amount),
            token,
            message,
            txHash,
            invisible
        });
        
        // Log activity for both users
        await Promise.all([
            userModel.logActivity(fromUser.id, 'PAYMENT_SENT', {
                to: toUser.username,
                amount,
                token,
                txHash
            }, { ip: req.ip, userAgent: req.get('User-Agent') }),
            
            userModel.logActivity(toUser.id, 'PAYMENT_RECEIVED', {
                from: fromUser.username,
                amount,
                token,
                txHash
            }, { ip: req.ip, userAgent: req.get('User-Agent') })
        ]);
        
        console.log(`💸 Payment recorded: ${fromUser.username} → ${toUser.username} (${amount} ${token})`);
        
        res.json({
            success: true,
            message: 'Payment recorded successfully',
            payment: {
                id: payment.id,
                from: fromUser.username,
                to: toUser.username,
                amount: payment.amount,
                token: payment.token,
                txHash: payment.txHash
            }
        });
        
    } catch (error) {
        console.error('❌ Payment recording failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record payment'
        });
    }
});

// ============================================================================
// YIELD POSITIONS
// ============================================================================

/**
 * POST /api/users/yield/record
 * Record a yield farming position
 */
router.post('/yield/record', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { 
            address, 
            strategyId, 
            strategyName, 
            amountBTC, 
            amountSats, 
            apy, 
            depositTxHash 
        } = req.body;
        
        const user = await userModel.getUserByAddress(address);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const position = await userModel.recordYieldPosition({
            userId: user.id,
            strategyId,
            strategyName,
            amountBTC: parseFloat(amountBTC),
            amountSats: parseInt(amountSats),
            apy: parseFloat(apy),
            depositTxHash
        });
        
        // Log activity
        await userModel.logActivity(user.id, 'YIELD_DEPOSIT', {
            strategy: strategyName,
            amountBTC,
            apy,
            txHash: depositTxHash
        }, { ip: req.ip, userAgent: req.get('User-Agent') });
        
        console.log(`📈 Yield position recorded: ${user.username} → ${strategyName} (${amountBTC} BTC)`);
        
        res.json({
            success: true,
            message: 'Yield position recorded successfully',
            position: {
                id: position.id,
                user: user.username,
                strategy: strategyName,
                amountBTC,
                apy
            }
        });
        
    } catch (error) {
        console.error('❌ Yield position recording failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record yield position'
        });
    }
});

// ============================================================================
// GASLESS QUOTA MANAGEMENT
// ============================================================================

/**
 * GET /api/users/gasless/:address
 * Get gasless quota for user
 */
router.get('/gasless/:address', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { address } = req.params;
        
        const user = await userModel.getUserByAddress(address);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            quota: {
                remaining: user.gasless_quota,
                total: 100, // Standard quota
                resetDate: new Date(Date.now() + 86400000).toISOString() // 24 hours
            }
        });
        
    } catch (error) {
        console.error('❌ Gasless quota lookup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * PUT /api/users/gasless/:address
 * Update gasless quota for user
 */
router.put('/gasless/:address', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const { address } = req.params;
        const { quota } = req.body;
        
        if (typeof quota !== 'number' || quota < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid quota value'
            });
        }
        
        const result = await userModel.updateGaslessQuota(address, quota);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Gasless quota updated successfully',
            newQuota: quota
        });
        
    } catch (error) {
        console.error('❌ Gasless quota update failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update gasless quota'
        });
    }
});

// ============================================================================
// PLATFORM STATISTICS
// ============================================================================

/**
 * GET /api/users/stats
 * Get platform statistics
 */
router.get('/stats', rateLimitMiddleware(generalLimiter), async (req, res) => {
    try {
        const stats = await userModel.getPlatformStats();
        
        res.json({
            success: true,
            stats: {
                totalUsers: stats.totalUsers,
                totalPayments: stats.totalPayments,
                totalVolume: stats.totalVolume || 0,
                totalYieldPositions: stats.totalYieldPositions,
                totalTVL: stats.totalTVL || 0,
                updatedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Stats lookup failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;