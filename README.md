# 🐍 Python Web Editor with Behavioral Logging | Web Tabanlı Python Editörü ve Davranışsal Loglama

> This repository contains the source code and documentation for Mehmet Emin Eraslan’s thesis project at Bursa Technical University, 2024–2025.

---

## 📌 English Overview

This project implements a **web-based Python editor** that captures users’ keystroke behavior during coding sessions. The logged behavioral data is stored in MongoDB and will be used for **code plagiarism detection** based not on static similarity, but on **behavioral patterns**. This project integrates a secure backend with Firebase authentication and an admin dashboard with data visualization.

### ✅ Features

- Real-time in-browser Python editor (PyScript + Ace Editor)
- Secure Firebase Authentication
- Keystroke logging: characters typed, lines written
- Logs stored with timestamps in MongoDB
- Admin-only dashboard with interactive graphs (Chart.js)

### 🗂️ Project Structure

```bash
root/
├── public/
│   ├── index.html              # Python editor interface
│   ├── login-signup.html       # Auth pages
│   ├── admin.html              # Admin auth
│   ├── admin-dashboard.html    # Charts
│   └── static/
│       ├── css/
│       └── js/
├── index.js                    # Express server with Firebase verification
├── firebase-admin.json         # Firebase service key
├── .env                        # Mongo URI and config
├── package.json

### 🚀 Deployment
- Frontend hosted on **Render**  (`/public` folder)
- Backend deployed to **Render** (`index.js` log-server)
- Firebase console used for authentication and admin whitelisting

### 🔧 Tech Stack
- Frontend: HTML, CSS, JS, PyScript, Chart.js
- Backend: Node.js (Express), MongoDB
- Auth: Firebase Authentication
- Deployment: Render

---

## 📌 Türkçe

Bu proje, kullanıcıların kod yazma davranışlarını analiz ederek **davranışsal kod intihal tespiti** yapmayı amaçlayan bir web tabanlı Python editörüdür. Geleneksel kod karşılaştırmasının ötesine geçerek, **tuş vuruşu ve satır sayısı** gibi bilgileri MongoDB'ye kaydeder ve oluşan verilerden anomaliler bularak intihal tespiti sağlar.

### ✅ Özellikler
- Tarayıcıda gerçek zamanlı Python editörü (PyScript + Ace)
- Firebase kimlik doğrulama
- Tuş vuruşu ve satır loglaması
- MongoDB’ye zaman damgalı log gönderimi
- Admin panelinde grafiksel log görüntüleme


### 🗂️ Proje Yapısı

root/
├── public/
│   ├── index.html              # Editör ekranı
│   ├── login-signup.html       # Giriş/Kayıt ekranı
│   ├── admin.html              # Admin girişi
│   ├── admin-dashboard.html    # Log grafik ekranı
│   └── static/
│       ├── css/
│       └── js/
├── index.js                    # Express sunucu (Firebase doğrulamalı)
├── firebase-admin.json         # Firebase servis anahtarı
├── .env                        # Mongo URI ve ayarlar
├── package.json

### 🚀 Yayınlama
- Ön yüz: **Render** üzerinden (`/public`)
- Arka yüz: **Render** servisine yüklenen Express sunucu
- Firebase ile kimlik doğrulama ve admin kontrolü

### 🔧 Teknolojiler
- Frontend: HTML, CSS, JavaScript, PyScript, Chart.js
- Backend: Node.js (Express), MongoDB Atlas
- Auth: Firebase Auth
- Deploy: Render

---

## 👨‍🎓 Developer | Geliştirici

**Mehmet Emin Eraslan**
📧 mehmetemineraslan7@gmail.com
🎓 Bursa Technical University, Computer Engineering
📝 Graduation Thesis 2024–2025
👨‍🏫 Advisor: Prof. Dr. Turgay Tugay Bilgin

---

```
