/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * 20180808 | Fisa | Add | 將料號貼在製程料號上，系統自動後將該料號說明(display name)寫入下方[名稱]裡
 */
define(['N/record','N/search','./colorteam_CommonUtil','N/runtime','N/format'],
function(record,search,util,runtime,format) {

    function saveRecord(context)
	{
    	var cr = context.currentRecord;
		var projectId = cr.getValue({ "fieldId": "company" });

    	/********************************** 2018.6.1 檢查[說明描述]是否和Project上的備註一樣 **********************************/
    	var pt_remark = cr.getValue({ "fieldId": "custevent_project_memo" });

    	// 若為空值，才從Project上複製備註填入custevent_project_memo
    	if( !pt_remark ) {
    		
        	if( projectId ) {
				var pRec = getProjectObj(projectId)
            	var remark = pRec.getValue({ "fieldId": "custentity_remark" }); // Project備註
            	cr.setValue("custevent_project_memo", remark);
        	}
    	}
		
		/********************************** 2018.8.10 事業單位 **********************************/
    	var class_company = cr.getValue({ "fieldId": "custevent_company" });
    	if( !class_company )
		{
        	if( projectId ) {
				var pRec = getProjectObj(projectId)
            	var company = pRec.getValue({ "fieldId": "custentity_company" }); // 事業單位
            	cr.setValue("custevent_company", company);
        	}
    	}

    	/********************************** 2018.5.23 將份數寫到所有子階 **********************************/
    	// var parent = cr.getValue({ "fieldId": "parent" });
		// var parentId = cr.id;
    	// if( !parent && parentId ) //parent為空-->父階
		// {
			// var parentQuantity = cr.getValue({ "fieldId": "custevent_parent_quantity" });
    		// search.create({
                // // "type": "item",
				// "type": "projecttask",
                // "filters": [['parent', 'is', parentId]],
				// "isPublic": true
            // })
			// .run().each(function(result) {
				// var objChildRecord = record.load({
		    		// type: record.Type.PROJECT_TASK,
			        // id: result.id
			    // });

				// objChildRecord.setValue({
					// fieldId: 'custevent_parent_quantity',
					// value: parentQuantity
				// });

				// objChildRecord.save();
				// return true;
			// });
    	// }
    	
    	return true;
    }
	
	// 20180808 將料號貼在製程料號上，系統自動後將該料號說明(display name)寫入下方[名稱]裡
    function fieldChanged(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;
		
    	if (fieldId == "title")
		{
			var item_name = cr.getValue({"fieldId": "title"});
			
			// 2018.8.22 修改料號時，一併修改供dashboard貼上料號之欄位
			cr.setValue({
				fieldId: "custevent_process",
				value: item_name
			});
			
			var itemArr = util.searchItem(item_name);
			cr.setValue({
				fieldId: "custevent_item", 
				value: itemArr[0]
			});
			cr.setValue({
				fieldId: "custevent_item_desc", 
				value: itemArr[2]
			});
			cr.setValue({
				fieldId: "custevent_price", 
				value: itemArr[4] //基礎價格
			});
			
			//檢查料號於[存貨項目]是否勾選[委外項目]，有勾選的話，自動將[需要委外]打勾
			if( itemArr[1] == 11 ) //item group = 委外
			{
				cr.setValue({
					fieldId: "custevent_outsourcing", 
					value: true
				});
				
				cr.setValue({
					fieldId: "custevent_outsourcing_price", 
					value: itemArr[3] //purchaseCost
				});
				
				cr.setValue({
					fieldId: "custevent_os_process_id", 
					value: itemArr[5] //internal id
				});
			}
		}

        return true;
    }

    function pageInit(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
		
		// 隱藏[料號]欄位
		cr.getField({ fieldId: "custevent_process"}).isDisplay = false;
		
		// 2018.08.07 [專案工作] 新增時，[被指派人]為登錄者
		var user_id = runtime.getCurrentUser().id;
		var assignee = cr.getValue({ fieldId: "custevent_assignee"});
		var assign_default = cr.getValue({ fieldId: "custevent_assign_default"});
		if( assignee != user_id && assign_default != 2 )
			cr.setValue("custevent_assignee", user_id);

		// 2018.8 Fisa add 檢查[項目代碼]，如果是空的話，帶入item id
		var item_id = cr.getValue({ fieldId: "custevent_item"});
		if( !item_id )
		{
			var item_name = cr.getValue({fieldId: 'title'});
			if( item_name )
			{
				var itemInfo = util.searchItem(item_name);
				if( itemInfo[0] )
					cr.setValue("custevent_item", itemInfo[0]);
			}
		}
    }
	
	function getProjectObj(pid)
	{
		var pRecord = record.load({
			type: record.Type.JOB,
			id: pid
		});
		
		return pRecord;
	}

    return {
    	saveRecord: saveRecord,
    	fieldChanged: fieldChanged,
    	pageInit: pageInit
    };

});