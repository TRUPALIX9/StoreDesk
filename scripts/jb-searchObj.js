function searchObject(){
	this.registerSearch = "all";
	this.cashierSearch = "all";
	this.searchBy = "allTrans";
	this.criteria = null;
	this.previousSelect = null;
	this.XPathString = null;
	this.counter = null;
	this.arr = null;
	this.formCriteria = null;
	this.activeSearch = false;
	this.printObj = new printObject();
	this.filterText="";
}

searchObject.prototype.setRegister = function(reg){
	this.registerSearch = reg;
}

searchObject.prototype.setCashier = function(csh){
	this.cashierSearch = csh;
}

searchObject.prototype.setSearchBy = function(list, srchBy){
	this.searchBy = srchBy;
	this.hideUnHide(list);

}

searchObject.prototype.setCriteria = function(crit){
	this.criteria = crit;
}
/*used to build a XPath Query to apply against the session DOM and return a nodeset of 
transactions*/
searchObject.prototype.search = function(frmCrit){
	//test the activeSearch flag if set return
	if (this.activeSearch == true){
		return;
	}

	this.formCriteria = frmCrit;
	var cb = function(rval){
		if(!rval){
			alert("No transactions found that match the query.");
			document.getElementById('status').innerHTML = "<center>Record 0 of 0</center>";
		}else{
		//update the status to indicate the number of matches found
		}
		search.activeSearch = false;
		session.globals.setGlobalCursor("auto","done");
	}
	this.activeSearch = true;
	session.globals.setGlobalCursorJump("wait","searching....","search.searchDom("+cb+")",800);

}
searchObject.prototype.searchDom = function(callback){
/*build the query to search the dom with*/
	this.reSet();
	if (this.buildXPath() == false){
		return callback(true);
	}
/*query the session.dom for a set of matches*/
	session.dom.setProperty("SelectionNamespaces", "xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:t='urn:vfi-sapphire:tlog.2003-06-27' xmlns:base='urn:vfi-sapphire:base.2001-10-01' xmlns:vs='urn:vfi-sapphire:vs.2001-10-01' xmlns:tv='urn:vfi-tviewer:vt.2004-07-27'");
	session.dom.setProperty("SelectionLanguage", "XPath");
//alert("XPath for search: " + this.XPathString);
//alert("size of DOM: " + session.dom.xml.length);
	var ns = session.dom.selectNodes(this.XPathString);
//alert("node set length: " + ns.length);
	this.arr = null;
	if (ns.length != 0){
		this.arr = new Array();
		for(var x = 0; x < ns.length; x++){
			var n = ns.nextNode();
			this.arr[x] = n.selectSingleNode("./@id").nodeValue;
		}
		this.counter = 0;
		this.moveNext();
		return callback(true);
	}else{
		return callback(false);
	}

}

/*used to hide and unhide the search criteria*/
searchObject.prototype.hideUnHide = function(list){
	var x = "criteria_" + list.options[list.selectedIndex].value;
	if ((this.previousSelect != 'criteria_fuel') && 
		(this.previousSelect != 'criteria_openDep') && 
		(this.previousSelect != 'criteria_void') && 
		(this.previousSelect != 'criteria_voidLine') && 
		(this.previousSelect != 'criteria_nosale') &&
		(this.previousSelect != 'criteria_cancelSafeDrop')&&
		(this.previousSelect != 'criteria_allTrans') &&
		(this.previousSelect != 'criteria_errorCorrects') &&
		(this.previousSelect != 'criteria_priceCheckCancels') &&
		(this.previousSelect != 'criteria_refunds') &&
		(this.previousSelect != 'criteria_safeDrops') &&
		(this.previousSelect != 'criteria_safeLoans') &&
		(this.previousSelect != 'criteria_priceOver')&&
		(this.previousSelect != 'criteria_suspend')&&
		(this.previousSelect != 'criteria_discount')&&
		(this.previousSelect != 'criteria_payIn')&&
		(this.previousSelect != 'criteria_payOut')&&
		(this.previousSelect != 'criteria_prepayCancel')&&
		(this.previousSelect != 'criteria_taxExempt') && 
		(this.previousSelect != 'criteria_idCheck') &&
		(this.previousSelect != 'criteria_idCheckSkipped') &&
		(this.previousSelect != 'criteria_autoCollect') &&
		(this.previousSelect != 'criteria_autoCollectInside') &&
		(this.previousSelect != 'criteria_autoCollectOutside') &&
		(this.previousSelect != 'criteria_kiosk') &&				
		(this.previousSelect != 'criteria_kioskOrder') &&				
		(this.previousSelect != 'criteria_kioskSale') &&		
		(this.previousSelect != 'criteria_kioskVoid')){
		var elem = document.getElementById(this.previousSelect);
		elem.style.display = 'none';
	}

	switch(x){
	/*these selections display a generic text box for free form entry*/
		case 'criteria_tick':
		case 'criteria_upc':
		case 'criteria_acctNum':
		case 'criteria_pluDesc':
			elem = document.getElementById('criteria_genInput')
			elem.style.display = 'block';
			this.previousSelect = 'criteria_genInput';
			break;
	/*these selections display no extra data entry*/
		case 'criteria_openDep':
		case 'criteria_fuel':
		case 'criteria_void':
		case 'criteria_voidLine':
		case 'criteria_nosale':
		case 'criteria_cancelSafeDrop':
		case 'criteria_allTrans':
		case 'criteria_errorCorrects':
		case 'criteria_priceCheckCancels':
		case 'criteria_refunds':
		case 'criteria_safeDrops':
		case 'criteria_safeLoans':
		case 'criteria_priceOver':
		case 'criteria_suspend':
		case 'criteria_discount':
		case 'criteria_payIn':
		case 'criteria_payOut':
		case 'criteria_prepayCancel':
		case 'criteria_taxExempt':
		case 'criteria_idCheck':
		case 'criteria_idCheckSkipped':			
		case 'criteria_autoCollect':			
		case 'criteria_autoCollectInside':			
		case 'criteria_autoCollectOutside':			
		case 'criteria_kiosk':					
		case 'criteria_kioskOrder':			
		case 'criteria_kioskSale':			
		case 'criteria_kioskVoid':			
			this.previousSelect = x;
			break;
	/*these selection display dropdown boxes*/
		case 'criteria_dep':
		case 'criteria_ccType':
		case 'criteria_mop':					
			elem = document.getElementById(x);
			elem.style.display = 'block';
			this.previousSelect = x;
			break;
		default:				
	}
}
searchObject.prototype.buildXPath=function(){
	var tempStr = "Filter of: ";
	this.XPathString = "tv:tlog/*[";
	if (this.registerSearch != 'all'){
		this.XPathString += "(t:register/@sysid='"+this.registerSearch+"') and";
		tempStr += " Register =" +this.registerSearch +"<br/>"; 	
	}else{
		tempStr += "All Registers<br/>"	
	}
	if (this.cashierSearch != 'all'){
		this.XPathString += "(t:cashier/@sysid='"+this.cashierSearch+"') and";
		tempStr += "Cashier =" +this.cashierSearch +"<br/>"; 		
	}else{
		tempStr += "All Cashiers<br/>"	
	}
/*determine which criteria selector is displayed*/
	switch(this.searchBy){
/*these searches use the generic input text box*/
		case 'tick':
			this.criteria = this.formCriteria.criteria_genInput.value;
			if(this.criteria==''){
				alert("ticket number required");
				return false;
			}
			this.XPathString += "(contains(vs:transactionSeq,"+this.criteria+"))";
			tempStr += "contains Tick # " + this.criteria;
			break;
		case 'upc':
			this.criteria = this.formCriteria.criteria_genInput.value;
			if(this.criteria==''){
				alert("barcode number required");
				return false;
			}
			this.XPathString += "(lineItem[contains(upc,"+this.criteria+")])";
			tempStr += "contains UPC " + this.criteria;
			break;
		case 'acctNum':
			this.criteria = this.formCriteria.criteria_genInput.value;
			if(this.criteria==''){
				alert("account number required");
				return false;
			}
			this.XPathString += "(paylines/t:payline/t:cardInfo[contains(acct,"+this.criteria+")])";
			tempStr += "contains Acct # " + this.criteria;
			break;
		case 'pluDesc':
			this.criteria = this.formCriteria.criteria_genInput.value;
			this.XPathString += "(lineItem[contains(@pluDesc,'"+this.criteria.toLowerCase()+"')])";
			tempStr += "contains Prod Desc " + this.criteria;
			break;
/*these searches have no input*/
		case 'fuel':
			this.criteria = null;
			this.XPathString += "(@hasFuel='true')";
			tempStr += "has Fuel ";
			break;
		case 'openDep':
			this.criteria = null;
			this.XPathString += "(@hasOpenDept='true')";
			tempStr += "has Open Dept ";
			break;
		case 'void':
			this.criteria = null;
			this.XPathString += "(@isVoid='true')";
			tempStr += "is a Void Ticket";
			break;
		case 'voidLine':
			this.criteria = null;
			this.XPathString += "(@hasVoidLine='true')";
			tempStr += "has a Void Line ";
			break;
		case 'nosale':
			this.criteria = null;
			this.XPathString += "(@isNoSale='true')";
			tempStr += "is a No Sale ";
			break;
		case 'cancelSafeDrop':
			this.criteria = null;
			this.XPathString += "(@isCancelSafeDrop='true')";
			tempStr += "is a Canceled Safe Drop";
			break;
		case 'errorCorrects':
			this.criteria = null;
			this.XPathString += "(@isErrorCorrect='true')";
			tempStr += "is an Error Correct ";
			break;
		case 'priceCheckCancels':
			this.criteria = null;
			this.XPathString += "(@isPriceCheckCancel='true')";
			tempStr += "is a Price Check Cancel ";
			break;	 
		case 'refunds':
			this.criteria = null;
			this.XPathString += "(@isRefund='true')";
			tempStr += "is a refund ";
			break;
		case 'safeDrops':
			this.criteria = null;
			this.XPathString += "(@isSafeDrop='true')";
			tempStr += "is a Safe Drop";
			break;
		case 'safeLoans':
			this.criteria = null;
			this.XPathString += "(@isSafeLoan='true')";
			tempStr += "is a Safe Loan";
			break;
		case 'priceOver':
			this.criteria = null;
			this.XPathString += "(@hasPriceOver='true')";
			tempStr += "has a price over";
			break;
		case 'prepayCancel':
			this.criteria = null;
			this.XPathString += "(@isPrepayCancel='true')";
			tempStr += "is a Prepay Cancel ";
			break;
		case 'suspend':
			this.criteria = null;
			this.XPathString += "(@isSuspend='true')";
			tempStr += "is Suspended ";
			break;
		case 'discount':
			this.criteria = null;
			this.XPathString += "(@hasDiscount='true')";
			tempStr += "has a Discount";
			break;
		case 'payIn':
			this.criteria = null;
			this.XPathString += "(@isPayin='true')";
			tempStr += "is a Pay-In";
			break;
		case 'payOut':
			this.criteria = null;
			this.XPathString += "(@isPayout='true')";
			tempStr += "is a Pay-Out";
			break;
		case 'taxExempt':
			this.criteria = null;
			this.XPathString += "(@hasTaxExempt='true')";
			tempStr += "has a Tax Exempt";
			break;
		case 'idCheck':
			this.criteria = null;
			this.XPathString += "(@hasIDCheck='true')";
			tempStr += "has Id Check";
			break;
		case 'idCheckSkipped':			
			this.criteria = null;
			this.XPathString += "(@skippedIDCheck='true')";
			tempStr += "has ID Check skipped ";
			break;
		case 'autoCollect':
			this.criteria = null;
			this.XPathString += "(@hasAutoCollect='true' or @isAutoCollect='true')";
			tempStr += "is a Autocollect";
			break;
		case 'autoCollectInside':
			this.criteria = null;
			this.XPathString += "(@hasAutoCollect='true')";
			tempStr += "is a Autocollect Inside";
			break;
		case 'autoCollectOutside':
			this.criteria = null;
			this.XPathString += "(@isAutoCollect='true')";
			tempStr += "iss a Autocollect Outside";
			break;
		case 'kiosk':
			this.criteria = null;
			this.XPathString += "(@isKiosk='true' or @hasKiosk='true')";
			tempStr += "has a Kiosk Order";
			break;
		case 'kioskOrder':
			this.criteria = null;
			this.XPathString += "(@isKiosk='true' and not(@isVoid='true'))";
			tempStr += "is a Kiosk Order";
			break;
		case 'kioskSale':
			this.criteria = null;
			this.XPathString += "(@hasKiosk='true' and not(@isVoid='true') and not(@isRefund='true') and not(@isSuspend='true'))";
			tempStr += "is a Kiosk Tendered";
			break;
		case 'kioskVoid':
			this.criteria = null;
			this.XPathString += "(@isKiosk='true' and @isVoid='true')";
			tempStr += "is a Kiosk Void";
			break;
/*these searches use a dropdown box*/
		case 'dep':
			this.criteria = this.formCriteria.criteria_dep.value;
			this.XPathString += "(lineItem/t:dept/@sysid='"+this.criteria+"')";
			tempStr += "has a Dept equal to " + this.criteria;
			break;
		case 'ccType':
			this.criteria = this.formCriteria.criteria_ccType.value;
			if (this.criteria == "all") {
				this.XPathString += "(paylines/t:payline/t:cardInfo/ccName)";
			} else {
				this.XPathString += "(paylines/t:payline/t:cardInfo/ccName='"+this.criteria+"')";
			}
			tempStr += "has a CC equal to "+this.criteria;
			break;
		case 'mop':
			this.criteria = this.formCriteria.criteria_mop.value;
			this.XPathString += "(paylines/t:payline/t:mop/@sysid='"+this.criteria+"')";
			tempStr += "has a MOP equal to "+this.criteria;
			break;
		default:
		/*allTrans will fall through here*/
	}
/*the allTrans is a special case by default all transactions are displayed for all
registers and all cashiers therefore if search is clicked for all transactions a register
and/or cashier must be specified
*/
	if (this.searchBy == 'allTrans'){
 		if ((this.registerSearch=='all') && (this.cashierSearch=='all')){
 			alert("A register and/or cashier must be specified");
			return false;
		}else{
			this.XPathString = "tv:tlog/*[";
			if ((this.registerSearch != 'all') && (this.cashierSearch != 'all')){
				this.XPathString += "(t:register/@sysid='"+this.registerSearch+"') and (t:cashier/@sysid='"+this.cashierSearch+"')";
				tempStr = "Filter of: Register ="+this.registerSearch+"<br/>"+"Cashier = "+this.cashierSearch+"<br/>"+"All Transactions";
			}else if (this.cashierSearch != 'all'){
				this.XPathString += "(t:cashier/@sysid='"+this.cashierSearch+"')";	
				tempStr = "Filter of: All Registers<br/>"+"Cashier = "+this.cashierSearch+"<br/>"+"All Transactions";
			}else if (this.registerSearch != 'all'){
				this.XPathString += "(t:register/@sysid='"+this.registerSearch+"')";		
				tempStr = "Filter of: Register ="+this.registerSearch+"<br/>"+"All Cashiers<br/>"+"All Transactions";
			}
		}
	}
	this.XPathString += "]";
	this.filterText=tempStr;
	return true;
}

/*used to init the serch criteria*/
searchObject.prototype.initSearch = function(){
	this.previousSelect ='criteria_allTrans';
	this.registerSearch = "all";
	this.cashierSearch = "all";
	this.searchBy = "allTrans";
	this.arr = null;

}
/*used to navigate to the next item found in the search*/
searchObject.prototype.moveNext = function(){
	if (this.arr != null){
		if (this.counter != this.arr.length){
			var e = document.getElementById(this.arr[this.counter]);
			if (e ==null){
			}else{
				e.style.backgroundColor = 'yellow';
				e.scrollIntoView();
			}
			this.counter++;
		}else{
		/*notify that they are at the end of the list and ask if they want to go back to the first
		transaction*/
			alert("reached the last transaction");
		}
		this.displayRecordCount();
	}

}
/*used to navigate to the previous item found in the search*/
searchObject.prototype.movePrev = function(){
	if (this.arr != null){
		if (!((this.counter-2) < 0)){
			var e = document.getElementById(this.arr[this.counter-2]);
			if (e ==null){
			}else{
				e.style.backgroundColor = 'yellow';
				e.scrollIntoView();
			}
			this.counter--;
		}else{
		/*notify that they are at the end of the list and ask if they want to go back to the first
		transaction*/
			alert("reached the first transaction");
		}
		this.displayRecordCount();
	}


}
searchObject.prototype.displayRecordCount = function(){
	document.getElementById('status').innerHTML = "<center>"+"Record "+(this.counter)+" of "+this.arr.length+"</center>";
}
searchObject.prototype.filter = function(frmCrit){
	if (this.activeSearch == true){
		return;
	}
	this.activeSearch = true;
	this.formCriteria = frmCrit;
/*build XPath*/
	if (this.buildXPath() == false){
		this.activeSearch = false;
		return;
	}
	var str = "resizable=yes,location=no,menubar=no,toolbar=no,status=yes" + ",width="+window.screen.width+",height="+(window.screen.height-180);
/*open the filter window*/
	window.open("filter.html",null,str);

	this.activeSearch = false;
}
searchObject.prototype.reSet = function(){
	if (this.arr != null){
		if (this.arr.length != null){
			for( var i in this.arr){
				try{
					document.getElementById(this.arr[i]).style.backgroundColor = 'white';
				}catch(e){
				}
			}
		}
	}
	document.getElementById('status').innerHTML = "";
}

searchObject.prototype.print = function(){
	this.printObj.getPrintOption();

	if (this.printObj.cancel==false){		
		if (this.printObj.all==true){
		/*print all of the contents*/
			this.printObj.openPrintWindow(document.getElementById('title').innerHTML + document.getElementById('content').innerHTML);
		}else if (this.printObj.query==true){
		/*use the array which contains the ids of the elements which match the query results
		build a string to send to the print object*/
			if (this.arr!=null){
				var str = "<table width='575'>"+document.getElementById('top').innerHTML+"</table>";
				for (var i =0; i!=this.arr.length; i++){
					str += "<table width='575'>"+document.getElementById(this.arr[i]).innerHTML+"</table>";
				}
				this.printObj.openPrintWindow(document.getElementById('title').innerHTML + str);
			}else{
				this.printObj.openPrintWindow(document.getElementById('title').innerHTML + document.getElementById('content').innerHTML);
			}
		}
	}
}