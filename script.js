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

    // Conversion helpers
    function cToF(c) {
      return c !== undefined && c !== null ? c * 9 / 5 + 32 : null;
    }

    // Pressure: inHg to mb (1 inHg = 33.8639 mb)
    function inHgTomb(inHg) {
      return inHg !== undefined && inHg !== null ? inHg * 33.8639 : null;
    }

    const tempF = cToF(obs.air_temperature);
    const feelsF = cToF(obs.feels_like ?? obs.air_temperature);

    weatherEl.innerHTML = `
      <div>Temperature:<br><strong>${fmtNum(tempF)} °F</strong></div>
      <div>Feels Like:<br><strong>${fmtNum(feelsF)} °F</strong></div>
      <div>Humidity:<br><strong>${obs.relative_humidity ?? 'N/A'}%</strong></div>
      <div>Wind Speed:<br><strong>${fmtNum(obs.wind_speed)} mph</strong></div>
      <div>Pressure:<br><strong>${fmtNum(inHgTomb(obs.station_pressure), 2)} mb</strong></div>
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
