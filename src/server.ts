import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { apiProxy } from './api-proxy';

const DEFAULT_PORT = 4000;
const STATIC_CACHE_MAX_AGE = '1y';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const apiProxyTarget = process.env['API_PROXY_TARGET'];

if (apiProxyTarget) {
  app.use('/api', apiProxy(apiProxyTarget));
}

app.get('/healthz', (_request, response) => {
  response.type('text/plain').send('ok');
});

app.use(
  express.static(browserDistFolder, {
    maxAge: STATIC_CACHE_MAX_AGE,
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] ?? DEFAULT_PORT;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
  });
}

export const reqHandler = createNodeRequestHandler(app);
