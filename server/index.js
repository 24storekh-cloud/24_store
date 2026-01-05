const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// --- ១. Configuration ---
app.use(cors());
app.use(express.json({ limit: '50mb' })); // បង្កើន limit ដើម្បីទទួលរូបភាព Base64 ធំៗ
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_FILE = path.join(__dirname, 'data.json');

// បង្កើត Folder សម្រាប់ទុក File បណ្តោះអាសន្ន (Multer ត្រូវការ)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- ២. Helper Functions ---
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return { products: [], banners: [], orders: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// មុខងារបម្លែង File ទៅជា Base64 string
const fileToBase64 = (filePath) => {
  const bitmap = fs.readFileSync(filePath);
  const extension = path.extname(filePath).replace('.', '');
  return `data:image/${extension};base64,${bitmap.toString('base64')}`;
};

// --- ៣. API Routes ---

// Get All Data
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// Upload API (Products & Banners)
// ប្រើ upload.array('images') ដើម្បីឱ្យត្រូវជាមួយ Frontend
app.post('/api/upload', upload.array('images'), (req, res) => {
  const { type, title, name, price, category, detail, stock } = req.body;
  const data = readData();
  
  // បម្លែងរាល់រូបភាពដែល Upload មកជា Base64 រួចលុប File ចោលវិញ
  const base64Images = req.files.map(file => {
    const base64 = fileToBase64(file.path);
    fs.unlinkSync(file.path); // លុប File ចេញពី Server ក្រោយបម្លែងរួច
    return base64;
  });

  if (type === 'banner') {
    const newBanner = {
      id: Date.now().toString(),
      title,
      image: base64Images[0] // Banner យករូបទី ១
    };
    data.banners.push(newBanner);
  } else if (type === 'product') {
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      category,
      detail,
      stock: parseInt(stock),
      images: base64Images // Product រក្សាទុកជា Array រូបភាព
    };
    data.products.push(newProduct);
  }

  writeData(data);
  res.json({ success: true, message: 'Upload successful with Base64' });
});

// Update Order Status
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = readData();
  const order = data.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    writeData(data);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// Delete Item (Product, Banner, Order)
app.delete('/api/delete/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const data = readData();
  
  if (type === 'product') data.products = data.products.filter(p => p.id !== id);
  else if (type === 'banner') data.banners = data.banners.filter(b => b.id !== id);
  else if (type === 'order') data.orders = data.orders.filter(o => o.id !== id);

  writeData(data);
  res.json({ success: true });
});

// --- ៤. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));