async function loadData() {
  try {
    const resp = await fetch('data.json');
    const data = await resp.json();
    const obs = data.obs?.[0];
    if (!obs) throw new Error('No observation data');

    const container = document.getElementById('weather');
    container.innerHTML = '';
    const stats = {
      'Temperature': `${obs.air_temperature.toFixed(1)} °F`,
      'Feels Like': `${obs.feels_like.toFixed(1)} °F`,
      'Humidity': `${obs.relative_humidity}%`,
      'Wind Speed': `${obs.wind_speed.toFixed(1)} mph`,
      'Pressure': `${obs.station_pressure.toFixed(2)} inHg`
    };

    for (const [k, v] of Object.entries(stats)) {
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<span class="label">${k}</span><span class="value">${v}</span>`;
      container.appendChild(div);
    }

    const dt = new Date(obs.timestamp * 1000);
    document.getElementById('updated').textContent = `Last updated: ${dt.toLocaleString()}`;
  } catch (err) {
    document.getElementById('weather').textContent = 'Error loading data';
    console.error(err);
  }
}

loadData();
setInterval(loadData, 5 * 60 * 1000); // refresh every 5 min
