import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autocomplete from './modules/autocomplete';
// import typeAhead
import typeAhead from './modules/typeAhead';
// import map
import maakeMap from './modules/map';

autocomplete($('#address'),$('#lat'),$('#lng'));

typeAhead($('.search'));
// passing the map div to make map
maakeMap($('#map'));