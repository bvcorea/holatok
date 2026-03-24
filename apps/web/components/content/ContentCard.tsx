"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Heart, Bookmark, Eye, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { likeContent, bookmarkContent } from "@/actions/content";
import { cn } from "@/lib/utils";

const CATEGORY_BADGE: Record<string, "kpop" | "kdrama" | "kbeauty" | "kfood" | "ktravel"> = {
  KPOP: "kpop",
  KDRAMA: "kdrama",
  KBEAUTY: "kbeauty",
  KFOOD: "kfood",
  KTRAVEL: "ktravel",
};

const CATEGORY_LABEL: Record<string, string> = {
  KPOP: "K-Pop",
  KDRAMA: "K-Drama",
  KBEAUTY: "K-Beauty",
  KFOOD: "K-Food",
  KTRAVEL: "K-Travel",
};

interface ContentCardProps {
  id: string;
  title: string;
  titleEs?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  viewCount: number;
  likesCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  sourceType: string;
  sourceId: string;
}

export function ContentCard({
  id,
  title,
  titleEs,
  thumbnailUrl,
  category,
  viewCount,
  likesCount,
  bookmarksCount,
  isLiked = false,
  isBookmarked = false,
  sourceType,
  sourceId,
}: ContentCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likes, setLikes] = useState(likesCount);
  const [isPending, startTransition] = useTransition();

  const displayTitle = titleEs ?? title;

  const handleLike = () => {
    startTransition(async () => {
      const res = await likeContent(id);
      if (!("error" in res)) {
        setLiked(res.liked);
        setLikes((prev) => (res.liked ? prev + 1 : prev - 1));
      }
    });
  };

  const handleBookmark = () => {
    startTransition(async () => {
      const res = await bookmarkContent(id);
      if (!("error" in res)) {
        setBookmarked(res.bookmarked);
      }
    });
  };

  const videoUrl =
    sourceType === "YOUTUBE"
      ? `https://www.youtube.com/watch?v=${sourceId}`
      : `https://www.tiktok.com/@/video/${sourceId}`;

  return (
    <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all">
      {/* Thumbnail */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-video bg-muted overflow-hidden"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={displayTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FF6B6B]/20 to-[#4A90D9]/20">
            <PlayCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <div className="absolute top-2 left-2">
          <Badge variant={CATEGORY_BADGE[category] ?? "default"}>
            {CATEGORY_LABEL[category] ?? category}
          </Badge>
        </div>
      </a>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-2 leading-snug">
          {displayTitle}
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{viewCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              disabled={isPending}
              className={cn(
                "flex items-center gap-1 hover:text-[#4A90D9] transition-colors",
                bookmarked && "text-[#4A90D9]"
              )}
            >
              <Bookmark
                className="h-3.5 w-3.5"
                fill={bookmarked ? "currentColor" : "none"}
              />
              <span>{bookmarksCount}</span>
            </button>

            <button
              onClick={handleLike}
              disabled={isPending}
              className={cn(
                "flex items-center gap-1 hover:text-[#FF6B6B] transition-colors",
                liked && "text-[#FF6B6B]"
              )}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={liked ? "currentColor" : "none"}
              />
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
