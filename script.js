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

    // Helper to format numbers safely
    function fmtNum(val, decimals = 1) {
      return (val !== undefined && val !== null) ? val.toFixed(decimals) : 'N/A';
    }

    weatherEl.innerHTML = `
      <div>Temperature: ${fmtNum(obs.air_temperature)} °F</div>
      <div>Feels Like: ${fmtNum(obs.feels_like ?? obs.air_temperature)} °F</div>
      <div>Humidity: ${obs.relative_humidity ?? 'N/A'}%</div>
      <div>Wind Speed: ${fmtNum(obs.wind_speed)} mph</div>
      <div>Pressure: ${fmtNum(obs.station_pressure, 2)} inHg</div>
    `;

    if (obs.timestamp) {
      const updatedDate = new Date(obs.timestamp * 1000);
      updatedEl.textContent = `Last updated: ${updatedDate.toLocaleString()}`;
    } else {
      updatedEl.textContent = 'Last updated: N/A';
    }

  } catch (err) {
    console.error('Error loading weather data:', err);
    weatherEl.textContent = 'Error loading data';
    updatedEl.textContent = '';
  }
}

loadData();
setInterval(loadData, 5 * 60 * 1000); // Refresh every 5 minutes
