import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { GarmentsService } from '../../services/garments.service';
import { VerifyPage } from './verify-page';

const garment = {
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  dropName: 'Drop 1',
  editionNumber: 349,
  dropTotalQuantity: 500,
  variantName: 'Peaktofan Classic',
  imageUrl: null,
  color: 'Qora',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  knownColor: 'black' as const,
  shade: 'var(--app-shirt-black)',
};

async function renderForeignScan(): Promise<ComponentFixture<VerifyPage>> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: GarmentsService,
        useValue: { scan: vi.fn().mockResolvedValue({ state: 'foreign', garment }) },
      },
    ],
  });

  const fixture = TestBed.createComponent(VerifyPage);
  fixture.componentRef.setInput('token', 'abc123');
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('VerifyPage', () => {
  it('should keep the token out of the console and out of browser storage', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const stored = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => undefined);

    await renderForeignScan();

    for (const spy of [log, error, stored]) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toContain('abc123');
      }
    }
    vi.restoreAllMocks();
  });

  it('should confirm the shirt is genuine when a stranger scans it', async () => {
    const fixture = await renderForeignScan();

    expect(textOf(fixture)).toContain('Peaktofan Classic');
  });

  it('should show nothing about the owner when a stranger scans it', async () => {
    const fixture = await renderForeignScan();
    const text = textOf(fixture);

    expect(text).not.toContain('Esanov');
    expect(text).not.toContain('Aktivatsiya');
    expect(text).not.toContain('Reyting');
    expect(text).not.toContain('Shtamp');
  });
});

function textOf(fixture: ComponentFixture<unknown>): string {
  const host = fixture.nativeElement as HTMLElement;
  return host.textContent ?? '';
}
