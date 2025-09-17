import React, { useState, useEffect } from 'react';
import { AtSign, Smartphone, MapPin, SendHorizontal, Linkedin, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const isUtf = formData.message.trim().toUpperCase() === 'ÜTF';

  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sadece mesaj alanı 'ÜTF' ise formu gönder ve yönlendir
    if (formData.message.trim().toUpperCase() === 'ÜTF') {
      window.sessionStorage.setItem('utfAccess', 'true');
      navigate('/utf');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      alert('Lütfen mesaj kısmına "ÜTF" yazınız.');
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">İletişim</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* İletişim Bilgileri */}
          <div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '2rem', 
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💬 İletişim Bilgileri
            </h3>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'var(--background-light)',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  background: 'var(--secondary-color)', 
                  padding: '14px', 
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '48px',
                  minHeight: '48px'
                }}>
                  <AtSign size={24} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem' }}>E-mail</h4>
                  <p style={{ color: 'var(--text-light)', margin: 0 }}>krcarif6@gmail.com</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'var(--background-light)',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ 
                  background: 'var(--secondary-color)', 
                  padding: '14px', 
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '48px',
                  minHeight: '48px'
                }}>
                  <Smartphone size={24} />
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem' }}>Telefon</h4>
                  <p style={{ color: 'var(--text-light)', margin: 0 }}>+90 555 123 45 67</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                background: 'var(--background-light)',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid var(--border-color)'
              }}>
                
                
              </div>
            </div>
            {/* Sosyal Medya */}
            <div>
              <h4 style={{ 
                color: 'var(--primary-color)', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔗 Sosyal Medya
              </h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a 
                  href="https://www.linkedin.com/in/aarifkaracaa/" 
                  style={{ 
                    background: 'var(--secondary-color)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    minWidth: '52px',
                    minHeight: '52px'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Linkedin size={24} />
                </a>
                <a 
                  href="https://github.com/arifkrc" 
                  style={{ 
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    minWidth: '52px',
                    minHeight: '52px'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <Github size={24} />
                </a>
              </div>
            </div>
          </div>
          {/* Form Bölümü */}
          <div>
            <form onSubmit={handleSubmit} className="contact-form">
              <h3 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '2rem', 
                color: 'var(--primary-color)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                ✉️ Mesaj Gönder
              </h3>

              <div className="form-group">
                <label htmlFor="name">Ad Soyad</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isUtf}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isUtf}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Konu</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required={!isUtf}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Mesaj</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn" style={{ 
                width: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <SendHorizontal size={20} />
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
