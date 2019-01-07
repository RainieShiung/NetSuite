/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Sales Order] 
 */
define(['N/record','./getContactInfo'],

function(record, g) {
	
	function pageInit(scriptContext) {
		
		var cr = scriptContext.currentRecord;
    	var jobValue = cr.getValue({ "fieldId": "job" });
    	var oriStartDelivery = cr.getValue({ "fieldId": "custbody_start_delivery" }); //交貨時間
    	var oriProjectMemo = cr.getValue({ "fieldId": "custbody_project_memo" }); //專案備註

    	if( jobValue ) { //job id有值再寫入交貨時間
    		var objProjectRecord = record.load({
        		type: record.Type.JOB,
    	        id: jobValue
    	    });
        	
    		// 交貨時間
        	var start_delivery = objProjectRecord.getValue({ "fieldId": "custentity_start_delivery" });
        	if( oriStartDelivery != start_delivery )
        	{
        		cr.setValue("custbody_start_delivery" ,start_delivery);
        	}
        	
        	// 專案備註
        	var projectMemo = objProjectRecord.getValue({ "fieldId": "custentity_remark" });
        	if( oriProjectMemo != projectMemo )
        	{
        		cr.setValue("custbody_project_memo" ,projectMemo);
        	}
    	}
    }
	
	function fieldChanged(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;

		// 調整[顧客]時，帶入主要聯絡人
    	if (fieldId == 'entity') {

    		var cid = cr.getValue({ "fieldId": "entity" });
			
			var contactArr = g.getPrimaryContact(cid);
			
			if( contactArr )
			{
				cr.setValue({ fieldId: 'custbody_contact',       value: contactArr[0] });
				cr.setValue({ fieldId: 'custbody_contact_title', value: contactArr[1] });
				cr.setValue({ fieldId: 'custbody_contact_phone', value: contactArr[2] });
				cr.setValue({ fieldId: 'custbody_contact_fax',   value: contactArr[3] });
				cr.setValue({ fieldId: 'custbody_contact_email', value: contactArr[4] });
				cr.setValue({ fieldId: 'custbody_contact_salutation', value: contactArr[5] });
			}
	    	
        }
        return true;

    }
    
    return {
    	pageInit: pageInit,
		fieldChanged: fieldChanged
    };
    
});
