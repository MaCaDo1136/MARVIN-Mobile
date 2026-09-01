import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_URL = "http://192.168.20.11:8420";
const TAILSCALE_URL = "http://100.104.215.39:8420";
const SESSION_KEY = "marvin_session_id";

export async function getSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "default";
    await AsyncStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function tryFetch(base: string, message: string, sessionId: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const resp = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return data.reply as string;
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendMessage(message: string): Promise<string> {
  const sessionId = await getSessionId();
  try {
    return await tryFetch(LOCAL_URL, message, sessionId);
  } catch {
    return await tryFetch(TAILSCALE_URL, message, sessionId);
  }
}
