/**
 * 
 * Find more about the MTD Touch Library function at
 * http://api.mutado.com/mobile
 *
 * Copyright (c) 2010 Mutado Mobile, http://mutado.com/mobile
 * Released under MIT license
 * http://api.mutado.com/mobile/shared/license
 * 
 * Version 1.0.0 - Last updated: 2010.11.03
 * 
 */
 
 
/**
 * LowPro JQuery plugin minified
 * -----------------------------------------------------------
 */

(function($){var addMethods=function(source){var ancestor=this.superclass&&this.superclass.prototype;var properties=$.keys(source);if(!$.keys({toString:true}).length)properties.push("toString","valueOf");for(var i=0,length=properties.length;i<length;i++){var property=properties[i],value=source[property];if(ancestor&&$.isFunction(value)&&$.argumentNames(value)[0]=="$super"){var method=value,value=$.extend($.wrap((function(m){return function(){return ancestor[m].apply(this,arguments)};})(property),method),{valueOf:function(){return method},toString:function(){return method.toString()}});}
this.prototype[property]=value;}
return this;}
$.extend({keys:function(obj){var keys=[];for(var key in obj)keys.push(key);return keys;},argumentNames:function(func){var names=func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(/, ?/);return names.length==1&&!names[0]?[]:names;},bind:function(func,scope){return function(){return func.apply(scope,$.makeArray(arguments));}},wrap:function(func,wrapper){var __method=func;return function(){return wrapper.apply(this,[$.bind(__method,this)].concat($.makeArray(arguments)));}},klass:function(){var parent=null,properties=$.makeArray(arguments);if($.isFunction(properties[0]))parent=properties.shift();var klass=function(){this.initialize.apply(this,arguments);};klass.superclass=parent;klass.subclasses=[];klass.addMethods=addMethods;if(parent){var subclass=function(){};subclass.prototype=parent.prototype;klass.prototype=new subclass;parent.subclasses.push(klass);}
for(var i=0;i<properties.length;i++)
klass.addMethods(properties[i]);if(!klass.prototype.initialize)
klass.prototype.initialize=function(){};klass.prototype.constructor=klass;return klass;},delegate:function(rules){return function(e){var target=$(e.target),parent=null;for(var selector in rules){if(target.is(selector)||((parent=target.parents(selector))&&parent.length>0)){return rules[selector].apply(this,[parent||target].concat($.makeArray(arguments)));}
parent=null;}}}});var bindEvents=function(instance){for(var member in instance){if(member.match(/^on(.+)/)&&typeof instance[member]=='function'){instance.element.bind(RegExp.$1,$.bind(instance[member],instance));}}}
var behaviorWrapper=function(behavior){return $.klass(behavior,{initialize:function($super,element,args){this.element=$(element);if($super)$super.apply(this,args);}});}
var attachBehavior=function(el,behavior,args){var wrapper=behaviorWrapper(behavior);instance=new wrapper(el,args);bindEvents(instance);if(!behavior.instances)behavior.instances=[];behavior.instances.push(instance);return instance;};$.fn.extend({attach:function(){var args=$.makeArray(arguments),behavior=args.shift();if($.livequery&&this.selector){return this.livequery(function(){attachBehavior(this,behavior,args);});}else{return this.each(function(){attachBehavior(this,behavior,args);});}},attachAndReturn:function(){var args=$.makeArray(arguments),behavior=args.shift();return $.map(this,function(el){return attachBehavior(el,behavior,args);});},delegate:function(type,rules){return this.bind(type,$.delegate(rules));},attached:function(behavior){var instances=[];if(!behavior.instances)return instances;this.each(function(i,element){$.each(behavior.instances,function(i,instance){if(instance.element.get(0)==element)instances.push(instance);});});return instances;},firstAttached:function(behavior){return this.attached(behavior)[0];}});Remote=$.klass({initialize:function(options){if(this.element.attr('nodeName')=='FORM')this.element.attach(Remote.Form,options);else this.element.attach(Remote.Link,options);}});Remote.Base=$.klass({initialize:function(options){this.options=options;},_makeRequest:function(options){$.ajax(options);return false;}});Remote.Link=$.klass(Remote.Base,{onclick:function(){var options=$.extend({url:this.element.attr('href'),type:'GET'},this.options);return this._makeRequest(options);}});Remote.Form=$.klass(Remote.Base,{onclick:function(e){var target=e.target;if($.inArray(target.nodeName.toLowerCase(),['input','button'])>=0&&target.type.match(/submit|image/))
this._submitButton=target;},onsubmit:function(){var data=this.element.serializeArray();if(this._submitButton)data.push({name:this._submitButton.name,value:this._submitButton.value});var options=$.extend({url:this.element.attr('action'),type:this.element.attr('method')||'GET',data:data},this.options);this._makeRequest(options);return false;}});$.ajaxSetup({beforeSend:function(xhr){if(!this.dataType)
xhr.setRequestHeader("Accept","text/javascript, text/html, application/xml, text/xml, */*");}});})(jQuery);


/**
 * MTD Core Lib
 * -----------------------------------------------------------
 */

// SHORTCUTS

// Direct access to component object 

function $MTD( query ) {
	return $( query ).component();
}

// Utilities

$MTD.log = function( o ) {
	if ( console ) {
		console.log( o );
	}
}

$MTD.delegate = function() {
	var arr = [];
	for ( var i = 0; i < arguments.length; i++ ) {
		arr.push( arguments[ i ] );
	}
	var obj = arr.shift();
	var func = arr.shift();
	var args = arr;
	var f = function(){
		var target = arguments.callee.target;
		var func = arguments.callee.func;
		var args = arguments.callee.args;
		if ( args.length > 0 ) {
			return func.apply( target, args.concat( arguments ) );
		} else {
			return func.apply( target, arguments );
		}
	};
	f.target = obj;
	f.func = func;
	f.args = args;
	return f;
}

$MTD.UIComponentManager = {

	registry: {},
	
	append: function( id, klass ) {
		this.registry[ id ] = klass;
	},
	
	resolve: function( id ) {
		return this.registry[ id ];
	},
	
	remove: function( id ) {
		this.registry[ id ] = null;
		delete this.registry[ id ];
	}
	
}

$MTD.UIComponent = $.klass({
	
	holding: false,
	dragging: false,
	firstTouch: null,
	dragThresold: 3, // drag thresold in pixels
	dragHorizontal: false,
	dragVertical: false,
	
	initialize: function( params ) {
		$MTD.UIComponentManager.append( this.id(), this );
		$MTD.log( 'UIComponent initialize... [#' + this.id() + ']' );
		this.__forwarder = {};
		// run
		this.build( params );
		this.bindTouches();
	},
	
	touchableElement: function() {
		return this.element;
	},
	
	bindTouches: function() {
		var el = this.touchableElement();
		// touch manager
		var ts = this.isTouch() ? 'touchstart' : 'mousedown';
		var tm = this.isTouch() ? 'touchmove' : 'mousemove';
		var te = this.isTouch() ? 'touchend' : 'mouseup';
		el.bind( ts, $MTD.delegate( this, this._touchesBegan ) );
		el.bind( tm, $MTD.delegate( this, this._touchesMoved ) );
		el.bind( te, $MTD.delegate( this, this._touchesEnded ) );
	},
			
	id: function() {
		return this.element.attr( 'id' );
	},
	
	owner: function() {
		return $( this.ownerString() );
	},
	
	isTouch: function() {
		return ( 'ontouchstart' in window );
	},
	
	ownerString: function() {
		return '#' + this.id();
	},
	
	bind: function( type, fun, scope ) {
		if ( !scope ) {
			scope = this;
		}
		// Automatic Delegation
		this.__forwarder[ type ] = $MTD.delegate( scope, fun );
	},
	
	notify: function() {
		var arr = [];
		for ( var i = 0; i < arguments.length; i++ ) {
			arr.push( arguments[ i ] );
		}
		var type = arr.shift();
		if ( this.__forwarder[ type ] ) {
			return this.__forwarder[ type ].apply( this, arr );
		}	
	},
	
	hasEvent: function( type ) {
		return this.__forwarder[ type ] != null;
	},
	
	parseTouchesEvent: function( e, touchIndex ) {
		if ( touchIndex == null ) {
			touchIndex = 0;
		}
		if ( this.isTouch() ) {
			return { x: e.originalEvent.touches[ touchIndex ].pageX, y: e.originalEvent.touches[ touchIndex ].pageY };
		}
		return { x: e.originalEvent.pageX, y: e.originalEvent.pageY };
	},
	
	_touchesBegan: function( e ) {
		this.holding = true;
		this.dragHorizontal = false;
		this.dragVertical = false;
		this.firstTouch = this.parseTouchesEvent( e );
		if ( !this.isTouch() ) {
			e.preventDefault();
		}
		this.touchesBegan( e );
	},
	
	_touchesMoved: function( e ) {
		if ( !this.holding ) {
			return;		
		}
		if ( !this.dragging ) {
			var p = this.parseTouchesEvent( e );
			var ox = Math.abs( p.x - this.firstTouch.x );
			var oy = Math.abs( p.y - this.firstTouch.y );
			this.dragHorizontal = ox > oy && ( p.x <= this.firstTouch.x - this.dragThresold || p.x >= this.firstTouch.x + this.dragThresold );
			this.dragVertical = oy > ox && ( p.y <= this.firstTouch.y - this.dragThresold || p.y >= this.firstTouch.y + this.dragThresold );
			if ( this.dragHorizontal || this.dragVertical ) {
				this.dragging = true;	
			}
		}
		this.touchesMoved( e );
	},
	
	_touchesEnded: function( e ) {
		if ( this.dragging ) {
			e.preventDefault();
		}
		this.touchesEnded( e );
		this.holding = false;
		this.dragging = false;		
		this.firstTouch = null;
	},

	touchesBegan: function( e ) {
		// abstract
	},
	
	touchesMoved: function( e ) {
		// abstract
	},
	
	touchesEnded: function( e ) {
		// abstract
	},
	
	build: function( params ) {
		$MTD.log( this.ownerString() + ' > .build() not implemented' );
	}
	
});

jQuery.fn.extend( {

	component: function() {
		return $MTD.UIComponentManager.resolve( this.attr( 'id' ) );
	}
	
});

//mtd.touch.core.js file starts here

/**
 * 
 * Find more about the MTD Touch Library function at
 * http://api.mutado.com/mobile
 *
 * Copyright (c) 2010 Mutado Mobile, http://mutado.com/mobile
 * Released under MIT license
 * http://api.mutado.com/mobile/shared/license
 * 
 * Version 1.0.0 - Last updated: 2010.11.03
 * 
 */
 
 
/**
 * MTDTouchScroll Component
 * -----------------------------------------------------------
 */

$MTD.TouchHScroll = $.klass( $MTD.UIComponent, {
	
	WRAPPER_CLASS: 'mtdtouch-scroll-wrapper',
	PAGER_WRAPPER_CLASS: 'mtdtouch-scroll-pager-wrapper',
	PAGER_CLASS: 'control',
	
	items: 0,
	horizontal: true,
	paging: true,
	friction: 0.33,
	duration: 400,
	offset: 0,
	limit: 0.1,
	position: 0,
	width: 0,
	height: 0,
	pointer: 0,
	movePointer: 0,
	point: { x: 0, y: 0 },
	timer: 0,
		
	build: function( params ) {
		
		if ( params ) {
			if ( params.offset ) {
				this.offset = params.offset;
			}
			if ( params.duration ) {
				this.duration = params.duration;
			}
		}
		
		this.paging = this.hasPaging();	
		this.horizontal = this.directionHorizontal();	
		
		$( this.element ).append( '<div class="' + this.WRAPPER_CLASS + '"></div>' );
		
		var original = this.ownerString() + ' > ul';
		var div = this.wrapper();
		var ul = this.ul();
		var li = this.li();
		var w = $( this.element ).outerWidth();
		var h = $( this.element ).outerHeight();
		var offset = this.offset;
		
		$( div ).css( 'float', 'left' );
		$( div ).width( w + 'px' );
		$( div ).height( h + 'px' );
		$( div ).append( $( original ) );
		
		var pos = this.position;
		var c = this.items;		
		var hor = this.horizontal;
		$( li ).each( function( index ) {
			
			$( this ).css( 'float', 'left' );
			$( this ).css( 'width', w + 'px' );
			$( this ).css( 'height', h + 'px' );			
			$( this ).css( 'text-align', 'center' );
			$( this ).css( 'padding', '0' );
			$( this ).css( 'margin', '0' );
			$( this ).css( 'margin-right', offset + 'px' );			
			$( this ).css( 'margin-bottom', offset + 'px' );
			pos += ( hor ? w : h ) + offset;
			c++;
		});
				
		this.items = c;
		this.width = w;
		this.height = h;
		this.position = pos;
		
		$( ul ).css( 'list-style', 'none' );
		$( ul ).css( 'position', 'relative' );
		$( ul ).css( 'padding', '0' );
		$( ul ).css( 'margin', '0' );
		
		if ( this.horizontal ) {
			$( ul ).css( 'width', this.position + 'px' );
			$( ul ).css( 'height', h + 'px' );
		} else {
			$( ul ).css( 'width', w + 'px' );
			$( ul ).css( 'height', this.position + 'px' );
		}
		
		$( div ).css( 'overflow-x', 'hidden' );
		$( div ).css( 'overflow-y', 'hidden' );
		
		if ( this.paging ) {
			this.createPager();
		}
		
		window.setTimeout( $MTD.delegate( this, this.scrollTo, 0 ), 100 );
	},
	
	wrapper: function() {
		return this.ownerString() + ' > .' + this.WRAPPER_CLASS;
	},
	
	ul: function() {
		return this.wrapper() + ' > ul';
	},
	
	li: function() {
		return this.ul() + ' > li';
	},
		
	hasPaging: function() {
		return true;
	},
	
	directionHorizontal: function() {
		return true;
	},
	
	createPager: function() {
		$( this.element ).append( '<div class="' + this.PAGER_WRAPPER_CLASS + '"><div class="' + this.PAGER_CLASS +'"></div></div>' );
		var pagerWrapper = this.ownerString() + ' > .' + this.PAGER_WRAPPER_CLASS;
		var pager = pagerWrapper + ' .' + this.PAGER_CLASS;
		// wrapper
		$( pagerWrapper ).css( 'position', 'relative' );
		if ( this.horizontal ) {
			$( pagerWrapper ).css( 'top', '100%' );
		}		
		$( pagerWrapper ).css( 'width', this.width );
		
		// content;
		$( pager ).css( 'position', 'absolute' );
		
		if ( this.horizontal ) {
			$( pager ).css( 'bottom', '0' );
			$( pager ).css( 'width', this.width );
		} else {
			$( pager ).css( 'left', '0' );
			$( pager ).css( 'height', this.height );
		}
		
		$( pager ).append( '<ul></ul>' );
		$( pager ).css( 'text-align', 'center' );
		
		var ul = $( pager + ' > ul' );
		$( ul ).css( 'list-style', 'none' );
		$( ul ).css( 'position', 'absolute' );
		$( ul ).css( 'margin-top', '90px' );
		
		for ( var i = 0; i < this.items; i++ ) {
			$( ul ).append( '<li></li>' );	
		}
		
		var li = $( pager + ' > ul > li' );
		var ref = this;
		$( li ).each( function( index ) {
			if ( ref.horizontal ) {
				$( this ).css( 'float', 'left' );
			}
			$( this ).click( $MTD.delegate( ref, ref.scrollTo, index ) );
		});
		
		if ( this.horizontal ) {
			$( ul ).css( 'margin-left', ( this.width * 0.5 - $( ul ).innerWidth() * 0.5 ) + 'px' );
		} else {
			$( ul ).css( 'margin-top', ( this.height * 0.5 - $( ul ).innerHeight() * 0.5 ) + 'px' );
		}

	},	
	
	updatePager: function() {
		var pager = this.ownerString() + ' > .' + this.PAGER_WRAPPER_CLASS + ' > .' + this.PAGER_CLASS;
		var li = $( pager + ' > ul > li' );
		$( li ).each( function( index ) {
			$( this ).removeClass( 'selected' );
		});
		$( li ).eq( this.pointer ).addClass( 'selected' );
	},
	
	scrollTo: function( index ) {
		var ul = this.ul();
		$( ul ).css( '-webkit-transition-duration', this.duration + 'ms' );
		
		if ( this.horizontal ) {
			$( ul ).css( '-webkit-transform', 'translate3d(-' + ( this.width + this.offset ) * index + 'px, 0px, 0px)' );
		} else {
			$( ul ).css( '-webkit-transform', 'translate3d(0px, -' + ( this.height + this.offset ) * index + 'px, 0px)' );
		}
		
		window.setTimeout( $MTD.delegate( this, this.scrollToCompleted, ( this.pointer != index ) ), this.duration );
		this.pointer = this.movePointer = index;
		if ( this.paging ) {
			this.updatePager();
		}
	},
		
	scrollToCompleted: function( changed ) {
		var ul = this.ul();
		$( ul ).css( '-webkit-transition-duration', '0ms' );
		if ( changed ) {
			this.notify( 'changed', this.pointer );
		}
	},
	
	touchesBegan: function( e ) {
		clearTimeout(tid);
		this.point = this.parseTouchesEvent( e );
		var d = new Date();
		this.timer = d.getTime();
	},
	
	touchesMoved: function( e ) {
		var p = this.parseTouchesEvent( e );
		if ( this.dragVertical && this.horizontal ) {
			return;
		}
		if ( this.dragHorizontal && !this.horizontal ) {
			return;
		}
		if ( this.dragHorizontal && this.horizontal ) {
			e.preventDefault();
		}
		if ( this.dragVertical && !this.horizontal ) {
			e.preventDefault();
		}
		
		var dx = this.point.x - p.x;
		var dy = this.point.y - p.y;
		
		var tpx = - ( ( this.width + this.offset ) * this.pointer ) - dx;
		var tpy = - ( ( this.height + this.offset ) * this.pointer ) - dy;
		
		if ( tpx > 0 || tpx < - ( ( this.width + this.offset ) * ( this.items - 1 ) ) ) {
			dx *= this.friction;
		}
		if ( tpy > 0 || tpy < - ( ( this.height + this.offset ) * ( this.items - 1 ) ) ) {
			dy *= this.friction;
		}
		
		var nx = - ( ( this.width + this.offset ) * this.pointer ) - dx;
		var ny = - ( ( this.height + this.offset ) * this.pointer ) - dy;
		
		var i;
		var can = false;
		
		if ( this.horizontal ) {
			can = Math.abs( dx ) / this.width > this.limit;
			i = this.pointer + ( can ? ( dx > 0 ? 1 : -1 ) : 0 );
		} else {
			can = Math.abs( dy ) / this.height > this.limit;
			i = this.pointer + ( can ? ( dy > 0 ? 1 : -1 ) : 0 );
		}
		 
		this.movePointer = Math.min( Math.max( 0, i ), this.items - 1 );
		
		var ul = this.ul();
		if ( this.horizontal ) {
			$( ul ).css( '-webkit-transform', 'translate3d(' + nx + 'px, 0px, 0px)' );
		} else {
			$( ul ).css( '-webkit-transform', 'translate3d(0px, ' + ny + 'px, 0px)' );
		}
		
	},
	
	touchesEnded: function( e ) {
		var d = new Date();
		var speed = d.getTime() - this.timer;
		this.scrollTo( this.movePointer );
	},
	
	next: function() {
		this.scrollTo( Math.min( this.pointer + 1, this.items - 1 ) );
	},
	
	prev: function() {
		this.scrollTo( Math.max( this.pointer - 1, 0 ) );
	},
	
	first: function() {
		this.scrollTo( 0 );
	},
	
	last: function() {
		this.scrollTo( this.items - 1 );
	},
	
	count: function() {
		return this.items;
	}
		
});

$MTD.TouchVScroll = $.klass( $MTD.TouchHScroll, {
		
	directionHorizontal: function() {
		return false;
	}
			
});

$MTD.TouchHScrollNoPaging = $.klass( $MTD.TouchHScroll, {
		
	hasPaging: function() {
		return false;
	}
				
});

$MTD.TouchVScrollNoPaging = $.klass( $MTD.TouchHScroll, {
		
	hasPaging: function() {
		return false;
	},
	
	directionHorizontal: function() {
		return false;
	}
			
});

jQuery.fn.extend( {

	MTDTouchHScroll: function( params ) {
		$( this ).attach( $MTD.TouchHScroll, params );
	},
	
	MTDTouchVScroll: function( params ) {
		$( this ).attach( $MTD.TouchVScroll, params );
	},
	
	MTDTouchHScrollNoPaging: function( params ) {
		$( this ).attach( $MTD.TouchHScrollNoPaging, params );
	},
	
	MTDTouchVScrollNoPaging: function( params ) {
		$( this ).attach( $MTD.TouchVScrollNoPaging, params );
	}
	
});

(function(){
    //remove layerX and layerY
    var all = $.event.props,
    len = all.length,
    res = [];
    while (len--) {
      var el = all[len];
      if (el != 'layerX' && el != 'layerY') res.push(el);
    }
    $.event.props = res;
}());

//html script
var tid;
function scrollCallback( index ) {
	clearTimeout(tid);
	tid = setTimeout(function() {if (index=="2") { $MTD('#screens').first(); }
	else {$MTD( '#screens' ).next();}}, 5000);

	$("ul.bg li").removeClass();
	var numba = index+""-1;
	if (numba == "2") { numba2 = "0"}
	else { var numba2 = parseInt(numba)+1; } 
	var num = "bg"+numba2+"";

	$("ul.bg li").eq(numba2).addClass("opaque");
}

function testCSS(prop) {
    return prop in document.documentElement.style;
}

$(document).ready(function() {

var isWebKit = testCSS('WebkitTransform');

if (isWebKit){ 
	var index = "0"
	tid = setTimeout(scrollCallback(index), 5000);
	$( '#screens' ).MTDTouchHScroll( { offset: 0 } );
	$MTD( '#screens' ).bind( 'changed', scrollCallback);
}

else {	
	tid = setTimeout(clickedOn, 5000);
	$("ul.control").removeClass("control");
	$("#iphone ul").addClass("firefox");
	$("#controls").on('click', 'li', function() {
		clearTimeout(tid);
		$("ul.firefox li").removeClass("opaque");
		$("ul.bg li").removeClass();
		
		var newImage = "0"
		var newImage = $(this).index();
		var num = "bg"+newImage+"";
		
		$("ul.firefox li").eq(newImage).addClass("opaque");
		$("ul.bg li").eq(newImage).addClass("opaque");
		
		$("#controls li").removeClass("active");
		$(this).addClass("active");
		tid = setTimeout(clickedOn, 5000);
	});
	}
});
function clickedOn() {
	clearTimeout(tid);
	var newImage = $("ul.firefox li.opaque").index();
	$("ul.firefox li").removeClass("opaque");
	$("ul.bg li").removeClass();
	var numba = newImage+"";
	if (numba == "2") { numba2 = "0"}
	else { var numba2 = parseInt(numba)+1; } 
	var num = "bg"+numba2+"";
	
	$("ul.firefox li").eq(numba2).addClass("opaque");
	$("ul.bg li").eq(numba2).addClass("opaque");
	
	$("#controls li").removeClass("active");
	$("#controls li").eq(numba2).addClass("active");
	tid = setTimeout(clickedOn, 5000);
}
