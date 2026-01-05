const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- ១. Configuration ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); // ចាំបាច់សម្រាប់ទទួល Base64 ធំៗ
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_FILE = path.join(__dirname, 'data.json');

// កំណត់ Multer ទុកក្នុង Memory (ដើម្បីបម្លែងទៅ Base64 ភ្លាមៗ)
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

// --- ៣. API Routes ---

// Get All Data (Products, Banners, Orders)
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// Upload Product or Banner (Base64)
app.post('/api/upload', upload.array('images', 5), (req, res) => {
    const { type, name, price, cost, category, detail, stock, title } = req.body;
    const data = readData();

    // បម្លែង Buffer ទៅជា Base64
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
            images: base64Images // រក្សាទុកក្នុង Array
        });
    } else if (type === 'banner') {
        data.banners.push({
            id: Date.now().toString(),
            title,
            image: base64Images[0] || ''
        });
    }

    writeData(data);
    res.json({ success: true, message: 'បានរក្សាទុកក្នុង data.json រួចរាល់' });
});

// Update Product (ស្ដុក ឬ ព័ត៌មានលម្អិត)
app.put('/api/update/product/:id', upload.array('images', 5), (req, res) => {
    const { id } = req.params;
    const data = readData();
    const idx = data.products.findIndex(p => p.id === id);

    if (idx !== -1) {
        // បើផ្ញើមកតែ Stock (សម្រាប់ប៊ូតុង + / - ក្នុង Table)
        if (req.body.stock !== undefined && Object.keys(req.body).length === 1) {
            data.products[idx].stock = parseInt(req.body.stock);
        } else {
            // បើកែប្រែក្នុង Modal
            const newImages = req.files && req.files.length > 0 
                ? req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`)
                : data.products[idx].images;

            data.products[idx] = { 
                ...data.products[idx], 
                ...req.body, 
                price: parseFloat(req.body.price),
                cost: parseFloat(req.body.cost),
                stock: parseInt(req.body.stock),
                images: newImages 
            };
        }
        writeData(data);
        return res.json({ success: true });
    }
    res.status(404).json({ message: 'រកមិនឃើញទំនិញ' });
});

// Submit Order (ពីខាង Customer)
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

    // កាត់ស្តុកភ្លាមៗ
    if (req.body.productId) {
        const pIdx = data.products.findIndex(p => p.id === req.body.productId);
        if (pIdx !== -1) {
            data.products[pIdx].stock -= parseInt(req.body.qty || 1);
        }
    }

    writeData(data);
    res.json({ success: true, orderId: newOrder.id });
});

// Update Order Status
app.patch('/api/orders/:id/status', (req, res) => {
    const data = readData();
    const order = data.orders.find(o => o.id === req.params.id);
    if (order) {
        order.status = req.body.status;
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// Delete Item
app.delete('/api/delete/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const data = readData();
    const key = type === 'product' ? 'products' : (type === 'banner' ? 'banners' : 'orders');

    data[key] = data[key].filter(item => item.id !== id);
    writeData(data);
    res.json({ success: true });
});

// Telegram Notification (Optional)
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
app.listen(PORT, () => console.log(`🚀 Base64 JSON Server running on port ${PORT}`));