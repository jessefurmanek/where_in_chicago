var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];


var main = function initmap() {
	// set up the map
	var apiKey = 'pk.eyJ1IjoiamVzc2VmdXJtYW5layIsImEiOiJQTkVqSGlNIn0._dhR_OHHz9JVTYxRevLUZQ';
	L.mapbox.accessToken = apiKey;

  map = new L.Map('map');

  // create the tile layer with correct attribution
	var osmUrl= 'https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token='+ apiKey;
	var osmAttrib='<a href="http://www.mapbox.com/about/maps/" target="_blank">Mapbox Terms &amp; Feedback</a>';
	var osm = new L.TileLayer(osmUrl, {minZoom: 10, maxZoom: 15, attribution: osmAttrib});		
	var popup = new L.Popup({ autoPan: false, maxHeight: 200 });

	// start the map in Chicago
	map.setView(new L.LatLng(41.84, -87.65),10);
	map.addLayer(osm);

	var style = function(feature){
		return{
        weight: 2,
        color: 'blue',
        fillColor:'#B3DDF2',
        opacity: 0.7,
        dashArray: '2',
        clickable: 'true',
        fillOpacity: 0.5
  		};
  }

  var styledCurNeighLayer;
  //load the JSON data
	var neighborhoodsJSON = (function() {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "neighborhoods.json",
            'dataType': "json",
            'success': function load(d) {
				        json = L.geoJson(d, {
				        	style: style,
				        	onEachFeature: onEachFeature
				        }).addTo(map);
 								
				    }
        });
        return json;
     })();

	var curLocationMarker = L.mapbox.featureLayer().addTo(map);

	map.locate({setView: true, maxZoom: 12});

	map.on('locationfound', function(e) {
    map.fitBounds(e.bounds);

    curLocationMarker.setGeoJSON({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [e.latlng.lng, e.latlng.lat]
        },
        properties: {
            'title': 'This is you!',
            'marker-color': '#FF0000',
            'marker-symbol-color': '#B3DDF2'
        }
    })

   	var curNeighLayer = leafletPip.pointInLayer([e.latlng.lng, e.latlng.lat], neighborhoodsJSON, true);
   	
   	//set current neighborhood
   	var curNeighborhoodString = curNeighLayer[0].feature.properties["PRI_NEIGH"];
   	
   	styledCurNeighLayer = curNeighLayer[0].setStyle({
			color: '#FF0000',
			dashArray: 'none',
   		weight: 4,
   		fillColor: '#F5F5F5'});

   	map.addLayer(styledCurNeighLayer);

   	var messageToUser = document.getElementById("locationSentence");
   	switch(curNeighborhoodString){
   		case "Loop":
   			messageToUser.innerHTML = "You're in the " + curNeighborhoodString + ".";
   			break;
   		case "Magnificent Mile":
   			messageToUser.innerHTML = "You're at the " + curNeighborhoodString + ".";
   		default:
   			messageToUser.innerHTML = "You're in" + curNeighborhoodString + ".";
   	}
   	return curNeighborhoodString
	});

//mouseover events
function mouseEnter(e) {
  var layer = e.target;
	layer.setStyle({
	    weight: 5,
	    color: '#666',
	    dashArray: '',
	    fillOpacity: 0.7
	});


	popup.setLatLng(e.latlng);
	popup.setContent('<div class="marker-title">' + layer.feature.properties["PRI_NEIGH"] + '</div>');

	if (!popup._map) popup.openOn(map);
	window.clearTimeout(closeTooltip);

  if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
  }
}

var closeTooltip;

function mouseExit(e) {
	var layer = e.target;
	
	closeTooltip = window.setTimeout(function() {
	      map.closePopup();
	  }, 100);

	//only reset the color of the feature if it isn't currently highlighted
	if(typeof layer.defaultOptions === "undefined"){
		neighborhoodsJSON.resetStyle(layer);
	}else if(layer.options.fillColor=="#F5F5F5"){
		layer.setStyle({
			color: '#FF0000',
			dashArray: 'none',
   		weight: 4,
   		fillColor: '#F5F5F5'
		})
	}else{
		neighborhoodsJSON.resetStyle(layer);
	}
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: mouseEnter,
      mouseout: mouseExit
  });
}




}

$(document).ready(main);