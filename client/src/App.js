import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import './App.css';
// Chatbot bileşenini import etmeyi unutma (Dosyasını oluşturduysan)
import Chatbot from './Chatbot'; 

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- 1. BİLEŞEN: ÜST HABER BANDI (AUTO-REFRESH TİCKER) ---
const NewsTicker = () => {
  const [news, setNews] = useState([]);

  const fetchNews = () => {
    // Sunucudan haberleri çek
    axios.get('https://savunmasanayibulten.onrender.com/api/news')
      .then(res => setNews(res.data))
      .catch(err => console.error("Haber hatası:", err));
  };

  useEffect(() => {
    fetchNews(); // İlk açılışta çek
    // Her 60 saniyede bir güncelle
    const timer = setInterval(() => {
      fetchNews();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="news-ticker-container">
      <div className="ticker-label">SON DAKİKA</div>
      <div className="ticker-wrap">
        <div className="ticker-move">
          {news.map((item, index) => (
            <div key={index} className="ticker-item">
              <span className="dot">●</span> 
              <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 2. BİLEŞEN: ANA SAYFA (DASHBOARD / BÜLTEN MODU) ---
const CountrySelect = () => {
  const [countries, setCountries] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    // Ülkeleri çek
    axios.get('https://savunmasanayibulten.onrender.com/api/countries').then(res => setCountries(res.data));
    // Bülten haberlerini çek
    axios.get('https://savunmasanayibulten.onrender.com/api/news').then(res => setLatestNews(res.data));
  }, []);

  return (
    <div className="page-container dashboard-layout">
      
      {/* SOL TARAF: ÜLKE SEÇİMİ (ENVANTER) */}
      <div className="dashboard-main">
        <h2 className="section-title">🌍 KÜRESEL ENVANTERLER</h2>
        <div className="grid">
          {countries.map((country, index) => (
            <Link to={`/country/${country}`} key={index} className="nav-card">
              <div className="nav-card-body">
                <h1>🏳️</h1>
                <h3>{country}</h3>
                <p>Envanter & Şirketler &rarr;</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SAĞ TARAF: DİKEY HABER BÜLTENİ */}
      <div className="dashboard-sidebar">
         <h2 className="section-title">📡 İSTİHBARAT AKIŞI</h2>
         <div className="news-feed">
            {latestNews.map((item, index) => (
              <div key={index} className="news-card">
                <span className="news-tag">AI ANALİZ</span>
                <a href={item.link} target="_blank" rel="noreferrer">
                  {/* 'CANLI:' yazısını başlıktan temizleyerek gösterelim */}
                  <h4>{item.title.replace("CANLI:", "")}</h4>
                </a>
                <p className="news-summary">
                  Savunma sanayindeki bu gelişme, stratejik dengeleri etkileyebilir. Detaylar için başlığa tıklayınız.
                </p>
                <span className="news-date">Bugün, {new Date().getHours()}:00</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

// --- 3. BİLEŞEN: ŞİRKET SEÇİMİ ---
const CompanySelect = () => {
  const { countryName } = useParams();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios.get(`https://savunmasanayibulten.onrender.com/api/companies?country=${countryName}`)
      .then(res => setCompanies(res.data));
  }, [countryName]);

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Ana Sayfa</Link> &gt; <span className="active">{countryName}</span>
      </div>
      <h2 className="section-title">{countryName} SAVUNMA SANAYİ ŞİRKETLERİ</h2>
      <div className="grid">
        {companies.map((company, index) => (
          <Link to={`/company/${company}`} key={index} className="nav-card">
            <div className="nav-card-body">
              <h1>🏭</h1>
              <h3>{company}</h3>
              <p>Teknolojileri İncele &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- 4. BİLEŞEN: ÜRÜN LİSTESİ VE KIYASLAMA ---
const ProductList = () => {
  const { companyName } = useParams();
  const [weapons, setWeapons] = useState([]);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    axios.get(`https://savunmasanayibulten.onrender.com/api/products?manufacturer=${companyName}`)
      .then(res => setWeapons(res.data));
  }, [companyName]);

  const addToCompare = (weapon) => {
    if (compareList.find(w => w._id === weapon._id)) return;
    if (compareList.length >= 3) alert("En fazla 3 sistem kıyaslanabilir!");
    else setCompareList([...compareList, weapon]);
  };

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter(w => w._id !== id));
  };

  const chartData = {
    labels: ['Ateş Gücü', 'Hareket', 'Teknoloji', 'Menzil', 'Maliyet'],
    datasets: compareList.map((w, index) => ({
      label: w.name,
      data: [w.stats.firepower, w.stats.mobility, w.stats.tech, w.stats.range, w.stats.cost],
      backgroundColor: `rgba(${index===0?'16, 185, 129':index===1?'59, 130, 246':'239, 68, 68'}, 0.2)`,
      borderColor: index===0?'#10b981':index===1?'#3b82f6':'#ef4444',
      borderWidth: 2,
    })),
  };

  return (
    <div className="page-container">
       <div className="breadcrumb">
        <Link to="/">Ana Sayfa</Link> &gt; <Link to="#" onClick={() => window.history.back()}>Şirketler</Link> &gt; <span className="active">{companyName}</span>
      </div>
      <h2 className="section-title">{companyName} ENVANTERİ</h2>
      
      <div className="grid">
        {weapons.map(weapon => (
          <div key={weapon._id} className="card">
            <img src={weapon.image} alt={weapon.name} />
            <div className="card-body">
              <h3>{weapon.name}</h3>
              <span className="badge">{weapon.type}</span>
              <p className="desc">{weapon.description}</p>
              <div className="specs">
                <p>🚀 Hız: {weapon.specs.speed}</p>
                <p>📡 Menzil: {weapon.specs.range}</p>
              </div>
              <button className="btn" onClick={() => addToCompare(weapon)}>KIYASLA (+ VS)</button>
            </div>
          </div>
        ))}
      </div>

      {/* KIYASLAMA PANELİ */}
      {compareList.length > 0 && (
        <div className="comparison-panel">
          <div className="compare-list">
            {compareList.map(item => (
               <div key={item._id} className="compare-item">
                 <h4>{item.name}</h4>
                 <button className="btn-danger" onClick={() => removeFromCompare(item._id)}>X</button>
               </div>
            ))}
          </div>
          <div className="chart-container">
            <Radar data={chartData} options={{ scales: { r: { min: 0, max: 100, grid: { color: '#334155' } } } }} />
          </div>
        </div>
      )}
    </div>
  );
};

// --- ANA UYGULAMA YAPISI ---
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        {/* 1. En Tepe: Kayan Haber Bandı */}
        <NewsTicker /> 
        
        {/* 2. Sağ Alt: Yapay Zeka Chatbot */}
        <Chatbot />

        <div className="container">
          {/* 3. Header */}
          <header className="header">
            <Link to="/" style={{textDecoration:'none'}}>
              <h1 className="title">DEFENSE TECH MONITOR</h1>
            </Link>
            <p>Küresel Savunma Sanayi & Teknoloji Kataloğu</p>
          </header>

          {/* 4. Sayfa Yönlendirmeleri */}
          <Routes>
            <Route path="/" element={<CountrySelect />} />
            <Route path="/country/:countryName" element={<CompanySelect />} />
            <Route path="/company/:companyName" element={<ProductList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;