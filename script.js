// ======================================================
// PPGIS SAFETY MAP – GRAZ
// ======================================================

// ------------------------------------------------------
// MAP SETUP
// ------------------------------------------------------

const mapCenter = [47.0707, 15.4395];
const mapZoom = 13;

const map = L.map('map', {
    center: mapCenter,
    zoom: mapZoom,
    scrollWheelZoom: window.innerWidth > 900
});

// Basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Scale bar
L.control.scale().addTo(map);

// ------------------------------------------------------
// ICONS BY TRANSPORT MODE
// ------------------------------------------------------

const icons = {
    foot: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25613.png',
        iconSize: [28, 28]
    }),
    bike: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/8/8071.png',
        iconSize: [28, 28]
    }),
    car: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/75/75782.png',
        iconSize: [28, 28]
    }),
    public: L.icon({
        iconUrl: 'https://static.thenounproject.com/png/1661272-200.png',
        iconSize: [28, 28]
    })
};

function getIconForModes(modes) {
    return icons[modes[0]] || icons.foot;
}

// ------------------------------------------------------
// DATA STORAGE (LOCAL ONLY)
// ------------------------------------------------------

let reports = JSON.parse(localStorage.getItem('ppgisReports')) || [];

// ------------------------------------------------------
// LOAD EXISTING REPORTS
// ------------------------------------------------------

reports.forEach(report => addReportMarker(report));

// ------------------------------------------------------
// MAP CLICK → DATA COLLECTION via POPUP
// ------------------------------------------------------

map.on('click', function (e) {

const popupHTML = `
<div class="popup-card">

  <div class="popup-title">
    <h3>Feeling unsafe?</h3>
    <p>Choose your transport mode + time</p>
  </div>

  <div class="popup-section">
    <div class="popup-label">Transport mode</div>
    <label class="checkbox">
      <input class="mode-checkbox" type="checkbox" value="foot">
      <span class="checkmark"></span>
      On foot
    </label>
    <label class="checkbox">
      <input class="mode-checkbox" type="checkbox" value="bike">
      <span class="checkmark"></span>
      Bike
    </label>
    <label class="checkbox">
      <input class="mode-checkbox" type="checkbox" value="car">
      <span class="checkmark"></span>
      Car
    </label>
    <label class="checkbox">
      <input class="mode-checkbox" type="checkbox" value="public">
      <span class="checkmark"></span>
      Public transport
    </label>
  </div>

  <div class="popup-section">
    <div class="popup-label">Time of day</div>
    <select class="time-select">
      <option value="day">Day</option>
      <option value="night">Night</option>
      <option value="both">Both</option>
    </select>
  </div>

  <div class="popup-section">
    <div class="popup-label">Comment (optional)</div>
    <textarea class="comment-text" rows="3"></textarea>
  </div>

  <button class="submitReportBtn">Submit</button>

</div>
`;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupHTML)
        .openOn(map);
});


// ------------------------------------------------------
// POPUP OPEN EVENT (reliable) ((bug fixing attempts))
// ------------------------------------------------------

map.on('popupopen', function (ev) {

    const container = ev.popup.getElement();
    const submitBtn = container.querySelector('.submitReportBtn');

    // check
    if (!submitBtn) {
        console.error("Submit button not found!");
        return;
    }

    // stop map click propagation
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    submitBtn.addEventListener('click', function () {

        const modes = Array.from(
            container.querySelectorAll('.mode-checkbox:checked')
        ).map(cb => cb.value);

        if (modes.length === 0) {
            alert("Please select at least one transport mode.");
            return;
        }

        const report = {
            lat: ev.popup.getLatLng().lat,
            lng: ev.popup.getLatLng().lng,
            mode: modes,
            time: container.querySelector('.time-select').value,
            comment: container.querySelector('.comment-text').value,
            timestamp: new Date().toISOString()
        };

        reports.push(report);
        localStorage.setItem('ppgisReports', JSON.stringify(reports));

        addReportMarker(report);
        map.closePopup();
    });
});


// ------------------------------------------------------
// ADD MARKER TO MAP
// ------------------------------------------------------

function addReportMarker(report) {

    const modes = Array.isArray(report.mode) ? report.mode : [report.mode];

    const marker = L.marker([report.lat, report.lng], {
        icon: getIconForModes(modes)
    }).addTo(map);

    marker.bindPopup(`
        <strong>Transport:</strong> ${modes.join(', ')}<br>
        <strong>Time:</strong> ${report.time}<br>
        ${report.comment ? `<strong>Comment:</strong> ${report.comment}<br>` : ''}
        <small>${new Date(report.timestamp).toLocaleString()}</small>
    `);
}


// ------------------------------------------------------
// RESET VIEW BUTTON
// ------------------------------------------------------

const ResetControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function () {
        const btn = L.DomUtil.create('button', 'reset-view-btn');
        btn.innerText = 'Reset View';
        L.DomEvent.disableClickPropagation(btn);
        btn.onclick = () => map.setView(mapCenter, mapZoom);
        return btn;
    }
});
map.addControl(new ResetControl());

// ------------------------------------------------------
// RESET DATA BUTTON Function
// ------------------------------------------------------   


function resetData() {
    const confirmReset = confirm("⚠️ DELETE ALL MARKERS AND DATA? ");

    if (confirmReset) {
        localStorage.removeItem('ppgisReports');
        location.reload();
    }
}
