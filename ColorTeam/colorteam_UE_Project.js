/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 20180808 | Fisa | Add | 產生[帳單地址] [送貨地址] [聯絡人]選單供挑選
 */
define(['N/search','N/record','N/url','./colorteam_CommonUtil','N/ui/serverWidget','./getContactInfo'],

function(search,record,url,util,ui,g) {

	function beforeLoad(scriptContext)
	{	
		var form = scriptContext.form;
		form.clientScriptModulePath = 'SuiteScripts/projectCustomFunc.js';
		
		var nRec = scriptContext.newRecord;
		
		if (scriptContext.type == 'view')
		{
			var project_id = nRec.id;
			
			//1. 工作單列印
			var print_output = url.resolveScript({
				scriptId: 'customscript_print_project',
				deploymentId: 'customdeploy_print_project'
			});
			form.addButton({
				id: "custpage_print_project",
				label: "專案單列印",
				functionName: "openUrl(\'"+print_output+"&internal_id="+project_id+"\');"
			});
			
			//2. 專案複製: Suitelet -> Schedule Script
			var copyUrl = url.resolveScript({
				scriptId: 'customscript_copy_project_suitelet',
				deploymentId: 'customdeploy_copy_project_suitelet'
			});
			
			form.addButton({
				id: "custpage_copy_project",
				label: "專案複製",
				functionName: "openUrl(\'"+copyUrl+"&pid="+project_id+"\');"
			});

			//3. 拋轉銷售訂單
			form.addButton({
				id: "custpage_project_to_so",
				label: "拋轉銷售訂單",
				functionName: "projectToSalesOrder(\'"+project_id+"\')"
			});
			
			//4. 產生專案工作父階與項目個數
			var bookName = nRec.getValue({ fieldId: "companyname"});
			form.addButton({
				id: "custpage_generate_pt",
				label: "產生專案工作父階與項目個數",
				functionName: "generateTask(\'"+project_id+"\','"+bookName+"\')"
			});
		}
		
		//4. 產生[帳單地址] [送貨地址] [聯絡人]選單供挑選
		if (scriptContext.type == 'edit' || scriptContext.type == 'create') //edit模式才需撈值
		{
			var select_bill = form.addField({
				id: "custpage_bill_addr",
				label: "帳單地址",
				type: ui.FieldType.MULTISELECT
			});
			
			var select_ship = form.addField({
				id: "custpage_ship_addr",
				label: "送貨地址",
				type: ui.FieldType.MULTISELECT
			});
			
			var select_contact = form.addField({
				id: "custpage_contact",
				label: "聯絡人",
				type: ui.FieldType.MULTISELECT
			});
			
			var select_salesrep = form.addField({
				id: "custpage_salesrep",
				label: "銷售代表",
				type: ui.FieldType.MULTISELECT
			});
			
			if( scriptContext.type == 'edit' )
			{
				//產生下拉選單的清單內容
				var c_name = nRec.getValue('custentity_customer_name');
				var defaultArr = g.getProjectSelect("add",c_name,select_contact,select_bill,select_ship);
				
				var save_bill = nRec.getValue({ fieldId: "custentity_bill_address"});
				var save_ship = nRec.getValue({ fieldId: "custentity_ship_address"});
				var save_contact = nRec.getValue({ fieldId: "custentity_contact"});
				
				select_bill.defaultValue = (save_bill ? save_bill : defaultArr[0]);
				select_ship.defaultValue = (save_ship ? save_ship : defaultArr[1]);
				select_contact.defaultValue = (save_contact ? save_contact : defaultArr[2]);
				
				//銷售代表清單:群彩所有員工
				var employeeSearchObj = search.create({
					type: "employee",
					filters:
					[
						["department","noneof","@NONE@"]
					],
					columns:
					[
						search.createColumn({name: "entityid", label: "名稱"}),
						search.createColumn({name: "firstname", label: "名字"}),
						search.createColumn({
							name: "department",
							sort: search.Sort.ASC
						})
					]
				});

				employeeSearchObj.run().each(function(result){
					var empId = result.getValue(result.columns[0]);
					var empName = result.getValue(result.columns[1]);
					var dept = result.getText(result.columns[2]);
					
					select_salesrep.addSelectOption({value: result.id, text: empId+" "+empName+" ("+dept+")"});
					return true;
				});
			}
			
			form.insertField({
				field : select_contact,
				nextfield : 'custentity_contact_title'
			});
			
			form.insertField({
				field : select_bill,
				nextfield : 'custentity_approve_to_so'
			});
			
			form.insertField({
				field : select_ship,
				nextfield : 'custentity_remark'
			});
			
			form.insertField({
				field : select_salesrep,
				nextfield : 'custentity_value_tax'
			});
			var save_salesrep = nRec.getValue({ fieldId: "custentity_salesrep"});
			select_salesrep.defaultValue = (save_salesrep ? save_salesrep : null);
		}
	}
	
	// function afterSubmit(scriptContext)
	// {	
		// //存檔後，依據使用者選擇的[製程項目]，產生下方[專案工作]
		// var pid = scriptContext.newRecord.id;
		// var isGenerateTask = scriptContext.newRecord.getValue({ "fieldId": "custentity_generate_pt" });
		// if( isGenerateTask )
		// {
			// var company = scriptContext.newRecord.getValue({ "fieldId": "companyname" });
			// var process_id = scriptContext.newRecord.getValue({ "fieldId": "custentity_process_id" });
			
			// var tid  = util.createProjectTask(company, pid, 0, "", "", "", ""); //p=project id
			// log.debug("save project task id (parent) : "+tid);
			
			// var process_id = scriptContext.newRecord.getValue({ "fieldId": "custentity_process_id" });
			// for( var i=0 ; i<process_id.length ; i++ )
			// {
				// util.createProjectTask(process_id, pid, 0, "", "", "", "", tid);
			// }
		// }
		
	// }
	
	return {
		beforeLoad: beforeLoad/* ,
		afterSubmit: afterSubmit */
	};

});
