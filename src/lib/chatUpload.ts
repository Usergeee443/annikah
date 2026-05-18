import { mkdir, writeFile } from "fs/promises";
import path from "path";

const REL_DIR = "chat";

export const CHAT_MEDIA_MAX_BYTES = 12 * 1024 * 1024;

export function chatUploadRoot() {
  return path.join(process.cwd(), "private-uploads");
}

export function mediaRelPath(chatId: string, messageId: string, ext: string) {
  return `${REL_DIR}/${chatId}/${messageId}.${ext}`;
}

export function mediaAbsPath(rel: string) {
  return path.join(chatUploadRoot(), rel);
}

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const AUDIO_MIME_TO_EXT: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
};

export function extFor(kind: "image" | "audio", mime: string): string | null {
  const m = (mime || "").toLowerCase().split(";")[0].trim();
  if (kind === "image") return IMAGE_MIME_TO_EXT[m] || null;
  if (AUDIO_MIME_TO_EXT[m]) return AUDIO_MIME_TO_EXT[m];
  // Brauzerlar ba'zan audio MIME'ni codecs bilan yuboradi yoki vendor format beradi.
  if (m.startsWith("audio/webm")) return "webm";
  if (m.startsWith("audio/ogg")) return "ogg";
  if (m.startsWith("audio/mp4")) return "m4a";
  if (m.startsWith("audio/mpeg")) return "mp3";
  return null;
}

export async function saveChatMedia(opts: {
  chatId: string;
  messageId: string;
  kind: "image" | "audio";
  mimeType: string;
  bytes: Buffer;
}) {
  const ext = extFor(opts.kind, opts.mimeType);
  if (!ext) throw new Error("UNSUPPORTED_MEDIA_TYPE");
  const rel = mediaRelPath(opts.chatId, opts.messageId, ext);
  const abs = mediaAbsPath(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, opts.bytes);
  return { rel, ext };
}

