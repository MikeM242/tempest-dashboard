async function loadData() {
  const weatherEl = document.getElementById('weather');
  const updatedEl = document.getElementById('updated');

  try {
    const resp = await fetch('data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const obs = data.obs?.[0];
    if (!obs) throw new Error('No observation data');

    const fmt = (v, d=1) => v != null ? v.toFixed(d) : 'N/A';
    const c2f = c => c != null ? c * 9/5 + 32 : null;

    const rainRateIn = obs.precip_rate != null ? obs.precip_rate * 0.0393701 : null;
    const rainDesc = (rainRateIn === null || rainRateIn === 0)
      ? 'None' : rainRateIn <= 0.1 ? 'Light' 
      : rainRateIn <= 0.3 ? 'Moderate' : 'Heavy';

    const windSpeed = obs.wind_speed != null ? fmt(obs.wind_speed) : '0';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const windDir = obs.wind_direction != null
      ? dirs[Math.floor(((obs.wind_direction + 11.25) % 360) / 22.5)]
      : 'N/A';

    const skyDesc = obs.weather ?? 'N/A';

    weatherEl.innerHTML = `
      <div>🌡 Temp: <strong>${fmt(c2f(obs.air_temperature))} °F</strong></div>
      <div>🤒 Feels Like: <strong>${fmt(c2f(obs.feels_like ?? obs.air_temperature))} °F</strong></div>
      <div>💧 Humidity: <strong>${obs.relative_humidity ?? 'N/A'}%</strong></div>
      <div>🌬 Wind: <strong>${windSpeed} mph ${windDir}</strong></div>
      <div>🔻 Pressure: <strong>${fmt(obs.station_pressure,2)} mb</strong></div>
      <div>🌧 Rain: <strong>${rainDesc}</strong></div>
      <div>☁ Sky: <strong>${skyDesc}</strong></div>
    `;

    updatedEl.textContent = obs.timestamp
      ? `Last updated: ${new Date(obs.timestamp *1000).toLocaleString()}`
      : 'Last updated: N/A';

  } catch (e) {
    console.error(e);
    weatherEl.textContent = 'Error loading data';
  }
}

async function fetchSky() {
  try {
    const text = await fetch('https://corsproxy.io/?https://forecast.weather.gov/data/obhistory/KFRG.html').then(r => r.text());
    const temp = document.createElement('div');
    temp.innerHTML = text;
    const cells = temp.querySelectorAll('td');
    let sky = 'N/A';
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].textContent.trim() === 'Weather' && cells[i+1]) {
        sky = cells[i+1].textContent.trim();
        break;
      }
    }
    document.getElementById('sky-from-nws').textContent = sky;
  } catch (err) {
    console.error('Sky fetch error', err);
    document.getElementById('sky-from-nws').textContent = 'N/A';
  }
}

loadData();
fetchSky();
setInterval(loadData, 5*60*1000);
setInterval(fetchSky, 10*60*1000);
