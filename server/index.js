const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();

// ================= 1. Configuration & Middleware =================
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_FILE = 'data.json';
const ORDERS_FILE = 'orders.json';

// Telegram Configuration (ប្តូរតាម Bot របស់អ្នក)
const BOT_TOKEN = '8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI'; 
const CHAT_ID = '7026983728';

// បង្កើត Folder និង File ចាំបាច់ពេល Server ចាប់ផ្តើម
const initFiles = () => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ products: [], banners: [] }, null, 2));
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
};
initFiles();

// Helper functions សម្រាប់អាន និងសរសេរ JSON
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

// រៀបចំការរក្សាទុករូបភាព (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ================= 2. API Product & Banner Management =================

// ទាញទិន្នន័យទាំងអស់ (Products, Banners, Orders)
app.get('/api/data', (req, res) => {
    const data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const orders = safeReadJSON(ORDERS_FILE, []);
    res.json({ products: data.products, banners: data.banners, orders: orders });
});

// បន្ថែមផលិតផលថ្មី ឬ Banner ថ្មី
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

// កែប្រែផលិតផល (Update Product)
app.put('/api/update/product/:id', upload.any(), (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, cost, category, detail, stock } = req.body;
        let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
        
        const idx = data.products.findIndex(p => p.id.toString() === id);
        if (idx !== -1) {
            let finalImages = data.products[idx].images;
            // បើមាន Upload រូបភាពថ្មី ត្រូវជំនួសរូបភាពចាស់
            if (req.files && req.files.length > 0) {
                finalImages = req.files.map(f => f.filename);
            }

            data.products[idx] = {
                ...data.products[idx],
                name,
                price: parseFloat(price),
                cost: parseFloat(cost),
                category,
                detail,
                stock: parseInt(stock),
                images: finalImages
            };
            
            safeWriteJSON(DATA_FILE, data);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: "មិនឃើញផលិតផលនេះទេ" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// លុបទិន្នន័យ (Product ឬ Banner)
app.delete('/api/delete/:type/:id', (req, res) => {
    const { type, id } = req.params;
    let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
    const key = type === 'product' ? 'products' : 'banners';
    
    const itemToDelete = data[key].find(i => i.id.toString() === id);
    if (itemToDelete) {
        const imgs = type === 'product' ? itemToDelete.images : [itemToDelete.image];
        imgs.forEach(imgName => {
            if (imgName) {
                const fullPath = path.join(__dirname, 'uploads', imgName);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }
        });
    }
    data[key] = data[key].filter(i => i.id.toString() !== id);
    safeWriteJSON(DATA_FILE, data);
    res.json({ success: true });
});

// ================= 3. Order Management (កាត់ស្តុក + Telegram) =================

// ទទួលការកុម្ម៉ង់ពីអតិថិជន
app.post('/api/orders', upload.any(), async (req, res) => {
    try {
        const orderData = req.body;
        const payslipFile = req.files ? req.files.find(f => f.fieldname === 'payslip') : null;
        const today = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh' });
        
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
            payslip: payslipFile ? payslipFile.filename : null,
            status: 'Pending',
            date: today
        };

        // ១. ឆែក និងកាត់ស្តុកចេញពី data.json
        if (orderData.productId) {
            let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
            const pIdx = data.products.findIndex(p => p.id.toString() === orderData.productId.toString());
            
            if (pIdx !== -1) {
                if (data.products[pIdx].stock < newOrder.quantity) {
                    return res.status(400).json({ success: false, message: "ទំនិញនេះអស់ពីស្តុកហើយ!" });
                }
                data.products[pIdx].stock -= newOrder.quantity;
                safeWriteJSON(DATA_FILE, data);
            }
        }

        // ២. រក្សាទុកក្នុង orders.json
        let orders = safeReadJSON(ORDERS_FILE, []);
        orders.unshift(newOrder); 
        safeWriteJSON(ORDERS_FILE, orders);

        // ៣. ផ្ញើទៅ Telegram
        const message = `🔔 <b>ការកុម្ម៉ង់ថ្មី!</b>\n` +
                        `--------------------------\n` +
                        `👤 ឈ្មោះ: ${newOrder.customerName}\n` +
                        `📞 លេខ: ${newOrder.phoneNumber}\n` +
                        `📦 ទំនិញ: ${newOrder.productName} (x${newOrder.quantity})\n` +
                        `💰 <b>សរុប: $${newOrder.total.toFixed(2)}</b>\n` +
                        `💳 ទូទាត់: ${newOrder.paymentMethod}\n` +
                        `📍 ទីតាំង: ${newOrder.location}\n` +
                        `--------------------------\n` +
                        `⏰ ${today}`;

        // ផ្ញើសារអក្សរ
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        // ប្រសិនបើមានរូបភាពវិក្កយបត្រ ផ្ញើទៅ Telegram
        if (payslipFile && fs.existsSync(payslipFile.path)) {
            const teleFormData = new FormData();
            teleFormData.append('chat_id', CHAT_ID);
            teleFormData.append('photo', fs.createReadStream(payslipFile.path));
            teleFormData.append('caption', `🧾 វិក្កយបត្រពី៖ ${newOrder.customerName}\nID: ${newOrder.orderId}`);

            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, teleFormData, {
                headers: teleFormData.getHeaders()
            });
        }

        res.json({ success: true, orderId: newOrder.orderId });

    } catch (error) {
        console.error("Order Error:", error.message);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

// ប្តូរស្ថានភាពការកុម្ម៉ង់ (Pending -> Completed)
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

// លុបការកុម្ម៉ង់
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

// ================= 4. Start Server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
});