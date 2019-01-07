/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 20180803 | Fisa | Add | 報價單拋轉專案
 */
define(['N/search','N/record','N/ui/serverWidget','./getContactInfo','N/url'],

function(search,record,ui,g,url) {

	function beforeLoad(scriptContext)
	{	
		var form = scriptContext.form;
		if (scriptContext.type == 'view')
		{
			var estimate_id = scriptContext.newRecord.id;
			var toProjectUrl = url.resolveScript({
				scriptId: 'customscript_estimate_to_project',
				deploymentId: 'customdeploy_estimate_to_project'
			});

			form.addButton({
				id: "custpage_printitemlabel",
				label: "拋轉專案",
				functionName: "window.open(\'"+toProjectUrl+"&eid="+estimate_id+"\');"
			});
		}		
		
		if (scriptContext.type == 'edit' || scriptContext.type == 'create') //edit模式才需撈值
		{
			var select_contact = form.addField({
				id: "custpage_contact",
				label: "聯絡人",
				type: ui.FieldType.MULTISELECT
			});
			
			if( scriptContext.type == 'edit' )
			{
				var c_name = scriptContext.newRecord.getValue('entity');
				var defaultArr = g.getProjectSelect("add",c_name,select_contact);
				var save_contact = scriptContext.newRecord.getValue({ fieldId: "custbody_contact"});
				select_contact.defaultValue = (save_contact ? save_contact : defaultArr[2]);
			}

			form.insertField({
				field : select_contact,
				nextfield : 'custbody_contact_title'
			});
		}
	}
	
	return {
		beforeLoad: beforeLoad
	};

});
