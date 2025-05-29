const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const server = http.createServer(app); // 👉 Create HTTP server manually
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// 👇 Make io available in routes
app.set('io', io);

// ===== Socket.IO Connection Handling =====
io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    socket.on('join', (conversation_id) => {
        socket.join(conversation_id.toString());
        console.log(`🔗 User joined conversation ${conversation_id}`);
    });

    socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected:', socket.id);
    });
});

// ===== Middleware =====
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(cors());

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====
const userRoutes = require('./routes/authRoutes');
app.use('/auth/user', userRoutes);

const booksRoutes = require('./routes/bookRoutes');
app.use('/books', booksRoutes);

const reveiwRoutes = require('./routes/reveiwRoutes');
app.use('/reveiw', reveiwRoutes);


// ===== Test Route =====
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// ===== Error Handling =====
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('❌ Failed to start server:', err);
});
