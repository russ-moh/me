const logoMap = [
  ['ServiceNow', 'servicenow-brand.svg', 'ServiceNow logo'],
  ['TraceLink', 'tracelink-brand.png', 'TraceLink logo'],
  ['Salsify', 'salsify-brand.svg', 'Salsify logo'],
  ['Rush University Medical Center', 'rush-brand.png', 'Rush University Medical Center logo']
];

document.querySelectorAll('.resume-role').forEach((role) => {
  const meta = role.querySelector('.meta');
  const match = logoMap.find(([name]) => meta && meta.textContent.includes(name));
  if (!match) return;
  const [, src, alt] = match;
  const heading = role.querySelector('h3');
  const wrap = document.createElement('div');
  wrap.className = 'resume-role-head';
  const text = document.createElement('div');
  heading.before(wrap);
  text.append(heading, meta);
  const logo = document.createElement('img');
  logo.src = src;
  logo.alt = alt;
  wrap.append(logo, text);
});

const education = document.querySelector('.resume-section:last-of-type div');
if (education) {
  const entries = [
    ['Rush University', 'rush-brand.png', 'Rush University logo'],
    ['Loyola University Chicago', 'loyola-shield.svg', 'Loyola University Chicago shield']
  ];
  education.querySelectorAll('p').forEach((item) => {
    const data = entries.find(([name]) => item.textContent.includes(name));
    if (!data) return;
    const img = document.createElement('img');
    img.src = data[1];
    img.alt = data[2];
    item.classList.add('education-entry');
    item.prepend(img);
  });
}
