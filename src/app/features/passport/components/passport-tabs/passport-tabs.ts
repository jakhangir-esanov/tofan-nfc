import { Component, input, model } from '@angular/core';
import { PassportTab, PassportTabOption } from '../../models/passport-tab';

@Component({
  selector: 'app-passport-tabs',
  templateUrl: './passport-tabs.html',
  styleUrl: './passport-tabs.css',
})
export class PassportTabs {
  readonly options = input.required<readonly PassportTabOption[]>();
  readonly active = model.required<PassportTab>();
}
