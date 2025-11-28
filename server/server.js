const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB BAĞLANTISI ---
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/defenseDB';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Bağlandı")).catch(err => console.log(err));

// --- 1. SİLAH ŞEMASI (ENVANTER) ---
const WeaponSchema = new mongoose.Schema({
    name: String,
    country: String,
    manufacturer: String,
    type: String,
    image: String,
    description: String,
    stats: { firepower: Number, mobility: Number, tech: Number, range: Number, cost: Number },
    specs: { speed: String, range: String, armament: String }
});
const Weapon = mongoose.model('Weapon', WeaponSchema);

// --- 2. İSTİHBARAT ŞEMASI (AI RAPORLARI) ---
// Python ajanının kaydettiği koleksiyondan okuyacağız
const IntelSchema = new mongoose.Schema({
    title: String,
    source: String,
    url: String,
    date: String,
    priority: String,
    analysis: String,
    timestamp: Date
}, { collection: 'news_intel' }); // Koleksiyon adı Python koduyla aynı olmalı

const Intel = mongoose.model('Intel', IntelSchema);

// --- ROTALAR ---

// Envanter Rotaları
app.get('/api/weapons', async (req, res) => {
    const weapons = await Weapon.find();
    res.json(weapons);
});
app.get('/api/countries', async (req, res) => {
    const countries = await Weapon.distinct("country");
    res.json(countries);
});
app.get('/api/companies', async (req, res) => {
    const { country } = req.query;
    const weapons = await Weapon.find({ country: country });
    const companies = [...new Set(weapons.map(item => item.manufacturer))];
    res.json(companies);
});
app.get('/api/products', async (req, res) => {
    const { manufacturer } = req.query;
    const products = await Weapon.find({ manufacturer: manufacturer });
    res.json(products);
});

// --- İSTİHBARAT ROTASI (DÜZELTİLDİ) ---
// Artık direkt veritabanındaki AI Raporlarını çekiyoruz
app.get('/api/news', async (req, res) => {
    try {
        // En yeni 20 raporu, tarihe göre sıralayıp getir
        const intelData = await Intel.find().sort({ timestamp: -1 }).limit(20);
        res.json(intelData);
    } catch (error) {
        console.log("News Error:", error);
        res.status(500).json({ message: "Veri çekilemedi" });
    }
});

// Seed (Yedek)
app.get('/api/seed', async (req, res) => {
    res.send("Veritabanı dolu.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});