import { WORKER_URL } from './config.js';

async function fetchWorkerJson(path, action) {
  const response = await fetch(`${WORKER_URL}${path}`);
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`The YouTube worker returned an invalid response while ${action}.`);
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`The YouTube worker returned an invalid response while ${action}.`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Unable to ${action} (status ${response.status}).`);
  }

  return data;
}

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
  const data = await fetchWorkerJson(
    `/check-live?handle=${encodeURIComponent(handle)}`,
    'check YouTube live status'
  );

  if (typeof data.isLive !== 'boolean') {
    throw new Error(data.error || 'The YouTube worker did not return live status.');
  }

  if (data.isLive && typeof data.videoId !== 'string') {
    throw new Error('The YouTube worker reported a live stream without a video ID.');
  }

  return {
    isLive: data.isLive,
    videoId: data.videoId || null,
    title: typeof data.title === 'string' ? data.title : '',
  };
}

export async function fetchUpcomingStreams(handle = 'SpartanNewsLive') {
  const data = await fetchWorkerJson(
    `/upcoming-streams?handle=${encodeURIComponent(handle)}`,
    'fetch upcoming YouTube streams'
  );

  if (!Array.isArray(data.items)) {
    throw new Error(data.error || 'The YouTube worker did not return upcoming streams.');
  }

  return data.items.map(stream => {
    if (
      !stream ||
      typeof stream.id !== 'string' ||
      typeof stream.title !== 'string' ||
      typeof stream.scheduledTime !== 'string'
    ) {
      throw new Error('The YouTube worker returned an invalid upcoming stream.');
    }

    return stream;
  });
}
