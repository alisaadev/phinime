import { supabase } from "@/lib/supabase";

export interface WatchHistory {
  id: string;
  user_id: string;
  anime_id: string;
  episode_id: string;
  anime_title: string;
  ep_title: string;
  poster: string | null;
  progress_ms: number;
  duration_ms: number;
  watched_at: string;
}

export interface SaveWatchHistoryParams {
  user_id: string;
  anime_id: string;
  episode_id: string;
  anime_title: string;
  ep_title: string;
  poster?: string;
  progress_ms: number;
  duration_ms: number;
}

export function getProgressPercent(history: WatchHistory): number {
  if (!history.duration_ms || history.duration_ms === 0) return 0;

  return Math.min(
    100,
    Math.round((history.progress_ms / history.duration_ms) * 100),
  );
}

export function isWatched(history: WatchHistory): boolean {
  return getProgressPercent(history) >= 90;
}

export function formatProgress(history: WatchHistory): string {
  const fmt = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const sec = (totalSec % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return `${fmt(history.progress_ms)} / ${fmt(history.duration_ms)}`;
}

export async function saveWatchHistory(
  params: SaveWatchHistoryParams,
): Promise<void> {
  const { error } = await supabase.from("watch_history").upsert(
    {
      user_id: params.user_id,
      anime_id: params.anime_id,
      episode_id: params.episode_id,
      anime_title: params.anime_title,
      ep_title: params.ep_title,
      poster: params.poster ?? null,
      progress_ms: params.progress_ms,
      duration_ms: params.duration_ms,
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,episode_id" },
  );

  if (error) {
    console.error("[History] Gagal simpan history:", error.message);
  }
}

export async function getWatchHistory(
  userId: string,
  limit = 50,
): Promise<WatchHistory[]> {
  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[History] Gagal ambil history:", error.message);
    return [];
  }

  return data as WatchHistory[];
}

export async function getEpisodeProgress(
  userId: string,
  episodeId: string,
): Promise<WatchHistory | null> {
  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (error) {
    console.error("[History] Gagal ambil progress episode:", error.message);
    return null;
  }

  return data as WatchHistory | null;
}

export async function getAnimeWatchHistory(
  userId: string,
  animeId: string,
): Promise<WatchHistory[]> {
  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .eq("anime_id", animeId)
    .order("watched_at", { ascending: false });

  if (error) {
    console.error("[History] Gagal ambil history anime:", error.message);
    return [];
  }

  return data as WatchHistory[];
}
