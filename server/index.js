const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();

// 1. មូលដ្ឋានគ្រឹះ និងសុវត្ថិភាព (Configuration)
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// បើកឱ្យគេចូលមើលរូបភាពតាម URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DATA_FILE = 'data.json';
const ORDERS_FILE = 'orders.json';

// --- បង្កើត File JSON និង Folder បើមិនទាន់មាន ---
const initFiles = () => {
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ products: [], banners: [] }, null, 2));
    }
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    }
};
initFiles();

// --- មុខងារជំនួយសម្រាប់អាន/សរសេរ File JSON ---
const safeReadJSON = (filePath, defaultContent) => {
    try {
        if (!fs.existsSync(filePath)) return defaultContent;
        const content = fs.readFileSync(filePath, 'utf8');
        return content.trim() ? JSON.parse(content) : defaultContent;
    } catch (err) {
        console.error(`បញ្ហាអាន File ${filePath}:`, err.message);
        return defaultContent;
    }
};

const safeWriteJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`បញ្ហាសរសេរ File ${filePath}:`, err.message);
    }
};

// 2. ការកំណត់ Multer សម្រាប់រក្សាទុក File រូបភាព
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ប្រើ upload.any() ដើម្បីឱ្យបត់បែនបានគ្រប់ឈ្មោះ field (images, image, payslip)
const upload = multer({ storage });

// ================= 1. API Telegram Notification =================
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

// កែប្រែមកប្រើ upload.any() ដើម្បីដោះស្រាយបញ្ហា Unexpected field
app.post('/api/upload', upload.any(), (req, res) => {
    try {
        const { type, name, price, cost, category, detail, title, stock } = req.body;
        let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });

        // ចាប់យកឈ្មោះ file ទាំងអស់ដែលបាន upload
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
        console.error("Upload error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/update/:type/:id', upload.any(), (req, res) => {
    try {
        const { type, id } = req.params;
        let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
        const collection = type === 'product' ? 'products' : 'banners';
        const index = data[collection].findIndex(item => item.id.toString() === id);

        if (index !== -1) {
            if (req.body.update_type === 'stock_only') {
                data.products[index].stock = parseInt(req.body.stock);
            } else {
                let finalImages;
                if (req.files && req.files.length > 0) {
                    finalImages = req.files.map(f => f.filename);
                } else {
                    finalImages = type === 'product' ? data.products[index].images : [data.banners[index].image];
                }
                
                if (type === 'product') {
                    data.products[index] = { 
                        ...data.products[index], 
                        name: req.body.name || data.products[index].name,
                        category: req.body.category || data.products[index].category,
                        detail: req.body.detail || data.products[index].detail,
                        stock: parseInt(req.body.stock) || 0,
                        price: parseFloat(req.body.price) || 0,
                        cost: parseFloat(req.body.cost) || 0,
                        images: finalImages 
                    };
                } else {
                    data.banners[index] = { 
                        ...data.banners[index], 
                        title: req.body.title || data.banners[index].title, 
                        image: finalImages[0] 
                    };
                }
            }
            safeWriteJSON(DATA_FILE, data);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Item not found" });
        }
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

// ================= 3. API Order Management =================
app.post('/api/orders', upload.any(), (req, res) => {
    try {
        const orderData = req.body;
        // ចាប់យក payslip ពី req.files
        const payslipFile = req.files ? req.files.find(f => f.fieldname === 'payslip') : null;
        const payslipFilename = payslipFile ? payslipFile.filename : null;
        
        const today = new Date().toISOString().split('T')[0];
        let orders = safeReadJSON(ORDERS_FILE, []);
        
        const newOrder = {
            orderId: Date.now(),
            customerName: orderData.customerName,
            phoneNumber: orderData.phoneNumber,
            address: orderData.address,
            productId: orderData.productId,
            productName: orderData.productName,
            quantity: parseInt(orderData.qty || orderData.quantity) || 1,
            total: parseFloat(orderData.total) || 0,
            payslip: payslipFilename,
            status: 'Pending',
            date: today
        };

        orders.unshift(newOrder); 
        safeWriteJSON(ORDERS_FILE, orders);

        // កាត់ស្តុក
        if (orderData.productId) {
            let data = safeReadJSON(DATA_FILE, { products: [], banners: [] });
            const pIdx = data.products.findIndex(p => p.id.toString() === orderData.productId.toString());
            if (pIdx !== -1) {
                const buyQty = parseInt(orderData.qty || orderData.quantity) || 1;
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