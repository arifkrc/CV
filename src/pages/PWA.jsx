import React, { useState, useEffect } from 'react';
import { Database, Send, Loader2, Plus, Trash2, Play, Pause, Square } from 'lucide-react';
import { usePageInit } from '../hooks';

const PWA = () => {
  usePageInit(); // Scroll to top on page load
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  // Timer state for tracking active timers
  const [activeTimers, setActiveTimers] = useState({});
  const [timerIntervals, setTimerIntervals] = useState({});
  
  const [formData, setFormData] = useState({
    tarih: '',
    operatorAdi: [''], // start with 1, max 3 names
    bolumSorumlusu: [''], // start with 1, max 2 names
    hatNo: '',
    tezgahNo: '',
    isBaslangicSaati: '',
    isBitisSaati: '',
    rows: [
      {
        id: 1,
        urunKodu: [''], // start with 1, max 6 codes
        urunAciklamasi: '', // from DB
        yapilanIslem: '',
        dokumHatasi: '',
        operatorHatasi: '',
        tezgahArizasi: '',
        tezgahAyari: '',
        elmasDegisimi: '',
        parcaBekleme: '',
        temizlik: ''
      }
    ]
  });

  // Yapılan İşlem options for combobox
  const yapilanIslemOptions = [
    'Üretim',
    'Kalite Kontrol',
    'Paketleme',
    'Bakım',
    'Ayar',
    'Temizlik',
    'Diğer'
  ];

  // Timer columns that can be tracked
  const timerColumns = ['tezgahAyari', 'tezgahArizasi', 'elmasDegisimi', 'parcaBekleme', 'temizlik'];

  // Timer utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerKey = (rowId, column) => `${rowId}-${column}`;

  const startTimer = (rowId, column) => {
    const timerKey = getTimerKey(rowId, column);
    
    // Stop any existing timer for this field
    if (timerIntervals[timerKey]) {
      clearInterval(timerIntervals[timerKey]);
    }

    // Initialize timer state
    setActiveTimers(prev => ({
      ...prev,
      [timerKey]: { startTime: Date.now(), seconds: 0, isRunning: true }
    }));

    // Start interval
    const intervalId = setInterval(() => {
      setActiveTimers(prev => ({
        ...prev,
        [timerKey]: {
          ...prev[timerKey],
          seconds: Math.floor((Date.now() - prev[timerKey].startTime) / 1000)
        }
      }));
    }, 1000);

    setTimerIntervals(prev => ({
      ...prev,
      [timerKey]: intervalId
    }));
  };

  const stopTimer = (rowId, column) => {
    const timerKey = getTimerKey(rowId, column);
    
    if (timerIntervals[timerKey]) {
      clearInterval(timerIntervals[timerKey]);
      setTimerIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[timerKey];
        return newIntervals;
      });
    }

    if (activeTimers[timerKey]) {
      const totalSeconds = activeTimers[timerKey].seconds;
      const timeString = formatTime(totalSeconds);
      
      // Update form data with the timer result
      setFormData(prev => ({
        ...prev,
        rows: prev.rows.map(row => 
          row.id === rowId 
            ? { ...row, [column]: timeString }
            : row
        )
      }));

      // Mark timer as stopped
      setActiveTimers(prev => ({
        ...prev,
        [timerKey]: { ...prev[timerKey], isRunning: false }
      }));
    }
  };

  const resetTimer = (rowId, column) => {
    const timerKey = getTimerKey(rowId, column);
    
    // Clear interval
    if (timerIntervals[timerKey]) {
      clearInterval(timerIntervals[timerKey]);
      setTimerIntervals(prev => {
        const newIntervals = { ...prev };
        delete newIntervals[timerKey];
        return newIntervals;
      });
    }

    // Clear timer state
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[timerKey];
      return newTimers;
    });

    // Clear form data
    setFormData(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? { ...row, [column]: '' }
          : row
      )
    }));
  };

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervals).forEach(intervalId => {
        clearInterval(intervalId);
      });
    };
  }, [timerIntervals]);

  // Mobile detection
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const addNewRow = () => {
    const newRow = {
      id: Date.now(),
      urunKodu: [''],
      urunAciklamasi: '',
      yapilanIslem: '',
      dokumHatasi: '',
      operatorHatasi: '',
      tezgahArizasi: '',
      tezgahAyari: '',
      elmasDegisimi: '',
      parcaBekleme: '',
      temizlik: ''
    };
    setFormData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const removeRow = (rowId) => {
    if (formData.rows.length > 1) {
      setFormData(prev => ({
        ...prev,
        rows: prev.rows.filter(row => row.id !== rowId)
      }));
    }
  };

  // Add input to array fields
  const addInput = (fieldName, maxCount, rowId = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (rowId !== null) {
        // Row-specific field (urunKodu)
        const rowIndex = newData.rows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1 && newData.rows[rowIndex][fieldName].length < maxCount) {
          newData.rows[rowIndex][fieldName].push('');
        }
      } else {
        // Top-level field (operatorAdi, bolumSorumlusu)
        if (newData[fieldName].length < maxCount) {
          newData[fieldName].push('');
        }
      }
      
      return newData;
    });
  };

  // Remove input from array fields
  const removeInput = (fieldName, index, rowId = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (rowId !== null) {
        // Row-specific field (urunKodu)
        const rowIndex = newData.rows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1 && newData.rows[rowIndex][fieldName].length > 1) {
          newData.rows[rowIndex][fieldName].splice(index, 1);
        }
      } else {
        // Top-level field (operatorAdi, bolumSorumlusu)
        if (newData[fieldName].length > 1) {
          newData[fieldName].splice(index, 1);
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Database connection logic will be implemented here
      // Form data processing will be added here
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Üretim takip verisi başarıyla kaydedildi!');
      
      // Reset form after successful submission
      setFormData({
        tarih: '',
        operatorAdi: [''],
        bolumSorumlusu: [''],
        hatNo: '',
        tezgahNo: '',
        isBaslangicSaati: '',
        isBitisSaati: '',
        rows: [{
          id: 1,
          urunKodu: [''],
          urunAciklamasi: '',
          yapilanIslem: '',
          dokumHatasi: '',
          operatorHatasi: '',
          tezgahArizasi: '',
          tezgahAyari: '',
          elmasDegisimi: '',
          parcaBekleme: '',
          temizlik: ''
        }]
      });
    } catch (error) {
      // Error handling will be implemented here
      alert('Kaydetme sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value, index = null, rowId = null, urunKoduIndex = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (rowId !== null) {
        // Row-specific field
        const rowIndex = newData.rows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
          if (field === 'urunKodu' && urunKoduIndex !== null) {
            newData.rows[rowIndex][field][urunKoduIndex] = value;
          } else {
            newData.rows[rowIndex][field] = value;
          }
        }
      } else if (index !== null) {
        // Array field (operatorAdi, bolumSorumlusu)
        newData[field][index] = value;
      } else {
        // Simple field
        newData[field] = value;
      }
      
      return newData;
    });
  };

  return (
    <div className="section">
      <div className="container">
        <h2 className={`section-title ${isVisible ? 'animate-fadeInUp' : ''}`}>
          <Database size={32} style={{ marginRight: '0.5rem' }} />
          Üretim Takip Sistemi
        </h2>
        
        <div className={`${isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div style={{
            maxWidth: '1400px',
            margin: '2rem auto',
            padding: '2rem',
            background: 'var(--background-light)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-color)'
          }}>
            <form onSubmit={handleSubmit}>
              
              {/* Constants Section - Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'var(--background-gray)',
                borderRadius: '8px',
                border: '2px solid var(--border-color)'
              }}>
                
                {/* Left Side - Date, Hat No, Tezgah No */}
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                    Genel Bilgiler
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Date */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        Tarih *
                      </label>
                      <input
                        type="date"
                        value={formData.tarih}
                        onChange={(e) => handleInputChange('tarih', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    {/* Hat No */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        Hat No *
                      </label>
                      <input
                        type="text"
                        value={formData.hatNo}
                        onChange={(e) => handleInputChange('hatNo', e.target.value)}
                        placeholder="Hat numarası"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>

                    {/* Tezgah No */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        Tezgah No *
                      </label>
                      <input
                        type="text"
                        value={formData.tezgahNo}
                        onChange={(e) => handleInputChange('tezgahNo', e.target.value)}
                        placeholder="Tezgah numarası"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side - Operator Adi, Bolum Sorumlusu */}
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                    Personel Bilgileri
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Operator Adi */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        Operator Adı (En fazla 3)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {formData.operatorAdi.map((name, index) => (
                          <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => handleInputChange('operatorAdi', e.target.value, index)}
                              placeholder={`${index + 1}. Operator`}
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                            {index === formData.operatorAdi.length - 1 && formData.operatorAdi.length < 3 && (
                              <button
                                type="button"
                                onClick={() => addInput('operatorAdi', 3)}
                                style={{
                                  width: '28px', height: '28px',
                                  background: 'var(--secondary-color)',
                                  color: 'white', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Operator Ekle"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                            {formData.operatorAdi.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInput('operatorAdi', index)}
                                style={{
                                  width: '28px', height: '28px',
                                  background: 'var(--accent-color)',
                                  color: 'white', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Operator Sil"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bolum Sorumlusu */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                        Bölüm Sorumlusu (En fazla 2)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {formData.bolumSorumlusu.map((name, index) => (
                          <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => handleInputChange('bolumSorumlusu', e.target.value, index)}
                              placeholder={`${index + 1}. Bölüm Sorumlusu`}
                              style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                            {index === formData.bolumSorumlusu.length - 1 && formData.bolumSorumlusu.length < 2 && (
                              <button
                                type="button"
                                onClick={() => addInput('bolumSorumlusu', 2)}
                                style={{
                                  width: '28px', height: '28px',
                                  background: 'var(--secondary-color)',
                                  color: 'white', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            )}
                            {formData.bolumSorumlusu.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInput('bolumSorumlusu', index)}
                                style={{
                                  width: '28px', height: '28px',
                                  background: 'var(--accent-color)',
                                  color: 'white', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Details - Mobile vs Desktop */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-color)' }}>Üretim Detayları</h3>
                
                {isMobile ? (
                  /* Mobile Card Layout */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formData.rows.map((row, rowIndex) => (
                      <div key={row.id} style={{
                        background: 'var(--background-light)',
                        border: '2px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {/* Card Header */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '1rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                            Satır {rowIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            disabled={formData.rows.length <= 1}
                            title={formData.rows.length <= 1 ? "En az 1 satır gerekli" : "Satırı Sil"}
                            style={{
                              width: '40px',
                              height: '40px',
                              background: formData.rows.length <= 1 ? '#ccc' : 'var(--accent-color)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: formData.rows.length <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: formData.rows.length <= 1 ? 0.5 : 1
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Mobile Form Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          
                          {/* Ürün Kodu */}
                          <div>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '0.5rem', 
                              fontWeight: '600', 
                              color: 'var(--text-dark)',
                              fontSize: '0.9rem'
                            }}>
                              Ürün Kodu (En fazla 6)
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {row.urunKodu.map((kod, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    value={kod}
                                    onChange={(e) => handleInputChange('urunKodu', e.target.value, null, row.id, index)}
                                    placeholder={`Ürün Kodu ${index + 1}`}
                                    style={{
                                      flex: 1,
                                      padding: '0.75rem',
                                      border: '2px solid var(--border-color)',
                                      borderRadius: '8px',
                                      fontSize: '1rem',
                                      minHeight: '44px' // Touch-friendly
                                    }}
                                  />
                                  {row.urunKodu.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeInput('urunKodu', index, row.id)}
                                      style={{
                                        width: '44px', height: '44px',
                                        background: 'var(--accent-color)',
                                        color: 'white', border: 'none',
                                        borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}
                                      title="Ürün Kodu Sil"
                                    >
                                      <Trash2 size={20} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Other Fields in 2-column layout */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            
                            {/* Ürün Açıklaması */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                Ürün Açıklaması
                              </label>
                              <input
                                type="text"
                                value={row.urunAciklamasi}
                                onChange={(e) => handleInputChange('urunAciklamasi', e.target.value, null, row.id)}
                                placeholder="DB'den gelecek"
                                readOnly
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '2px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  background: '#f8f9fa',
                                  minHeight: '44px'
                                }}
                              />
                            </div>

                            {/* Yapılan İşlem */}
                            <div style={{ gridColumn: '1 / -1' }}>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                Yapılan İşlem
                              </label>
                              <select
                                value={row.yapilanIslem}
                                onChange={(e) => handleInputChange('yapilanIslem', e.target.value, null, row.id)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '2px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  minHeight: '44px'
                                }}
                              >
                                <option value="">Seçiniz</option>
                                {yapilanIslemOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>

                            {/* Time Fields */}
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                Başlangıç Saati
                              </label>
                              <input
                                type="time"
                                value={formData.isBaslangicSaati}
                                onChange={(e) => handleInputChange('isBaslangicSaati', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '2px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  minHeight: '44px'
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                Bitiş Saati
                              </label>
                              <input
                                type="time"
                                value={formData.isBitisSaati}
                                onChange={(e) => handleInputChange('isBitisSaati', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: '2px solid var(--border-color)',
                                  borderRadius: '8px',
                                  fontSize: '1rem',
                                  minHeight: '44px'
                                }}
                              />
                            </div>

                            {/* Error/Time Fields */}
                            {[
                              { key: 'dokumHatasi', label: 'Döküm Hatası', hasTimer: false },
                              { key: 'operatorHatasi', label: 'Operator Hatası', hasTimer: false },
                              { key: 'tezgahArizasi', label: 'Tezgah Arızası', hasTimer: true },
                              { key: 'tezgahAyari', label: 'Tezgah Ayarı', hasTimer: true },
                              { key: 'elmasDegisimi', label: 'Elmas Değişimi', hasTimer: true },
                              { key: 'parcaBekleme', label: 'Parça Bekleme', hasTimer: true },
                              { key: 'temizlik', label: 'Temizlik', hasTimer: true }
                            ].map(field => {
                              const timerKey = getTimerKey(row.id, field.key);
                              const timer = activeTimers[timerKey];
                              const isTimerRunning = timer?.isRunning;
                              
                              return (
                                <div key={field.key}>
                                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                    {field.label}
                                    {field.hasTimer && timer?.isRunning && (
                                      <span style={{ marginLeft: '0.5rem', color: 'var(--secondary-color)', fontSize: '0.8rem' }}>
                                        ⏱️ {formatTime(timer.seconds)}
                                      </span>
                                    )}
                                  </label>
                                  
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={row[field.key]}
                                      onChange={(e) => handleInputChange(field.key, e.target.value, null, row.id)}
                                      placeholder={field.hasTimer ? "MM:SS" : "Süre/Açıklama"}
                                      disabled={isTimerRunning}
                                      style={{
                                        width: field.hasTimer ? '80px' : 'auto',
                                        flex: field.hasTimer ? 'none' : '1',
                                        padding: '0.75rem',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        minHeight: '44px',
                                        backgroundColor: isTimerRunning ? '#f0f8ff' : 'white',
                                        textAlign: field.hasTimer ? 'center' : 'left',
                                        fontFamily: field.hasTimer ? 'monospace' : 'inherit'
                                      }}
                                    />
                                    
                                    {/* Spacer for timer fields to push buttons to the right */}
                                    {field.hasTimer && <div style={{ flex: 1 }}></div>}
                                    
                                    {field.hasTimer && (
                                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        {!isTimerRunning ? (
                                          <button
                                            type="button"
                                            onClick={() => startTimer(row.id, field.key)}
                                            style={{
                                              width: '44px', height: '44px',
                                              background: 'var(--secondary-color)',
                                              color: 'white', border: 'none',
                                              borderRadius: '8px', cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Zamanlayıcıyı Başlat"
                                          >
                                            <Play size={20} />
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => stopTimer(row.id, field.key)}
                                            style={{
                                              width: '44px', height: '44px',
                                              background: 'var(--accent-color)',
                                              color: 'white', border: 'none',
                                              borderRadius: '8px', cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Zamanlayıcıyı Durdur"
                                          >
                                            <Pause size={20} />
                                          </button>
                                        )}
                                        
                                        {(timer || row[field.key]) && (
                                          <button
                                            type="button"
                                            onClick={() => resetTimer(row.id, field.key)}
                                            style={{
                                              width: '44px', height: '44px',
                                              background: '#6c757d',
                                              color: 'white', border: 'none',
                                              borderRadius: '8px', cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Zamanlayıcıyı Sıfırla"
                                          >
                                            <Square size={20} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table Layout */
                  <div style={{ 
                    border: '2px solid var(--border-color)', 
                    borderRadius: '8px',
                    overflow: 'auto', // Enable horizontal scroll
                    maxWidth: '100%'
                  }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 120px 100px 80px 80px 60px 60px 80px 80px 80px 80px 80px 50px',
                      background: 'var(--primary-color)',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Ürün Kodu</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Ürün Açıklaması</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Yapılan İşlem</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Başlangıç</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Bitiş</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Döküm</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Operator</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Tez.Arıza</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Tez.Ayar</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Elmas</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Parça</div>
                      <div style={{ padding: '0.5rem 0.25rem', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Temizlik</div>
                      <div style={{ padding: '0.5rem 0.25rem' }}>Sil</div>
                    </div>

                    {/* Table Rows */}
                    {formData.rows.map((row, rowIndex) => (
                      <div key={row.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 120px 100px 80px 80px 60px 60px 80px 80px 80px 80px 80px 50px',
                        borderBottom: rowIndex < formData.rows.length - 1 ? '1px solid var(--border-color)' : 'none',
                        background: rowIndex % 2 === 0 ? 'var(--background-light)' : 'var(--background-gray)'
                      }}>
                        
                        {/* Desktop table content remains the same */}
                        {/* Ürün Kodu */}
                        <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            {row.urunKodu.map((kod, index) => (
                              <div key={index} style={{ display: 'flex', gap: '0.125rem', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={kod}
                                  onChange={(e) => handleInputChange('urunKodu', e.target.value, null, row.id, index)}
                                  placeholder={`${index + 1}`}
                                  style={{
                                    flex: 1,
                                    padding: '0.125rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '2px',
                                    fontSize: '0.7rem',
                                    minWidth: '0'
                                  }}
                                />
                                {row.urunKodu.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeInput('urunKodu', index, row.id)}
                                    style={{
                                      width: '16px', height: '16px',
                                      background: 'var(--accent-color)',
                                      color: 'white', border: 'none',
                                      borderRadius: '2px', cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.6rem'
                                    }}
                                  >
                                    <Trash2 size={8} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ürün Açıklaması */}
                        <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-color)' }}>
                          <input
                            type="text"
                            value={row.urunAciklamasi}
                            onChange={(e) => handleInputChange('urunAciklamasi', e.target.value, null, row.id)}
                            placeholder="DB'den"
                            readOnly
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '2px',
                              fontSize: '0.7rem',
                              background: '#f8f9fa'
                            }}
                          />
                        </div>

                        {/* Yapılan İşlem */}
                        <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-color)' }}>
                          <select
                            value={row.yapilanIslem}
                            onChange={(e) => handleInputChange('yapilanIslem', e.target.value, null, row.id)}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '2px',
                              fontSize: '0.7rem'
                            }}
                          >
                            <option value="">Seç</option>
                            {yapilanIslemOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>

                        {/* İş Başlangıç Saati */}
                        <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-color)' }}>
                          <input
                            type="time"
                            value={formData.isBaslangicSaati}
                            onChange={(e) => handleInputChange('isBaslangicSaati', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '2px',
                              fontSize: '0.7rem'
                            }}
                          />
                        </div>

                        {/* İş Bitiş Saati */}
                        <div style={{ padding: '0.25rem', borderRight: '1px solid var(--border-color)' }}>
                          <input
                            type="time"
                            value={formData.isBitisSaati}
                            onChange={(e) => handleInputChange('isBitisSaati', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.25rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: '2px',
                              fontSize: '0.7rem'
                            }}
                          />
                        </div>

                        {/* Error/Time Fields */}
                        {[
                          { key: 'dokumHatasi', placeholder: 'Süre', hasTimer: false },
                          { key: 'operatorHatasi', placeholder: 'Süre', hasTimer: false },
                          { key: 'tezgahArizasi', placeholder: 'MM:SS', hasTimer: true },
                          { key: 'tezgahAyari', placeholder: 'MM:SS', hasTimer: true },
                          { key: 'elmasDegisimi', placeholder: 'MM:SS', hasTimer: true },
                          { key: 'parcaBekleme', placeholder: 'MM:SS', hasTimer: true },
                          { key: 'temizlik', placeholder: 'MM:SS', hasTimer: true }
                        ].map(field => {
                          const timerKey = getTimerKey(row.id, field.key);
                          const timer = activeTimers[timerKey];
                          const isTimerRunning = timer?.isRunning;
                          
                          return (
                            <div key={field.key} style={{ 
                              padding: '0.25rem', 
                              borderRight: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.125rem'
                            }}>
                              {/* Timer display for active timers */}
                              {field.hasTimer && timer?.isRunning && (
                                <div style={{
                                  fontSize: '0.6rem',
                                  color: 'var(--secondary-color)',
                                  fontWeight: 'bold',
                                  textAlign: 'center'
                                }}>
                                  ⏱️ {formatTime(timer.seconds)}
                                </div>
                              )}
                              
                              {/* Input field */}
                              <input
                                type="text"
                                value={row[field.key]}
                                onChange={(e) => handleInputChange(field.key, e.target.value, null, row.id)}
                                placeholder={field.placeholder}
                                disabled={isTimerRunning}
                                style={{
                                  width: '100%',
                                  padding: '0.125rem',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '2px',
                                  fontSize: '0.6rem',
                                  backgroundColor: isTimerRunning ? '#f0f8ff' : 'white',
                                  textAlign: field.hasTimer ? 'center' : 'left',
                                  fontFamily: field.hasTimer ? 'monospace' : 'inherit',
                                  maxWidth: field.hasTimer ? '50px' : 'none'
                                }}
                              />
                              
                              {/* Timer buttons */}
                              {field.hasTimer && (
                                <div style={{ 
                                  display: 'flex', 
                                  gap: '0.125rem',
                                  justifyContent: 'center'
                                }}>
                                  {!isTimerRunning ? (
                                    <button
                                      type="button"
                                      onClick={() => startTimer(row.id, field.key)}
                                      style={{
                                        width: '18px', height: '18px',
                                        background: 'var(--secondary-color)',
                                        color: 'white', border: 'none',
                                        borderRadius: '2px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}
                                      title="Başlat"
                                    >
                                      <Play size={8} />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => stopTimer(row.id, field.key)}
                                      style={{
                                        width: '18px', height: '18px',
                                        background: 'var(--accent-color)',
                                        color: 'white', border: 'none',
                                        borderRadius: '2px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}
                                      title="Durdur"
                                    >
                                      <Pause size={8} />
                                    </button>
                                  )}
                                  
                                  {(timer || row[field.key]) && (
                                    <button
                                      type="button"
                                      onClick={() => resetTimer(row.id, field.key)}
                                      style={{
                                        width: '18px', height: '18px',
                                        background: '#6c757d',
                                        color: 'white', border: 'none',
                                        borderRadius: '2px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}
                                      title="Sıfırla"
                                    >
                                      <Square size={8} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Delete Row */}
                        <div style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            disabled={formData.rows.length <= 1}
                            title={formData.rows.length <= 1 ? "En az 1 satır gerekli" : "Satırı Sil"}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: formData.rows.length <= 1 ? '#ccc' : 'var(--accent-color)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: formData.rows.length <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              opacity: formData.rows.length <= 1 ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (formData.rows.length > 1) {
                                e.target.style.background = '#dc2626';
                                e.target.style.transform = 'scale(1.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.rows.length > 1) {
                                e.target.style.background = 'var(--accent-color)';
                                e.target.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Row Button */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={addNewRow}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: isMobile ? '1rem 1.5rem' : '0.75rem 1.5rem',
                      background: 'var(--secondary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '1.1rem' : '1rem',
                      fontWeight: '600',
                      margin: '0 auto',
                      minHeight: isMobile ? '48px' : 'auto'
                    }}
                  >
                    <Plus size={isMobile ? 20 : 18} />
                    Yeni Satır Ekle
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: isLoading ? 'var(--text-light)' : 'var(--secondary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    margin: '0 auto',
                    minWidth: '200px'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={`${isVisible ? 'animate-fadeInUp' : ''}`} style={{ 
          animationDelay: '0.4s',
          textAlign: 'center',
          marginTop: '2rem',
          color: 'var(--text-light)'
        }}>
          <p>Üretim takip sistemi - Tablo formatında veri girişi</p>
        </div>
      </div>
    </div>
  );
};

export default PWA;