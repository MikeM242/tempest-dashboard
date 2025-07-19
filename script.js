async function loadData() {
  const weatherEl = document.getElementById('weather');
  const updatedEl = document.getElementById('updated');

  try {
    const resp = await fetch('data.json');
    console.log('Fetch status:', resp.status);

    if (!resp.ok) {
      throw new Error(`HTTP error ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Loaded data:', data);

    const obs = data.obs?.[0];
    if (!obs) {
      throw new Error('No observation data found in data.json');
    }

    // Format and display the weather data
    const stats = {
      'Temperature': `${obs.air_temperature.toFixed(1)} °F`,
      'Feels Like': `${obs.feels_like?.toFixed(1) ?? obs.air_temperature.toFixed(1)} °F`,
      'Humidity': `${obs.relative_humidity}%`,
      'Wind Speed': `${obs.wind_speed.toFixed(1)} mph`,
      'Pressure': `${obs.station_pressure.toFixed(2)} inHg`,
    };

    weatherEl.innerHTML = '';
    for (const [label, value] of Object.entries(stats)) {
      const div = document.createElement('div');
      div.className = 'stat';
      div.innerHTML = `<span class="label">${label}</span><span class="value">${value}</span>`;
      weatherEl.appendChild(div);
    }

    // Show the updated timestamp
    const updatedDate = new Date(obs.timestamp * 1000);
    updatedEl.textContent = `Last updated: ${updatedDate.toLocaleString()}`;

  } catch (err) {
    console.error('Error loading weather data:', err);
    weatherEl.textContent = 'Error loading data';
    updatedEl.textContent = '';
  }
}

// Load on page load and refresh every 5 minutes
loadData();
setInterval(loadData, 5 * 60 * 1000);
