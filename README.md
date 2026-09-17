# Okur

**Her gün bir İngilizce metni sesli oku.**

Okur, İngilizce metinleri teleprompter mantığıyla ekranda kaydırarak sesli okuma pratiği yapmanı sağlayan bir PWA'dır.

Backend kullanmaz. Tüm veriler tarayıcıda ve cihaz üzerinde tutulur.

---

## Özellikler

- **Teleprompter modu** — Metin otomatik olarak kayar. Okuma hızı ve yazı boyutu ayarlanabilir.
- **Metin bölme** — Metin; cümleler, virgüller ve bağlaçlar dikkate alınarak okunabilir satırlara ayrılır.
- **Rahat / Odak modu** — Farklı okuma tempoları arasından seçim yapılabilir.
- **Kelime işaretleme** — Okuma sırasında bilmediğin kelimeleri işaretleyip daha sonra tekrar görebilirsin.
- **Streak takibi** — Günlük okuma alışkanlığını takip eder.
- **Kaldığın yerden devam etme** — Yarım kalan metinler daha sonra devam ettirilebilir.
- **Hazır metinler** — Uygulamayı denemek için örnek metinler bulunur.
- **PWA desteği** — Telefona veya bilgisayara uygulama olarak eklenebilir.
- **Açık / koyu tema**

---

## Hızlı Başlangıç

Projeyi yerel bir sunucu üzerinden çalıştırmak için:

```bash
python -m http.server 5173 --bind 0.0.0.0
```

- Bilgisayar: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Telefon (aynı Wi‑Fi): `http://<bilgisayar-ip>:5173`

Alternatif:

```bash
npx serve .
```

---

## Kullanım

1. Metni yapıştır veya hazır metinlerden birini seç.
2. **Rahat** veya **Odak** modunu seç.
3. **Okumaya başla**.
4. Sesli oku. Bilmediğin bir kelime olursa duraklatıp kelimeye dokun.
5. Metin bitince imza geçer; ardından süre özeti açılır.
   - İstersen duraklatıp **Okumamı bitir** ile manuel olarak da tamamlayabilirsin.

---

## Proje Yapısı

```
├── index.html          # Arayüz
├── css/styles.css      # Tema ve düzen
├── js/app.js           # Okuma motoru, streak, kelimeler
├── sw.js               # Service worker (önbellek)
├── manifest.json       # PWA bildirimi
└── assets/icon.svg     # Uygulama ikonu
```

Veriler `localStorage` içinde tutulur:

- `okur-data-v1`
- `okur-prefs-v1`
- `okur-progress-v1`
- `okur-vocab-v1`

---

## GitHub Pages

Public repo ile statik yayın:

1. Repo’yu GitHub’a yükle.
2. **Settings → Pages → Deploy from branch** → `main` / `/ (root)`.
3. Adres: `https://<kullanıcı>.github.io/<repo>/`

---

## Lisans

Bu proje kişisel / eğitim amaçlıdır. İstersen kendi lisansını (`MIT` vb.) ekleyebilirsin.

---

## Yapan

**Mete Artun Altay**

- LinkedIn: [mete-artun-altay](https://www.linkedin.com/in/mete-artun-altay-243a7a289)
- GitHub: [trident-10](https://github.com/trident-10)
- Mail: meteartunaltay08@gmail.com

---

*Okur — kısa günlük okumalar İngilizceni güçlendirir.*
