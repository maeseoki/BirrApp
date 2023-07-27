<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=0.48, shrink-to-fit=yes">
	<link rel="stylesheet" href="./assets/css/style.css">
	<link rel="stylesheet" href="./assets/css/tiny-slider.css">
	<script src="./assets/js/tiny-slider.js"></script>
	<title>Zio Pig</title>
</head>
<body class="app">
	<main class="cervezas"></main>
	<aside class="informacion">
		<div class="imagenes">
		<?php
			/* Cargamos los enlaces a las imágenes de promos. Definimos el directorio, lo escanemos de forma inversa,
				sacamos las dos ultimas posiciones de array (/. y /..), lo ordenamos de forma aleatoria y los cargamos con el foreach*/
			$ficheros  = scandir( './assets/img/promos/', 1 );
			$dirprevio = array_pop( $ficheros );
			$dirprevio = array_pop( $ficheros );
			shuffle( $ficheros );
			foreach ( $ficheros as $imagen ) {
				echo '<img src="./assets/img/promos/' . $imagen . '" loading="lazy">';
			}
		?>
		</div>
		<div class="redes-sociales">
			<img src="./assets/img/rrss.png" alt="Redes Sociales">
		</div>
	</aside>
	<script src="./assets/js/md5.min.js"></script>
	<script src="./assets/js/frontend.js?1344"></script>
</body>
</html>