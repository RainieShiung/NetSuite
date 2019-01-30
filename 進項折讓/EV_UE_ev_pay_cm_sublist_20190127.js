/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* 進項折讓明細-存檔前檢核
*/
define(['N/search', 'N/record', 'N/ui/message', 'N/error'],

	function (search, record, message, error) {
		function beforeSubmit(context) {
			var oRec = context.oldRecord;
			var nRec = context.newRecord;
			var IsError = false;
			var currentRecord = nRec;

			//其他憑證(折讓單號)
			nRec.setValue({
				fieldId: 'custrecord_12_other_desc',
				value: "other_desc"
			});

			if (nRec != null) {
				// How many lines are on the Items sublist?
				var LineCount = nRec.getLineCount({ "sublistId": "recmachcustrecord_13_parent_id" });//進項折讓明細
				var total_line_amount = 0;	//明細折讓金額總額
				var total_tax_amount = 0;	//明細折讓稅額總額
				var all_gui_no = '';
				var all_gui_no_List = '';
				if (LineCount > 0) {
					for (var i = 0; i < LineCount; i++) {
						//進項折讓明細的憑證號碼，有兩筆以上相同的話 秀錯誤訊息
						if (i < Math.round(LineCount / 2)) {
							var display_I = currentRecord.getSublistValue({
								sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
								fieldId: 'custrecord_13_gui_number_display',//憑證號碼
								line: i
							});
							for (var j = i + 1; j < LineCount; j++) {
								var display_J = currentRecord.getSublistValue({
									sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
									fieldId: 'custrecord_13_gui_number_display',//憑證號碼
									line: j
								});
								if (display_J == display_I) {
									var err = error.create({
										name: '無法修改',
										message: '憑證號碼重複'
									});
									throw err.message;
								}
							}
						}
						//
						var gui_no = currentRecord.getSublistValue({
							sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
							fieldId: 'custrecord_13_gui_number',//憑證號碼
							line: i
						});

						var line_ntd_amount = currentRecord.getSublistValue({
							sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
							fieldId: 'custrecord_13_line_ntd_amount',//折讓金額
							line: i
						});
						total_line_amount += line_ntd_amount;

						var tax_ntd_amount = currentRecord.getSublistValue({
							sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
							fieldId: 'custrecord_13_tax_ntd_amount',//折讓稅額
							line: i
						});
						total_tax_amount += tax_ntd_amount;

						// var unit_price = currentRecord.getSublistValue({
						// 	sublistId: 'recmachcustrecord_13_parent_id',//進項折讓明細
						// 	fieldId: 'custrecord_13_unit_price',
						// 	line: i
						// });
						// totalPrice += unit_price;

						all_gui_no += gui_no + "#";
						all_gui_no_List += gui_no + "," + line_ntd_amount + "," + tax_ntd_amount + "#";
					}
					if (total_line_amount == 0) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓明細累計總額不得為0'
						});
						throw err.message;
					}
					var sales_amt = nRec.getValue("custrecord_12_sales_amt");
					if (total_line_amount != sales_amt) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓金額與折讓明細累計金額不符'
						});
						throw err.message;
					}
					var vat_io = nRec.getValue("custrecord_12_vat_io");
					if (total_tax_amount != vat_io) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓稅額與折讓明細累計稅額不符'
						});
						throw err.message;
					}
					all_gui_no = all_gui_no.substring(0, all_gui_no.length - 1)
					all_gui_no_List = all_gui_no_List.substring(0, all_gui_no_List.length - 1)
				}

				var gui_nos = all_gui_no.split("#");	//依憑證號碼回寫至進項發票資訊的已折讓金額及已折讓稅額
				var gui_no_List = all_gui_no_List.split("#");

				//---save---//
				if (!IsError) {
					//#region 取得折讓單號
					var registration_number = currentRecord.getValue('custrecord_12_registration_number');	//稅籍編號
					var book_id = currentRecord.getText('custrecord_12_gui_book_id');		//折讓簿冊
					var other_desc = "";	//折讓單號 custrecord_12_other_desc

					var customrecord_ev_gui_books_allSearchObj = search.create({
						type: "customrecord_ev_gui_books_all",
						filters:
							[
								["name", "is", book_id],
								"AND",
								["custrecord_19_registration_number", "anyof", registration_number]
							],
						columns:
							[
								search.createColumn({ name: "custrecord_19_gui_cur_number", label: "目前使用號碼" }),
								search.createColumn({ name: "custrecord_19_gui_word", label: "字軌" }),
								search.createColumn({ name: "custrecord_19_gui_start_number", label: "起始號碼" }),
								search.createColumn({ name: "custrecord_19_registration_number", label: "稅籍編號" }),
								search.createColumn({ name: "custrecord_19_gui_type", label: "發票簿類別" }),
								search.createColumn({ name: "internalid", label: "Internal ID" })
							]
					});
					var gui_bookssearchResultCount = customrecord_ev_gui_books_allSearchObj.runPaged().count;

					if (gui_bookssearchResultCount == 1) {
						var cur_number = '';
						var word = '';
						var start_number = '';
						var internalid = '';
						customrecord_ev_gui_books_allSearchObj.run().each(function (result) {
							cur_number = result.getValue({
								name: 'custrecord_19_gui_cur_number'
							});
							word = result.getValue({
								name: 'custrecord_19_gui_word'
							});
							start_number = result.getValue({
								name: 'custrecord_19_gui_start_number'
							});
							internalid = result.getValue({
								name: 'internalid'

							});
							return false;
						});
						if (cur_number == "") {
							other_desc = word + start_number;
						} else {
							other_desc = word + (cur_number + 1);
						}

						nRec.setValue({
							fieldId: 'custrecord_12_other_desc',
							value: other_desc
						});

						var bookRecord = record.load({
							type: 'customrecord_ev_gui_books_all',
							id: internalid,
							isDynamic: true
						});

						bookRecord.setValue({
							fieldId: 'custrecord_19_gui_cur_number',
							value: other_desc.substring(2, 10)
						});
						//更新回寫該折讓簿冊的目前使用號碼
						bookRecord.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						});
					} else {
						var err = error.create({
							name: '系統訊息',
							message: '找不到折讓單號'
						});
						throw err.message;
					}
					//#endregion

					//#region 將進項折讓明細的折讓金額與折讓稅額，依憑證號碼回寫至進項發票資訊的已折讓金額及已折讓稅額
					//取得：憑證號碼
					var customrecord_ev_pay_invoices_allSearchObj = search.create({
						type: "customrecord_ev_pay_invoices_all",
						filters:
							[
								search.createFilter({
									name: 'custrecord_10_gui_no',
									operator: "is",
									values: gui_nos
								})
							],
						columns:
							[
								search.createColumn({
									name: "id",
									sort: search.Sort.ASC,
									label: "ID"
								}),
								search.createColumn({ name: "custrecord_10_gui_no", label: "發票號碼" }),
								search.createColumn({ name: "custrecord_10_cm_gui_line_amount", label: "CM_GUI_LINE_AMOUNT" }),
								search.createColumn({ name: "custrecord_10_cm_gui_tax_amount", label: "CM_GUI_TAX_AMOUNT" })
							]
					});
					var searchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;

					customrecord_ev_pay_invoices_allSearchObj.run().each(function (result) {
						var gui_no = result.getValue({
							name: 'custrecord_10_gui_no'
						});
						for (var i = 0; i < gui_no_List.length; i++) {
							var Item_gui_no = gui_no_List[i].split(',');	//Item_gui_no  0:發票號碼 1:折讓金額 2:折讓稅額
							if (Item_gui_no[0] == gui_no) {
								var line_amount = result.getValue({ name: 'custrecord_10_cm_gui_line_amount' });
								var tax_amount = result.getValue({ name: 'custrecord_10_cm_gui_tax_amount' });

								var invoicesRecord = record.load({
									type: 'customrecord_ev_pay_invoices_all',
									id: result.getValue({ name: 'id' }),
									isDynamic: true
								});

								invoicesRecord.setValue({
									fieldId: 'custrecord_10_cm_gui_line_amount',
									value: line_amount - parseInt(Item_gui_no[1])
								});
								invoicesRecord.setValue({
									fieldId: 'custrecord_10_cm_gui_tax_amount',
									value: tax_amount - parseInt(Item_gui_no[2])
								});

								invoicesRecord.save({
									enableSourcing: true,
									ignoreMandatoryFields: true
								});
								break;
							}
						}
						return true;
					});
					//#endregion
				}
			}
			return !IsError;
		}

		function beforeLoad(scriptContext) {
			var form = scriptContext.form;
			if (scriptContext.type == 'edit') //edit模式才有作廢
			{
				form.clientScriptModulePath = './Invalid.js';
				//作廢
				form.addButton({
					id: "custpage_outsourcing",
					label: "作廢",
					functionName: "Invalid_PayInvoices()"
				});
			}
		};

		return {
			beforeSubmit: beforeSubmit,
			beforeLoad: beforeLoad
		};

	});
