const SUSPICIOUS_TEXT_PATTERN = /(?:Ã.|Â.|â.|Î.|ï¿½|â€|â€™|â€œ|â€\u009d|â€“|â€”|â†|âˆ|âœ|Ã—|Â²|Â³|âˆš)/;
const WINDOWS_1252_REVERSE_MAP = new Map([
  ['€', 0x80],
  ['‚', 0x82],
  ['ƒ', 0x83],
  ['„', 0x84],
  ['…', 0x85],
  ['†', 0x86],
  ['‡', 0x87],
  ['ˆ', 0x88],
  ['‰', 0x89],
  ['Š', 0x8a],
  ['‹', 0x8b],
  ['Œ', 0x8c],
  ['Ž', 0x8e],
  ['‘', 0x91],
  ['’', 0x92],
  ['“', 0x93],
  ['”', 0x94],
  ['•', 0x95],
  ['–', 0x96],
  ['—', 0x97],
  ['˜', 0x98],
  ['™', 0x99],
  ['š', 0x9a],
  ['›', 0x9b],
  ['œ', 0x9c],
  ['ž', 0x9e],
  ['Ÿ', 0x9f],
]);

const encodeWindows1252LikeBuffer = (value) => Buffer.from(
  Array.from(String(value ?? ''), (char) => {
    if (WINDOWS_1252_REVERSE_MAP.has(char)) {
      return WINDOWS_1252_REVERSE_MAP.get(char);
    }

    const codePoint = char.codePointAt(0) || 0x3f;
    return codePoint <= 0xff ? codePoint : 0x3f;
  })
);

const cleanInvisibleCharacters = (value) =>
  String(value ?? '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

const normalizeSeedString = (value) => {
  let current = cleanInvisibleCharacters(value);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!SUSPICIOUS_TEXT_PATTERN.test(current)) {
      break;
    }

    const decoded = encodeWindows1252LikeBuffer(current).toString('utf8');
    if (!decoded || decoded === current) {
      break;
    }

    current = cleanInvisibleCharacters(decoded);
  }

  return current;
};

const normalizeSeedValue = (value) => {
  if (typeof value === 'string') {
    return normalizeSeedString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeSeedValue(item));
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeSeedValue(entryValue)])
    );
  }

  return value;
};

module.exports = {
  normalizeSeedString,
  normalizeSeedValue,
  SUSPICIOUS_TEXT_PATTERN,
};
