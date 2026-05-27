import { supabase } from "@/lib/supabase";

const CACHE_DURATION_MS = 30 * 60 * 1000;

export async function getCache<T>(cacheKey: string): Promise<T | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("api_cache")
    .select("data, expires_at")
    .eq("cache_key", cacheKey)
    .gt("expires_at", now)
    .maybeSingle();

  if (error || !data) return null;

  return data.data as T;
}

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
    { onConflict: "cache_key" },
  );

  if (error) return;
}

export async function deleteCache(cacheKey: string): Promise<void> {
  await supabase.from("api_cache").delete().eq("cache_key", cacheKey);
}

export async function cleanExpiredCache(): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("api_cache")
    .delete()
    .lt("expires_at", now);

  if (error) return;
}

export async function cacheOrFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await getCache<T>(cacheKey);

  if (cached !== null) {
    console.log("Get from Cache: " + cacheKey);
    return cached;
  }

  const freshData = await fetcher();
  console.log("Get from Api: " + cacheKey);

  setCache(cacheKey, freshData).catch(() => {});

  return freshData;
}

export async function saveSearchHistory(
  userId: string,
  query: string,
): Promise<void> {
  if (!query.trim()) return;

  const tenMinutesAgo = new Date(Date.now() - CACHE_DURATION_MS).toISOString();

  const { data: existing } = await supabase
    .from("user_search_history")
    .select("id")
    .eq("user_id", userId)
    .eq("query", query.trim().toLowerCase())
    .gt("searched_at", tenMinutesAgo)
    .maybeSingle();

  if (existing) return;

  await supabase.from("user_search_history").insert({
    user_id: userId,
    query: query.trim().toLowerCase(),
  });
}

export async function getSearchHistory(
  userId: string,
  limit = 10,
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

export async function clearSearchHistory(userId: string): Promise<void> {
  await supabase.from("user_search_history").delete().eq("user_id", userId);
}

export async function deleteSearchHistoryItem(
  userId: string,
  query: string,
): Promise<void> {
  await supabase
    .from("user_search_history")
    .delete()
    .eq("user_id", userId)
    .eq("query", query);
}
