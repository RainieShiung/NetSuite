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
		
		// 先取得複製完後的Project ID，顯示在Suitelet供使用者點選連結
		var projectRecord = record.copy({
			type: record.Type.JOB,
			id: pid,
			isDynamic: true
		});
		
		var new_projectId = projectRecord.save({
			ignoreMandatoryFields: true
		});
		
		var form = ui.createForm({
			title: "專案複製"
		});
		
		var projectLink = form.addField({
			id : 'custpage_temp_1',
			type : ui.FieldType.URL,
			label : "檢視複製完成的專案頁面"
		});
		projectLink.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		projectLink.defaultValue = util.getUrl()+"/app/accounting/project/project.nl?id="+new_projectId ;
		
		var projectLink_2 = form.addField({
			id : 'custpage_temp_2',
			type : ui.FieldType.URL,
			label : "編輯拋轉後的專案頁面"
		});
		projectLink_2.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		projectLink_2.defaultValue = util.getUrl()+"/app/accounting/project/project.nl?id="+new_projectId+"&e=T";
		
		var scheduleLink = form.addField({
			id : 'custpage_temp_3',
			type : ui.FieldType.URL,
			label : "[專案工作]持續複製中，檢視排程進度表"
		});
		scheduleLink.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		scheduleLink.defaultValue = util.getUrl()+"/app/common/scripting/scriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=47&primarykey=57" ;
		
		options.response.writePage(form);
		
		// call schedule
		var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
		scriptTask.scriptId = 47;
		scriptTask.deploymentId = 'customdeploy_copy_project';
		scriptTask.params = {
			'custscript_ori_pid': pid,
			'custscript_new_pid': new_projectId
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
