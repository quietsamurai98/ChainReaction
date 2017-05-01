<?php
require 'addScoreToDB.php';
$boardStr = $_REQUEST["board"];
$rowInput = $_REQUEST["row"];
$colInput = $_REQUEST["col"];
$nameOut = sanitizeName($_REQUEST["name"]);
if($nameOut === "#NoGo"){
    echo "Invalid display name.";
} else {
    $boardArr = boardExplode($boardStr);
    $score = chainReact($boardArr, $rowInput, $colInput);
    echo addScore($score, $nameOut);
}

function boardExplode($str){
    $out = array();
    foreach (explode('.', $str) as $row) {
        $out[] = explode(',', $row);
    }
    return $out;
}

function sanitizeName($name){
    $validChars = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
    if (strlen($name) > 0 && strspn($name, $validChars) == strlen($name)){
    	return $name;
    } else {
    	return "#NoGo";
    }
}

function chainReact($gameBoard, $row, $col){
    $neighbors = array(array($row,$col));
    $score = 0;
    while (count($neighbors)>0){
        $l = count($neighbors);
        for($n = 0; $n<$l; $n++){
            $r = $neighbors[$n][0];
            $c = $neighbors[$n][1];
            $gameBoard[$r][$c] = ($gameBoard[$r][$c]+1) % 4;
            $score++;
        }
        $neighbors = getNeighbors($neighbors, $gameBoard);
    }
    return $score;
}

function getNeighbors($parents, $arr){
    $out = array();
    $h = count($arr);
    $w = count($arr[0]);
    $l = count($parents);
    for($n = 0; $n<$l; $n++){
        $r = $parents[$n][0];
        $c = $parents[$n][1];
        if($r-1>=0){
            if($arr[$r][$c] % 3 == 0 && $arr[$r-1][$c] % 3 != 0){
                array_push($out, array($r-1,$c));
            }
        }
        if($c-1>=0){
            if($arr[$r][$c] >= 2 && $arr[$r][$c-1] <= 1){
                array_push($out, array($r,$c-1));
            }
        }
        if($r+1<$h){
            if($arr[$r][$c] % 3 != 0 && $arr[$r+1][$c] % 3 == 0){
                array_push($out, array($r+1,$c));
            }
        }
        if($c+1<$w){
            if($arr[$r][$c] <= 1 && $arr[$r][$c+1] >= 2){
                array_push($out, array($r,$c+1));
            }
        }
    }
    return removeDuplicates($out);
}

function removeDuplicates($arr){
    $out = array();
    $strings = array();
    $len = count($arr);
    for($i = 0; $i<$len; $i++){
        array_push($strings, implode("," , $arr[$i]));
    }
    for($i = 0; $i<$len; $i++){
        $flag = true;
        for($j = $i+1; $j<$len && $flag; $j++){
            if($strings[$i] === $strings[$j]){
                $flag = false;
            }
        }
        if($flag){
            array_push($out, $arr[$i]);
        }
    }
    return $out;
}
?>