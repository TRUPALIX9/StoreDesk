function TviewerSession(){
	this.base = location.protocol +"//" + location.hostname;
	this.templates = this.base + "/templates";
	this.dom = new ActiveXObject("MSXML2.DOMDocument.4.0");
	this.dom.async = false;
	this.dom.validateOnParse = false;
	this.globals = new Globals();
	this.cred = new SapphireCredential();
	this.filename = null;
	this.period = null;

}

TviewerSession.prototype.getPdList = function(callback){
	var err = new Error();
	var cmd="/cgi-bin/CGILink?cmd=vtlogpdlist&cookie=" + this.cred.getCookie();
	this.dom.load(this.base + cmd);
/*if the parseError is non-zero there was a problem parsing the periodList*/
	if (this.dom.parseError !=0){
	//parse error occured create a error object and populate and return it
		err.name = "SessionLoadPDListParseError";
		err.description = this.dom.parseError.reason;
		err.message =	this.dom.parseError.reason;
		err.number = this.dom.parseError;
		err.srcText = this.dom.parseError.srcText;
		return callback(false, err);
	}else{
		/*else test the response and if ! error*/
		var resp = new Response(this.dom);
		if (!resp.isError){
			/*transform the periodList to html*/
			try{
		  		var proc = loadXsltProcessor(this.templates+"/vfit/tviewer/periodList.xslt");
				proc.input = this.dom;
				proc.transform();
				/*insert the html in the body*/
			}catch(e){
				proc = null;
				e.name = "SessionLoadPDListTransformError";
				return callback(false,e);
			}
			applyStyle();
			document.body.innerHTML = proc.output;
			proc = null;
			return callback(true);
		}else{
			err.description = resp.message;
			err.message = resp.message;
			err.name = "SessionLoadPDListHostError";
			return callback(false,err);
		}
	}
}
TviewerSession.prototype.transformTLog = function(){
//turn transSet into TLog and turn TLog into condensed TLog
	try{
		var proc1 = loadXsltProcessor(this.templates+"/vfit/transSet/buildTviewerDoc.xslt");
		proc1.input = this.dom;
		proc1.transform();
		this.dom.loadXML(proc1.output);
		if (this.dom.parseError !=0){
			var err = new Error();
			//parse error occured create a error object and populate and return it
			err.name = "SessionTransformTlogParseError";
			err.description = this.dom.parseError.reason;
			err.message =	this.dom.parseError.reason;
			err.number = this.dom.parseError;
			err.srcText = this.dom.parseError.srcText;
			proc1 = null;
			throw(err);
		}
	}catch(e){
		proc1 = null;
		e.name = "SessionTLogTransformError";
		throw(e);
	}


}

TviewerSession.prototype.createContent = function(){
	try{
		var proc = loadXsltProcessor(this.templates+"/vfit/tviewer/buildTviewerContent.xslt");
		proc.input = this.dom;
		proc.transform();
	}catch(e){
		proc = null;
		e.name = "SessionCreateContentError"; 
		throw(e);
	}
	/*insert the html in the body*/

	document.getElementById('content').innerHTML = proc.output;
	proc = null;

}

TviewerSession.prototype.createSearch = function(){
	try{
		var proc = loadXsltProcessor(this.templates+"/vfit/tviewer/buildTviewerSearch.xslt");
		proc.input = this.dom;
		proc.transform();
	}catch(e){
		proc = null;
		e.name = "SessionCreateSearchError"; 
		throw(e);
	}
	/*insert the html in the body*/

	document.getElementById('search').innerHTML = proc.output;
	proc = null;
	search.initSearch();

}
TviewerSession.prototype.loadTlog = function(callback){
	var err = new Error();
//fetch the TLog from Sapphire and load into this.dom
	var cmd = "/cgi-bin/CGILink?cmd=" + this.cmdType + "&filename="+this.filename+"&period="+this.period+"&cookie="+this.cred.getCookie();
	this.dom.load(this.base + cmd);

	if (this.dom.parseError !=0){
	//parse error occured create a error object and populate and return it
		err.name = "SessionLoadTlogParseError";
		err.description = this.dom.parseError.reason;
		err.message =	this.dom.parseError.reason;
		err.number = this.dom.parseError;
		err.srcText = this.dom.parseError.srcText;
		return callback(false, err);
	}else{
		/*else test the response and if !error*/
		var resp = new Response(this.dom);
		if (!resp.isError){
		//transform the T-Log to the condensed version
			this.globals.setGlobalCursor("wait","transforming TLog Data...");
			try{
				this.transformTLog();
				this.createSearch();
				this.createContent();
			}catch(e){
				return callback(false,e);
			}
			return callback(true);
		}else{
		//error doc received
			err.description = resp.message;
			err.message = resp.message;
			err.name = "SessionLoadTlogHostError";
			return callback(false,err);
		}
	}

	return callback(true);
}

TviewerSession.prototype.getTlog = function(fn, prd){
	this.filename = fn;
	this.period = prd;
	var cb = function(rval,err){
		if(!rval){
		//display some sort of error message
			processException(err, "session.getTlog");
			session.globals.setGlobalCursor("auto","");
		}else{
		/*else set the cursor back to default*/
			session.globals.setGlobalCursor("auto","");
		}
	}
	this.clearContents();
	session.globals.setGlobalCursorJump("wait","loading TLog Data...","session.loadTlog("+cb+")", 800);

}
TviewerSession.prototype.getCookie = function(callback){
	this.cred.setUser(document.signIn.user.value);
	this.cred.setPasswd(document.signIn.passwd.value);
	this.cred.setBase(this.base);
	try{
		this.cred.getCredential();
		
// BEGIN-----THIS IS REQUIRED FOR CHANGE PASSWORD FUNCTIONALITY!
//add code to test for expired password
		if (this.cred.testForExpiredPasswd()) {
			alert("Password has expired you will be redirected to the change password page at " +this.cred.base + "/ChangePassword" + " to change your password and then returned to this page to log in with your new password. You may be prompted that the webpage you are viewing is trying to close the window. If prompted, PLEASE click YES.");
			window.open (this.cred.base + "/ChangePasswd");			
			return callback(false);
		}else{
			this.cmdType = this.cred.getReptCmdType();
			return callback(true);
		}
// END-----THIS IS REQUIRED FOR CHANGE PASSWORD FUNCTIONALITY!
		this.cmdType = this.cred.getReptCmdType();
		return callback(true);
	}catch(e){
		processException(e,"session.getCookie");
		return callback(false);
	}

}
TviewerSession.prototype.clearContents = function(){
	document.getElementById('content').innerHTML = "";
	document.getElementById('status').innerHTML = "";
}

