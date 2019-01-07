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
		
		if (scriptContext.type == 'edit' || scriptContext.type == 'create') //edit模式才需撈值
		{		
			var cid = nRec.getValue("custrecord_company");
			var address_select = form.addField({
				id: "custpage_address",
				label: "Address",
				type: ui.FieldType.SELECT
			});
			
			if( cid )
			{
				g.getAddress("add",cid,address_select);
				
				form.insertField({
					field : address_select,
					nextfield : "custrecord_address"
				});
				var save_address = nRec.getValue({ fieldId: "custrecord_address"});
				address_select.defaultValue = (save_address ? save_address : null);
			}
			
		}
	}
	
	return {
		beforeLoad: beforeLoad
	};

});
