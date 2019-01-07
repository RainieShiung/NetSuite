/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/ui/serverWidget','N/search','./getDestination'],

function(ui,search,g) {

	function beforeLoad(scriptContext)
	{	
		var form = scriptContext.form;
		var nRec = scriptContext.newRecord;
		if (scriptContext.type == 'view')
		{
			var so_id = nRec.id;
			form.clientScriptModulePath = 'SuiteScripts/printExcel.js';
			form.addButton({
				id: "custpage_print_excel",
				label: "Print Excel",
				functionName: "printExcelForSalesOrder(\'"+so_id+"\')"
			});
		}	

		if (scriptContext.type == 'edit' || scriptContext.type == 'create') //edit模式才需撈值
		{		
			var cid = nRec.getValue('entity');
			var destination_select = form.addField({
				id: "custpage_destination",
				label: "DESTINATION (目的地)",
				type: ui.FieldType.SELECT
			});
			
			if( cid )
			{
				g.getDestination("add",cid,destination_select);
				
				form.insertField({
					field : destination_select,
					nextfield : 'custbody_req_ship_date'
				});
				var save_destination = nRec.getValue({ fieldId: "custbody_destination"});
				destination_select.defaultValue = (save_destination ? save_destination : null);
			}
			
		}
	}
	
	return {
		beforeLoad: beforeLoad
	};

});
