import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { provideOptimus } from '@openng/optimus-ui/config';
import { AppTitleStrategy } from './app-title.strategy';
import { PeaktofanPreset } from './peaktofan.preset';

export function provideUi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideOptimus({
      theme: { preset: PeaktofanPreset, options: { darkModeSelector: '.app-dark' } },
    }),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    MessageService,
  ]);
}
