# CV Web Sitesi - arifk.co

Modern ve responsive tasarıma sahip kişisel CV/portfolyo web sitesi.

## 🚀 Özellikler

- **Modern Tasarım**: Temiz ve profesyonel görünüm
- **Responsive**: Tüm cihazlarda mükemmel görünüm
- **Hızlı**: Vite build sistemi ile optimize edilmiş performans
- **Navigasyon**: React Router ile sorunsuz sayfa geçişleri
- **İnteraktif**: Hover efektleri ve animasyonlar

## 📱 Sayfalar

- **Ana Sayfa**: Kişisel tanıtım ve profil fotoğrafı
- **Hakkımda**: Detaylı bilgiler ve yetenekler
- **Özgeçmiş**: İş deneyimi ve eğitim geçmişi
- **İletişim**: İletişim formu ve sosyal medya bağlantıları

## 🛠️ Teknolojiler

- **React 18**: Modern React hooks ve functional components
- **React Router**: Sayfa yönlendirme
- **Vite**: Hızlı geliştirme ve build
- **Lucide React**: Modern ikonlar
- **CSS3**: Özel tasarım ve animasyonlar

## 📦 Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone [repository-url]
   cd CV
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Development server'ı başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcınızda açın:**
   ```
   http://localhost:5173
   ```

## 🔧 Available Scripts

- `npm run dev` - Development server başlatır
- `npm run build` - Production build oluşturur
- `npm run preview` - Build'i önizler
- `npm run lint` - Kod kalitesi kontrolü

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Header.jsx          # Navigasyon bileşeni
│   └── Header.css          # Header stilleri
├── pages/
│   ├── Home.jsx            # Ana sayfa
│   ├── About.jsx           # Hakkımda sayfası
│   ├── Resume.jsx          # Özgeçmiş sayfası
│   └── Contact.jsx         # İletişim sayfası
├── App.jsx                 # Ana uygulama bileşeni
├── App.css                 # Uygulama stilleri
├── main.jsx                # Giriş noktası
└── index.css               # Global stiller
```

## 🎨 Özelleştirme

### Renkler
CSS değişkenlerini `src/index.css` dosyasından düzenleyebilirsiniz:

```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;
  --background-light: #ffffff;
  --background-gray: #f8f9fa;
  --border-color: #ecf0f1;
}
```

### İçerik
- Kişisel bilgilerinizi ilgili sayfalarda güncelleyin
- Profil fotoğraflarını `src/pages/` dosyalarındaki URL'lerden değiştirin
- İletişim bilgilerini `src/pages/Contact.jsx` dosyasından güncelleyin

## 📱 Responsive Tasarım

- **Desktop**: 1200px+ (Grid layout)
- **Tablet**: 768px-1199px (Esnek grid)
- **Mobile**: <768px (Tek sütun layout)

## 🌟 Gelecek Özellikler

- [ ] Blog sayfası ekleme
- [ ] Proje galerisi
- [ ] Çoklu dil desteği
- [ ] Dark mode
- [ ] SEO optimizasyonu
- [ ] PWA desteği

## 📄 Lisans

Bu proje MIT lisansı altında sunulmuştur.

## 👨‍💻 Geliştirici

**arifk.co** - Endüstri Mühendisi & Yazılım Geliştirici

- Email: hello@arifk.co
- LinkedIn: [linkedin.com/in/arifk](linkedin.com/in/arifk)
- GitHub: [github.com/arifkco](github.com/arifkco)
