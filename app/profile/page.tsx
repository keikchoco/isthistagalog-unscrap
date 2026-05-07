"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import ProfileView from "@/components/ProfileView";

type ProfileData = {
  displayName: string;
  rank?: string;
  totalXP?: number;
  impactScore?: number;
  matterDiverted?: number;
};

export default function ProfilePage() {
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [shareAccountId, setShareAccountId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionUser?.email) {
        setProfileData(null);
        setScanHistory([]);
        setShareAccountId(null);
        return;
      }

      const userRes = await fetch(
        `/api/user?email=${sessionUser.email}&name=${encodeURIComponent(sessionUser.name || sessionUser.email.split("@")[0])}`,
      );
      const userData = (await userRes.json()) as ProfileData;
      setProfileData(userData);

      const historyRes = await fetch(`/api/scans?userId=${sessionUser.email}`);
      const historyData = await historyRes.json();
      setScanHistory(Array.isArray(historyData) ? historyData : []);

      const shareRes = await fetch(`/api/profile/share?email=${encodeURIComponent(sessionUser.email)}`);
      const shareData = await shareRes.json();
      setShareAccountId(typeof shareData?.accountId === "string" ? shareData.accountId : null);
    };

    loadData();
  }, [sessionUser?.email, sessionUser?.name]);

  return (
    <div className="min-h-screen bg-transparent selection:bg-sprout px-6 pt-28 pb-12 text-ink">
      <div className="mx-auto max-w-7xl">
        <ProfileView
          user={sessionUser}
          profileData={profileData}
          scanHistory={scanHistory}
          shareAccountId={shareAccountId}
          onBack={() => window.location.assign("/scanner")}
        />
      </div>
    </div>
  );
}