# Sparta Senior High School News Live Web App

A modern, responsive web application built for **Sparta Senior High School (Sparta, MI)** that integrates live event streaming and video archives directly from the official YouTube channels: **@SpartanNewsLive** and **@spartannewsdaily8847**.

---

## Features

* **Active Live Stream Detection**: Dynamically checks `@SpartanNewsLive` and renders an embedded live player with the active stream title whenever a broadcast goes live.
* **Dynamic Broadcast Schedule**: Automatically queries scheduled YouTube live streams (`eventType=upcoming`) and alerts viewers to upcoming events.
* **Separated Dedicated Views**:
  * **`/` (Daily News)**: Browse morning announcements and daily news broadcasts from `@spartannewsdaily8847`.
  * **`/live` (Active Stream)**: Dedicated live broadcast unit and event schedule.
  * **`/pastlives` (Past Streams & Replays)**: Watch past live event recordings and game replays.
* **In-Page Embedded Playback**: Click any video thumbnail across all feeds to play videos directly on the site without leaving the page.
* **Time & Search Filtering**: Filter video archives by timeframe (**Past Week**, **Past Month**, **All Time**) or search by video title keywords.
* **Royal Blue & White Theme**: Styled to match Sparta High School's school colors, featuring dark mode support with theme preference persisted via `localStorage`.

---

## Tech Stack

* **Framework**: Vue 3 (Composition API with `<script setup>`)
* **Routing**: Vue Router 4
* **Build Tool**: Vite
* **Styling**: Tailwind CSS v4
* **Icons**: Lucide Vue Next
* **API**: Google YouTube Data API v3

---

## Project Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/spartan-news.git](https://github.com/YourUsername/spartan-news.git)
cd spartan-news