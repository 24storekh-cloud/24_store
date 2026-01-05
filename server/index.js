const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');

const app = express();
app.use(cors());

// បង្កើនទំហំ Limit ដើម្បីឱ្យ JSON អាចផ្ទុកកូដរូបភាព Base64 បានច្រើន
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_FILE = 'data.json';
const ORDERS_FILE = 'orders.json';

// កំណត់ Multer ឱ្យទទួលរូបភាពទុកក្នុង Memory (មិនបង្កើត File ក្នុងម៉ាស៊ីនទេ)
const upload = multer({ storage: multer.memoryStorage() });

// --- មុខងារជំនួយសម្រាប់អាន/សរសេរ File JSON ---
const safeReadJSON = (filePath, defaultContent) => {
    try {
        if (!fs.existsSync(filePath)) return defaultContent;
        const content = fs.readFileSync(filePath, 'utf8');
        return content.trim() ? JSON.parse(content) : defaultContent;
    } catch (err) {
        return defaultContent;
    }
};

const safeWriteJSON = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ================= 1. Telegram Notification =================
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        const BOT_TOKEN = process.env.BOT_TOKEN || '8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI'; 
        const CHAT_ID = process.env.CHAT_ID || '7026983728';

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

// ================= 2. Product Management (Base64 Mode) =================
app.get('/api/data', (req, res) => {
    const data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const orders = safeReadJSON(ORDERS_FILE, []);
    res.json({ ...data, orders });
});

app.post('/api/upload', upload.array('images', 5), (req, res) => {
    const { type, name, price, cost, category, detail, title, stock } = req.body;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    
    // បម្លែងរូបភាពទៅជា Base64 String
    const imageUrls = req.files ? req.files.map(f => 
        `data:${f.mimetype};base64,${f.buffer.toString('base64')}`
    ) : [];

    if (type === 'product') {
        data.products.push({
            id: Date.now(),
            name, price: parseFloat(price), cost: parseFloat(cost),
            category, detail, stock: parseInt(stock),
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
    const col = type === 'product' ? 'products' : 'banners';
    const idx = data[col].findIndex(item => item.id.toString() === id);

    if (idx !== -1) {
        if (req.body.update_type === 'stock_only') {
            data.products[idx].stock = parseInt(req.body.stock);
        } else {
            const newImages = req.files && req.files.length > 0 
                ? req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`) 
                : (type === 'product' ? data[col][idx].images : [data[col][idx].image]);
            
            data[col][idx] = { ...data[col][idx], ...req.body, images: newImages };
        }
        safeWriteJSON(DATA_FILE, data);
        res.json({ success: true });
    }
});

// ================= 3. Order Management =================
app.post('/api/orders', upload.single('payslip'), (req, res) => {
    try {
        const orderData = req.body;
        const payslipBase64 = req.file 
            ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
            : null;
        
        const today = new Date().toISOString().split('T')[0];
        let orders = safeReadJSON(ORDERS_FILE, []);
        
        const newOrder = {
            orderId: Date.now(),
            ...orderData,
            payslip: payslipBase64,
            status: 'Pending',
            date: today
        };

        orders.unshift(newOrder); 
        safeWriteJSON(ORDERS_FILE, orders);

        if (orderData.productId) {
            let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
            const pIdx = data.products.findIndex(p => p.id.toString() === orderData.productId.toString());
            if (pIdx !== -1) {
                data.products[pIdx].stock -= parseInt(orderData.qty || 1);
                safeWriteJSON(DATA_FILE, data);
            }
        }
        res.json({ success: true, orderId: newOrder.orderId });
    } catch (error) {
        res.status(500).json({ success: false });
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

app.patch('/api/orders/:id/status', (req, res) => {
    let orders = safeReadJSON(ORDERS_FILE, []);
    const idx = orders.findIndex(o => o.orderId.toString() === req.params.id);
    if (idx !== -1) {
        orders[idx].status = req.body.status;
        safeWriteJSON(ORDERS_FILE, orders);
        res.json({ success: true });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Base64 JSON Server Running on Port ${PORT}`));