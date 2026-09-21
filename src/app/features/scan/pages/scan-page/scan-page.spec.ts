import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { ScanState } from '../../models/garment-scan';
import { GarmentsService } from '../../services/garments.service';
import { ScanPage } from './scan-page';

const garment = {
  serialNumber: 'PT-2026-000123',
  model: 'Peaktofan Classic',
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  photoUrls: [],
};

async function scanWith(
  state: ScanState,
): Promise<{ text: string; navigatedTo: string | null; claimed: boolean }> {
  const scan = vi
    .fn()
    .mockResolvedValue(state === 'invalid' ? { state } : { state, garment });

  const claim = vi.fn();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: GarmentsService, useValue: { scan, claim } }],
  });

  const router = TestBed.inject(Router);
  let navigatedTo: string | null = null;
  vi.spyOn(router, 'navigateByUrl').mockImplementation((url) => {
    navigatedTo = String(url);
    return Promise.resolve(true);
  });

  const fixture = TestBed.createComponent(ScanPage);
  fixture.componentRef.setInput('token', 'abc123');
  fixture.detectChanges();
  await fixture.whenStable();
  await fixture.whenStable();
  fixture.detectChanges();

  return { text: textOf(fixture), navigatedTo, claimed: claim.mock.calls.length > 0 };
}

describe('ScanPage', () => {
  it('should offer registration when the shirt is not activated yet', async () => {
    const { text, navigatedTo } = await scanWith('unclaimed');

    expect(text).toContain("Ro'yxatdan o'tish");
    expect(navigatedTo).toBeNull();
  });

  it('should send a signed in visitor to activation when the shirt is claimable', async () => {
    const { navigatedTo } = await scanWith('claimable');

    expect(navigatedTo).toBe('/t/abc123/activate');
  });

  it('should open the passport when the visitor owns the shirt', async () => {
    const { navigatedTo } = await scanWith('owned');

    expect(navigatedTo).toBe('/t/abc123/passport');
  });

  it('should open the passport when the shirt is expired so it can render locked', async () => {
    const { navigatedTo } = await scanWith('expired');

    expect(navigatedTo).toBe('/t/abc123/passport');
  });

  it('should send a stranger to the authenticity screen when the shirt belongs to someone else', async () => {
    const { text, navigatedTo, claimed } = await scanWith('foreign');

    expect(navigatedTo).toBe('/t/abc123/verify');
    expect(text).not.toContain("Ro'yxatdan o'tish");
    expect(claimed).toBe(false);
  });


  it('should explain the chip is dead when the token is invalid', async () => {
    const { text, navigatedTo } = await scanWith('invalid');

    expect(text).toContain('Havola ishlamayapti');
    expect(navigatedTo).toBeNull();
  });
});

function textOf(fixture: ComponentFixture<unknown>): string {
  const host = fixture.nativeElement as HTMLElement;
  return host.textContent ?? '';
}
