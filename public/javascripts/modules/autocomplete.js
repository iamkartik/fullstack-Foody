function autocomplete(input,latInput,lngInput){
    // skip if no address is there
    if(!input) return;
    // add a dropdown using google maps/places autocomplete api
    const dropdown = new google.maps.places.Autocomplete(input);
    // add an event listener to get the selected address from dropdown
    dropdown.addListener('place_changed',()=>{
        // get the place info of the selected place
        const place = dropdown.getPlace();
        // get the lat and lng info of the place 
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
    // prevent form submit on hitting enter on a form input
    // bling.js syntax using on instead of addEventListener
    input.on('keydown',(e)=>{
        // Enter keycode is 13
        if(e.keyCode===13) e.preventDefault();
    });

    /*
    console.log(input,latInput,lngInput);
    console.log(dropdown);*/
}

export default autocomplete;