import type { CoreConfig, IContent } from './lib/types.js';
import { createAuthModule } from './lib/modules/auth.js';
import { createAPIModule } from './lib/modules/api.js';
import { ContentMetadata, ContentSource, Extension, utils } from 'azot';

export interface CoreContext extends CoreConfig {}

export class P24 {
  DOMAIN_FRONT: string;
  DOMAIN_API: string;

  auth: ReturnType<typeof createAuthModule>;
  api: ReturnType<typeof createAPIModule>;
  azotExtension: Extension;
  init: () => Promise<void>;
  canHandle: ((url: string) => boolean);
  formContentMetadata: (metadata: IContent, slug: string) => Promise<ContentMetadata|undefined>;

  constructor(config: CoreConfig) {
    this.DOMAIN_FRONT = `https://${config.DOMAIN_FRONT}`;
    this.DOMAIN_API = `https://${config.DOMAIN_API}.platform24.tv`;

    const ctx: CoreContext = { DOMAIN_FRONT: this.DOMAIN_FRONT, DOMAIN_API: this.DOMAIN_API };
    this.auth = createAuthModule(ctx);
    this.api = createAPIModule(ctx);

    this.init = async () => {
      await this.auth.checkAuth();
    }

    this.canHandle = (url) => new URL(url).hostname.includes(config.DOMAIN_FRONT)

    this.formContentMetadata = async (metadata: IContent, slug: string) => {
      const stream = (await this.api.fetchContentStream(+metadata?.libraries?.[0]?.id, slug))
    
      const url = stream?.hls ?? stream?.drm?.streams?.[0]?.url
    
      if (url) {
        const source = {url} as ContentSource
    
        if (stream?.drm) {
          source.drm = {
            server: stream.drm.streams[0].license
          }
        }
    
        return {
          id: metadata.id,
          title: utils.sanitizeString(metadata.title),
          source: source
        } as ContentMetadata
      }
    }

    this.azotExtension = {
      init: this.init,
      canHandle: this.canHandle,
      fetchContentMetadata: async (url: string, args: any) => {
        const slug = url.match(/\/watch\/?(.+)?$/)?.[1] || url.match(/[^-]+$/)?.[0];
    
        const results = [] as ContentMetadata[];
        
        if (slug) {
          const metadata = await this.api.fetchContentMetadata(slug);
    
          if (metadata?.id) {
            if (['movie', 'episode'].includes(metadata?.content_type)) {
              const content = await this.formContentMetadata(metadata, slug);
              if (content) results.push(content)
            }
            else {
              let episodes = await this.api.fetchContentEpisodes(slug);
        
              if (episodes?.length) {
                const eps = utils.extendEpisodes(args.episodes);
                if (eps.items.size) {
                  episodes = episodes.filter(el => eps.has(el.series, el.season))
                }
          
                for (const episode of episodes) {
                  const content = await this.formContentMetadata(metadata, episode.id)
          
                  if (content) results.push({
                    ...content,
                    episodeNumber: episode.series,
                    seasonNumber: episode.season,
                    episodeTitle: utils.sanitizeString(episode.title),
                  });
                }
              }
            }
          }
        }
        else console.error("Content not found. Please check the link for accuracy.");
    
        return results;
      }
    }
  }
}
