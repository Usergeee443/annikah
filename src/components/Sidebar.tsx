import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import SidebarClient from "@/components/SidebarClient";

export default async function Sidebar() {
  const user = await getCurrentUser();
  const profile = user ? await db.profile.findUnique({ where: { userId: user.id } }) : null;

  return (
    <SidebarClient
      user={
        user
          ? {
              email: user.email,
              profileComplete: Boolean(profile?.isComplete),
            }
          : null
      }
    />
  );
}
