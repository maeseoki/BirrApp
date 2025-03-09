<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// fix CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Debug output
    echo("OPTIONS request handled");
	die;
    
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization, X_AUTH, X_PLACE");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    exit;
}

require_once( dirname( __FILE__ ) . '/config.php' );

/**
 * Para añadir nuevas cervecezas, subir las imágenes de nombre y logo a sus carpetas correspondientes, añadir nuevo elemento al app/data/breweries.json y descomentar la función genesisBreweries(). Luego llamar directamente al controlador, ziopig.es/grifos/app/controller.php
 * 
 * Una vez se ha ejecutado, volver a comentar la función.
 */
//genesisBreweries();

if ( $_SERVER['REQUEST_METHOD'] === 'POST' && isset( $_SERVER['HTTP_X_AUTH'] ) && isset( $_SERVER['HTTP_X_PLACE'] ) ) {
	if ( checkContentType() && authenticate() ) {
		saveChanges($_SERVER['HTTP_X_PLACE']);
	}
} elseif( $_SERVER['REQUEST_METHOD'] === 'GET' ) {
	switch ($_GET['data']) {
		case 'breweries':
			http_response_code( 200 );
			die( getAllBreweries() );
			break;
		case 'beers':
			http_response_code( 200 );
			die( getAllBeers($_GET['place']) );
			break;
		case 'updatebreweries':
			http_response_code( 200 );
			genesisBreweries();
			break;
		default:
		http_response_code( 400 );
		die( json_encode( [
			'value' => 0,
			'error' => 'Error en la solicitud de datos.',
			'data' => null,
		] ) );
			break;
	}
} else {
	http_response_code( 400 );
	die( json_encode( [
		'value' => 0,
		'error' => 'O bien la petición no es POST o bien no se ha enviado un token de autenticación.',
		'data' => null,
	] ) );
}

/**
 * Check request content type, needs to be JSON.
 * 
 * @return true|void
 */
function checkContentType() {
	$contentType = isset( $_SERVER["CONTENT_TYPE"] ) ? trim( $_SERVER["CONTENT_TYPE"] ) : '';
	if ( $contentType !== "application/json" ) {
		http_response_code( 400 );
		die( json_encode( [
			'value' => 0,
			'error' => 'El Content-Type no es "application/json"',
			'data' => null,
		] ) );
	} else {
		return true;
	}
		
}

/**
 * Autenticate user.
 * 
 * @return true|void
 */
function authenticate() {
	if ( $_SERVER['HTTP_X_AUTH'] === USERTOKEN_RUTA && $_SERVER['HTTP_X_PLACE'] === 'ruta' ) {
		return true;
	}
	if ( $_SERVER['HTTP_X_AUTH'] === USERTOKEN_ARENA && $_SERVER['HTTP_X_PLACE'] === 'arena' ) {
		return true;
	}
	
	http_response_code( 401 );
	die( json_encode( [
		'value' => 0,
		'error' => 'La contraseña es incorrecta',
		'data' => null,
	] ) );
}

function connectDb() {
	$mysqli = new mysqli( HOST, USERNAME, PASSWORD, DBNAME);
	if ($mysqli->connect_errno) {
		http_response_code( 401 );
		die( json_encode( [
			'value' => 0,
			'error' => "Fallo al conectar a MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error,
			'data' => null,
		] ) );
	} else {
		return $mysqli;
	}
}

function getAllBreweries() {
	$db = connectDb();
	$sql = "SELECT `datoscerveceras` FROM `cerveceras` ORDER BY id DESC LIMIT 1";
	$result = $db->query( $sql );
	$breweries = $result->fetch_assoc();
	return $breweries['datoscerveceras'];
}

function getAllBeers($place) {
    $db = connectDb();
    $sql = "SELECT `datoscervezas` FROM `cervezas` WHERE `sitio` = ? ORDER BY id DESC LIMIT 1";
    $stmt = $db->prepare($sql);
	$stmt->bind_param("s", $place);
	$stmt->execute();

    // Bind the result variable
    $stmt->bind_result($datosCervezas);
    $stmt->fetch();  // Fetch the value into the bound variable

    if ($datosCervezas !== null) {
        return $datosCervezas;
    } else {
        echo "No beers found for the given place.";
        return null;
    }
}

function saveBeers( $beers, $place ) {
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Headers: *");
	header("Access-Control-Allow-Methods: *");
	$beersEncoded = json_encode( $beers );
	$date = date( 'Y-m-d H:i:s' );

	$db = connectDb();
	$stmt = $db->prepare( "INSERT INTO `cervezas` (datoscervezas, fecha, sitio)  VALUES (?, ?, ?)" );
	$stmt->bind_param( "sss", $beersEncoded, $date, $place );
	$result = $stmt->execute();
	$stmt->close();
	$db->close();
	if ( $result ) {
		http_response_code( 200 );
		die( json_encode( [
			'value' => 1,
			'error' => 'Cervezas guardadas correctamente para ' . $place,
			'data' => null,
		] ) );
	} else {
		http_response_code( 503 );
		die( json_encode( [
			'value' => 0,
			'error' => 'Error al guardar las cervezas para ' . $place,
			'data' => null,
		] ) );
	}
}

function saveBreweries( $breweries ) {
	$breweriesEncoded = json_encode( $breweries );
	$date = date( 'Y-m-d H:i:s' );

	$db = connectDb();
	$stmt = $db->prepare( "INSERT INTO `cerveceras` (datoscerveceras, fecha)  VALUES (?, ?)" );
	$stmt->bind_param("ss", $breweriesEncoded, $date );
	$result = $stmt->execute();
	$stmt->close();
	$db->close();

	if ( $result ) {
		http_response_code( 200 );
		die( json_encode( [
			'value' => 1,
			'error' => 'Cerveceras guardadas correctamente',
			'data' => null,
		] ) );
	} else {
		http_response_code( 503 );
		die( json_encode( [
			'value' => 0,
			'error' => 'Error al guardar las cerveceras',
			'data' => null,
		] ) );
	}
}

/**
 * Check if request JSON is properly formatted.
 * 
 * @return true|void
 */
function properlyFormatted( $data ) {
	if( !is_array( $data )) {
		http_response_code( 401 );
		die( json_encode( [
			'value' => 0,
			'error' => 'El JSON recibido está malformado',
			'data' => null,
		] ) );
	} else {
		return true;
	}
}

/**
 * Save request content.
 */
function saveChanges( $place ) {
	$content = trim( file_get_contents( 'php://input' ) );
	$decoded = json_decode( $content, true );
	if ( properlyFormatted( $decoded ) ) {
		saveBeers( $decoded, $place );
	}
}

/**
 * Save data to file and return response to client. 201 if successfully or 503 if error writting file.
 * 
 * @param Array $data	Beers data to be written.
 * @return void
 */
function writeBeersFile( $data ) {
	if ( file_put_contents( 'data/beers.json', json_encode( $data ) ) ) {
		http_response_code( 200 );
		die( json_encode( [
			'value' => 1,
			'error' => 'Cervezas guardadas correctamente',
			'data' => null,
		] ) );
	} else {
		http_response_code( 503 );
		die( json_encode( [
			'value' => 0,
			'error' => 'Error al guardar las cervezas',
			'data' => null,
		] ) );
	}
}

function genesisBeers() {
	$beers = file_get_contents( 'data/beers.json' );
	saveBeers( json_decode( $beers ), 'ruta' );
	die( 'Génesis de cervezas ejecutado' );
}

function genesisBreweries() {
	$breweries = file_get_contents( 'data/breweries.json' );
	saveBreweries( json_decode( $breweries ) );
	die( 'Génesis de cerveceras ejecutado' );
}