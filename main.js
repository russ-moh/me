const revealItems = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('revealed');
    observer.unobserve(entry.target);
  }
}), { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

const inPageNav = [...document.querySelectorAll('.nav-wrap nav a[href^="#"]')];
const inPageSections = inPageNav
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (inPageNav.length && inPageSections.length) {
  const setActiveSection = (sectionId) => {
    inPageNav.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${sectionId}`;
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    });
  }, { rootMargin: '-22% 0px -68% 0px', threshold: 0.01 });

  inPageSections.forEach((section) => navObserver.observe(section));
}

document.querySelectorAll('.work-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.work-card');
    const isOpen = card.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
});

const layerContent = {
  1: ['01 / 06', 'Start with the outcome, not the product.', 'Clarify what needs to change, where the friction is felt, and what must be true for the investment to earn a decision.'],
  2: ['02 / 06', 'Follow the workflow people actually live in.', 'Make the future state believable by tracing real handoffs, exceptions, and moments where operational work slows down.'],
  3: ['03 / 06', 'Turn architecture into confidence.', 'Translate systems, data, integrations, security, and compliance into a technical point of view both executives and practitioners can trust.'],
  4: ['04 / 06', 'Build proof someone can test.', 'Create the smallest tailored experience that makes the proposed workflow tangible: a demo, portal, hands-on lab, or working scenario.'],
  5: ['05 / 06', 'Make trust visible.', 'Bring adoption, controls, quality, and governance into the proof before they become late-stage reasons to hesitate.'],
  6: ['06 / 06', 'Leave the field with a system.', 'Package the story, decisions, and assets so the account team and specialists can carry the work forward without you in the room.']
};
const layerDetail = document.querySelector('.layer-detail');
document.querySelectorAll('.layer-node').forEach((node) => node.addEventListener('click', () => {
  const item = layerContent[node.dataset.layer];
  document.querySelectorAll('.layer-node').forEach((button) => button.classList.remove('active'));
  node.classList.add('active');
  if (layerDetail) layerDetail.innerHTML = `<p class="layer-count">${item[0]}</p><h3>${item[1]}</h3><p>${item[2]}</p>`;
}));

const siteSearch = document.querySelector('#site-search');
const siteSearchForm = document.querySelector('#site-search-form');
const searchResults = document.querySelector('#search-results');

if (siteSearch && siteSearchForm && searchResults) {
  const searchIndex = [
    { title: 'Competitive POC: build the decision room', description: 'Late-entry HCLS pursuit, executive narrative, pressure-tested proof, and a competitive displacement.', type: 'Work', href: '#evidence', terms: 'competitive poc vendor displacement proof concept discovery demo executive diagnostics' },
    { title: 'AI workflow proof', description: 'Tailored AI workflow storytelling anchored in real process, adoption, and technical guardrails.', type: 'Work', href: '#evidence', terms: 'ai workflow artificial intelligence automation proof demo guardrails' },
    { title: 'Leadership system', description: 'Coaching, interview support, manager coverage, deal guidance, enablement, and team operating rhythm.', type: 'Leadership', href: '#leadership', terms: 'leadership manager coaching enablement hiring interviewing team coverage mentorship' },
    { title: 'Clinical operations foundation', description: 'A decade across healthcare, life sciences, clinical operations, and enterprise presales.', type: 'Experience', href: '#experience', terms: 'clinical operations epic healthcare life sciences patient workflow adoption reporting' },
    { title: 'Reusable field assets', description: 'Microsites, portals, lab guides, testing plans, executive decks, and artifacts teams can reuse.', type: 'Leadership', href: '#leadership', terms: 'microsite portal assets lab guide enablement testing technical story' },
    { title: 'Technical storytelling on stage', description: 'Mainstage keynote, event delivery, and turning field work into a commercial story people remember.', type: 'Leadership', href: '#leadership', terms: 'keynote stage event speaker presentation storytelling knowledge forum' }
  ];

  const renderSearch = (value) => {
    const query = value.trim().toLowerCase();
    searchResults.replaceChildren();
    if (!query) {
      const hint = document.createElement('p');
      hint.textContent = 'Search a theme to surface the most relevant proof.';
      searchResults.append(hint);
      return;
    }

    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = searchIndex.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.terms}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No exact match yet. Try “leadership,” “POC,” “AI workflow,” or “clinical operations.”';
      searchResults.append(empty);
      return;
    }

    matches.slice(0, 4).forEach((item) => {
      const result = document.createElement('a');
      result.className = 'search-result';
      result.href = item.href;
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      const description = document.createElement('span');
      const type = document.createElement('b');
      title.textContent = item.title;
      description.textContent = item.description;
      type.textContent = item.type;
      copy.append(title, description);
      result.append(copy, type);
      searchResults.append(result);
    });
  };

  siteSearch.addEventListener('input', () => renderSearch(siteSearch.value));
  siteSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderSearch(siteSearch.value);
  });
  document.querySelectorAll('[data-search-term]').forEach((chip) => chip.addEventListener('click', () => {
    siteSearch.value = chip.dataset.searchTerm;
    renderSearch(siteSearch.value);
    siteSearch.focus();
  }));
}
