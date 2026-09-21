import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { Passport } from '../../models/passport';
import { PassportService } from '../../services/passport.service';
import { PassportPage } from './passport-page';

const garment = {
  serialNumber: 'PT-2026-000123',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  photoUrls: [],
};

const activePassport: Passport = {
  garment,
  holder: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: new Date('2026-09-21T10:12:00Z'),
  expiresAt: new Date('2026-11-21T10:12:00Z'),
  isExpired: false,
  rating: 1280,
  stamps: [
    {
      id: 'stamp-1',
      code: 'pr-bench-100',
      title: 'Bench press 100 kg',
      iconUrl: null,
      kind: 'personalRecord',
      awardedAt: new Date('2026-09-19T08:00:00Z'),
    },
  ],
};

const expiredPassport: Passport = {
  ...activePassport,
  isExpired: true,
  rating: null,
  stamps: [],
};

async function render(passport: Passport): Promise<ComponentFixture<PassportPage>> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: PassportService, useValue: { read: vi.fn().mockResolvedValue(passport) } },
    ],
  });

  const fixture = TestBed.createComponent(PassportPage);
  fixture.componentRef.setInput('token', 'abc123');
  fixture.detectChanges();
  await fixture.whenStable();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('PassportPage', () => {
  it('should show the stamps and the rating when the passport is valid', async () => {
    const fixture = await render(activePassport);
    const text = textOf(fixture);

    expect(text).toContain('Jahongir Esanov');
    expect(text).toContain('Bench press 100 kg');
    expect(text).toContain('1280');
  });

  it('should render locked and show no stamps or rating when the passport expired', async () => {
    const fixture = await render(expiredPassport);
    const text = textOf(fixture);

    expect(text).toContain('Muddati tugagan');
    expect(text).not.toContain('Bench press 100 kg');
    expect(text).not.toContain('1280');
    expect(text).not.toContain('Reyting');
  });
});

function textOf(fixture: ComponentFixture<unknown>): string {
  const host = fixture.nativeElement as HTMLElement;
  return host.textContent ?? '';
}
