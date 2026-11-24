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

  const navHeader = inPageNav[0].closest('.nav-wrap');
  let activeSectionId;

  const updateActiveSection = () => {
    const readingLine = navHeader.getBoundingClientRect().bottom + 30;
    const activeSection = inPageSections.findLast((section) => section.getBoundingClientRect().top <= readingLine)
      ?? inPageSections[0];

    if (activeSection.id !== activeSectionId) {
      activeSectionId = activeSection.id;
      setActiveSection(activeSectionId);
    }
  };

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();
}

document.querySelectorAll('.work-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.work-card');
    const isOpen = card.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    card.querySelector('.work-detail').setAttribute('aria-hidden', String(!isOpen));
  });
});

const layerContent = {
  1: ["Understand the workflow", "I talk with leaders and the people who do the work. I follow the handoffs, exceptions, and decisions to understand where the process breaks down and who feels it."],
  2: ["Find and refine use cases", "I work with the customer to turn what we learn into use cases. We refine them as we uncover constraints and agree on what an evaluation needs to show."],
  3: ["Build a working example", "I build demos and proofs of concept around realistic scenarios. When AI is part of the solution, I show where it fits in the workflow and what people can test for themselves."],
  4: ["Test the details", "I test the workflow with colleagues, check product capabilities with specialists, and follow up on open technical questions. Customers need a clear picture of what they can rely on."],
  5: ["Share what worked", "I document the choices that shaped the proof and share useful demo environments, lab guides, or test plans so colleagues can build on them."]
};
const layerDetail = document.querySelector('.layer-detail');
const layerButtons = document.querySelectorAll('.layer-node');

layerButtons.forEach((button) => button.addEventListener('click', () => {
  const [title, description] = layerContent[button.dataset.layer];

  layerButtons.forEach((node) => {
    const isActive = node === button;
    node.classList.toggle('active', isActive);
    node.setAttribute('aria-pressed', String(isActive));
  });

  layerDetail.querySelector('h3').textContent = title;
  layerDetail.querySelector('p').textContent = description;
}));

const siteSearch = document.querySelector('#site-search');
const siteSearchForm = document.querySelector('#site-search-form');
const searchResults = document.querySelector('#search-results');

if (siteSearch && siteSearchForm && searchResults) {
  const searchIndex = [
    { title: 'A hands-on AI proof of value', description: 'A guided evaluation of agentic skills and workflows for life sciences.', type: 'Work', href: '#ai-proof', terms: 'ai workflow artificial intelligence agent agentic proof of value poc automation demo' },
    { title: 'Redesigning a patient services demo', description: 'Discovery, sample patient cases, and AI-assisted analysis for a contract research organization.', type: 'Work', href: '#research-workflow', terms: 'cro clinical research patient services pocs knowledge automation AI workflow renewal discovery' },
    { title: 'A simpler path for corrective actions', description: 'Checking product capabilities before recommending a way to support an 8D process.', type: 'Work', href: '#quality-workflow', terms: '8d medtech quality portal process technical validation corrective actions' },
    { title: 'A Claude skill for building demos', description: 'A tool solution consultants use to create customer-specific demos quickly and accurately.', type: 'Leadership', href: '#claude-skill', terms: 'claude skill ai leadership enablement team reusable demo adoption' },
    { title: 'Coaching and enablement', description: 'Coaching, interview support, and hands-on work with other solution consultants.', type: 'Leadership', href: '#leadership', terms: 'leadership coaching enablement hiring interviewing team coverage mentorship' },
    { title: 'Clinical operations and enterprise presales', description: 'Epic Ambulatory workflows, a clinical medicine background, and enterprise solution consulting.', type: 'Background', href: '#experience', terms: 'clinical operations epic healthcare life sciences patient workflow adoption reporting resume résumé' },
    { title: 'Chicago World Forum keynote', description: 'A live demo on the main stage at ServiceNow’s Chicago event.', type: 'Speaking', href: '#keynote', terms: 'keynote stage event speaker presentation forum public speaking' }
  ];

  const renderSearch = (value) => {
    const query = value.trim().toLowerCase();
    searchResults.replaceChildren();
    if (!query) return;

    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = searchIndex.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.terms}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No results. Try “AI workflow,” “Claude skill,” or “clinical operations.”';
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
