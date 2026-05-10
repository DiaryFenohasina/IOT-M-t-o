export const APP_TIME_ZONE = 'Indian/Antananarivo';
export const APP_UTC_OFFSET = '+03:00';

const hasTimeZoneOffset = (value: string) => /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);

const withMadagascarOffset = (value: string) => {
  if (hasTimeZoneOffset(value)) {
    return value;
  }

  return `${value}${APP_UTC_OFFSET}`;
};

export const formatMeteoHour = (value: string) => {
  if (!hasTimeZoneOffset(value)) {
    const hour = value.match(/T(\d{2})/)?.[1] ?? value.slice(0, 2);
    return `${hour}h`;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    hour12: false,
    timeZone: APP_TIME_ZONE,
  })
    .format(new Date(value))
    .replace(':00', 'h');
};

export const formatMeteoDateTime = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    timeZone: APP_TIME_ZONE,
  }).format(new Date(withMadagascarOffset(value)));
