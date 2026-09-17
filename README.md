# Okur

**Her gün bir İngilizce metni sesli oku.**

Okur, İngilizce metinleri teleprompter mantığıyla ekranda kaydırarak sesli okuma pratiği yapmanı sağlayan bir PWA'dır.

Backend kullanmaz. Tüm veriler tarayıcıda ve cihaz üzerinde tutulur.

---

## Canlı Demo

https://trident-10.github.io/okur/

---

## Özellikler

- **Teleprompter modu** — Metin otomatik olarak kayar. Okuma hızı ve yazı boyutu ayarlanabilir.
- **Metin bölme** — Metin, cümleler, virgüller ve bağlaçlar dikkate alınarak okunabilir satırlara ayrılır.
- **Rahat / Odak modu** — Farklı okuma tempoları arasından seçim yapılabilir.
- **Kelime işaretleme** — Okuma sırasında bilmediğin kelimeleri işaretleyip daha sonra tekrar görebilirsin.
- **Günlük seri takibi** — Günlük okuma alışkanlığını takip eder.
- **Kaldığın yerden devam etme** — Yarım kalan metinler daha sonra devam ettirilebilir.
- **Hazır metinler** — Uygulamayı denemek için örnek metinler bulunur.
- **PWA desteği** — Telefona veya bilgisayara uygulama olarak eklenebilir.
- **Açık / koyu tema**

---

## Yerelde Çalıştırma

```bash
python -m http.server 5173
````

Ardından:

```text
http://localhost:5173
```

Alternatif olarak:

```bash
npx serve .
```

---

## Kullanım

1. Metni yapıştır veya hazır metinlerden birini seç.
2. **Rahat** veya **Odak** modunu seç.
3. **Okumaya başla**.
4. Sesli oku. Bilmediğin bir kelime olursa duraklatıp kelimeye dokun.
5. Metin bitince süre özeti açılır.
6. İstersen duraklatıp **Okumamı bitir** ile manuel olarak da tamamlayabilirsin.

---

## Proje Yapısı

```text
├── assets/
│   └── icon.svg
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── index.html
├── manifest.json
├── sw.js
└── README.md
```

* `index.html` — Uygulama arayüzü
* `css/styles.css` — Tasarım ve tema
* `js/app.js` — Okuma akışı ve uygulama mantığı
* `sw.js` — Service Worker ve önbellek yönetimi
* `manifest.json` — PWA yapılandırması

Veriler `localStorage` içinde tutulur:

* `okur-data-v1`
* `okur-prefs-v1`
* `okur-progress-v1`
* `okur-vocab-v1`

---

## Teknolojiler

HTML, CSS, JavaScript, LocalStorage, Service Worker ve Web App Manifest.

---

## Geliştirici

**Mete Artun Altay**

* LinkedIn: [mete-artun-altay](https://www.linkedin.com/in/mete-artun-altay-243a7a289)
* GitHub: [trident-10](https://github.com/trident-10)
* Mail: [meteartunaltay08@gmail.com](mailto:meteartunaltay08@gmail.com)
