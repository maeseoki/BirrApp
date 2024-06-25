const DEBUG = false;
const API_URL = 'http://grifos.ziopig.es/app/controller.php';

// Helper function to handle fetch requests
const fetchData = async (params) => {
    try {
        const response = await fetch(`${API_URL}?${new URLSearchParams(params)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data for ${params.data}: ${error.message}`);
        throw error; // Rethrow to handle it in calling function
    }
};

// Helper function to generate brewery data
const hashCode = beers => md5( JSON.stringify( beers ) );

// Helper function to generate brewery data
const setHash = newHash => {
	try {
		localStorage.setItem( 'beersHash', newHash );
	} catch ( error ) {
		console.log( `Ocurrió un error al guardar el hash: ${error.message}` );
	}
}

// Helper function to generate a hash code for the beers data
const checkIfUpdated = beers => {
	const oldHash = localStorage.getItem( 'beersHash' );
	const newHash = hashCode( beers );
	if ( oldHash && oldHash === newHash ) {
		if ( DEBUG ) console.log( 'Existe Hash y conincide' );
		return false;
	} else if( oldHash && oldHash !== newHash ) {
		if ( DEBUG ) console.log( 'Existe hash pero no coincide.' );
		setHash( newHash );
		return beers;
	} else {
		if ( DEBUG ) console.log( 'No existe hash' );
		setHash( newHash );
		return beers;
	}
}

// Main function to get data and update the UI
const getOnTap = async () => {
    try {
        const breweries = await fetchData({ data: 'breweries' });
        const beers = await fetchData({ data: 'beers', place: 'ruta' });
        const isUpdated = checkIfUpdated(beers);
        if (isUpdated) {
            generateTaps(breweries, beers);
        }
    } catch (error) {
        console.error(`Failed to get tap data: ${error.message}`);
    }
};

// Function to generate brewery data
const generateBrewery = ( breweries, brewedBy ) => {
	for ( const brewery in breweries ) {
		if ( breweries[brewery].archivo === brewedBy ) {
			return [ origen, nombre ] = [ breweries[brewery].origen, brewery ];
		}
	}
}

// Function to generate HTML for the taps
const generateTaps = (breweries, beers) => {
    const container = document.querySelector('.cervezas');
    container.innerHTML = ''; // Clear previous content

    Object.entries(beers).forEach(([beerId, beer]) => {
        const brewery = generateBrewery(breweries, beer.cervecera);
        const beerHTML = `
            <section class="grifo grifo-${beerId}">
                <div class="grifo__nombre">
                    <div class="grifo__logo">
                        <div class="grifo__numero">${beerId}.</div>
                        <img src="./assets/img/logos/${beer.cervecera}.png" alt="${brewery[1]}" loading="lazy">
                    </div>
                    <div class="grifo__cervecera"><img src="./assets/img/nombres/${beer.cervecera}.png" alt="${brewery[1]}" loading="lazy"></div>
                    <div class="grifo__cerveza">${beer.nombre}</div>
                </div>
                <div class="grifo__info">
                    <div class="grifo__datos">
                        <div class="grifo__estilo">${beer.estilo}</div>
                        <div class="grifo__graduacion">${beer.graduacion}% Alc.</div>
                        <div class="grifo__origen">${brewery[0]}</div>
                    </div>
                    <div class="grifo__vasos">
                        <div class="grifo__cania">
                            <img src="./assets/img/vasos/copa_${beer.color}.png" alt="${beer.color}" loading="lazy">
                            <p class="grifo__precio">${beer.cania}€</p>
                        </div>
                        <div class="grifo__pinta">
                            <img src="./assets/img/vasos/pinta_${beer.color}.png" alt="${beer.color}" loading="lazy">
                            <p class="grifo__precio">${beer.pinta}€</p>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.insertAdjacentHTML('beforeend', beerHTML);
    });
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('beersHash'); // Reset the hash on load
    getOnTap();
    setInterval(getOnTap, 60000); // Refresh every minute

    // Initialize any other necessary components, like sliders
    const slider = tns({
        container: '.imagenes',
        items: 1,
        slideBy: 1,
        controls: false,
        nav: false,
        autoplay: true,
        autoplayButtonOutput: false,
        autoplayTimeout: 10000
    });
});
