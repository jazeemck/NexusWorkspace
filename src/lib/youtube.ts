export interface YouTubeMetadata {
  title?: string;
  authorName?: string;
  thumbnailUrl?: string;
  html?: string;
  providerName?: string;
  error?: string;
}

export async function getYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return { error: `oEmbed failed with status ${res.status}` };
    }

    const data = await res.json();
    return {
      title: data.title,
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
      html: data.html,
      providerName: data.provider_name,
    };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return { error: String(error) };
  }
}
