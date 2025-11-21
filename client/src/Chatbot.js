import React, { useState } from 'react';
import './App.css'; // Stilleri buradan alacak

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Merhaba Komutanım! Envanter hakkında bana soru sorabilirsiniz.", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  // Basit "Kural Tabanlı" AI Simülasyonu
  // (Gerçek projede burayı OpenAI API'ye bağlarız)
  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Kullanıcı mesajını ekle
    const userMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);

    // 2. Botun cevabını hazırla (Basit Anahtar Kelime Analizi)
    let botResponse = "Bu konuda veri tabanımda bilgi bulunamadı.";
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("hız") || lowerInput.includes("kaç basar")) {
      botResponse = "Sistemlerimizdeki hava araçları Mach 2.0 hıza, kara araçları ise 70 km/s hıza kadar çıkabilmektedir. Detay için aracı seçiniz.";
    } else if (lowerInput.includes("baykar") || lowerInput.includes("tb2")) {
      botResponse = "Bayraktar TB2, 27 saat havada kalabilen ve 4 lazer güdümlü mühimmat taşıyan taktik SİHA'dır. İhracat rekoru kırmıştır.";
    } else if (lowerInput.includes("kaan")) {
      botResponse = "KAAN, Tusaş tarafından geliştirilen 5. nesil milli muharip uçağımızdır. Radar görünmezliği ve süpersonik seyir özelliğine sahiptir.";
    } else if (lowerInput.includes("tank") || lowerInput.includes("altay")) {
      botResponse = "Altay Tankı, 120mm topa ve yeni nesil kompozit zırha sahip ana muharebe tankımızdır.";
    } else if (lowerInput.includes("merhaba") || lowerInput.includes("selam")) {
      botResponse = "Emredin komutanım! İstihbarat verilerine erişimim tam. Ne öğrenmek istersiniz?";
    }

    // 3. Bot mesajını biraz gecikmeli ekle (Gerçekçilik için)
    setTimeout(() => {
      setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
    }, 800);

    setInput("");
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat İkonu */}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬 AI ASİSTAN
        </button>
      )}

      {/* Chat Penceresi */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>🛡️ SAVUNMA ZEKASI</span>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Soru sor (Örn: KAAN nedir?)"
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;