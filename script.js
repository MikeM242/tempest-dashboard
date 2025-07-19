async function loadData() {
  const weatherEl = document.getElementById('weather');
  const updatedEl = document.getElementById('updated');

  try {
    const resp = await fetch('data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const obs = data.obs?.[0];
    if (!obs) throw new Error('No observation data');

    const fmt = (v, d = 1) => v != null ? v.toFixed(d) : 'N/A';
    const c2f = c => c != null ? (c * 9 / 5 + 32) : null;
    const mmToIn = mm => mm != null ? (mm * 0.0393701) : null;

    const rainRateIn = mmToIn(obs.precip_rate);
    const totalRainIn = mmToIn(obs.precip_total);
    const rainDesc = (rainRateIn === null || rainRateIn === 0)
      ? 'None'
      : rainRateIn <= 0.1 ? 'Light'
      : rainRateIn <= 0.3 ? 'Moderate' : 'Heavy';

    const windSpeed = obs.wind_speed != null ? fmt(obs.wind_speed) : '0';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const windDir = obs.wind_direction != null
      ? dirs[Math.floor(((obs.wind_direction + 11.25) % 360) / 22.5)]
      : 'N/A';

    const lightning = obs.strike_count_last_3hr || 0;
    const lightningDist = obs.strike_last_dist != null
      ? `${(obs.strike_last_dist * 0.621371).toFixed(1)} mi`
      : 'N/A';
    const lightningAge = obs.strike_last_epoch != null
      ? `${Math.round((Date.now() / 1000 - obs.strike_last_epoch) / 60)} min ago`
      : 'N/A';

    weatherEl.innerHTML = `
      <div class="tile">🌡 Temp: <strong>${fmt(c2f(obs.air_temperature))} °F</strong></div>
      <div class="tile">🤒 Feels Like: <strong>${fmt(c2f(obs.feels_like ?? obs.air_temperature))} °F</strong></div>
      <div class="tile">💧 Humidity: <strong>${obs.relative_humidity ?? 'N/A'}%</strong></div>
      <div class="tile">🌬 Wind: <strong>${windSpeed} mph ${windDir}</strong></div>
      <div class="tile">🔻 Pressure: <strong>${fmt(obs.station_pressure, 2)} mb</strong></div>
      <div class="tile">🌧 Rain Intensity: <strong>${rainDesc}</strong></div>
      <div class="tile">🌧 Total Rain Today: <strong>${fmt(totalRainIn, 2)} in</strong></div>
      <div class="tile">⚡ Lightning: <strong>${lightning} strikes</strong></div>
      <div class="tile">📍 Last strike: <strong>${lightningDist}, ${lightningAge}</strong></div>
      <div class="tile" id="nws-sky-tile">☁ Sky (NWS): <strong>Loading...</strong></div>
    `;

    updatedEl.textContent = obs.timestamp
      ? `Last updated: ${new Date(obs.timestamp * 1000).toLocaleString()}`
      : 'Last updated: N/A';

  } catch (e) {
    console.error('Error loading weather data:', e);
    weatherEl.innerHTML = `<div class="tile">Error loading data</div>`;
  }
}

async function fetchSky() {
  const target = 'https://forecast.weather.gov/data/obhistory/KFRG.html';
  const proxies = [
    'https://corsproxy.io/?' + target,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(target)
  ];
  let sky = 'N/A';

  for (const url of proxies) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      const tds = div.querySelectorAll('td');
      for (let i = 0; i < tds.length; i++) {
        if (tds[i].textContent.trim() === 'Weather' && tds[i + 1]) {
          sky = tds[i + 1].textContent.trim();
          break;
        }
      }
      if (sky !== 'N/A') break;
    } catch (err) {
      console.warn('Sky fetch failed from', url, err);
    }
  }

  const tile = document.getElementById('nws-sky-tile');
  if (tile) tile.innerHTML = `☁ Sky (NWS): <strong>${sky}</strong>`;
}

// Initial load
loadData();
fetchSky();

// Auto-refresh
setInterval(loadData, 5 * 60 * 1000);  // every 5 minutes
setInterval(fetchSky, 10 * 60 * 1000); // every 10 minutes
