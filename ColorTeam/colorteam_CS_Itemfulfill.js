/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Estimate] 從[專案]:[備註]帶入估價單之[專案備註] 
 * 
 * 20180807 | Fisa | Add | item fulfillment存檔時，回寫[已出貨份數]回[專案工作]
 */
define(['N/record','N/search','N/runtime'],

function(record, search, runtime) {
	
	function saveRecord(scriptContext)
	{
		var cr = scriptContext.currentRecord;

		//抓取主要聯絡人電話/傳真
    	// var customer_id = cr.getValue({ "fieldId": "entity" });
    	// if( customer_id ) {
    		
    		// var contactSearch = search.load({
                // id: 'customsearch_main_contact_es'
            // });

    		// var filters = contactSearch.filters;
			// var mySearchFilter = search.createFilter({
				// name: 'internalid',
				// join: 'job',
				// operator: search.Operator.IS,
				// values: [customer_id] 
			// });
			// filters.push(mySearchFilter);
			// contactSearch.filters = filters;

			// contactSearch.run().each(function(result)
			// {
				// cr.setValue({
					// fieldId: 'custbody_contact_phone',
					// value: result.getValue(result.columns[3])+" ; "+result.getValue(result.columns[5])
				// });
				// cr.setValue({
					// fieldId: 'custbody_contact_fax',
					// value: result.getValue(result.columns[1])
				// });
				// cr.setValue({
					// fieldId: 'custbody_contact',
					// value: result.getValue(result.columns[2])
				// });

				// return true;
			// });
    	// }
    	
    	/**
    	 * 2018.6.1
    	 * 將發票號碼(custbody25)寫到[Sales Order]裡的[發票號碼](custbody25)
    	 */
    	var invoiceNumberValue = cr.getValue({ "fieldId": "custbody25" });
    	var so_id = cr.getValue({ "fieldId": "createdfrom" });
		var soRecord = getSalesOrder(so_id);
		
    	if( invoiceNumberValue && so_id ) {
		
			try {
				soRecord.setValue({
					fieldId: 'custbody25', //發票號碼
					value: invoiceNumberValue
				});
				soRecord.save();
			} catch(err) {
				return null;
			}
    	}
		
		// 20180807 Fisa Add 回寫[已出貨份數]回[專案工作]
		var numLines = cr.getLineCount({
			sublistId: 'item'
		});
		
		for(var i=0 ; i<numLines ; i++)
		{
			var item = cr.getSublistValue({
				sublistId: 'item',
				fieldId: 'item',
				line: i
			});
			
			var q = cr.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: i
			});
			
			var taskId = cr.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_include_project_task',
				line: i
			});
			
			console.log("taskId:"+taskId);
			
			var taskRecord = record.load({
				type: record.Type.PROJECT_TASK,
				id: taskId
			});
			
			var returnQuantity = taskRecord.getValue({ fieldId: 'custevent_return_quantity' });
			var newQuantity = ( q / returnQuantity ); //已出貨份數
			console.log("newQuantity:"+newQuantity);
			
			var oldQuantity = taskRecord.getValue({ fieldId: 'custevent_fulfillment_quantity' });
			
			var parent = taskRecord.getValue({ fieldId: 'parent' });
			var parentRecord = record.load({
				type: record.Type.PROJECT_TASK,
				id: parent
			});
			
			var r = ( oldQuantity + newQuantity );
			console.log("parent:"+parent+" , "+r);
			
			parentRecord.setValue({
				fieldId: 'custevent_fulfillment_quantity', //已出貨份數
				value: r
			});
			parentRecord.save();
		}
		
		// 2018.08.10 出貨單的經辦人自動帶入登錄者
		var user_id = runtime.getCurrentUser().id;
		var puser = cr.getValue({ fieldId: "custbody_user"});
		if( puser != user_id )
			cr.setValue("custbody_user", user_id);
		
		return true;
	}
	
	function getSalesOrder(so_id)
	{
		var soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: so_id
		});
		
		return soRecord;
	}
	
    return {
    	saveRecord: saveRecord
    };
    
});
