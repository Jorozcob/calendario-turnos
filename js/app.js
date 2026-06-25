import { initConfig } from './config.js';
import { initCalendar } from './calendar.js';

const configApi = initConfig(() => {
  calendar.render();
});

const calendar = initCalendar(() => configApi.getConfig());

calendar.render();
