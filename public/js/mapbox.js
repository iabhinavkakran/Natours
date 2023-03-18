const mapBox = document.getElementById('map');

const displayMap = (locations)=> {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaWFiaGluYXZrYWtyYW4iLCJhIjoiY2xmOXYwbjhyMHM1ZzN0bzJobTU3MjNxaiJ9.mbGu91b92dH_xVmM688Ncw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/iabhinavkakran/clf9vwfhl00cq01mrg9cds47m',
  scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Create Marker
  const el = document.createElement('div');
  el.className = 'marker';
  
  // Add a marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  }).setLngLat(loc.coordinates).addTo(map);

  // add a Popup
  new mapboxgl.Popup({offset: 10}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`).addTo(map)

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);

});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100
  }
})
}

if(mapBox){
  const locations =JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

