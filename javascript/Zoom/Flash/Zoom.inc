<script type="text/javascript">AC_FL_RunContentZoom = 0;</script>
<script src="/fotoweb/Tools/Zoom/Flash/Zoom.js" type="text/javascript"></script>

<script type="text/javascript">
function LJQ() {
		var sc=document.createElement('script');
		sc.type='text/javascript';
		sc.src='/documents/js/jquery/jquery-1.3.2.min.js';
		sc.id = 'scriptZIndex';
		sc.defer = 'defer';
		document.getElementsByTagName('head')[0].appendChild(sc);
		window.noConflict = true;
		window.fix_wmode2transparent_swf();
}
if(typeof (jQuery) == "undefined") {
	if (window.addEventListener) {
	  window.addEventListener('load', LJQ, false); 
	 } else if (window.attachEvent) { 
	  window.attachEvent('onload', LJQ);
	 }
}
else { // JQuery is already included
	window.noConflict = false;
	window.setTimeout('window.fix_wmode2transparent_swf()', 20);
}
window.fix_wmode2transparent_swf = function  () {
	if(typeof (jQuery) == "undefined") {
		window.setTimeout('window.fix_wmode2transparent_swf()', 20);
		return;
	}
	if(window.noConflict)jQuery.noConflict();
	// For embed
	jQuery("embed").each(function(i) {
		var elClone = this.cloneNode(true);
		elClone.setAttribute("WMode", "Transparent");
		jQuery(this).before(elClone);
		jQuery(this).remove();
	});	
	// For object and/or embed into objects
	jQuery("object").each(function (i, v) {
	var elEmbed = jQuery(this).children("embed");
	if(typeof (elEmbed.get(0)) != "undefined") {
		if(typeof (elEmbed.get(0).outerHTML) != "undefined") {
			elEmbed.attr("wmode", "transparent");
			jQuery(this.outerHTML).insertAfter(this);
			jQuery(this).remove();
		}
		return true;
	}
	var algo = this.attributes;
	var str_tag = '<OBJECT ';
	for (var i=0; i < algo.length; i++) str_tag += algo[i].name + '="' + algo[i].value + '" ';	
	str_tag += '>';
	var flag = false;
	jQuery(this).children().each(function (elem) {
		if(this.nodeName == "PARAM") {
			if (this.name == "wmode") {
				flag=true;
				str_tag += '<PARAM NAME="' + this.name + '" VALUE="transparent">';		
			}
			else  str_tag += '<PARAM NAME="' + this.name + '" VALUE="' + this.value + '">';
		}
	});
	if(!flag)
		str_tag += '<PARAM NAME="wmode" VALUE="transparent">';		
	str_tag += '</OBJECT>';
	//jQuery(str_tag).insertAfter(this);

	//jQuery(this).remove();	
	});
}
</script>

<script language="javascript">
	  if (AC_FL_RunContentZoom == 0) {
		alert("Zoom.js is missing");
	  } 
	  else {
	 
		AC_FL_RunContentZoom(
		  'codebase', 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0',
		  'width', '450',
		  'height', '450',
		  'src', 'javascript/Zoom/Flash/Zoom',
		  'quality', 'high',
		  'pluginspage', 'http://www.macromedia.com/go/getflashplayer',
		  'align', 'top',
		  'play', 'true',
		  'loop', 'true',
		  'scale', 'noscale',
		  'wmode', 'transparent',
		  'devicefont', 'false',
		  'id', 'zoom',
		  'bgcolor', '#F8F8F8',
		  'name', 'zoom',
		  'menu', 'true',
		  'allowFullScreen', 'false',
		  'allowScriptAccess','sameDomain',
		  'movie', 'javascript/Zoom/Flash/Zoom',
		  'fAction', 'fotoweb/cmdrequest/rest/Zoom.fwx',
		  'fPicture', '{{= foxToken}}',		
		  'fWidth', '{{= pixelWidth}}',
		  'fHeight', '{{= pixelHeight}}',
		  'fStartup', '/fotoweb/cmdrequest/rest/preview.fwx?f={{= foxToken2}}',
		  'fStartupSize', '450',
		  'fPreviewMaxSize', '450',
		  'fConsole', 'off',
		  'fMap', 'animate',
		  'fBgTint', '',
		  'fUrlAbout', 'http://labs.fotoware.com/news/fotoweb-zoom/',
		  'fUrlHelp', 'http://labs.fotoware.com/news/fotoweb-zoom/',
		  'fExternalTools','off',
		  'fToolPlus','loupe_plus.png',
		  'fToolMinus','loupe_minus.png',
		  'fToolMCrop','loupe_crop.png',
		  'fToolHand','hand.png',
		  'fToolReload','reload.png',
		  'fToolMap','map.png',
		  'fToolArrow','arrow.png',
		  'fToolTip','toolTip.xml',
		  'salign', 'tl'
		  ); //end AC code
	  }
	</script>		
		