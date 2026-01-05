const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());

// បង្កើន limit ដើម្បីទទួលរូបភាព Base64 ធំៗ
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// បន្តបើក static សម្រាប់ legacy files (បើមាន)
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

// មុខងារបម្លែងរូបភាពទៅជា Base64 string
const fileToBase64 = (filePath) => {
    const bitmap = fs.readFileSync(filePath);
    const extension = path.extname(filePath).replace('.', '');
    const base64Content = bitmap.toString('base64');
    return `data:image/${extension};base64,${base64Content}`;
};

// --- ការកំណត់ Multer សម្រាប់ Upload បណ្តោះអាសន្ន ---
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

    // បម្លែង Files ទៅជា Base64 និងលុប File ចេញពី folder ភ្លាមៗ
    const base64Images = req.files ? req.files.map(f => {
        const b64 = fileToBase64(f.path);
        fs.unlinkSync(f.path); // លុប File ចេញដើម្បីកុំឱ្យពេញ Storage
        return b64;
    }) : [];

    if (type === 'product') {
        data.products.push({
            id: Date.now(),
            name, 
            price: parseFloat(price) || 0, 
            cost: parseFloat(cost) || 0,
            category, 
            detail,
            stock: parseInt(stock) || 0,
            images: base64Images
        });
    } else {
        data.banners.push({ 
            id: Date.now(), 
            title, 
            image: base64Images[0] || '' 
        });
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
            // ឆែកមើលបើមានការ upload រូបថ្មី
            let finalImages;
            if (req.files && req.files.length > 0) {
                finalImages = req.files.map(f => {
                    const b64 = fileToBase64(f.path);
                    fs.unlinkSync(f.path);
                    return b64;
                });
            } else {
                finalImages = type === 'product' ? data.products[index].images : [data.banners[index].image];
            }
            
            if (type === 'product') {
                data.products[index] = { 
                    ...data.products[index], 
                    ...req.body, 
                    price: parseFloat(req.body.price),
                    cost: parseFloat(req.body.cost),
                    images: finalImages 
                };
            } else {
                data.banners[index] = { ...data.banners[index], title: req.body.title, image: finalImages[0] };
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

// ================= 3. API Order Management =================
app.post('/api/orders', upload.single('payslip'), (req, res) => {
    try {
        const orderData = req.body;
        let payslipBase64 = null;

        if (req.file) {
            payslipBase64 = fileToBase64(req.file.path);
            fs.unlinkSync(req.file.path); // លុប file ចេញ
        }
        
        const today = new Date().toISOString().split('T')[0];
        let orders = safeReadJSON(ORDERS_FILE, []);
        
        const newOrder = {
            orderId: Date.now(),
            ...orderData,
            quantity: parseInt(orderData.qty || orderData.quantity) || 1,
            total: parseFloat(orderData.total) || 0,
            payslip: payslipBase64,
            status: 'Pending',
            date: today
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));