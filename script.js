// ------------------------------------------------------
// Leaflet map setup
// ------------------------------------------------------

const mapCenter = [47.0707, 15.4395];
const mapZoom = 13;
const map = L.map('map', { center: mapCenter, zoom: mapZoom, scrollWheelZoom: true });

// Basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Scale bar
L.control.scale().addTo(map);

// Green marker icon
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Attractions
const attractions = [
    { name: "Schloßberg", coords: [47.07670, 15.43719], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/grazer-schlossberg_shg_1480" },
    { name: "Old Town of Graz", coords: [47.0707, 15.4395], link: "https://www.graztourismus.at/de/erholung-freizeit-sport/spazieren-wandern/tour-uebersicht/altstadtrunde-durchs-weltkulturerbe-graz_td_520" },
    { name: "Eggenberg Palace", coords: [47.07376, 15.39473], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/schloss-eggenberg-graz_shg_1478"},
    { name: "Styrian Armoury", coords: [47.07027, 15.43979], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/landeszeughaus_shg_1464" },
    { name: "Clock Tower", coords: [47.07388, 15.43763], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/uhrturm_shg_1488" },
    { name: "Kunsthaus Graz", coords: [47.07124, 15.43409], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/kunsthaus-graz_shg_1462" },
    { name: "Kaiser-Josef Market", coords: [47.06899, 15.44694], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/kaiser-josef-markt-in-graz_shg_1458" },
    { name: "Hauptplatz", coords: [47.07094, 15.43830], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/hauptplatz-rathaus_shg_1456" },
    { name: "Double Spiral Staircase", coords: [47.07297, 15.44286], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/grazer-burg-doppelwendeltreppe_shg_1444" },
    { name: "Kastner & Öhler - Paradeishof", coords: [47.07221, 15.43696], link: "https://www.graztourismus.at/de/sightseeing-kultur/sehenswuerdigkeiten/kastner-Oehler-graz_shg_7520" }
];

// Keep references to markers
const markers = [];
const chapters = document.querySelectorAll(".chapter");

attractions.forEach((a, index) => {
    const marker = L.marker(a.coords, { icon: greenIcon }).addTo(map);
    marker.bindPopup(`<b>${a.name}</b><br>${a.link ? `<a href="${a.link}" target="_blank">link</a>` : ""}`);
    markers.push(marker);

    // Clicking marker scrolls to chapter
    marker.on('click', () => {
        const chapterElement = chapters[index];
        chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

        chapters.forEach(c => c.classList.remove("active"));
        chapterElement.classList.add("active");

        const lat = chapterElement.getAttribute("data-lat");
        const lng = chapterElement.getAttribute("data-lng");
        const zoom = chapterElement.getAttribute("data-zoom");
        map.flyTo([lat, lng], zoom);

        marker.openPopup();
    });
});

// ------------------------------------------------------
// Scroll-driven map movement
// ------------------------------------------------------
function setActiveChapter(chapter) {
    chapters.forEach(c => c.classList.remove("active"));
    chapter.classList.add("active");

    const lat = chapter.getAttribute("data-lat");
    const lng = chapter.getAttribute("data-lng");
    const zoom = chapter.getAttribute("data-zoom");

    map.flyTo([lat, lng], zoom);

    // Open popup for corresponding marker
    const index = Array.from(chapters).indexOf(chapter);
    if (markers[index]) markers[index].openPopup();
}

// Catch range for smoothe scrolling
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight;
    const triggerTop = vh * 0.25;
    const triggerBottom = vh * 0.75;
    return rect.top < triggerBottom && rect.bottom > triggerTop;
}

document.getElementById("story").addEventListener("scroll", () => {
    chapters.forEach(chapter => {
        if (isElementInViewport(chapter)) {
            setActiveChapter(chapter);
        }
    });
});

// Initialize first chapter as active
setActiveChapter(chapters[0]);

// ------------------------------------------------------
// Reset View button on map
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
// Back to Top Button
// ------------------------------------------------------

const backToTopBtn = document.querySelector('.back-to-top');

// Smooth scroll to top
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});