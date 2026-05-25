// services/api.ts — API Service + Cache Terintegrasi

import { cacheOrFetch, saveSearchHistory } from "@/services/cache";

const BASE_URL = "https://www.sankavollerei.com/anime/samehadaku";

// TYPES
export type ApiResponse<T> = {
  status: "success" | "error";
  creator: string;
  message: string;
  data: T;
  pagination: Pagination | null;
};

export type Pagination = {
  currentPage: number;
  hasPrevPage: boolean;
  prevPage: number | null;
  hasNextPage: boolean;
  nextPage: number | null;
  totalPages: number;
};

export type Genre = {
  title: string;
  genreId: string;
  href: string;
  samehadakuUrl: string;
};

export type AnimeListItem = {
  title: string;
  poster: string;
  type?: string;
  score?: string;
  status?: string;
  episodes?: string;
  releasedOn?: string;
  releaseDate?: string;
  estimation?: string;
  genres?: string;
  animeId: string;
  href: string;
  samehadakuUrl: string;
  genreList?: Genre[];
};

export type BatchListItem = {
  title: string;
  poster: string;
  type?: string;
  score?: string;
  status?: string;
  batchId: string;
  href: string;
  samehadakuUrl: string;
  genreList?: Genre[];
};

export type Top10Item = {
  rank: number;
  title: string;
  poster: string;
  score: string;
  animeId: string;
  href: string;
  samehadakuUrl: string;
};

export type HomeData = {
  recent: { href: string; samehadakuUrl: string; animeList: AnimeListItem[] };
  batch: { href: string; samehadakuUrl: string; batchList: BatchListItem[] };
  movie: { href: string; samehadakuUrl: string; animeList: AnimeListItem[] };
  top10: { href: string; samehadakuUrl: string; animeList: Top10Item[] };
};

export type ScheduleDay = {
  day: string;
  animeList: AnimeListItem[];
};

export type AnimeDetail = {
  title: string;
  poster: string;
  score: { value: string; users: string } | string;
  japanese?: string;
  synonyms?: string;
  english?: string;
  status: string;
  type: string;
  source?: string;
  duration?: string;
  episodes: number;
  season?: string;
  studios?: string;
  producers?: string;
  aired?: string;
  trailer?: string;
  synopsis: { paragraphs: string[]; connections: any[] };
  genreList: Genre[];
  batchList?: {
    title: string;
    batchId: string;
    href: string;
    samehadakuUrl: string;
  }[];
  episodeList?: {
    title: number;
    episodeId: string;
    href: string;
    samehadakuUrl: string;
  }[];
};

export type ServerItem = { title: string; serverId: string; href: string };
export type QualityServer = { title: string; serverList: ServerItem[] };
export type DownloadUrl = {
  formats: {
    title: string;
    qualities: { title: string; urls: { title: string; url: string }[] }[];
  }[];
};

export type EpisodeDetail = {
  title: string;
  animeId: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: {
    title: string;
    episodeId: string;
    href: string;
    samehadakuUrl: string;
  } | null;
  hasNextEpisode: boolean;
  nextEpisode: {
    title: string;
    episodeId: string;
    href: string;
    samehadakuUrl: string;
  } | null;
  synopsis: { paragraphs: string[]; connections: any[] };
  genreList: Genre[];
  server: { qualities: QualityServer[] };
  downloadUrl: DownloadUrl;
  recommendedEpisodeList: {
    title: string;
    poster: string;
    releaseDate: string;
    episodeId: string;
    href: string;
    samehadakuUrl: string;
  }[];
};

export type BatchDetail = {
  title: string;
  animeId: string;
  poster: string;
  japanese?: string;
  synonyms?: string;
  english?: string;
  status: string;
  type: string;
  source?: string;
  score?: string;
  duration?: string;
  episodes: number;
  season?: string;
  studios?: string;
  producers?: string;
  aired?: string;
  releasedOn?: string;
  synopsis: { paragraphs: string[]; connections: any[] };
  genreList: Genre[];
  downloadUrl: DownloadUrl;
  recommendedAnimeList: AnimeListItem[];
};

export type ServerData = { url: string };

export type AnimeListGroup = {
  startWith: string;
  animeList: {
    title: string;
    animeId: string;
    href: string;
    samehadakuUrl: string;
  }[];
};

async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();

  if (json.status !== "success") {
    throw new Error(`API returned error: ${json.message}`);
  }

  return json.data;
}

/**
 * Home — refresh tiap 10 menit (global cache)
 * Berisi: recent, batch, movie, top10
 */
export const getHome = () =>
  cacheOrFetch<HomeData>("home", () => fetchApi<HomeData>("/home"));

/**
 * Recent — cache per halaman
 */
export const getRecent = (page = 1) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(`recent:page:${page}`, () =>
    fetchApi(`/recent?page=${page}`),
  );

/**
 * Search — cache per query + halaman (global)
 * userId opsional: jika diberikan, query disimpan ke history user
 */
export const searchAnime = async (query: string, page = 1, userId?: string) => {
  const trimmed = query.trim().toLowerCase();
  const cacheKey = `search:${trimmed}:page:${page}`;

  const result = await cacheOrFetch<{ animeList: AnimeListItem[] }>(
    cacheKey,
    () => fetchApi(`/search?q=${encodeURIComponent(trimmed)}&page=${page}`),
  );

  // Simpan ke history user (fire and forget)
  if (userId && trimmed) {
    saveSearchHistory(userId, trimmed).catch(() => {});
  }

  return result;
};

/**
 * Ongoing — cache per halaman + order
 */
export const getOngoing = (
  page = 1,
  order: "popular" | "latest" | "update" = "popular",
) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(
    `ongoing:${order}:page:${page}`,
    () => fetchApi(`/ongoing?page=${page}&order=${order}`),
  );

/**
 * Completed — cache per halaman + order
 */
export const getCompleted = (
  page = 1,
  order: "latest" | "popular" | "update" = "latest",
) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(
    `completed:${order}:page:${page}`,
    () => fetchApi(`/completed?page=${page}&order=${order}`),
  );

/**
 * Popular — cache per halaman
 */
export const getPopular = (page = 1) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(`popular:page:${page}`, () =>
    fetchApi(`/populer?page=${page}`),
  );

/**
 * Movies — cache per halaman + order
 */
export const getMovies = (
  page = 1,
  order: "update" | "popular" | "latest" = "update",
) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(
    `movies:${order}:page:${page}`,
    () => fetchApi(`/movies?page=${page}&order=${order}`),
  );

/**
 * Anime List A-Z — jarang berubah, cache lebih lama tidak masalah
 */
export const getAnimeList = () =>
  cacheOrFetch<{ list: AnimeListGroup[] }>("anime_list", () =>
    fetchApi("/list"),
  );

/**
 * Schedule — refresh tiap 10 menit
 */
export const getSchedule = () =>
  cacheOrFetch<{ days: ScheduleDay[] }>("schedule", () =>
    fetchApi("/schedule"),
  );

/**
 * Genres — jarang berubah
 */
export const getGenres = () =>
  cacheOrFetch<{ genreList: Genre[] }>("genres", () => fetchApi("/genres"));

/**
 * Anime by Genre — cache per genreId + halaman
 */
export const getByGenre = (genreId: string, page = 1) =>
  cacheOrFetch<{ animeList: AnimeListItem[] }>(
    `genre:${genreId}:page:${page}`,
    () => fetchApi(`/genres/${genreId}?page=${page}`),
  );

/**
 * Batch List — cache per halaman
 */
export const getBatchList = (page = 1) =>
  cacheOrFetch<{ batchList: BatchListItem[] }>(`batch_list:page:${page}`, () =>
    fetchApi(`/batch?page=${page}`),
  );

/**
 * Detail Anime — cache per animeId
 */
export const getAnimeDetail = (animeId: string) =>
  cacheOrFetch<AnimeDetail>(`anime:${animeId}`, () =>
    fetchApi(`/anime/${animeId}`),
  );

/**
 * Detail Episode — cache per episodeId
 */
export const getEpisodeDetail = (episodeId: string) =>
  cacheOrFetch<EpisodeDetail>(`episode:${episodeId}`, () =>
    fetchApi(`/episode/${episodeId}`),
  );

/**
 * Detail Batch — cache per batchId
 */
export const getBatchDetail = (batchId: string) =>
  cacheOrFetch<BatchDetail>(`batch:${batchId}`, () =>
    fetchApi(`/batch/${batchId}`),
  );

/**
 * Server URL — TIDAK di-cache karena URL streaming biasanya temporary
 */
export const getServerUrl = (serverId: string) =>
  fetchApi<ServerData>(`/server/${serverId}`);
