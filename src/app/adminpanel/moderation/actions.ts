"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertCanModerateListing } from "@/lib/adminAuth";
import { db } from "@/lib/db";
async function guard(id: number) {
  try {
    await assertCanModerateListing(id);
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (m === "ADMIN_AUTH_REQUIRED") redirect("/adminpanel/login");
    throw e;
  }
}

export async function approveListingAction(listingId: number) {
  if (!Number.isInteger(listingId) || listingId < 1) return;
  await guard(listingId);
  await db.listing.update({
    where: { id: listingId },
    data: { moderationStatus: "approved", moderatedAt: new Date(), active: true },
  });
  revalidatePath("/adminpanel/moderation");
}

export async function rejectListingAction(listingId: number) {
  if (!Number.isInteger(listingId) || listingId < 1) return;
  await guard(listingId);
  await db.listing.update({
    where: { id: listingId },
    data: { moderationStatus: "rejected", moderatedAt: new Date(), active: false },
  });
  revalidatePath("/adminpanel/moderation");
}
