const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Parser = require('rss-parser'); // YENİ: Haber okuyucu

const app = express();
const parser = new Parser(); // YENİ: Motoru başlat

app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect('mongodb://127.0.0.1:27017/defenseDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Bağlandı")).catch(err => console.log(err));

// Şema
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

// --- YENİ: OTOMATİK HABER ROTASI (RSS) ---
app.get('/api/news', async (req, res) => {
    try {
        // Google News - Savunma Sanayi (Türkçe) Akışı
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=savunma+sanayi&hl=tr&gl=TR&ceid=TR:tr');
        
        // İlk 5 haberi al ve gönder
        const news = feed.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate
        }));
        res.json(news);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Haberler çekilemedi" });
    }
});

// --- SEED (Senin Mevcut Veri Paketin - Aynen Korundu) ---
app.get('/api/seed', async (req, res) => {
    await Weapon.deleteMany({}); 
    
    const data = [
        // --- TÜRKİYE ---
        {
            name: "Bayraktar TB2", country: "Turkey", manufacturer: "Baykar", type: "UAV",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Bayraktar_TB2_Runway.jpg",
            description: "Savaş alanını değiştiren, dünyaca ünlü taktik SİHA.",
            stats: { firepower: 70, mobility: 65, tech: 85, range: 50, cost: 90 },
            specs: { speed: "220 km/h", range: "300 km", armament: "MAM-L, MAM-C" }
        },
        {
            name: "Bayraktar Akıncı", country: "Turkey", manufacturer: "Baykar", type: "UAV",
            image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Bayraktar_Ak%C4%B1nc%C4%B1_Teknofest_2019.jpg",
            description: "Yüksek irtifa, ağır taarruz insansız hava aracı.",
            stats: { firepower: 90, mobility: 75, tech: 95, range: 85, cost: 70 },
            specs: { speed: "360 km/h", range: "7500 km", armament: "SOM, MK-84, Gökdoğan" }
        },
        {
            name: "Bayraktar Kızılelma", country: "Turkey", manufacturer: "Baykar", type: "Jet UAV",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/K%C4%B1z%C4%B1lelma_Teknofest_2022_Samsun_%28cropped%29.jpg/800px-K%C4%B1z%C4%B1lelma_Teknofest_2022_Samsun_%28cropped%29.jpg",
            description: "Türkiye'nin ilk insansız savaş uçağı (MİUS).",
            stats: { firepower: 95, mobility: 100, tech: 100, range: 80, cost: 60 },
            specs: { speed: "Mach 0.9", range: "930 km", armament: "Hava-Hava Füzeleri" }
        },
        {
            name: "KAAN", country: "Turkey", manufacturer: "Tusaş", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/TAI_TF-X_mock-up_at_Paris_Air_Show_2019.jpg/800px-TAI_TF-X_mock-up_at_Paris_Air_Show_2019.jpg",
            description: "5. Nesil Milli Muharip Uçak.",
            stats: { firepower: 98, mobility: 95, tech: 98, range: 85, cost: 50 },
            specs: { speed: "Mach 1.8", range: "1100 km", armament: "Meteor, Gökdoğan" }
        },
        {
            name: "Hürjet", country: "Turkey", manufacturer: "Tusaş", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/H%C3%BCrjet_at_Paris_Air_Show_2019.jpg/800px-H%C3%BCrjet_at_Paris_Air_Show_2019.jpg",
            description: "Jet Eğitim ve Hafif Taarruz Uçağı.",
            stats: { firepower: 75, mobility: 90, tech: 85, range: 70, cost: 80 },
            specs: { speed: "Mach 1.4", range: "2200 km", armament: "HGK, KGK" }
        },
        {
            name: "T-129 ATAK", country: "Turkey", manufacturer: "Tusaş", type: "Helicopter",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/T129_Atak_Helicopter.jpg/800px-T129_Atak_Helicopter.jpg",
            description: "Taarruz ve Taktik Keşif Helikopteri.",
            stats: { firepower: 85, mobility: 95, tech: 80, range: 40, cost: 75 },
            specs: { speed: "280 km/h", range: "537 km", armament: "UMTAS, Cirit" }
        },
        {
            name: "Anka-3", country: "Turkey", manufacturer: "Tusaş", type: "UAV",
            image: "https://placehold.co/600x400/222/red?text=Anka-3+Stealth+UAV",
            description: "Hayalet (Stealth) uçan kanat tasarımı SİHA.",
            stats: { firepower: 85, mobility: 80, tech: 95, range: 85, cost: 65 },
            specs: { speed: "Mach 0.7", range: "Unknown", armament: "SOM-J" }
        },
        {
            name: "Altay T1", country: "Turkey", manufacturer: "BMC", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Altay_MBT.jpg/800px-Altay_MBT.jpg",
            description: "Modern Ana Muharebe Tankı.",
            stats: { firepower: 92, mobility: 70, tech: 85, range: 60, cost: 60 },
            specs: { speed: "65 km/h", range: "500 km", armament: "120mm Top" }
        },
        {
            name: "Kirpi II", country: "Turkey", manufacturer: "BMC", type: "Armored",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/BMC_Kirpi_IDEF_2015.jpg/800px-BMC_Kirpi_IDEF_2015.jpg",
            description: "Mayına karşı korumalı zırhlı personel taşıyıcı.",
            stats: { firepower: 40, mobility: 80, tech: 70, range: 80, cost: 90 },
            specs: { speed: "100 km/h", range: "800 km", armament: "7.62mm / 12.7mm" }
        },
        {
            name: "Vuran", country: "Turkey", manufacturer: "BMC", type: "Armored",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/BMC_Vuran_IDEF_2019.jpg/800px-BMC_Vuran_IDEF_2019.jpg",
            description: "Çok amaçlı zırhlı taktik araç.",
            stats: { firepower: 50, mobility: 90, tech: 75, range: 75, cost: 85 },
            specs: { speed: "110 km/h", range: "600 km", armament: "Aselsan SARP" }
        },
        {
            name: "Korkut", country: "Turkey", manufacturer: "Aselsan", type: "Defense",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Korkut_IDEF_2015.jpg/800px-Korkut_IDEF_2015.jpg",
            description: "Kundağı Motorlu Hava Savunma Top Sistemi.",
            stats: { firepower: 80, mobility: 60, tech: 90, range: 30, cost: 70 },
            specs: { speed: "65 km/h", range: "4 km (Etkili)", armament: "35mm Parçacıklı" }
        },
        {
            name: "Hisar-O+", country: "Turkey", manufacturer: "Aselsan", type: "Defense",
            image: "https://placehold.co/600x400/222/red?text=Hisar-O+System",
            description: "Orta irtifa hava savunma füze sistemi.",
            stats: { firepower: 95, mobility: 50, tech: 95, range: 80, cost: 60 },
            specs: { speed: "Mach 2+", range: "25 km+", armament: "IIR Güdümlü Füze" }
        },
        
        // --- ABD ---
        {
            name: "F-35A Lightning II", country: "USA", manufacturer: "Lockheed Martin", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/800px-F-35A_flight_%28cropped%29.jpg",
            description: "5. Nesil çok rollü hayalet avcı uçağı.",
            stats: { firepower: 90, mobility: 85, tech: 100, range: 85, cost: 30 },
            specs: { speed: "Mach 1.6", range: "2200 km", armament: "AIM-120, JDAM" }
        },
        {
            name: "F-22 Raptor", country: "USA", manufacturer: "Lockheed Martin", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/F-22_Raptor_edit1_%28cropped%29.jpg/800px-F-22_Raptor_edit1_%28cropped%29.jpg",
            description: "Hava üstünlüğü odaklı, dünyanın ilk stealth uçağı.",
            stats: { firepower: 95, mobility: 100, tech: 98, range: 75, cost: 10 },
            specs: { speed: "Mach 2.25", range: "2960 km", armament: "AIM-9X, AIM-120" }
        },
        {
            name: "F-16 Block 70", country: "USA", manufacturer: "Lockheed Martin", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/F-16_June_2008.jpg/800px-F-16_June_2008.jpg",
            description: "Dünyanın en yaygın ve kendini kanıtlamış savaş uçağı.",
            stats: { firepower: 80, mobility: 90, tech: 85, range: 80, cost: 80 },
            specs: { speed: "Mach 2", range: "4220 km", armament: "Çok Çeşitli" }
        },
        {
            name: "M1A2 SEPv3 Abrams", country: "USA", manufacturer: "General Dynamics", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/M1A1_Abrams_with_TUSK.jpg/800px-M1A1_Abrams_with_TUSK.jpg",
            description: "Amerikan ordusunun ana muharebe tankı.",
            stats: { firepower: 95, mobility: 65, tech: 90, range: 60, cost: 50 },
            specs: { speed: "67 km/h", range: "426 km", armament: "120mm M256" }
        },
        {
            name: "AH-64E Apache", country: "USA", manufacturer: "Boeing", type: "Helicopter",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/AH-64D_Apache_Longbow.jpg/800px-AH-64D_Apache_Longbow.jpg",
            description: "Ağır taarruz helikopteri.",
            stats: { firepower: 95, mobility: 80, tech: 85, range: 50, cost: 40 },
            specs: { speed: "293 km/h", range: "476 km", armament: "30mm Top, Hellfire" }
        },

        // --- ALMANYA ---
        {
            name: "Leopard 2A7", country: "Germany", manufacturer: "KMW", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Leopard_2A7_Bundeswehr.jpg/800px-Leopard_2A7_Bundeswehr.jpg",
            description: "Zırh ve ateş gücü dengesiyle ünlü modern tank.",
            stats: { firepower: 92, mobility: 75, tech: 95, range: 60, cost: 40 },
            specs: { speed: "68 km/h", range: "450 km", armament: "120mm L55" }
        },
        {
            name: "KF51 Panther", country: "Germany", manufacturer: "Rheinmetall", type: "Tank",
            image: "https://placehold.co/600x400/222/blue?text=KF51+Panther",
            description: "Geleceğin tankı konsepti, 130mm topa sahip.",
            stats: { firepower: 100, mobility: 80, tech: 100, range: 60, cost: 20 },
            specs: { speed: "70 km/h", range: "500 km", armament: "130mm Future Gun" }
        },

        // --- RUSYA ---
        {
            name: "Su-57 Felon", country: "Russia", manufacturer: "Sukhoi", type: "Jet",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Su-57_MAKS_2011_1.jpg/800px-Su-57_MAKS_2011_1.jpg",
            description: "Rusya'nın 5. nesil görünmez savaş uçağı.",
            stats: { firepower: 90, mobility: 100, tech: 85, range: 85, cost: 50 },
            specs: { speed: "Mach 2", range: "3500 km", armament: "R-77M, R-74M2" }
        },
        {
            name: "S-400 Triumph", country: "Russia", manufacturer: "Almaz-Antey", type: "Defense",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/S-400_Triumf_system_at_Victory_Day_Parade_2019.jpg/800px-S-400_Triumf_system_at_Victory_Day_Parade_2019.jpg",
            description: "Stratejik uzun menzilli hava savunma sistemi.",
            stats: { firepower: 100, mobility: 40, tech: 90, range: 100, cost: 55 },
            specs: { speed: "N/A", range: "400 km", armament: "40N6E Füzeleri" }
        },
        
        // --- GÜNEY KORE ---
        {
            name: "K2 Black Panther", country: "South Korea", manufacturer: "Hyundai Rotem", type: "Tank",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/K2_Black_Panther_tank.jpg/800px-K2_Black_Panther_tank.jpg",
            description: "Dünyanın en pahalı ve teknolojik tanklarından biri.",
            stats: { firepower: 95, mobility: 85, tech: 95, range: 60, cost: 30 },
            specs: { speed: "70 km/h", range: "450 km", armament: "120mm L55" }
        },
        {
            name: "KF-21 Boramae", country: "South Korea", manufacturer: "KAI", type: "Jet",
            image: "https://placehold.co/600x400/222/blue?text=KF-21+Boramae",
            description: "4.5 Nesil gelişmiş çok rollü savaş uçağı.",
            stats: { firepower: 85, mobility: 90, tech: 90, range: 80, cost: 60 },
            specs: { speed: "Mach 1.8", range: "2900 km", armament: "Meteor, AIM-2000" }
        }
    ];

    await Weapon.insertMany(data);
    res.send("Veritabanı Zenginleştirildi! (Tüm Dünya Envanteri Yüklendi)");
});

app.listen(5000, () => {
    console.log("🚀 Server 5000 portunda çalışıyor");
});