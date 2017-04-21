<?php
function addScore($score){
    $servername = "localhost";
    $username = "username";     //Your username here
    $password = "password";     //Your password here
    $dbname = "chain_reaction";
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "INSERT INTO highscores (timeLogged, score) VALUES (NOW(), " . $score . ")";
    if ($conn->query($sql) === TRUE) {
        return "Your score of ". $score . " was sucessfully added to the database!";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}
?>