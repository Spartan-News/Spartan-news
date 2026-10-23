# 🗞️️ Spartan News (https://shsnews.live)

A modern, fast, and accessible web application for Sparta Senior High School news broadcasts, sports scoreboards, live stream notifications, and interactive student polls. Built with Vue 3, Vite, Tailwind CSS, Firebase, and Cloudflare Workers.

---

## 🚀 Key Features

* **📺 Daily News Feed:** Interactive video player and modal overlay for watching daily announcements and school broadcasts on-site.
* **🔴 Live Stream Hub:** Dedicated view for active live streams with automatic status indicators and archived past broadcasts.
* **🏆 Scoreboard & Admin Override:** Public sports scoreboard powered by an API backend with a dedicated admin management interface for manual game score updates, clock control, and status overrides.
* **📊 Student Polls & Admin Portal:** Interactive student voting platform integrated with Firebase, complete with AdminPollsView for real-time poll creation and vote moderation.
* **🔔 Push Notifications:** Integrated with OneSignal and YouTube WebHooks (PubSubHubbub) to automatically alert subscribers when a live stream begins.

---

## 🛠️ Tech Stack

* **Frontend:** Vue 3 (Composition API / <script setup>), Vue Router, Vite, Tailwind CSS
* **Backend & Storage:** Firebase (Authentication & Firestore), Cloudflare Workers (spartan-youtube-notifier)
* **Push Notifications:** OneSignal SDK
* **Data Sources:** Custom Scoreboard API, YouTube Data API v3

---

## 📁 Repository Structure

Spartan-news/
├── public/                 # Static assets, logos & favicons
├── src/
│   ├── assets/             # Global styles & Tailwind CSS directives
│   ├── components/         # Reusable UI components (Scoreboard Widgets, Modals)
│   ├── router/             # Vue Router navigation & route guards
│   ├── services/           # Service modules (Notifications, Firebase, YouTube API)
│   ├── views/              # Core Application Views
│   │   ├── ActiveLiveView.vue    # Active live stream player
│   │   ├── AdminPollsView.vue   # Admin portal for managing polls & score overrides
│   │   ├── HomeNewsView.vue      # Daily news feed & embedded player
│   │   ├── PastLivesView.vue     # Live stream broadcast archives
│   │   ├── PollsView.vue         # Interactive student voting view
│   │   ├── ScoreboardView.vue    # Public sports scoreboard
│   │   └── SubscribeView.vue     # Push notification signup view
│   ├── App.vue             # Root application wrapper
│   └── main.js             # Application entry point
├── capacitor.config.json   # Native mobile build setup
├── generate-sitemap.mjs    # Dynamic sitemap generator
├── index.html              # Core HTML document
├── vite.config.js          # Vite build configuration
└── package.json            # Project dependencies & scripts

---

## 🔒 Admin Access & Scoreboard API

The platform provides administrative control over live scoreboard data and polls:

* **Scoreboard Control:** Admins can adjust scores, game statuses (SCHEDULED, IN_PROGRESS, FINAL), clocks, and venues manually through API endpoints when automatic feeds are offline.
* **Poll Management:** Access restricted via Firebase Authentication to create new options, open/close voting, and view raw analytics in AdminPollsView.vue.

---

## ☁️ Backend Architecture: Cloudflare Worker

The system relies on a serverless Cloudflare Worker (noti.router.app.shsnews.live) to handle CORS-free data routing and webhooks:

| Route | Method | Description |
| :--- | :--- | :--- |
| /youtube-feed | GET | Proxies YouTube playlist items for @spartannewsdaily8847 & @SpartanNewsLive. |
| /check-live | GET | Returns the current live video ID and title for @SpartanNewsLive. |
| /upcoming-streams | GET | Returns scheduled upcoming streams for @SpartanNewsLive. |
| /check-scores | GET | Handles sports schedules and scoreboard overrides. |
| /youtube-webhook | GET / POST | PubSubHubbub subscription handler that fires OneSignal push alerts when live. |

---

## 📝 License

Developed for Sparta Senior High School. All rights reserved.
