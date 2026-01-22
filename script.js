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

// Listen for clicks on the map
map.on('click', function (e) {

    // -------------------------------------------------------
    // IMPORTANT:
    // If the user clicks inside an open popup (e.g. Submit),
    // that click would normally bubble up to the map and
    // trigger this handler again, opening a new popup.
    // This check prevents that.
    // -------------------------------------------------------
    if (e.originalEvent.target.closest('.leaflet-popup')) {
        return; // Ignore clicks coming from the popup
    }

    // HTML content of the popup (a form)
    const formHTML = `
    <form id="ppgis-form" style="width:220px">

        <label><strong>Transport mode</strong></label><br>
        <label><input type="checkbox" name="mode[]" value="foot"> On foot</label><br>
        <label><input type="checkbox" name="mode[]" value="bike"> Bike</label><br>
        <label><input type="checkbox" name="mode[]" value="car"> Car</label><br>
        <label><input type="checkbox" name="mode[]" value="public"> Public transport</label><br><br>

        <label><strong>Time of day</strong></label><br>
        <select id="time" style="width:100%">
            <option value="day">Day</option>
            <option value="night">Night</option>
            <option value="both">Both</option>
        </select><br><br>

        <label><strong>Comment (optional)</strong></label><br>
        <textarea id="comment" rows="3" style="width:100%"></textarea><br><br>

        <button type="submit" style="width:100%">Submit</button>
    </form>
    `;

    // Create and open the popup at the clicked location
    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(formHTML)
        .openOn(map);

    // -------------------------------------------------------
    // Wait until the popup is actually added to the DOM
    // (this guarantees that getElementById will work)
    // -------------------------------------------------------
    popup.once('add', function () {

        // Get the form element inside the popup
        const form = document.getElementById('ppgis-form');
        if (!form) return;

        // ---------------------------------------------------
        // Prevent clicks inside the popup from reaching
        // the map (critical to stop popup reopening)
        // ---------------------------------------------------
        L.DomEvent.disableClickPropagation(popup.getElement());
        L.DomEvent.disableScrollPropagation(popup.getElement());

        // Handle form submission
        form.addEventListener('submit', function (ev) {
            ev.preventDefault(); // Stop normal form submission (page reload)

            // Collect all checked transport mode checkboxes
            const modes = Array.from(
                form.querySelectorAll('input[name="mode[]"]:checked')
            ).map(cb => cb.value);

            // Require at least one transport mode
            if (modes.length === 0) {
                alert('Please select at least one transport mode.');
                return;
            }

            // Build the report object
            const report = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                mode: modes,               // array of selected modes
                time: form.querySelector('#time').value,
                comment: form.querySelector('#comment').value,
                timestamp: new Date().toISOString()
            };

            // Store the report locally
            reports.push(report);
            localStorage.setItem('ppgisReports', JSON.stringify(reports));

            // Add a marker for the report
            addReportMarker(report);

            // ------------------------------------------------
            // Close the popup.
            // Because map-click bubbling is disabled,
            // the popup will NOT reopen.
            // ------------------------------------------------
            map.closePopup();
        });
    });
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
