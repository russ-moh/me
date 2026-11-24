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
  1: ['01 / 05', 'Study the problem.', 'Spend time with the people, handoffs, decisions, exceptions, and constraints that define the work. The goal is a shared understanding of what is actually hard.'],
  2: ['02 / 05', 'Choose a use case worth solving.', 'Turn discovery into one focused problem with a clear owner, a meaningful outcome, and enough value to make the next decision worth it.'],
  3: ['03 / 05', 'Build the proof.', 'Create a POC, workflow environment, or working session that lets people test the idea against the work they know—rather than asking them to imagine it.'],
  4: ['04 / 05', 'Plan for adoption early.', 'Bring dependencies, guardrails, change, and handoffs into the conversation before they become late-stage blockers. A good evaluation clarifies what comes next.'],
  5: ['05 / 05', 'Make the next team faster.', 'Turn successful work into something the team can use again: a reusable demo environment, enablement session, or asset that gives the next customer a better starting point.']
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
    { title: 'Competitive POC: reframe a late-stage evaluation', description: 'Late-entry HCLS pursuit, pressure-tested proof, and a competitive displacement.', type: 'Work', href: '#evidence', terms: 'competitive poc vendor displacement proof concept discovery demo executive diagnostics' },
    { title: 'AI workflow proof', description: 'A tailored AI workflow grounded in real process, adoption, and technical guardrails.', type: 'Work', href: '#evidence', terms: 'ai workflow artificial intelligence automation proof demo guardrails' },
    { title: 'Leadership in the work', description: 'Coaching, interview support, manager coverage, deal guidance, enablement, and a stronger operating rhythm.', type: 'Leadership', href: '#leadership', terms: 'leadership manager coaching enablement hiring interviewing team coverage mentorship' },
    { title: 'Clinical operations foundation', description: 'A decade from clinical operations to life sciences and enterprise presales.', type: 'Experience', href: '#experience', terms: 'clinical operations epic healthcare life sciences patient workflow adoption reporting' },
    { title: 'Reusable field assets', description: 'Microsites, portals, lab guides, testing plans, executive decks, and practical artifacts teams can reuse.', type: 'Leadership', href: '#leadership', terms: 'microsite portal assets lab guide enablement testing technical story' },
    { title: 'Technical storytelling in a live room', description: 'Mainstage keynotes, event delivery, and clear stories built from field work.', type: 'Leadership', href: '#leadership', terms: 'keynote stage event speaker presentation storytelling knowledge forum' }
  ];

  const renderSearch = (value) => {
    const query = value.trim().toLowerCase();
    searchResults.replaceChildren();
    if (!query) {
      const hint = document.createElement('p');
      hint.textContent = 'Search a theme to find the work behind the claim.';
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
