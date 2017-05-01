<?php
require_once '../../includefolder/mysqlCredFor_canicvs_reaction.php';

function getIP(){
    if (!empty($_SERVER["HTTP_CLIENT_IP"]))
    {
     //check for ip from share internet
     $ip = $_SERVER["HTTP_CLIENT_IP"];
    }
    elseif (!empty($_SERVER["HTTP_X_FORWARDED_FOR"]))
    {
     // Check for the Proxy User
     $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
    }
    else
    {
     $ip = $_SERVER["REMOTE_ADDR"];
    }

    // This will print user's real IP Address
    // does't matter if user using proxy or not.
    return $ip;
}

function logHit(){
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "INSERT INTO pagehits (clientIP) VALUES ('" . getIP() . "')";
    if ($conn->query($sql) === TRUE) {
        return "Page hit successfully logged.";
    } else {
        return "Error: " . $sql . "<br>" . $conn->error;
    }
}
 echo logHit();
?>