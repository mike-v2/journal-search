import useSWR, { SWRConfiguration } from 'swr';

import { withAxiosTryCatch } from '@/utils/withAxiosTryCatch';

export function useAxiosSWR<T>(
  key: string | null,
  fetcher: any,
  config?: Partial<SWRConfiguration<T, string>>,
) {
  const axiosFetcher = async () => {
    const { data, error } = await withAxiosTryCatch<T>(fetcher());
    if (error !== undefined) throw new Error(error);

    return data;
  };

  const response = useSWR(key, () => axiosFetcher(), {
    shouldRetryOnError: false,
    ...config,
  });

  return response;
}
