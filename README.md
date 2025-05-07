# Django Yılan Oyunu

Modern ve eğlenceli bir yılan oyunu uygulaması. Django framework'ü kullanılarak geliştirilmiştir.

## Özellikler

- Modern ve kullanıcı dostu arayüz
- Yüksek skor sistemi
- Farklı zorluk seviyeleri
- Mobil uyumlu tasarım
- Ses efektleri
- Yılan animasyonları
- Yüksek skor tablosu

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/snake_game.git
cd snake_game
```

2. Sanal ortam oluşturun ve aktif edin:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac için
# veya
venv\Scripts\activate  # Windows için
```

3. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

4. Veritabanı migrasyonlarını yapın:
```bash
python manage.py migrate
```

5. Sunucuyu başlatın:
```bash
python manage.py runserver
```

6. Tarayıcınızda http://localhost:8000 adresine gidin

## Oyun Kontrolleri

- Yön tuşları veya WASD tuşları ile yılanı kontrol edin
- Mobil cihazlarda ekrandaki yön düğmelerini kullanın
- "Başlat" düğmesi ile oyunu başlatın
- "Duraklat" düğmesi ile oyunu duraklatın
- Zorluk seviyesini seçin (Kolay, Orta, Zor)

## Teknolojiler

- Django
- HTML5 Canvas
- JavaScript
- CSS3
- SQLite

## Lisans

MIT 