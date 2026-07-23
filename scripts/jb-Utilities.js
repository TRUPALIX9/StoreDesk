function Globals() {

}

Globals.prototype.setGlobalCursor = function(cursor1,status1) {

	window.status = status1;
	window.document.body.style.cursor = cursor1;
	return true;
}

Globals.prototype.setGlobalCursorJump = function(cursor1,status1,jumpstr, timeout) {
	try{
		this.setGlobalCursor(cursor1,status1);
		window.setTimeout(jumpstr, timeout);
		return true;
	}catch(e){
		throw(e);
	}finally{
		return true;
	}
}
/*used to expand and collapse the line item detail*/
function expand(src){
	if (src.children[0].style.display == 'none'){
		src.children[0].style.display = 'block'
	}else{
		src.children[0].style.display = 'none'
	}
							
}

function name_onkeyPress(key){
	if (key==13){
	    document.signIn.passwd.focus();
	}
}

function passwd_onkeyPress(key){
	if (key==13){
		login();
	}
}

/*used to login and build the 'TViewer' window*/
function login(){
	var cb = function(rval){
		if (!rval){
			init();
		}else{
		/*go and get the period list and transform it*/
			var cb2 = function(rval,err){
				if (!rval){
					processException(err,"session.getPdList");
					init();
				}else{
				/*else set the cursor back to default*/
					session.globals.setGlobalCursor("auto","");
				}
			}
			session.globals.setGlobalCursorJump("wait","loading period list...","session.getPdList("+cb2+")",800);
		}
	}
	session.globals.setGlobalCursorJump("wait","loading credential...","session.getCookie("+cb+")", 800);
}
/*used to release the credential*/
function release(){
	session.cred.releaseCredential();
}

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
  }
  return rv;
}

function applyStyle(){
	var ver = getInternetExplorerVersion();
	if ( ver <= 8.0 ) {
		/*get the screen width and height*/
		var x = window.screen.width+"x"+window.screen.height+".css";
		/*switch on the width and height and assigne the approiate href to 
		the link element id=layoutRef*/
		var elem = window.document.getElementById('layoutRef');
		if (elem != null){
			switch(x){
				case '800x600.css':
					/*do nothing since defaul is 800x600*/
					break;
					/*intentional fall through since x is the style sheet name*/
				case '1024x768.css':
				case '1152x864.css':
					elem.setAttribute('href', './css/'+x);
					break;
				default:
					/*do nothing and leave at default since the screen size is undetermined*/
			}
		}
	} else {
		var elem = window.document.getElementById('layoutRef');
		if (elem != null){
			elem.setAttribute('href', './css/default.css');
		}
	}
}

function processException(e,where){
	var str = "";
	for (var prop in e){
		if (prop.toLowerCase() != "stack") {
			str = str + prop + ": " + e[prop] + "\n";
		}
	}
	alert(where + "\n" + str);

}
