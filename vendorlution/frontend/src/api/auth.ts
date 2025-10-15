import api from "./client";
import { tokenStore } from "./tokenStore";

type LoginResponse = { access: string; refresh: string } | { access_token: string; refresh_token: string };

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/token/", { username, password });
  const access = (data as any).access || (data as any).access_token;
  const refresh = (data as any).refresh || (data as any).refresh_token;
  tokenStore.set({ access, refresh });
  return data;
}

export function logout() {
  tokenStore.clear();
}
