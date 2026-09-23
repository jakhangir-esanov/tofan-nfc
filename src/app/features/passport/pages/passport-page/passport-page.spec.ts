import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { BusinessRuleError } from '@shared/models/errors/business-rule.error';
import { Passport } from '../../models/passport';
import { PassportService } from '../../services/passport.service';
import { PassportPage } from './passport-page';

const garment = {
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  knownColor: 'black' as const,
  shade: 'var(--app-shirt-black)',
};

const activePassport: Passport = {
  garment,
  holder: { firstName: 'Jahongir', lastName: 'Esanov' },
  activatedAt: new Date('2026-09-21T10:12:00Z'),
  expiresAt: new Date('2026-11-21T10:12:00Z'),
  isExpired: false,
};

const expiredPassport: Passport = { ...activePassport, isExpired: true };

async function render(read: PassportService['read']): Promise<{
  fixture: ComponentFixture<PassportPage>;
  navigatedTo: () => string | null;
}> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: PassportService, useValue: { read } }],
  });

  let navigatedTo: string | null = null;
  vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockImplementation((url) => {
    navigatedTo = String(url);
    return Promise.resolve(true);
  });

  const fixture = TestBed.createComponent(PassportPage);
  fixture.componentRef.setInput('token', 'abc123');
  fixture.detectChanges();
  await fixture.whenStable();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, navigatedTo: () => navigatedTo };
}

describe('PassportPage', () => {
  it('should show the holder and the validity when the passport is valid', async () => {
    const { fixture } = await render(vi.fn().mockResolvedValue(activePassport));
    const text = textOf(fixture);

    expect(text).toContain('Jahongir Esanov');
    expect(text).toContain('21.11.2026');
    expect(text).not.toContain('Muddati tugagan');
  });

  it('should render locked when the server marked the passport expired', async () => {
    const { fixture } = await render(vi.fn().mockResolvedValue(expiredPassport));

    expect(textOf(fixture)).toContain('Muddati tugagan');
  });

  it('should render no rating and no stamps because the backend sends neither', async () => {
    const { fixture } = await render(vi.fn().mockResolvedValue(activePassport));
    const text = textOf(fixture);

    expect(text).not.toContain('Reyting');
    expect(text).not.toContain('shtamp');
  });

  it('should leave out the holder row when the owner has no profile yet', async () => {
    const nameless = { ...activePassport, holder: { firstName: '', lastName: '' } };
    const { fixture } = await render(vi.fn().mockResolvedValue(nameless));

    expect(textOf(fixture)).not.toContain('Egasi');
  });

  it('should go back to the scan when the server says the caller is not the owner', async () => {
    const notOwner = new BusinessRuleError('not owner', 'Garment.NotOwner');
    const { navigatedTo } = await render(vi.fn().mockRejectedValue(notOwner));

    expect(navigatedTo()).toBe('/t/abc123');
  });
});

function textOf(fixture: ComponentFixture<unknown>): string {
  const host = fixture.nativeElement as HTMLElement;
  return host.textContent ?? '';
}
