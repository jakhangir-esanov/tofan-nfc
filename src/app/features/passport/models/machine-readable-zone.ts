import { PassportHolder } from './passport';

const LINE_LENGTH = 36;
const FILLER = '<';
const DOCUMENT_CODE = 'P<TFN';
const NOT_LATIN_CAPITAL = /[^A-Z0-9]/g;

export type MachineReadableZone = readonly [string, string];

export function machineReadableZone(
  holder: PassportHolder,
  serialNumber: string,
): MachineReadableZone {
  const name = `${encode(holder.lastName)}${FILLER}${FILLER}${encode(holder.firstName)}`;
  return [line(`${DOCUMENT_CODE}${name}`), line(`${encode(serialNumber)}${FILLER}TFN`)];
}

function encode(text: string): string {
  return text.trim().toUpperCase().replace(NOT_LATIN_CAPITAL, FILLER);
}

function line(text: string): string {
  return text.padEnd(LINE_LENGTH, FILLER).slice(0, LINE_LENGTH);
}
