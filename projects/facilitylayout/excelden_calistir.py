import pandas as pd
import numpy as np
import os
import sys
import datetime
from pathlib import Path

# sonne.py modülünü içe aktarma
def import_sonne_module():
    try:
        from sonne import EnhancedUAFLP
        print("sonne.py modülü başarıyla içe aktarıldı.")
        return EnhancedUAFLP
    except ImportError:
        print("HATA: sonne.py modülü bulunamadı. Lütfen doğru klasörde olduğunuzdan emin olun.")
        sys.exit(1)

# Excel'den veri okuma fonksiyonları
def read_general_settings(excel_file):
    """Genel ayarları Excel'den oku"""
    try:
        df = pd.read_excel(excel_file, sheet_name="Genel Bilgiler", header=2, usecols=[0, 1])
        settings = dict(zip(df.iloc[:, 0], df.iloc[:, 1]))
        
        # Anahtar adlandırmalarını düzelt ve doğru türlere çevir
        return {
            'facility_width': float(settings.get('Tesis Genişliği (m)', 25)),
            'facility_height': float(settings.get('Tesis Yüksekliği (m)', 25)),
            'iterations': int(settings.get('İterasyon Sayısı', 150)),
            'tabu_tenure': int(settings.get('Tabu Liste Uzunluğu', 12)),
            'max_non_improving': int(settings.get('İyileşme Olmadan Maksimum İterasyon', 25)),
            'report_dir': settings.get('Rapor Klasörü', 'results'),
            'weights': {
                'distance': float(settings.get('Mesafe Maliyeti Ağırlığı', 0.5)),
                'adjacency': float(settings.get('Yakınlık Skoru Ağırlığı', 0.3)),
                'safety': float(settings.get('Güvenlik Skoru Ağırlığı', 0.15)),
                'flexibility': float(settings.get('Esneklik Skoru Ağırlığı', 0.05))
            }
        }
    except Exception as e:
        print(f"HATA: Genel ayarlar okunamadı: {e}")
        sys.exit(1)

def read_departments(excel_file):
    """Departman bilgilerini Excel'den oku"""
    try:
        df = pd.read_excel(excel_file, sheet_name="Departmanlar", header=3)
        departments = []
        
        for _, row in df.iterrows():
            # Boş satırları atla
            if pd.isna(row['Departman ID']) or row['Departman ID'] == '':
                continue
                
            # Sabit konum bilgisi
            if row['Sabit mi?'] in ('Evet', 'Yes', True, 1):
                fixed = True
                fixed_location = (row['Sabit Konum X'], row['Sabit Konum Y'])
            else:
                fixed = False
                fixed_location = None
                
            # Döndürülebilirlik
            can_change_direction = row['Döndürülebilir?'] in ('Evet', 'Yes', True, 1)
            
            # Dış erişim, doğal ışık ve güvenlik seviyesi
            external_access = row['Dış Erişim?'] in ('Evet', 'Yes', True, 1)
            natural_light = row['Doğal Işık?'] in ('Evet', 'Yes', True, 1)
            safety_level = int(row['Güvenlik Seviyesi']) if not pd.isna(row['Güvenlik Seviyesi']) else 0
            
            # Büyüme faktörü
            growth_factor = float(row['Büyüme Faktörü']) if not pd.isna(row['Büyüme Faktörü']) else 0.0
            
            departments.append({
                'id': row['Departman ID'],
                'width': float(row['Genişlik (m)']),
                'height': float(row['Yükseklik (m)']),
                'fixed': fixed,
                'fixed_location': fixed_location,
                'can_change_direction': can_change_direction,
                'growth_factor': growth_factor,
                'external_access_needed': external_access,
                'natural_light_needed': natural_light,
                'safety_level': safety_level
            })
            
        return departments
    except Exception as e:
        print(f"HATA: Departman bilgileri okunamadı: {e}")
        sys.exit(1)

def read_obstacles(excel_file):
    """Engel bilgilerini Excel'den oku"""
    try:
        df = pd.read_excel(excel_file, sheet_name="Engeller", header=3)
        obstacles = []
        
        for _, row in df.iterrows():
            # Boş satırları atla
            if pd.isna(row['X Koordinatı']) or pd.isna(row['Y Koordinatı']):
                continue
                
            obstacles.append({
                'x': float(row['X Koordinatı']),
                'y': float(row['Y Koordinatı']),
                'width': float(row['Genişlik (m)']),
                'height': float(row['Yükseklik (m)']),
                'type': row['Engel Tipi']
            })
            
        return obstacles
    except Exception as e:
        print(f"HATA: Engel bilgileri okunamadı: {e}")
        return []

def read_special_locations(excel_file):
    """Özel konum bilgilerini Excel'den oku"""
    try:
        df = pd.read_excel(excel_file, sheet_name="Özel Konumlar", header=3)
        locations = []
        
        for _, row in df.iterrows():
            # Boş satırları atla
            if pd.isna(row['Konum ID']) or row['Konum ID'] == '':
                continue
                
            locations.append({
                'id': row['Konum ID'],
                'x': float(row['X Koordinatı']),
                'y': float(row['Y Koordinatı']),
                'type': row['Konum Tipi']
            })
            
        return locations
    except Exception as e:
        print(f"HATA: Özel konum bilgileri okunamadı: {e}")
        return []

def read_flow_matrix(excel_file, dept_ids):
    """Akış matrisini Excel'den oku"""
    try:
        # DataFrame olarak akış matrisini oku
        df = pd.read_excel(excel_file, sheet_name="Akış Matrisi", header=3, index_col=0)
        
        # Departman ID'leri sıralı olarak alıp flowmatrix için yeni DataFrame oluştur
        flow_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
        
        # Veriyi doldur
        for i, dept1 in enumerate(dept_ids):
            for j, dept2 in enumerate(dept_ids):
                if dept1 in df.index and dept2 in df.columns:
                    flow_matrix.loc[dept1, dept2] = df.loc[dept1, dept2]
        
        return flow_matrix
    except Exception as e:
        print(f"HATA: Akış matrisi okunamadı: {e}")
        return None

def read_relationship_matrix(excel_file, dept_ids):
    """İlişki matrisini Excel'den oku"""
    try:
        # DataFrame olarak ilişki matrisini oku
        df = pd.read_excel(excel_file, sheet_name="İlişki Matrisi", header=3, index_col=0)
        
        # REL değerlerini sayısal değerlere dönüştürme sözlüğü
        rel_values = {'A': 4, 'E': 3, 'I': 2, 'O': 1, 'U': 0, 'X': -1}
        
        # Departman ID'leri sıralı olarak alıp ilişki matrisi için yeni DataFrame oluştur
        rel_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
        
        # Veriyi doldur
        for i, dept1 in enumerate(dept_ids):
            for j, dept2 in enumerate(dept_ids):
                if dept1 in df.index and dept2 in df.columns:
                    value = df.loc[dept1, dept2]
                    if isinstance(value, str) and value in rel_values:
                        rel_matrix.loc[dept1, dept2] = rel_values[value]
                    elif isinstance(value, (int, float)) and not pd.isna(value):
                        rel_matrix.loc[dept1, dept2] = value
        
        return rel_matrix
    except Exception as e:
        print(f"HATA: İlişki matrisi okunamadı: {e}")
        return None

def read_precedence_matrix(excel_file, dept_ids):
    """Öncelik matrisini Excel'den oku"""
    try:
        # DataFrame olarak öncelik matrisini oku
        df = pd.read_excel(excel_file, sheet_name="Öncelik Matrisi", header=3, index_col=0)
        
        # Departman ID'leri sıralı olarak alıp öncelik matrisi için yeni DataFrame oluştur
        prec_matrix = pd.DataFrame(0, index=dept_ids, columns=dept_ids)
        
        # Veriyi doldur
        for i, dept1 in enumerate(dept_ids):
            for j, dept2 in enumerate(dept_ids):
                if dept1 in df.index and dept2 in df.columns:
                    value = df.loc[dept1, dept2]
                    if not pd.isna(value) and value != 0:
                        prec_matrix.loc[dept1, dept2] = 1
        
        return prec_matrix
    except Exception as e:
        print(f"HATA: Öncelik matrisi okunamadı: {e}")
        return None

def read_environmental_factors(excel_file, dept_ids):
    """Çevresel faktörleri Excel'den oku"""
    try:
        # DataFrame olarak çevresel faktörleri oku
        df = pd.read_excel(excel_file, sheet_name="Çevresel Faktörler", header=3)
        
        # Çevresel faktörler için boş sözlükler oluştur
        noise_matrix = {}
        hazard_matrix = {}
        vibration_matrix = {}
        
        # Veriyi doldur
        for _, row in df.iterrows():
            dept_id = row['Departman']
            if dept_id in dept_ids:
                if not pd.isna(row['Gürültü Seviyesi (0-3)']) and row['Gürültü Seviyesi (0-3)'] > 0:
                    noise_matrix[dept_id] = row['Gürültü Seviyesi (0-3)']
                    
                if not pd.isna(row['Tehlike Seviyesi (0-3)']) and row['Tehlike Seviyesi (0-3)'] > 0:
                    hazard_matrix[dept_id] = row['Tehlike Seviyesi (0-3)']
                    
                if not pd.isna(row['Titreşim Seviyesi (0-3)']) and row['Titreşim Seviyesi (0-3)'] > 0:
                    vibration_matrix[dept_id] = row['Titreşim Seviyesi (0-3)']
        
        return noise_matrix, hazard_matrix, vibration_matrix
    except Exception as e:
        print(f"HATA: Çevresel faktörler okunamadı: {e}")
        return {}, {}, {}

def update_excel_status(excel_file, status, report_folder):
    """Excel dosyasındaki durum bilgisini güncelle"""
    try:
        # openpyxl kullanarak direkt hücreleri güncelleme
        import openpyxl
        wb = openpyxl.load_workbook(excel_file)
        sheet = wb['Hesaplama']
        
        # Durum güncelleme
        sheet['B7'] = status
        
        # Son çalışma zamanı güncelleme
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sheet['B9'] = current_time
        
        # Rapor klasörü güncelleme
        sheet['B10'] = report_folder
        
        # Kaydet ve kapat
        wb.save(excel_file)
        wb.close()
        
        print(f"Excel durum bilgisi güncellendi: {status}")
    except Exception as e:
        print(f"UYARI: Excel durum güncellenemedi: {e}")

def run_optimization_from_excel(excel_file):
    """Excel'den veri okuyarak UA-FLP optimizasyonu çalıştır"""
    print("Excel'den UA-FLP optimizasyonu başlatılıyor...")
    
    # Excel dosyası var mı kontrolü
    if not os.path.exists(excel_file):
        print(f"HATA: Excel dosyası bulunamadı: {excel_file}")
        return
    
    try:
        # EnhancedUAFLP sınıfını içe aktar
        EnhancedUAFLP = import_sonne_module()
        
        # Excel durumunu güncelle
        update_excel_status(excel_file, "Veri Okunuyor...", "")
        
        # Genel ayarları oku
        settings = read_general_settings(excel_file)
        
        # Rapor klasörü oluştur
        report_dir = settings['report_dir']
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)
            print(f"Rapor klasörü oluşturuldu: {report_dir}")
        
        # UA-FLP sınıfını başlat
        flp = EnhancedUAFLP(
            facility_width=settings['facility_width'],
            facility_height=settings['facility_height']
        )
        
        # Departmanları oku ve ekle
        departments = read_departments(excel_file)
        dept_ids = [dept['id'] for dept in departments]
        
        for dept in departments:
            flp.add_department(
                dept_id=dept['id'],
                width=dept['width'],
                height=dept['height'],
                fixed=dept['fixed'],
                fixed_location=dept['fixed_location'],
                can_change_direction=dept['can_change_direction'],
                growth_factor=dept['growth_factor'],
                external_access_needed=dept['external_access_needed'],
                natural_light_needed=dept['natural_light_needed'],
                safety_level=dept['safety_level']
            )
        
        # Engelleri oku ve ekle
        obstacles = read_obstacles(excel_file)
        for obs in obstacles:
            flp.add_obstacle(
                x=obs['x'],
                y=obs['y'],
                width=obs['width'],
                height=obs['height'],
                obstacle_type=obs['type']
            )
        
        # Özel konumları oku ve ekle
        locations = read_special_locations(excel_file)
        for loc in locations:
            flp.add_special_location(
                location_id=loc['id'],
                x=loc['x'],
                y=loc['y'],
                location_type=loc['type']
            )
        
        # Matrisleri oku ve ayarla
        flow_matrix = read_flow_matrix(excel_file, dept_ids)
        if flow_matrix is not None:
            flp.set_flow_matrix(flow_matrix)
        
        relationship_matrix = read_relationship_matrix(excel_file, dept_ids)
        if relationship_matrix is not None:
            flp.set_relationship_matrix(relationship_matrix)
        
        precedence_matrix = read_precedence_matrix(excel_file, dept_ids)
        if precedence_matrix is not None:
            flp.set_precedence_matrix(precedence_matrix)
        
        # Çevresel faktörleri oku ve ayarla
        noise_matrix, hazard_matrix, vibration_matrix = read_environmental_factors(excel_file, dept_ids)
        flp.set_environment_factors(noise_matrix, hazard_matrix, vibration_matrix)
        
        # Ağırlıkları ayarla
        flp.set_weights(settings['weights'])
        
        # Excel durumunu güncelle
        update_excel_status(excel_file, "Optimizasyon Çalışıyor...", report_dir)
        
        # Optimizasyonu çalıştır
        print("\nOptimizasyon başlatılıyor...")
        success = flp.optimize(
            iterations=settings['iterations'],
            tabu_tenure=settings['tabu_tenure'],
            max_non_improving=settings['max_non_improving'],
            report_dir=settings['report_dir']
        )
        
        # Sonucu güncelle
        if success:
            update_excel_status(excel_file, "Tamamlandı", report_dir)
            print(f"\nOptimizasyon başarıyla tamamlandı. Rapor klasörü: {report_dir}")
        else:
            update_excel_status(excel_file, "Hata Oluştu", report_dir)
            print("\nOptimizasyon sırasında hata oluştu.")
    
    except Exception as e:
        print(f"HATA: {e}")
        update_excel_status(excel_file, f"Hata: {str(e)[:30]}...", "")

if __name__ == "__main__":
    # Komut satırı argümanından Excel dosyasını al veya varsayılan kullan
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
    else:
        # Varsayılan olarak aynı klasördeki Excel dosyasını kullan
        excel_file = "UA-FLP_Veri_Sablonu.xlsx"
        # Tam yol üretme
        excel_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), excel_file)
    
    # Optimizasyonu çalıştır
    run_optimization_from_excel(excel_file)