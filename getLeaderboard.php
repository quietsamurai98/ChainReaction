<?php
require_once '../../includefolder/mysqlCredFor_canicvs_reaction.php';

function getAllLeaderboardHTML($conn){
    $tableHTML = "<table align='center'><tr><th colspan='3' style='font-size:150%'>Top Scores of All Time</th></tr><tr><th>Rank</th><th>Username</th><th>Score</th></tr>";
    

        $query = "(SELECT MAX( Score ) as maxScore, name FROM highscores GROUP BY name ORDER BY MAX( Score ) DESC) LIMIT 25";
        $result =$conn->query($query);  
        if (!$result) die($conn->error);
        $counter = 0;
        while($row=mysqli_fetch_array($result)) 
        {
            $counter++;
            $tableHTML .= "<tr>";
            $tableHTML .= "<td>" . $counter . "</td>";
            $tableHTML .= "<td>" . $row['name'] . "</td>";
            $tableHTML .= "<td>" . $row['maxScore'] . "</td>";
            $tableHTML .= "</tr>";
        } 

    $result->close();
    $tableHTML .= "</table>";
    return $tableHTML;
}
function getWeekLeaderboardHTML($conn){
    $tableHTML = "<table align='center'><tr><th colspan='3' style='font-size:150%'>Top Scores of The Week</th></tr><tr><th>Rank</th><th>Username</th><th>Score</th></tr>";

        $query = "(SELECT MAX( Score ) as maxScore, name FROM highscores WHERE timeLogged BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW() GROUP BY name ORDER BY MAX( Score ) DESC) LIMIT 25";

        $result =$conn->query($query);  
        if (!$result) die($conn->error);
        $counter = 0;
        while($row=mysqli_fetch_array($result)) 
        {
            $counter++;
            $tableHTML .= "<tr>";
            $tableHTML .= "<td>" . $counter . "</td>";
            $tableHTML .= "<td>" . $row['name'] . "</td>";
            $tableHTML .= "<td>" . $row['maxScore'] . "</td>";
            $tableHTML .= "</tr>";
        } 

    $result->close();
    $tableHTML .= "</table>";
    return $tableHTML;
}

function getDayLeaderboardHTML($conn){
    $tableHTML = "<table align='center'><tr><th colspan='3' style='font-size:150%'>Top Scores of The Day</th></tr><tr><th>Rank</th><th>Username</th><th>Score</th></tr>";
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) die($conn->connect_error.'   Sorry, could not connect to the database server');

        $query = "(SELECT MAX( Score ) as maxScore, name FROM highscores WHERE DATE(timeLogged) = CURDATE() GROUP BY name ORDER BY MAX( Score ) DESC) LIMIT 25";

        $result =$conn->query($query);  
        if (!$result) die($conn->error);
        $counter = 0;
        while($row=mysqli_fetch_array($result)) 
        {
            $counter++;
            $tableHTML .= "<tr>";
            $tableHTML .= "<td>" . $counter . "</td>";
            $tableHTML .= "<td>" . $row['name'] . "</td>";
            $tableHTML .= "<td>" . $row['maxScore'] . "</td>";
            $tableHTML .= "</tr>";
        } 

    $result->close();
    $tableHTML .= "</table>";
    return $tableHTML;
}

function getLeaderboardHTML(){
    $connect = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($connect ->connect_error) die($connect ->connect_error.'   Sorry, could not connect to the database server');
    
    $outStr = "<table align='center'><tr><td style='padding: 30px;'>" . getAllLeaderboardHTML($connect) . "</td><td style='padding: 30px;'>" . getWeekLeaderboardHTML($connect) . "</td><td style='padding: 30px;'>" . getDayLeaderboardHTML($connect) . "</td></tr></table>";
    $connect->close();
    return $outStr;
    
}
echo getLeaderboardHTML();
?>