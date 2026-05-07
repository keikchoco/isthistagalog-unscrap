"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileView from "@/components/ProfileView";

type ProfilePayload = {
  user: any;
  profileData: any;
  scanHistory: any[];
  accountId: string;
};

export default function PublicProfilePage() {
  const params = useParams<{ accountId: string }>();
  const accountId = params?.accountId || "";
  const [payload, setPayload] = useState<ProfilePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!accountId) return;

      const res = await fetch(`/api/profile/${encodeURIComponent(accountId)}`);
      const data = await res.json();

      if (!res.ok || data?.error) {
        setError(data?.error || "Profile not found.");
        return;
      }

      setPayload(data as ProfilePayload);
      setError(null);
    };

    loadProfile();
  }, [accountId]);

  if (error) {
    return (
      <div className="min-h-screen bg-transparent px-6 pt-28 pb-12 text-ink">
        <div className="mx-auto max-w-3xl rounded-4xl border border-bark/10 bg-white p-10 shadow-xl">
          <h1 className="text-3xl font-black text-primary">Profile unavailable</h1>
          <p className="mt-4 text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen bg-transparent px-6 pt-28 pb-12 text-ink">
        <div className="mx-auto max-w-3xl rounded-4xl border border-bark/10 bg-white p-10 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent selection:bg-sprout px-6 pt-28 pb-12 text-ink">
      <div className="mx-auto max-w-7xl">
        <ProfileView
          user={payload.user}
          profileData={payload.profileData}
          scanHistory={payload.scanHistory}
          shareAccountId={payload.accountId}
          onBack={() => window.location.assign("/")}
        />
      </div>
    </div>
  );
}