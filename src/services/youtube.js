const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const CHANNELS = {
  daily: 'spartannewsdaily8847',
  live: 'SpartanNewsLive'
};

/**
 * Fetch latest uploaded videos for a specific channel handle
 * Supports time filtering (publishedAfter) and custom result limits
 */
export async function fetchLatestVideos(handle = CHANNELS.daily, maxResults = 12, publishedAfter = null) {
  try {
    // 1. Get channel ID from handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelData.items?.length) return [];

    const channelId = channelData.items[0].id;

    // 2. Build search query
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=${maxResults}&type=video&key=${API_KEY}`;
    
    if (publishedAfter) {
      url += `&publishedAfter=${publishedAfter}`;
    }

    const videosRes = await fetch(url);
    const videosData = await videosRes.json();

    if (!videosData.items) return [];

    // 3. Format and return video objects
    return videosData.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url,
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

/**
 * Check if a channel currently has an active live stream
 */
export async function checkLiveStatus(handle = CHANNELS.live) {
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelData.items?.length) return null;

    const channelId = channelData.items[0].id;

    const liveRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${API_KEY}`
    );
    const liveData = await liveRes.json();

    if (liveData.items && liveData.items.length > 0) {
      return {
        isLive: true,
        videoId: liveData.items[0].id.videoId,
        title: liveData.items[0].snippet.title,
      };
    }
    return { isLive: false, videoId: null, title: 'No stream currently active' };
  } catch (error) {
    console.error('Error checking live stream status:', error);
    return { isLive: false, videoId: null };
  }
}

/**
 * Fetch upcoming scheduled live streams for a channel
 */
export async function fetchUpcomingStreams(handle = CHANNELS.live) {
  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelData.items?.length) return [];

    const channelId = channelData.items[0].id;

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&order=date&key=${API_KEY}`
    );
    const data = await res.json();

    if (!data.items || data.items.length === 0) return [];

    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
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