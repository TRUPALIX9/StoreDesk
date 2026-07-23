function Response(dom){
	dom.setProperty("SelectionNamespaces", "xmlns:VFI='urn:vfi-sapphire:np.domain.2001-07-01' xmlns:e='urn:vfi-sapphire:np.domain.2001-07-01'");
	dom.setProperty("SelectionLanguage", "XPath");

	var xpath = null;
	this.isError = dom.selectSingleNode("//VFI:Fault") != null;
	if (this.isError) {
		var node = null;
		node = dom.selectSingleNode("//faultCode");
		if (node != null) {
			this.faultCode = node.text;
		}
		node = dom.selectSingleNode("//faultString");
		if (node != null) {
			this.faultString = node.text;
		}
		node = dom.selectSingleNode("//e:message");
		if (node != null) {
			this.message = node.text;
		}
	}
}