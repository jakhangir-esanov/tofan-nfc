import { describe, expect, it } from 'vitest';
import { machineReadableZone } from './machine-readable-zone';

describe('machineReadableZone', () => {
  it('should write the holder and the serial in two lines of equal length', () => {
    const [first, second] = machineReadableZone(
      { firstName: 'Jahongir', lastName: 'Esanov' },
      '01K7X8M4Q9F2A6BC3DEFGHJKMN',
    );

    expect(first).toBe('P<TFNESANOV<<JAHONGIR<<<<<<<<<<<<<<<');
    expect(second).toBe('01K7X8M4Q9F2A6BC3DEFGHJKMN<TFN<<<<<<');
  });

  it('should replace every character outside the latin capitals with a filler', () => {
    const [first] = machineReadableZone({ firstName: "O'g'il", lastName: 'Иванов' }, 'A1');

    expect(first).toBe('P<TFN<<<<<<<<O<G<IL<<<<<<<<<<<<<<<<<');
  });

  it('should cut a long name so the line keeps its length', () => {
    const [first] = machineReadableZone(
      { firstName: 'Abdurahmonjon', lastName: 'Muhammadaliyevskiy' },
      'A1',
    );

    expect(first).toHaveLength(36);
  });
});
