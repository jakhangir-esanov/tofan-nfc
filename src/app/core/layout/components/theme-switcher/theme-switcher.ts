import { Component, afterNextRender, computed, inject } from '@angular/core';
import { ThemeStore } from '../../theme.store';

const SWITCH_LABELS = {
  dark: $localize`:@@layout.theme.toLight:Yorug' mavzuga o'tish`,
  light: $localize`:@@layout.theme.toDark:Qorong'i mavzuga o'tish`,
} as const;

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.css',
})
export class ThemeSwitcher {
  protected readonly store = inject(ThemeStore);
  protected readonly label = computed(() => SWITCH_LABELS[this.store.theme()]);

  constructor() {
    afterNextRender(() => this.store.restore());
  }
}
