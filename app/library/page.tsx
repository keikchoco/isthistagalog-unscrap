'use client';

import { useEffect, useState } from 'react';
import SuggestionsView from '@/components/SuggestionsView';
import { authClient } from '@/lib/auth-client';

export default function SuggestionsPage() {
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const session = authClient.useSession();
  const sessionUser = session.data?.user ?? null;

  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionUser?.email) {
        setUser(null);
        setScanHistory([]);
        return;
      }

      setUser({ email: sessionUser.email, displayName: sessionUser.name });

      const historyRes = await fetch(`/api/scans?userId=${sessionUser.email}`);
      const historyData = await historyRes.json();
      if (Array.isArray(historyData)) {
        setScanHistory(historyData);
      }
    };

    loadHistory();
  }, [sessionUser?.email, sessionUser?.name]);

  return (
    <div className="min-h-screen bg-transparent selection:bg-sprout flex flex-col font-sans text-ink">
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex-1 w-full">
        <SuggestionsView history={scanHistory} />
      </main>
    </div>
  );
}