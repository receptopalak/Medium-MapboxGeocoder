const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Gerçek Hayattan İlham Almış Örnek Veri: Şehir İstasyonları
const stations = [
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-74.006, 40.7128], // New York City, Times Square
    },
    properties: {
      id: 1,
      description: "Times Square'te bulunan ana istasyon.",
    },
    place_name: "Times Square Station",
    text: "Midtown/Manhattan",
    center: [-74.006, 40.7128],
    place_type: ["station"],
    resultType: "Section",
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-118.2437, 34.0522], // Los Angeles, Downtown
    },
    properties: {
      id: 2,
      description: "Downtown Los Angeles'ta merkezi istasyon.",
    },
    place_name: "Downtown LA Station",
    text: "Central/Downtown",
    center: [-118.2437, 34.0522],
    place_type: ["station"],
    resultType: "Section",
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [-0.1276, 51.5074], // London, Westminster
    },
    properties: {
      id: 3,
      description: "Westminster bölgesindeki ana istasyon.",
    },
    place_name: "Westminster Station",
    text: "Westminster/Central",
    center: [-0.1276, 51.5074],
    place_type: ["station"],
    resultType: "Section",
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [2.3522, 48.8566], // Paris, Louvre
    },
    properties: {
      id: 4,
      description: "Louvre Müzesi yakınındaki istasyon.",
    },
    place_name: "Louvre Station",
    text: "1st Arrondissement",
    center: [2.3522, 48.8566],
    place_type: ["station"],
    resultType: "Section",
  },
  {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [139.6917, 35.6895], // Tokyo, Shinjuku
    },
    properties: {
      id: 5,
      description: "Shinjuku bölgesindeki yoğun istasyon.",
    },
    place_name: "Shinjuku Station",
    text: "Shinjuku/West",
    center: [139.6917, 35.6895],
    place_type: ["station"],
    resultType: "Section",
  },
  // Daha fazla örnek veri ekleyebilirsiniz
];

// Endpoint: /api/mapSearch
app.post("/api/mapSearch", (req, res) => {
  const { search_text } = req.body;

  if (!search_text) {
    return res.status(400).json({ error: "search_text parametresi gerekli." });
  }

  // Arama kriterlerine göre filtreleme
  const filteredStations = stations.filter((station) => {
    const nameMatch = station.place_name
      .toLowerCase()
      .includes(search_text.toLowerCase());
    const districtMatch = station.text
      .toLowerCase()
      .includes(search_text.toLowerCase());
    return nameMatch || districtMatch;
  });

  // GeoJSON formatında yanıt
  const response = {
    type: "FeatureCollection",
    features: filteredStations,
  };

  res.json(response);
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
  console.log(`Geocoder servisi ${PORT} portunda çalışıyor.`);
});
