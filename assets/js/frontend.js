/**
 * @description Main app file for frontend
 * @author Victor Casado Ugidos
 * @version 1.0
 */

const depurar = false;

/**
 * Get the full grid. First get all breweries and then generate de grid html and populate it.
 */
 const getOnTap = () => {
	getAllBreweries()
		.then( breweries => breweries )
		.then( breweries =>	generateTaps( breweries ) );
}

/**
 * Retrieve all breweries
 * 
 * @return {Promise}
 */
 const getAllBreweries = async () => {
	const response = await fetch('./app/controller.php?data=breweries')
		.then( response => response.json() )
		.catch( error => console.error( 'Error al recuperar las cerveceras: ' + error.message ) );
	return response;
}


/**
 * Retrieve all beers
 */
 const getAllBeers = async () => {
	const response = await fetch('./app/controller.php?data=beers')
		.then( response => response.json() )
		.catch( error => console.error( 'Error al recuperar las cervezas: ' + error.message ) );
	return response;
}

/**
 * Generate the taps grid html
 *
 * @param {Object} breweries 
 */
const generateTaps = ( breweries ) => {
	getAllBeers()
	.then( beers => checkIfUpdated( beers ) )
	.then( beers => {
		if ( !beers ) {
			return;// Si es false es porque el hash del localstorage es igual al actual.
		} else {
			document.querySelector( '.cervezas' ).innerHTML = '';
		}
		for ( const beer in beers ) {
			let html = '';
			let section = document.createElement( 'section' );
			section.classList.add( 'grifo' );
			section.classList.add( 'grifo-' + beer );
			const cervecera = generateBrewery( breweries, beers[beer].cervecera );
			html += /*html*/`
			<div class="grifo__nombre">
				<div class="grifo__logo">
				<div class="grifo__numero">${beer}.</div>
				<img src="./assets/img/logos/${beers[beer].cervecera}.png" alt="${cervecera[1]}" loading="lazy"></div>
				<div class="grifo__cervecera"><img src="./assets/img/nombres/${beers[beer].cervecera}.png" alt="${cervecera[1]}" loading="lazy"></div>
				<div class="grifo__cerveza">${beers[beer].nombre}</div>
			</div>
			<div class="grifo__info">
				<div class="grifo__datos">
					<div class="grifo__estilo">${beers[beer].estilo}</div>
					<div class="grifo__graduacion">${beers[beer].graduacion}% Alc.</div>
					<div class="grifo__origen">${cervecera[0]}</div>
				</div>
				<div class="grifo__vasos">
					<div class="grifo__cania">
						<img src="./assets/img/vasos/copa_${beers[beer].color}.png" alt="${beers[beer].color}" loading="lazy">
						<p class="grifo__precio">${beers[beer].cania}€</p>
					</div>
					<div class="grifo__pinta">
						<img src="./assets/img/vasos/pinta_${beers[beer].color}.png" alt="${beers[beer].color}" loading="lazy">
						<p class="grifo__precio">${beers[beer].pinta}€</p>
					</div>
				</div>
			</div>
			`;
			section.innerHTML = html;
			populateGrid( section );
		}
	} );
}

/**
 * Populate the grid, one section for each tap.
 * @param {HTMLElement} section Node of a beer tap with all inputs populated
 * @return void
 */
 const populateGrid = ( section ) => document.querySelector( '.cervezas' ).appendChild( section );

/**
 * Generate the origin and full name of the brewery
 *
 * @param {object} breweries Retrieved breweries
 * @param {string} brewedBy File name for the brewery that brewed actual beer
 * @return {array} Array with brewery origin and full name
 */
const generateBrewery = ( breweries, brewedBy ) => {
	for ( const brewery in breweries ) {
		if ( breweries[brewery].archivo === brewedBy ) {
			return [ origen, nombre ] = [ breweries[brewery].origen, brewery ];
		}
	}
}

/**
 * Hash the data.
 *
 * @param {string} beers String to be hashed.
 * @return {string} Hash
 */
const hashCode = beers => md5( JSON.stringify( beers ) );

/**
 * Check if server has differtent beers on tap by comparing hashes.
 *
 * @param {object} beers
 * @return Beers object
 */
const checkIfUpdated = beers => {
	const oldHash = localStorage.getItem( 'beersHash' );
	const newHash = hashCode( beers );
	if ( oldHash && oldHash === newHash ) {
		if ( depurar ) console.log( 'Existe Hash y conincide' );
		return false;
	} else if( oldHash && oldHash !== newHash ) {
		if ( depurar ) console.log( 'Existe hash pero no coincide.' );
		setHash( newHash );
		return beers;
	} else {
		if ( depurar ) console.log( 'No existe hash' );
		setHash( newHash );
		return beers;
	}
}

/**
 * Save the beers object hash in the local storage.
 *
 * @param {String} newHash 
 */
const setHash = newHash => {
	try {
		localStorage.setItem( 'beersHash', newHash );
	} catch ( error ) {
		console.log( 'Ocurrió un error al guardar el hash' + error.message );
	}
}

/**
 * Document Ready
 */
document.addEventListener( 'DOMContentLoaded', () => {
	localStorage.removeItem( 'beersHash' );
	getOnTap();

	setInterval( getOnTap, 60000 );

	const slider = tns( {
		container: '.imagenes',
		items: 1,
		slideBy: 1,
		controls: false,
		nav: false,
		autoplay: true,
		autoplayButtonOutput: false,
		autoplayTimeout: 10000
	  } );
} );