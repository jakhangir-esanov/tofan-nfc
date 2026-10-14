export const PASSPORT_TABS = ['card', 'shirt', 'profile'] as const;

export type PassportTab = (typeof PASSPORT_TABS)[number];

export interface PassportTabOption {
  readonly id: PassportTab;
  readonly label: string;
  readonly icon: string;
}

export const PASSPORT_TAB_OPTIONS: readonly PassportTabOption[] = [
  { id: 'card', label: $localize`:@@passport.tab.card:Pasport`, icon: 'pi-id-card' },
  { id: 'shirt', label: $localize`:@@passport.tab.shirt:Futbolka`, icon: 'pi-tag' },
  { id: 'profile', label: $localize`:@@passport.tab.profile:Profil`, icon: 'pi-user' },
];
