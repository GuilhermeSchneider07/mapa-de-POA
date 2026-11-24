
const map = L.map("map").setView(
    [-30.0346, -51.2177],
    12
);

// Mapa-base
const baseMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);


// Estilo dos bairros
function neighborhoodStyle() {
    return {
        color: "#245b85",
        weight: 1,
        fillColor: "#5b9bd5",
        fillOpacity: 0.08
    };
}


// Obter nome do bairro
function getNeighborhoodName(properties) {

    const field = Object.keys(properties).find(
        key => key.toLowerCase() === "bairro"
    );

    return field
        ? properties[field]
        : "Bairro sem identificação";
}


// Carregar camada de bairros
async function loadNeighborhoods() {

    const response = await fetch("data/bairros.geojson");

    if (!response.ok) {
        throw new Error("Não foi possível carregar os bairros.");
    }

    const data = await response.json();

    return L.geoJSON(data, {

        style: neighborhoodStyle,

        onEachFeature: function(feature, layer) {

            const name = getNeighborhoodName(
                feature.properties
            );

            layer.bindPopup(name);

            layer.on("mouseover", function() {
                layer.setStyle({
                    weight: 3,
                    fillOpacity: 0.30
                });

                layer.bringToFront();
            });

            layer.on("mouseout", function() {
                layer.setStyle(neighborhoodStyle());
            });
        }
    });
}


// Carregar camada de logradouros
async function loadStreets() {

    const response = await fetch("data/logradouros.geojson");

    if (!response.ok) {
        throw new Error("Não foi possível carregar os logradouros.");
    }

    const data = await response.json();

    return L.geoJSON(data, {

        style: {
            color: "#d97706",
            weight: 1,
            opacity: 0.65
        }
    });
}

async function loadPoints() {
    const response = await fetch("data/pontos.geojson");

    if (!response.ok) {
        throw new Error("Não foi possível carregar os pontos.");
    }

    const data = await response.json();

    return L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 7,
                color: "#d10f0f",
                weight: 2,
                fillColor: "#d97706",
                fillOpacity: 1
            });
        },

        onEachFeature: function(feature, layer) {
            const properties = feature.properties;

            layer.bindPopup(`
                <strong>${properties.nome}</strong>
                <br>
                <small>${properties.categoria}</small>
                <br>
                ${properties.descricao}
            `);
        }
    });
}

// Inicialização

async function initializeMap() {
    try {
        const neighborhoods = await loadNeighborhoods();
        neighborhoods.addTo(map);

        const streets = await loadStreets();

        // Carrega os pontos de referência
        const points = loadPoints();
        points.addTo(map);
        points.bringToFront();
        // Organiza as camadas disponíveis
        const overlays = {
            "Bairros": neighborhoods,
            "Eixos de logradouros": streets,
            "Pontos de referência": points
        };

        L.control.layers(
            { "OpenStreetMap": baseMap },
            overlays,
            { collapsed: false }
        ).addTo(map);

        map.fitBounds(neighborhoods.getBounds());

    } catch (error) {
        console.error("Erro ao inicializar o mapa:", error);
        alert("Não foi possível carregar os dados geográficos.");
    }
}

initializeMap();
