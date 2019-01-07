/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search','N/record','N/url'],

function(search,record,url) {

	function beforeLoad(context)
	{	
		var oRec = context.oldRecord;
		var nRec = context.newRecord;
		
		// 增加[銷售單列印(印明細)]和[銷售單列印(不印明細)]按鈕
		if (context.type == 'view')
		{
			var so_id = nRec.id;
			// var name = nRec.getValue({ fieldId: "custbody_doc_name"});
			
			var detailUrl = url.resolveScript({
				scriptId: 'customscript_print_so_detail',
				deploymentId: 'customdeploy_print_so_detail'
			});
			
			// 不能加returnExternalUrl: true，否則會有權限問題
			var noDetailUrl = url.resolveScript({
				scriptId: 'customscript_print_so_no_detail',
				deploymentId: 'customdeploy_print_so_no_detail'
			});
			
			var form = context.form;
			form.addButton({
				id: "custpage_print_so_1",
				label: "銷售單列印(印明細)",
				functionName: "window.open(\'"+detailUrl+"&internal_id="+so_id+"\');"
			});
			form.addButton({
				id: "custpage_print_so_2",
				label: "銷售單列印(不印明細)",
				functionName: "window.open(\'"+noDetailUrl+"&internal_id="+so_id+"\');"
			});
		}
		
		if (context.type == 'edit') //edit模式才需撈值
		{
			var customerId = nRec.getValue('entity'); // Customer Internal ID for current record			
			if (customerId != null) {
				var primaryContact = 'No contact defined'; // Backup option if Primary contact is not found
				var customerRec = record.load({
					type: record.Type.CUSTOMER,
					id: customerId
				});

				// Search Customer record for Primary Contact
				var numLines = customerRec.getLineCount({
					sublistId: 'contactroles'
				});
				
				for (var i = 0 ; i < numLines ; i++) {
					
					var contactRoleId = objRecord.getSublistValue({
						sublistId: 'contactroles',
						fieldId: 'role',
						line: i
					});
					log.debug("contactRoleId:"+contactRoleId);
					var contactName = objRecord.getSublistText({
						sublistId: 'contactroles',
						fieldId: 'contact',
						line: i
					});

					if (contactRoleId == 14) { // If Contact Role == 14, it is Primary Contact
						primaryContact = contactName;
					}

				}

			}
			log.debug("primaryContact:"+primaryContact);
			nRec.setValue({
				fieldId: 'custbody_contact',
				value: primaryContact
			});
		}
	}
	
	return {
		beforeLoad: beforeLoad
	};

});
