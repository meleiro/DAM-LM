const API_KEY = "94dafad45847739bc8888197ae872718";
const btn = document.getElementById("btn");
const result = document.getElementById("result");
const status = document.getElementById("status");

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&mode=xml&units=metric&lang=es`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error HTTP: " + response.status);
  }

  const xmlText = await response.text();
  const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");

  const cityNode = xmlDoc.getElementsByTagName("city")[0];
  const tempNode = xmlDoc.getElementsByTagName("temperature")[0];
  const humidityNode = xmlDoc.getElementsByTagName("humidity")[0];
  const weatherNode = xmlDoc.getElementsByTagName("weather")[0];
  const windNode = xmlDoc.getElementsByTagName("speed")[0];

  return {
    city: cityNode.getAttribute("name"),
    country: cityNode.getElementsByTagName("country")[0].textContent,
    temp: tempNode.getAttribute("value"),
    humidity: humidityNode.getAttribute("value"),
    description: weatherNode.getAttribute("value"),
    wind: windNode.getAttribute("value")
  };
}

btn.addEventListener("click", async () => {
  const city = document.getElementById("city").value.trim();

  if (!city) {
    status.textContent = "Escribe una ciudad.";
    return;
  }

  status.textContent = "Consultando clima en XML...";
  result.innerHTML = "";

  try {
    const data = await getWeather(city);

    result.innerHTML = `
      <h3>${data.city}, ${data.country}</h3>
      <p><strong>Temperatura:</strong> ${data.temp} °C</p>
      <p><strong>Clima:</strong> ${data.description}</p>
      <p><strong>Humedad:</strong> ${data.humidity} %</p>
      <p><strong>Viento:</strong> ${data.wind} m/s</p>
    `;

    status.textContent = "Consulta exitosa ✔";
  } catch (error) {
    status.textContent = "Error: " + error.message;
  }
});