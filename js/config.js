import {
  MIN_SHIFTS,
  MAX_SHIFTS,
  formatLocalDate,
  getMonday,
  getShiftName,
} from './shifts.js';

const STORAGE_KEY = 'calendario-turnos-config';

export function getDefaultConfig() {
  const today = getMonday(new Date());
  return {
    numTurnos: 2,
    nombres: ['Turno 1', 'Turno 2'],
    fechaInicio: formatLocalDate(today),
    turnoInicial: 0,
  };
}

export function normalizeConfig(raw) {
  const defaults = getDefaultConfig();
  const numTurnos = clampNumber(raw?.numTurnos, MIN_SHIFTS, MAX_SHIFTS, defaults.numTurnos);
  const nombres = Array.from({ length: numTurnos }, (_, index) => {
    const value = raw?.nombres?.[index];
    return value && String(value).trim() ? String(value).trim() : `Turno ${index + 1}`;
  });

  const fechaInicio = raw?.fechaInicio
    ? formatLocalDate(getMonday(parseInputDate(raw.fechaInicio)))
    : defaults.fechaInicio;

  const turnoInicial = clampNumber(raw?.turnoInicial, 0, numTurnos - 1, defaults.turnoInicial);

  return { numTurnos, nombres, fechaInicio, turnoInicial };
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parseInputDate(value) {
  if (value instanceof Date) return value;
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultConfig();
    return normalizeConfig(JSON.parse(stored));
  } catch {
    return getDefaultConfig();
  }
}

export function saveConfig(config) {
  const normalized = normalizeConfig(config);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return { config: normalized, persisted: true };
  } catch {
    return { config: normalized, persisted: false };
  }
}

export function initConfig(onChange) {
  let config = loadConfig();
  let storageAvailable = true;

  const els = {
    form: document.getElementById('config-form'),
    numTurnos: document.getElementById('num-turnos'),
    shiftNames: document.getElementById('shift-names'),
    fechaInicio: document.getElementById('fecha-inicio'),
    turnoInicial: document.getElementById('turno-inicial'),
    mondayHint: document.getElementById('monday-hint'),
    storageWarning: document.getElementById('storage-warning'),
    resetBtn: document.getElementById('reset-config'),
    toggleBtn: document.getElementById('toggle-config'),
    configPanel: document.getElementById('config-panel'),
  };

  function renderShiftNameFields() {
    const count = clampNumber(els.numTurnos.value, MIN_SHIFTS, MAX_SHIFTS, config.numTurnos);
    els.shiftNames.innerHTML = '';

    for (let index = 0; index < count; index += 1) {
      const wrapper = document.createElement('div');
      wrapper.className = 'form-group';

      const label = document.createElement('label');
      label.setAttribute('for', `shift-name-${index}`);
      label.textContent = `Nombre turno ${index + 1}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.id = `shift-name-${index}`;
      input.name = `shift-name-${index}`;
      input.value = config.nombres[index] || `Turno ${index + 1}`;
      input.placeholder = `Turno ${index + 1}`;

      wrapper.append(label, input);
      els.shiftNames.appendChild(wrapper);
    }
  }

  function renderTurnoInicialOptions() {
    const count = clampNumber(els.numTurnos.value, MIN_SHIFTS, MAX_SHIFTS, config.numTurnos);
    const previous = Number(els.turnoInicial.value);
    els.turnoInicial.innerHTML = '';

    for (let index = 0; index < count; index += 1) {
      const input = document.querySelector(`#shift-name-${index}`);
      const name = input?.value.trim() || `Turno ${index + 1}`;
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = name;
      els.turnoInicial.appendChild(option);
    }

    const nextValue = Number.isFinite(previous) && previous < count ? previous : config.turnoInicial;
    els.turnoInicial.value = String(Math.min(count - 1, Math.max(0, nextValue)));
  }

  function updateMondayHint() {
    const monday = getMonday(parseInputDate(els.fechaInicio.value));
    const formatted = monday.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    els.mondayHint.textContent = `Se usará el lunes de esa semana: ${formatted}`;
  }

  function readFormConfig() {
    const numTurnos = clampNumber(els.numTurnos.value, MIN_SHIFTS, MAX_SHIFTS, config.numTurnos);
    const nombres = Array.from({ length: numTurnos }, (_, index) => {
      const input = document.querySelector(`#shift-name-${index}`);
      return input?.value.trim() || `Turno ${index + 1}`;
    });

    return normalizeConfig({
      numTurnos,
      nombres,
      fechaInicio: els.fechaInicio.value,
      turnoInicial: Number(els.turnoInicial.value),
    });
  }

  function applyConfigToForm(nextConfig) {
    config = normalizeConfig(nextConfig);
    els.numTurnos.value = String(config.numTurnos);
    els.fechaInicio.value = config.fechaInicio;
    renderShiftNameFields();
    renderTurnoInicialOptions();
    els.turnoInicial.value = String(config.turnoInicial);
    updateMondayHint();
  }

  function commitConfig() {
    const result = saveConfig(readFormConfig());
    config = result.config;
    storageAvailable = result.persisted;
    els.storageWarning.hidden = storageAvailable;
    renderTurnoInicialOptions();
    onChange(config);
  }

  applyConfigToForm(config);
  els.storageWarning.hidden = storageAvailable;

  els.numTurnos.addEventListener('change', () => {
    renderShiftNameFields();
    renderTurnoInicialOptions();
    commitConfig();
  });

  els.shiftNames.addEventListener('input', () => {
    renderTurnoInicialOptions();
    commitConfig();
  });

  els.fechaInicio.addEventListener('change', () => {
    updateMondayHint();
    commitConfig();
  });

  els.turnoInicial.addEventListener('change', commitConfig);

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    commitConfig();
  });

  els.resetBtn.addEventListener('click', () => {
    applyConfigToForm(getDefaultConfig());
    commitConfig();
  });

  els.toggleBtn?.addEventListener('click', () => {
    els.configPanel.classList.toggle('collapsed');
    const collapsed = els.configPanel.classList.contains('collapsed');
    els.toggleBtn.setAttribute('aria-expanded', String(!collapsed));
  });

  return {
    getConfig: () => config,
    setConfig: (nextConfig) => {
      applyConfigToForm(nextConfig);
      commitConfig();
    },
  };
}

export function describeConfig(config) {
  return config.nombres.map((_, index) => getShiftName(config, index)).join(', ');
}
