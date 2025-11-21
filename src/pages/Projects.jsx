import React, { useEffect, useState } from 'react';
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

  return (
    <div className="section">
      <div className="container">
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
                    {p.id === 1 && (
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
                    )}
                  </div>
                )}
              </section>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
