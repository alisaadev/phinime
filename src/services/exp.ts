import { supabase } from "@/lib/supabase";

export const MAX_LEVEL = 93;
export const EXP_PER_EPISODE_PAIR = 1;
export const EXP_TO_LEVEL_LOW = 10;
export const EXP_TO_LEVEL_HIGH = 20;
export const LEVEL_PER_RANK = 20;

export interface RankData {
  id: number;
  name: string;
  philosophy: string;
  profileText: string;
  rankUpText: string;
  color: string;
}

export const RANKS: RankData[] = [
  {
    id: 1,
    name: "Wandering Nymph",
    philosophy:
      "Langkah awal seorang penjelajah yang baru menapakkan kaki di dunia baru, mencari makna dan cerita.",
    profileText: "Mencari jejak kisah di bawah langit luas.",
    rankUpText:
      "Selamat datang, Jiwa Baru. Langkah pertamamu sebagai Wandering Nymph telah terukir di altar waktu.",
    color: "#A78BFA",
  },
  {
    id: 2,
    name: "Sacred Nymph",
    philosophy:
      "Pengguna yang mulai menetap, menjaga konsistensi, dan dedikasinya mulai diakui oleh sistem.",
    profileText: "Menjaga api cerita agar tetap abadi.",
    rankUpText:
      "Kesetiaanmu berbuah manis. Kini, semesta menyambutmu sebagai Sacred Nymph yang anggun.",
    color: "#34D399",
  },
  {
    id: 3,
    name: "Ancient Nymph",
    philosophy:
      "Pengguna senior yang sudah mengumpulkan banyak sekali Exp dan memahami seluk-beluk sistem dengan bijaksana.",
    profileText: "Saksi bisu dari jutaan memori yang tercipta.",
    rankUpText:
      "Waktu telah menempa jiwamu. Kebijaksanaanmu kini bersinar sebagai seorang Ancient Nymph.",
    color: "#FBBF24",
  },
  {
    id: 4,
    name: "Royal Nymph",
    philosophy:
      "Tingkatan tertinggi. Pengguna yang berada di puncak, dihormati, dan menjadi panutan bagi yang lain.",
    profileText: "Bertahta di atas epos keabadian.",
    rankUpText:
      "Tundukkan kepala, karena sang legenda telah tiba. Singgasana keabadian kini menjadi milikmu, Royal Nymph.",
    color: "#F87171",
  },
];

export interface UserExp {
  id: string;
  user_id: string;
  exp: number;
  level: number;
  rank: number;
  ep_counter: number;
  updated_at: string;
}

export interface LevelUpResult {
  didLevelUp: boolean;
  didRankUp: boolean;
  newLevel: number;
  newRank: number;
  prevLevel: number;
  prevRank: number;
}

export function expRequiredForLevel(level: number): number {
  if (level >= MAX_LEVEL) return Infinity;
  return level >= 10 ? EXP_TO_LEVEL_HIGH : EXP_TO_LEVEL_LOW;
}

export function getRankFromLevel(level: number): number {
  if (level <= 20) return 1;
  if (level <= 40) return 2;
  if (level <= 60) return 3;
  return 4;
}

export function calculateLevelUp(
  currentLevel: number,
  currentExp: number,
  addedExp: number,
): { level: number; remainingExp: number } {
  let level = currentLevel;
  let exp = currentExp + addedExp;

  while (level < MAX_LEVEL) {
    const needed = expRequiredForLevel(level);
    if (exp >= needed) {
      exp -= needed;
      level++;
    } else {
      break;
    }
  }

  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, remainingExp: 0 };
  }

  return { level, remainingExp: exp };
}

export function getLevelProgress(level: number, exp: number): number {
  if (level >= MAX_LEVEL) return 100;
  const needed = expRequiredForLevel(level);

  return Math.min(100, Math.round((exp / needed) * 100));
}

export async function getUserExp(userId: string): Promise<UserExp | null> {
  const { data, error } = await supabase
    .from("user_exp")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[EXP] Gagal ambil data:", error.message);
    return null;
  }

  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from("user_exp")
      .insert({ user_id: userId })
      .select()
      .single();

    if (insertError) {
      console.error("[EXP] Gagal buat record:", insertError.message);
      return null;
    }

    return newData as UserExp;
  }

  return data as UserExp;
}

export async function addEpisodeExp(
  userId: string,
): Promise<LevelUpResult | null> {
  const current = await getUserExp(userId);
  if (!current) return null;

  const newCounter = current.ep_counter + 1;
  const gainedExp = newCounter % 2 === 0 ? EXP_PER_EPISODE_PAIR : 0;

  if (gainedExp === 0) {
    await supabase
      .from("user_exp")
      .update({ ep_counter: newCounter, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return null;
  }

  const { level: newLevel, remainingExp } = calculateLevelUp(
    current.level,
    current.exp,
    gainedExp,
  );

  const newRank = getRankFromLevel(newLevel);
  const prevLevel = current.level;
  const prevRank = current.rank;

  const { error } = await supabase
    .from("user_exp")
    .update({
      exp: remainingExp,
      level: newLevel,
      rank: newRank,
      ep_counter: newCounter,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[EXP] Gagal update exp:", error.message);
    return null;
  }

  return {
    didLevelUp: newLevel > prevLevel,
    didRankUp: newRank > prevRank,
    newLevel,
    newRank,
    prevLevel,
    prevRank,
  };
}
