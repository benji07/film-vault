import { DEFAULT_CAMERAS } from "@/constants/cameras";

const STORAGE_KEY = "filmvault-data";
let storageAvailable = false;

export async function checkStorage() {
  try {
    localStorage.setItem("filmvault-test", "1");
    localStorage.removeItem("filmvault-test");
    storageAvailable = true;
    return true;
  } catch {
    storageAvailable = false;
    return false;
  }
}

export function isStorageAvailable() {
  return storageAvailable;
}

export async function loadData() {
  if (!storageAvailable) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.films)) return parsed;
    }
  } catch (e) {
    console.log("Load error:", e?.message || e);
  }
  return null;
}

export async function saveData(data) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getInitialData() {
  return {
    films: [],
    cameras: DEFAULT_CAMERAS,
    version: 1,
  };
}
