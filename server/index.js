const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const DATA_FILE = 'data.json';
const ORDERS_FILE = 'orders.json';

// --- មុខងារជំនួយសម្រាប់អាន/សរសេរ File JSON ---
const safeReadJSON = (filePath, defaultContent) => {
    try {
        if (!fs.existsSync(filePath)) return defaultContent;
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) return defaultContent;
        return JSON.parse(content);
    } catch (err) {
        console.error(`បញ្ហាអាន File ${filePath}:`, err.message);
        return defaultContent;
    }
};

const safeWriteJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- ការកំណត់ Multer សម្រាប់ Upload រូបភាព ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// ================= 1. API Telegram Notification =================
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        const BOT_TOKEN = '8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI'; 
        const CHAT_ID = '7026983728';

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        res.json({ success: true, message: 'ផ្ញើទៅ Telegram រួចរាល់!' });
    } catch (error) {
        console.error('Telegram Error:', error.message);
        res.status(500).json({ success: false, error: 'មិនអាចផ្ញើទៅ Telegram បានទេ' });
    }
});

// ================= 2. API Product & Banner Management =================
app.get('/api/data', (req, res) => {
    const data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const orders = safeReadJSON(ORDERS_FILE, []);
    res.json({
        products: data.products || [],
        banners: data.banners || [],
        orders: orders
    });
});

app.post('/api/upload', upload.array('images', 5), (req, res) => {
    const { type, name, price, cost, category, detail, title, stock } = req.body;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const imageUrls = req.files ? req.files.map(f => `http://localhost:5000/uploads/${f.filename}`) : [];

    if (type === 'product') {
        data.products.push({
            id: Date.now(),
            name, 
            price: parseFloat(price) || 0, 
            cost: parseFloat(cost) || 0, // រក្សាទុកតម្លៃដើម
            category, 
            detail,
            stock: parseInt(stock) || 0,
            images: imageUrls
        });
    } else {
        data.banners.push({ id: Date.now(), title, image: imageUrls[0] || '' });
    }
    safeWriteJSON(DATA_FILE, data);
    res.json({ success: true });
});

app.put('/api/update/:type/:id', upload.array('images', 5), (req, res) => {
    const { type, id } = req.params;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const collection = type === 'product' ? 'products' : 'banners';
    const index = data[collection].findIndex(item => item.id.toString() === id);

    if (index !== -1) {
        if (req.body.update_type === 'stock_only') {
            data.products[index].stock = parseInt(req.body.stock);
        } else {
            const newImages = req.files && req.files.length > 0 
                ? req.files.map(f => `http://localhost:5000/uploads/${f.filename}`) 
                : (type === 'product' ? data.products[index].images : [data.banners[index].image]);
            
            if (type === 'product') {
                data.products[index] = { 
                    ...data.products[index], 
                    ...req.body, 
                    price: parseFloat(req.body.price),
                    cost: parseFloat(req.body.cost), // Update តម្លៃដើម
                    images: newImages 
                };
            } else {
                data.banners[index] = { ...data.banners[index], title: req.body.title, image: newImages[0] };
            }
        }
        safeWriteJSON(DATA_FILE, data);
        res.json({ success: true });
    }
});

app.delete('/api/delete/:type/:id', (req, res) => {
    const { type, id } = req.params;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const key = type === 'product' ? 'products' : 'banners';
    data[key] = data[key].filter(i => i.id.toString() !== id);
    safeWriteJSON(DATA_FILE, data);
    res.json({ success: true });
});

// ================= 3. API Order Management (Finance Sync) =================
app.post('/api/orders', upload.single('payslip'), (req, res) => {
    try {
        const orderData = req.body;
        const payslipUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;
        
        // បង្កើតកាលបរិច្ឆេទ YYYY-MM-DD សម្រាប់ប្រើក្នុង FinanceReport
        const today = new Date().toISOString().split('T')[0];

        let orders = safeReadJSON(ORDERS_FILE, []);
        const newOrder = {
            orderId: Date.now(),
            ...orderData,
            quantity: parseInt(orderData.qty || orderData.quantity) || 1,
            total: parseFloat(orderData.total) || 0,
            payslip: payslipUrl,
            status: 'Pending',
            date: today // ចំណុចសំខាន់សម្រាប់ Month Filter
        };

        orders.unshift(newOrder); 
        safeWriteJSON(ORDERS_FILE, orders);

        // --- មុខងារកាត់ស្តុក ---
        if (orderData.productId) {
            let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
            const pIdx = data.products.findIndex(p => p.id.toString() === orderData.productId.toString());
            if (pIdx !== -1) {
                const buyQty = parseInt(orderData.qty) || 1;
                if (data.products[pIdx].stock >= buyQty) {
                    data.products[pIdx].stock -= buyQty;
                    safeWriteJSON(DATA_FILE, data);
                }
            }
        }
        res.json({ success: true, orderId: newOrder.orderId });
    } catch (error) {
        console.error("Order Post Error:", error);
        res.status(500).json({ success: false });
    }
});

app.patch('/api/orders/:id/status', (req, res) => {
    let orders = safeReadJSON(ORDERS_FILE, []);
    const index = orders.findIndex(o => o.orderId.toString() === req.params.id);
    if (index !== -1) {
        orders[index].status = req.body.status;
        safeWriteJSON(ORDERS_FILE, orders);
        res.json({ success: true });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    let orders = safeReadJSON(ORDERS_FILE, []);
    const filtered = orders.filter(o => o.orderId.toString() !== req.params.id);
    safeWriteJSON(ORDERS_FILE, filtered);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.listen(5000, () => console.log("🚀 Server is running on http://localhost:5000"));