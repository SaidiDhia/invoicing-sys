import { Sequential } from '@/types';
import { DATE_FORMAT } from '@/types/enums/date-formats';
import { format } from 'date-fns';

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const DATE_FORMAT_PATTERNS: { [key in DATE_FORMAT]: RegExp } = {
  [DATE_FORMAT.yyyy]: /^\d{4}$/,
  [DATE_FORMAT.yy_MM]: /^\d{2}-\d{2}$/,
  [DATE_FORMAT.yyyy_MM]: /^\d{4}-\d{2}$/
};

export function fromStringToSequentialObject(sequence: string) {
  const regex = /^(.+?)-(\d{4}-\d{2}|\d{2}-\d{2}|\d{4})-(\d+)$/;
  const match = sequence.match(regex);

  if (!match) {
    return {
      prefix: '',
      dynamicSequence: DATE_FORMAT.yyyy,
      next: 0
    };
  }

  const [, prefix, dynamicSequence, nextStr] = match;
  const next = parseInt(nextStr, 10);

  const knownFormat =
    (Object.keys(DATE_FORMAT_PATTERNS).find((format) =>
      DATE_FORMAT_PATTERNS[format as DATE_FORMAT].test(dynamicSequence)
    ) as DATE_FORMAT) || DATE_FORMAT.yyyy;

  return {
    prefix,
    dynamicSequence: knownFormat,
    next: isNaN(next) ? 0 : next
  };
}

export const fromSequentialObjectToString = (sequence: Sequential) => {
  const { prefix, dynamicSequence, next } = sequence;
  const date = format(new Date(), (dynamicSequence || DATE_FORMAT.yyyy)?.toString());
  return `${prefix}-${date}-${next}`;
};

export const isValidUrl = (url: string): boolean => {
  const regex =
    /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
  return regex.test(url);
};
