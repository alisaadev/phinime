// ============================================================
// services.ts — PhiNime API Service Layer (Samehadaku)
// Base URL: https://www.sankavollerei.com/anime
// ============================================================

const BASE_URL = ""//"https://www.sankavollerei.com/anime";

// ============================================================
// TYPES
// ============================================================

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

// --- Anime List Item (recent, ongoing, completed, popular, movies, genres, search) ---
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

// --- Batch List Item ---
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

// --- Top 10 Item ---
export type Top10Item = {
  rank: number;
  title: string;
  poster: string;
  score: string;
  animeId: string;
  href: string;
  samehadakuUrl: string;
};

// --- Home Data ---
export type HomeData = {
  recent: {
    href: string;
    samehadakuUrl: string;
    animeList: AnimeListItem[];
  };
  batch: {
    href: string;
    samehadakuUrl: string;
    batchList: BatchListItem[];
  };
  movie: {
    href: string;
    samehadakuUrl: string;
    animeList: AnimeListItem[];
  };
  top10: {
    href: string;
    samehadakuUrl: string;
    animeList: Top10Item[];
  };
};

// --- Schedule ---
export type ScheduleDay = {
  day: string;
  animeList: AnimeListItem[];
};

// --- Anime Detail ---
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
  synopsis: {
    paragraphs: string[];
    connections: any[];
  };
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

// --- Episode Detail ---
export type ServerItem = {
  title: string;
  serverId: string;
  href: string;
};

export type QualityServer = {
  title: string;
  serverList: ServerItem[];
};

export type DownloadUrl = {
  formats: {
    title: string;
    qualities: {
      title: string;
      urls: { title: string; url: string }[];
    }[];
  }[];
};

export type EpisodeDetail = {
  title: string;
  animeId: string;
  poster: string;
  releasedOn: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: { title: string; episodeId: string; href: string; samehadakuUrl: string } | null;
  hasNextEpisode: boolean;
  nextEpisode: { title: string; episodeId: string; href: string; samehadakuUrl: string } | null;
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

// --- Batch Detail ---
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

// --- Server ---
export type ServerData = {
  url: string;
};

// --- List ---
export type AnimeListGroup = {
  startWith: string;
  animeList: {
    title: string;
    animeId: string;
    href: string;
    samehadakuUrl: string;
  }[];
};

// ============================================================
// HELPER
// ============================================================

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json as ApiResponse<T>;
}

// ============================================================
// ENDPOINTS
// ============================================================

/** GET /home — Beranda: recent, batch, movie, top10 */
export const getHome = () =>
  fetchApi<HomeData>("/home");

/** GET /recent?page=1 — Anime terbaru */
export const getRecent = (page = 1) =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/recent?page=${page}`);

/** GET /search?q=...&page=1 — Pencarian anime */
export const searchAnime = (query: string, page = 1) =>
  fetchApi<{ animeList: AnimeListItem[] }>(
    `/search?q=${encodeURIComponent(query)}&page=${page}`
  );

/** GET /ongoing?page=1&order=popular — Anime ongoing */
export const getOngoing = (page = 1, order: "popular" | "latest" | "update" = "popular") =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/ongoing?page=${page}&order=${order}`);

/** GET /completed?page=1&order=latest — Anime completed */
export const getCompleted = (page = 1, order: "latest" | "popular" | "update" = "latest") =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/completed?page=${page}&order=${order}`);

/** GET /populer?page=1 — Anime populer */
export const getPopular = (page = 1) =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/populer?page=${page}`);

/** GET /movies?page=1&order=update — Anime movie */
export const getMovies = (page = 1, order: "update" | "popular" | "latest" = "update") =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/movies?page=${page}&order=${order}`);

/** GET /list — Semua list anime (A-Z) */
export const getAnimeList = () =>
  fetchApi<{ list: AnimeListGroup[] }>("/list");

/** GET /schedule — Jadwal rilis per hari */
export const getSchedule = () =>
  fetchApi<{ days: ScheduleDay[] }>("/schedule");

/** GET /genres — Semua genre */
export const getGenres = () =>
  fetchApi<{ genreList: Genre[] }>("/genres");

/** GET /genres/:genreId?page=1 — Anime berdasarkan genre */
export const getByGenre = (genreId: string, page = 1) =>
  fetchApi<{ animeList: AnimeListItem[] }>(`/genres/${genreId}?page=${page}`);

/** GET /batch?page=1 — Daftar batch */
export const getBatchList = (page = 1) =>
  fetchApi<{ batchList: BatchListItem[] }>(`/batch?page=${page}`);

/** GET /anime/:animeId — Detail anime */
export const getAnimeDetail = (animeId: string) =>
  fetchApi<AnimeDetail>(`/anime/${animeId}`);

/** GET /episode/:episodeId — Detail episode + streaming + download */
export const getEpisodeDetail = (episodeId: string) =>
  fetchApi<EpisodeDetail>(`/episode/${episodeId}`);

/** GET /batch/:batchId — Detail batch + download */
export const getBatchDetail = (batchId: string) =>
  fetchApi<BatchDetail>(`/batch/${batchId}`);

/** GET /server/:serverId — URL streaming dari server tertentu */
export const getServerUrl = (serverId: string) =>
  fetchApi<ServerData>(`/server/${serverId}`);
