import axios from 'axios';
import {$} from './bling';
import dompurify from 'dompurify';

// map options for loadding map
// center of map and zoom level
const mapOptions ={
    center:{lat:43.26,lng:-79.86},
    zoom:10
};

function loadPlaces(map,lat=43.26,lng=-79.86){
    axios
        .get(`/api/stores/near?lat=${lat}&lng=${lng}&limit=10`)
        .then(res=>{
            const places=res.data;
            // if no data returned from api
            if(!places.length){
                alert('oops no data found,please try another place');
                return;
            }
            // create bounds to ensure zoom level is appropriate
            const bounds = new google.maps.LatLngBounds();

            // create an info window to show store details 
            const infoWindow = new google.maps.InfoWindow();

            // make the red pin markers on the map
            const markers = places.map(place=>{
                // destruct the coordinates array 
                const [placeLng,placeLat] = place.location.coordinates;
                // position object for google map
                const position ={lat:placeLat,lng:placeLng};
                // extend the bound to current lat lng so that the place is always inside the map
                // rectangle around the places
                bounds.extend(position);
                // create the final marker
                // it takes an object with map(where to put ie mapDiv) and position(where on map) values
                const marker = new google.maps.Marker({
                    map,
                    position
                });
                // add place data to the marker object , so onclick we can show the data
                marker.place = place;
               return marker; 
            });

            // adding info window to markers , when someone clicks on a merker the info window pops up
            markers.forEach(marker=>marker.addListener('click',function(){
                    const html = `
                        <div class="popup">
                            <a href="/stores/${this.place.slug}">
                                <img src="/uploads/${this.place.photo || store.png }" alt="${this.place.name}">
                                <p>${this.place.name} - ${this.place.location.address}</p>
                            </a>
                        </div>
                    `;
                    
                    infoWindow.setContent(dompurify.sanitize(html));
                    // where to open the info window (on the current map and on this marker)
                    infoWindow.open(map,this);
                })
            );

            // after creating a polygon of all our places in bounds , zoom map to the correct level
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);

        })
        .catch(err=>console.error(err));
};

function makeMap(mapDiv){
    // if map div is not on page then return
    if(!mapDiv) return;
    // make map
    const map = new google.maps.Map(mapDiv,mapOptions);
    // load places for the default map
    loadPlaces(map); 
    // in case user types up a place load places for that place
    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input); 
    autocomplete.addListener('place_changed',()=>{
        const place= autocomplete.getPlace();
        loadPlaces(map,place.geometry.location.lat(),place.geometry.location.lng());
    });
};

export default makeMap; 

/*
let lat;
let lng;
// get current location of user 
function getPostion(){
   return ;
};
// if provided use that     
function success(position){   
   return{ 
   lat:position.coords.latitude,
   lng:position.coords.longitude
   };
};   
// else fall back to default one
function err(){
    console.error('User denied location falling back to default');
    return{
        lat:28.57,
        lng:77.06
    };
}*/
