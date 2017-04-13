<?php
$q = $_REQUEST["q"];
$myfile = fopen("highScore.txt", "w") or die("Unable to open file!");
$txt = $q;
fwrite($myfile, $txt);
fclose($myfile);
?>