// ======================================================
// PPGIS SAFETY MAP – GRAZ
// ======================================================

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

L.control.scale().addTo(map);

// ------------------------------------------------------
// ICONS
// ------------------------------------------------------

const icons = {
    foot: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [28, 28] }),
    bike: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', iconSize: [28, 28] }),
    car: L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/75/75782.png', iconSize: [28, 28] }),
    public: L.icon({ iconUrl: 'https://static.thenounproject.com/png/1661272-200.png', iconSize: [28, 28] })
};

function getIconForModes(modes) {
    return icons[modes[0]] || icons.foot;
}

// ------------------------------------------------------
// DATA
// ------------------------------------------------------

let reports = JSON.parse(localStorage.getItem('ppgisReports')) || [];

// Load stored markers
reports.forEach(r => addReportMarker(r));

// ------------------------------------------------------
// MAP CLICK
// ------------------------------------------------------

map.on('click', function (e) {

    const popupHTML = `
        <div id="ppgis-form" style="width:220px">

            <strong>Transport mode</strong><br>
            <label><input type="checkbox" value="foot"> On foot</label><br>
            <label><input type="checkbox" value="bike"> Bike</label><br>
            <label><input type="checkbox" value="car"> Car</label><br>
            <label><input type="checkbox" value="public"> Public transport</label><br><br>

            <strong>Time of day</strong><br>
            <select id="time" style="width:100%">
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="both">Both</option>
            </select><br><br>

            <strong>Comment (optional)</strong><br>
            <textarea id="comment" rows="3" style="width:100%"></textarea><br><br>

            <button id="submitReport" type="button" style="width:100%">Submit</button>
        </div>
    `;

    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(popupHTML)
        .openOn(map);

    popup.once('add', function () {

        const container = popup.getElement();
        const submitBtn = container.querySelector('#submitReport');

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        submitBtn.addEventListener('click', function () {

            const modes = Array.from(
                container.querySelectorAll('input[type="checkbox"]:checked')
            ).map(cb => cb.value);

            if (modes.length === 0) {
                alert("Please select at least one transport mode.");
                return;
            }

            const report = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                mode: modes,
                time: container.querySelector('#time').value,
                comment: container.querySelector('#comment').value,
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
// ADD MARKER
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
