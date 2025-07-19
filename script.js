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

    const fmtNum = (val, decimals = 1) =>
      val !== undefined && val !== null ? val.toFixed(decimals) : 'N/A';

    // Convert °C to °F
    const tempF = obs.air_temperature !== null ? (obs.air_temperature * 9) / 5 + 32 : null;
    const feelsF = (obs.feels_like ?? obs.air_temperature) !== null ? ((obs.feels_like ?? obs.air_temperature) * 9) / 5 + 32 : null;

    // Wind speed: show 0 if null/undefined
    const windSpeed = obs.wind_speed != null ? fmtNum(obs.wind_speed) : '0';

    // Wind direction cardinal only
    function degToCardinal(deg) {
      if (deg == null) return 'N/A';
      const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const index = Math.floor(((deg + 11.25) % 360) / 22.5);
      return directions[index];
    }
    const windDir = obs.wind_direction != null ? degToCardinal(obs.wind_direction) : 'N/A';

    // Pressure in millibars (no conversion)
    const pressure = obs.station_pressure != null ? fmtNum(obs.station_pressure, 2) : 'N/A';

    // Convert rain from mm to inches: 1 mm = 0.0393701 in
    const mmToIn = (mm) => mm !== undefined && mm !== null ? mm * 0.0393701 : null;

    const rainRateIn = mmToIn(obs.precip_rate);
    const rainTodayIn = mmToIn(obs.precip_accum_local_day);

    const rainRate = rainRateIn !== null ? `${fmtNum(rainRateIn)} in/hr` : 'N/A';
    const rainToday = rainTodayIn !== null ? `${fmtNum(rainTodayIn)} in` : 'N/A';

    // Lightning strikes
    const lightning = data.strike_stats ?? null;
    let lightningHtml = 'No recent lightning data';
    if (lightning) {
      const strikes = lightning.strikes ?? 0;
      const dist = lightning.closest_strike_distance ?? 'N/A';
      const agoSeconds = lightning.closest_strike_age ?? null;

      let timeAgo = 'N/A';
      if (agoSeconds !== null) {
        if (agoSeconds < 60) timeAgo = `${agoSeconds} sec ago`;
        else timeAgo = `${Math.round(agoSeconds / 60)} min ago`;
      }

      lightningHtml = `
        <div>Strikes: <strong>${strikes}</strong></div>
        <div>Closest strike distance: <strong>${dist} km</strong></div>
        <div>Last strike: <strong>${timeAgo}</strong></div>
      `;
    }

    weatherEl.innerHTML = `
      <div>Temperature:<br><strong>${tempF !== null ? fmtNum(tempF) + ' °F' : 'N/A'}</strong></div>
      <div>Feels Like:<br><strong>${feelsF !== null ? fmtNum(feelsF) + ' °F' : 'N/A'}</strong></div>
      <div>Humidity:<br><strong>${obs.relative_humidity ?? 'N/A'}%</strong></div>
      <div>Wind Speed:<br><strong>${windSpeed} mph</strong></div>
      <div>Wind Direction:<br><strong>${windDir}</strong></div>
      <div>Pressure:<br><strong>${pressure} mb</strong></div>
      <div>Rain Rate:<br><strong>${rainRate}</strong></div>
      <div>Rain Today:<br><strong>${rainToday}</strong></div>
      <div style="min-width: 200px;">
        <strong>Lightning:</strong>
        ${lightningHtml}
      </div>
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
