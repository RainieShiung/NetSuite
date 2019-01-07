/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search','N/record','N/url',"N/ui/serverWidget"],

function(search,record,url,ui) {

	function beforeLoad(scriptContext)
	{	
		var form = scriptContext.form;
		var nRec = scriptContext.newRecord;
		
		// action button
		if (scriptContext.type == 'view')
		{
			var rid = scriptContext.newRecord.id;
			var previewUrl = url.resolveScript({
				scriptId: 'customscript_preview_export_form',
				deploymentId: 'customdeploy_preview_export_form'
			});
			
			form.clientScriptModulePath = 'SuiteScripts/exportFormFunc.js';
			form.addButton({
				id: "custpage_print_form_1",
				label: "10+2",
				functionName: "openUrl(\'"+previewUrl+"&type=1&rid="+rid+"\',\'"+rid+"\');"
			});
			
			form.addButton({
				id: "custpage_print_form_2",
				label: "Lacey",
				functionName: "openUrl(\'"+previewUrl+"&type=2&rid="+rid+"\',\'"+rid+"\');"
			});
			
			form.addButton({
				id: "custpage_print_form_3",
				label: "Packing List",
				functionName: "openUrl(\'"+previewUrl+"&type=3&rid="+rid+"\');"
			});

			form.addButton({
				id: "custpage_print_form_4",
				label: "Commercial Invoice",
				functionName: "openUrl(\'"+previewUrl+"&type=4&rid="+rid+"\');"
			});
			
			var wordUrl = url.resolveScript({
				scriptId: 'customscript_export_forms_word',
				deploymentId: 'customdeploy_export_forms_word'
			});
			form.addButton({
				id: "custpage_print_form_4_1",
				label: "Commercial Invoice - Payment",
				functionName: "openUrl(\'"+wordUrl+"&type=4_1&rid="+rid+"\');"
			});
			
			// create AR
			form.addButton({
				id: "custpage_print_form_5",
				label: "Create AR",
				functionName: "transferToInvoice(\'"+rid+"\')"
			});
			
			// send mail
			var sendUrl = url.resolveScript({
				scriptId: 'customscript_send_files',
				deploymentId: 'customdeploy_send_files'
			});
			form.addButton({
				id: "custpage_print_form_6",
				label: "Send Files",
				functionName: "openUrl(\'"+sendUrl+"&rid="+rid+"\');"
			});
		}		
		else //除了view mode之外，都需產生custpage_fulfillment
		{
			// item fulfillment list
			var select = form.addField({
				id: "custpage_fulfillment",
				label: "Item Fulfillment",
				type: ui.FieldType.MULTISELECT
			});
			
			// 如果custpage_process_id有值，須帶入
			var customer = nRec.getValue({ fieldId: "custrecord_customer"});
			var itemfulfill = nRec.getValue({ fieldId: "custrecord_itemfulfill"});
			if( itemfulfill.length > 0 ){
				
				var itemfulfillmentSearchObj = search.create({
					type: "itemfulfillment",
					filters:
					[
						["type","anyof","ItemShip"], "AND", 
						[
							["custbody_export_form_no","anyof", nRec.id], "OR",
							["custbody_export_form_no","anyof","@NONE@"]
						], "AND", 
						["mainline","is","T"], "AND", 
						["customer.internalid","anyof",customer]
					],
					columns:
					[
						search.createColumn({name: "transactionnumber", label: "Transaction Number"}),
						search.createColumn({name: "custbody_buyer_no", label: "Buyer No"})
					]
				});
				
				itemfulfillmentSearchObj.run().each(function(result){
					
					var transactionnumber = result.getValue({ name: "transactionnumber" });
					var buyer_no = result.getValue({ name: "custbody_buyer_no" });

					select.addSelectOption({
						value: result.id,
						text: "#"+transactionnumber+"  ("+buyer_no+")"
					});
					return true;
				});
				
				nRec.setValue("custpage_fulfillment",itemfulfill);
			}
			
			form.insertField({
				field : select,
				nextfield : 'custrecord_buyer_no'
			});
		}
		
		
	}
	
	return {
		beforeLoad: beforeLoad
	};

});
