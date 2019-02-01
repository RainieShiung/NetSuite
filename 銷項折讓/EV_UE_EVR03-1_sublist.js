/**
* @NApiVersion 2.x
* @NScriptType UserEventScript
* @NModuleScope SameAccount
* 銷項折讓明細-存檔前檢核
*/
define(['N/search', 'N/record', 'N/ui/message', 'N/error'],

	function (search, record, message, error) {

		//#region 資料表 | 欄位名稱
		/** @description  發票簿/折讓簿設定*/ var $tbInvoiceDiscountBookSetting = "customrecord_ev_gui_books_all";
		/** @description  銷項折讓明細*/ var $tbSalesDiscountDetails = "recmachcustrecord_4_gui_id";

        /** @description  憑證類別*/ var $colGuiType = "custrecord_4_prev_gui_type";
        /** @description  憑證號碼*/ var $colGuiId = "custrecord_4_prev_gui_id";
        /** @description  憑證日期*/ var $colGuiDate = "custrecord_4_gui_date_x";
        /** @description  憑證金額*/ var $colGuiSalesAmt = "custrecord_4_gui_sales_amt_x";
        /** @description  憑證稅額*/ var $colGuiVatIo = "custrecord_4_gui_vat_io_x";
        /** @description  已折讓金額*/ var $colGuiLineAmt = "custrecord_4_cm_gui_line_amount_x";
        /** @description  已折讓稅額*/ var $colGuiTaxAmt = "custrecord_4_cm_gui_tax_amount_x";
        /** @description  折讓金額*/ var $colLineNtdAmt = "custrecord_4_line_ntd_amount";
		/** @description  折讓稅額*/ var $colTaxNtdAmt = "custrecord_4_tax_ntd_amount";

		/** @description  折讓單號*/ var $colDiscountNum = "custrecord_3_other_desc";//custrecord_12_other_desc
		/** @description  稅籍編號*/ var $colRegistrationNum = "custrecord_3_registration_number";
        /** @description  折讓簿冊別*/ var $colGuiBookId = "custrecord_3_gui_book_id";
		//#endregion

		function beforeSubmit(context) {
			/** @description 原Record */var oldRecord = context.oldRecord;
			/** @description 新Record */var newRecord = context.newRecord;
			/** @description 目前Record */var currentRecord = newRecord;
			/** @description 是否有錯誤 */var isError = false;

			//其他憑證(折讓單號)
			newRecord.setValue({
				fieldId: $colDiscountNum,
				value: "other_desc"
			});

			if (newRecord != null) {
				/** @description 銷項折讓明細的sublist數 */
				var vLineCount = newRecord.getLineCount({ "sublistId": $tbSalesDiscountDetails });

				/** @description 明細折讓金額總額 */var vTotalLineAmount = 0;
				/** @description 明細折讓稅額總額 */var vTotalTaxAmount = 0;

				/** @description 所有目前的憑證號碼 */
				var vAllGuiNos = "";
				/** @description 所有(目前的憑證號碼，目前的折讓金額，目前的折讓稅額) */
				var vAllInfos = "";

				if (vLineCount > 0) {
					for (var i = 0; i < vLineCount; i++) {
						//#region 銷項折讓明細的憑證號碼，有兩筆以上相同的話 秀錯誤訊息
						if (i < Math.round(vLineCount / 2)) {
							var display_I = currentRecord.getSublistValue({
								sublistId: $tbSalesDiscountDetails,
								fieldId: $colGuiId,
								line: i
							});
							for (var j = i + 1; j < vLineCount; j++) {
								var display_J = currentRecord.getSublistValue({
									sublistId: $tbSalesDiscountDetails,
									fieldId: $colGuiId,
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
						//#endregion
						/** @description 目前的憑證號碼 */
						var vCurrentGuiNo = currentRecord.getSublistValue({
							sublistId: $tbSalesDiscountDetails,
							fieldId: $colGuiId,
							line: i
						});

						/** @description 目前的折讓金額 */
						var vCurrentLineNtdAmt = currentRecord.getSublistValue({
							sublistId: $tbSalesDiscountDetails,
							fieldId: $colLineNtdAmt,
							line: i
						});

						/** @description 目前的折讓稅額 */
						var vCurrentTaxNtdAmt = currentRecord.getSublistValue({
							sublistId: $tbSalesDiscountDetails,
							fieldId: $colTaxNtdAmt,
							line: i
						});

						vTotalLineAmount += vCurrentLineNtdAmt;
						vTotalTaxAmount += vCurrentTaxNtdAmt;
						vAllGuiNos += vCurrentGuiNo + "#";
						vAllInfos += vCurrentGuiNo + "," + vCurrentLineNtdAmt + "," + vCurrentTaxNtdAmt + "#";
					}

					if (vTotalLineAmount == 0) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓明細累計總額不得為0'
						});
						throw err.message;
					}

					/** @description 新的折讓金額 */
					var vNewSalesAmt = newRecord.getValue($colLineNtdAmt);
					if (vTotalLineAmount != vNewSalesAmt) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓金額與折讓明細累計金額不符'
						});
						throw err.message;
					}

					/** @description 新的折讓稅額 */
					var vNewVatIo = newRecord.getValue($colTaxNtdAmt);
					if (vTotalTaxAmount != vNewVatIo) {
						var err = error.create({
							name: '系統訊息',
							message: '折讓稅額與折讓明細累計稅額不符'
						});
						throw err.message;
					}

					vAllGuiNos = vAllGuiNos.length > 1 ? vAllGuiNos.substring(0, vAllGuiNos.length - 1) : "";
					vAllInfos = vAllInfos.length > 1 ? vAllInfos.substring(0, vAllInfos.length - 1) : "";
				}

				//依憑證號碼回寫至銷項發票資訊的已折讓金額及已折讓稅額
				/** @description 欲回寫的憑證號碼 */
				var vGuiNos = vAllGuiNos.length > 1 ? vAllGuiNos.split("#") : "";
				/** @description 欲回寫的發票資訊 */
				var vInfos = vAllInfos.length > 1 ? vAllInfos.split("#") : "";

				//---save---//
				if (!isError) {
					//#region 2.4.1
					/** @description  稅籍編號*/
					var vRegNum = currentRecord.getValue($colRegistrationNum);
					/** @description  折讓簿冊*/
					var vBookId = currentRecord.getText($colGuiBookId);
					/** @description  折讓單號*///custrecord_12_other_desc
					var vDiscountNum = "";

					//#region 取得：發票簿/折讓簿設定，依條件(折讓簿冊別、稅籍編號)
					/** @description  取得：發票簿/折讓簿設定資料*/
					var customrecord_ev_gui_books_allSearchObj = search.create({
						type: "customrecord_ev_gui_books_all",
						filters:
							[
								["name", "is", vBookId],
								"AND",
								["custrecord_19_registration_number", "anyof", vRegNum]
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
					/** @description  發票簿/折讓簿設定資料筆數*/
					var gui_bookssearchResultCount = customrecord_ev_gui_books_allSearchObj.runPaged().count;
					//#endregion

					if (gui_bookssearchResultCount == 1) {
						/** @description  目前使用號碼*/var vCurrentNum = "";
                    	/** @description  字軌*/var vWord = "";
                    	/** @description  起始號碼*/var vSNum = "";
						/** @description  Internal ID*/var vInternalId = "";
						customrecord_ev_gui_books_allSearchObj.run().each(function (result) {
							vCurrentNum = result.getValue({ name: 'custrecord_19_gui_cur_number' });
							vWord = result.getValue({ name: 'custrecord_19_gui_word' });
							vSNum = result.getValue({ name: 'custrecord_19_gui_start_number' });
							vInternalId = result.getValue({ name: 'internalid' });
							return false;
						});

						if (vCurrentNum == "") {
							vDiscountNum = vWord + vSNum;
						} else {
							vDiscountNum = vWord + (vCurrentNum + 1);
						}

						newRecord.setValue({
							fieldId: $colDiscountNum,
							value: vDiscountNum
						});

						var bookRecord = record.load({
							type: $tbInvoiceDiscountBookSetting,
							id: vInternalId,
							isDynamic: true
						});

						bookRecord.setValue({
							fieldId: 'custrecord_19_gui_cur_number',
							value: vDiscountNum.substring(2, 10)
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

					//#region 2.4.2 將銷項折讓明細的折讓金額與折讓稅額，依憑證號碼回寫至銷項發票資訊的已折讓金額及已折讓稅額
					/** @description  銷項發票資訊*/
					var $tbSalesInvoiceInfo = "customrecord_ev_rec_invoices_all";
					/** @description  發票號碼*/
					var $colGuiNo = "custrecord_1_gui_no";
					/** @description  已折讓未稅金額*/
					var $colGuiLineAmt = "custrecord_1_cm_gui_line_amount";
					/** @description  已折讓稅額*/
					var $colGuiTaxAmt = "custrecord_1_cm_gui_tax_amount";

					//取得：憑證號碼
					//customrecord_ev_rec_invoices_allSearchObj
					var customrecord_ev_pay_invoices_allSearchObj = search.create({
						type: $tbSalesInvoiceInfo,
						filters:
							[
								["custrecord_1_gui_no", "is", vGuiNos]
							],
						columns:
							[
								search.createColumn({ name: $colGuiNo, label: "發票號碼" }),
								search.createColumn({ name: $colGuiLineAmt, label: "已折讓未稅金額" }),
								search.createColumn({ name: $colGuiTaxAmt, label: "已折讓稅額" })
							]
					});
					// var customrecord_ev_pay_invoices_allSearchObj = search.create({
					// 	type: $tbSalesInvoiceInfo,
					// 	filters:
					// 		[
					// 			search.createFilter({
					// 				name: $colGuiNo,
					// 				operator: "is",
					// 				values: vGuiNos
					// 			})
					// 		],
					// 	columns:
					// 		[
					// 			search.createColumn({
					// 				name: "id",
					// 				sort: search.Sort.ASC,
					// 				label: "ID"
					// 			}),
					// 			search.createColumn({name: "custrecord_1_gui_id", label: "GUI_ID"}),
					// 			search.createColumn({ name: $colGuiNo, label: "發票號碼" }),
					// 			search.createColumn({ name: $colGuiLineAmt, label: "CM_GUI_LINE_AMOUNT" }),
					// 			search.createColumn({ name: $colGuiTaxAmt, label: "CM_GUI_TAX_AMOUNT" })
					// 		]
					// });
					var searchResultCount = customrecord_ev_pay_invoices_allSearchObj.runPaged().count;

					//待處理
					customrecord_ev_pay_invoices_allSearchObj.run().each(function (result) {
						/** @description  發票號碼*/
						var gui_no = result.getValue({
							name: $colGuiNo
						});
						for (var i = 0; i < vInfos.length; i++) {
							/** @description  0:發票號碼 1:折讓金額 2:折讓稅額*/
							var Item_gui_no = vInfos[i].split(',');
							if (Item_gui_no[0] == gui_no) {
								/** @description  已折讓未稅金額*/
								var line_amount = result.getValue({ name: $colGuiLineAmt });
								/** @description  已折讓稅額*/
								var tax_amount = result.getValue({ name: $colGuiTaxAmt });

								var invoicesRecord = record.load({
									type: $tbSalesInvoiceInfo,
									id: result.getValue({ name: 'id' }),
									isDynamic: true
								});

								invoicesRecord.setValue({
									fieldId: $colGuiLineAmt,
									value: line_amount - parseInt(Item_gui_no[1])
								});

								invoicesRecord.setValue({
									fieldId: $colGuiTaxAmt,
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
			return !isError;
		}

		// function beforeLoad(scriptContext) {
		// 	var form = scriptContext.form;
		// 	if (scriptContext.type == 'edit') //edit模式才有作廢
		// 	{
		// 		form.clientScriptModulePath = './Invalid.js';
		// 		//作廢
		// 		form.addButton({
		// 			id: "custpage_outsourcing",
		// 			label: "作廢",
		// 			functionName: "Invalid_PayInvoices()"
		// 		});
		// 	}
		// };

		return {
			beforeSubmit: beforeSubmit
			//beforeLoad: beforeLoad
		};

	});
