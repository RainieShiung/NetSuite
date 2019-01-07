/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record','N/search','./colorteam_CommonUtil','./getContactInfo','N/runtime'],

function(record, search, util, g, runtime) {
	
	function execute(scriptContext)
	{
		var ori_pid = runtime.getCurrentScript().getParameter("custscript_ori_pid");
		var new_pid = runtime.getCurrentScript().getParameter("custscript_new_pid");
		
		var projectRecord = record.load({
			type: record.Type.JOB,
			id: new_pid,
			isDynamic: true
		});
		
		projectRecord.setValue({
			fieldId: 'custentity_status',
			value: '1' //狀態:尚未開始
		});
		
		projectRecord.setValue({
			fieldId: 'custentity_approve_to_so',
			value: false //清空[可拋轉銷售訂單]
		});
		
		projectRecord.setValue({
			fieldId: 'custentity_from_estimate',
			value: "" //清空[從報價拋轉]
		});
		
		//清空[指定專案工作者]
		for( var i=1 ; i<=12 ; i++ )
		{
			projectRecord.setValue({
				fieldId: 'custentity_auto_'+i,
				value: "" //清空
			});
		}
						
		projectRecord.save({
			ignoreMandatoryFields: true
		});
		
		var parentId = "";
		search.create({
			"type": "projecttask",
			"filters": [['company','is',ori_pid]]
		})
		.run().each(function(result) {

				var projectTaskRecord = record.copy({
					type: record.Type.PROJECT_TASK,
					id: result.id
				});
				
				//沒有parent，視為父階；有parent，視為子階，帶入之前的父階
				var temp_parentId = projectTaskRecord.getValue({fieldId: 'parent'});
				
				if( temp_parentId != "" ) //沒有parent，視為父階
				{
					projectTaskRecord.setValue({
						fieldId: 'parent',
						value: parentId
					});
				}
				
				projectTaskRecord.setValue({
					fieldId: 'company',
					value: new_pid
				});

				projectTaskRecord.setValue({
					fieldId: 'status',
					value: 'NOTSTART' //狀態:尚未開始
				});

				projectTaskRecord.setValue({
					fieldId: 'custevent_parent_quantity',
					value: "" //份數:清空
				});

				projectTaskRecord.setValue({
					fieldId: 'custevent_return_quantity',
					value: "" //回報數量:清空
				});
				
				projectTaskRecord.setValue({
					fieldId: 'custevent_fulfillment_quantity',
					value: "" //已出貨份數:清空
				});

				projectTaskRecord.setValue({
					fieldId: 'custevent_assignee',
					value: "" //被指派人:清空
				});
				
				projectTaskRecord.setValue({
					fieldId: 'custevent_assign_default',
					value: 1 //預設指派:預設
				});

				// projectTaskRecord.setValue({
					// fieldId: 'custevent_outsourcing',
					// value: false //需要委外:清空
				// });

				projectTaskRecord.setValue({
					fieldId: 'custevent_os_approve',
					value: false //委外核准:清空
				});

				projectTaskRecord.setValue({
					fieldId: 'custevent_os_suppiler',
					value: "" //委外供應商:清空
				});

				projectTaskRecord.setValue({
					fieldId: 'custevent_os_desc',
					value: "" //委外說明:清空
				});
					
				var new_taskId = projectTaskRecord.save({
					ignoreMandatoryFields: true
				});

				//沒有parent，視為父階，存成parentId給下個子階使用
				if( temp_parentId == "" )
				{
					parentId = new_taskId;
				}
				return true;
		});
		log.debug("複製成功:"+new_pid);
    }

    return {
        execute: execute
    };
    
});
