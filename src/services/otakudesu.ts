// Anime API Client - sankavollerei.com
// Base URL: https://www.sankavollerei.com/anime
// Integrated with Cache (cache.ts)

import { cacheOrFetch, saveSearchHistory } from "@/services/cache";

const BASE_URL = "https://www.sankavollerei.com/anime";

// TYPES
export interface ApiResponse<T> {
  status: string;
  creator: string;
  statusCode: number;
  statusMessage: string;
  message: string;
  ok: boolean;
  data: T;
  pagination: Pagination | null;
}

export interface Pagination {
  currentPage: number;
  hasPrevPage: boolean;
  prevPage: number | null;
  hasNextPage: boolean;
  nextPage: number | null;
  totalPages: number;
}

export interface Genre {
  title: string;
  genreId: string;
  href: string;
  otakudesuUrl: string;
}

export interface OngoingAnime {
  title: string;
  poster: string;
  episodes: number;
  releaseDay: string;
  latestReleaseDate: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

export interface CompletedAnime {
  title: string;
  poster: string;
  episodes: number;
  score: string;
  season: string;
  lastReleaseDate: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

export interface HomeData {
  ongoing: {
    href: string;
    otakudesuUrl: string;
    animeList: OngoingAnime[];
  };
  completed: {
    href: string;
    otakudesuUrl: string;
    animeList: CompletedAnime[];
  };
}

export interface ScheduleDay {
  day: string;
  anime_list: {
    title: string;
    slug: string;
    url: string;
    poster: string;
  }[];
}

export interface EpisodeItem {
  title: string;
  eps: number;
  date: string;
  episodeId: string;
  href: string;
  otakudesuUrl: string;
}

export interface AnimeDetail {
  title: string;
  poster: string;
  japanese: string;
  score: string;
  producers: string;
  type: string;
  status: string;
  episodes: number;
  duration: string;
  aired: string;
  studios: string;
  batch: string | null;
  synopsis: {
    paragraphs: string[];
    connections: string[];
  };
  genreList: Genre[];
  episodeList: EpisodeItem[];
  recommendedAnimeList: {
    title: string;
    poster: string;
    animeId: string;
    href: string;
    otakudesuUrl: string;
  }[];
}

export interface ServerItem {
  title: string;
  serverId: string;
  href: string;
}

export interface DownloadUrl {
  title: string;
  size: string;
  urls: { title: string; url: string }[];
}

export interface EpisodeDetail {
  title: string;
  animeId: string;
  releaseTime: string;
  defaultStreamingUrl: string;
  hasPrevEpisode: boolean;
  prevEpisode: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  hasNextEpisode: boolean;
  nextEpisode: {
    title: string;
    episodeId: string;
    href: string;
    otakudesuUrl: string;
  } | null;
  server: {
    qualities: {
      title: string;
      serverList: ServerItem[];
    }[];
  };
  downloadUrl: {
    qualities: DownloadUrl[];
  };
  info: {
    credit: string;
    encoder: string;
    duration: string;
    type: string;
    genreList: Genre[];
    episodeList: EpisodeItem[];
  };
}

export interface BatchData {
  title: string;
  animeId: string;
  poster: string;
  japanese: string;
  type: string;
  score: string;
  episodes: number;
  duration: string;
  studios: string;
  producers: string;
  aired: string;
  credit: string;
  genreList: Genre[];
  downloadUrl: {
    formats: {
      title: string;
      qualities: {
        title: string;
        size: string;
        urls: { title: string; url: string }[];
      }[];
    }[];
  };
}

export interface SearchAnime {
  title: string;
  poster: string;
  status: string;
  score: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
  genreList: Genre[];
}

export interface ServerData {
  url: string;
}

export interface UnlimitedAnime {
  title: string;
  poster: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

async function fetchApi<T>(
  path: string,
): Promise<T & { pagination: Pagination | null }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${res.statusText} — ${url}`);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.ok) {
    throw new Error(`API Error: ${json.message || json.statusMessage}`);
  }

  return { ...json.data, pagination: json.pagination };
}

/** GET /anime/home — Halaman utama (ongoing + completed) */
export async function getHome(): Promise<
  HomeData & { pagination: Pagination | null }
> {
  return cacheOrFetch("anime:home", () => fetchApi<HomeData>("/home"));
}

/** GET /anime/schedule — Jadwal rilis anime per hari */
export async function getSchedule(): Promise<{
  status: string;
  creator: string;
  data: ScheduleDay[];
  pagination: Pagination | null;
}> {
  return cacheOrFetch("anime:schedule", async () => {
    const url = `${BASE_URL}/schedule`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return {
      status: json.status,
      creator: json.creator,
      data: json.data.data,
      pagination: json.pagination,
    };
  });
}

/** GET /anime/genre — Daftar semua genre */
export async function getGenres(): Promise<{
  genreList: Genre[];
  pagination: Pagination | null;
}> {
  return cacheOrFetch("anime:genres", () =>
    fetchApi<{ genreList: Genre[] }>("/genre"),
  );
}

/** GET /anime/genre/:slug — Daftar anime berdasarkan genre */
export async function getAnimeByGenre(
  genreId: string,
  page = 1,
): Promise<{ animeList: CompletedAnime[]; pagination: Pagination | null }> {
  return cacheOrFetch(`anime:genre:${genreId}:page:${page}`, () =>
    fetchApi<{ animeList: CompletedAnime[] }>(`/genre/${genreId}?page=${page}`),
  );
}

/** GET /anime/anime/:slug — Detail lengkap sebuah anime */
export async function getAnimeDetail(
  slug: string,
): Promise<AnimeDetail & { pagination: Pagination | null }> {
  return cacheOrFetch(`anime:detail:${slug}`, () =>
    fetchApi<AnimeDetail>(`/anime/${slug}`),
  );
}

/** GET /anime/ongoing-anime — Daftar anime ongoing */
export async function getOngoingAnime(
  page = 1,
): Promise<{ animeList: OngoingAnime[]; pagination: Pagination | null }> {
  return cacheOrFetch(`anime:ongoing:page:${page}`, () =>
    fetchApi<{ animeList: OngoingAnime[] }>(`/ongoing-anime?page=${page}`),
  );
}

/** GET /anime/complete-anime — Daftar anime tamat */
export async function getCompleteAnime(
  page = 1,
): Promise<{ animeList: CompletedAnime[]; pagination: Pagination | null }> {
  return cacheOrFetch(`anime:complete:page:${page}`, () =>
    fetchApi<{ animeList: CompletedAnime[] }>(`/complete-anime?page=${page}`),
  );
}

/** GET /anime/episode/:slug — Detail episode + link streaming & download */
export async function getEpisode(
  slug: string,
): Promise<EpisodeDetail & { pagination: Pagination | null }> {
  return cacheOrFetch(`anime:episode:${slug}`, () =>
    fetchApi<EpisodeDetail>(`/episode/${slug}`),
  );
}

/** GET /anime/batch/:slug — Link download batch anime */
export async function getBatch(
  slug: string,
): Promise<BatchData & { pagination: Pagination | null }> {
  return cacheOrFetch(`anime:batch:${slug}`, () =>
    fetchApi<BatchData>(`/batch/${slug}`),
  );
}

/** GET /anime/search/:keyword — Pencarian anime */
export async function searchAnime(
  keyword: string,
  userId?: string,
): Promise<{ animeList: SearchAnime[]; pagination: Pagination | null }> {
  const encoded = encodeURIComponent(keyword);
  const keywordtrim = keyword.trim().toLowerCase();

  return cacheOrFetch(`anime:search:${keywordtrim}`, async () => {
    const result = await fetchApi<{ animeList: SearchAnime[] }>(
      `/search/${encoded}`,
    );

    if (userId && keywordtrim) {
      saveSearchHistory(userId, keywordtrim).catch(() => {});
    }

    return result;
  });
}

/** GET /anime/server/:serverId — URL embed streaming berdasarkan server ID */
export async function getServerUrl(
  serverId: string,
): Promise<ServerData & { pagination: Pagination | null }> {
  return fetchApi<ServerData>(`/server/${serverId}`);
}

/** GET /anime/unlimited — Semua data anime */
export async function getAllAnime(): Promise<{
  animeList: UnlimitedAnime[];
  pagination: Pagination | null;
}> {
  return cacheOrFetch("anime:unlimited", () =>
    fetchApi<{ animeList: UnlimitedAnime[] }>("/unlimited"),
  );
}
