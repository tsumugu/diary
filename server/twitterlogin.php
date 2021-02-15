<?php
// 設定項目
$api_key = 'yHm46VVE7lc73zESJDNB1Avzy';
$api_secret = 'OVvBQpKVpd5O6q8nOG61u4T1bap8oIRX33f47H2nTkhaxOTvgs';
$callback_url = ( !isset($_SERVER['HTTPS']) || empty($_SERVER['HTTPS']) ? 'http://' : 'https://' ) . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] ;


if (isset($_GET['oauth_token'])&&!empty($_GET['oauth_token'])&&isset($_GET['oauth_verifier'])&&!empty($_GET['oauth_verifier'])) {
  // 「連携アプリを認証」をクリックして帰ってきた時
  session_start() ;
  session_save_path("/tmp");
  ini_set('session.gc_maxlifetime', 1800);
  ini_set('session.gc_probability', 1);
  ini_set('session.gc_divisor', 100);
  $request_token_secret = $_SESSION['oauth_token_secret'];
  $request_url = 'https://api.twitter.com/oauth/access_token' ;
  $request_method = 'POST' ;
  $signature_key = rawurlencode( $api_secret ) . '&' . rawurlencode( $request_token_secret ) ;
  $params = array(
    'oauth_consumer_key' => $api_key ,
    'oauth_token' => $_GET['oauth_token'] ,
    'oauth_signature_method' => 'HMAC-SHA1' ,
    'oauth_timestamp' => time() ,
    'oauth_verifier' => $_GET['oauth_verifier'] ,
    'oauth_nonce' => microtime() ,
    'oauth_version' => '1.0' ,
  );
  foreach($params as $key => $value){
    $params[$key] = rawurlencode($value);
  }
  ksort($params);
  $request_params = http_build_query( $params , '' , '&' );
  $request_params = rawurlencode($request_params) ;
  $encoded_request_method = rawurlencode( $request_method ) ;
  $encoded_request_url = rawurlencode( $request_url ) ;
  $signature_data = $encoded_request_method . '&' . $encoded_request_url . '&' . $request_params ;
  $hash = hash_hmac( 'sha1' , $signature_data , $signature_key , TRUE ) ;
  $signature = base64_encode( $hash ) ;
  $params['oauth_signature'] = $signature ;
  $header_params = http_build_query( $params , '' , ',' ) ;
  $context = array(
    'http' => array(
      'method' => $request_method , //リクエストメソッド
      'header' => array(			  //カスタムヘッダー
        'Authorization: OAuth ' . $header_params ,
      ),
    ) ,
  ) ;
  $curl = curl_init() ;
  curl_setopt( $curl , CURLOPT_URL , $request_url ) ;
  curl_setopt( $curl , CURLOPT_HEADER, 1 ) ; 
  curl_setopt( $curl , CURLOPT_CUSTOMREQUEST , $context['http']['method'] ) ;
  curl_setopt( $curl , CURLOPT_SSL_VERIFYPEER , false ) ;
  curl_setopt( $curl , CURLOPT_RETURNTRANSFER , true ) ;
  curl_setopt( $curl , CURLOPT_HTTPHEADER , $context['http']['header'] ) ;
  curl_setopt( $curl , CURLOPT_TIMEOUT , 5 ) ;
  $res1 = curl_exec( $curl ) ;
  $res2 = curl_getinfo( $curl ) ;
  curl_close( $curl ) ;
  $response = substr( $res1, $res2['header_size'] ) ;
  $header = substr( $res1, 0, $res2['header_size'] ) ;
  if ( !isset( $response ) || empty( $response ) ) {
    $error = 'リクエストが失敗しました' ;
  } else {
    $parameters = explode( '&' , $response ) ;
    if ( !isset( $parameters[1] ) || empty( $parameters[1] ) ) {
      $error_msg = true ;
    } else {
      $query = array() ;
      foreach ( $parameters as $parameter ) {
        $pair = explode( '=' , $parameter ) ;
        if( isset($pair[1]) ) {
          $query[ $pair[0] ] = $pair[1] ;
        }
      }
      if ( !isset( $query['oauth_token'] ) || !isset( $query['oauth_token_secret'] ) ) {
        $error_msg = true ;
      } else{
        // 各データの整理
        $access_token = $query['oauth_token'] ;
        $access_token_secret = $query['oauth_token_secret'] ;
        $user_id = "twitter_".$query['user_id'] ;
        $screen_name = $query['screen_name'] ;
        $_SESSION['username'] = $screen_name;
      }
    }
    if ( isset( $error_msg ) && !empty( $error_msg ) ) {
      $error = '' ;
      $error .= 'エラーが発生しました。' ;
    }
  }
} else if ( isset( $_GET['denied'] ) && !empty( $_GET['denied'] ) ) {
  // 「キャンセル」をクリックして帰ってきた時
  // エラーメッセージを出力して終了
  header("HTTP/1.0 403 Forbidden"); 
  /*
  //元のページに
  if (!empty($b_url)) {
    header("Location:https://dofin.xyz/".htmlspecialchars($b_url));
  } else {
    header("Location:https://dofin.xyz/");
  }

  exit ;
  */
} else {
  // 連携ページに飛ばす
  $access_token_secret = '' ;
  $request_url = 'https://api.twitter.com/oauth/request_token' ;
  $request_method = 'POST' ;
  $signature_key = rawurlencode( $api_secret ) . '&' . rawurlencode( $access_token_secret ) ;
  $params = array(
    'oauth_callback' => $callback_url ,
    'oauth_consumer_key' => $api_key ,
    'oauth_signature_method' => 'HMAC-SHA1' ,
    'oauth_timestamp' => time() ,
    'oauth_nonce' => microtime() ,
    'oauth_version' => '1.0' ,
  ) ;
  foreach( $params as $key => $value ) {
    if( $key == 'oauth_callback' ) {
      continue ;
    }
    $params[ $key ] = rawurlencode( $value ) ;
  }
  ksort( $params ) ;
  $request_params = http_build_query( $params , '' , '&' ) ;
  $request_params = rawurlencode( $request_params ) ;
  $encoded_request_method = rawurlencode( $request_method ) ;
  $encoded_request_url = rawurlencode( $request_url ) ;
  $signature_data = $encoded_request_method . '&' . $encoded_request_url . '&' . $request_params ;
  $hash = hash_hmac( 'sha1' , $signature_data , $signature_key , TRUE ) ;
  $signature = base64_encode( $hash ) ;
  $params['oauth_signature'] = $signature ;
  $header_params = http_build_query( $params , '' , ',' ) ;
  $context = array(
    'http' => array(
      'method' => $request_method ,
      'header' => array(
        'Authorization: OAuth ' . $header_params ,
      ) ,
    ) ,
  ) ;
  $curl = curl_init() ;
  curl_setopt( $curl , CURLOPT_URL , $request_url ) ;
  curl_setopt( $curl , CURLOPT_HEADER, 1 ) ; 
  curl_setopt( $curl , CURLOPT_CUSTOMREQUEST , $context['http']['method'] ) ;
  curl_setopt( $curl , CURLOPT_SSL_VERIFYPEER , false ) ;
  curl_setopt( $curl , CURLOPT_RETURNTRANSFER , true ) ;
  curl_setopt( $curl , CURLOPT_HTTPHEADER , $context['http']['header'] ) ;
  curl_setopt( $curl , CURLOPT_TIMEOUT , 5 ) ;
  $res1 = curl_exec( $curl ) ;
  $res2 = curl_getinfo( $curl ) ;
  curl_close( $curl ) ;
  $response = substr( $res1, $res2['header_size'] ) ;
  $header = substr( $res1, 0, $res2['header_size'] ) ;
  if ( !isset( $response ) || empty( $response ) ) {
    $error = 'リクエストが失敗しました。' ;
  } else {
    $parameters = explode( '&' , $response ) ;
    if ( !isset( $parameters[1] ) || empty( $parameters[1] ) ) {
      $error_msg = true ;
    } else {
      $query = array() ;
      foreach ( $parameters as $parameter ) {
        $pair = explode( '=' , $parameter ) ;
        if ( isset($pair[1]) ) {
          $query[ $pair[0] ] = $pair[1] ;
        }
      }
      if ( !isset( $query['oauth_token'] ) || !isset( $query['oauth_token_secret'] ) ) {
        $error_msg = true ;
      } else {
        /* ユーザーを認証画面に移動させる */
        session_start() ;
        session_regenerate_id( true ) ;
        $_SESSION['oauth_token_secret'] = $query['oauth_token_secret'] ;
        header( 'Location: https://api.twitter.com/oauth/authorize?oauth_token=' . $query['oauth_token'] );
        exit ;
      }
    }
    if ( isset( $error_msg ) && !empty( $error_msg ) ) {
      $error = '' ;
      $error .= 'エラー' ;
    }
  }
}

if ( isset( $error ) && $error ) {
  $html .=  '<h2>エラー内容</h2>' ;
  $html .= '<p>' . $error . '</p>' ;
}