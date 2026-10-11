import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Garment } from '@shared/models/garment';
import { GarmentPreview } from './garment-preview';

const garment: Garment = {
  serialNumber: '01K7X8M4Q9F2A6BC3DEFGHJKMN',
  dropName: 'Drop 1',
  editionNumber: 349,
  dropTotalQuantity: 500,
  variantName: 'Peaktofan Classic',
  imageUrl: null,
  color: '#1A3C6E',
  size: 'L',
  material: '95% paxta',
  manufacturedAt: new Date('2026-08-14T00:00:00Z'),
  knownColor: null,
  shade: '#1A3C6E',
};

function render(value: Garment): ComponentFixture<GarmentPreview> {
  const fixture = TestBed.createComponent(GarmentPreview);
  fixture.componentRef.setInput('garment', value);
  fixture.detectChanges();
  return fixture;
}

function hostOf(fixture: ComponentFixture<GarmentPreview>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function bodyFill(host: HTMLElement): string {
  return host.querySelector<SVGPathElement>('.shirt__body')?.style.fill ?? '';
}

describe('GarmentPreview', () => {
  it('should paint the shirt with the colour code when the admin panel saved one', () => {
    const host = hostOf(render(garment));

    expect(bodyFill(host)).toBe('rgb(26, 60, 110)');
  });

  it('should draw the shirt without the emblem when it is shown', () => {
    const host = hostOf(render(garment));

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelectorAll('svg path')).toHaveLength(6);
  });

  it('should show the variant image instead of the drawing when the variant has one', () => {
    const host = hostOf(render({ ...garment, imageUrl: '/api/files/f1/content' }));
    const image = host.querySelector('img');

    expect(image?.getAttribute('src')).toBe('/api/files/f1/content');
    expect(host.querySelector('.shirt__body')).toBeNull();
  });

  it('should name the drop and the number inside it when the shirt is shown', () => {
    const text = hostOf(render(garment)).textContent ?? '';

    expect(text).toMatch(/Drop 1 · 349 \/\s*500/);
  });

  it('should show a swatch named by the code when the colour has no catalogue name', () => {
    const swatch = hostOf(render(garment)).querySelector('.garment-facts__swatch');

    expect(swatch?.getAttribute('role')).toBe('img');
    expect(swatch?.getAttribute('aria-label')).toBe('#1A3C6E');
  });

  it('should name a known colour in the page language when an older shirt stored a code word', () => {
    const text =
      hostOf(
        render({
          ...garment,
          color: 'black',
          knownColor: 'black',
          shade: 'var(--app-shirt-black)',
        }),
      ).textContent ?? '';

    expect(text).toContain('Qora');
    expect(text).not.toContain('black');
  });

  it('should show the stored colour text when the colour is neither a code nor known', () => {
    const text =
      hostOf(render({ ...garment, color: 'Qizil', shade: 'var(--app-shirt-neutral)' }))
        .textContent ?? '';

    expect(text).toContain('Qizil');
  });

  it('should show the unique id, the authenticity mark and an unregistered status when nobody owns it', () => {
    const text = hostOf(render(garment)).textContent ?? '';

    expect(text).toContain('01K7X8M4Q9F2A6BC3DEFGHJKMN');
    expect(text).toContain('Tasdiqlangan TOFAN originali');
    expect(text).toContain("Ro'yxatdan o'tmagan");
    expect(text).not.toContain('@');
  });

  it('should show the owner, the registration date and the validity when the shirt is registered', () => {
    const fixture = TestBed.createComponent(GarmentPreview);
    fixture.componentRef.setInput('garment', garment);
    fixture.componentRef.setInput('registration', {
      username: 'jahongir',
      registeredAt: new Date('2026-09-21T10:12:00Z'),
      expiresAt: new Date('2026-11-21T10:12:00Z'),
      isExpired: true,
    });
    fixture.detectChanges();
    const text = hostOf(fixture).textContent ?? '';

    expect(text).toContain('@jahongir');
    expect(text).toContain('21.09.2026');
    expect(text).toContain('21.11.2026');
    expect(text).toContain('Muddati tugagan');
  });

  it('should leave out a product field when the admin left it empty', () => {
    const text = hostOf(render({ ...garment, material: '' })).textContent ?? '';

    expect(text).toContain('Rang');
    expect(text).not.toContain('Material');
  });
});
