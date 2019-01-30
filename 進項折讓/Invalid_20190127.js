/**
 * taskToPurchase.js
 * @NApiVersion 2.x
 */

define(['N/record','N/ui/message','./Common_ColumnCheck','N/currentRecord','N/search','N/runtime','N/format'],

function(record,message,common,cRecord,search,runtime,format) {

	function Invalid_PayInvoices(){

		var currentRecord = cRecord.get();
        //var sublistName = context.sublistId;
        //var sublistFieldName = context.fieldId;
        //var line = context.line;
		//var FieldValue = currentRecord.getValue(sublistFieldName);
		var recordType = currentRecord.getValue('baserecordtype');
		var IsError = false;
		var keyid = currentRecord.getValue({ "fieldId": "id" });
		//var keyid = runtime.getCurrentScript().getParameter("id");
		console.log("load");
		var projectRecord = record.load({
			type: recordType,
			id: keyid//,
			//isDynamic: true
		});
		var void_reasonID = "";
		var line_amountID = "";
		var void_userID = "";
		var void_dateID = "";
		var void_flagID = ""
		var year = 0;
		var month = 0;
		var registration_number = "";

		console.log(recordType);
		if(recordType=='customrecord_ev_pay_invoices_all')/*進項發票資訊*/{
			year = currentRecord.getValue('custrecord_10_occured_year');
			month = currentRecord.getValue('custrecord_10_occured_month');
			registration_number = currentRecord.getValue('custrecord_10_registration_number');
			void_reasonID = 'custrecord_10_void_reason';
			line_amountID = 'custrecord_10_cm_gui_line_amount';
			//tax_amount ='custrecord_10_cm_gui_tax_amount';
			void_userID = 'custrecord_10_void_user';
			void_dateID = 'custrecord_10_void_date';
			void_flagID = 'custrecord_10_void_flag';
		}else if(recordType=='customrecord_ev_pay_cm_all')/*進項折讓資訊*/{
			year = currentRecord.getValue('custrecord_12_occured_year');
			month = currentRecord.getValue('custrecord_12_occured_month');
			registration_number = currentRecord.getValue('custrecord_12_registration_number');
			void_reasonID = 'custrecord_12_void_reason';
			//line_amountID ='';
			void_dateID = 'custrecord_12_void_date';
			void_userID = 'custrecord_12_void_user';
			void_flagID = 'custrecord_void_flag';
		}
		console.log("year :"+year+" ,month:"+month+ " ,registration_number:"+registration_number);
		if(year=='' || month =='' || registration_number ==''){
			showMessage("系統訊息","所屬年、所屬月、稅籍編號憑證資訊至少一樣沒填");
			return false;
		}
		var customrecord_ev_apply_status_allSearchObj = search.create({
			type: "customrecord_ev_apply_status_all",
			filters:
			[
				["custrecord_22_occured_year","is",year], 
				"AND", 
				["custrecord_22_occured_month","equalto",month], 
				"AND", 
				["custrecord_22_registration_number","anyof",registration_number]
			],
			columns:
			[
				search.createColumn({
					name: "custrecord_22_registration_number",
					sort: search.Sort.ASC,
					label: "稅籍編號"
				}),
				search.createColumn({
					name: "custrecord_22_occured_year",
					sort: search.Sort.ASC,
					label: "年"
				}),
				search.createColumn({
					name: "custrecord_22_occured_month",
					sort: search.Sort.ASC,
					label: "月"
				}),
				search.createColumn({name: "custrecord_22_pay_apply_status", label: "進項"}),
				search.createColumn({name: "custrecord_22_rec_apply_status", label: "銷項"}),
				search.createColumn({name: "custrecord_22_declaration_flag", label: "已申報"})
			]
		});
		
		var searchResultCount = customrecord_ev_apply_status_allSearchObj.runPaged().count;
		if(searchResultCount > 0){
			customrecord_ev_apply_status_allSearchObj.run().each(function(result){
                    
				var declaration_flag = result.getText({
					name: 'custrecord_22_declaration_flag'
				});
				var pay_apply_status = result.getText({
					name: 'custrecord_22_pay_apply_status'
				});
				if(declaration_flag == "Yes" || pay_apply_status == "CLOSE"){
					IsError = true;
					showMessage("系統訊息","此年月資料，為已申報或是進項已關帳故不能作廢");
					return false;
				}
				return true;
			});
			
		}
		console.log("reason");
		var void_reason = currentRecord.getValue(void_reasonID);
		if(void_reason == ""){
			showMessage("系統訊息","作廢時，作廢原因為不能為空值");
			IsError = true;
		}
		console.log("line_amountID:"+line_amountID);
		//只有進項發票資訊要判斷已折金額
		if(line_amountID != ""){
			var line_amount = currentRecord.getValue(line_amountID);
			if(line_amount == 0){
				showMessage("系統訊息","已折金額不為零不可作廢");
				IsError = true;
			}
		}
		console.log("start save");
		if(IsError){
			return true;
		}else{
			console.log(void_reason);
			projectRecord.setValue({
				fieldId: void_reasonID,
				value: void_reason
			});
			if(line_amountID != ""){
				console.log(line_amount);
				projectRecord.setValue({
					fieldId: line_amountID,
					value: line_amount
				});
			}
			console.log("id:"+runtime.getCurrentUser().id);
			projectRecord.setValue({
				fieldId: void_userID,
				value: runtime.getCurrentUser().id
			});

			
			var today = new Date();
			projectRecord.setValue({
				fieldId: void_dateID,
				value: today
			});

			projectRecord.setValue({
				fieldId: void_flagID,
				value: true
			})
			
			console.log(recordType);
			if(recordType=='customrecord_ev_pay_cm_all'){
				var LineCount = currentRecord.getLineCount({"sublistId": "recmachcustrecord_13_parent_id"});
				var total_line_amount = 0;	//明細折讓金額總額

				for(var i=0;i<LineCount;i++){
					var ntd_amount = currentRecord.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_13_parent_id',
						fieldId: 'custrecord_13_line_ntd_amount',
						line: i
					});
					total_line_amount += ntd_amount;
				}

				var invoicesRecord = record.load({
					type: 'customrecord_ev_pay_invoices_all',
					id: keyid,
					isDynamic: true
				});

				var origin_line_amount = invoicesRecord.getValue('custrecord_10_cm_gui_line_amount');
				invoicesRecord.setValue({
					fieldId: 'custrecord_10_cm_gui_line_amount',
					value: origin_line_amount - total_line_amount
				})

				invoicesRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
			}	

			projectRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			alert("已作廢成功");
			window.location.reload();
		}
	}

	function showMessage(title,context){
        var myMsg = message.create({
            title: title,
            message: context,
            type: message.Type.WARNING
        });
        // will disappear after 5s
        myMsg.show({
            duration: 5000
        });
    }    
	
    return {
		Invalid_PayInvoices: Invalid_PayInvoices
    };
    
});