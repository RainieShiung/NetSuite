/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/record','N/search','./colorteam_CommonUtil','./getContactInfo','N/runtime'],

function(record, search, util, g, runtime) {
	
	function execute(scriptContext)
	{
		var estimate_id = runtime.getCurrentScript().getParameter("custscript_to_project_eid");
		var pid = runtime.getCurrentScript().getParameter("custscript_to_project_pid");
		var estRec = record.load({
			type: record.Type.ESTIMATE,
			id: estimate_id 
		});
			
		var projectRec = record.load({
			type: record.Type.JOB,
			id: pid 
		});
		
		var customer_name = estRec.getValue({ fieldId: "entity"});
		var defaultArr = g.getProjectSelect("insert",customer_name);

		projectRec.setValue({
			fieldId: 'custentity_bill_address',
			value: defaultArr[0]
		});
		projectRec.setValue({
			fieldId: 'custentity_ship_address',
			value: defaultArr[1]
		});
		
		var contact = estRec.getValue({ fieldId: "custbody_contact"});
		projectRec.setValue({
			fieldId: 'custentity_contact',
			value: ( contact != "" ? contact : defaultArr[2] )
		});
		
		projectRec.setValue({
			fieldId: 'custentity_contact_title',
			value: estRec.getValue({ fieldId: "custbody_contact_title"})
		});
		
		projectRec.setValue({
			fieldId: 'custentity_contact_phone',
			value: estRec.getValue({ fieldId: "custbody_contact_phone"})
		});
		
		projectRec.setValue({
			fieldId: 'custentity_contact_fax',
			value: estRec.getValue({ fieldId: "custbody_contact_fax"})
		});
		
		projectRec.setValue({
			fieldId: 'custentity_contact_email',
			value: estRec.getValue({ fieldId: "custbody_contact_email"})
		});

		// 產生PROJECT TASK
		var numLines = estRec.getLineCount({
			sublistId: 'item'
		});
		
		var parentTask_id = ""; //Project Task的父階
		var parent_quantity= ""; //父階份數，子階一律帶入父階份數
		var deptArr = new Array();

		for(var i=0 ; i<numLines ; i++)
		{
			var item_type = estRec.getSublistValue({
				sublistId: 'item',
				fieldId: 'itemtype',
				line: i
			});
			
			var task_name = estRec.getSublistText({
				sublistId: 'item',
				fieldId: 'item',
				line: i
			});
			
			var kit_unit = estRec.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_kit_unit',
				line: i
			});
			
			// log.debug("loop : "+item_type+" , "+task_name+" , "+kit_unit);
			
			var itemInfo = util.searchItem(task_name);
			var _item = "";
			var _dept = "";
			var _base_price = "";
			var _os_itemid = "";
			
			if( itemInfo[0] != null ) _item = itemInfo[0]; //項目代碼
			if( itemInfo[1] != null ) _dept = itemInfo[1]; //指派部門
			deptArr.push(_dept);
			
			if( itemInfo[4] != null ) _base_price = itemInfo[4]; //基礎價格
			if( itemInfo[5] != null ) _os_itemid = itemInfo[5]; //委外internal id
			
			if( item_type == "Group" ) //父階
			{
				parent_quantity = estRec.getSublistValue({ //份數
					sublistId: 'item',
					fieldId: 'quantity',
					line: i
				});
				
				var ptObj = new util.ProjectTask(task_name, pid, parent_quantity, kit_unit, _item, _dept, _base_price, parent_quantity);
				parentTask_id = ptObj.createProjectTask();
			}
			else if ( item_type != "EndGroup") //子階:群組末尾不用秀
			{
				var ptObj = new util.ProjectTask(task_name, pid, "", kit_unit, _item, _dept, _base_price, parent_quantity);
				var taskid = ptObj.createProjectTask(parentTask_id);
			}
		}
		
		//2018.08.27寫入item的指派部門到專案[製程代碼]
		var uniqueArr = deptArr.filter( onlyUnique );
		var uniqueArr_new = "";
		uniqueArr.forEach(function(item, index, array) {
			uniqueArr_new[index] = item;
		});
		
		projectRec.setValue({
			fieldId: 'custentity_process_id',
			value: uniqueArr_new
		});
		
		projectRec.save({
			enableSourcing: true,
			ignoreMandatoryFields: true
		});
    }
	
	//檢查陣列值是否重複
	function onlyUnique(value, index, self) { 
		return self.indexOf(value) === index;
	}

    return {
        execute: execute
    };
    
});
