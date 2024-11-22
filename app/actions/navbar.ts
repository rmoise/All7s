'use server'

import { getClient } from '@/lib/client'
import { revalidatePath } from 'next/cache'

// Define types
interface ContentBlock {
  _type: string;
  _key: string;
  listenTitle?: string;
  lookTitle?: string;
}

interface NavigationLink {
  href?: string;
  name: string;
}

interface HomeDocument {
  contentBlocks?: ContentBlock[];
}

interface SettingsDocument {
  navbar?: {
    navigationLinks?: NavigationLink[];
  };
}

interface ActionResponse {
  success: boolean;
  error?: {
    message: string;
    details?: string;
  };
}

export async function updateBlockTitleAction(type: 'listen' | 'look', newTitle: string): Promise<ActionResponse> {
  const client = getClient()

  try {
    const [home, settings] = await Promise.all([
      client.fetch<HomeDocument>(`*[_type == "home" && _id == "singleton-home"][0]`),
      client.fetch<SettingsDocument>(`*[_type == "settings" && _id == "singleton-settings"][0]`)
    ])

    if (!home || !settings) {
      return { success: false, error: { message: 'Required documents not found' } }
    }

    const tx = client.transaction()
    const updates = []

    try {
      if (home.contentBlocks) {
        const updatedBlocks = home.contentBlocks.map((block: ContentBlock) => {
          if (!block._type) {
            console.warn('Block missing _type:', block);
            return block;
          }

          if (block._type === 'musicBlock' && type === 'listen') {
            return { ...block, listenTitle: newTitle };
          }
          if (block._type === 'videoBlock' && type === 'look') {
            return { ...block, lookTitle: newTitle };
          }
          return block;
        });

        if (!updatedBlocks.some(block => block.listenTitle || block.lookTitle)) {
          console.warn('No matching blocks found to update');
        }

        updates.push(tx.patch('singleton-home', p => p.set({ contentBlocks: updatedBlocks })));
      }

      if (settings?.navbar?.navigationLinks) {
        const updatedNavLinks = settings.navbar.navigationLinks.map((link: NavigationLink) => {
          const isLookLink = link.href?.toLowerCase().includes('look') || link.href?.toLowerCase().includes('/#look')
          const isListenLink = link.href?.toLowerCase().includes('listen') || link.href?.toLowerCase().includes('/#listen')

          if ((isLookLink && type === 'look') || (isListenLink && type === 'listen')) {
            return { ...link, name: newTitle }
          }
          return link
        })
        updates.push(tx.patch('singleton-settings', p => p.set({ 'navbar.navigationLinks': updatedNavLinks })))
      }

      await tx.commit()
      return { success: true }
    } catch (error) {
      console.error('Transaction error:', error)
      return {
        success: false,
        error: {
          message: 'Failed to update content',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  } catch (error) {
    console.error('Fetch error:', error)
    return {
      success: false,
      error: {
        message: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}