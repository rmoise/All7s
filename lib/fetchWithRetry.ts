import { MAX_RETRIES, RETRY_DELAY } from '@/lib/constants'

export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fetcher()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(fetcher, retries - 1)
    }
    throw error
  }
}