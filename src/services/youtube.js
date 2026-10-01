const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const CHANNELS = {
  daily: 'spartannewsdaily8847',
  live: 'SpartanNewsLive'
};

const channelIdCache = {};

function ensureHandlePrefix(handle) {
  if (!handle) return '';
  return handle.startsWith('@') ? handle : `@${handle}`;
}

async function getChannelId(handle) {
  const formattedHandle = ensureHandlePrefix(handle);

  if (channelIdCache[formattedHandle]) {
    return channelIdCache[formattedHandle];
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(formattedHandle)}&key=${API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].id;
      channelIdCache[formattedHandle] = channelId;
      return channelId;
    }
    console.warn(`No channel found for handle: ${formattedHandle}`);
    return null;
  } catch (err) {
    console.error('Error resolving channel ID:', err);
    return null;
  }
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body.textContent || str;
}

export async function fetchLatestVideos(handle = CHANNELS.daily, maxResults = 12) {
  try {
    const channelId = await getChannelId(handle);
    if (!channelId) return [];

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&type=video&key=${API_KEY}`;

    const videosRes = await fetch(url);
    const videosData = await videosRes.json();

    if (!videosData.items) return [];

    return videosData.items.map(item => ({
      id: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title),
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAtRaw: item.snippet.publishedAt,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

export async function checkLiveStatus(handle = CHANNELS.live) {
  try {
    const channelId = await getChannelId(handle);
    if (!channelId) return { isLive: false, videoId: null, title: 'Channel not found' };

    const liveRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${API_KEY}`
    );
    const liveData = await liveRes.json();

    if (liveData.items && liveData.items.length > 0) {
      return {
        isLive: true,
        videoId: liveData.items[0].id.videoId,
        title: decodeHtmlEntities(liveData.items[0].snippet.title),
        thumbnail: liveData.items[0].snippet.thumbnails.high?.url
      };
    }
    return { isLive: false, videoId: null, title: 'No stream currently active' };
  } catch (error) {
    console.error('Error checking live stream status:', error);
    return { isLive: false, videoId: null };
  }
}

export async function fetchUpcomingStreams(handle = CHANNELS.live) {
  try {
    const channelId = await getChannelId(handle);
    if (!channelId) return [];

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&order=date&key=${API_KEY}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) return [];

    return data.items.map(item => ({
      id: item.id.videoId,
      title: decodeHtmlEntities(item.snippet.title),
      scheduledTime: new Date(item.snippet.publishedAt).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }));
  } catch (error) {
    console.error('Error fetching upcoming streams:', error);
    return [];
  }
}