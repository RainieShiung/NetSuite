 /**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/search','N/record','N/error'],

function(search,record,error)
{	
	function beforeLoad(scriptContext)
    {	
		var form = scriptContext.form;
		
		if (scriptContext.type == 'view')
		{
			//產生年度開關帳資料行
			var reg_id = scriptContext.newRecord.id;
            form.clientScriptModulePath = 'SuiteScripts/einvoice/generateApply.js';
            form.addButton({
                id: "custpage_generate_apply",
                label: "產生年度開關帳資料",
                functionName: "generateApply(\'" + reg_id + "\')"
            });
		}
	}	
	
	return {
		beforeLoad: beforeLoad
	};

});
