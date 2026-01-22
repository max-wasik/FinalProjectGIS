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
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [28, 28]
    }),
    bike: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
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

// First selected mode defines the icon
function getIconForModes(modes) {
    return icons[modes[0]] || icons.foot;
}

// ------------------------------------------------------
// DATA STORAGE (LOCAL ONLY)
// ------------------------------------------------------

let reports = JSON.parse(localStorage.getItem('ppgisReports')) || [];
const reportMarkers = [];

// ------------------------------------------------------
// LOAD EXISTING REPORTS
// ------------------------------------------------------

reports.forEach(report => addReportMarker(report));

// ------------------------------------------------------
// MAP CLICK → DATA COLLECTION
// ------------------------------------------------------

map.on('click', function (e) {

    // Prevent popup click bubbling
    if (e.originalEvent.target.closest('.leaflet-popup')) return;

    const formHTML = `
    <div id="ppgis-form" style="width:220px">

        <label><strong>Transport mode</strong></label><br>
        <label><input type="checkbox" name="mode" value="foot"> On foot</label><br>
        <label><input type="checkbox" name="mode" value="bike"> Bike</label><br>
        <label><input type="checkbox" name="mode" value="car"> Car</label><br>
        <label><input type="checkbox" name="mode" value="public"> Public transport</label><br><br>

        <label><strong>Time of day</strong></label><br>
        <select id="time" style="width:100%">
            <option value="day">Day</option>
            <option value="night">Night</option>
            <option value="both">Both</option>
        </select><br><br>

        <label><strong>Comment (optional)</strong></label><br>
        <textarea id="comment" rows="3" style="width:100%"></textarea><br><br>

        <button id="submitReport" type="button" style="width:100%">
            Submit
        </button>
    </div>
`;


    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(formHTML)
        .openOn(map);

    popup.once('add', function () {

        const form = document.getElementById('ppgis-form');
        if (!form) return;

        // Stop event propagation inside popup
        L.DomEvent.disableClickPropagation(popup.getElement());
        L.DomEvent.disableScrollPropagation(popup.getElement());

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();

            const modes = Array.from(
                form.querySelectorAll('input[name="mode[]"]:checked')
            ).map(cb => cb.value);

            if (modes.length === 0) {
                alert('Please select at least one transport mode.');
                return;
            }

            const report = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                mode: modes,
                time: form.querySelector('#time').value,
                comment: form.querySelector('#comment').value,
                timestamp: new Date().toISOString()
            };

            reports.push(report);
            localStorage.setItem('ppgisReports', JSON.stringify(reports));

            addReportMarker(report);
            map.closePopup();
        });
    });
});

// ------------------------------------------------------
// ADD MARKER TO MAP
// ------------------------------------------------------

function addReportMarker(report) {

    const marker = L.marker([report.lat, report.lng], {
        icon: getIconForModes(report.mode)
    }).addTo(map);

    marker.bindPopup(`
        <strong>Transport:</strong> ${report.mode.join(', ')}<br>
        <strong>Time:</strong> ${report.time}<br>
        ${report.comment ? `<strong>Comment:</strong> ${report.comment}<br>` : ''}
        <small>${new Date(report.timestamp).toLocaleString()}</small>
    `);

    reportMarkers.push(marker);
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
// OPTIONAL: CLEAR ALL DATA (FOR TESTING)
// ------------------------------------------------------
// localStorage.removeItem('ppgisReports');
