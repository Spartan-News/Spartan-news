const CONSENT_KEY = 'spartan_news_cookie_consent';
const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const GTM_ID = 'GTM-MSHNS7MP';

export function readCookieConsent() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (
      !saved ||
      typeof saved.analytics !== 'boolean' ||
      !Number.isFinite(saved.savedAt) ||
      Date.now() - saved.savedAt > CONSENT_MAX_AGE
    ) return null;
    return saved;
  } catch {
    return null;
  }
}

export function saveCookieConsent(analytics) {
  const previous = readCookieConsent();
  const consent = { analytics, savedAt: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  updateGoogleConsent(analytics);
  if (analytics) loadGoogleTagManager();
  if (previous?.analytics && !analytics) window.location.reload();
  return consent;
}

function updateGoogleConsent(analytics) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}

function loadGoogleTagManager() {
  if (document.getElementById('google-tag-manager')) return;
  window.gtag('js', new Date());
  const script = document.createElement('script');
  script.id = 'google-tag-manager';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}
