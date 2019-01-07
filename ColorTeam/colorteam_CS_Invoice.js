/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Invoice] 從[專案]:[備註]帶入估價單之[專案備註] 
 */
define(['N/record','N/search'],

function(record, search) {
	
	function saveRecord(scriptContext) {

		var cr = scriptContext.currentRecord;
		
		//抓取Sales Order上的發票號碼(custbody25)
    	var so_id = cr.getValue({ "fieldId": "createdfrom" });
    	if( so_id ) {
			
			
			// SALES ORDER
			var soRecord = record.load({
				type: record.Type.SALES_ORDER,
				id: so_id
			});
			
			//發票號碼
			var so_invoiceNumber = soRecord.getValue({fieldId: 'custbody25'});
			
			cr.setValue("custbody25",so_invoiceNumber);
			
		}
		return true;
	}

    return {
    	saveRecord: saveRecord
    };
    
});
