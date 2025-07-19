async function loadData() {
  const weatherEl = document.getElementById('weather');
  const updatedEl = document.getElementById('updated');

  try {
    const resp = await fetch('data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.obs || !data.obs.length) throw new Error('No obs');

    const obs = data.obs[0];
    const fmt = (v, d=1)=> (v!=null? v.toFixed(d): 'N/A');
    const cToF = c=> c!=null? c*9/5+32 : null;
    const tempF = cToF(obs.air_temperature), feelsF = cToF(obs.feels_like ?? obs.air_temperature);
    const windSpeed = obs.wind_speed != null ? fmt(obs.wind_speed) : '0';
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const windDir = obs.wind_direction!=null? dirs[Math.floor(((obs.wind_direction+11.25)%360)/22.5)] : 'N/A';
    const pressure = obs.station_pressure!=null? fmt(obs.station_pressure,2): 'N/A';

    const rateIn = obs.precip_rate!=null? obs.precip_rate*0.0393701 : null;
    const totalIn = obs.precip_accum_local_day!=null? obs.precip_accum_local_day*0.0393701 : null;
    const rainDesc = (rateIn==null||rateIn===0)?'None':
                     rateIn<=0.1?'Light':
                     rateIn<=0.3?'Moderate':'Heavy';
    const rainTotal = totalIn!=null? `${fmt(totalIn)} in` : 'N/A';

    const lightning = data.strike_stats || {};
    const strikes = lightning.strikes||0;
    const dist = lightning.closest_strike_distance||'N/A';
    const ago = lightning.closest_strike_age;
    const timeAgo = (ago==null)? 'N/A' :
                     ago<60? `${ago} sec ago` : `${Math.round(ago/60)} min ago`;
    const lightningHtml = `<div>Strikes: <strong>${strikes}</strong></div>
                           <div>Closest: <strong>${dist} km</strong></div>
                           <div>Last: <strong>${timeAgo}</strong></div>`;

    const skyCond = obs.weather ?? 'N/A';

    weatherEl.innerHTML = `
      <div>🌡 Temp:<br><strong>${tempF!=null?fmt(tempF)+' °F':'N/A'}</strong></div>
      <div>🤒 Feels Like:<br><strong>${feelsF!=null?fmt(feelsF)+' °F':'N/A'}</strong></div>
      <div>💧 Humidity:<br><strong>${obs.relative_humidity??'N/A'}%</strong></div>
      <div>🌬 Wind Speed:<br><strong>${windSpeed} mph</strong></div>
      <div>🧭 Wind Dir:<br><strong>${windDir}</strong></div>
      <div>🔻 Pressure:<br><strong>${pressure} mb</strong></div>
      <div>🌧 Rain Intensity:<br><strong>${rainDesc}</strong></div>
      <div>🪣 Rain Today:<br><strong>${rainTotal}</strong></div>
      <div>☁ Sky Conditions:<br><strong>${skyCond}</strong></div>
      <div style="min-width:200px"><strong>⚡ Lightning:</strong>${lightningHtml}</div>
    `;

    if (obs.timestamp) {
      updatedEl.textContent = `Last updated: ${new Date(obs.timestamp *1000).toLocaleString()}`;
    } else updatedEl.textContent = 'Last updated: N/A';

  } catch (err) {
    console.error(err);
    weatherEl.textContent = 'Error loading data';
    updatedEl.textContent = '';
  }
}

function fetchSky() {
  fetch('https://corsproxy.io/?https://forecast.weather.gov/data/obhistory/KFRG.html')
    .then(r=>r.text()).then(htmlText=>{
      const div = document.createElement('div');
      div.innerHTML = htmlText;
      const td = Array.from(div.querySelectorAll('td'))
        .find(el=>el.textContent.trim() === 'Weather')?.nextElementSibling;
      const sky = td? td.textContent.trim():'N/A';
      document.getElementById('sky-from-nws').textContent = sky;
    })
    .catch(err=>{
      console.error('Sky fetch error', err);
      document.getElementById('sky-from-nws').textContent = 'N/A';
    });
}

loadData();
fetchSky();
setInterval(loadData, 5*60*1000);
setInterval(fetchSky, 10*60*1000);
