# Calendario de Turnos

Sitio web estático para visualizar la rotación semanal de turnos entre oficina y casa.

## Uso

1. Abre `index.html` en tu navegador (doble clic o arrastrando el archivo).
2. Configura el número de turnos, sus nombres, la fecha de inicio y qué turno va a la oficina la primera semana.
3. Navega por los meses con las flechas o el botón **Hoy**.
4. Haz clic en una semana para ver el detalle de todos los turnos (Oficina / Casa).

La configuración se guarda automáticamente en `localStorage`.

## Configuración

| Campo | Descripción |
|-------|-------------|
| Número de turnos | Entre 2 y 10 |
| Nombres | Etiqueta personalizada por turno |
| Fecha de inicio | Se normaliza al lunes de esa semana |
| Turno inicial | Quién va a la oficina en la primera semana del ciclo |

## Lógica de rotación

Cada semana un solo turno va a la oficina. La rotación avanza semanalmente:

```
indice = (turnoInicial + semanasDesdeInicio) % numTurnos
```

## Estructura

```
calendario-turnos/
├── index.html
├── css/styles.css
└── js/
    ├── app.js
    ├── config.js
    ├── calendar.js
    └── shifts.js
```

## Notas

- No requiere instalación ni servidor, pero si abres el archivo directamente algunos navegadores pueden restringir módulos ES. En ese caso usa una extensión como Live Server o un servidor local simple:

```bash
python3 -m http.server 8080
```

Luego visita `http://localhost:8080`.
