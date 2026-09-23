import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { InvalidReason } from '../../models/garment-scan';
import { InvalidLink } from './invalid-link';

function render(reason: InvalidReason): string {
  const fixture = TestBed.createComponent(InvalidLink);
  fixture.componentRef.setInput('reason', reason);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  return host.textContent ?? '';
}

describe('InvalidLink', () => {
  it('should say the link is dead when the token is unknown', () => {
    expect(render('unknown')).toContain('Havola ishlamayapti');
  });

  it('should say the shirt was revoked when the admin revoked it', () => {
    const text = render('revoked');

    expect(text).toContain('Bu futbolka bekor qilingan');
    expect(text).not.toContain('Havola ishlamayapti');
  });

  it('should say the passport is closed for now when the admin hid the shirt', () => {
    const text = render('hidden');

    expect(text).toContain('Pasport vaqtincha yopiq');
    expect(text).not.toContain('Havola ishlamayapti');
  });
});
