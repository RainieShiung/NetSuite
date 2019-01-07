/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record','N/search','./colorteam_CommonUtil','N/task','N/ui/serverWidget'],
function(record, search, util, task, ui) {
	
	function onRequest(options)
	{
		var request = options.request;
		var response = options.response;
		var pid = request.parameters.pid; //接收URL傳來的參數
		var groupArr = request.parameters.groupArr; //接收URL傳來的參數
		var qArr = request.parameters.qArr; //接收URL傳來的參數
		
		var projectRecord = record.load({
			type: record.Type.JOB,
			id: pid 
		});
		var entity  = projectRecord.getValue({ fieldId: 'custentity_customer_name' });
		var company = projectRecord.getValue({ fieldId: 'custentity_company' });
		var shippingMethod = projectRecord.getValue({ fieldId: 'custentity_delivery_method' })[0];
		var shipTo = projectRecord.getValue({ fieldId: 'custentity_ship_address' });
		
		// 先取得複製完後的Sales Order ID，顯示在Suitelet供使用者點選連結
		var soRecord = record.create({
			type: record.Type.SALES_ORDER ,
			isDynamic: true
		});
		soRecord.setValue({
			fieldId: 'entity',
			value: entity
		});
		
		soRecord.setValue({
			fieldId: 'class',
			value: company
		});
		
		soRecord.setValue({
			fieldId: 'shipmethod',
			value: shippingMethod
		});
		
		soRecord.setValue({
			fieldId: 'custbody_from_project',
			value: pid
		});
		
		soRecord.setValue({
			fieldId: 'job',
			value: pid
		});
		
		soRecord.setValue({
			fieldId: 'shipaddress',
			value: shipTo
		});
		
		soRecord.selectNewLine({ sublistId: 'item'});
		soRecord.setCurrentSublistValue({ //ITEM
			sublistId: 'item',
			fieldId: 'item',
			value: 1378, //dummy item
			ignoreFieldChange: true
		});
		soRecord.setCurrentSublistValue({ //ITEM
			sublistId: 'item',
			fieldId: 'amount',
			value: 0
		});		
		soRecord.setCurrentSublistValue({ //tax code
			sublistId: 'item',
			fieldId: 'taxcode',
			value: '14',
			ignoreFieldChange: true
		});
		soRecord.commitLine({ sublistId: 'item' });
		
		var so_id = soRecord.save({
			enableSourcing: false,
			ignoreMandatoryFields: true
		});
		
		var form = ui.createForm({
			title: "專案拋轉銷售訂單"
		});
		
		// var soLink = form.addField({
			// id : 'custpage_temp_1',
			// type : ui.FieldType.URL,
			// label : "檢視拋轉後的銷售訂單頁面"
		// });
		// soLink.updateDisplayType({
			// displayType: ui.FieldDisplayType.INLINE
		// });
		// soLink.defaultValue = util.getUrl()+"/app/accounting/transactions/salesord.nl?id="+so_id;
		
		var soLink_2 = form.addField({
			id : 'custpage_temp_2',
			type : ui.FieldType.URL,
			label : "編輯拋轉後的銷售訂單頁面"
		});
		soLink_2.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		soLink_2.defaultValue = util.getUrl()+"/app/accounting/transactions/salesord.nl?id="+so_id+"&e=T";
		
		var scheduleLink = form.addField({
			id : 'custpage_temp_3',
			type : ui.FieldType.URL,
			label : "[銷售訂單]持續拋轉中，檢視排程進度表"
		});
		scheduleLink.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		scheduleLink.defaultValue = util.getUrl()+"/app/common/scripting/scriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=56&primarykey=63" ;
		
		options.response.writePage(form);
		
		// call schedule
		var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
		scriptTask.scriptId = 56;
		scriptTask.deploymentId = 'customdeploy_to_so';
		scriptTask.params = {
			'custscript_so_id': so_id,
			'custscript_pid': pid,
			'custscript_group': groupArr,
			'custscript_check': qArr
		};
		var scriptTaskId = scriptTask.submit();
		
		// 檢查排程是否已經COMPLETE
		// var res = task.checkStatus(scriptTaskId).status;
		// while( res != "COMPLETE" )
		// {
			// res = task.checkStatus(scriptTaskId).status;
		// }
	}
	
    return {
        onRequest: onRequest
    };
    
});
