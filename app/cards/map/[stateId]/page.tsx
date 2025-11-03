/**
 * Map Card Page
 * Displays map preview card at /cards/map/[stateId]
 */

import { notFound } from 'next/navigation';
import { MapCard } from '@/components/MapCard';
import { sessionStore } from '@/lib/session/store';

interface PageProps {
  params: {
    stateId: string;
  };
}

export default function MapCardPage({ params }: PageProps) {
  const { stateId } = params;

  // Retrieve session data
  const sessionData = sessionStore.get(stateId);

  if (!sessionData) {
    notFound();
  }

  // Extract location context from first result
  const firstResult = sessionData.search_results[0];
  const locationName = firstResult
    ? firstResult.address.split(',').slice(-2).join(',').trim()
    : 'your area';

  const handleOpenFullscreen = () => {
    // Navigate to the fullscreen map resource
    window.location.href = `/resources/map.html?state_id=${stateId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <MapCard
        stateId={stateId}
        resultCount={sessionData.search_results.length}
        locationName={locationName}
        onOpenFullscreen={handleOpenFullscreen}
      />
    </div>
  );
}
