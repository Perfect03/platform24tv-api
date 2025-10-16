import type { IAccount, IContent, IContentStream, IContentEpisode } from '../types.js';
import { CoreContext } from '../../main.js';
import { DEFAULT_HEADERS } from '../constants.js';
import { createAuthModule } from './auth.js';

export function createAPIModule(ctx: CoreContext) {
  return {
    async request<T>(url: string, method: string = 'GET', params?: Record<string, string>) {
      console.debug(`Getting data from ${url}...`);
    
      const query = new URLSearchParams({
        ...(params ?? {}),
        access_token: localStorage.getItem('access_token') || ''
      }).toString();
    
      const response = await fetch(`${url}?${query}`, {
        method,
        headers: {
          ...DEFAULT_HEADERS,
          Cookie: localStorage.getItem('auth') || ''
        },
      });
      const data = (await response.text()) || '';
      if (response.status === 401) {
        const user = await createAuthModule(ctx).refresh()
        if (user?.access_token) {
          await this.request(url, method, params);
          return;
        }
        console.error(`Unauthorized: ${url}`);
      }
      response.status === 400 && console.error(`Bad Request: ${url}`);
      const isSuccess = response.status === 200;
      if (!isSuccess) console.debug(`Request failed. Route: ${url}. ${data}`);
      try {
        return (data ? JSON.parse(data) : data) as T;
      } catch (e) {
        console.debug(data);
        console.debug(e as any);
        console.error(`Parsing JSON response failed. Route: ${url}`);
        process.exit(1);
      }
    },
    async fetchAccount() {
      return this.request<IAccount>(`${ctx.DOMAIN_API}/v2/users/self`);
    },
    async fetchContentMetadata(slug: string) {
      return this.request<IContent>(`${ctx.DOMAIN_API}/v2/contents/${slug}`);
    },
    async fetchContentStream(library: number, slug: string) {
      return this.request<IContentStream>(`${ctx.DOMAIN_API}/v2/libraries/${library}/contents/${slug}/stream`);
    },
    async fetchContentEpisodes(slug: string) {
      return this.request<IContentEpisode[]>(`${ctx.DOMAIN_API}/v2/contents/${slug}/episodes`);
    }
  }}
