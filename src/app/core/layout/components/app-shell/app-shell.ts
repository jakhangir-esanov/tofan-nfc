import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from '@openng/optimus-ui/toast';
import { LanguageSwitcher } from '@core/layout/language/language-switcher';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ToastModule, LanguageSwitcher],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
})
export class AppShell {}
