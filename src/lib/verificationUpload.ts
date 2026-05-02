import { mkdir, writeFile } from "fs/promises";
import path from "path";

const REL_DIR = "listing-verify";

export function verificationUploadRoot() {
  return path.join(process.cwd(), "private-uploads");
}

export function verificationPhotoRelativePath(listingId: string, ext: string) {
  return `${REL_DIR}/${listingId}.${ext}`;
}

export function verificationPhotoAbsolutePath(relativePath: string) {
  return path.join(verificationUploadRoot(), relativePath);
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extFromMime(mime: string): string | null {
  return MIME_TO_EXT[mime] || null;
}

export async function saveVerificationPhoto(listingId: string, bytes: Buffer, mime: string) {
  const ext = extFromMime(mime);
  if (!ext) throw new Error("UNSUPPORTED_IMAGE_TYPE");
  const root = verificationUploadRoot();
  const rel = verificationPhotoRelativePath(listingId, ext);
  const abs = path.join(root, rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);
  return rel;
}
