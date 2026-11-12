import akar from '@iconify-json/akar-icons/icons.json';
import iconamoon from '@iconify-json/iconamoon/icons.json';
import fluent from '@iconify-json/fluent/icons.json';
import ic from '@iconify-json/ic/icons.json';
import mdi from '@iconify-json/mdi/icons.json';

// Bundled Iconify data renders on the server without CDN scripts or API requests.
const icons = {
  'akar-icons:cart': { ...akar.icons.cart, width: akar.width, height: akar.height },
  'iconamoon:profile-fill': { ...iconamoon.icons['profile-fill'], width: iconamoon.width, height: iconamoon.height },
  'fluent:more-circle-28-regular': { ...fluent.icons['more-circle-28-regular'], width: 28, height: 28 },
  'ic:baseline-tiktok': { ...ic.icons['baseline-tiktok'], width: ic.width, height: ic.height },
  'ic:baseline-facebook': { ...ic.icons['baseline-facebook'], width: ic.width, height: ic.height },
  'mdi:instagram': { ...mdi.icons.instagram, width: mdi.width, height: mdi.height },
  'mdi:map-marker-radius': { ...mdi.icons['map-marker-radius'], width: mdi.width, height: mdi.height },
  'mdi:clock-time-four-outline': { ...mdi.icons['clock-time-four-outline'], width: mdi.width, height: mdi.height },
};

export default function Icon({ icon }: { icon: keyof typeof icons }) {
  const data = icons[icon];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="site-icon"
      width="1em"
      height="1em"
      viewBox={`0 0 ${data.width} ${data.height}`}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
}
