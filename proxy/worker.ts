// Cloudflare Worker entry. Deploy: `npx wrangler deploy` from this folder (see wrangler.toml),
// then paste the worker URL into the app's Settings → PDF proxy URL.
import { handlePdfRequest } from './pdfProxy.ts';

export default {
  fetch(request: Request): Promise<Response> {
    return handlePdfRequest(new URL(request.url).pathname);
  },
};
