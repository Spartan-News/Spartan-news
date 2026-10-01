const WORKER_URL = 'https://spartan-youtube-notifier.lsg1.workers.dev';

export async function fetchLatestVideos(handle = 'spartannewsdaily8847') {
  try {
    const res = await fetch(`${WORKER_URL}/youtube-feed?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching YouTube feed from worker:', error);
    return [];
  }
}

export async function checkLiveStatus(handle = 'SpartanNewsLive') {
  try {
    const res = await fetch(`${WORKER_URL}/check-live?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) return { isLive: false, videoId: null };
    return await res.json();
  } catch (error) {
    return { isLive: false, videoId: null };
  }
}

export async function fetchUpcomingStreams(handle = 'SpartanNewsLive') {
  return [];
}