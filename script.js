async function loadData() {
  const weatherEl = document.getElementById('weather');
  const updatedEl = document.getElementById('updated');

  try {
    const resp = await fetch('data.json');
    if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
    const data = await resp.json();

    if (!data.obs || !data.obs.length) {
      throw new Error('No observation data found');
    }
    const obs = data.obs[0];

    weatherEl.innerHTML = `
      <div>Temperature: ${obs.air_temperature?.toFixed(1)} °F</div>
      <div>Feels Like: ${obs.feels_like?.toFixed(1) ?? obs.air_temperature.toFixed(1)} °F</div>
      <div>Humidity: ${obs.relative_humidity}%</div>
      <div>Wind Speed: ${obs.wind_speed?.toFixed(1)} mph</div>
      <div>Pressure: ${obs.station_pressure?.toFixed(2)} inHg</div>
    `;

    const updatedDate = new Date(obs.timestamp * 1000);
    updatedEl.textContent = `Last updated: ${updatedDate.toLocaleString()}`;

  } catch (err) {
    console.error('Error loading data:', err);
    weatherEl.textContent = 'Error loading data';
    updatedEl.textContent = '';
  }
}

loadData();
setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes
