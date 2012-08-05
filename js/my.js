/**
 * jQuery Mobile - Sayeda Khadija Centre
 *
 * @url		http://github.com/faithoflifedev/Sayeda-Khadija-Centre
 * @author	Faith of Life Developer <faithoflifedev@gmail.com>
 * @version	2.0.3
**/

var is_online = true;

window.addEventListener(
	'load', 
	function () 
	{
    	document.addEventListener(
    		'deviceready', 
    		onDeviceReady,
    		false
    	);
    	
//    	onDeviceReady();
	}, 
	false
);

$( '#pg_events' ).live(
    'pageinit',
    startup
);

$( '#pg_salaat' ).live(
    'pageinit',
    pg_salaat
);
    
$( '#pg_map' ).live(
    'pageshow',
    pg_map
);
    
$( '#pg_donate' ).live(
    'pageinit',
    pg_donate
);
    
$( '#pg_about' ).live(
    'pageinit',
    pg_about
);

function startup()
{	
	$( 'div.ui-page' ).live(
		"swipeleft", 
		function( event )
		{
			var nextpage = $( this ).next( 'div[data-role="page"]' );

			// swipe using id of next page if exists
			if ( nextpage.length > 0 ) 
			{
				$.mobile.changePage( 
					nextpage, 
					{
                    	transition: 'slide',
                    	reverse: false
                	} 
                );
			}
		}
	);

	$( 'div.ui-page' ).live(
		"swiperight", 
		function( event )
		{
			var prevpage = $( this ).prev( 'div[data-role="page"]' );
		
			// swipe using id of next page if exists
			if ( prevpage.length > 0 ) 
			{
				$.mobile.changePage( 
					prevpage, 
					{
                    	transition: 'slide',
                    	reverse: false
                	}
                );
			}
		}
	);
		
	$( '#continue' ).click(
		function( event )
		{
			$( '#dlg_leaving' ).dialog ( 'close' );
		}
	);

    $( '#refreshEvents' ).click( pg_events );

    $( '#refreshSalaat' ).click( pg_salaat );
    
    pg_events();
}

function onDeviceReady()
{
   	var networkState = navigator.network.connection.type;
    
    if ( networkState == Connection.ETHERNET || networkState == Connection.WIFI || networkState == Connection.CELL_2G || networkState == Connection.CELL_3G || networkState == Connection.CELL_4G )
    {    
        is_online = true;
    }
    else
    {
        is_online = false;
    }
    
    document.addEventListener( 
	    "online", 
    	function( event )
		{
    		is_online = true;
    
	    	$( '#skc_header_about' ).show();
    		$( '#website' ).show();
    		$( '#email' ).show();
		}, 
		false 
	);
    
    document.addEventListener( 
    	"offline", 
    	function( event )
		{
    		is_online = false;
    
    		navigator.notification.alert(
        		'The Sayeda Khadija Centre app is switching to offline functionality.',
        		function()
        		{
            		$.mobile.changePage( $( '#pg_about' ) );
        		},
        		'Going Offline'
    		);
		},
    	false 
    );   
    
    document.addEventListener(
    	"backbutton", 
    	function( event )
    	{
    		navigator.app.exitApp();
    	}, 
    	false
    );
    
}

function pg_events()
{
    $( '#skc_events li' ).live(
        'click',
        function()
        {
            $( '#continue' ).attr( 'href', $( this ).data( "identity" ) );
        }
    );

    $.mobile.showPageLoadingMsg();
    
    $.yql(
        "select * from feed where url = 'http://www.sayedakhadijacentre.com/index.php?option=com_jevents&task=modlatest.rss&format=feed&type=rss&modid=38'",
        {},
        function ( response )
        {
        	var arr_data = [];
        	
            if ( ! response.query.results )
            {
            	$( '#skc_events' ).parent().append( '<p>There are no events listed at this time.</p>' );
            
            	return;
            }
            
            if ( response.query.results.item.length == undefined )
            	arr_data.push( response.query.results.item );
          	else
            	arr_data = response.query.results.item;
            
            var dt = null;
          
            var last_dt = null;
          
            var title = null
          
            $.mobile.hidePageLoadingMsg();
            
            $( '#skc_events' ).empty();
            
            $.each(
            	arr_data,
                function( index, item )
                {
                    var arr_title = item.title.split( ' : ' );
                 
                    dt = arr_title[0];
                 
                    title = arr_title[1];
                 
                    if ( dt != last_dt )
                    {
                        $( '#skc_events' ).append( "<li data-role='list-divider'>" + dt + "</li>" );
                         
                		last_dt = dt;
                    }
                 
                	$( '#skc_events' ).append( '<li data-identity="' + item.link + '"><a href="#dlg_leaving" data-rel="dialog" data-transition="flip">' + title + '<p>' + item.description + '</p></a></li>' );
                }
            );
          
            $( "#skc_events" ).listview( "refresh" );
        }
    );    
}

function pg_salaat()
{
    $.mobile.showPageLoadingMsg();
    
    $.yql(
        "select * from json where url = 'http://www.skcentre.com/~admin/salaat/st_get_salaat.php'",
        {},
        function ( response )
        {
            $.mobile.hidePageLoadingMsg();
          
              var data = response.query.results.json;
          
              var arr_maghrib = data.maghrib.split( /[: ]/ );
          
              maghrib_hr = parseInt( arr_maghrib[0] );
          
              maghrib_min = parseInt( arr_maghrib[1] );
          
              var up = ( maghrib_min > 55 );
          
              maghrib_min = up ? ( maghrib_min - 55 ) : ( maghrib_min + 5 );
          
              if ( up )
                  maghrib_hr = parseInt( maghrib_hr ) + 1;
          
              if ( maghrib_min < 10 )
                  maghrib_min = '0' + maghrib_min;
          
              $( '#fajr_s' ).html( data.fajr + ' AM' );
              $( '#sunr_s' ).html( data.sunrise + ' AM' );
              $( '#dhuhr_s' ).html( data.dhuhr + ' PM' );
              $( '#asr_s' ).html( data.asr + ' PM' );
              $( '#mag_s' ).html( data.maghrib + ' PM' );
              $( '#mag_i' ).html( maghrib_hr + ':' + maghrib_min + ' PM' );
              $( '#isha_s' ).html( data.isha + ' PM' );
              $( '#h_dt' ).html( data.hijri );
              $( '#g_dt' ).html( data.date );
        }
    );
    
    $.yql(
        "select * from json where url = 'http://www.skcentre.com/~admin/salaat/st_get_iqama.php'",
        {},
        function ( response )
        {
            var data = response.query.results.json;
          
              var dst = ( ( new Date() ).getTimezoneOffset() / 60 ) - 4;
          
              $( '#fajr_i' ).html( data.fajr );
              $( '#dhuhr_i' ).html( ( dst == 1 ) ? '1:00 PM' : '1:30 PM' );
              $( '#asr_i' ).html( data.asr );
              $( '#isha_i' ).html( data.isha );
        }
    );
}

function pg_map()
{
	$( '#map_canvas' ).width( $( document ).width() - $('#map_canvas').position().left - $('#map_canvas').offset().left );
   
    $( '#map_canvas' ).height( $( document ).height() - $( '#map_canvas' ).position().top - 30 );

    $( '#map_canvas' ).gmap({ 'center': '43.650652,-79.708003' });
    
    $( '#map_canvas' ).gmap().bind(
    	'init', 
    	function( event, map ) 
    	{ 
        	$( '#map_canvas' ).gmap(
        		'addMarker', 
        		{ 
        		'position': '43.650652,-79.708003', 
        		'bounds': true,
        		} 
        	).click(
        		function() 
        		{
				    $( '#map_canvas' ).gmap( 'openInfoWindow', { 'content': '<div align="center"><img width="120" src="images/mosquepic500x160.jpg" /><br/><br/>7150 Edwards Blvd. Mississauga, Ontario</div>' }, this );
        		}
			);                                                                                                                                                                                                                
    
		    $( '#map_canvas' ).gmap( 'option', 'zoom', 15 );
		    
		    $( '#map_canvas' ).gmap( 'option', 'mapTypeId', google.maps.MapTypeId.HYBRID );
		}
	);
}

function pg_donate()
{
    $( '#skc_type li' ).live(
        'click',
        function()
        {
            $( '#continue' ).attr( 'href', $( this ).data( "identity" ) );
        }
    );
}

function pg_about()
{
    if ( ! is_online )
    {
        $( '#skc_header_about' ).hide();
        $( '#website' ).hide();
        $( '#email' ).hide();
    }
}