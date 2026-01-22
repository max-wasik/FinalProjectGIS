function downloadGeoJSON() {

    const age = document.getElementById('ageInput').value;
    const gender = document.getElementById('genderInput').value;

    if (!age || !gender) {
        alert("Please enter age and gender.");
        return;
    }

    if (reports.length === 0) {
        alert("No markers to download.");
        return;
    }

    const geojson = {
        type: "FeatureCollection",
        features: reports.map(report => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [report.lng, report.lat]
            },
            properties: {
                transport_modes: report.mode,
                time: report.time,
                comment: report.comment,
                age: age,
                gender: gender,
                timestamp: report.timestamp
            }
        }))
    };

    saveToFile(geojson, `ppgis_graz_${Date.now()}.geojson`);
}
