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
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/743/743922.png',
        iconSize: [28, 28]
    }),
    public: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61213.png',
        iconSize: [28, 28]
    })
};

// ------------------------------------------------------
// DATA STORAGE (LOCAL)
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

    const formHTML = `
        <form id="ppgis-form" style="width:220px">
            <label><strong>Transport mode</strong></label><br>
            <select id="mode" required style="width:100%">
                <option value="foot">On foot</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="public">Public transport</option>
            </select><br><br>

            <label><strong>Time of day</strong></label><br>
            <select id="time" required style="width:100%">
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="both">Both</option>
            </select><br><br>

            <label><strong>Comment (optional)</strong></label><br>
            <textarea id="comment" rows="3" style="width:100%"></textarea><br><br>

            <button type="submit" style="width:100%">Submit</button>
        </form>
    `;

    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(formHTML)
        .openOn(map);

    // Wait for popup DOM
    setTimeout(() => {
        const form = document.getElementById('ppgis-form');
        if (!form) return;

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();

            const report = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                mode: document.getElementById('mode').value,
                time: document.getElementById('time').value,
                comment: document.getElementById('comment').value,
                timestamp: new Date().toISOString()
            };

            reports.push(report);
            localStorage.setItem('ppgisReports', JSON.stringify(reports));

            addReportMarker(report);
            map.closePopup();
        });
    }, 100);
});

// ------------------------------------------------------
// ADD MARKER TO MAP
// ------------------------------------------------------

function addReportMarker(report) {

    const marker = L.marker([report.lat, report.lng], {
        icon: icons[report.mode] || icons.foot
    }).addTo(map);

    marker.bindPopup(`
        <strong>Transport:</strong> ${report.mode}<br>
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
// BACK TO TOP BUTTON
// ------------------------------------------------------

const backToTopBtn = document.querySelector('.back-to-top');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
