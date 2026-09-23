import { Component } from '@angular/core';
import { Logo } from '@shared/components/logo/logo';

@Component({
  selector: 'app-home-page',
  imports: [Logo],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
