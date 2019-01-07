/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * 20180807 | Fisa | Add | 新增[指定專案工作者]功能
 * 20180808 | Fisa | Add | 儲存[帳單地址] [送貨地址] [聯絡人]
 */
define(['N/search','N/record','./getContactInfo','./colorteam_CommonUtil'],

function(search,record,g,util) {

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
    	var fieldId = scriptContext.fieldId;

		// 由下方頁籤[工單內容維護]將資料往上帶
        // 1.將客戶原件MULTIPLE SELECT轉成TEXT
    	if (fieldId == 'custentity_print_source' ||
        		fieldId == 'custentity_binding' ||
        		fieldId == 'custentity_index' ) {

    		var descStr = "";
        	var strArrayValue = cr.getText({
	    		"fieldId": fieldId
	    	});

        	for(var i=0;i<strArrayValue.length;i++){
        		descStr += strArrayValue[i] + ";";
        	}

	    	cr.setValue(fieldId+"_desc" ,descStr);
        }

    	// 2.將客戶原件SELECT轉成TEXT
    	if (fieldId == 'custentity_binding' ||
        		fieldId == 'custentity_index' ) {

    		var strValue = cr.getText({
	    		"fieldId": fieldId
	    	});

	    	cr.setValue(fieldId+"_desc" ,strValue);
        }

		// 3.合併顯示在[custentity_print_spec]中
		if (fieldId == 'custentity_print_size' ||      //合併顯示:紙張尺寸
        		fieldId == 'custentity_print_double'|| //合併顯示:單雙面/正反面
				fieldId == 'custentity_print_color' || //合併顯示:印製色彩
				fieldId == 'custentity_print_type' ) { //合併顯示:印製方式

			var specValue = cr.getValue({"fieldId": "custentity_print_spec"});
			cr.setValue("custentity_print_spec" , specValue + " " +cr.getText({"fieldId": fieldId}));
		}

    	// 將客戶名稱(custentity_customer_name)帶入原生欄位[顧客] (parent)
    	if (fieldId == 'custentity_customer_name' )
		{
        	var customerId = cr.getValue({ "fieldId": fieldId });
        	cr.setValue("parent" ,customerId);

        	var customerText = cr.getText({
	    		"fieldId": fieldId
	    	});
        	cr.setText("parent" ,customerText);
        }
		
		// 更動[客戶名稱]時，更換[帳單地址] [送貨地址] [聯絡人]選單供挑選
		if (fieldId == 'custentity_customer_name' )
		{
			var c_name = cr.getValue({ "fieldId": "custentity_customer_name" });
			var select_bill = cr.getField({ fieldId: "custpage_bill_addr" });
			var select_ship = cr.getField({ fieldId: "custpage_ship_addr" });
			var select_contact = cr.getField({ fieldId: "custpage_contact" });

			var defaultArr = g.getProjectSelect("insert",c_name,select_contact,select_bill,select_ship);
			
			var save_bill = cr.getValue({ fieldId: "custentity_bill_address"});
			var save_ship = cr.getValue({ fieldId: "custentity_ship_address"});
			var save_contact = cr.getValue({ fieldId: "custentity_contact"});
			
			cr.setValue("custpage_bill_addr" , (save_bill ? save_bill : defaultArr[0]));
			cr.setValue("custpage_ship_addr" , (save_ship ? save_ship : defaultArr[1]));
			cr.setValue("custpage_contact"   , (save_contact ? save_contact : defaultArr[2]));
		}
		

		// 新增[指定專案工作者]功能
		// if ( fieldId == 'custentity_auto_1' || fieldId == 'custentity_auto_2' ||
			 // fieldId == 'custentity_auto_3' || fieldId == 'custentity_auto_4' ||
			 // fieldId == 'custentity_auto_5' || fieldId == 'custentity_auto_6' ||
			 // fieldId == 'custentity_auto_7' || fieldId == 'custentity_auto_8' ||
			 // fieldId == 'custentity_auto_9' || fieldId == 'custentity_auto_10' ||
			 // fieldId == 'custentity_auto_11'|| fieldId == 'custentity_auto_12' )
		// {
			// var autoEmployee = cr.getValue({ "fieldId": fieldId });
			// var objColumnName = cr.getField({ fieldId: fieldId }).label;

			// // 尋找[專案工作]裡，是否有[指派部門]和objColumnName相同，若有，則將值帶入[被指派人]
			// search.create.promise({
				// type: "projecttask",
				// columns: [
					// 'custevent_assignee',
					// 'custevent_assign_default',
					// 'custevent_assign_department'
				// ],
				// filters: [
					// ['company','is',cr.id]
				// ]
			// })
			// .then(function(searchObj) {

				// searchObj.run().each(function(result){
					
					// var task_assignee 	    = result.getValue(result.columns[0]);
					// var task_assign_default = result.getText(result.columns[1]);
					// var task_assign_dept    = result.getText(result.columns[2]);
					
					// if( task_assign_dept    == objColumnName &&
						// task_assignee       != autoEmployee &&
						// task_assign_default != "指定" )
					// {
						// var taskRec = record.load({
							  // type: record.Type.PROJECT_TASK,
							  // id: result.id
						// });
						// taskRec.setValue({
							// fieldId: 'custevent_assignee',
							// value: autoEmployee
						// });
						// taskRec.setValue({
							// fieldId: 'custevent_assign_default',
							// value: 1 //預設
						// });
						// var recordId = taskRec.save();
						// console.log('Updated record ID: ' + recordId);
					// }
					// return true;
				// });
				
				// ShowTab("schedule",false); //refresh[排程表]
				// return true;
			// })
			// .catch(function(reason) {
				// log.debug({
					// details: "Failed: " + reason
				// })
			// });
		// }
        return true;

    }

    /**
     * 2018.6.1
     * 1.將備註custentity_remark，寫到所有Project Task : custevent_project_memo
     * 2.Project 計畫編號: custentity_project_number
     *   帶到 sales order & itemfulfillment
     */
	function saveRecord(scriptContext)
	{
		var cr = scriptContext.currentRecord;

    	//計畫編號->sales order & item fulfillment
    	var project_number = cr.getValue({ "fieldId": "custentity_project_number" });
    	var project_id = cr.id;

    	if( project_number ) {

    		//sales order
    		search.create({
    			type: search.Type.SALES_ORDER,
    		    columns: [{name: 'custbody26'}],
    		    filters: [{
    		        name: 'internalid',
    		        join:'jobmain',
    		        operator: 'is',
    		        values: [project_id]
    		    }],
				isPublic: true
            })
			.run().each(function(result) {

				// sales order
				var salesOrderRecord = record.load({
		    		type: record.Type.SALES_ORDER,
			        id: result.id
			    });

				salesOrderRecord.setValue({
					fieldId: 'custbody26', //計畫編號
					value: project_number
				});
				salesOrderRecord.save();
				return true;
			});

    		//item fulfillment
    		search.create({
    			type: search.Type.ITEM_FULFILLMENT,
    		    filters: [{
    		    	name: 'entity',
    		        operator: 'is',
    		        values: [project_id]
    		    },{
    		    	name: 'mainline',
    		        operator: 'is',
    		        values: 'T'
    		    }]
            })
			.run().each(function(result) {

				// item fulfillment
				var fulfillmentRecord = record.load({
		    		type: record.Type.ITEM_FULFILLMENT,
			        id: result.id
			    });

				try {
					fulfillmentRecord.setValue({
						fieldId: 'custbody26', //計畫編號
						value: project_number
					});
					fulfillmentRecord.save();
				} catch(err) {
					return null;
				}

				return true;
			});
    	}
		
		//儲存[帳單地址] [送貨地址] [聯絡人]
		cr.setValue("custentity_bill_address", cr.getValue({"fieldId": "custpage_bill_addr"}));
		cr.setValue("custentity_ship_address", cr.getValue({"fieldId": "custpage_ship_addr"}));
		cr.setValue("custentity_contact",      cr.getValue({"fieldId": "custpage_contact"}));
		cr.setValue("custentity_salesrep",      cr.getValue({"fieldId": "custpage_salesrep"}));
		
		//新增[指定專案工作者]功能
		// if ( fieldId == 'custentity_auto_1' || fieldId == 'custentity_auto_2' ||
			 // fieldId == 'custentity_auto_3' || fieldId == 'custentity_auto_4' ||
			 // fieldId == 'custentity_auto_5' || fieldId == 'custentity_auto_6' ||
			 // fieldId == 'custentity_auto_7' || fieldId == 'custentity_auto_8' ||
			 // fieldId == 'custentity_auto_9' || fieldId == 'custentity_auto_10' ||
			 // fieldId == 'custentity_auto_11'|| fieldId == 'custentity_auto_12' )
		// {
		var assignArr = {};
		for(var i=1 ; i<=12 ; i++)	
		{	
			// var f = "custentity_auto_"+i;
			var autoEmployee  = cr.getValue({ "fieldId": 'custentity_auto_'+i });
			var objColumnName = cr.getField({ "fieldId": 'custentity_auto_'+i }).label;
			assignArr[objColumnName] = autoEmployee;
		}
		
		// 尋找[專案工作]裡，是否有[指派部門]和objColumnName相同，若有，則將值帶入[被指派人]
		search.create.promise({
			type: "projecttask",
			columns: [
				'title',
				'custevent_assignee',
				'custevent_assign_default',
				'custevent_assign_department'
			],
			filters: [
				['company','is', project_id]
			]
		})
		.then(function(searchObj) {

			searchObj.run().each(function(result){
				
				var titleValue          = result.getValue(result.columns[0]);
				var task_assignee 	    = result.getValue(result.columns[1]);
				var task_assign_default = result.getText(result.columns[2]);
				var task_assign_dept    = result.getText(result.columns[3]);
				
				for( var key in assignArr )
				{
					var assignPeople = assignArr[key];
					
					// log.debug({
						// title: 'assignArr', 
						// details: task_assign_dept + " , " + key+ " , " + task_assignee+ " , " + assignPeople
					// });
					
					if( task_assign_dept    == key &&
						task_assignee       != assignPeople &&
						task_assign_default != "指定" )
					{
						var taskRec = record.load({
							  type: record.Type.PROJECT_TASK,
							  id: result.id
						});
						taskRec.setValue({
							fieldId: 'custevent_assignee',
							value: assignPeople
						});
						taskRec.setValue({
							fieldId: 'custevent_assign_default',
							value: 1 //預設
						});
						
						try
						{
							taskRec.save();
						}
						catch(e)
						{
							log.debug({
								title: 'error', 
								details: "批次帶入專案工作者錯誤,請檢查該專案工作["+titleValue+"]是否正確存在項目主檔內"
							});
						}

						// var recordId = taskRec.save();
						// log.debug({
							// title: 'save', 
							// details: 'Updated record ID: ' + recordId
						// });
					}
				}			
				return true;
			});
			
			// ShowTab("schedule",false); //refresh[排程表]
			return true;
		})
		.catch(function(reason) {
			log.debug({
				details: "Failed: " + reason
			});
		});
		
    	return true;
	}
	
	// 隱藏[帳單地址] [送貨地址] [聯絡人]
	function pageInit(scriptContext)
	{
    	var cr = scriptContext.currentRecord;
    	cr.getField({ fieldId: "custentity_bill_address"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_ship_address"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_contact"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_salesrep"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_contact_title"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_contact_phone"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_contact_fax"}).isDisplay = false;
		cr.getField({ fieldId: "custentity_contact_email"}).isDisplay = false;
    }

    return {
        fieldChanged: fieldChanged,
		saveRecord: saveRecord,
		pageInit: pageInit
    };

});
