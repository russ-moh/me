const scenarioControls = document.querySelector('.scenario-controls');

const scenarios = {
  available: {
    request: '“I’d like to move my appointment.”',
    response: '“I found openings Tuesday at 10 a.m. and Thursday at 2 p.m. Which works for you?”',
    check: 'The times come from the scheduling system. The agent confirms a change only after the patient agrees and the system records it.',
  },
  unavailable: {
    request: '“Can you tell me what’s open later this week?”',
    response: '“I can’t check available times right now. I can connect you with the scheduling team to help move your appointment.”',
    check: 'The agent reports the problem, offers a handoff, and leaves the existing appointment in place.',
  },
  handoff: {
    request: '“I’d rather talk to someone in scheduling.”',
    response: '“I can connect you with scheduling and let them know you’re looking to move an existing appointment.”',
    check: 'The agent honors the request and passes along the reason for the call so the patient can pick up where they left off.',
  },
};

if (scenarioControls) {
  const buttons = [...scenarioControls.querySelectorAll('[data-scenario]')];
  const fields = {
    request: document.querySelector('#scenario-request'),
    response: document.querySelector('#scenario-response'),
    check: document.querySelector('#scenario-check'),
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const scenario = scenarios[button.dataset.scenario];

      Object.entries(fields).forEach(([name, element]) => {
        element.textContent = scenario[name];
      });
      buttons.forEach((option) => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });
  scenarioControls.hidden = false;
}
