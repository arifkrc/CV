import React, { useState, useEffect } from 'react';
import { AtSign, Smartphone, MapPin, SendHorizontal, Linkedin, Github } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
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
    // Open the user's mail client with prefilled subject and body as a fallback
    const recipient = 'aarifkaracaa@gmail.com';
    const subject = encodeURIComponent(formData.subject || 'Mesaj - Web Site');
    const bodyLines = [
      `Gönderen: ${formData.name || 'Anonim'}`,
      `E-posta: ${formData.email || ''}`,
      '\n',
      formData.message || ''
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Try to open mail client
    window.location.href = mailto;

    // Clear the form
    setFormData({ name: '', email: '', subject: '', message: '' });
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
                  <p style={{ color: 'var(--text-light)', margin: 0 }}>aarifkaracaa@gmail.com</p>
                </div>
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
                  className="social-btn linkedin"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
                <a
                  href="https://github.com/arifkrc"
                  className="social-btn github"
                  aria-label="GitHub"
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
                  required
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
                  required
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
                  required
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
