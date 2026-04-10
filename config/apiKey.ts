// API Key Configuration
// The key should be provided via environment variables (VITE_GEMINI_API_KEY)
// or localStorage ('gemini_api_key') for security

export const getApiKey = (): string => {
  const envKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== "" && !envKey.includes("PLACEHOLDER")) {
    return envKey.trim();
  }
  try {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey && localKey.trim() !== "") return localKey.trim();
  } catch {}
  return "";
};
