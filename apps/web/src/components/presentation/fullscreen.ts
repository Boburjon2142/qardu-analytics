// Thin, SSR-safe wrapper around the Fullscreen API (with the older WebKit prefix).
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as FsDocument;
  return Boolean(doc.fullscreenElement ?? doc.webkitFullscreenElement);
}

/** Must be called directly from a user gesture. Resolves false when unsupported or refused. */
export async function enterFullscreen(): Promise<boolean> {
  try {
    const el = document.documentElement as FsElement;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    }
  } catch {
    /* refused or unsupported: the presentation still works as a full-viewport overlay */
  }
  return false;
}

export function exitFullscreen(): void {
  if (!isFullscreen()) return;
  const doc = document as FsDocument;
  try {
    const result = doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen?.();
    void Promise.resolve(result).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
