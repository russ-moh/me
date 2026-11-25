const demo = document.querySelector('#voice-demo');
const testButtons = [...demo.querySelectorAll('[data-test]')];
const testLinks = document.querySelectorAll('[data-open-test]');
const callHeader = demo.querySelector('.voice-session-header');
const runButton = demo.querySelector('#run-test');
const resetButton = demo.querySelector('#reset-test');
const listenButton = demo.querySelector('#listen-reply');
const actionList = demo.querySelector('#caller-actions');
const transcript = demo.querySelector('#call-transcript');
const toolTrace = demo.querySelector('#tool-trace');
const checks = demo.querySelector('#test-checks');
const recordSummary = demo.querySelector('#record-summary');
const caseSummary = demo.querySelector('#case-summary');
const callStatus = demo.querySelector('#call-status');
const announcement = demo.querySelector('#call-announcement');
const routeSteps = ['verify', 'lookup', 'resolve'].map((step) => demo.querySelector('#route-' + step));

const originalAppointment = {
  id: 'APT-1042',
  visitType: 'Specialty follow-up',
  clinic: 'North Clinic',
  time: 'Thursday, December 3 at 9:20 a.m.',
  revision: 1,
};

const inventory = [
  { id: 'FR-1440', label: '2:40 p.m.', time: 'Friday, December 4 at 2:40 p.m.', minutes: 880, visitType: 'Specialty follow-up', clinic: 'North Clinic' },
  { id: 'FR-1520', label: '3:20 p.m.', time: 'Friday, December 4 at 3:20 p.m.', minutes: 920, visitType: 'Specialty follow-up', clinic: 'North Clinic' },
  { id: 'FR-1110', label: '11:10 a.m.', time: 'Friday, December 4 at 11:10 a.m.', minutes: 670, visitType: 'Specialty follow-up', clinic: 'North Clinic' },
  { id: 'FR-1600', label: '4:00 p.m.', time: 'Friday, December 4 at 4:00 p.m.', minutes: 960, visitType: 'New patient visit', clinic: 'North Clinic' },
];

const restrictedTools = new Set(['get_appointment', 'find_open_slots', 'update_appointment', 'verify_saved_appointment']);
const speech = window.speechSynthesis;
let session;
let voice;
let playing;

function say(speaker, text) {
  session.messages.push({ speaker, text });
}

function trace(name, status, input, output) {
  session.trace.push({ name, status, input, output });
}

function startTest(test) {
  stopVoice();
  session = {
    test,
    stage: 'verify',
    verified: false,
    confirmed: false,
    appointment: { ...originalAppointment },
    slots: inventory.map((slot) => ({ ...slot, available: test !== 'conflict' || slot.id !== 'FR-1520' })),
    offered: [],
    trace: [],
    messages: [],
  };
  toolTrace.replaceChildren();
  say('Caller', 'I need to move my follow-up to Friday after two, if you have anything.');
  say('Voice agent', 'I can help with that. First I need to verify your identity before I can look up your visit.');
  render();
}

function requireVerification() {
  if (!session.verified) throw new Error('Appointment access requires caller verification.');
}

function verifyCaller() {
  say('Caller', 'Okay, let’s verify.');
  session.verified = session.test !== 'unverified';
  trace('verify_caller', session.verified ? 'Success' : 'Blocked',
    { method: 'Simulated identity challenge' },
    { verified: session.verified, access: session.verified ? 'Appointment access granted' : 'Appointment access denied' });

  if (!session.verified) {
    session.handoffReason = 'Caller could not complete verification';
    session.stage = 'handoff';
    say('Voice agent', 'I couldn’t verify your identity. I can send a request to scheduling so a team member can help you verify and move the visit.');
    return;
  }

  requireVerification();
  trace('get_appointment', 'Success', { scope: 'Verified caller' }, { ...session.appointment });
  findSlots();
}

function findSlots() {
  requireVerification();
  const { clinic, visitType } = session.appointment;
  session.offered = session.slots.filter((slot) =>
    slot.available && slot.minutes >= 840 && slot.clinic === clinic && slot.visitType === visitType);
  trace('find_open_slots', session.offered.length ? 'Success' : 'No match',
    { day: 'Friday, Dec 4', after: '2:00 p.m.', clinic, visitType },
    { eligibleTimes: session.offered.map(({ id, label }) => ({ id, label })) });

  if (session.offered.length) {
    const options = session.offered.map((slot) => slot.label).join(' or ');
    session.stage = 'choose';
    say('Voice agent', 'I found ' + options + ' on Friday for the same visit type at North Clinic. Which time works for you?');
    return;
  }

  session.handoffReason = 'Selected slot taken and no eligible alternatives';
  session.stage = 'handoff';
  say('Voice agent', 'That time was taken before I could book it, and there are no other Friday afternoon slots for this visit. Your Thursday appointment is still booked. Would you like scheduling to follow up?');
}

function chooseSlot(slot) {
  session.selected = slot;
  session.stage = 'confirm';
  say('Caller', slot.label + ' works for me.');
  say('Voice agent', 'Should I move your visit to ' + slot.time + ' at North Clinic? Your original appointment stays in place until the change goes through.');
}

function updateAppointment(slot, callerConfirmed) {
  requireVerification();
  const input = {
    appointment: session.appointment.id,
    currentRevision: session.appointment.revision,
    slot: slot.id,
    callerConfirmed,
  };

  if (!callerConfirmed) {
    trace('update_appointment', 'Blocked', input, { saved: false, reason: 'Caller confirmation required' });
    return false;
  }

  if (!slot.available) {
    trace('update_appointment', 'Conflict', input, { code: 409, saved: false, reason: 'Slot no longer available' });
    return false;
  }

  slot.available = false;
  session.appointment = {
    ...session.appointment,
    time: slot.time,
    revision: session.appointment.revision + 1,
  };
  trace('update_appointment', 'Success', input, {
    saved: true,
    appointment: session.appointment.id,
    revision: session.appointment.revision,
  });
  return true;
}

function confirmChange() {
  say('Caller', 'Yes, please move it.');
  session.confirmed = true;
  if (session.test === 'conflict') session.selected.available = false;

  if (!updateAppointment(session.selected, session.confirmed)) {
    findSlots();
    return;
  }

  const saved = { ...session.appointment };
  trace('verify_saved_appointment', 'Success', { appointment: saved.id },
    { time: saved.time, clinic: saved.clinic, revision: saved.revision });
  say('Voice agent', 'You’re confirmed for ' + saved.time + ' at North Clinic. Your appointment reference is ' + saved.id + '.');
  session.stage = 'complete';
}

function handOff() {
  say('Caller', 'Yes, please have scheduling help.');
  const context = {
    intent: 'Reschedule a specialty follow-up',
    verification: session.verified ? 'Verified' : 'Needs verification',
    reason: session.handoffReason,
    ...(session.verified ? {
      appointment: session.appointment.id,
      preferredWindow: 'Friday after 2:00 p.m.',
    } : {}),
  };
  session.caseRecord = { id: 'CASE-2083', queue: 'Scheduling', context };
  trace('create_scheduling_case', 'Queued', context, { id: session.caseRecord.id, queue: session.caseRecord.queue });
  say('Voice agent', 'I’ve sent your request to the scheduling team. Your reference is ' + session.caseRecord.id + '.');
  session.stage = 'complete';
}

function callerActions() {
  switch (session.stage) {
    case 'verify':
      return [{ label: 'Verify demo identity', perform: verifyCaller }];
    case 'choose':
      return session.offered.map((slot) => ({ label: 'Choose ' + slot.label, perform: () => chooseSlot(slot) }));
    case 'confirm':
      return [{ label: 'Confirm change', perform: confirmChange }];
    case 'handoff':
      return [{ label: 'Send to scheduling', perform: handOff }];
    default:
      return [];
  }
}

function acceptanceChecks() {
  let authorized = false;
  const accessSafe = session.trace.every((item) => {
    if (item.name === 'verify_caller') authorized = item.output.verified;
    return !restrictedTools.has(item.name) || authorized;
  });
  const changed = session.appointment.revision !== originalAppointment.revision;
  const successfulWrite = session.trace.find((item) => item.name === 'update_appointment' && item.output.saved);

  const saved = session.trace.find((item) => item.name === 'verify_saved_appointment');
  const recordSafe = session.test === 'reschedule'
    ? changed && successfulWrite?.input.callerConfirmed && saved?.output.time === session.appointment.time
    : !changed && session.appointment.time === originalAppointment.time && !successfulWrite &&
      (session.test !== 'conflict' || session.trace.some((item) => item.status === 'Conflict'));

  const handoffSafe = session.test === 'reschedule'
    ? !session.caseRecord
    : session.caseRecord?.queue === 'Scheduling' &&
      (session.test === 'unverified'
        ? session.caseRecord.context.verification === 'Needs verification' && !session.caseRecord.context.appointment
        : session.caseRecord.context.appointment === originalAppointment.id && session.caseRecord.context.preferredWindow === 'Friday after 2:00 p.m.');
  return [
    ['Identity gate', accessSafe && authorized === (session.test !== 'unverified')],
    ['Appointment integrity', recordSafe],
    ['Handoff context', handoffSafe],
  ];
}

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
};

function renderTranscript() {
  const rows = session.messages.map(({ speaker, text }) => {
    const row = element('li', '', 'voice-turn');
    row.dataset.speaker = speaker === 'Caller' ? 'caller' : 'agent';
    row.append(element('span', speaker), element('p', text));
    return row;
  });
  transcript.replaceChildren(...rows);
  transcript.scrollTop = transcript.scrollHeight;
}

function renderTrace() {
  const opened = [...toolTrace.querySelectorAll('details')].map((item) => item.open);
  const rows = session.trace.map(({ name, status, input, output }, index) => {
    const row = element('li', '');
    const detail = element('details', '');
    const label = element('summary', '');
    const outcome = element('span', status, 'trace-result');
    outcome.dataset.tone = ['Success', 'Queued'].includes(status) ? 'success' : 'exception';
    label.append(element('code', name), outcome);
    detail.open = Boolean(opened[index]);
    detail.append(label, element('pre', JSON.stringify({ input, output }, null, 2)));
    row.append(detail);
    return row;
  });
  toolTrace.replaceChildren(...(rows.length ? rows : [element('li', 'The first tool runs when you verify the demo identity.', 'trace-empty')]));
}

function render() {
  const complete = session.stage === 'complete';
  const phases = [
    session.stage === 'verify' ? 'current' : session.verified ? 'done' : 'blocked',
    session.stage === 'choose' ? 'current' : session.verified ? 'done' : complete || session.stage === 'handoff' ? 'skipped' : 'pending',
    complete ? 'done' : ['confirm', 'handoff'].includes(session.stage) ? 'current' : 'pending',
  ];
  const labels = { verify: 'Awaiting verification', choose: 'Choose an eligible time', confirm: 'Awaiting confirmation', handoff: 'Handoff available' };

  callStatus.textContent = complete ? (session.caseRecord ? 'Case queued' : 'Reschedule confirmed') : labels[session.stage];
  callHeader.dataset.stage = session.caseRecord ? 'queued' : session.stage;
  routeSteps.forEach((item, index) => {
    const phase = phases[index];
    item.dataset.state = phase;
    if (phase === 'current') item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });

  renderTranscript();
  renderTrace();

  recordSummary.textContent = session.verified
    ? session.appointment.id + ' · ' + session.appointment.time + ' · Revision ' + session.appointment.revision
    : session.stage === 'verify' ? 'Protected until verification' : 'Protected · Identity check failed';
  caseSummary.hidden = !session.caseRecord;
  if (session.caseRecord) caseSummary.textContent = session.caseRecord.id + ' · Queued to Scheduling';

  const buttons = callerActions().map(({ label, perform }) => {
    const button = element('button', label, 'button button-primary');
    button.type = 'button';
    button.addEventListener('click', () => {
      stopVoice();
      perform();
      render();
      (actionList.querySelector('button') || resetButton).focus({ preventScroll: true });
    });
    return button;
  });
  actionList.replaceChildren(...buttons);
  actionList.hidden = complete;
  runButton.disabled = complete;
  testButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.test === session.test)));

  checks.replaceChildren(...acceptanceChecks().map(([label, passed]) => {
    const item = element('li', '');
    const result = element('span', complete ? (passed ? 'Pass' : 'Review') : 'Pending');
    result.dataset.result = complete ? (passed ? 'pass' : 'review') : 'pending';
    item.append(element('strong', label), result);
    return item;
  }));

  announcement.textContent = callStatus.textContent + '. ' + session.messages.at(-1).text;
}

function stopVoice() {
  if (playing) speech.cancel();
  playing = null;
  delete callHeader.dataset.speaking;
  listenButton.textContent = 'Listen to reply';
}

function loadLocalVoice() {
  voice = speech.getVoices().find((option) => option.localService && /^en[-_]/i.test(option.lang));
  listenButton.hidden = !voice;
}

if (speech && 'SpeechSynthesisUtterance' in window) {
  loadLocalVoice();
  speech.addEventListener('voiceschanged', loadLocalVoice);
  listenButton.addEventListener('click', () => {
    if (playing) {
      stopVoice();
      return;
    }
    const reply = new SpeechSynthesisUtterance(session.messages.at(-1).text);
    reply.voice = voice;
    reply.onend = reply.onerror = () => {
      if (playing === reply) stopVoice();
    };
    playing = reply;
    callHeader.dataset.speaking = 'true';
    listenButton.textContent = 'Stop reply';
    speech.speak(reply);
  });
}

testButtons.forEach((button) => button.addEventListener('click', () => startTest(button.dataset.test)));
testLinks.forEach((link) => {
  link.hidden = false;
  link.addEventListener('click', () => startTest(link.dataset.openTest));
});
resetButton.addEventListener('click', () => startTest(session.test));
runButton.addEventListener('click', () => {
  stopVoice();
  for (let turn = 0; turn < 6 && session.stage !== 'complete'; turn++) {
    const [action] = callerActions();
    action.perform();
  }
  render();
  if (runButton.disabled) resetButton.focus({ preventScroll: true });
});

demo.hidden = false;
startTest('reschedule');
