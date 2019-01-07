/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Estimate] 從[專案]:[備註]帶入估價單之[專案備註]
 *
 * 
 */
define(['N/record', 'N/search', 'N/ui/message'],

    function (record, search, message) {
        debugger

        ///訊息顯示
        function showMessage(title, context) {
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

        //取得：下拉List選單(格式別 | 課稅別 | 扣抵代號)的value
        function getLookupCode(options) {
            var vLookupCode = "";
            if (options) {                
                var customrecord_ev_lookupsSearchObj = new search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                    [
                        ["name", "is", options]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                    ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj result count", searchResultCount);
                customrecord_ev_lookupsSearchObj.run().each(function (result) {
                    vLookupCode = result.getValue(result.columns[0]);
                    return false;
                });                
            }
            return vLookupCode;
        }

        //2.1.2 進項折讓資訊→欄位檢核
        function validateField(context) {
            debugger

            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            var searchResultCount = -1;

            //#region 取得：欄位資料[基本資料]
            //稅籍編號(下拉)
            var $ddlRegistrationNumber = currentRecord.getText({
                fieldId: 'custrecord_12_registration_number'
            });
            //折讓簿冊別(下拉)
            var $ddlGuiBookId = currentRecord.getText({
                fieldId: 'custrecord_12_gui_book_id'
            });
            //格式別(下拉)
            var $ddlFormatType = currentRecord.getText({
                fieldId: 'custrecord_12_format_type'
            });
            //課稅別(下拉)
            var $ddlTaxCode = currentRecord.getText({
                fieldId: 'custrecord_12_tax_code'
            });
            //扣抵代號(下拉)
            var $ddlCutCode = currentRecord.getText({
                fieldId: 'custrecord_12_cut_code'
            });
            //扣抵種類(下拉)
            var $ddlCutType = currentRecord.getText({
                fieldId: 'custrecord_12_cut_type'
            });
            //-------------------------------------------------------
            //所屬年
            var $lblOccuredYear = currentRecord.getValue({
                fieldId: 'custrecord_12_occured_year'
            });
            //所屬月
            var $lblOccuredMonth = currentRecord.getValue({
                fieldId: 'custrecord_12_occured_month'
            });
            //折讓日期(日期格式)
            var $txtGuiDate = currentRecord.getValue({
                fieldId: 'custrecord_12_gui_date'
            });
            //折讓單號(Textbox)
            var $txtOtherDesc = currentRecord.getValue({
                fieldId: 'custrecord_12_other_desc'
            });
            //資料類型(下拉)
            var $ddlDataType = currentRecord.getText({
                fieldId: 'custrecord_12_data_type'
            });
            //備註(Textbox)
            var $txtRemarksColumns = currentRecord.getValue({
                fieldId: 'custrecord_12_remarks_columns'
            });
            //-------------------------------------------------------
            //折讓金額(Textbox)
            var $txtSalesAmt = currentRecord.getValue({
                fieldId: 'custrecord_12_sales_amt'
            });
            //折讓稅額
            var $lblVatIo = currentRecord.getValue({
                fieldId: 'custrecord_12_vat_io'
            });
            //#endregion
            //#region 取得：欄位資料[廠商資訊]
            //廠商名稱(下拉)
            var $ddlVendorName = currentRecord.getText({
                fieldId: 'custrecord_12_vendor_name'
            });
            //廠商統一編號(Textbox)
            var $txtSalesNo = currentRecord.getValue({
                fieldId: 'custrecord_12_sales_no'
            });
            //#endregion
            //#region 欄位檢核

            //#region 2.1.2.1 折讓簿冊別/折讓日期
            //折讓日期不在折讓簿冊別的生 / 失效日期限中
            if (sublistFieldName === 'custrecord_12_registration_number'
                || sublistFieldName === 'custrecord_12_gui_book_id'
                || sublistFieldName === 'custrecord_12_gui_date') {

                if ($ddlRegistrationNumber
                    && $ddlGuiBookId
                    && $txtGuiDate) {
                    //折讓日期-年
                    var year = parseInt($txtGuiDate.getFullYear());
                    //折讓日期-月
                    var month = parseInt($txtGuiDate.getMonth());
                    //#region 取得：發票簿/折讓簿設定
                    var customrecord_ev_gui_books_allSearchObj = search.create({
                        type: "customrecord_ev_gui_books_all",
                        filters:
                        [
                            //稅籍編號
                            ["custrecord_19_registration_number", "anyof", $ddlRegistrationNumber], "AND",
                            //折讓簿冊別
                            ["custrecord_19_gui_book_no", "is", $ddlGuiBookId], "AND",
                            //折讓日期-年
                            ["custrecord_19_gui_year", "is", year], "AND",
                            //折讓日期-月；greaterthanorequalto為>=
                            ["custrecord_19_gui_start_month", "greaterthanorequalto", month], "AND",
                            ///折讓日期-月；lessthanorequalto:<=
                            ["custrecord_19_gui_end_month", "lessthanorequalto", month]
                        ],
                        columns:
                        [
                            search.createColumn({ name: "custrecord_19_gui_year", label: "年度" }),
                            search.createColumn({ name: "custrecord_19_gui_start_month", label: "起月" }),
                            search.createColumn({ name: "custrecord_19_gui_end_month", label: "迄月" })
                        ]
                    });
                    var searchResultCount = customrecord_ev_gui_books_allSearchObj.runPaged().count;
                    log.debug("customrecord_ev_gui_books_allSearchObj result count", searchResultCount);
                    customrecord_ev_gui_books_allSearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        return true;
                    });
                    //#endregion
                    if (searchResultCount == 0) {
                        showMessage("訊息", "此折讓日期未在折讓簿使用期間內");
                    }
                }
            }
            //#endregion

            //#region 2.1.2.2 稅籍編號/所屬年月(共用-待補)
            //確認該稅籍編號及所屬年月在開關帳設定中的狀態
            if (sublistFieldName === "custrecord_12_registration_number"
                || sublistFieldName === "custrecord_12_occured_year"
                || sublistFieldName === "custrecord_12_occured_month") {

                if ($ddlRegistrationNumber
                    && $lblOccuredYear
                    && $lblOccuredMonth) {

                    //#region 取得：開關帳設定
                    var customrecord_ev_apply_status_allSearchObj = search.create({
                        type: "customrecord_ev_apply_status_all",
                        filters:
                        [
                            //稅籍編號
                            ["custrecord_22_registration_number", "is", $ddlRegistrationNumber], "AND",
                            //所屬年
                            ["custrecord_22_occured_year", "is", $lblOccuredYear], "AND",
                            //所屬月
                            ["custrecord_22_occured_month", "equalto", $lblOccuredMonth]
                        ],
                        columns:
                        [
                            search.createColumn({ name: "custrecord_22_pay_apply_status", label: "進項" }),
                            search.createColumn({ name: "custrecord_22_declaration_flag", label: "已申報" })
                        ]
                    });
                    var searchResultCount = customrecord_ev_apply_status_allSearchObj.runPaged().count;
                    log.debug("customrecord_ev_apply_status_allSearchObj result count", searchResultCount);
                    customrecord_ev_apply_status_allSearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        //進項
                        var vPayApplyStatus = result.getValue(result.columns[0]);
                        //已申報
                        var vDeclarationFlag = result.getValue(result.columns[1]);
                        if (searchResultCount == 0) {
                            //2.1.2.2.1 若查無此稅籍編號/所屬年月資料
                            showMessage("訊息", "找不到此設定資料");
                        }
                        else {
                            switch (vDeclarationFlag) {
                                case "Yes":
                                    //2.1.2.2.2 若已申報為Yes
                                    showMessage("訊息", "該月份已申報");
                                    break;
                                case "No":
                                    //2.1.2.2.3 若已申報為No，則需判斷進項為CLOSE
                                    showMessage("訊息", "該月份已關帳");
                                    break;
                            }
                        }
                        return true;
                    });
                    //#endregion  
                }
            }
            //#endregion

            //#region 2.1.2.3 廠商統一編號(共用-待補)
            if (sublistFieldName === "custrecord_12_sales_no") {
                if ($txtSalesNo) {
                    //TODO:統一編號邏輯，待補
                    showMessage("訊息", "此統一編號不符合邏輯");
                }
            }
            //#endregion

            //#region 2.1.2.4 格式別/廠商統一編號(共用-待補)
            if (sublistFieldName === "custrecord_12_format_type") {
                var vFormat = getLookupCode($ddlFormatType);
                /*
                var vFormat = "";
                //#region 取得：下拉List選單(格式別)的value
                var customrecord_ev_lookupsSearchObj = search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                    [
                        ["name", "is", $ddlFormatType]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                    ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj result count", searchResultCount);
                customrecord_ev_lookupsSearchObj.run().each(function (result) {
                    vFormat = result.getValue(result.columns[0]);
                    return false;
                });
                //#endregion
                */
                if ((vFormat == "23" || vFormat == "29")
                    && !$txtSalesNo) {
                    showMessage("訊息", "格式代碼為23, 29時，請輸入統一編號");
                }
            }
            //#endregion

            //#region 2.1.2.5 課稅別/折讓稅額
            if (sublistFieldName === "custrecord_12_tax_code"
                || sublistFieldName === "custrecord_12_vat_io") {
                //1:應稅、2:零稅率、3:免稅
                var vTaxation = getLookupCode($ddlTaxCode);
                /*
                var vTaxation = "";
                //#region 取得：下拉List選單(課稅別)的value
                var customrecord_ev_lookupsSearchObj_Tax = search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                    [
                        ["name", "is", $ddlTaxCode]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                    ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj_Tax.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj_Tax result count", searchResultCount);
                customrecord_ev_lookupsSearchObj_Tax.run().each(function (resultTax) {
                    vTaxation = resultTax.getValue(resultTax.columns[0]);
                    return false;
                });
                //#endregion
                */
                if (vTaxation && vTaxation != "1" && $lblVatIo != "0") {
                    showMessage("訊息", "折讓稅額一定要為0");
                }
            }
            //#endregion

            //#region 2.1.2.6 課稅別/扣抵代號
            if (sublistFieldName === "custrecord_12_tax_code"
                || sublistFieldName === "custrecord_12_cut_code") {
                //1:應稅、2:零稅率、3:免稅  
                if ($ddlTaxCode && $ddlCutCode) {
                    var vTaxation = getLookupCode($ddlTaxCode);
                    var vDeduction = getLookupCode($ddlCutCode);
                    if ((vTaxation == "2" || vTaxation == "3")
                        && (vDeduction == "1" || vDeduction == "2")) {
                        showMessage("訊息", "課稅別為零稅或免稅時，則扣抵代號要為3或4");
                    }
                }
                /*
                //課稅別
                var vTaxation = "";
                //扣抵代號
                var vDeduction = "";
                if ($ddlTaxCode && $ddlCutCode) {
                    //#region 取得：下拉List選單(課稅別)的value
                    var customrecord_ev_lookupsSearchObj_Tax = search.create({
                        type: "customrecord_ev_lookups",
                        filters:
                        [
                            ["name", "is", $ddlTaxCode]
                        ],
                        columns:
                        [
                            search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                        ]
                    });
                    var searchResultCount = customrecord_ev_lookupsSearchObj_Tax.runPaged().count;
                    log.debug("customrecord_ev_lookupsSearchObj_Tax result count", searchResultCount);
                    customrecord_ev_lookupsSearchObj_Tax.run().each(function (resultTax) {
                        vTaxation = resultTax.getValue(resultTax.columns[0]);
                        return false;
                    });
                    //#endregion
                    //#region 取得：下拉List選單(扣抵代號)的value
                    var customrecord_ev_lookupsSearchObj_Ded = search.create({
                        type: "customrecord_ev_lookups",
                        filters:
                        [
                            ["name", "is", $ddlCutCode]
                        ],
                        columns:
                        [
                            search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                        ]
                    });
                    var searchResultCount = customrecord_ev_lookupsSearchObj_Ded.runPaged().count;
                    log.debug("customrecord_ev_lookupsSearchObj_Ded result count", searchResultCount);
                    customrecord_ev_lookupsSearchObj_Ded.run().each(function (result) {
                        vDeduction = result.getValue(result.columns[0]);
                        return false;
                    });
                    //#endregion
                    if ((vTaxation == "2" || vTaxation == "3")
                        && (vDeduction == "1" || vDeduction == "2")) {
                        showMessage("訊息", "課稅別為零稅或免稅時，則扣抵代號要為3或4");
                    }
                }
                */
            }
            //#endregion

            //#region 2.1.2.7 格式別/扣抵代號
            if (sublistFieldName === "custrecord_12_format_type"
                || sublistFieldName === "custrecord_12_cut_code") {
                if ($ddlFormatType && $ddlCutCode) {
                    var vFormat = getLookupCode($ddlFormatType);
                    var vDeduction = getLookupCode($ddlCutCode);
                    if (vFormat == "29"
                        && (vDeduction == "3" || vDeduction == "4")) {
                        showMessage("訊息", "格式別為29(海關退還溢繳營業稅)時，扣抵代號不得為3或4");
                    }
                }
                /*
                //格式別
                var vFormat = "";
                //扣抵代號
                var vDeduction = "";
                //#region 取得：下拉List選單(格式別)的value
                var customrecord_ev_lookupsSearchObj_Format = search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                    [
                        ["name", "is", $ddlFormatType]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                    ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj_Format.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj result count", searchResultCount);
                customrecord_ev_lookupsSearchObj_Format.run().each(function (result) {
                    vFormat = result.getValue(result.columns[0]);
                    return false;
                });
                //#endregion
                //#region 取得：下拉List選單(扣抵代號)的value
                var customrecord_ev_lookupsSearchObj_Ded = search.create({
                    type: "customrecord_ev_lookups",
                    filters:
                    [
                        ["name", "is", $ddlCutCode]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_lookups_code", label: "LOOKUP CODE" })
                    ]
                });
                var searchResultCount = customrecord_ev_lookupsSearchObj_Ded.runPaged().count;
                log.debug("customrecord_ev_lookupsSearchObj result count", searchResultCount);
                customrecord_ev_lookupsSearchObj_Ded.run().each(function (result) {
                    vDeduction = result.getValue(result.columns[0]);
                    return false;
                });
                //#endregion                
                
                if (vFormat == "29"
                    && (vDeduction == "3" || vDeduction == "4")) {
                    showMessage("訊息", "格式別為29(海關退還溢繳營業稅)時，扣抵代號不得為3或4");
                }
                */
            }
            //#endregion

            //#region 2.1.2.8 扣抵種類 | 2.1.2.9 資料類型/課稅別
            if (sublistFieldName === "custrecord_12_registration_number") {
                //#region 取得：申報類別資料
                var customrecord_ev_registrations_allSearchObj = search.create({
                    type: "customrecord_ev_registrations_all",
                    filters:
                    [
                        ["name", "is", $ddlRegistrationNumber]
                    ],
                    columns:
                    [
                        search.createColumn({ name: "custrecord_18_declare_type", label: "DECLARE_TYPE" }),
                        search.createColumn({ name: "custrecord_18_declare_method", label: "DECLARE_METHOD" })
                    ]
                });
                var searchResultCount = customrecord_ev_registrations_allSearchObj.runPaged().count;
                log.debug("customrecord_ev_registrations_allSearchObj result count", searchResultCount);
                customrecord_ev_registrations_allSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    //申報類別
                    var vDeclareType = result.getValue(result.columns[0]);
                    //扣抵法
                    var vDeclareMethod = result.getValue(result.columns[1]);
                    //#region 2.1.2.8 扣抵種類
                    //檢核稅籍資料設定申報類別及扣抵法
                    if (sublistFieldName === "custrecord_12_registration_number"
                        || sublistFieldName === "custrecord_12_cut_type") {
                        switch (vDeclareType) {
                            case "401":
                                //2.1.2.8.1 若申報類別為「401」，則此欄位不為空值
                                if (!$ddlCutType) {
                                    showMessage("訊息", "此稅編申報類型為401時，扣抵種類須為空值");
                                }
                                break;
                            case "403":
                                switch (vDeclareMethod) {
                                    case "比例扣抵法":
                                        //2.1.2.8.2 若申報類別為「403」且扣抵法為「比例扣抵法」，則扣抵種類為空值
                                        if (!$ddlCutType) {
                                            showMessage("訊息", "此稅編之申報類型為403比例扣抵法時，則不允許輸入扣抵種類");
                                        }
                                        break;
                                    case "直接扣抵法":
                                        //2.1.2.8.3 若申報類別為「403」且扣抵法為「直接扣抵法」，則扣抵種類不為空值
                                        if ($ddlCutType) {
                                            showMessage("訊息", "此稅編之申報類型為403直接扣抵法時，扣抵種類不得為空值");
                                        }
                                        break;
                                }
                                break;
                        }
                    }
                    //#endregion
                    //#region 2.1.2.9 資料類型/課稅別
                    //檢核稅籍資料設定的申報類型
                    if (sublistFieldName === "custrecord_12_registration_number"
                        || sublistFieldName === "custrecord_12_data_type"
                        || sublistFieldName === "custrecord_12_tax_code") {

                        switch (vDeclareType) {
                            case "401":
                                //2.1.2.9.1 申報類型若為401，則此資料類型欄位須為空
                                if (!$ddlDataType) {
                                    showMessage("訊息", "此稅編申報類型為401時，資料類型須為空值");
                                }
                                break;
                            case "403":
                                switch ($ddlDataType) {
                                    case "進口免稅貨物":
                                        //2.1.2.8.2 申報類型若為403，資料類型為「進口免稅貨物」且課稅別不為「免稅」
                                        if ($ddlTaxCode != "免稅") {
                                            showMessage("訊息", "進口免稅貨物，課稅別須為免稅");
                                        }
                                        break;
                                    case "購買國外勞務":
                                        //2.1.2.9.3 申報類型若為403，資料類型為「購買國外勞務」且課稅別為「應稅」
                                        if ($ddlTaxCode != "應稅") {
                                            showMessage("訊息", "購買國外勞務，課稅別不得為應稅");
                                        }
                                        break;
                                }
                                break;
                        }
                    }
                    //#endregion
                    return true;
                });
                //#endregion
            }
            //#endregion

            //#endregion

            return true;
        }

        return {
            validateField: validateField
        };

    });
