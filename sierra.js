const scenarioControls = document.querySelector('.scenario-controls');

const scenarios = {
  available: {
    request: '“I’d like to move my appointment.”',
    response: '“I found openings Tuesday at 10 a.m. and Thursday at 2 p.m. Which works for you?”',
    check: 'The times come from the scheduling system. The agent confirms a change only after the patient agrees and the system records it.',
    path: {
      request: 'Move an appointment',
      agent: 'Check for open times',
      scheduling: 'Times verified',
      staff: 'No handoff needed',
      branches: ['scheduling'],
    },
  },
  unavailable: {
    request: '“Can you tell me what’s open later this week?”',
    response: '“I can’t check available times right now. I can connect you with the scheduling team to help move your appointment.”',
    check: 'The agent reports the problem, offers a handoff, and leaves the existing appointment in place.',
    path: {
      request: 'Find a time this week',
      agent: 'Try the scheduling lookup',
      scheduling: 'Lookup unavailable',
      staff: 'Offer a handoff',
      branches: ['scheduling', 'staff'],
    },
  },
  handoff: {
    request: '“I’d rather talk to someone in scheduling.”',
    response: '“I can connect you with scheduling and let them know you’re looking to move an existing appointment.”',
    check: 'The agent honors the request and passes along the reason for the call so the patient can pick up where they left off.',
    path: {
      request: 'Speak to scheduling',
      agent: 'Honor the handoff request',
      scheduling: 'Lookup skipped',
      staff: 'Share the reason for the call',
      branches: ['staff'],
    },
  },
};

if (scenarioControls) {
  const buttons = [...scenarioControls.querySelectorAll('[data-scenario]')];
  const fields = {
    request: document.querySelector('#scenario-request'),
    response: document.querySelector('#scenario-response'),
    check: document.querySelector('#scenario-check'),
  };
  const pathFields = {
    request: document.querySelector('#path-request'),
    agent: document.querySelector('#path-agent'),
    scheduling: document.querySelector('#path-scheduling-status'),
    staff: document.querySelector('#path-staff-status'),
  };
  const branches = {
    scheduling: document.querySelector('#path-scheduling'),
    staff: document.querySelector('#path-staff'),
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const scenario = scenarios[button.dataset.scenario];

      Object.entries(fields).forEach(([name, element]) => {
        element.textContent = scenario[name];
      });
      Object.entries(pathFields).forEach(([name, element]) => {
        element.textContent = scenario.path[name];
      });
      Object.entries(branches).forEach(([name, element]) => {
        element.dataset.active = String(scenario.path.branches.includes(name));
      });
      buttons.forEach((option) => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });
  scenarioControls.hidden = false;
}
