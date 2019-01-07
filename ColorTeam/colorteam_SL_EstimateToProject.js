/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record','N/search','./colorteam_CommonUtil','N/ui/serverWidget', 'N/task'],
function(record, search, util, ui, task) {
	
    function onRequest(context)
	{
		var request = context.request;
		var response = context.response;
		
		var estimate_id = request.parameters.eid;
		var estRec = record.load({
			type: record.Type.ESTIMATE,
			id: estimate_id 
		});
			
		var customer = estRec.getValue({ fieldId: "entity"});
		var company  = estRec.getValue({ fieldId: "class"}); //事業單位
		var doc_name = estRec.getValue({ fieldId: "custbody_doc_name"});
		
		if( !customer || !company || !doc_name )
		{
			if( !customer ) util.showButtonMsg("無法拋轉","[顧客名稱]不能為空，請確認","WARNING");
			if( !company )  util.showButtonMsg("無法拋轉","[事業單位]不能為空，請確認","WARNING");
			if( !doc_name ) util.showButtonMsg("無法拋轉","[印件名稱]不能為空，請確認","WARNING");
		}
		else
		{
			// 產生PROJECT
			var projectRecord = record.create({
				type: record.Type.JOB,
				isDynamic: true 
			});

			projectRecord.setValue({
				fieldId: 'companyname',
				value: doc_name
			});

			projectRecord.setValue({
				fieldId: 'custentity_customer_name',
				value: customer
			});
			
			projectRecord.setValue({
				fieldId: 'parent', //原生customer欄位
				value: customer
			});

			projectRecord.setValue({
				fieldId: 'custentity_company',
				value: company
			});
			
			projectRecord.setValue({
				fieldId: 'custentity_from_estimate',
				value: estimate_id
			});
			
			var p = projectRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			
			// suitelet主頁面
			var form = ui.createForm({
				title: "報價單拋轉專案"
			});
			
			var projectLink = form.addField({
				id : 'custpage_temp_1',
				type : ui.FieldType.URL,
				label : "檢視拋轉後的專案頁面"
			});
			projectLink.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});
			projectLink.defaultValue = util.getUrl()+"/app/accounting/project/project.nl?id="+p;
			
			var projectLink_2 = form.addField({
				id : 'custpage_temp_2',
				type : ui.FieldType.URL,
				label : "編輯拋轉後的專案頁面"
			});
			projectLink_2.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});
			projectLink_2.defaultValue = util.getUrl()+"/app/accounting/project/project.nl?id="+p+"&e=T";

			var scheduleLink = form.addField({
				id : 'custpage_temp_3',
				type : ui.FieldType.URL,
				label : "[專案]與[專案工作]持續拋轉中，檢視排程進度表"
			});
			scheduleLink.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});
			scheduleLink.defaultValue = util.getUrl()+"/app/common/scripting/scriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=48&primarykey=58" ;
			context.response.writePage(form);
			
			// call schedule
			var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
			scriptTask.scriptId = 48;
			scriptTask.deploymentId = 'customdeploy_to_project';
			scriptTask.params = {
				'custscript_to_project_eid': estimate_id,
				'custscript_to_project_pid': p
			};
			var scriptTaskId = scriptTask.submit();
		}
    }
	
	//檢查陣列值是否重複
	function onlyUnique(value, index, self) { 
		return self.indexOf(value) === index;
	}
	
    return {
        onRequest: onRequest
    };
    
});
