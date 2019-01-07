/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * 
 * [ Modify Log ]
 * 2018.9.25 拋轉專案到銷售訂單，將GROUP ITEM的project task array寫入custitem_project_task_id
 */
define(['N/record','N/search','./colorteam_CommonUtil','./getContactInfo','N/runtime'],

function(record, search, util, g, runtime) {
	
	function execute(scriptContext)
	{
		var groupArr = runtime.getCurrentScript().getParameter("custscript_group").split(",");
		var qArr = runtime.getCurrentScript().getParameter("custscript_check").split(",");
		
		// project id
		var pid = runtime.getCurrentScript().getParameter("custscript_pid");
		var projectRecord = record.load({
			type: record.Type.JOB,
			id: pid 
		});
		var entity  = projectRecord.getValue({ fieldId: 'custentity_customer_name' });
		var company = projectRecord.getValue({ fieldId: 'custentity_company' });
		var shippingMethod = projectRecord.getValue({ fieldId: 'custentity_delivery_method' });
		var shipTo = projectRecord.getValue({ fieldId: 'custentity_ship_address' });
		
		// sales order
		var so_id = runtime.getCurrentScript().getParameter("custscript_so_id");
		var soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: so_id,
			isDynamic: true
		});
		
		// soRecord.setValue({
			// fieldId: 'entity',
			// value: entity
		// });
		
		// soRecord.setValue({
			// fieldId: 'class',
			// value: company
		// });
		
		// soRecord.setValue({
			// fieldId: 'shipmethod',
			// value: shippingMethod
		// });
		
		// soRecord.setValue({
			// fieldId: 'custbody_from_project',
			// value: pid
		// });
		
		// soRecord.setValue({
			// fieldId: 'shipaddress',
			// value: shipTo
		// });
		
		var customer_id = projectRecord.getValue({ "fieldId": "custentity_customer_name" });
		var contactName = projectRecord.getValue({ "fieldId": "custentity_contact" });
		
		//專案沒有指定主要聯絡人，抓取主要聯絡人帶入
		if( !contactName )
		{
			var contactArr = g.getPrimaryContact(customer_id,contactName);
			if( contactArr )
			{
				soRecord.setValue({ fieldId: 'custbody_contact',       value: contactArr[0] });
				soRecord.setValue({ fieldId: 'custbody_contact_title', value: contactArr[1] });
				soRecord.setValue({ fieldId: 'custbody_contact_phone', value: contactArr[2] });
				soRecord.setValue({ fieldId: 'custbody_contact_fax',   value: contactArr[3] });
				soRecord.setValue({ fieldId: 'custbody_contact_email', value: contactArr[4] });
			}
		}
		else
		{
			var cTitle = projectRecord.getValue({ "fieldId": "custentity_contact_title" });
			var cPhone = projectRecord.getValue({ "fieldId": "custentity_contact_phone" });
			var cFax = projectRecord.getValue({ "fieldId": "custentity_contact_fax" });
			var cEmail = projectRecord.getValue({ "fieldId": "custentity_contact_email" });
			
			soRecord.setValue({ fieldId: 'custbody_contact',       value: contactName });
			soRecord.setValue({ fieldId: 'custbody_contact_title', value: cTitle });
			soRecord.setValue({ fieldId: 'custbody_contact_phone', value: cPhone });
			soRecord.setValue({ fieldId: 'custbody_contact_fax',   value: cFax });
			soRecord.setValue({ fieldId: 'custbody_contact_email', value: cEmail });
		}
		
		// remove dummy item
		soRecord.removeLine({
			sublistId: 'item',
			line: 0/* ,
			ignoreRecalc: true */
		});
		
		for( var i=0 ; i<groupArr.length ; i++ )
		{
			// === start group item ===
			var groupRecord = record.load({
				type: record.Type.ITEM_GROUP,
				id: groupArr[i]
			});
			
			soRecord.selectNewLine({ sublistId: 'item'});
			soRecord.setCurrentSublistValue({ //ITEM
				sublistId: 'item',
				fieldId: 'item',
				value: groupArr[i],
				ignoreFieldChange: true
			});
			soRecord.setCurrentSublistValue({ //ITEM TYPE 重要
				sublistId: 'item',
				fieldId: 'itemtype',
				value: 'Group'
			});
			soRecord.setCurrentSublistValue({ //輸入拋轉份數
				sublistId: 'item',
				fieldId: 'quantity',
				value: qArr[i]
			});
			soRecord.setCurrentSublistValue({ //tax code
				sublistId: 'item',
				fieldId: 'taxcode',
				value: '14' ,
				ignoreFieldChange: true
			});
			soRecord.setCurrentSublistValue({ //custcol_include_project_task
				sublistId: 'item',
				fieldId: 'custcol_include_project_task',
				value: groupRecord.getValue({ fieldId: 'custitem_project_task_id' })
			});
			
			soRecord.commitLine({ sublistId: 'item' });
			// log.debug("Group : " + groupArr[i]);
			
			// === start detail item ===
			// var numLines = groupRecord.getLineCount({
				// sublistId: 'member'
			// });
			// log.debug("start item group detail");
			// for( var j=0 ; j<numLines ; j++ )
			// {
				// var subItem = groupRecord.getSublistValue({ sublistId: 'member', fieldId: 'item', line: j });
				// soRecord.setCurrentSublistValue({ //ITEM
					// sublistId: 'item',
					// fieldId: 'item',
					// value: subItem,
					// ignoreFieldChange: true
				// });
				
				// var q = groupRecord.getSublistValue({ sublistId: 'member', fieldId: 'quantity', line: j });
				// var ttlQuantity = q * qArr[i];
				// soRecord.setCurrentSublistValue({
					// sublistId: 'item',
					// fieldId: 'quantity',
					// value: ttlQuantity
				// });
				
				// var subItemName = groupRecord.getSublistText({ sublistId: 'member', fieldId: 'item', line: j });
				// var itemArr = util.searchItem(subItemName);
				// var baseprice = 0;
				// if( itemArr[4] != null ) baseprice = itemArr[4];

				// soRecord.setCurrentSublistValue({ //amount
					// sublistId: 'item',
					// fieldId: 'amount',
					// value: ttlQuantity * baseprice //quantity*單價
				// });
				
				// soRecord.setCurrentSublistValue({ //rate
					// sublistId: 'item',
					// fieldId: 'rate',
					// value: baseprice
				// });
				
				// soRecord.setCurrentSublistValue({ //amount
					// sublistId: 'item',
					// fieldId: 'description',
					// value: itemArr[2]
				// });
				
				// soRecord.setCurrentSublistValue({ //價格水平
					// sublistId: 'item',
					// fieldId: 'pricelevel1',
					// value: 1 //基礎價格
				// });

				// soRecord.setCurrentSublistValue({ //稅率
					// sublistId: 'item',
					// fieldId: 'taxrate1',
					// value: 5
				// });

				// var u = groupRecord.getSublistValue({ sublistId: 'member', fieldId: 'unit', line: j });		
				// soRecord.setCurrentSublistValue({ //unit
					// sublistId: 'item',
					// fieldId: 'costcol_kit_unit',
					// value: u
				// });
				
				// var t = groupRecord.getSublistValue({ sublistId: 'member', fieldId: 'taxrate', line: j });
				// soRecord.setCurrentSublistValue({ //tax code
					// sublistId: 'item',
					// fieldId: 'taxcode',
					// value: '14',
					// ignoreFieldChange: true
				// });
				// soRecord.commitLine({ sublistId: 'item' });
				// log.debug("Detail : " + subItem);
			// }
			
			// === start end group ===
			// soRecord.selectNewLine({ sublistId: 'item' });
			// soRecord.setCurrentSublistValue({ //ITEM
				// sublistId: 'item',
				// fieldId: 'item',
				// value: 0,
				// ignoreFieldChange: true
			// });
			
			// soRecord.setCurrentSublistValue({ //ITEM TYPE 重要
				// sublistId: 'item',
				// fieldId: 'itemtype',
				// value: 'EndGroup'
			// });
			
			// soRecord.setCurrentSublistValue({ //ITEM
				// sublistId: 'item',
				// fieldId: 'amount',
				// value: 0
			// });
			
			// soRecord.setCurrentSublistValue({ //tax code
				// sublistId: 'item',
				// fieldId: 'taxcode',
				// value: '14',
				// ignoreFieldChange: true
			// });
			
			// soRecord.commitLine({ sublistId: 'item' });		
			// log.debug("End Group");			
		}
		
		var s = soRecord.save({
			enableSourcing: false,
			ignoreMandatoryFields: true
		});
		log.debug("拋轉成功:"+s);
		
		/**
		 * 2018.9.26 檢查custcol_include_project_task是否有值
		 * 有的話，將project task id寫入各個子項目
		 */
		soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: s
		});
		var numLines = soRecord.getLineCount({
			sublistId: 'item'
		});
		
		var taskArr = [];
		var taskArrCnt = 0;
		var pTaskId = "";
		
		for(var i=0 ; i<numLines ; i++)
		{
			var item_type = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'itemtype',
				line: i
			});
			
			if( item_type == "Group" )
			{
				taskArr = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_include_project_task',
					line: i
				}).split("|");
				
				// soRecord.setSublistValue({
					// sublistId: 'item',
					// fieldId: 'custcol_include_project_task',
					// line: i,
					// value: taskArr[taskArrCnt]
				// });
				
				
				// pTaskId = soRecord.getSublistValue({
					// sublistId: 'item',
					// fieldId: 'custcol_include_project_task',
					// line: i
				// });

			}
			else if( item_type == "EndGroup" )
			{
				// pTaskId = "";
				taskArr = [];
				taskArrCnt = 0;
			}
			else // kit
			{
				soRecord.setSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_include_project_task',
					line: i,
					value: taskArr[taskArrCnt]
				});
				taskArrCnt++;
			}
		}
		
		var s2 = soRecord.save({
			enableSourcing: false,
			ignoreMandatoryFields: true
		});
		log.debug("拋轉成功 2:"+s2);
    }

    return {
        execute: execute
    };
    
});
