/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/record','N/search','N/ui/dialog','N/runtime','./commonUtil','./getDestination'],
function(record,search,dialog,runtime,util,g) {

    function fieldChanged(scriptContext) {

    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;
		
		if( fieldId == "custrecord_company" )
		{
			var cid = cr.getValue({ "fieldId": "custrecord_company" });
			var address_select = cr.getField({ fieldId: "custpage_address" });
			g.getAddress_Promise("insert",cid,address_select);
		}

        return true;
    }
	
	function pageInit(context)
	{
		var cr = context.currentRecord;
		cr.getField({ fieldId: "custrecord_address" }).isDisplay = false;	
	}
	
	function saveRecord(context)
	{
		var cr = context.currentRecord;
		var addr = cr.getValue({ "fieldId": "custpage_address" });
		cr.setValue({
			fieldId: "custrecord_address",
			value: addr
		});
		return true;
	}
	
	
    return {
    	fieldChanged: fieldChanged,
		pageInit: pageInit,
		saveRecord: saveRecord
    };

});