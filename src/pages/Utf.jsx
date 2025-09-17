import React, { useState } from 'react';

const processOptions = [
  'Genel İşlem',
  'CDT1 1. Yön',
  'CDT2 2. Yön',
  'Delik Açma',
  'ABS',
  'Balans',
  'Fellow'
];

const foremanOptions = [
  'Mehmet Yılmaz',
  'Ayşe Demir',
  'Ali Kaya'
];

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const Utf = () => {
  // CSV indirme yardımcı fonksiyonu
  function downloadCSV(data, columns, filename) {
    if (!data.length) return;
    const header = columns.join(',');
    const rows = data.map(row => columns.map(col => `"${row[col] ?? ''}"`).join(','));
    const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const [activeTab, setActiveTab] = useState('uretim');
  
  // Üretim
  const [form, setForm] = useState({
    date: getYesterday(), 
    shift: '', 
    operator: '', 
    employee: '', 
    foreman: '', 
    process: '', 
    productCode: '', 
    quantity: '', 
    hatNo: '',
    pause_baslangic: '',
    pause_bitis: '',
    pause_dokum: '',
    pause_ayar: '',
    pause_ariza: '',
    pause_elmas: '',
    pause_temizlik: '15',
    pause_mola: '30',
    pause_operasyon: ''
  });
  
  const shiftMap = { '1': '00-08', '2': '08-16', '3': '16-00' };
  const [records, setRecords] = useState([]);
  
  // Paketleme
  const [packForm, setPackForm] = useState({ date: getYesterday(), productCode: '', quantity: '' });
  const [packRecords, setPackRecords] = useState([]);
  
  // Fire
  const [fireForm, setFireForm] = useState({ date: getYesterday(), productCode: '', quantity: '', errorType: '' });
  const [fireRecords, setFireRecords] = useState([]);
  
  // Gün raporu
  const [gunRaporu, setGunRaporu] = useState([]);
  const [yKapamaVeri] = useState([]);
  
  // Fire formu
  const handleFireChange = (e) => setFireForm({ ...fireForm, [e.target.name]: e.target.value });
  const handleFireSubmit = (e) => {
    e.preventDefault();
    setFireRecords([...fireRecords, fireForm]);
    setFireForm({ date: getYesterday(), productCode: '', quantity: '', errorType: '' });
  };

  // Üretim formu
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    
    // Vardiya otomatik ayarlama
    if (name === 'pause_baslangic' || name === 'pause_bitis') {
      const baslangic = name === 'pause_baslangic' ? value : form.pause_baslangic;
      const bitis = name === 'pause_bitis' ? value : form.pause_bitis;
      
      if (baslangic && bitis) {
        const baslangicHour = parseInt(baslangic.split(':')[0]);
        // const bitisHour = parseInt(bitis.split(':')[0]); // Şu an kullanılmıyor
        
        // Vardiya belirleme mantığı
        let shift = '';
        if (baslangicHour >= 0 && baslangicHour < 8) {
          shift = '1'; // 00-08
        } else if (baslangicHour >= 8 && baslangicHour < 16) {
          shift = '2'; // 08-16
        } else {
          shift = '3'; // 16-00
        }
        
        newForm.shift = shift;
      }
    }
    
    setForm(newForm);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Duraksamalarda boş değerleri 0 yap
    const formData = {
      ...form,
      pause_dokum: form.pause_dokum || '0',
      pause_ayar: form.pause_ayar || '0',
      pause_ariza: form.pause_ariza || '0',
      pause_elmas: form.pause_elmas || '0',
      pause_temizlik: form.pause_temizlik || '15',
      pause_mola: form.pause_mola || '30',
      pause_operasyon: form.pause_operasyon || '0'
    };
    
    setRecords([...records, formData]);
    setForm({ 
      date: getYesterday(), 
      shift: '', 
      operator: '', 
      employee: '', 
      foreman: '', 
      process: '', 
      productCode: '', 
      quantity: '', 
      hatNo: '',
      pause_baslangic: '',
      pause_bitis: '',
      pause_dokum: '',
      pause_ayar: '',
      pause_ariza: '',
      pause_elmas: '',
      pause_temizlik: '15',
      pause_mola: '30',
      pause_operasyon: ''
    });
  };
  
  // Paketleme formu
  const handlePackChange = (e) => setPackForm({ ...packForm, [e.target.name]: e.target.value });
  const handlePackSubmit = (e) => {
    e.preventDefault();
    setPackRecords([...packRecords, packForm]);
    setPackForm({ date: getYesterday(), productCode: '', quantity: '' });
  };
  
  const [uretimFilter, setUretimFilter] = useState({});
  // Gelecekte kullanılacak filtreler
  // const [paketlemeFilter, setPaketlemeFilter] = useState({});
  // const [fireFilter, setFireFilter] = useState({});
  // const [gunRaporuFilter, setGunRaporuFilter] = useState({});
  // const [yKapamaFilter, setYKapamaFilter] = useState({});

  function getUniqueValues(arr, key) {
    return Array.from(new Set(arr.map(item => item[key]).filter(Boolean)));
  }

  // Rapor güncelleme fonksiyonu
  const handleGunRaporuRefresh = () => {
    // Ürün bazında verileri grupla
    const productMap = new Map();
    
    // Üretim verilerini ekle
    records.forEach(record => {
      const key = record.productCode;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productCode: key,
          uretimAdet: 0,
          paketlemeAdet: 0,
          errorTypeCount: 0,
          dokumHatasiCount: 0
        });
      }
      const product = productMap.get(key);
      product.uretimAdet += parseInt(record.quantity) || 0;
    });
    
    // Paketleme verilerini ekle
    packRecords.forEach(record => {
      const key = record.productCode;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productCode: key,
          uretimAdet: 0,
          paketlemeAdet: 0,
          errorTypeCount: 0,
          dokumHatasiCount: 0
        });
      }
      const product = productMap.get(key);
      product.paketlemeAdet += parseInt(record.quantity) || 0;
    });
    
    // Fire verilerini ekle
    fireRecords.forEach(record => {
      const key = record.productCode;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productCode: key,
          uretimAdet: 0,
          paketlemeAdet: 0,
          errorTypeCount: 0,
          dokumHatasiCount: 0
        });
      }
      const product = productMap.get(key);
      product.errorTypeCount += parseInt(record.quantity) || 0;
      
      // Dokum hatası sayısını ayrıca say
      if (record.errorType === 'Dokum Hatası') {
        product.dokumHatasiCount += parseInt(record.quantity) || 0;
      }
    });
    
    // Map'i array'e çevir
    const raporData = Array.from(productMap.values());
    setGunRaporu(raporData);
  };
  
  // Y Kapama güncelleme fonksiyonu (gelecekte kullanılacak)
  const handleYKapamaRefresh = () => {
    // Şimdilik boş, gelecekte Y kapama verilerini ekleyebiliriz
  };

  return (
    <div className="section" style={{ minHeight: '100vh', background: 'var(--background-light)' }}>
      <div style={{
        background: 'var(--bg-light)',
        color: 'var(--text-light)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        margin: '2rem auto',
        fontSize: '1.05rem',
        maxWidth: '600px'
      }}>
        <strong>Not:</strong> Bu sayfa, <b>Üretim Takip Otomasyonu</b> projesinin bir prototipidir. <a href="https://github.com/arifkrc/TakipUI" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 500 }}>Ana projeye göz atmak için tıklayın</a>.
      </div>
      <div className="container" style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary-color)', textAlign: 'center' }}>Takip Formları</h2>
          <button
            type="button"
            style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.10)' }}
            onClick={() => {
              downloadCSV(records, ['date','shift','operator','employee','foreman','process','productCode','quantity','pause_baslangic','pause_bitis','pause_dokum','pause_ayar','pause_ariza','pause_elmas','pause_temizlik','pause_mola','pause_operasyon'], 'uretim_listesi.csv');
              // Gelecekte kullanılacak
              // downloadCSV(packRecords, ['date','productCode','quantity'], 'paketleme_listesi.csv');
              // downloadCSV(fireRecords, ['date','productCode','quantity','errorType'], 'fire_listesi.csv');
              // downloadCSV(gunRaporu, ['productCode','uretimAdet','paketlemeAdet','errorTypeCount','dokumHatasiCount'], 'gun_raporu.csv');
              // downloadCSV(yKapamaVeri, ['date','shift','productCode','operator','process','quantity'], 'y_kapama_listesi.csv');
            }}
          >Bütün Listeleri İndir</button>
        </div>
        
        {/* Sekmeler */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <button onClick={() => setActiveTab('uretim')} style={{
            padding: '10px 32px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'uretim' ? 'var(--secondary-color)' : '#e5e7eb',
            color: activeTab === 'uretim' ? 'white' : 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'uretim' ? '0 4px 16px rgba(59,130,246,0.10)' : 'none',
            transition: 'all 0.2s'
          }}>Üretim</button>
          <button onClick={() => setActiveTab('paketleme')} style={{
            padding: '10px 32px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'paketleme' ? 'var(--secondary-color)' : '#e5e7eb',
            color: activeTab === 'paketleme' ? 'white' : 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'paketleme' ? '0 4px 16px rgba(59,130,246,0.10)' : 'none',
            transition: 'all 0.2s'
          }}>Paketleme</button>
          <button onClick={() => setActiveTab('fire')} style={{
            padding: '10px 32px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'fire' ? 'var(--secondary-color)' : '#e5e7eb',
            color: activeTab === 'fire' ? 'white' : 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'fire' ? '0 4px 16px rgba(59,130,246,0.10)' : 'none',
            transition: 'all 0.2s'
          }}>Fire</button>
          <button onClick={() => setActiveTab('rapor')} style={{
            padding: '10px 32px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'rapor' ? 'var(--secondary-color)' : '#e5e7eb',
            color: activeTab === 'rapor' ? 'white' : 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'rapor' ? '0 4px 16px rgba(59,130,246,0.10)' : 'none',
            transition: 'all 0.2s'
          }}>Gün Raporu</button>
          <button onClick={() => setActiveTab('ykapama')} style={{
            padding: '10px 32px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'ykapama' ? 'var(--secondary-color)' : '#e5e7eb',
            color: activeTab === 'ykapama' ? 'white' : 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'ykapama' ? '0 4px 16px rgba(59,130,246,0.10)' : 'none',
            transition: 'all 0.2s'
          }}>Y Kapama Listesi</button>
        </div>

        {/* Üretim Sekmesi */}
        {activeTab === 'uretim' && (
          <>
            {/* Form üstte yatay */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              padding: '2.5rem',
              marginBottom: '2rem',
              maxWidth: '1400px',
              margin: '0 auto 2rem auto',
              border: '1px solid #f3f4f6'
            }}>
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}>
                {/* İlk satır - Temel bilgiler */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.5rem' }}>
                  <div>
                     <label htmlFor="date" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Tarih</label>
                     <input type="date" id="date" name="date" value={form.date} onChange={handleChange} style={{
                       width: '100%',
                       padding: '12px 16px',
                       borderRadius: '8px',
                       border: '1px solid #e1e5e9',
                       fontSize: '0.95rem',
                       marginTop: '0.5rem',
                       background: '#ffffff',
                       transition: 'all 0.2s ease',
                       boxSizing: 'border-box'
                     }} />
                  </div>
                  <div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                       <span style={{ color: '#374151', fontWeight: 500, fontSize: '0.9rem' }}>
                         Vardiya: {form.shift ? form.shift : '-'}
                       </span>
                       <span style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.85rem' }}>
                         {shiftMap[form.shift] ? `(${shiftMap[form.shift]})` : ''}
                      </span>
                    </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                       <input type="time" name="pause_baslangic" value={form.pause_baslangic || ''} onChange={handleChange} style={{
                         width: '100%',
                         padding: '8px 12px',
                         borderRadius: '6px',
                         border: '1px solid #e1e5e9',
                         fontSize: '0.85rem',
                         background: '#ffffff',
                         transition: 'all 0.2s ease',
                         boxSizing: 'border-box'
                       }} step="60" placeholder="Başlangıç" />
                       <input type="time" name="pause_bitis" value={form.pause_bitis || ''} onChange={handleChange} style={{
                         width: '100%',
                         padding: '8px 12px',
                         borderRadius: '6px',
                         border: '1px solid #e1e5e9',
                         fontSize: '0.85rem',
                         background: '#ffffff',
                         transition: 'all 0.2s ease',
                         boxSizing: 'border-box'
                       }} step="60" placeholder="Bitiş" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="operator" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Operatör</label>
                    <input type="text" id="operator" name="operator" value={form.operator} onChange={handleChange} style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }} placeholder="Operatör adı (opsiyonel)" />
                  </div>
                  <div>
                    <label htmlFor="employee" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Çalışan Adı</label>
                    <input type="text" id="employee" name="employee" value={form.employee} onChange={handleChange} style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }} placeholder="Çalışan adı (opsiyonel)" />
                  </div>
                  <div>
                    <label htmlFor="foreman" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Ustabaşı Adı</label>
                    <select id="foreman" name="foreman" value={form.foreman} onChange={handleChange} style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}>
                      <option value="">Seçiniz</option>
                      {foremanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="process" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Yapılan İşlem</label>
                    <select id="process" name="process" value={form.process} onChange={handleChange} style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}>
                      <option value="">Seçiniz</option>
                      {processOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                
                                                                   {/* İkinci satır - Ürün bilgileri */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div>
                       <label htmlFor="productCode" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Ürün Kodu</label>
                       <input type="text" id="productCode" name="productCode" value={form.productCode} onChange={handleChange} style={{
                         width: '100%',
                         padding: '12px 16px',
                         borderRadius: '8px',
                         border: '1px solid #e1e5e9',
                         fontSize: '0.95rem',
                         marginTop: '0.5rem',
                         background: '#ffffff',
                         transition: 'all 0.2s ease',
                         boxSizing: 'border-box'
                       }} placeholder="Ürün kodu" />
                  </div>
                  <div>
                       <label htmlFor="hatNo" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Hat No</label>
                       <input type="text" id="hatNo" name="hatNo" value={form.hatNo} onChange={handleChange} style={{
                         width: '100%',
                         padding: '12px 16px',
                         borderRadius: '8px',
                         border: '1px solid #e1e5e9',
                         fontSize: '0.95rem',
                         marginTop: '0.5rem',
                         background: '#ffffff',
                         transition: 'all 0.2s ease',
                         boxSizing: 'border-box'
                       }} placeholder="Hat numarası" />
                  </div>
                  <div>
                       <label htmlFor="quantity" style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' }}>Üretim Adedi</label>
                       <input type="number" id="quantity" name="quantity" value={form.quantity} onChange={handleChange} min={0} style={{
                         width: '100%',
                         padding: '12px 16px',
                         borderRadius: '8px',
                         border: '1px solid #e1e5e9',
                         fontSize: '0.95rem',
                         marginTop: '0.5rem',
                         background: '#ffffff',
                         transition: 'all 0.2s ease',
                         boxSizing: 'border-box'
                       }} placeholder="0" />
                  </div>
                </div>

                {/* Üçüncü satır - Duraksamalar */}
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '1rem', display: 'block' }}>Duraksamalar (dk)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Dokum Hatası</span>
                      <input type="number" name="pause_dokum" value={form.pause_dokum || ''} onChange={e => setForm({ ...form, pause_dokum: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="0" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tezgah Ayarı</span>
                      <input type="number" name="pause_ayar" value={form.pause_ayar || ''} onChange={e => setForm({ ...form, pause_ayar: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="0" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tezgah Arızası</span>
                      <input type="number" name="pause_ariza" value={form.pause_ariza || ''} onChange={e => setForm({ ...form, pause_ariza: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="0" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Elmas Değişimi</span>
                      <input type="number" name="pause_elmas" value={form.pause_elmas || ''} onChange={e => setForm({ ...form, pause_elmas: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="0" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Temizlik</span>
                      <input type="number" name="pause_temizlik" value={form.pause_temizlik || 15} onChange={e => setForm({ ...form, pause_temizlik: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="15" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Mola</span>
                      <input type="number" name="pause_mola" value={form.pause_mola || 30} onChange={e => setForm({ ...form, pause_mola: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="30" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Operasyon Süresi</span>
                      <input type="number" name="pause_operasyon" value={form.pause_operasyon || ''} onChange={e => setForm({ ...form, pause_operasyon: e.target.value })} min={0} style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }} placeholder="0" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end' }}>
                <button type="submit" style={{
                  background: 'var(--secondary-color)',
                  color: 'white',
                  fontWeight: 600,
                        fontSize: '1rem',
                  border: 'none',
                        borderRadius: '12px',
                        padding: '14px 24px',
                  cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        height: '48px'
                }}>Ekle</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Liste aşağıda */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Üretim Kayıtları</h3>
                <button type="button" style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease'
                }}
                    onClick={() => downloadCSV(records, ['date','shift','operator','employee','foreman','process','productCode','hatNo','quantity','pause_baslangic','pause_bitis','pause_dokum','pause_ayar','pause_ariza','pause_elmas','pause_temizlik','pause_mola','pause_operasyon'], 'uretim_listesi.csv')}>CSV olarak indir</button>
                </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => setUretimFilter({})} style={{ 
                  padding: '6px 16px', 
                  borderRadius: '6px', 
                  background: '#f3f4f6', 
                  border: '1px solid #e5e7eb', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}>Filtreyi Sıfırla</button>
                </div>
                <table
                  id="excel-table"
                  style={{
                    width: '100%',
                    background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    fontSize: '0.95rem',
                    userSelect: 'none',
                  cursor: 'pointer',
                  border: '1px solid #f3f4f6'
                  }}
                >
                  <thead style={{ background: 'var(--background-light)' }}>
                    <tr>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Tarih</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Vardiya</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Operatör</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Çalışan</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Ustabaşı</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>İşlem</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Ürün Kodu</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Hat No</th>
                    <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Adet</th>
                                         <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>DH</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>TA</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>TAr</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>ED</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>T</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>M</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>OS</th>
                                         <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Başlangıç</th>
                     <th style={{ padding: '8px 6px', background: 'var(--background-light)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid #eee' }}>Bitiş</th>
                    </tr>
                    <tr>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.date || ''} onChange={e => setUretimFilter(f => ({ ...f, date: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'date').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.shift || ''} onChange={e => setUretimFilter(f => ({ ...f, shift: e.target.value }))}>
                          <option value=''>Tümü</option>
                         {getUniqueValues(records, 'shift').map((v, i) => <option key={i} value={v}>{shiftMap[v] || v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.operator || ''} onChange={e => setUretimFilter(f => ({ ...f, operator: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'operator').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.employee || ''} onChange={e => setUretimFilter(f => ({ ...f, employee: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'employee').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.foreman || ''} onChange={e => setUretimFilter(f => ({ ...f, foreman: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'foreman').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.process || ''} onChange={e => setUretimFilter(f => ({ ...f, process: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'process').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.productCode || ''} onChange={e => setUretimFilter(f => ({ ...f, productCode: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'productCode').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.hatNo || ''} onChange={e => setUretimFilter(f => ({ ...f, hatNo: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'hatNo').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                      <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.quantity || ''} onChange={e => setUretimFilter(f => ({ ...f, quantity: e.target.value }))}>
                          <option value=''>Tümü</option>
                          {getUniqueValues(records, 'quantity').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_dokum || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_dokum: e.target.value }))}>
                          <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_dokum').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                      <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_ayar || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_ayar: e.target.value }))}>
                          <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_ayar').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_ariza || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_ariza: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_ariza').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_elmas || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_elmas: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_elmas').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_temizlik || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_temizlik: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_temizlik').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_mola || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_mola: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_mola').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_operasyon || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_operasyon: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_operasyon').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                                         <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_baslangic || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_baslangic: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_baslangic').map((v, i) => <option key={i} value={v}>{v}</option>)}
                       </select>
                     </th>
                     <th>
                       <select style={{ width: '90%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} value={uretimFilter.pause_bitis || ''} onChange={e => setUretimFilter(f => ({ ...f, pause_bitis: e.target.value }))}>
                         <option value=''>Tümü</option>
                         {getUniqueValues(records, 'pause_bitis').map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </select>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.filter(rec =>
                      (!uretimFilter.date || rec.date === uretimFilter.date) &&
                      (!uretimFilter.shift || rec.shift === uretimFilter.shift) &&
                      (!uretimFilter.operator || rec.operator === uretimFilter.operator) &&
                      (!uretimFilter.employee || rec.employee === uretimFilter.employee) &&
                      (!uretimFilter.foreman || rec.foreman === uretimFilter.foreman) &&
                      (!uretimFilter.process || rec.process === uretimFilter.process) &&
                      (!uretimFilter.productCode || rec.productCode === uretimFilter.productCode) &&
                      (!uretimFilter.quantity || String(rec.quantity) === String(uretimFilter.quantity)) &&
                    (!uretimFilter.pause_dokum || rec.pause_dokum === uretimFilter.pause_dokum) &&
                    (!uretimFilter.pause_ayar || rec.pause_ayar === uretimFilter.pause_ayar) &&
                    (!uretimFilter.pause_ariza || rec.pause_ariza === uretimFilter.pause_ariza) &&
                    (!uretimFilter.pause_elmas || rec.pause_elmas === uretimFilter.pause_elmas) &&
                    (!uretimFilter.pause_temizlik || rec.pause_temizlik === uretimFilter.pause_temizlik) &&
                    (!uretimFilter.pause_mola || rec.pause_mola === uretimFilter.pause_mola) &&
                                         (!uretimFilter.pause_operasyon || rec.pause_operasyon === uretimFilter.pause_operasyon) &&
                     (!uretimFilter.pause_baslangic || rec.pause_baslangic === uretimFilter.pause_baslangic) &&
                     (!uretimFilter.pause_bitis || rec.pause_bitis === uretimFilter.pause_bitis)
                    ).length === 0 ? (
                                         <tr><td colSpan={18} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px', fontSize: '1rem' }}>Kayıt yok</td></tr>
                    ) : (
                      records.filter(rec =>
                        (!uretimFilter.date || rec.date === uretimFilter.date) &&
                        (!uretimFilter.shift || rec.shift === uretimFilter.shift) &&
                        (!uretimFilter.operator || rec.operator === uretimFilter.operator) &&
                        (!uretimFilter.employee || rec.employee === uretimFilter.employee) &&
                        (!uretimFilter.foreman || rec.foreman === uretimFilter.foreman) &&
                        (!uretimFilter.process || rec.process === uretimFilter.process) &&
                        (!uretimFilter.productCode || rec.productCode === uretimFilter.productCode) &&
                        (!uretimFilter.hatNo || rec.hatNo === uretimFilter.hatNo) &&
                        (!uretimFilter.quantity || String(rec.quantity) === String(uretimFilter.quantity)) &&
                      (!uretimFilter.pause_dokum || rec.pause_dokum === uretimFilter.pause_dokum) &&
                      (!uretimFilter.pause_ayar || rec.pause_ayar === uretimFilter.pause_ayar) &&
                      (!uretimFilter.pause_ariza || rec.pause_ariza === uretimFilter.pause_ariza) &&
                      (!uretimFilter.pause_elmas || rec.pause_elmas === uretimFilter.pause_elmas) &&
                      (!uretimFilter.pause_temizlik || rec.pause_temizlik === uretimFilter.pause_temizlik) &&
                      (!uretimFilter.pause_mola || rec.pause_mola === uretimFilter.pause_mola) &&
                      (!uretimFilter.pause_operasyon || rec.pause_operasyon === uretimFilter.pause_operasyon) &&
                      (!uretimFilter.pause_baslangic || rec.pause_baslangic === uretimFilter.pause_baslangic) &&
                      (!uretimFilter.pause_bitis || rec.pause_bitis === uretimFilter.pause_bitis)
                      ).map((rec, rowIdx) => (
                                             <tr key={rowIdx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.date}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{shiftMap[rec.shift] || rec.shift}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.operator}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.employee}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.foreman}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.process}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.productCode}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.hatNo}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.quantity}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_dokum || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_ayar || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_ariza || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_elmas || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_temizlik || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_mola || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_operasyon || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_baslangic || '-'}</td>
                         <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.pause_bitis || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
            </div>
          </>
        )}

        {/* Paketleme Sekmesi */}
        {activeTab === 'paketleme' && (
          <>
            {/* Form üstte */}
            <div style={{
              background: 'var(--background-gray)',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: '2.5rem',
              marginBottom: '2rem',
              maxWidth: '1400px',
              margin: '0 auto 2rem auto',
              border: '1px solid var(--border-color)'
            }}>
              <form onSubmit={handlePackSubmit} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem'
              }}>
                <div>
                  <label htmlFor="packDate" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Tarih</label>
                  <input type="date" id="packDate" name="date" value={packForm.date} onChange={handlePackChange} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} />
                </div>
                <div>
                  <label htmlFor="packProductCode" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Ürün Kodu</label>
                  <input type="text" id="packProductCode" name="productCode" value={packForm.productCode} onChange={handlePackChange} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} placeholder="Ürün kodu" />
                </div>
                <div>
                  <label htmlFor="packQuantity" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Paketleme Adedi</label>
                  <input type="number" id="packQuantity" name="quantity" value={packForm.quantity} onChange={handlePackChange} min={0} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} placeholder="0" />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center' }}>
              <button type="submit" style={{
                background: 'var(--secondary-color)',
                color: 'white',
                fontWeight: 600,
                    fontSize: '1rem',
                border: 'none',
                    borderRadius: '12px',
                    padding: '14px 32px',
                cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
                    transition: 'all 0.2s ease'
                  }}>Paketleme Ekle</button>
                </div>
            </form>
            </div>

            {/* Liste aşağıda */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Paketleme Kayıtları</h3>
                <button type="button" style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => downloadCSV(packRecords, ['date','productCode','quantity'], 'paketleme_listesi.csv')}>CSV olarak indir</button>
              </div>
              <table style={{
                width: '100%',
                background: 'var(--background-light)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                fontSize: '0.95rem',
                border: '1px solid var(--border-color)'
              }}>
                <thead style={{ background: 'var(--background-gray)' }}>
                  <tr>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Tarih</th>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Ürün Kodu</th>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Paketleme Adedi</th>
                  </tr>
                </thead>
                <tbody>
                  {packRecords.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontSize: '1rem' }}>Kayıt yok</td></tr>
                  ) : (
                    packRecords.map((rec, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.date}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.productCode}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Fire Sekmesi */}
        {activeTab === 'fire' && (
          <>
            {/* Form üstte */}
            <div style={{
              background: 'var(--background-gray)',
              borderRadius: 20,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              padding: '2.5rem',
              marginBottom: '2rem',
              maxWidth: '1400px',
              margin: '0 auto 2rem auto',
              border: '1px solid var(--border-color)'
            }}>
              <form onSubmit={handleFireSubmit} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem'
              }}>
                <div>
                  <label htmlFor="fireDate" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Tarih</label>
                  <input type="date" id="fireDate" name="date" value={fireForm.date} onChange={handleFireChange} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} />
                </div>
                <div>
                  <label htmlFor="fireProductCode" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Ürün Kodu</label>
                  <input type="text" id="fireProductCode" name="productCode" value={fireForm.productCode} onChange={handleFireChange} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} placeholder="Ürün kodu" />
                </div>
                <div>
                  <label htmlFor="fireQuantity" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Fire Adedi</label>
                  <input type="number" id="fireQuantity" name="quantity" value={fireForm.quantity} onChange={handleFireChange} min={0} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }} placeholder="0" />
                </div>
                <div>
                  <label htmlFor="fireErrorType" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '0.25rem', display: 'block' }}>Hata Türü</label>
                  <select id="fireErrorType" name="errorType" value={fireForm.errorType} onChange={handleFireChange} style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    background: 'var(--background-light)',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}>
                    <option value="">Seçiniz</option>
                    <option value="Dokum Hatası">Dokum Hatası</option>
                    <option value="Kalite Hatası">Kalite Hatası</option>
                    <option value="Boyut Hatası">Boyut Hatası</option>
                    <option value="Renk Hatası">Renk Hatası</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'center' }}>
                  <button type="submit" style={{
                    background: 'var(--secondary-color)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 32px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.15)',
                    transition: 'all 0.2s ease'
                  }}>Fire Ekle</button>
                </div>
              </form>
            </div>

            {/* Liste aşağıda */}
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Fire Kayıtları</h3>
                <button type="button" style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease'
                }}
                  onClick={() => downloadCSV(fireRecords, ['date','productCode','quantity','errorType'], 'fire_listesi.csv')}>CSV olarak indir</button>
              </div>
              <table style={{
                width: '100%',
                background: 'var(--background-light)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                fontSize: '0.95rem',
                border: '1px solid var(--border-color)'
              }}>
                <thead style={{ background: 'var(--background-gray)' }}>
                  <tr>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Tarih</th>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Ürün Kodu</th>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Fire Adedi</th>
                    <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Hata Türü</th>
                  </tr>
                </thead>
                <tbody>
                  {fireRecords.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontSize: '1rem' }}>Kayıt yok</td></tr>
                  ) : (
                    fireRecords.map((rec, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.date}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.productCode}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.errorType}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Gün Raporu Sekmesi */}
        {activeTab === 'rapor' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Günlük Rapor</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" style={{ 
                  background: 'var(--accent-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
                  transition: 'all 0.2s ease'
                }}
                  onClick={handleGunRaporuRefresh}>Raporu Güncelle</button>
                <button type="button" style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => downloadCSV(gunRaporu, ['productCode','uretimAdet','paketlemeAdet','errorTypeCount','dokumHatasiCount'], 'gun_raporu.csv')}>CSV olarak indir</button>
              </div>
            </div>
            <table style={{
              width: '100%',
              background: 'var(--background-light)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              fontSize: '0.95rem',
              border: '1px solid var(--border-color)'
            }}>
              <thead style={{ background: 'var(--background-gray)' }}>
                <tr>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Ürün Kodu</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Üretim Adedi</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Paketleme Adedi</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Fire Adedi</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Dokum Hatası</th>
                  </tr>
                </thead>
                <tbody>
                {gunRaporu.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontSize: '1rem' }}>Rapor verisi yok</td></tr>
                ) : (
                  gunRaporu.map((rec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.productCode}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.uretimAdet}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.paketlemeAdet}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.errorTypeCount}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.dokumHatasiCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        )}

        {/* Y Kapama Listesi Sekmesi */}
        {activeTab === 'ykapama' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Y Kapama Listesi</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" style={{ 
                  background: 'var(--accent-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
                  transition: 'all 0.2s ease'
                }}
                  onClick={handleYKapamaRefresh}>Listeyi Güncelle</button>
                <button type="button" style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '8px 20px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  fontSize: '0.95rem', 
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  transition: 'all 0.2s ease'
                }}
                  onClick={() => downloadCSV(yKapamaVeri, ['date','shift','productCode','operator','process','quantity'], 'y_kapama_listesi.csv')}>CSV olarak indir</button>
              </div>
                </div>
            <table style={{
              width: '100%',
              background: 'var(--background-light)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              fontSize: '0.95rem',
              border: '1px solid var(--border-color)'
            }}>
              <thead style={{ background: 'var(--background-gray)' }}>
                <tr>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Tarih</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Vardiya</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Ürün Kodu</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Operatör</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>İşlem</th>
                  <th style={{ padding: '12px', background: 'var(--background-gray)', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Adet</th>
                  </tr>
                </thead>
                <tbody>
                {yKapamaVeri.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px', fontSize: '1rem' }}>Y kapama verisi yok</td></tr>
                ) : (
                  yKapamaVeri.map((rec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.date}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.shift}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.productCode}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.operator}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.process}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-light)' }}>{rec.quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Utf;
