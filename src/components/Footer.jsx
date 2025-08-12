import React from 'react';
import { Heart, Laptop, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--background-gray)',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 0',
      marginTop: '4rem'
    }}>
      <div className="container">
        <div style={{
          textAlign: 'center',
          color: 'var(--text-light)'
        }}>
          <p style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Made with <Heart size={16} color="var(--accent-color)" fill="var(--accent-color)" /> 
            and <Laptop size={16} color="var(--secondary-color)" /> 
            by arifk.co • Powered by <Sparkles size={16} color="var(--text-light)" />
            <span style={{ color: 'var(--secondary-color)' }}> React</span>
          </p>
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.8rem',
            opacity: 0.8
          }}>
            © 2024 arifk.co - Endüstri Mühendisi & Yazılım Geliştirici
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
