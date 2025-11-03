/**
 * Search Results Card Page
 * Displays search summary card at /cards/search/[stateId]
 */

import { notFound } from 'next/navigation';
import { SearchSummaryCard } from '@/components/SearchSummaryCard';
import { sessionStore } from '@/lib/session/store';

interface PageProps {
  params: {
    stateId: string;
  };
}

export default function SearchCardPage({ params }: PageProps) {
  const { stateId } = params;

  // Retrieve session data
  const sessionData = sessionStore.get(stateId);

  if (!sessionData) {
    notFound();
  }

  const searchResults = {
    center: sessionData.center,
    bounds: sessionData.bounds,
    results: sessionData.search_results,
    state_id: sessionData.state_id,
  };

  const handleOpenMap = () => {
    // In a real ChatGPT app, this would trigger the compose_map_resource tool
    // For now, we'll navigate to the map resource directly
    window.location.href = `/resources/map.html?state_id=${stateId}`;
  };

  const handleRefineSearch = () => {
    // In a real ChatGPT app, this would prompt the user for refinement
    // For now, we'll just show an alert
    alert('Please refine your search in the chat.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SearchSummaryCard
        searchResults={searchResults}
        onOpenMap={handleOpenMap}
        onRefineSearch={handleRefineSearch}
      />
    </div>
  );
}
