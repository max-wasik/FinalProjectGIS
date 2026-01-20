let drawnItems = L.featureGroup().addTo(map); 

function saveToFile(content, fileName) {
    // Create a "Blob" (A file-like object of immutable raw data)
    let blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });

    // Create a temporary URL pointing to that Blob in memory
    let url = URL.createObjectURL(blob);

    // Create a "download" link
    let link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    // Remove the element and revoke the URL to free up memory
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadData(){
    // Convert the Leaflet Layer Group to GeoJSON
    let data = drawnItems.toGeoJSON();
    
    // Check if there is data
    if (data.features.length === 0) {
        alert("No points to download!");
        return;
    }
    
    // Add the Socio-Demographics (ex. Gender) to the properties
    let userGender = document.querySelector('#genderInput').value;
    // check sociodemographic values
    if(userGender === "") {
        alert("No Gender value!");
        return;
    }
    
    // Add the gender to the GeoJSON items
    data.features.forEach(function(feature) {
        feature.properties.gender = userGender;
    });
    let dataStr = JSON.stringify(data);

    // Give a name to the file
    let fileName = 'participant_data_' + new Date().getTime() + '.geojson';

    saveToFile(data, fileName);
    alert("Data downloaded successfully!");

    // Clear the map & form with delay
    setTimeout(() => {
        drawnItems.clearLayers();
        document.querySelector('#genderInput').value = "";
    }, 100);
}
