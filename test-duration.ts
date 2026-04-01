async function getYoutubeDuration(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const html = await res.text();
    
    // Look for approximateDurationMs
    const match = html.match(/"approxDurationMs":"(\d+)"/);
    if (match) {
      return Math.floor(parseInt(match[1]) / 1000);
    }
    
    // Look for duration string PT...
    const durationMatch = html.match(/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/);
    if (durationMatch) {
      let totalSeconds = 0;
      if (durationMatch[1]) totalSeconds += parseInt(durationMatch[1]) * 3600;
      if (durationMatch[2]) totalSeconds += parseInt(durationMatch[2]) * 60;
      if (durationMatch[3]) totalSeconds += parseInt(durationMatch[3]);
      return totalSeconds;
    }
    
    return null;
  } catch (e) {
    console.error("Error fetching duration:", e);
    return null;
  }
}

async function main() {
  const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const duration = await getYoutubeDuration(url);
  console.log(`Duration for ${url}: ${duration} seconds`);
}

main();
