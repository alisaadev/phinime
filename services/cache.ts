// ============================================================
// services/cache.ts — Cache Logic (Global + User History)
// ============================================================

import { supabase } from "@/lib/supabase";

const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 menit

// ============================================================
// GLOBAL CACHE
// ============================================================

/**
 * Ambil data dari cache global.
 * Return null jika tidak ada atau sudah expired.
 */
export async function getCache<T>(cacheKey: string): Promise<T | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("api_cache")
    .select("data, expires_at")
    .eq("cache_key", cacheKey)
    .gt("expires_at", now) // hanya ambil yang belum expired
    .maybeSingle();

  if (error || !data) return null;

  return data.data as T;
}

/**
 * Simpan data ke cache global.
 * Jika cache_key sudah ada, update data dan expires_at-nya (upsert).
 */
export async function setCache<T>(cacheKey: string, data: T): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS).toISOString();

  const { error } = await supabase.from("api_cache").upsert(
    {
      cache_key: cacheKey,
      data: data as any,
      created_at: now.toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "cache_key" }
  );

  if (error) {
    console.warn("[Cache] Gagal menyimpan cache:", cacheKey, error.message);
  }
}

/**
 * Hapus cache berdasarkan key (manual invalidation).
 */
export async function deleteCache(cacheKey: string): Promise<void> {
  await supabase.from("api_cache").delete().eq("cache_key", cacheKey);
}

/**
 * Hapus semua cache yang sudah expired.
 * Dipanggil secara berkala dari aplikasi sebagai cleanup.
 */
export async function cleanExpiredCache(): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("api_cache")
    .delete()
    .lt("expires_at", now);

  if (error) {
    console.warn("[Cache] Gagal cleanup expired cache:", error.message);
  }
}

// ============================================================
// CACHE-OR-FETCH — Helper utama
// ============================================================

/**
 * Cek cache dulu. Kalau ada → return cache.
 * Kalau tidak ada / expired → fetch dari API → simpan ke cache → return.
 */
export async function cacheOrFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // 1. Cek cache
  const cached = await getCache<T>(cacheKey);
  if (cached !== null) {
    console.log("[Cache] HIT:", cacheKey);
    return cached;
  }

  // 2. Fetch dari API
  console.log("[Cache] MISS — fetching:", cacheKey);
  const freshData = await fetcher();

  // 3. Simpan ke cache (fire and forget, tidak blocking)
  setCache(cacheKey, freshData).catch(() => {});

  return freshData;
}

// ============================================================
// USER SEARCH HISTORY
// ============================================================

/**
 * Simpan query pencarian ke history user.
 * Tidak menyimpan duplikat query dalam 10 menit terakhir.
 */
export async function saveSearchHistory(
  userId: string,
  query: string
): Promise<void> {
  if (!query.trim()) return;

  const tenMinutesAgo = new Date(
    Date.now() - CACHE_DURATION_MS
  ).toISOString();

  // Cek apakah query yang sama sudah disimpan dalam 10 menit terakhir
  const { data: existing } = await supabase
    .from("user_search_history")
    .select("id")
    .eq("user_id", userId)
    .eq("query", query.trim().toLowerCase())
    .gt("searched_at", tenMinutesAgo)
    .maybeSingle();

  if (existing) return; // sudah ada, skip

  await supabase.from("user_search_history").insert({
    user_id: userId,
    query: query.trim().toLowerCase(),
  });
}

/**
 * Ambil history search user (10 terbaru).
 */
export async function getSearchHistory(
  userId: string,
  limit = 10
): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_search_history")
    .select("query")
    .eq("user_id", userId)
    .order("searched_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => row.query);
}

/**
 * Hapus semua history search user.
 */
export async function clearSearchHistory(userId: string): Promise<void> {
  await supabase
    .from("user_search_history")
    .delete()
    .eq("user_id", userId);
}

/**
 * Hapus satu item history search.
 */
export async function deleteSearchHistoryItem(
  userId: string,
  query: string
): Promise<void> {
  await supabase
    .from("user_search_history")
    .delete()
    .eq("user_id", userId)
    .eq("query", query);
}
