<template>
  <div id="map" ref="mapContainer" :style="{ opacity: loading ? 0.5 : 1 }">
    <!-- Sidebar -->
    <div id="sidebar" class="sidebar" :class="{ open: isSidebarOpen }">
      <button @click="toggleSidebar">X</button>
      <div v-if="currentFeature">
        <h2>{{ currentFeature.place_name }}</h2>
        <p>{{ currentFeature.text }}</p>
        <p>{{ currentFeature.properties.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";

import axios from "axios";

const mapContainer = ref(null);
const loading = ref(true);
const isSidebarOpen = ref(false);
const currentFeature = ref(null);

// Harici Geocoder Fonksiyonu
const externalGeocoderFunction = async (query) => {
  const requestParam = {
    search_text: query,
  };

  try {
    const res = await axios.post(
      "http://localhost:3000/api/mapSearch",
      requestParam
    );
    if (!res.data.features) return [];

    return res.data.features.map((feature) => ({
      ...feature,
      // Servis zaten gerekli alanları içeriyor
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Yerel Geocoder Fonksiyonu
const coordinatesGeocoder = function (query) {
  const matches = query.match(
    /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[,\s]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
  );

  if (!matches) {
    return null;
  }

  function coordinateFeature(lng, lat) {
    return {
      center: [lng, lat],
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      place_name: `Lat: ${lat}, Lng: ${lng}`,
      place_type: ["coordinate"],
      properties: {},
      type: "Feature",
    };
  }

  const coord1 = Number(matches[2]);
  const coord2 = Number(matches[1]);
  const geocodes = [];

  if (coord1 < -90 || coord1 > 90) {
    geocodes.push(coordinateFeature(coord1, coord2));
  }

  if (coord2 < -90 || coord2 > 90) {
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  if (geocodes.length === 0) {
    geocodes.push(coordinateFeature(coord1, coord2));
    geocodes.push(coordinateFeature(coord2, coord1));
  }

  return geocodes;
};

// Sidebar'ı Aç/Kapat Fonksiyonu
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

onMounted(() => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoidHJ1Z28iLCJhIjoiY2xpazlpdzJ3MDI0ZTNlcGtqYWkybmdlbiJ9.2AxIWuu_NYQpSS9uiB7gzA";
  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/streets-v11",
    center: [35.022, 39.686],
    zoom: 4.2,
  });

  // Geocoding Bileşenini Oluşturma
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: true,
    placeholder: "Konum Bul",
    reverseGeocode: true,
    localGeocoder: coordinatesGeocoder,
    externalGeocoder: externalGeocoderFunction,
  });

  // Geocoding Bileşenini Haritaya Ekleme
  map.addControl(geocoder, "top-left");

  // Arama Sonucu Seçildiğinde İşlem Yapma
  geocoder.on("result", (e) => {
    currentFeature.value = e.result;
    isSidebarOpen.value = true;
  });

  map.on("load", () => {
    loading.value = false;
  });

  // Harita Üzerinde Bir Noktaya Tıklanınca Popup Açma
  map.on("click", "stations", (e) => {
    if (e.features.length > 0) {
      const feature = e.features[0];
      currentFeature.value = feature;
      isSidebarOpen.value = true;
    }
  });

  // Kaydırma ve Diğer Etkileşimler
  map.on("mouseenter", "stations", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "stations", () => {
    map.getCanvas().style.cursor = "";
  });
});
</script>

<style scoped>
#map {
  min-height: 98vh;
  width: 100%;
  border-radius: 1em;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  margin-bottom: 1em;
}

/* Sidebar Stilleri */
.sidebar {
  position: absolute;
  top: 50px;
  right: 10px;
  width: 300px;
  max-width: 80%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 10;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar button {
  background: none;
  border: none;
  font-size: 1.2em;
  float: right;
  cursor: pointer;
}

.sidebar h2 {
  margin-top: 0;
}
</style>
