const legacyPath = window.location.pathname;
const legacySection = legacyPath.includes('case-studies')
  ? '#evidence'
  : legacyPath.includes('leadership')
    ? '#leadership'
    : '#experience';

window.location.replace(new URL(`index.html${legacySection}`, window.location.href).href);
