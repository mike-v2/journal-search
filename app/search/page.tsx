import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';
import { getJournalEntry, search } from '@/app/apiRequests/serverApiRequests';

import SearchResults from '@/app/search/components/searchResults';
import SearchInput from '@/app/search/components/searchInput';

const EMBEDDING_SEARCH_THRESHOLD = 0.78; // Determined through experimentation.

export default async function Search({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = decodeURIComponent(searchParams['query'] as string);
  const { data: searchResults } = await withAxiosTryCatch(
    search(query, EMBEDDING_SEARCH_THRESHOLD),
  );

  const entry = decodeURIComponent(searchParams['entry'] as string);
  const { data: selectedEntry } = await withAxiosTryCatch(
    getJournalEntry(entry),
  );

  return (
    <main className='min-h-screen'>
      <SearchInput />
      {searchResults && (
        <SearchResults
          searchResults={searchResults}
          selectedEntry={selectedEntry}
        />
      )}
    </main>
  );
}
