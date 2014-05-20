#!/usr/bin/env node
/**
 * GitHub URL Shortener
 * 
 * Shorten your long repo urls with Github's Git.io service.
 * Pastes the url to the clipboard and opens it in your browser.
 * 
 * @link https://github.com/blog/985-git-io-github-url-shortener
 */ 

var http = require( 'http' )
    , childp = require( 'child_process' )
    , querystring = require( 'querystring' )
    , program = require( 'commander' )
    ;

program.usage( '[github url]' );
program.parse( process.argv );

function gus( url ) {
    
    var request
        , url = url || program.args[0]
        , encoded = querystring.encode( { url: url } )
        ;
    
    var options = {
        host: 'git.io',
        method: 'POST',
        headers: {
            'Connection': 'close',
            'Content-Length': encoded.length
        }
    };
       
    request = http.request( options, handler );
    
    request.on( 'error', function(e) {
        throw new Error( 'problem with request: ' + e.message );
    });
    
    // Pass in the URL to shorten and then end the request
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
    
    var pbcopy = childp.spawn( 'pbcopy' );
    
    // Add to clipboard
    pbcopy.stdin.write( newUrl );
    pbcopy.stdin.end();
    
    // Print to the command line
    console.log( newUrl );
    
    // Open in the browser
    childp.exec( 'open ' + newUrl );
}
    
function fail( code ) {
    
    throw new Error( 'There was a problem. The response status was ' + code );
}

module.exports = gus;

// Call directly if used from command line
if ( program.args.length ) gus();
