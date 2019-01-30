 /**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 進項折讓明細-存檔前檢核
 */
define(['N/search','N/record','N/error','N/ui/message','N/currentRecord'],

function(search,record,error,message,cRecord)
{
	function beforeSubmit(context)
	{
		var oRec = context.oldRecord;
		var nRec = context.newRecord;
		var IsError = false;
		var currentRecord = cRecord;
		// if (context.type !== context.UserEventType.CREATE)
			// return;
		
		if( nRec != null )
		{
			//var customerId = nRec.getValue('entity'); // Customer Internal ID for current record

			//var rec = record.load({
			//	"type": "customrecord_ev_pay_cm_all",
			//	"id": 
			//});
			// How many lines are on the Items sublist?
			var LineCount = nRec.getLineCount({"sublistId": "recmachcustrecord_13_parent_id"});
			if(LineCount == 0){
				//error
			}
			var total_line_amount = 0;	//明細折讓金額總額
			var total_tax_amount = 0;	//明細折讓稅額總額

			for(var i=0;i<LineCount;i++){
				//進項折讓明細的憑證號碼，有兩筆以上相同的話 秀錯誤訊息
				if(i< Math.round(LineCount/2)){
					var display_I = currentRecord.getCurrentSublistValue({
						sublistId: 'recmachcustrecord_13_parent_id',
						fieldId: 'custrecord_13_gui_number_display',
						line: i
					});
					for(var j=i+1;j<LineCount;j++){
						var display_J = currentRecord.getCurrentSublistValue({
							sublistId: 'recmachcustrecord_13_parent_id',
							fieldId: 'custrecord_13_gui_number_display',
							line: j
						});
						if(display_J == display_I){
							showMessage("系統訊息","憑證號碼重複");
							return false;
						}
					}
				}

				var ntd_amount = currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_13_parent_id',
					fieldId: 'custrecord_13_line_ntd_amount',
					line: i
				});
				total_line_amount += ntd_amount;

				var ntd_amount = currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_13_parent_id',
					fieldId: 'custrecord_13_tax_ntd_amount',
					line: i
				});
				total_tax_amount += ntd_amount;

				var ntd_amount = currentRecord.getCurrentSublistValue({
					sublistId: 'recmachcustrecord_13_parent_id',
					fieldId: 'custrecord_13_unit_price',
					line: i
				});
				totalPrice += ntd_amount;
			}

			if(total_line_amount == 0){
				showMessage("系統訊息","折讓明細累計總額不得為0");
				IsError = true;
			}
			var sales_amt = rec.getValue("custrecord_12_sales_amt");
			if(total_line_amount != sales_amt ){
				showMessage("系統訊息","折讓金額與折讓明細累計金額不符");
				IsError = true;
			}
			var vat_io = rec.getValue("custrecord_12_vat_io");
			if(total_tax_amount != vat_io ){
				showMessage("系統訊息","折讓稅額與折讓明細累計稅額不符");
				IsError = true;
			}
			//---save---//
		}
		return !IsError;
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
		beforeSubmit: beforeSubmit
	};

});
