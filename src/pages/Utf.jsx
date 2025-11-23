import React, { useState, useEffect } from 'react';
import { authAPI, productionAPI } from '../services/api';

const getToday = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const Utf = () => {
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await authAPI.login({ email, password });
      setIsLoggedIn(true);
      setCurrentUser(response.user);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Production form state
  const [productionForm, setProductionForm] = useState({
    tarih: getToday(),
    vardiya: '',
    hatNo: '',
    tezgahNo: '',
    operator: '',
    bolumSorumlusu: '',
    urunKodu: '',
    yapilanIslem: '',
    uretimAdedi: '',
    dokumHatasi: '',
    operatorHatasi: '',
    operasyonSuresi: '',
    isBaslangic: '',
    tezgahArizasi: 0,
    tezgahAyari: 0,
    elmasDegisimi: 0,
    parcaBekleme: 0,
    temizlik: 0,
    isBitis: ''
  });

  // Set operator name when logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setProductionForm(prev => ({
        ...prev,
        operator: currentUser.fullName
      }));
    }
  }, [isLoggedIn, currentUser]);

  // Timer states
  const [timers, setTimers] = useState({
    tezgahArizasi: { running: false, seconds: 0 },
    tezgahAyari: { running: false, seconds: 0 },
    elmasDegisimi: { running: false, seconds: 0 },
    parcaBekleme: { running: false, seconds: 0 },
    temizlik: { running: false, seconds: 0 }
  });

  const [intervals, setIntervals] = useState({});

  const startTimer = (timerName) => {
    if (!timers[timerName].running) {
      const intervalId = setInterval(() => {
        setTimers(prev => ({
          ...prev,
          [timerName]: {
            running: true,
            seconds: prev[timerName].seconds + 1
          }
        }));
      }, 1000);
      
      setIntervals(prev => ({ ...prev, [timerName]: intervalId }));
      setTimers(prev => ({
        ...prev,
        [timerName]: { ...prev[timerName], running: true }
      }));
    }
  };

  const pauseTimer = (timerName) => {
    if (timers[timerName].running && intervals[timerName]) {
      clearInterval(intervals[timerName]);
      setTimers(prev => ({
        ...prev,
        [timerName]: { ...prev[timerName], running: false }
      }));
    }
  };

  const stopTimer = (timerName) => {
    if (intervals[timerName]) {
      clearInterval(intervals[timerName]);
    }
    setProductionForm(prev => ({
      ...prev,
      [timerName]: timers[timerName].seconds
    }));
    setTimers(prev => ({
      ...prev,
      [timerName]: { running: false, seconds: 0 }
    }));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProductionChange = (e) => {
    setProductionForm({ ...productionForm, [e.target.name]: e.target.value });
  };

  const handleProductionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clear any running timers
    Object.keys(intervals).forEach(key => {
      if (intervals[key]) clearInterval(intervals[key]);
    });

    try {
      // Prepare data for backend API
      const data = {
        tarih: productionForm.tarih,
        vardiyaNo: productionForm.vardiya,
        hatNo: productionForm.hatNo,
        tezgahNo: productionForm.tezgahNo,
        operatorId: currentUser.id, // UUID from logged-in user
        bolumSorumlusuId: currentUser.id, // For now, using same user ID
        urunKodu: productionForm.urunKodu,
        yapilanIslem: productionForm.yapilanIslem,
        uretimAdedi: parseInt(productionForm.uretimAdedi),
        dokumHatasi: parseInt(productionForm.dokumHatasi) || 0,
        operatorHatasi: parseInt(productionForm.operatorHatasi) || 0,
        islemHatasi: 0,
        tezgahArizasi: Math.floor(productionForm.tezgahArizasi / 60) || 0, // Seconds to minutes
        tezgahAyari: Math.floor(productionForm.tezgahAyari / 60) || 0,
        elmasDegisimi: Math.floor(productionForm.elmasDegisimi / 60) || 0,
        parcaBekleme: Math.floor(productionForm.parcaBekleme / 60) || 0,
        temizlik: Math.floor(productionForm.temizlik / 60) || 0,
        isBaslangic: productionForm.isBaslangic || '00:00',
        isBitis: productionForm.isBitis || '00:00',
        molaVar: 0
      };

      const response = await productionAPI.createRecord(data);
      
      // Reset form
      setProductionForm({
        tarih: getToday(),
        vardiya: '',
        hatNo: '',
        tezgahNo: '',
        operator: currentUser.fullName,
        bolumSorumlusu: '',
        urunKodu: '',
        yapilanIslem: '',
        uretimAdedi: '',
        dokumHatasi: '',
        operatorHatasi: '',
        operasyonSuresi: '',
        isBaslangic: '',
        tezgahArizasi: 0,
        tezgahAyari: 0,
        elmasDegisimi: 0,
        parcaBekleme: 0,
        temizlik: 0,
        isBitis: ''
      });
      setTimers({
        tezgahArizasi: { running: false, seconds: 0 },
        tezgahAyari: { running: false, seconds: 0 },
        elmasDegisimi: { running: false, seconds: 0 },
        parcaBekleme: { running: false, seconds: 0 },
        temizlik: { running: false, seconds: 0 }
      });
      setIntervals({});

      alert('✅ Üretim kaydı başarıyla oluşturuldu!');
      
    } catch (error) {
      console.error('Production record error:', error);
      alert('❌ Hata: ' + (error.message || 'Kayıt oluşturulamadı!'));
    } finally {
      setIsLoading(false);
    }
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return (
      <div className="section" style={{ 
        minHeight: '100vh', 
        background: 'var(--background-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '3rem',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ 
            color: 'var(--primary-color)', 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: '1.75rem',
            fontWeight: 700
          }}>Giriş Yap</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="email" style={{ 
                fontWeight: 600, 
                fontSize: '0.95rem', 
                color: 'var(--text-dark)', 
                marginBottom: '0.5rem', 
                display: 'block' 
              }}>
                E-posta
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem',
                  background: 'var(--background-light)',
                  color: 'var(--text-dark)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="E-posta adresinizi girin"
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={{ 
                fontWeight: 600, 
                fontSize: '0.95rem', 
                color: 'var(--text-dark)', 
                marginBottom: '0.5rem', 
                display: 'block' 
              }}>
                Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem',
                  background: 'var(--background-light)',
                  color: 'var(--text-dark)',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="Şifrenizi girin"
                required
              />
            </div>

            {loginError && (
              <div style={{
                padding: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '8px',
                fontSize: '0.9rem',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#9ca3af' : 'var(--secondary-color)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(59,130,246,0.2)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in - show production form
  return (
    <div className="section" style={{ minHeight: '100vh', background: 'var(--background-light)', padding: '1rem 0' }}>
      <div className="container" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: window.innerWidth <= 768 ? 'stretch' : 'center', 
          marginBottom: '1.5rem',
          gap: '1rem'
        }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0, fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem' }}>
            Üretim Takip Formu {currentUser && <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>- {currentUser.fullName}</span>}
          </h2>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(239,68,68,0.2)',
              width: window.innerWidth <= 768 ? '100%' : 'auto',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Çıkış Yap
          </button>
        </div>

        {/* Form */}
        <div style={{
          background: 'white',
          borderRadius: window.innerWidth <= 768 ? 12 : 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          padding: window.innerWidth <= 768 ? '1.5rem' : '2.5rem',
          marginBottom: '2rem',
          border: '1px solid #f3f4f6'
        }}>
          <form onSubmit={handleProductionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: window.innerWidth <= 768 ? '1.5rem' : '2rem' }}>
            {/* First Row - TARİH */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(4, 1fr)', 
              gap: window.innerWidth <= 768 ? '1rem' : '1.5rem' 
            }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  TARİH
                </label>
                <input
                  type="date"
                  name="tarih"
                  value={productionForm.tarih}
                  onChange={handleProductionChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {window.innerWidth > 768 && (
                <>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      VARD. NO
                    </label>
                    <select
                      name="vardiya"
                      value={productionForm.vardiya}
                      onChange={handleProductionChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Seçiniz</option>
                      <option value="00-08">00-08</option>
                      <option value="08-16">08-16</option>
                      <option value="16-00">16-00</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      HAT NO
                    </label>
                    <input
                      type="text"
                      name="hatNo"
                      value={productionForm.hatNo}
                      onChange={handleProductionChange}
                      required
                      maxLength="2"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Hat numarası"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      TEZGAH NO
                    </label>
                    <input
                      type="text"
                      name="tezgahNo"
                      value={productionForm.tezgahNo}
                      onChange={handleProductionChange}
                      required
                      maxLength="2"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Tezgah numarası"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Second Row - VARDIYA, HAT NO, TEZGAH NO (Mobile Only) */}
            {window.innerWidth <= 768 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    VARD. NO
                  </label>
                  <select
                    name="vardiya"
                    value={productionForm.vardiya}
                    onChange={handleProductionChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Seçiniz</option>
                    <option value="00-08">00-08</option>
                    <option value="08-16">08-16</option>
                    <option value="16-00">16-00</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    HAT NO
                  </label>
                  <input
                    type="text"
                    name="hatNo"
                    value={productionForm.hatNo}
                    onChange={handleProductionChange}
                    required
                    maxLength="2"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                    placeholder="00"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    TEZG. NO
                  </label>
                  <input
                    type="text"
                    name="tezgahNo"
                    value={productionForm.tezgahNo}
                    onChange={handleProductionChange}
                    required
                    maxLength="2"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                    placeholder="00"
                  />
                </div>
              </div>
            )}

            {/* Third Row - OPERATÖR */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)', 
              gap: window.innerWidth <= 768 ? '1rem' : '1.5rem' 
            }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  OPERATÖR
                </label>
                <input
                  type="text"
                  name="operator"
                  value={productionForm.operator}
                  onChange={handleProductionChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Operatör adı"
                />
              </div>

              {window.innerWidth > 768 && (
                <>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      BÖLÜM SORUMLUSU
                    </label>
                    <input
                      type="text"
                      name="bolumSorumlusu"
                      value={productionForm.bolumSorumlusu}
                      onChange={handleProductionChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Bölüm sorumlusu"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      ÜRÜN KODU
                    </label>
                    <input
                      type="text"
                      name="urunKodu"
                      value={productionForm.urunKodu}
                      onChange={handleProductionChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Ürün kodu"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Fourth Row - BÖLÜM SORUMLUSU (Mobile Only) */}
            {window.innerWidth <= 768 && (
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  BÖLÜM SORUMLUSU
                </label>
                <input
                  type="text"
                  name="bolumSorumlusu"
                  value={productionForm.bolumSorumlusu}
                  onChange={handleProductionChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Bölüm sorumlusu"
                />
              </div>
            )}

            {/* Fifth Row - ÜRÜN KODU & YAPILAN İŞLEM */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(5, 1fr)', 
              gap: window.innerWidth <= 768 ? '1rem' : '1.5rem' 
            }}>
              {window.innerWidth <= 768 && (
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    ÜRÜN KODU
                  </label>
                  <input
                    type="text"
                    name="urunKodu"
                    value={productionForm.urunKodu}
                    onChange={handleProductionChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Ürün kodu"
                  />
                </div>
              )}

              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  YAPILAN İŞLEM
                </label>
                <select
                  name="yapilanIslem"
                  value={productionForm.yapilanIslem}
                  onChange={handleProductionChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seçiniz</option>
                  <option value="GENEL İŞLEM">GENEL İŞLEM</option>
                  <option value="TORNA 1.YÖN">TORNA 1.YÖN</option>
                  <option value="TORNA 2.YÖN">TORNA 2.YÖN</option>
                  <option value="DELİK 1.YÖN">DELİK 1.YÖN</option>
                  <option value="DELİK 2.YÖN (ABS)">DELİK 2.YÖN (ABS)</option>
                  <option value="ÇİFT TABLA">ÇİFT TABLA</option>
                </select>
              </div>

              {window.innerWidth > 768 && (
                <>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      ÜRETİM ADEDİ
                    </label>
                    <input
                      type="number"
                      name="uretimAdedi"
                      value={productionForm.uretimAdedi}
                      onChange={handleProductionChange}
                      required
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      DÖKÜM HATASI
                    </label>
                    <input
                      type="number"
                      name="dokumHatasi"
                      value={productionForm.dokumHatasi}
                      onChange={handleProductionChange}
                      min="0"
                      maxLength="2"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      OPERATÖR HATASI
                    </label>
                    <input
                      type="number"
                      name="operatorHatasi"
                      value={productionForm.operatorHatasi}
                      onChange={handleProductionChange}
                      min="0"
                      maxLength="2"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      OPERASYON SÜRESİ (sn)
                    </label>
                    <input
                      type="number"
                      name="operasyonSuresi"
                      value={productionForm.operasyonSuresi}
                      onChange={handleProductionChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e1e5e9',
                        fontSize: '0.95rem',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                      İŞ BAŞLANGIÇ
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={productionForm.isBaslangic}
                        readOnly
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e1e5e9',
                          fontSize: '0.95rem',
                          background: '#f9fafb',
                          boxSizing: 'border-box',
                          color: '#374151'
                        }}
                        placeholder="Başlatılmadı"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const timeStr = now.toTimeString().slice(0, 8);
                          setProductionForm(prev => ({ ...prev, isBaslangic: timeStr }));
                        }}
                        style={{
                          padding: '12px 24px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Başlat
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile: Sixth Row - ÜRETİM ADEDİ */}
            {window.innerWidth <= 768 && (
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  ÜRETİM ADEDİ
                </label>
                <input
                  type="number"
                  name="uretimAdedi"
                  value={productionForm.uretimAdedi}
                  onChange={handleProductionChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
              </div>
            )}

            {/* Mobile: Seventh Row - DÖKÜM HATASI & OPERATÖR HATASI */}
            {window.innerWidth <= 768 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    DÖKÜM HATASI
                  </label>
                  <input
                    type="number"
                    name="dokumHatasi"
                    value={productionForm.dokumHatasi}
                    onChange={handleProductionChange}
                    min="0"
                    max="99"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                    OPERATÖR HATASI
                  </label>
                  <input
                    type="number"
                    name="operatorHatasi"
                    value={productionForm.operatorHatasi}
                    onChange={handleProductionChange}
                    min="0"
                    max="99"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Mobile: Eighth Row - OPERASYON SÜRESİ */}
            {window.innerWidth <= 768 && (
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  OPERASYON SÜRESİ (sn)
                </label>
                <input
                  type="number"
                  name="operasyonSuresi"
                  value={productionForm.operasyonSuresi}
                  onChange={handleProductionChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
              </div>
            )}

            {/* Mobile: Ninth Row - İŞ BAŞLANGIÇ */}
            {window.innerWidth <= 768 && (
              <div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                  İŞ BAŞLANGIÇ
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={productionForm.isBaslangic}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e1e5e9',
                      fontSize: '0.95rem',
                      background: '#f9fafb',
                      boxSizing: 'border-box',
                      color: '#374151'
                    }}
                    placeholder="Başlatılmadı"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const timeStr = now.toTimeString().slice(0, 8);
                      setProductionForm(prev => ({ ...prev, isBaslangic: timeStr }));
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Başlat
                  </button>
                </div>
              </div>
            )}

            {/* Chronometer Section */}
            <div style={{ 
              marginTop: '1rem',
              padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
              background: 'var(--background-gray)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ 
                color: 'var(--primary-color)', 
                marginBottom: '1rem',
                fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
                fontWeight: 600
              }}>
                Duruş Süreleri
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {/* TEZGAH ARIZASI */}
                <div style={{ 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    TEZGAH ARIZASI
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: timers.tezgahArizasi.running ? '#ef4444' : 'var(--primary-color)',
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    {formatTime(timers.tezgahArizasi.seconds)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startTimer('tezgahArizasi')}
                      disabled={timers.tezgahArizasi.running}
                      style={{
                        padding: '8px 16px',
                        background: timers.tezgahArizasi.running ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.tezgahArizasi.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer('tezgahArizasi')}
                      disabled={!timers.tezgahArizasi.running}
                      style={{
                        padding: '8px 16px',
                        background: !timers.tezgahArizasi.running ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !timers.tezgahArizasi.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Duraklat
                    </button>
                    <button
                      type="button"
                      onClick={() => stopTimer('tezgahArizasi')}
                      disabled={timers.tezgahArizasi.seconds === 0}
                      style={{
                        padding: '8px 16px',
                        background: timers.tezgahArizasi.seconds === 0 ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.tezgahArizasi.seconds === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Durdur
                    </button>
                  </div>
                  {productionForm.tezgahArizasi > 0 && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Kaydedilen: {formatTime(productionForm.tezgahArizasi)}
                    </div>
                  )}
                </div>

                {/* TEZGAH AYARI */}
                <div style={{ 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    TEZGAH AYARI
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: timers.tezgahAyari.running ? '#ef4444' : 'var(--primary-color)',
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    {formatTime(timers.tezgahAyari.seconds)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startTimer('tezgahAyari')}
                      disabled={timers.tezgahAyari.running}
                      style={{
                        padding: '8px 16px',
                        background: timers.tezgahAyari.running ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.tezgahAyari.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer('tezgahAyari')}
                      disabled={!timers.tezgahAyari.running}
                      style={{
                        padding: '8px 16px',
                        background: !timers.tezgahAyari.running ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !timers.tezgahAyari.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Duraklat
                    </button>
                    <button
                      type="button"
                      onClick={() => stopTimer('tezgahAyari')}
                      disabled={timers.tezgahAyari.seconds === 0}
                      style={{
                        padding: '8px 16px',
                        background: timers.tezgahAyari.seconds === 0 ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.tezgahAyari.seconds === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Durdur
                    </button>
                  </div>
                  {productionForm.tezgahAyari > 0 && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Kaydedilen: {formatTime(productionForm.tezgahAyari)}
                    </div>
                  )}
                </div>

                {/* ELMAS DEĞİŞİMİ */}
                <div style={{ 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    ELMAS DEĞİŞİMİ
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: timers.elmasDegisimi.running ? '#ef4444' : 'var(--primary-color)',
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    {formatTime(timers.elmasDegisimi.seconds)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startTimer('elmasDegisimi')}
                      disabled={timers.elmasDegisimi.running}
                      style={{
                        padding: '8px 16px',
                        background: timers.elmasDegisimi.running ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.elmasDegisimi.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer('elmasDegisimi')}
                      disabled={!timers.elmasDegisimi.running}
                      style={{
                        padding: '8px 16px',
                        background: !timers.elmasDegisimi.running ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !timers.elmasDegisimi.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Duraklat
                    </button>
                    <button
                      type="button"
                      onClick={() => stopTimer('elmasDegisimi')}
                      disabled={timers.elmasDegisimi.seconds === 0}
                      style={{
                        padding: '8px 16px',
                        background: timers.elmasDegisimi.seconds === 0 ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.elmasDegisimi.seconds === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Durdur
                    </button>
                  </div>
                  {productionForm.elmasDegisimi > 0 && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Kaydedilen: {formatTime(productionForm.elmasDegisimi)}
                    </div>
                  )}
                </div>

                {/* PARÇA BEKLEME */}
                <div style={{ 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    PARÇA BEKLEME
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: timers.parcaBekleme.running ? '#ef4444' : 'var(--primary-color)',
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    {formatTime(timers.parcaBekleme.seconds)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startTimer('parcaBekleme')}
                      disabled={timers.parcaBekleme.running}
                      style={{
                        padding: '8px 16px',
                        background: timers.parcaBekleme.running ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.parcaBekleme.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer('parcaBekleme')}
                      disabled={!timers.parcaBekleme.running}
                      style={{
                        padding: '8px 16px',
                        background: !timers.parcaBekleme.running ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !timers.parcaBekleme.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Duraklat
                    </button>
                    <button
                      type="button"
                      onClick={() => stopTimer('parcaBekleme')}
                      disabled={timers.parcaBekleme.seconds === 0}
                      style={{
                        padding: '8px 16px',
                        background: timers.parcaBekleme.seconds === 0 ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.parcaBekleme.seconds === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Durdur
                    </button>
                  </div>
                  {productionForm.parcaBekleme > 0 && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Kaydedilen: {formatTime(productionForm.parcaBekleme)}
                    </div>
                  )}
                </div>

                {/* TEMİZLİK */}
                <div style={{ 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  gridColumn: window.innerWidth <= 768 ? 'auto' : 'span 2'
                }}>
                  <div style={{ marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                    TEMİZLİK
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                    fontWeight: 'bold',
                    color: timers.temizlik.running ? '#ef4444' : 'var(--primary-color)',
                    marginBottom: '0.75rem',
                    fontFamily: 'monospace',
                    textAlign: 'center'
                  }}>
                    {formatTime(timers.temizlik.seconds)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => startTimer('temizlik')}
                      disabled={timers.temizlik.running}
                      style={{
                        padding: '8px 16px',
                        background: timers.temizlik.running ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.temizlik.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => pauseTimer('temizlik')}
                      disabled={!timers.temizlik.running}
                      style={{
                        padding: '8px 16px',
                        background: !timers.temizlik.running ? '#d1d5db' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !timers.temizlik.running ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Duraklat
                    </button>
                    <button
                      type="button"
                      onClick={() => stopTimer('temizlik')}
                      disabled={timers.temizlik.seconds === 0}
                      style={{
                        padding: '8px 16px',
                        background: timers.temizlik.seconds === 0 ? '#d1d5db' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: timers.temizlik.seconds === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      Durdur
                    </button>
                  </div>
                  {productionForm.temizlik > 0 && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Kaydedilen: {formatTime(productionForm.temizlik)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* İŞ BİTİŞ */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                İŞ BİTİŞ
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={productionForm.isBitis}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e1e5e9',
                    fontSize: '0.95rem',
                    background: '#f9fafb',
                    boxSizing: 'border-box',
                    color: '#374151'
                  }}
                  placeholder="Bitirilmedi"
                />
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const timeStr = now.toTimeString().slice(0, 8);
                    
                    // Stop all running timers and save their values
                    Object.keys(timers).forEach(timerName => {
                      if (timers[timerName].running && intervals[timerName]) {
                        clearInterval(intervals[timerName]);
                        setProductionForm(prev => ({
                          ...prev,
                          [timerName]: timers[timerName].seconds,
                          isBitis: timeStr
                        }));
                      }
                    });
                    
                    // Reset all timer states to stopped
                    setTimers({
                      tezgahArizasi: { running: false, seconds: 0 },
                      tezgahAyari: { running: false, seconds: 0 },
                      elmasDegisimi: { running: false, seconds: 0 },
                      parcaBekleme: { running: false, seconds: 0 },
                      temizlik: { running: false, seconds: 0 }
                    });
                    
                    // Clear all intervals
                    setIntervals({});
                    
                    // Set end time
                    setProductionForm(prev => ({ ...prev, isBitis: timeStr }));
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Bitir
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading ? '#9ca3af' : 'var(--secondary-color)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 48px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.2)',
                  transition: 'all 0.2s ease',
                  width: window.innerWidth <= 768 ? '100%' : 'auto',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Utf;
