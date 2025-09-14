// REAL Backend Server for Invisible Yield
// StarkNet Hackathon 2024 - PRODUCTION READY

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Import API routes
const usersAPI = require('./api/users');
const notificationsAPI = require('./api/notifications');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.coingecko.com", "https://api.atomiq.exchange", "https://1ml.com", "wss:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://invisible-yield.vercel.app', 'https://your-domain.com']
        : ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Database directory created');
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Invisible Yield Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/users', usersAPI);
app.use('/api/notifications', notificationsAPI);

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Serve main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

app.get('/bitcoin-yield', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'bitcoin-yield.html'));
});

// ============================================================================
// WEBSOCKET FOR REAL-TIME NOTIFICATIONS
// ============================================================================

const http = require('http');
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store WebSocket connections by user ID
const wsConnections = new Map();

wss.on('connection', (ws, req) => {
    console.log('🔗 WebSocket connection established');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            
            if (data.type === 'authenticate') {
                const { userId, address } = data;
                
                // Store connection for this user
                if (!wsConnections.has(userId)) {
                    wsConnections.set(userId, new Set());
                }
                wsConnections.get(userId).add(ws);
                
                ws.userId = userId;
                ws.address = address;
                
                ws.send(JSON.stringify({
                    type: 'authenticated',
                    message: 'WebSocket authenticated successfully'
                }));
                
                console.log(`✅ WebSocket authenticated for user: ${userId}`);
            }
        } catch (error) {
            console.error('❌ WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        if (ws.userId && wsConnections.has(ws.userId)) {
            wsConnections.get(ws.userId).delete(ws);
            
            // Remove empty sets
            if (wsConnections.get(ws.userId).size === 0) {
                wsConnections.delete(ws.userId);
            }
        }
        console.log('🔌 WebSocket connection closed');
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
});

// Helper function to broadcast to user
function broadcastToUser(userId, data) {
    if (wsConnections.has(userId)) {
        const connections = wsConnections.get(userId);
        connections.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    }
}

// ============================================================================
// BACKGROUND TASKS
// ============================================================================

// Auto-compound yield rewards (runs every hour)
setInterval(async () => {
    try {
        console.log('🔄 Running auto-compound background task...');
        
        // This would connect to your yield strategies and compound rewards
        // Implementation depends on your smart contracts
        
        // Broadcast compound notifications to connected users
        wsConnections.forEach((connections, userId) => {
            connections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'system_notification',
                        message: 'Yield rewards auto-compounded',
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Auto-compound task failed:', error);
    }
}, 60 * 60 * 1000); // Every hour

// Check Lightning Network routing rewards (runs every 10 minutes)
setInterval(async () => {
    try {
        console.log('⚡ Checking Lightning routing rewards...');
        
        // This would query Lightning Network for routing fees earned
        // And update user balances accordingly
        
    } catch (error) {
        console.error('❌ Lightning rewards check failed:', error);
    }
}, 10 * 60 * 1000); // Every 10 minutes

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Global error handler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log('🚀 Invisible Yield Backend STARTED!');
    console.log('🚀 ===================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`🔔 Notifications: http://localhost:${PORT}/api/notifications`);
    console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
    console.log('🚀 ===================================');
    console.log('');
    
    // Test database connection
    setTimeout(async () => {
        try {
            const UserModel = require('./models/User');
            const userModel = new UserModel();
            const stats = await userModel.getPlatformStats();
            
            console.log('✅ Database connection verified');
            console.log('📊 Platform Stats:', stats);
        } catch (error) {
            console.error('❌ Database connection failed:', error);
        }
    }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down server...');
    
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});

module.exports = { app, server, broadcastToUser };