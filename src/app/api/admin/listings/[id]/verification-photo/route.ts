import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession, canModerateListingCategory } from "@/lib/adminAuth";
import { verificationPhotoAbsolutePath } from "@/lib/verificationUpload";

export const runtime = "nodejs";

function mimeFromPath(rel: string): string {
  if (rel.endsWith(".png")) return "image/png";
  if (rel.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await ctx.params;
  if (!id) return new NextResponse("Bad request", { status: 400 });

  const listing = await db.listing.findUnique({
    where: { id },
    select: { verificationPhotoPath: true, category: true },
  });
  if (!listing?.verificationPhotoPath) return new NextResponse("Not found", { status: 404 });

  if (!canModerateListingCategory(session, listing.category)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const abs = verificationPhotoAbsolutePath(listing.verificationPhotoPath);
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": mimeFromPath(listing.verificationPhotoPath),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
