<?php
require_once '../../includefolder/mysqlCredFor_canicvs_reaction.php';

function addScore($score, $name){
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "INSERT INTO highscores (timeLogged, score, name) VALUES (NOW(), " . $score . ",'" . $name . "')";
    if ($conn->query($sql) === TRUE) {
        return "Your score of ". $score . " was sucessfully added to the database!";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}
?>