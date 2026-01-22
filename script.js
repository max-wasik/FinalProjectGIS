// ------------------------------------------------------
// MAP CLICK → DATA COLLECTION
// ------------------------------------------------------

map.on('click', function (e) {

    const popupHTML = `
        <div id="ppgis-form" style="width:220px">

            <strong>Transport mode</strong><br>
            <label><input class="mode-checkbox" type="checkbox" value="foot"> On foot</label><br>
            <label><input class="mode-checkbox" type="checkbox" value="bike"> Bike</label><br>
            <label><input class="mode-checkbox" type="checkbox" value="car"> Car</label><br>
            <label><input class="mode-checkbox" type="checkbox" value="public"> Public transport</label><br><br>

            <strong>Time of day</strong><br>
            <select class="time-select" style="width:100%">
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="both">Both</option>
            </select><br><br>

            <strong>Comment (optional)</strong><br>
            <textarea class="comment-text" rows="3" style="width:100%"></textarea><br><br>

            <button class="submitReportBtn" type="button" style="width:100%">Submit</button>
        </div>
    `;

    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupHTML)
        .openOn(map);
});


// ------------------------------------------------------
// POPUP OPEN EVENT (reliable)
// ------------------------------------------------------

map.on('popupopen', function (ev) {

    const container = ev.popup.getElement();
    const submitBtn = container.querySelector('.submitReportBtn');

    // safety check
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
