function SapphireCredential(){
	this.dom = new ActiveXObject("MSXML2.DOMDocument" + cExtendedVersion);
}

SapphireCredential.prototype.getCredential = function(){
	var e = new Error();
	var objNode;

 	/* first check for username and passwd*/
 	if (this.test == null && this.user == "" || this.passwd == ""){
		e.description = "No username or passwd";
 		e.message = "No username or passwd";
 		e.name = "SystemCredentialError";
		throw (e);
				
	}else{
	/*get the credential / cookie */
		this.dom.async = false;
		if (this.test == null) {
			this.dom.load(this.base + "/cgi-bin/CGILink?cmd=validate&user=" + encodeURIComponent(this.user) + "&passwd=" + encodeURIComponent(this.passwd));

			if (this.dom.parseError != 0){
				e.name = "SystemCredentialParseError";
				e.description = this.dom.parseError.reason;
				e.message =	this.dom.parseError.reason;
				e.number = this.dom.parseError;
				e.srcText = this.dom.parseError.srcText;
				throw (e);	
			}
		}
		else {
			this.dom.load(shell.CurrentDirectory + "//" + this.test);
		}
		var resp = new Response(this.dom);
		if (!resp.isError) {
			this.dom.setProperty("SelectionNamespaces", "xmlns:domain='urn:vfi-sapphire:np.domain.2001-07-01' xmlns:vs='urn:vfi-sapphire:vs.2001-10-01'");
			this.dom.setProperty("SelectionLanguage", "XPath");
			objNode = this.dom.selectSingleNode("//cookie");
		
			if(objNode == null){
				e.description = this.dom.xml.substring(0,200);
				e.message = this.dom.xml.substring(0,200);
				e.name = "SystemCredentialResponseError";
				throw(e);	
			}else{
				this.cookie = objNode.text;
				this.credential = this.dom;      	
				return this.credential;
			}
		}
		else {
			e.description = resp.message;
			e.message = resp.message;
			e.name = "SystemCredentialHostError";
			throw (e);
		}
	}
}

SapphireCredential.prototype.reloadCredential = function(){

	var e = new Error();
	
	/*refresh the credential*/
	if(this.cookie == ""){	
		/*check to see if the credential is present and if so get the cookie from it since they 
		may have just munched the cookie*/
		if(this.credential != null){
			try{
				this.cookie = getCookieFromCredential(this.credential);
			}catch(err){
				throw (err);
			}

		}else{
		/*they munched the cookie so throw an exception*/	
			e.message = "No cookie to reload credential";
 			e.name = "SystemCredentialError";
			throw (e);
		}
	}
	
	/*get the credential / cookie */
	this.dom.async =false;
	this.dom.load(this.base + "/cgi-bin/CGILink?cmd=ufunctionlist&cookie=" + this.cookie);
	if (this.dom.parseError != 0){
		e.message = "Error parsing credential: " + this.dom.parseError;
		e.name = "SystemCredentialError";
		throw (e);	
	}
		
	this.dom.setProperty("SelectionNamespaces", "xmlns:domain='urn:vfi-sapphire:np.domain.2001-07-01' xmlns:vs='urn:vfi-sapphire:vs.2001-10-01'");
	this.dom.setProperty("SelectionLanguage", "XPath");
	objNode = this.dom.selectSingleNode("//cookie");
	
	if(objNode == null){
		e.message = this.dom.text;
		e.name = "SystemCredentialError";
		throw(e);	
	}else{
		this.cookie = objNode.text;
		this.credential = this.dom;      	
		return this.credential;
	}

  
}

SapphireCredential.prototype.releaseCredential = function(){
	if (this.test != null)
		return this.dom;

	var e = new Error();	
	/*check to see if the cookie is set*/
	if(this.cookie == ""){	
	/*check to see if the credential is present and if so get the cookie from it since they 
	may have just munched the cookie*/
		if(this.credential != null){
			try{
				this.cookie = getCookieFromCredential(this.credential);
			}catch(err){
				throw (err);
			}

		}else{
			/*they munched the cookie so throw an exception*/	
			e.message = "No cookie to release credential";
 			e.name = "SystemCredentialError";
			throw (e);
		}
	}

	/*release the credential*/
	this.dom.async =false;
	this.dom.load(this.base + "/cgi-bin/CGILink?cmd=releaseCredential&cookie=" + this.cookie);
	
	if (this.dom.parseError != 0){
		e.message = "Error releasing credential: " + this.dom.parseError;
		e.name = "SystemCredentialError";
		throw (e);
	}

	return this.dom;

}

SapphireCredential.prototype.setCookie = function(cookie){

	this.cookie = cookie;
}

SapphireCredential.prototype.getCookie = function(){
	return this.cookie;
}

SapphireCredential.prototype.setUser = function(user){
	this.user = user;
}

SapphireCredential.prototype.getUser = function(){
	return this.user;
}

SapphireCredential.prototype.setPasswd = function(passwd){
	this.passwd = passwd;
}

SapphireCredential.prototype.getPasswd = function(){
	return this.passwd;
}

SapphireCredential.prototype.setBase = function(base){
	this.base = base;
}

SapphireCredential.prototype.getBase = function(){
	return this.base;
}

SapphireCredential.prototype.testForExpiredPasswd = function(){
	this.dom.setProperty("SelectionNamespaces", "xmlns:domain='urn:vfi-sapphire:np.domain.2001-07-01' xmlns:vs='urn:vfi-sapphire:vs.2001-10-01'");
	this.dom.setProperty("SelectionLanguage", "XPath");
	if((this.dom.selectSingleNode("//passwd/@expire").text = true) && (this.dom.selectSingleNode("//passwd/@days").text <= 0) ){
		return true;
	}else{
		return false;
	}

}

SapphireCredential.prototype.getReptCmdType = function(){
var err = new Error();
	err.message = "No permission for accessing period reports";
	err.number = -1;
	err.description = this.user + " does not have permission to access TransactionSet data";
	if (this.dom.selectSingleNode("//FunctionCmd[.='vtransset']") != null){
		return "vtransset";
	}else if (this.dom.selectSingleNode("//FunctionCmd[.='vtranssetz']") != null){
		return "vtranssetz";
	}else{
		throw err;
	}
}

