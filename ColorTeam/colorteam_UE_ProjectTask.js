 /**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 
 * 20180807 | Fisa | Add | 當Project中其中一項Project Task已完成，才能允許點選[拋轉銷售訂單按鈕]
 */
define(['N/search','N/record','./colorteam_CommonUtil','N/error'],

function(search,record,util,error)
{
	function beforeSubmit(context)
	{
		var oRec = context.oldRecord;
		var nRec = context.newRecord;
		
		// if (context.type !== context.UserEventType.CREATE)
			// return;
		
		if( oRec != null && nRec != null )
		{
			var oStatus = oRec.getValue({ "fieldId": "status" });
			var nStatus = nRec.getValue({ "fieldId": "status" });

			if( oStatus == "COMPLETE" && nStatus != "COMPLETE" )
			{
				var err = error.create({
					name: '無法修改', 
					message: '當狀態為[已完成]，無法再回復為其他狀態，也無法調整欄位資料'
				});
				throw err.message;
			}
			
			//在dashboard挑選[COMPLETE]時，將該父階加入item group，其所有子階加入component
			if( nStatus == "COMPLETE" && oStatus != "COMPLETE" )
			{
				var task_id = nRec.id;
				var current_title = oRec.getValue({ "fieldId": "title" }); //component
				var pid = oRec.getValue({ "fieldId": "company" }); //project id
		
				//create item group
				var createItemRecord = record.create({
					type: record.Type.ITEM_GROUP,
					isDynamic: true
				});

				createItemRecord.setValue({
					fieldId: 'itemid',
					value: current_title + " [auto:" + pid + "]"
				});

				log.debug({title:'產生ITEM_GROUP',details:" title: "+current_title+" , task_id: "+task_id});

				//找出所有子階(parent=[task_id])
				var saveItem = false;
				var projectTaskStr = "" ; // 2018.9.25 add
				search.create({
					"type": "projecttask",
					"filters": [['parent', 'is', task_id]],
					"columns": [
						{name: 'title'},
						{name: 'custevent_return_quantity'},
						{name: 'custevent_item_desc'},
						{name: 'custevent_item'},
						{name: 'custevent_unit'}/* ,
						{name: 'custevent_subtotal'} */
					],
					"isPublic": true
				})
				.run().each(function(result)
				{
					var taskId = result.id;
					projectTaskStr += taskId + "|"; // 2018.9.25 add
					
					var component   = result.getValue({ name: "title" }); //子階名稱
					var quantity    = result.getValue({ name: "custevent_return_quantity" }); //回報數量
					var item_desc   = result.getValue({ name: "custevent_item_desc" }); //item description
					var process_id  = result.getValue({ name: "custevent_item" }); //process_id
					var unit        = result.getValue({ name: "custevent_unit" }); //unit
					// var subtotal    = result.getValue({ name: "custevent_subtotal" }); //數量小計
					
					if( !quantity ) //回報數量不可為空
					{
						var err = error.create({
							name: "錯誤", 
							message: "請輸入["+component+"]的[回報數量]，[回報數量]不可為空"
						});
						throw err.message;
					}
					
					if( process_id )
					{
						saveItem = true;
						
						createItemRecord.selectNewLine({sublistId:"member"});
						createItemRecord.setCurrentSublistValue({
							sublistId: "member",
							fieldId: "item",
							value: process_id
						});
						createItemRecord.setCurrentSublistValue({
							sublistId: "member",
							fieldId: "memberdescr",
							value: item_desc
						});
						createItemRecord.setCurrentSublistValue({
							sublistId: "member",
							fieldId: "quantity",
							value: quantity 
						});
						createItemRecord.setCurrentSublistValue({
							sublistId: "member",
							fieldId: "unit",
							value: unit
						});
						createItemRecord.commitLine({sublistId:"member"});					
						log.debug({title:'SAVE COMPONENT ',details:" 製程代碼: "+process_id+" , 回報份數: "+quantity+" , DESC: "+item_desc});
					}
					
					// 2018.10.15 將子階狀態一併改成[已完成]
					var taskRecord = record.load({
						type: record.Type.PROJECT_TASK,
						id: taskId
					});
					taskRecord.setValue({
						fieldId: 'status',
						value: 'COMPLETE'
					});
					taskRecord.save();
					return true;
				});
				
				createItemRecord.setValue({ // 2018.9.25 add
					fieldId: 'custitem_project_task_id',
					value: projectTaskStr
				});
				
				var itemGroup_id = "";
				if( saveItem ) 
					itemGroup_id = createItemRecord.save({
						ignoreMandatoryFields: true
					});
				
				//2018.08 Fisa Add 當Project中其中一項Project Task已完成，才能允許點選[拋轉銷售訂單按鈕]
				var pid = oRec.getValue({ "fieldId": "company" }); //project id
				var projectRecord = record.load({
					type: record.Type.JOB,
					id: pid
				});
				
				projectRecord.setValue({
					fieldId: 'custentity_approve_to_so',
					value: true
				});
				projectRecord.save();
				
				log.debug({title:'itemGroup_id',details:itemGroup_id});
				
				// 2018.8.29 新增項目群組欄位，當[已完成]，則寫入該項目群組ID
				nRec.setValue({
					fieldId: 'custevent_item_group',
					value: itemGroup_id
				});	
			}
		}
		
		if( nRec != null )
		{
			var task_id = nRec.id;
			
			//2.使用者將料號貼到[料號]custevent_process欄位上，將該值寫到title (父階不判斷)
			var parent = nRec.getValue({ "fieldId": "parent" }); //父階工作項目
			if( oRec != null )
				parent = oRec.getValue({ "fieldId": "parent" });
			
			var process = nRec.getValue({ "fieldId": "custevent_process" }); //料號
			
			log.debug("parent:"+parent+" , process:"+process);
			
			if( task_id ) //已存在的project task
			{
				if( parent && process ) //子階
				{
					var processText = nRec.getText({ "fieldId": "custevent_process" });
					var deptText = nRec.getText({ "fieldId": "custevent_assign_department" });
					if( processText != deptText ) //指派部門不等於料號時，才做料號檢查
					{
						doItemInfo(nRec,process);
					}
				}
			}
			// else // 新project task
			// {
				// if( process )
				// {
					// doItemInfo(nRec,process);
				// }
				
			// }
			
			//3.使用者於父階輸入[份數]custevent_parent_quantity欄位，將該值寫到所有子階的custevent_ori_parent_quantity
			var pq = nRec.getValue({ "fieldId": "custevent_parent_quantity" });
			
			if( !parent && task_id && pq )
			{
				search.create({
					"type": "projecttask",
					"filters": [['parent', 'is', task_id]]
				})
				.run().each(function(result)
				{
					var taskRecord = record.load({
						type: record.Type.PROJECT_TASK,
						id: result.id
					});
					
					taskRecord.setValue({
						fieldId: 'custevent_ori_parent_quantity',
						value: pq
					});
					taskRecord.save();
					
					return true;
				});
			}
			
		}
	}
	
	function beforeLoad(scriptContext)
	{	
		var form = scriptContext.form;
		
		if (scriptContext.type == 'view')
		{
			//拋轉委外採購單
			var task_id = scriptContext.newRecord.id;
			form.clientScriptModulePath = 'SuiteScripts/taskToPurchase.js';
			form.addButton({
				id: "custpage_outsourcing",
				label: "拋轉委外採購單",
				functionName: "taskToPurchase(\'"+task_id+"\')"
			});
		}
	}
	
	//將貼上的料號回填必輸欄位[title] (beforeSubmit不能修改必輸欄位)
	function afterSubmit(context)
	{
		var nRec = context.newRecord;
		
		if( nRec != null )
		{
			var task_id = nRec.id;
			var taskRecord = record.load({
				type: record.Type.PROJECT_TASK,
				id: task_id
			});
			
			var process = nRec.getValue({ "fieldId": "custevent_process" }); //料號
			log.debug("afterSubmit:"+process);
			if( process )
			{
				taskRecord.setValue({ //父階
					fieldId: 'title',
					value: process
				});
				
				taskRecord.save({
					ignoreMandatoryFields: true
				});
			}
		}
	}
	
	doItemInfo = function(nRec,process)
	{
		var itemArr = util.searchItem(process);
		if( !itemArr[0] )
		{
			var err = error.create({
				name: "錯誤", 
				message: "["+process+"]不存在於項目裡，請輸入正確料號"
			});
			throw err.message;
		}
		
		nRec.setValue({
			fieldId: "custevent_item", 
			value: itemArr[0]
		});
		nRec.setValue({
			fieldId: "custevent_item_desc", 
			value: itemArr[2]
		});
		nRec.setValue({
			fieldId: "custevent_price", 
			value: itemArr[4] //基礎價格
		});

		//檢查委外
		if( itemArr[1] == 11 )
		{
			nRec.setValue({
				fieldId: "custevent_outsourcing", 
				value: true
			});
			
			nRec.setValue({
				fieldId: "custevent_outsourcing_price", 
				value: itemArr[3] //purchaseCost
			});
			
			nRec.setValue({
				fieldId: "custevent_os_process_id", 
				value: itemArr[5] //os process id
			});
		}
	}
	
	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});
