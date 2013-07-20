<?php
require_once(__DIR__.DIRECTORY_SEPARATOR.'function.lib.php');
require_once('cfg.php');
  
$arySettings = array();
$arySettings['title'] = substr( basename('X'.iconv('UTF-8','GB2312',$_REQUEST['title'])), 1 );
$arySettings['charpter'] = substr( basename('X'.iconv('UTF-8','GB2312',$_REQUEST['charpter'])), 1 );
$arySettings['src'] = $_REQUEST['src'];
$arySettings['host'] = parse_url($arySettings['src'], PHP_URL_HOST);
$arySettings['referer'] = $_REQUEST['referer'];
$arySettings['no'] = (int)$_REQUEST['no'];

foreach($arySettings as $key => $value){
    if(!strlen($value)){
        echo 'error, empty field: '.$key;
        die();
    }
}

//Host:manhua21.eu.cdndm5.com
//Referer:http://www.dm5.com/m113138/
$strPath = PATH.DIRECTORY_SEPARATOR.$arySettings['title'];
//if(realpath($strPath) != $strPath) die('error: path hacking '.$strPath.'--'.realpath(PATH.DIRECTORY_SEPARATOR));
if(!file_exists($strPath) || !is_dir($strPath)) mkdir($strPath);

$strPath = $strPath.DIRECTORY_SEPARATOR.$arySettings['charpter'];
//if(realpath($strPath) != $strPath) die('error: path hacking '.$strPath.'--'.realpath($strPath));
if(!file_exists($strPath) || !is_dir($strPath)) mkdir($strPath);

$arySrcSettings = parse_url($arySettings['src']);
$arySrcSettings['path'] = explode('/', $arySrcSettings['path']);
$arySrcSettings['path'] = implode('/', array_map('rawurlencode', $arySrcSettings['path']) );
//$arySettings['src'] = sprintf('%s://%s%s?%s&t=%s', $arySrcSettings['scheme'], $arySrcSettings['host'], $arySrcSettings['path'], isset($arySrcSettings['query'])?$arySrcSettings['query']:'a=b', time());
$arySrcSettings['query'] = isset($arySrcSettings['query']) ? parse_str($arySrcSettings['query']) : array();
$arySrcSettings['query'] = !is_array($arySrcSettings['query']) ? array() : $arySrcSettings['query'];
$arySrcSettings['query']['t__'] = time();
$arySrcSettings['query'] = http_build_query($arySrcSettings['query']);
$arySettings['src'] = http_build_url($arySettings['src'], $arySrcSettings);

$strPath = $strPath.DIRECTORY_SEPARATOR.str_pad($arySettings['no'], 4, '0', STR_PAD_LEFT).substr($arySrcSettings['path'], strrpos($arySrcSettings['path'], '.'));

$aryHeader = array(
    'Accept:*/*',
    'Accept-Encoding:gzip,deflate,sdch',
    'Accept-Language:zh-CN,zh;q=0.8',
    'Cache-Control:max-age=0,',
    'Connection:keep-alive',
    'Host:'.$arySettings['host']
);

$fp = fopen($strPath, 'w');
$ch = curl_init($arySettings['src']);

curl_setopt($ch, CURLOPT_HTTPHEADER, $aryHeader);
curl_setopt($ch, CURLOPT_REFERER, $arySettings['referer']);
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
//curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FILE, $fp); 

$data = curl_exec($ch);

curl_close($ch);
fclose($fp);

echo '<pre>'; 
var_dump($aryHeader);
var_dump($strPath);
var_dump($arySettings);
var_dump($_REQUEST); 
echo '</pre>';



exit;