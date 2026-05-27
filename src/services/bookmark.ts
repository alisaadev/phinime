import { supabase } from "@/lib/supabase";

export interface Bookmark {
  id: string;
  user_id: string;
  anime_id: string;
  anime_title: string;
  poster: string | null;
  status: string | null;
  score: string | null;
  added_at: string;
}

export interface SaveBookmarkParams {
  user_id: string;
  anime_id: string;
  anime_title: string;
  poster?: string;
  status?: string;
  score?: string;
}

export async function addBookmark(params: SaveBookmarkParams): Promise<void> {
  const { error } = await supabase.from("bookmarks").upsert(
    {
      user_id: params.user_id,
      anime_id: params.anime_id,
      anime_title: params.anime_title,
      poster: params.poster ?? null,
      status: params.status ?? null,
      score: params.score ?? null,
      added_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anime_id" },
  );

  if (error) {
    console.error("[Bookmark] Gagal tambah bookmark:", error.message);
  }
}

export async function removeBookmark(
  userId: string,
  animeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("anime_id", animeId);

  if (error) {
    console.error("[Bookmark] Gagal hapus bookmark:", error.message);
  }
}

export async function toggleBookmark(
  params: SaveBookmarkParams,
): Promise<boolean> {
  const existing = await isBookmarked(params.user_id, params.anime_id);

  if (existing) {
    await removeBookmark(params.user_id, params.anime_id);
    return false;
  } else {
    await addBookmark(params);
    return true;
  }
}

export async function isBookmarked(
  userId: string,
  animeId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("anime_id", animeId)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("[Bookmark] Gagal ambil bookmark:", error.message);
    return [];
  }

  return data as Bookmark[];
}

export async function clearBookmarks(userId: string): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("[Bookmark] Gagal hapus semua bookmark:", error.message);
  }
}
