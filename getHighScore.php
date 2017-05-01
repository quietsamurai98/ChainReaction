<?php
require_once '../../includefolder/mysqlCredFor_canicvs_reaction.php';
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

function getScore(){
    // Create connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if ($conn->connect_error) die($conn->connect_error.'   Sorry, could not connect to the database server');

            $query = "SELECT MAX(Score) FROM highscores";

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
echo "retry:30000\n";
echo "data:" . getScore() . "\n\n";
flush();


?>