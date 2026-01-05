const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data'); // បន្ថែមសម្រាប់ផ្ញើរូបភាពទៅ Telegram

const app = express();

// 1. Configuration
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_FILE = 'data.json';
const ORDERS_FILE = 'orders.json';

// Telegram Configuration
const BOT_TOKEN = '8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI'; 
const CHAT_ID = '7026983728';

const initFiles = () => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ products: [], banners: [] }, null, 2));
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
};
initFiles();

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
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err.message);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ================= 1. API Product & Banner Management =================
app.get('/api/data', (req, res) => {
    const data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const orders = safeReadJSON(ORDERS_FILE, []);
    res.json({ products: data.products, banners: data.banners, orders: orders });
});

app.post('/api/upload', upload.any(), (req, res) => {
    try {
        const { type, name, price, cost, category, detail, title, stock } = req.body;
        let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
        const savedFilenames = req.files ? req.files.map(f => f.filename) : [];

        if (type === 'product') {
            data.products.push({
                id: Date.now(),
                name, 
                price: parseFloat(price) || 0, 
                cost: parseFloat(cost) || 0,
                category, 
                detail,
                stock: parseInt(stock) || 0,
                images: savedFilenames 
            });
        } else if (type === 'banner') {
            data.banners.push({ 
                id: Date.now(), 
                title, 
                image: savedFilenames[0] || '' 
            });
        }
        safeWriteJSON(DATA_FILE, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/delete/:type/:id', (req, res) => {
    const { type, id } = req.params;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const key = type === 'product' ? 'products' : 'banners';
    const itemToDelete = data[key].find(i => i.id.toString() === id);
    if (itemToDelete) {
        const imgs = type === 'product' ? itemToDelete.images : [itemToDelete.image];
        imgs.forEach(imgName => {
            const fullPath = path.join(__dirname, 'uploads', imgName);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });
    }
    data[key] = data[key].filter(i => i.id.toString() !== id);
    safeWriteJSON(DATA_FILE, data);
    res.json({ success: true });
});

// ================= 2. API Order Management (With Telegram Notification) =================
app.post('/api/orders', upload.any(), async (req, res) => {
    try {
        const orderData = req.body;
        const payslipFile = req.files ? req.files.find(f => f.fieldname === 'payslip') : null;
        const payslipFilename = payslipFile ? payslipFile.filename : null;
        
        const today = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh' });
        let orders = safeReadJSON(ORDERS_FILE, []);
        
        const newOrder = {
            orderId: Date.now(),
            customerName: orderData.customerName,
            phoneNumber: orderData.customerPhone || orderData.phoneNumber,
            address: orderData.customerAddress || orderData.address,
            location: orderData.location,
            paymentMethod: orderData.paymentMethod,
            productName: orderData.productName,
            quantity: parseInt(orderData.qty) || 1,
            total: parseFloat(orderData.total) || 0,
            payslip: payslipFilename,
            status: 'Pending',
            date: today
        };

        // ១. រក្សាទុកក្នុង Orders File
        orders.unshift(newOrder); 
        safeWriteJSON(ORDERS_FILE, orders);

        // ២. កាត់ស្តុកទំនិញ
        if (orderData.productId) {
            let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
            const pIdx = data.products.findIndex(p => (p.id || p._id).toString() === orderData.productId.toString());
            if (pIdx !== -1) {
                data.products[pIdx].stock -= newOrder.quantity;
                safeWriteJSON(DATA_FILE, data);
            }
        }

        // ៣. ផ្ញើទៅ Telegram
        const message = `🔔 <b>ការកុម្ម៉ង់ថ្មី!</b>\n` +
                        `--------------------------\n` +
                        `👤 ឈ្មោះ: ${newOrder.customerName}\n` +
                        `📞 លេខទូរស័ព្ទ: ${newOrder.phoneNumber}\n` +
                        `📍 ទីតាំង: ${newOrder.location}\n` +
                        `🏠 អាសយដ្ឋាន: ${newOrder.address}\n` +
                        `📦 ទំនិញ: ${newOrder.productName} (x${newOrder.quantity})\n` +
                        `💳 ទូទាត់: ${newOrder.paymentMethod}\n` +
                        `💰 <b>សរុប: $${newOrder.total.toFixed(2)}</b>\n` +
                        `--------------------------\n` +
                        `⏰ កាលបរិច្ឆេទ: ${today}`;

        // ផ្ញើសារអក្សរ
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        // ប្រសិនបើមានរូបភាពវិក្កយបត្រ ផ្ញើទៅ Telegram ដែរ
        if (payslipFile) {
            const teleFormData = new FormData();
            teleFormData.append('chat_id', CHAT_ID);
            teleFormData.append('photo', fs.createReadStream(payslipFile.path));
            teleFormData.append('caption', `🧾 វិក្កយបត្រពី៖ ${newOrder.customerName}`);

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, teleFormData, {
                headers: teleFormData.getHeaders()
            });
        }

        res.json({ success: true, orderId: newOrder.orderId });

    } catch (error) {
        console.error("Order Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.patch('/api/orders/:id/status', (req, res) => {
    let orders = safeReadJSON(ORDERS_FILE, []);
    const index = orders.findIndex(o => o.orderId.toString() === req.params.id);
    if (index !== -1) {
        orders[index].status = req.body.status;
        safeWriteJSON(ORDERS_FILE, orders);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/orders/:id', (req, res) => {
    let orders = safeReadJSON(ORDERS_FILE, []);
    const orderToDelete = orders.find(o => o.orderId.toString() === req.params.id);
    if (orderToDelete && orderToDelete.payslip) {
        const fullPath = path.join(__dirname, 'uploads', orderToDelete.payslip);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    const filtered = orders.filter(o => o.orderId.toString() !== req.params.id);
    safeWriteJSON(ORDERS_FILE, filtered);
    res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));