import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';
import { LanguageSwitcher } from '@core/layout/language/language-switcher';
import { Logo } from '@shared/components/logo/logo';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ToastModule, LanguageSwitcher, Logo],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {}
