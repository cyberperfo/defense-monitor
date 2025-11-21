const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Parser = require('rss-parser'); // Haber okuyucu

const app = express();
const parser = new Parser(); 

app.use(cors());
app.use(express.json());

// --- MONGODB BAĞLANTISI (BULUT & YEREL UYUMLU) ---
// Render'da çalışırken 'MONGO_URI' çevre değişkenini kullanır.
// Bilgisayarında çalışırken 'localhost' adresini kullanır.
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/defenseDB';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Bağlandı")).catch(err => console.log(err));

// --- VERİTABANI ŞEMASI ---
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

// --- API ROTALARI ---

// 1. Tüm silahları getir
app.get('/api/weapons', async (req, res) => {
    const weapons = await Weapon.find();
    res.json(weapons);
});

// 2. Sadece ÜLKELERİ getir
app.get('/api/countries', async (req, res) => {
    const countries = await Weapon.distinct("country");
    res.json(countries);
});

// 3. ŞİRKETLERİ getir
app.get('/api/companies', async (req, res) => {
    const { country } = req.query;
    const weapons = await Weapon.find({ country: country });
    const companies = [...new Set(weapons.map(item => item.manufacturer))];
    res.json(companies);
});

// 4. ÜRÜNLERİ getir
app.get('/api/products', async (req, res) => {
    const { manufacturer } = req.query;
    const products = await Weapon.find({ manufacturer: manufacturer });
    res.json(products);
});

// --- AKILLI HABER ROTASI (CANLI + YEDEK) ---
app.get('/api/news', async (req, res) => {
    try {
        // 1. Google News'ten CANLI haberleri çekmeye çalış
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=savunma+sanayi&hl=tr&gl=TR&ceid=TR:tr');
        
        // İlk 7 haberi al
        const news = feed.items.slice(0, 7).map(item => ({
            title: `CANLI: ${item.title}`, 
            link: item.link
        }));
        
        console.log("✅ Canlı haberler çekildi.");
        res.json(news);

    } catch (error) {
        // 2. Hata olursa YEDEK listeyi devreye sok
        console.log("⚠️ RSS Hatası, Yedekler devrede.");
        res.json([
            { title: "SİSTEM NOTU: Anlık veri kaynağına erişilemiyor, yedek akış devrede.", link: "#" },
            { title: "Tusaş KAAN ilk süpersonik uçuşunu gerçekleştirdi.", link: "#" },
            { title: "Baykar, 33. ülkeye TB2 ihracatını gerçekleştirdi.", link: "#" },
            { title: "Roketsan ÇAKIR füzesi hedefini tam isabetle vurdu.", link: "#" },
            { title: "TCG Anadolu Mavi Vatan tatbikatında görev başında.", link: "#" },
            { title: "Aselsan'ın yeni hava savunma sistemi GÜRZ tanıtıldı.", link: "#" }
        ]);
    }
});

// Seed (Veri Yükleme - Veritabanını sıfırlamak istemezseniz burayı boş bırakın)
app.get('/api/seed', async (req, res) => {
    res.send("Veritabanı zaten dolu.");
});

// --- SUNUCUYU BAŞLAT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});