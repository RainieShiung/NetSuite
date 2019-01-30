/**
 * @NApiVersion 2.x
 */


define(['N/record','N/ui/message','./Common_ColumnCheck','N/currentRecord','N/search','N/runtime','N/format'],
function(record,message,common,cRecord,search,runtime,format) {

	// function CreatInvoice(InvoiceType){
	// 	switch(InvoiceType){
	// 		case "Submit":
	// 			SubmitAnInvoice();
	// 			break;
	// 		case "Trans":
	// 			TransAnInvoice();
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	return ;
	// }

	// function SubmitAnInvoice(){

	// 	var transactionSearchObj = search.create({
	// 		type: "transaction",
	// 		filters:
	// 		[
	// 		],
	// 		columns:
	// 		[
	// 			search.createColumn({
	// 				name: "internalid",
	// 				join: "customerMain",
	// 				label: "Internal ID"
	// 			}),
	// 			search.createColumn({
	// 				name: "altname",
	// 				join: "customerMain",
	// 				label: "Name"
	// 			}),
	// 			search.createColumn({name: "createdfrom", label: "Created From"}),
	// 			search.createColumn({name: "item", label: "Item"}),
	// 			search.createColumn({name: "tranid", label: "Document Number"}),
	// 			search.createColumn({
	// 				name: "trandate",
	// 				sort: search.Sort.ASC,
	// 				label: "Date"
	// 			}),
	// 			search.createColumn({name: "quantity", label: "Quantity"}),
	// 			search.createColumn({name: "entity", label: "Name"})
	// 		]
	// 	});
	// 	var searchResultCount = transactionSearchObj.runPaged().count;
	// 	log.debug("transactionSearchObj result count",searchResultCount);
	// 	transactionSearchObj.run().each(function(result){
	// 		// .run().each has a limit of 4,000 results

	// 		//銷項發票資訊
	// 		var recRecord = record.create({
	// 			type: 'customrecord_ev_rec_invoices_all',
	// 			isDynamic: true
	// 		});
			
	// 		//稅籍編號
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_registration_number',
	// 			value: 
	// 		});
	// 		// 發票簿冊
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_gui_book_id',
	// 			value: 
	// 		});
	// 		// 格式別: Netsuite Invoice-格式別
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_format_type',
	// 			value: 
	// 		});
	// 		// 課稅別: Netsuite Invoice-課稅別
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_tax_code',
	// 			value: 
	// 		});
	// 		// 發票聯式: Netsuite Invoice-發票聯式
	// 		recRecord.setValue({
	// 			fieldId: '',
	// 			value: 
	// 		});
	// 		// 發票號碼 :順序取號
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_gui_no',
	// 			value: 
	// 		});
	// 		// 發票日期 : Netsuite Invoice -Invoice Date
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_gui_date',
	// 			value: result.getValue({name: 'trandate'})
	// 		});
	// 		// 買受人名稱 二聯: 空白 三聯: 開立發票客戶名稱若有值抓取開立發票客戶名稱，若空白抓取客戶名稱
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_customer_name',
	// 			value: 
	// 		});
	// 		// 買受人統一編號 二聯: 空白 三聯: 開立發票客戶統編，若有值抓取開立發票客戶統編，若空白抓取客戶統編
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_buyer_no',
	// 			value: 
	// 		});
	// 		// 銷售金額: Netsuite Invoice- Invoice Amount
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_sales_amt',
	// 			value: 
	// 		});
	// 		// 銷售稅額: Netsuite Invoice -Invoice Tax
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_vat_io',
	// 			value: 
	// 		});
	// 		// 發票備註 : Netsuite Invoice發票備註 +invoice No .(發票開立時將Invoice No.加入)
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_other_desc',
	// 			value: 
	// 		});
	// 		// 載具類別號碼: 空白
	// 		// 載具顯碼ID: 空白
	// 		// 捐贈註記: 空白: Netsuite Invoic-捐贈註記
	// 		recRecord.setValue({
	// 			fieldId: '',
	// 			value: 
	// 		});
	// 		// 發票捐贈對象統一編號: Netsuite Invoic-發票捐贈對象統一編號
	// 		recRecord.setValue({
	// 			fieldId: 'custrecord_1_donation_no',
	// 			value: 
	// 		});

	// 		// 發票明細資料
	// 		var sublistId_gui_id = "recmachcustrecord_2_gui_id";
	// 		for(var i=0;i<   ;i++){
	// 			// 品名: Netsuite Invoice Sublist[Item] Description
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "custrecord_2_description",
    //                 line: i,
    //                 value: 
	// 			});
	// 			// 數量: Netsuite Invoice Sublist[Item] Invoice Quantity
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "custrecord_2_line_amount",
    //                 line: i,
    //                 value: 
	// 			});
	// 			// 單價: Netsuite Invoice Sublist[Item] Invoice Unit Price
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "custrecord_2_unit_price",
    //                 line: i,
    //                 value: 
	// 			});
	// 			// 明細行金額: Netsuite Invoice Sublist[Item] Amount
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "custrecord_2_line_amount",
    //                 line: i,
    //                 value: 
	// 			});
	// 			// 明細行稅額: Netsuite Invoice Sublist[Item] Tax Amt
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "custrecord_2_tax_amount",
    //                 line: i,
    //                 value: 
	// 			});
	// 			// 明細行總額: Netsuite Invoice Sublist[Item] Gross Amt
	// 			recRecord.setSublistValue({
    //                 sublistId: sublistId_gui_id,
    //                 fieldId: "",
    //                 line: i,
    //                 value: 
	// 			});
	// 		}

	// 		recRecord.save({
	// 			enableSourcing: true,
	// 			ignoreMandatoryFields: true
	// 		});

	// 		return true;
	// 	});
		
	// 	if(gui_bookssearchResultCount == 1){
	// 		var cur_number = '';
	// 		var word = '';
	// 		var start_number = '';
	// 		var internalid = '';
	// 		customrecord_ev_gui_books_allSearchObj.run().each(function(result){
	// 			cur_number = result.getValue({
	// 				name: 'custrecord_19_gui_cur_number'
	// 			});
	// 			word = result.getValue({
	// 				name: 'custrecord_19_gui_word'
	// 			});
	// 			start_number = result.getValue({
	// 				name: 'custrecord_19_gui_start_number'
	// 			});
	// 			internalid = result.getValue({
	// 				name: 'internalid'

	// 			});
	// 			return false;
	// 		});
	// 		if(cur_number == ""){
	// 			other_desc = word + start_number;
	// 		}else{
	// 			other_desc = word + (cur_number+1);
	// 		}

	// 		currentRecord.setValue({
	// 			fieldId: 'custrecord_12_other_desc',
	// 			value: other_desc
	// 		});

	// 		var bookRecord = record.load({
	// 			type: 'customrecord_ev_gui_books_all',
	// 			id: internalid,
	// 			isDynamic: true
	// 		});

	// 		bookRecord.setValue({
	// 			fieldId: 'custrecord_19_gui_cur_number',
	// 			value: other_desc.substring(2,10)
	// 		});
	// 		//更新回寫該折讓簿冊的目前使用號碼
	// 		bookRecord.save({
	// 			enableSourcing: true,
	// 			ignoreMandatoryFields: true
	// 		});
	// 	}else{
	// 		var err = error.create({
	// 			name: '系統訊息', 
	// 			message: '找不到折讓單號'
	// 		});
	// 		throw err.message;
	// 	}

	// }

	function TransAnInvoice(){

		console.log("start search");
		var customrecord_ev_rec_inv_interfaceSearchObj = search.create({
			type: "customrecord_ev_rec_inv_interface",
			filters:
			[
			],
			columns:
			[
				search.createColumn({name: "scriptid", label: "Script ID"}),
				search.createColumn({name: "custrecord_i1_batch_name", label: "BATCH_NAME"}),
				search.createColumn({name: "custrecord_i1_status", label: "STATUS"}),
				search.createColumn({name: "custrecord_i1_seq", label: "序號"}),
				search.createColumn({name: "custrecord_i1_gui_date", label: "發票日期"}),
				search.createColumn({name: "custrecord_i1_tax_code", label: "稅碼"}),
				search.createColumn({name: "custrecord_i1_buyer_name", label: "買受人名稱"}),
				search.createColumn({name: "custrecord_i1_buyer_no", label: "買受人統編"}),
				search.createColumn({name: "custrecord_i1_amount", label: "未稅金額"}),
				search.createColumn({name: "custrecord_i1_tax_amount", label: "稅額"}),
				search.createColumn({name: "custrecord_i1_other_desc", label: "發票備註"}),
				search.createColumn({name: "custrecord_i1_invoice_num", label: "NS Invoice No"}),
				search.createColumn({name: "custrecord_i1_source_system", label: "前端系統別"}),
				search.createColumn({name: "custrecord_i1_description", label: "品名"})
			]
		});
		//var searchResultCount = customrecord_ev_rec_inv_interfaceSearchObj.runPaged().count;
		var index = 0;
		customrecord_ev_rec_inv_interfaceSearchObj.run().each(function(result){
			console.log("create record");
			//銷項發票資訊
			var recRecord = record.create({
				type: 'customrecord_ev_rec_invoices_all',
				isDynamic: true
			});
			var amount = Math.round(result.getValue({name: 'custrecord_i1_amount'}));
			var tax = Math.round(result.getValue({name: 'custrecord_i1_tax_amount'}));
			//custrecord_i1_tax_code  call 格式別，課稅別，
			var taxcode = result.getValue({name: 'custrecord_i1_tax_code'});
			console.log("call common.GetValueByTaxCode");
			var arrayValueByTaxCode = common.GetValueByTaxCode(taxcode);

			console.log("start setvalue");
			if(arrayValueByTaxCode != null){
				// 格式別
				console.log("格式別:"+arrayValueByVandor[0]);
				recRecord.setValue({
					fieldId: 'custrecord_1_format_type',
					value: arrayValueByVandor[0]
				});
				// 課稅別
				console.log("課稅別:"+arrayValueByVandor[1]);
				recRecord.setValue({
					fieldId: 'custrecord_1_tax_code',
					value: arrayValueByVandor[1]
				});
			}
			
			//稅籍編號
			console.log("稅籍編號:"+"1");
			recRecord.setValue({
			 	fieldId: 'custrecord_1_registration_number',
			 	value: 1
			});
			// 發票簿冊
			console.log("發票簿冊:"+"2018ZQ03");
			// recRecord.setValue({
			// 	fieldId: 'custrecord_1_gui_book_id',
			// 	value: 1
			// });
			// 發票日期
			var gui_date = format.parse({
				value: result.getValue({name: 'custrecord_i1_gui_date'}),
				type: format.Type.DATE
			});
			console.log("發票日期:"+gui_date);
			recRecord.setValue({
				fieldId: 'custrecord_1_gui_date',
				value: gui_date
			});
			// 買受人名稱
			console.log("買受人名稱:"+result.getValue({name: 'custrecord_i1_buyer_name'}));
			recRecord.setValue({
				fieldId: 'custrecord_1_customer_name',
				value: result.getValue({name: 'custrecord_i1_buyer_name'})
			});
			// 買受人統一編號
			console.log("買受人統一編號:"+result.getValue({name: 'custrecord_i1_buyer_no'}));
			recRecord.setValue({
				fieldId: 'custrecord_1_buyer_no',
				value: result.getValue({name: 'custrecord_i1_buyer_no'})
			});
			// 銷售金額
			console.log("銷售金額:"+amount);
			recRecord.setValue({
				fieldId: 'custrecord_1_sales_amt',
				value: amount
			});
			// 銷售稅額
			recRecord.setValue({
				fieldId: 'custrecord_1_vat_io',
				value: tax
			});
			// 	銷售總額
			recRecord.setValue({
				fieldId: 'custrecord_1_sales_total_amt',
				value: amount+tax
			});
			// 發票備註
			recRecord.setValue({
				fieldId: 'custrecord_1_other_desc',
				value: result.getValue({name: 'custrecord_i1_other_desc'})
			});
			// //載具類別號碼: 空白 custrecord_1_vehicle_type
			// recRecord.setValue({
			// 	fieldId: 'custrecord_1_vehicle_type',
			// 	value: ""
			// });
			// //載具顯碼ID: 空白  custrecord_1_vehicle_no
			// recRecord.setValue({
			// 	fieldId: 'custrecord_1_vehicle_no',
			// 	value: ""
			// });
			// //捐贈註記: 空白
			// recRecord.setValue({
			// 	fieldId: '',
			// 	value: ""
			// });
			// //發票捐贈對象統一編號: 空白  custrecord_1_donation_no  
			// recRecord.setValue({
			// 	fieldId: 'custrecord_1_donation_no',
			// 	value: ""
			// });

			console.log("start setsublistIdvalue");			
			// 發票明細資料
			var sublistId_gui_id = "recmachcustrecord_2_gui_id";
			for(var i=0;i< 1  ;i++){

				// 品名: 文字檔[Item] Description
				console.log("品名:"+result.getValue({name: 'custrecord_i1_description'}));
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_description",
					line: i,
					value: result.getValue({name: 'custrecord_i1_description'}) 
				});
				// 數量:  固定為1
				console.log("數量:1");
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_quantity",
					line: i,
					value: 1
				});
				// 單價: 文字檔[AMOUNT]
				console.log("單價:"+amount);
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_unit_price",
					line: i,
					value: amount
				});
				// 明細行金額: 文字檔[AMOUNT]
				console.log("明細行金額:"+amount);
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_line_amount",
					line: i,
					value: amount
				});
				// 明細行稅額: 文字檔[TAX_AMOUNT]
				console.log("明細行稅額:"+tax);
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_tax_amount",
					line: i,
					value: tax
				});
				// 明細行總額: 文字檔[AMOUNT]+ 文字檔[TAX_AMOUNT]
				console.log("明細行總額:"+amount+tax);
				recRecord.setCurrentSublistValue({
					sublistId: sublistId_gui_id,
					fieldId: "custrecord_2_total_amount",
					line: i,
					value: amount+tax
				});
			}

			console.log("start save");
			recRecord.save({
				enableSourcing: true,
				ignoreMandatoryFields: true
			});
			if(index > 3){
				return false;
			}else{
				index++;
				return true;
			}
		});
		alert("All ready");
	}

	return {
		TransAnInvoice: TransAnInvoice
    }
});