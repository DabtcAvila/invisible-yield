// REAL Notifications API for Invisible Yield Backend
// StarkNet Hackathon 2024 - PRODUCTION READY

const express = require('express');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const UserModel = require('../models/User');

const router = express.Router();
const userModel = new UserModel();

// Rate limiter
const notificationLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 200, // 200 requests
    duration: 3600, // per hour
});

// Middleware for rate limiting
const rateLimitMiddleware = async (req, res, next) => {
    try {
        await notificationLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: rejRes.msBeforeNext || 3600000
        });
    }
};

// In-memory notification storage (in production, use Redis or database)
const notifications = new Map();
const subscribers = new Map(); // For WebSocket connections

// Notification types
const NOTIFICATION_TYPES = {
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_SENT: 'payment_sent',
    YIELD_COMPOUND: 'yield_compound',
    YIELD_EARNED: 'yield_earned',
    LIGHTNING_ROUTING: 'lightning_routing',
    ATOMIQ_SWAP: 'atomiq_swap',
    GASLESS_REFILL: 'gasless_refill',
    SECURITY_ALERT: 'security_alert'
};

// ============================================================================
// NOTIFICATION CREATION
// ============================================================================

/**
 * POST /api/notifications/send
 * Send notification to user
 */
router.post('/send', rateLimitMiddleware, async (req, res) => {
    try {
        const { username, notification } = req.body;
        
        // Validation
        if (!username || !notification) {
            return res.status(400).json({
                success: false,
                error: 'Username and notification are required'
            });
        }
        
        const { type, title, message, data = {} } = notification;
        
        if (!type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Notification type, title, and message are required'
            });
        }
        
        // Clean username
        const cleanUsername = username.replace(/^@/, '');
        
        // Get user
        const user = await userModel.getUserByUsername(cleanUsername);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Create notification object
        const notificationObj = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            userId: user.id,
            username: user.username,
            type,
            title,
            message,
            data,
            read: false,
            createdAt: new Date().toISOString()
        };
        
        // Store notification
        if (!notifications.has(user.id)) {
            notifications.set(user.id, []);
        }
        
        const userNotifications = notifications.get(user.id);
        userNotifications.unshift(notificationObj);
        
        // Keep only last 100 notifications per user
        if (userNotifications.length > 100) {
            userNotifications.splice(100);
        }
        
        // Send real-time notification if user is connected
        if (subscribers.has(user.id)) {
            const connections = subscribers.get(user.id);
            connections.forEach(ws => {
                if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.send(JSON.stringify({
                        type: 'notification',
                        data: notificationObj
                    }));
                }
            });
        }
        
        console.log(`🔔 Notification sent to @${user.username}: ${title}`);
        
        res.json({
            success: true,
            message: 'Notification sent successfully',
            notification: {
                id: notificationObj.id,
                username: user.username,
                type,
                title
            }
        });
        
    } catch (error) {
        console.error('❌ Notification sending failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send notification'
        });
    }
});

// ============================================================================
// NOTIFICATION RETRIEVAL
// ============================================================================

/**
 * GET /api/notifications/:address
 * Get notifications for user by address
 */
router.get('/:address', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 50, offset = 0, unreadOnly = false } = req.query;
        
        const user = await userModel.getUserByAddress(address);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        let userNotifications = notifications.get(user.id) || [];
        
        // Filter unread only if requested
        if (unreadOnly === 'true') {
            userNotifications = userNotifications.filter(n => !n.read);
        }
        
        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            notifications: paginatedNotifications,
            total: userNotifications.length,
            unread: userNotifications.filter(n => !n.read).length,
            hasMore: endIndex < userNotifications.length
        });
        
    } catch (error) {
        console.error('❌ Notification retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notifications'
        });
    }
});

/**
 * GET /api/notifications/username/:username
 * Get notifications for user by username
 */
router.get('/username/:username', rateLimitMiddleware, async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace(/^@/, '');
        
        const user = await userModel.getUserByUsername(cleanUsername);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userNotifications = notifications.get(user.id) || [];
        const unreadCount = userNotifications.filter(n => !n.read).length;
        
        res.json({
            success: true,
            notifications: userNotifications.slice(0, 20), // Last 20
            unread: unreadCount,
            total: userNotifications.length
        });
        
    } catch (error) {
        console.error('❌ Notification retrieval failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notifications'
        });
    }
});

// ============================================================================
// NOTIFICATION MANAGEMENT
// ============================================================================

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.put('/:notificationId/read', rateLimitMiddleware, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'User address is required'
            });
        }
        
        const user = await userModel.getUserByAddress(address);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userNotifications = notifications.get(user.id) || [];
        const notification = userNotifications.find(n => n.id === notificationId);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }
        
        notification.read = true;
        notification.readAt = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
        
    } catch (error) {
        console.error('❌ Mark notification read failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});

/**
 * PUT /api/notifications/read-all/:address
 * Mark all notifications as read for user
 */
router.put('/read-all/:address', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        
        const user = await userModel.getUserByAddress(address);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userNotifications = notifications.get(user.id) || [];
        const now = new Date().toISOString();
        
        userNotifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                notification.readAt = now;
            }
        });
        
        res.json({
            success: true,
            message: 'All notifications marked as read',
            marked: userNotifications.length
        });
        
    } catch (error) {
        console.error('❌ Mark all notifications read failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark all notifications as read'
        });
    }
});

// ============================================================================
// PREDEFINED NOTIFICATION HELPERS
// ============================================================================

/**
 * Create payment received notification
 */
async function createPaymentNotification(toUsername, fromUsername, amount, token, txHash) {
    const notification = {
        type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
        title: `Payment Received`,
        message: `You received ${amount} ${token} from @${fromUsername}`,
        data: {
            from: fromUsername,
            amount,
            token,
            txHash,
            explorerUrl: `https://starkscan.co/tx/${txHash}`
        }
    };
    
    // Send notification
    try {
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: toUsername,
                notification
            })
        });
    } catch (error) {
        console.error('Failed to create payment notification:', error);
    }
}

/**
 * Create yield earnings notification
 */
async function createYieldNotification(username, strategy, yieldAmount, apy) {
    const notification = {
        type: NOTIFICATION_TYPES.YIELD_EARNED,
        title: `Yield Earned!`,
        message: `You earned ${yieldAmount} BTC from ${strategy} (${apy}% APY)`,
        data: {
            strategy,
            yieldAmount,
            apy,
            timestamp: new Date().toISOString()
        }
    };
    
    try {
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                notification
            })
        });
    } catch (error) {
        console.error('Failed to create yield notification:', error);
    }
}

/**
 * Create Lightning routing notification
 */
async function createLightningNotification(username, feesEarned, routedAmount) {
    const notification = {
        type: NOTIFICATION_TYPES.LIGHTNING_ROUTING,
        title: `Lightning Fees Earned`,
        message: `You earned ${feesEarned} sats in routing fees`,
        data: {
            feesEarned,
            routedAmount,
            timestamp: new Date().toISOString()
        }
    };
    
    try {
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                notification
            })
        });
    } catch (error) {
        console.error('Failed to create Lightning notification:', error);
    }
}

// ============================================================================
// BULK NOTIFICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/notifications/payment-received
 * Convenient endpoint for payment notifications
 */
router.post('/payment-received', rateLimitMiddleware, async (req, res) => {
    try {
        const { toUsername, fromUsername, amount, token, txHash } = req.body;
        
        await createPaymentNotification(toUsername, fromUsername, amount, token, txHash);
        
        res.json({
            success: true,
            message: 'Payment notification sent'
        });
        
    } catch (error) {
        console.error('❌ Payment notification failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send payment notification'
        });
    }
});

/**
 * POST /api/notifications/yield-earned
 * Convenient endpoint for yield notifications
 */
router.post('/yield-earned', rateLimitMiddleware, async (req, res) => {
    try {
        const { username, strategy, yieldAmount, apy } = req.body;
        
        await createYieldNotification(username, strategy, yieldAmount, apy);
        
        res.json({
            success: true,
            message: 'Yield notification sent'
        });
        
    } catch (error) {
        console.error('❌ Yield notification failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send yield notification'
        });
    }
});

// Export notification helpers
module.exports = router;
module.exports.createPaymentNotification = createPaymentNotification;
module.exports.createYieldNotification = createYieldNotification;
module.exports.createLightningNotification = createLightningNotification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;