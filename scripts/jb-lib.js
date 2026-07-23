var cExtendedVersion = ".4.0";
var cBase = "http://sapphire";


/**------------------------------------------------------------------------
 * timeout()
 *
 * Implement a general purpose script timer.  The timer applies a routine
 * to check for some status change.  If the status changes as desired in
 * the testFunc routine, it will return true.
 * 
 * @param limit is the number of ticks to run before failing (-1 never quits).
 * @param gran is the length (in milliseconds) of the tick.
 * @param testFunc (optional) if supplied, it will be called on each tick.  If 
 *   testFunc returns true, the runTimer method returns true, otherwise false.
 *   (note: if testFunc is not supplied, the timer returns true immediately).
 * @param onFail (optional) if supplied, it will be called after the last tick 
 *   (i.e. the timer expired before testFunc() returned true).
 * @return true if the condition in testFunc is satisfied within (limit*gran)
 *   milliseconds, otherwise false.
*/

/**------------------------------------------------------------------------
 * loadDom()
 *
 * simple load routine uses "srcName" to locate the data and returns a DOM
 * 
*/
function loadDom(srcName) {
      	var dom = new ActiveXObject ("MSXML2.DOMDocument"+cExtendedVersion);
	dom.async = false;
	dom.load(srcName);
	return dom;
}

/**------------------------------------------------------------------------
 * loadXsltTransformer()
 *
 * sets up a transformer, ready to create a processor for XSLT.
*/
function loadXsltTransformer(stylesheetName) {
	var xslt = new ActiveXObject ("MSXML2.FreeThreadedDOMDocument"+cExtendedVersion);
	xslt.async = false;
	xslt.load(stylesheetName);
	var transformer = new ActiveXObject("MSXML2.XSLTemplate"+cExtendedVersion);
	transformer.stylesheet = xslt.documentElement;
	return transformer;
}

/**------------------------------------------------------------------------
 * loadXsltProcessor()
 * 
 * first creates a transformer and then creates a processor from it.
*/

function loadXsltProcessor(stylesheetName) {
	var transformer = loadXsltTransformer(stylesheetName);
	return transformer.createProcessor();
}


/**------------------------------------------------------------------------
 * getCookieFromCredential()
 * 
 * convenience function for extracting a cookie.  MSXML specific.
*/
function getCookieFromCredential(cred){
	var err = new Error();
	var cookie="";
	var objNode;

	try{
		cred.setProperty("SelectionNamespaces", "xmlns:domain='urn:vfi-sapphire:np.domain.2001-07-01' xmlns:vs='urn:vfi-sapphire:vs.2001-10-01'");
		cred.setProperty("SelectionLanguage", "XPath");
		objNode = cred.selectSingleNode("//cookie");

		cookie = objNode.text;

	}catch(e){
		err.message = e.name + " " + e.number + " " + e.description ;
		err.name = "getCookieFromCredentialError";
		throw(err);
	}
			
	return cookie;
}
