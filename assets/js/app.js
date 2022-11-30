/**
 * @description Main app file
 * @author Victor Casado Ugidos
 * @version 0.1
 */

/**
 * Retrieve all beers
 */
 const getAllBeers = async () => {
	const response = await fetch('../app/controller.php?data=beers')
		.then( response => response.json() )
		.catch( error => alert( 'Error al recuperar las cervezas: ' + error.message ) );
	return response;
}

/**
 * Generate html for form
 * 
 * @param {Object} breweries 
 */
 const generateForm = ( breweries ) => {
	getAllBeers().then( beers => {
		for ( const beer in beers ) {
			let html = '';
			let fieldSet = document.createElement( 'fieldset' );
			fieldSet.classList.add( 'grifo' );
			fieldSet.classList.add( 'grifo-' + beer );
			const select = generateSelect( breweries, beers[beer].cervecera );
			html += /*html*/`
				<div class="grifo__cabecero">
					<h2>Grifo ${beer}</h2>
				</div>
				<div class="grifo__formulario">
					<div class="grifo__cervecera">
						<label for="${beer}:cervecera">Cervecera</label>
						<select name="${beer}:cervecera" id="${beer}:cervecera" class="grifo__cervecera--select">
						${select}
						</select>
					</div>
					<div class="grifo__nombre">
						<label for="${beer}:nombre">Nombre</label>
						<input type="text" name="${beer}:nombre" id="${beer}:nombre" value="${beers[beer].nombre}">
					</div>
					<div class="grifo__estilo">
						<label for="${beer}:estilo">Estilo</label>
						<input type="text" name="${beer}:estilo" id="${beer}:estilo" value="${beers[beer].estilo}">
					</div>
					<div class="grifo__graduacion">
						<label for="${beer}:graduacion">Graduación</label>
						<input type="number" name="${beer}:graduacion" id="${beer}:graduacion" min="0" max="65" step="0.01" value="${beers[beer].graduacion}">
					</div>
					<div class="grifo__cania">
						<label for="${beer}:cania">Precio Caña</label>
						<input type="number" name="${beer}:cania" id="${beer}:cania" min="0" max="20" step="0.10" value="${beers[beer].cania}">
					</div>
					<div class="grifo__pinta">
						<label for="${beer}:pinta">Precio Pinta</label>
						<input type="number" name="${beer}:pinta" id="${beer}:pinta" min="0" max="20" step="0.10" value="${beers[beer].pinta}">
					</div>
					<div class="grifo__color">
						<label>
							<input type="radio" name="${beer}:color" value="pilsner" ${beers[beer].color === 'pilsner' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_pilsner.png" alt="Pilsner" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="tostada" ${beers[beer].color === 'tostada' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_tostada.png" alt="Tostada" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="session" ${beers[beer].color === 'session' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_session.png" alt="Session" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="ipa" ${beers[beer].color === 'ipa' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_ipa.png" alt="IPA" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="dipa" ${beers[beer].color === 'dipa' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_dipa.png" alt="DIPA" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="chroma" ${beers[beer].color === 'chroma' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_chroma.png" alt="Fruit" loading="lazy">
						</label>
						<label>
							<input type="radio" name="${beer}:color" value="stout" ${beers[beer].color === 'stout' ? 'checked' : ''}>
							<img src="../assets/img/vasos/pinta_stout.png" alt="Stout" loading="lazy">
						</label>
					</div>
				</div>
			`;
			fieldSet.innerHTML = html;
			populateForm( fieldSet );
		}
	} )
	.then( () => addTapListeners() )
	.finally( () => removeSpinner() );
}

/**
 * Populate the form, one fieldset for each tap.
 * @param {HTMLElement} fieldSet Node of a beer tap with all inputs populated
 * @return void
 */
const populateForm = ( fieldSet ) => document.querySelector( '.form-data' ).append( fieldSet );


/**
 * Get the full form. First get all breweries and then generate de form html and populate it.
 */
const getForm = () => {
	addSpinner();
	getAllBreweries()
		.then( breweries => breweries )
		.then( breweries =>	generateForm( breweries ) );
}

/**
 * Retrieve all breweries
 * 
 * @return {Promise}
 */
 const getAllBreweries = async () => {
	const response = await fetch('../app/controller.php?data=breweries')
		.then( response => response.json() )
		.catch( error => alert( 'Error al recuperar las cerveceras: ' + error.message ) );
	return response;
}

/**
 * Generate the select element for the breweries
 *
 * @param {Object} breweries Retrieved breweries
 * @param {String} brewedBy File name for the brewery that brewed actual beer
 * @return {String} HTML with options for the breweries select element
 */
const generateSelect = ( breweries, brewedBy ) => {
	let html = '';
	for ( const brewery in breweries ) {
		html += /*html*/`
			<option value="${breweries[brewery].archivo}" ${breweries[brewery].archivo === brewedBy ? 'selected' : ''}>${brewery}</option>
		`;
	}
	return html;
}

/**
 * On form submit we get data and call sending it.
 * @param {Event} e 
 */
const onSubmit = e => {
	e.preventDefault();
	const formData = new FormData( e.target );
	const password = formData.get( 'password' );
	password ? formData.delete( 'password' ) : alert( 'No has introducido la contraseña!' );

	const grouped = Array.from ( formData ).reduce( ( m, e ) => 
  		( ( ( [ g, k, v ] = [ ...e[ 0 ].split( ':' ), e[ 1 ] ] ) =>  
    		( m[ g ] = Object.assign( { }, m[ g ] ) )[ k ] = v )( ), m ), { } );

	sendData( grouped, password );
}

/**
 * Sends data to API for saving the beers.
 *
 * @param {Object} data 	Form data as JSON to be saved.
 * @param {String} password	User password
 */
const sendData = ( data, password ) => {
	addSpinner();
	const headers = new Headers({
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'X-Auth': password
	});

	const request = {
			method: 'POST',
			body: JSON.stringify( data ),
			headers: headers
		};

	fetch( '../app/controller.php', request)
		.then( response => response.json() )
		.then( data => printInfo( data ) )
		.catch( error => console.log( 'Ocurrió un error al guardar: ' + error.message ) )
		.finally( () => removeSpinner() );
}

/**
 * Spinner HTML to be inyected
 */
const spinnerHtml = /* html */`
	<div class="orbit-spinner">
		<div class="orbit"></div>
		<div class="orbit"></div>
		<div class="orbit"></div>
	</div>
`;

/**
 * Activate Spinner
 */
const addSpinner = () => {
	const spinner = document.querySelector( '.spinner' );
	spinner.classList.add( 'visible' );
	spinner.innerHTML = spinnerHtml;
}

/**
 * Deactivate Spinner
 */
const removeSpinner = () => {
	const spinner = document.querySelector( '.spinner' );
	spinner.classList.remove( 'visible' );
	spinner.innerHTML = '';
}

/**
 * Add eventListeners to all tap fielsets so they expand on click.
 */
const addTapListeners = () => {
	document.querySelectorAll( '.grifo__cabecero' )
		.forEach( grifo => 
			grifo.addEventListener( 'click', () => {
				grifo.parentElement.classList.toggle( 'activo' )
			})
		);
}

/**
 * Prints the information from the HTTP response on success or error.
 * @param {Object} data Data from HTTP response.
 */
const printInfo = data => {
	const $info = document.querySelector( '.info' );
	if ( data.value === 1 ) {
		$info.classList.remove( 'error' );
		$info.classList.add( 'correcto' );
	} else if ( data.value === 0 ) {
		$info.classList.remove( 'correcto' );
		$info.classList.add( 'error' );
	}
	$info.innerHTML = data.error;
}

/**
 * Document Ready
 */
document.addEventListener( 'DOMContentLoaded', () => {
	getForm();

	document.querySelector( '#refresh' ).addEventListener( 'click', () => document.location.reload( true ) );
	document.querySelector( '#editar-form' ).addEventListener( 'submit', e => onSubmit( e ) );
} );
