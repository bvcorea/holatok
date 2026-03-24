/**
 * YouTube K-Culture Content Fetcher
 *
 * Usage:
 *   DATABASE_URL=... YOUTUBE_API_KEY=... ts-node -P scripts/tsconfig.json scripts/fetch-youtube.ts
 *
 * Fetches YouTube videos by search query and upserts them into the Content table.
 */

import { PrismaClient, KCategory } from "@prisma/client";

const prisma = new PrismaClient();

const QUERIES: Array<{ query: string; category: KCategory }> = [
  { query: "K-Pop 2024 MV oficial en español", category: "KPOP" },
  { query: "K-Drama 2024 tráiler subtítulos español", category: "KDRAMA" },
  { query: "K-Beauty tutorial español latinoamérica", category: "KBEAUTY" },
  { query: "comida coreana receta español", category: "KFOOD" },
  { query: "viaje corea seoul guía español", category: "KTRAVEL" },
];

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { high: { url: string } };
    publishedAt: string;
  };
}

async function fetchYouTubeVideos(
  query: string,
  apiKey: string,
  maxResults = 10
): Promise<YouTubeSearchResult[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    relevanceLanguage: "es",
    key: apiKey,
  });

  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error: ${res.status} — ${err}`);
  }

  const data = (await res.json()) as { items: YouTubeSearchResult[] };
  return data.items ?? [];
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY env var is required");
  }

  let totalUpserted = 0;

  for (const { query, category } of QUERIES) {
    console.log(`\n🔍 Fetching: "${query}" (${category})`);

    const videos = await fetchYouTubeVideos(query, apiKey);
    console.log(`   Found ${videos.length} videos`);

    for (const video of videos) {
      const sourceId = video.id.videoId;
      const title = video.snippet.title;
      const thumbnailUrl = video.snippet.thumbnails.high?.url;
      const publishedAt = new Date(video.snippet.publishedAt);

      await prisma.content.upsert({
        where: {
          sourceType_sourceId: { sourceType: "YOUTUBE", sourceId },
        },
        update: {
          title,
          thumbnailUrl,
          published: true,
        },
        create: {
          sourceType: "YOUTUBE",
          sourceId,
          title,
          thumbnailUrl,
          category,
          published: true,
          publishedAt,
          videoUrl: `https://www.youtube.com/watch?v=${sourceId}`,
        },
      });

      totalUpserted++;
      process.stdout.write(".");
    }
  }

  console.log(`\n\n✅ Upserted ${totalUpserted} YouTube videos`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
