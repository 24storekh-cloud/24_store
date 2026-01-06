const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // បន្ថែមថ្មី
require('dotenv').config();

const app = express();

// --- ១. Configuration ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_FILE = path.join(__dirname, 'data.json');
const JWT_SECRET = "MY_SUPER_SECRET_KEY_2026"; // គន្លឹះសម្ងាត់សម្រាប់ Token

// កំណត់ Username/Password សម្រាប់ Login នៅទីនេះ
const ADMIN_ACCOUNT = {
    username: "admin",
    password: "123"
};

const upload = multer({ storage: multer.memoryStorage() });

// --- ២. Helper Functions ---
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) return { products: [], banners: [], orders: [] };
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return content.trim() ? JSON.parse(content) : { products: [], banners: [], orders: [] };
    } catch (err) {
        return { products: [], banners: [], orders: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Middleware សម្រាប់ឆែក Token (ការពារ API Admin)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "ត្រូវការ Login ជាមុនសិន!" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token មិនត្រឹមត្រូវ ឬហួសកំណត់!" });
        req.user = user;
        next();
    });
};

// --- ៣. API Routes ---

// ⚡ មុខងារ Login (សំខាន់៖ ដើម្បីបាត់ Error 404)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
        const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ 
            success: true, 
            token: token, 
            message: "ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រង!" 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!" 
        });
    }
});

// Get All Data (Public access for Client, Protected for Admin if needed)
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// Upload Product or Banner (Protected)
app.post('/api/upload', authenticateToken, upload.array('images', 5), (req, res) => {
    const { type, name, price, cost, category, detail, stock, title } = req.body;
    const data = readData();

    const base64Images = req.files ? req.files.map(f => 
        `data:${f.mimetype};base64,${f.buffer.toString('base64')}`
    ) : [];

    if (type === 'product') {
        data.products.push({
            id: Date.now().toString(),
            name,
            price: parseFloat(price),
            cost: parseFloat(cost || 0),
            category,
            detail,
            stock: parseInt(stock || 0),
            images: base64Images
        });
    } else if (type === 'banner') {
        data.banners.push({
            id: Date.now().toString(),
            title,
            image: base64Images[0] || ''
        });
    }

    writeData(data);
    res.json({ success: true, message: 'Saved successfully' });
});

// Update Product (Protected)
app.put('/api/update/product/:id', authenticateToken, upload.array('images', 5), (req, res) => {
    const { id } = req.params;
    const data = readData();
    const idx = data.products.findIndex(p => p.id === id);

    if (idx !== -1) {
        if (req.body.stock !== undefined && Object.keys(req.body).length === 1) {
            data.products[idx].stock = parseInt(req.body.stock);
        } else {
            const newImages = req.files && req.files.length > 0 
                ? req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`)
                : data.products[idx].images;

            data.products[idx] = { 
                ...data.products[idx], 
                ...req.body, 
                price: parseFloat(req.body.price || data.products[idx].price),
                cost: parseFloat(req.body.cost || data.products[idx].cost),
                stock: parseInt(req.body.stock || data.products[idx].stock),
                images: newImages 
            };
        }
        writeData(data);
        return res.json({ success: true });
    }
    res.status(404).json({ message: 'Product not found' });
});
// បន្ថែម Route នេះនៅក្នុង File server.js ឬ index.js របស់បង
app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // ១. អានទិន្នន័យពី data.json
    const data = readData(); 
    
    // ២. រកមើល Order ដែលត្រូវ Update
    const orderIndex = data.orders.findIndex(o => o.id === id);

    if (orderIndex !== -1) {
        // ៣. Update status ថ្មី
        data.orders[orderIndex].status = status;
        
        // ៤. រក្សាទុកចូលក្នុង data.json វិញ
        writeData(data); 
        
        return res.json({ success: true, message: "Status updated successfully!" });
    } else {
        return res.status(404).json({ success: false, message: "Order not found!" });
    }
});
// Reduce Stock (Public - used by Storefront)
app.patch('/api/products/:id/reduce-stock', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const idx = data.products.findIndex(p => p.id === id);

    if (idx !== -1) {
        let currentStock = Number(data.products[idx].stock || 0);
        if (currentStock > 0) {
            data.products[idx].stock = currentStock - 1;
            writeData(data);
            return res.json({ success: true, newStock: data.products[idx].stock });
        } else {
            return res.status(400).json({ success: false, message: 'Out of stock' });
        }
    }
    res.status(404).json({ message: 'Product not found' });
});

// Submit Order (Public)
app.post('/api/orders', upload.single('payslip'), (req, res) => {
    const data = readData();
    const payslipBase64 = req.file 
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
        : null;

    const newOrder = {
        id: Date.now().toString(),
        ...req.body,
        payslip: payslipBase64,
        status: 'Pending',
        date: new Date().toISOString()
    };

    data.orders.unshift(newOrder);

    if (req.body.productId) {
        const pIdx = data.products.findIndex(p => p.id === req.body.productId);
        if (pIdx !== -1) {
            const qty = parseInt(req.body.qty || 1);
            data.products[pIdx].stock = Math.max(0, data.products[pIdx].stock - qty);
        }
    }

    writeData(data);
    res.json({ success: true, orderId: newOrder.id });
});

// Delete Item (Protected)
app.delete('/api/delete/:type/:id', authenticateToken, (req, res) => {
    const { type, id } = req.params;
    const data = readData();
    const key = type === 'product' ? 'products' : (type === 'banner' ? 'banners' : 'orders');

    if (data[key]) {
        data[key] = data[key].filter(item => item.id !== id);
        writeData(data);
        return res.json({ success: true });
    }
    res.status(404).json({ message: 'Type not found' });
});

// Telegram Notification (Public)
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        const BOT_TOKEN = '8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI'; 
        const CHAT_ID = '7026983728';
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- ៤. Start Server ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Admin Server running on port ${PORT}`));