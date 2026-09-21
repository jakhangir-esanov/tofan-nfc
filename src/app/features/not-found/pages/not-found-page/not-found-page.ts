import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  protected readonly homeLink = AppPaths.home;
}
