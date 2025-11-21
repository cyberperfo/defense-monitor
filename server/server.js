const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser(); 

app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/defenseDB';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Bağlandı")).catch(err => console.log(err));

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

// --- ROTALAR ---
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

// Haberler
app.get('/api/news', async (req, res) => {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=savunma+sanayi&hl=tr&gl=TR&ceid=TR:tr');
        const news = feed.items.slice(0, 7).map(item => ({ title: `CANLI: ${item.title}`, link: item.link }));
        res.json(news);
    } catch (error) {
        res.json([
            { title: "SİSTEM NOTU: Yedek haber akışı devrede.", link: "#" },
            { title: "Tusaş KAAN ilk uçuşunu gerçekleştirdi.", link: "#" },
            { title: "Baykar'dan yeni ihracat başarısı.", link: "#" }
        ]);
    }
});

// --- VERİ YÜKLEME (SEED) - VERİLER GERİ GELDİ ---
app.get('/api/seed', async (req, res) => {
    await Weapon.deleteMany({}); 
    
    const data = [
        {
            name: "Bayraktar TB2", country: "Turkey", manufacturer: "Baykar", type: "UAV",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Bayraktar_TB2_Runway.jpg",
            description: "Savaş alanını değiştiren taktik SİHA.",
            stats: { firepower: 70, mobility: 65, tech: 85, range: 50, cost: 90 },
            specs: { speed: "220 km/h", range: "300 km", armament: "MAM-L, MAM-C" }
        },
        {
            name: "KAAN", country: "Turkey", manufacturer: "Tusaş", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/TAI_TF-X_mock-up_at_Paris_Air_Show_2019.jpg/800px-TAI_TF-X_mock-up_at_Paris_Air_Show_2019.jpg",
            description: "5. Nesil Milli Muharip Uçak.",
            stats: { firepower: 98, mobility: 95, tech: 98, range: 85, cost: 50 },
            specs: { speed: "Mach 1.8", range: "1100 km", armament: "Meteor, Gökdoğan" }
        },
        {
            name: "Altay T1", country: "Turkey", manufacturer: "BMC", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Altay_MBT.jpg/800px-Altay_MBT.jpg",
            description: "Modern Ana Muharebe Tankı.",
            stats: { firepower: 92, mobility: 70, tech: 85, range: 60, cost: 60 },
            specs: { speed: "65 km/h", range: "500 km", armament: "120mm Top" }
        },
        {
            name: "T-129 ATAK", country: "Turkey", manufacturer: "Tusaş", type: "Helicopter",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/T129_Atak_Helicopter.jpg/800px-T129_Atak_Helicopter.jpg",
            description: "Taarruz ve Taktik Keşif Helikopteri.",
            stats: { firepower: 85, mobility: 95, tech: 80, range: 40, cost: 75 },
            specs: { speed: "280 km/h", range: "537 km", armament: "UMTAS, Cirit" }
        },
        {
            name: "F-35A Lightning II", country: "USA", manufacturer: "Lockheed Martin", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/800px-F-35A_flight_%28cropped%29.jpg",
            description: "5. Nesil çok rollü hayalet avcı uçağı.",
            stats: { firepower: 90, mobility: 85, tech: 100, range: 85, cost: 30 },
            specs: { speed: "Mach 1.6", range: "2200 km", armament: "AIM-120, JDAM" }
        },
        {
            name: "Leopard 2A7", country: "Germany", manufacturer: "KMW", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Leopard_2A7_Bundeswehr.jpg/800px-Leopard_2A7_Bundeswehr.jpg",
            description: "Zırh ve ateş gücü dengesiyle ünlü modern tank.",
            stats: { firepower: 92, mobility: 75, tech: 95, range: 60, cost: 40 },
            specs: { speed: "68 km/h", range: "450 km", armament: "120mm L55" }
        },
        {
            name: "S-400 Triumph", country: "Russia", manufacturer: "Almaz-Antey", type: "Defense",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/S-400_Triumf_system_at_Victory_Day_Parade_2019.jpg/800px-S-400_Triumf_system_at_Victory_Day_Parade_2019.jpg",
            description: "Stratejik uzun menzilli hava savunma sistemi.",
            stats: { firepower: 100, mobility: 40, tech: 90, range: 100, cost: 55 },
            specs: { speed: "N/A", range: "400 km", armament: "40N6E Füzeleri" }
        }
    ];

    await Weapon.insertMany(data);
    res.send("Veritabanı Zenginleştirildi! (Veriler Yüklendi)");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});