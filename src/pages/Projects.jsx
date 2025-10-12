import React, { useEffect, useState, useMemo } from 'react';
import { CalendarDays, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const projects = [
    {
      id: 1,
      title: 'Üretim Takip Otomasyonu',
      subtitle: 'Problem tanımı, yöntem ve sonuçlar',
      date: '2024-05',
      category: 'automation',
      technologies: ['.NET 8', 'Entity Framework Core', 'FluentValidation', 'ElectronJS', 'SQL Server'],
    paragraphs: [
          'Staj süresince gözlemlediğim en önemli sorunlardan biri, aynı veri setlerinin farklı Excel dosyaları ve raporlama ihtiyaçları için tekrar tekrar manuel olarak işlenmesi ve aktarılmasıydı. Bu süreç, hem ciddi zaman ve emek kaybına hem de insan hatasına açık bir ortam oluşturmaktaydı. Verilerin merkezi ve kümülatif biçimde tek seferde sisteme girilmesi ve sonrasında otomatik filtreleme ile raporlanmasının; iş yükünü azaltacağı, hata oranını düşüreceği ve karar destek sistemlerine daha hızlı ve güvenilir veri sağlayacağı tespit edilmiştir.',
          'Projenin amacı: Veri girişinden sonra tüm raporlamaların ve özetlerin otomatik olarak üretilmesini sağlamak; manuel veri aktarımını ortadan kaldırmak; üretim, paketleme ve sipariş verilerini tek bir merkezde toplamak; departmanlar arası bilgi akışını hızlandırmak; zaman tasarrufu sağlarken raporların güvenilirliğini artırmak.',
          'Sağlananlar: Otomatik raporlama, sipariş takibi, paketleme işlemlerinin otomatik eşleştirilmesi ve CSV/XLSX dışa aktarma desteği. Backend .NET 8 Web API, Entity Framework Core ve FluentValidation; frontend olarak ElectronJS masaüstü uygulaması; veritabanı olarak SQL Server kullanıldı.',
          'Sonuç: Planlama biriminin iş yükü azaldı, veri giriş hataları azaltıldı, sipariş tahsisleri ve kalan miktar hesaplamaları otomatikleştirildi.',
          'Not: Bu projenin tarayıcıda çalışan bir prototipi (UTF sayfası) geliştirilmişti, ancak masaüstü otomasyonuna geçildiği için prototip askıya alınmıştır. Prototipi görmek için aşağıdaki bağlantıyı kullanabilirsiniz.'
      ],
      attachments: [
        { label: 'GitHub - Üretim Takip Otomasyonu (TakipUI)', url: 'https://github.com/arifkrc/TakipUI' }
      ]
    },
    {
      id: 2,
      title: 'SONNE — Facility Layout (sonne.py)',
      subtitle: 'Enhanced UA-FLP algoritması ve raporlama',
      date: '2023-12',
      category: 'layout',
      technologies: ['Python', 'Tabu Arama', 'Optimization', 'HTML report'],
      paragraphs: [
  'Bu proje, firmanın taşınma planına ve mevcut yerleşimin testine istinaden geliştirilmiştir.',
  'Bu rapor, "sonne.py" dosyasında uygulanan Eşit Olmayan Alan Tesis Yerleşim Problemi (UA-FLP) çözüm algoritmasını analiz etmektedir. EnhancedUAFLP algoritması, farklı departman boyutları ve gerçek dünya kısıtlarını dikkate alarak yerleşimi optimize etmeyi amaçlar.',
        'Algoritma tabu arama meta-sezgisel yöntemi ile çalışır; başlangıç çözümü, çok amaçlı değerlendirme, tabu arama optimizasyonu ve yeniden başlatma stratejileri içerir. Rapor paketinde optimize edilmiş yerleşim planı görselleri, malzeme akış ağı görselleştirmeleri ve ilerleme grafikleri bulunmaktadır.',
        'Kullanım: optimize fonksiyonu çalıştırıldığında sonuçlar HTML ve JSON formatında kaydedilir; bu çıktılar görselleştirme ve daha ileri analizler için kullanılabilir.',
        'Not: Yakında bu projeyi websitesinde online olarak deneme ve deneyimleme imkanı sunacağım.'
      ],
      attachments: [
        { label: 'GitHub - FacilityLayout', url: 'https://github.com/arifkrc/FacilityLayout' }
      ]
    }
  ];

  // Load client UI images from the provided attachment folder using import.meta.glob
  // This keeps them as assets and avoids bundler parse issues.
  const imagesMap = useMemo(() => {
    // Relative to project root; Vite will include these as assets
  const modules = import.meta.glob('/src/projects/uretimtakipotomasyonu/clientUI/*.{png,jpg,jpeg}', { eager: true, as: 'url' });
    // modules is an object { './path': 'url' }
    return Object.values(modules || {});
  }, []);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const headerRef = React.useRef(null);
  const closeBtnRef = React.useRef(null);
  const lastActiveElementRef = React.useRef(null);

  function openGallery(index = 0) {
    setGalleryIndex(index);
    lastActiveElementRef.current = document.activeElement;
    setIsGalleryOpen(true);
    // mark header/container as inert / aria-hidden so it doesn't receive focus
    if (headerRef.current) {
      headerRef.current.setAttribute('aria-hidden', 'true');
      // try using inert if available
      try { headerRef.current.inert = true; } catch (e) { /* ignore */ }
    }
    document.body.style.overflow = 'hidden';
  }

  function closeGallery() {
    setIsGalleryOpen(false);
    // restore header focusability
    if (headerRef.current) {
      headerRef.current.removeAttribute('aria-hidden');
      try { headerRef.current.inert = false; } catch (e) { /* ignore */ }
    }
    document.body.style.overflow = '';
    // restore focus to last focused element
    if (lastActiveElementRef.current && lastActiveElementRef.current.focus) {
      lastActiveElementRef.current.focus();
    }
  }

  function showNext() {
    setGalleryIndex((i) => (i + 1) % imagesMap.length);
  }

  function showPrev() {
    setGalleryIndex((i) => (i - 1 + imagesMap.length) % imagesMap.length);
  }

  React.useEffect(() => {
    if (isGalleryOpen) {
      // focus close button when modal opens
      setTimeout(() => { if (closeBtnRef.current) closeBtnRef.current.focus(); }, 0);
    }
  }, [isGalleryOpen]);

  return (
    <div className="section">
      <div className="container" ref={headerRef}>
        <h2 className={`section-title ${isVisible ? 'animate-fadeInUp' : ''}`}>Projelerim</h2>

        <div style={{ display: 'grid', gap: '2.5rem', marginTop: '2rem' }}>
          {projects.map((p) => (
            <article key={p.id} className="project-post">
              <header style={{ marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0 }}>{p.title}</h3>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--muted)' }}>• {p.category}</span>
                </div>
              </header>

              <section>
                {p.paragraphs.map((para, i) => (
                  <p key={i} style={{ lineHeight: 1.7, color: 'var(--text-light)' }}>{para}</p>
                ))}

                {p.technologies && (
                  <p style={{ marginTop: '0.6rem' }}><strong>Teknolojiler:</strong> {p.technologies.join(', ')}</p>
                )}

                {p.attachments && p.attachments.length > 0 && (
                  <div style={{ marginTop: '0.8rem' }}>
                    <strong>Ekler:</strong>
                    <ul>
                      {p.attachments.map((a, idx) => (
                        <li key={idx}><a href={a.url} target="_blank" rel="noopener noreferrer">{a.label}</a></li>
                      ))}
                    </ul>
                    {/* Gallery trigger shown under Ekler for project 1 */}
                    {p.id === 1 && imagesMap && imagesMap.length > 0 && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <button
                          onClick={() => openGallery(0)}
                          style={{
                            background: 'var(--bg)',
                            border: '2px solid var(--link)',
                            color: 'var(--link)',
                            cursor: 'pointer',
                            padding: '0.5rem 1.2rem',
                            fontSize: '1.15rem',
                            fontWeight: 500,
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                          }}
                        >
                          Uygulamaya Ait Görseller
                          <ImageIcon size={22} style={{ marginLeft: '0.2rem' }} />
                        </button>
                      </div>
                    )}
                      {/* Gallery trigger and prototype link under Ekler for project 1 */}
                      {p.id === 1 && (
                        <>
                          
                          <div style={{ marginTop: '0.6rem' }}>
                            <Link
                              to="/utf"
                              style={{
                                background: 'var(--bg)',
                                border: '2px solid var(--accent-color)',
                                color: 'var(--accent-color)',
                                cursor: 'pointer',
                                padding: '0.5rem 1.2rem',
                                fontSize: '1.08rem',
                                fontWeight: 500,
                                borderRadius: '8px',
                                display: 'inline-block',
                                textDecoration: 'none',
                                marginTop: '0.2rem'
                              }}
                            >
                              Prototipi Gör
                            </Link>
                          </div>
                        </>
                      )}
                  </div>
                )}
              </section>
            </article>
          ))}
        </div>
      </div>
      {/* Gallery modal (inline styles to avoid separate CSS edits) */}
      {isGalleryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0,0,0,0.45)'
          }}
          onClick={closeGallery}
        >
          <div
            ref={(el) => { if (el && isGalleryOpen) el.focus(); }}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeGallery();
              if (e.key === 'ArrowRight') showNext();
              if (e.key === 'ArrowLeft') showPrev();
            }}
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, rgba(20,20,20,0.98), rgba(10,10,10,0.98))',
              color: '#fff',
              padding: '1rem',
              borderRadius: '12px',
              maxWidth: '92vw',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeBtnRef} onClick={closeGallery} aria-label="Kapat" style={{ position: 'absolute', right: 12, top: 12, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.6rem', cursor: 'pointer' }}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={showPrev} aria-label="Önceki" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>‹</button>
              <img src={imagesMap[galleryIndex]} alt={`gallery-${galleryIndex}`} style={{ maxHeight: '76vh', maxWidth: '76vw', objectFit: 'contain', borderRadius: '6px' }} />
              <button onClick={showNext} aria-label="Sonraki" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>›</button>
            </div>
            <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>{galleryIndex + 1} / {imagesMap.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
