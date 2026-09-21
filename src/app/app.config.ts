import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '@environments/environment';
import { provideHttp } from '@core/http/http.providers';
import { provideUi } from '@core/config/ui.providers';
import { routes } from './routes/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),
    provideHttp(environment.apiBaseUrl),
    provideUi(),
  ],
};
