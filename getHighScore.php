<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

function getScore(){
    $servername = "localhost";
    $username = "username";     //Your username here
    $password = "password";     //Your password here
    $dbname = "chain_reaction";
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

        if ($conn->connect_error) die($conn->connect_error.'   Sorry, could not connect to the database server');

            $query = "SELECT MAX(score) FROM highScores";

            $result =$conn->query($query);  
            if (!$result) die($conn->error);
            while($row=mysqli_fetch_array($result, MYSQLI_NUM)) 
            {
                $maxresult=$row[0];
            } 

        $result->close();
        $conn->close();
        return $maxresult;
}

echo "data:" . getScore() . "\n\n";
flush();


?>