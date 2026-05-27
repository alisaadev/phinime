import { supabase } from "@/lib/supabase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "460160956613-v4pkpf70ulsipri4ntjqpl1ad7homcat.apps.googleusercontent.com",
  scopes: ["profile", "email"],
});

export type AuthResult = {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar: string;
  };
  error?: string;
};

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();

    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) {
      return { success: false, error: "Gagal mendapatkan token Google" };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const user = data.user;

    return {
      success: true,
      user: {
        id: user?.id ?? "",
        email: user?.email ?? "",
        name: user?.user_metadata?.full_name ?? "",
        avatar: user?.user_metadata?.avatar_url ?? "",
      },
    };
  } catch (error: any) {
    const { statusCodes } =
      await import("@react-native-google-signin/google-signin");

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, error: "Login dibatalkan" };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: "Login sedang dalam proses" };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: "Google Play Services tidak tersedia" };
    }

    return { success: false, error: error.message ?? "Terjadi kesalahan" };
  }
}

export async function signOut(): Promise<void> {
  await GoogleSignin.signOut();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? "",
    avatar: user.user_metadata?.avatar_url ?? "",
    provider: user.app_metadata?.provider ?? "unknown",
  };
}

export function listenAuthChange(callback: (user: any | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
