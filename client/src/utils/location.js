export const buildBusinessLocationHref = (location = '', locationLink = '') => {
  const trimmedLocation = String(location || '').trim();
  const trimmedLink = String(locationLink || '').trim();

  if (trimmedLink) {
    return /^https?:\/\//i.test(trimmedLink) ? trimmedLink : `https://${trimmedLink}`;
  }

  if (!trimmedLocation) {
    return '#';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmedLocation)}`;
};
