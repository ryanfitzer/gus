#!/usr/bin/env node
/**
 * GitHub URL Shortener
 * 
 * Shorten your long-ass repo url with Github's Git.io service.
 * Pastes the url to the clipboard and opens it in your browser.
 * 
 * @link https://github.com/blog/985-git-io-github-url-shortener
 */ 

var http = require( 'http' )
    , childp = require( 'child_process' )
    , program = require( 'commander' )
    , querystring = require( 'querystring' )
    ;

program
  .usage( '[github url]' )
  .parse( process.argv );

function ghurls( url ) {
    
    var request
        , url = url || program.args[0]
        , encoded = querystring.encode( { url: url } )
        ;
        
    request = http.request({
        host: 'git.io',
        method: 'POST',
        headers: {
            'Content-Length': encoded.length
        }
    }, handler );

    request.write( encoded );
    request.end();
}

function handler( data ) {
    
    var good
        , codes = [ '200', '201' ]
        , status = data.statusCode
        ;
        
    good = codes.some( function( code ) {
        return status <= code;
    });
    
    if ( good ) success( data.headers.location );
    else fail( status );
}

function success( newUrl ) {
    
    var echo = childp.spawn( 'echo', [ '-n', newUrl ] )
        , pbcopy = childp.spawn( 'pbcopy' )
        ;
    
    console.log(newUrl);
    
    echo.stdout.on( 'data', function ( data ) {
        pbcopy.stdin.write(data);
        pbcopy.stdin.end();
    });
    
    childp.spawn( 'open', [ newUrl ] );
}
    
function fail( code ) {
    
    console.log( 'There was a problem. The response status was ' + code );
}

module.exports = ghurls;

// Call directly if used from shell
if ( program.args.length ) ghurls();