import {
  formatLocalDate,
  getMonday,
  getOfficeShift,
  getShiftColor,
  getWeekShiftStatuses,
  parseLocalDate,
} from './shifts.js';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

const weekRangeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
});

export function initCalendar(getConfig) {
  const els = {
    title: document.getElementById('calendar-title'),
    grid: document.getElementById('calendar-grid'),
    legend: document.getElementById('legend'),
    prevBtn: document.getElementById('prev-month'),
    nextBtn: document.getElementById('next-month'),
    todayBtn: document.getElementById('today-month'),
    weekDetail: document.getElementById('week-detail'),
    weekDetailTitle: document.getElementById('week-detail-title'),
    weekDetailList: document.getElementById('week-detail-list'),
  };

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedWeekStart = formatLocalDate(getMonday(today));

  function renderLegend(config) {
    els.legend.innerHTML = '';

    for (let index = 0; index < config.numTurnos; index += 1) {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const swatch = document.createElement('span');
      swatch.className = 'legend-swatch';
      swatch.style.backgroundColor = getShiftColor(index);

      const label = document.createElement('span');
      label.textContent = config.nombres[index] || `Turno ${index + 1}`;

      item.append(swatch, label);
      els.legend.appendChild(item);
    }
  }

  function buildMonthWeeks(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = getMonday(firstOfMonth);
    const weeks = [];

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const weekStart = new Date(gridStart);
      weekStart.setDate(gridStart.getDate() + weekIndex * 7);

      const days = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        days.push(date);
      }

      weeks.push({ weekStart, days });
    }

    return weeks;
  }

  function renderWeekDetail(weekStartIso, config) {
    const weekStart = parseLocalDate(weekStartIso);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const range = `${weekRangeFormatter.format(weekStart)} – ${weekRangeFormatter.format(weekEnd)}`;
    els.weekDetailTitle.textContent = `Semana del ${range}`;
    els.weekDetailList.innerHTML = '';

    getWeekShiftStatuses(weekStart, config).forEach((shift) => {
      const item = document.createElement('li');
      item.className = `week-detail-item status-${shift.status}`;

      const name = document.createElement('span');
      name.className = 'week-detail-name';
      name.textContent = shift.name;

      const badge = document.createElement('span');
      badge.className = 'week-detail-badge';
      badge.textContent = shift.status === 'oficina' ? 'Oficina' : 'Casa';

      if (shift.status === 'oficina') {
        item.style.borderLeftColor = getShiftColor(shift.index);
      }

      item.append(name, badge);
      els.weekDetailList.appendChild(item);
    });

    els.weekDetail.hidden = false;
  }

  function renderWeekRow(week, config, year, month) {
    const officeShift = getOfficeShift(week.weekStart, config);
    const weekStartIso = formatLocalDate(week.weekStart);
    const isSelected = weekStartIso === selectedWeekStart;

    const row = document.createElement('div');
    row.className = 'calendar-week';
    row.dataset.weekStart = weekStartIso;
    row.style.setProperty('--shift-color', getShiftColor(officeShift.index));

    if (isSelected) {
      row.classList.add('selected');
    }

    const label = document.createElement('div');
    label.className = 'week-label';
    label.textContent = isSelected ? `${officeShift.name} - Oficina` : `${officeShift.name} - Casa`;

    const daysRow = document.createElement('div');
    daysRow.className = 'week-days';

    WEEKDAY_LABELS.forEach((weekday, index) => {
      const dayCell = document.createElement('div');
      const date = week.days[index];
      const isCurrentMonth = date.getMonth() === month && date.getFullYear() === year;
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      dayCell.className = 'day-cell';
      if (!isCurrentMonth) dayCell.classList.add('other-month');
      if (isToday) dayCell.classList.add('today');

      const weekdayEl = document.createElement('span');
      weekdayEl.className = 'day-weekday';
      weekdayEl.textContent = weekday;

      const numberEl = document.createElement('span');
      numberEl.className = 'day-number';
      numberEl.textContent = String(date.getDate());

      dayCell.append(weekdayEl, numberEl);
      daysRow.appendChild(dayCell);
    });

    row.append(label, daysRow);

    row.addEventListener('click', () => {
      selectedWeekStart = weekStartIso;
      render();
    });

    return row;
  }

  function render() {
    const config = getConfig();
    els.title.textContent = monthFormatter.format(new Date(viewYear, viewMonth, 1));
    renderLegend(config);

    els.grid.innerHTML = '';
    const weeks = buildMonthWeeks(viewYear, viewMonth);

    weeks.forEach((week) => {
      const hasCurrentMonthDay = week.days.some(
        (date) => date.getMonth() === viewMonth && date.getFullYear() === viewYear,
      );

      if (hasCurrentMonthDay) {
        els.grid.appendChild(renderWeekRow(week, config, viewYear, viewMonth));
      }
    });

    renderWeekDetail(selectedWeekStart, config);
  }

  els.prevBtn.addEventListener('click', () => {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear -= 1;
    } else {
      viewMonth -= 1;
    }
    render();
  });

  els.nextBtn.addEventListener('click', () => {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear += 1;
    } else {
      viewMonth += 1;
    }
    render();
  });

  els.todayBtn.addEventListener('click', () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    selectedWeekStart = formatLocalDate(getMonday(today));
    render();
  });

  return { render };
}
