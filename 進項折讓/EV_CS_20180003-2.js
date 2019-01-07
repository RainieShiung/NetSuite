/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search', 'N/ui/message', './Common_ColumnCheck'],


    function (record, search, message, common) {
        //訊息顯示
        /**
         * @description 訊息顯示
         * @param {string} title 提示
         * @param {string} context 顯示的訊息
         */
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
        /**
         * @description 取得：下拉List選單(格式別 | 課稅別 | 扣抵代號)的value
         * @param {string} options 下拉選單值
         * @return {string} 回傳LookupCode
         */
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

        //檢核：統一編號
        /**
         * @description 檢核：統一編號
         * @param {stirng} taxId 統一編號
         * @returns {boolean} true:檢核成功；false:檢核失敗
         */
        function isValidGUI(taxId) {
            var invalidList = "00000000,11111111";
            if (/^\d{8}$/.test(taxId) == false || invalidList.indexOf(taxId) != -1) {
                return false;
            }

            var validateOperator = [1, 2, 1, 2, 1, 2, 4, 1],
                sum = 0,
                calculate = function (product) { // 個位數 + 十位數
                    var ones = product % 10,
                        tens = (product - ones) / 10;
                    return ones + tens;
                };
            for (var i = 0; i < validateOperator.length; i++) {
                sum += calculate(taxId[i] * validateOperator[i]);
            }

            return sum % 10 == 0 || (taxId[6] == "7" && (sum + 1) % 10 == 0);
        };

        //2.1.1 進折資訊→欄位檢核
        /**
         * @description 2.1.1 進折資訊→欄位檢核
         * @param {any} context 
         */
        function validateField(context) {

            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            var line = context.line;
            var searchResultCount = -1;

            //#region 取得：欄位資料[Primary Information]
            /** @description Vendor(下拉) @returns Text*/
            var $ddlVendor = currentRecord.getText({
                fieldId: 'entity'
            });
            //#endregion

            //#region 取得：欄位資料[進折資訊]
            /** @description GUI_ID(下拉) @returns Text*/
            var $GuiId = currentRecord.getText({
                fieldId: 'custbody34'
            });
            /** @description 折讓簿冊別(下拉) @returns Text */
            var $ddlGuiBookId = currentRecord.getText({
                fieldId: 'custbody43'
            });
            /** @description 稅籍編號(下拉) @returns Text*/
            var $ddlRegistrationNumber = currentRecord.getText({
                fieldId: 'custbody35'
            });
            /** @description 稅籍編號(下拉) @returns Value*/
            var $ddlRegistrationNumberVal = currentRecord.getValue({
                fieldId: 'custbody35'
            });
            //-------------------------------------------------------
            /** @description 折讓日期(日期格式)*/
            var $txtGuiDate = currentRecord.getValue({
                fieldId: 'custbody41'
            });
            /** @description 格式別(下拉) @returns Text*/
            var $ddlFormatType = currentRecord.getText({
                fieldId: 'custbody37'
            });
            /** @description 課稅別(下拉) @returns Text */
            var $ddlTaxCode = currentRecord.getText({
                fieldId: 'custbody38'
            });
            //-------------------------------------------------------
            /** @description 扣抵代號(下拉) @returns Text */
            var $ddlCutCode = currentRecord.getText({
                fieldId: 'custbody39'
            });
            /** @description 扣抵種類(下拉) @returns Text*/
            var $ddlCutType = currentRecord.getText({
                fieldId: 'custbody40'
            });
            /** @description 資料類型(下拉) @returns Text */
            var $ddlDataType = currentRecord.getText({
                fieldId: 'custbody42'
            });
            //#endregion

            //#region 欄位檢核
            //#region 2.1.1.1 折讓簿冊別/折讓日期            
            //折讓日期不在折讓簿冊別的生 / 失效日期限中
            if (sublistFieldName === 'custbody35'
                || sublistFieldName === 'custbody41'
                || sublistFieldName === 'custbody43') {
                if ($ddlRegistrationNumber
                    && $ddlGuiBookId
                    && $txtGuiDate) {
                    //折讓日期-年
                    var vYear = parseInt($txtGuiDate.getFullYear(), 10);
                    //折讓日期-月
                    var vMonth = parseInt($txtGuiDate.getMonth(), 10) + 1;
                    //#region 取得：發票簿/折讓簿設定
                    var customrecord_ev_gui_books_allSearchObj = search.create({
                        type: "customrecord_ev_gui_books_all",
                        filters:
                            [
                                ["custrecord_19_registration_number", "anyof", $ddlRegistrationNumberVal],
                                "AND", ["name", "is", $ddlGuiBookId],
                                "AND", ["custrecord_19_gui_year", "equalto", vYear],
                                "AND", ["custrecord_19_gui_start_month", "lessthanorequalto", vMonth],
                                "AND", ["custrecord_19_gui_end_month", "greaterthanorequalto", vMonth]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),
                                search.createColumn({ name: "scriptid", label: "Script ID" }),
                                search.createColumn({ name: "custrecord_19_registration_number", label: "稅籍編號" }),
                                search.createColumn({ name: "custrecord_19_gui_type", label: "發票簿類別" }),
                                search.createColumn({ name: "custrecord_19_gui_year", label: "年度" }),
                                search.createColumn({ name: "custrecord_19_gui_start_month", label: "起月" }),
                                search.createColumn({ name: "custrecord_19_gui_end_month", label: "迄月" }),
                                search.createColumn({ name: "custrecord_19_gui_book_no", label: "冊別" })
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

            //#region 2.1.1.2 稅籍編號/所屬年月(共用)[不檢核]
            //確認該稅籍編號及所屬年月在開關帳設定中的狀態
            /*
            if (sublistFieldName === "custbody35"
                || sublistFieldName === "所屬年"
                || sublistFieldName === "所屬月") {

                if ($ddlRegistrationNumber
                    && $lblOccuredYear
                    && $lblOccuredMonth) {
                    common.DateCheck($lblOccuredYear, $lblOccuredMonth, $ddlRegistrationNumberVal);
                }
            }
            */
            //#endregion

            //#region 2.1.1.3 廠商統一編號(共用)[不檢核]
            /*
            if (sublistFieldName === "廠商統一編號(Textbox)") {
                if ($txtSalesNo) {
                    if (isValidGUI($txtSalesNo) == false) {
                        showMessage("訊息", "此統一編號不符合邏輯");
                    }
                }
            }
            */
            //#endregion

            //#region 2.1.1.4 格式別/廠商統一編號(共用)            
            if (sublistFieldName === "custbody37"
                || sublistFieldName === "entity") {
                if ($ddlFormatType && $ddlVendor) {
                    var vFormat = getLookupCode($ddlFormatType);
                    var vSalesNo = common.SetValueSalesNo($ddlVendor);
                    if ((vFormat == "23" || vFormat == "29")
                        && !vSalesNo) {
                        showMessage("訊息", "格式代碼為23, 29時，請輸入統一編號");
                    }
                }
            }
            //#endregion

            //#region 2.1.1.5 課稅別/折讓稅額[不檢核]
            /*
            if (sublistFieldName === "custbody38"
                || sublistFieldName === "折讓稅額") {
                //1:應稅、2:零稅率、3:免稅
                var vTaxation = getLookupCode($ddlTaxCode);
                if (vTaxation && vTaxation != "1" && $lblVatIo != "0") {
                    showMessage("訊息", "折讓稅額一定要為0");
                }
            }
            */
            //#endregion

            //#region 2.1.1.6 課稅別/扣抵代號
            if (sublistFieldName === "custbody38"
                || sublistFieldName === "custbody39") {
                //1:應稅、2:零稅率、3:免稅  
                if ($ddlTaxCode && $ddlCutCode) {
                    var vTaxation = getLookupCode($ddlTaxCode);
                    var vDeduction = getLookupCode($ddlCutCode);
                    if ((vTaxation == "2" || vTaxation == "3")
                        && (vDeduction == "1" || vDeduction == "2")) {
                        showMessage("訊息", "課稅別為零稅或免稅時，則扣抵代號要為3或4");
                    }
                }
            }
            //#endregion

            //#region 2.1.1.7 格式別/扣抵代號
            if (sublistFieldName === "custbody37"
                || sublistFieldName === "custbody39") {
                if ($ddlFormatType && $ddlCutCode) {
                    var vFormat = getLookupCode($ddlFormatType);
                    var vDeduction = getLookupCode($ddlCutCode);
                    if (vFormat == "29"
                        && (vDeduction == "3" || vDeduction == "4")) {
                        showMessage("訊息", "格式別為29(海關退還溢繳營業稅)時，扣抵代號不得為3或4");
                    }
                }
            }
            //#endregion

            //#region 2.1.1.8 扣抵種類 | 2.1.1.9 資料類型/課稅別
            if (sublistFieldName === "custbody35"
                || sublistFieldName === "custbody40"
                || sublistFieldName === "custbody42"
                || sublistFieldName === "custbody38") {
                var vDeclareType = "";//申報類別                
                var vDeclareMethod = "";//扣抵法
                if ($ddlRegistrationNumber) {
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
                        vDeclareType = result.getText(result.columns[0]);
                        //扣抵法
                        vDeclareMethod = result.getText(result.columns[1]);
                        return false;
                    });
                    //#endregion
                    //#region 2.1.1.8 扣抵種類
                    //檢核稅籍資料設定申報類別及扣抵法
                    if (sublistFieldName === "custbody35"
                        || sublistFieldName === "custbody40") {
                        switch (vDeclareType) {
                            case "401":
                                //2.1.1.8.1 若申報類別為「401」，則此欄位不為空值
                                if ($ddlCutType != "") {
                                    showMessage("訊息", "此稅編申報類型為401時，扣抵種類須為空值");
                                }
                                break;
                            case "403":
                                switch (vDeclareMethod) {
                                    case "比例扣抵法":
                                        //2.1.1.8.2 若申報類別為「403」且扣抵法為「比例扣抵法」，則扣抵種類為空值
                                        if ($ddlCutType != "") {
                                            showMessage("訊息", "此稅編之申報類型為403比例扣抵法時，則不允許輸入扣抵種類");
                                        }
                                        break;
                                    case "直接扣抵法":
                                        //2.1.1.8.3 若申報類別為「403」且扣抵法為「直接扣抵法」，則扣抵種類不為空值
                                        if ($ddlCutType == "") {
                                            showMessage("訊息", "此稅編之申報類型為403直接扣抵法時，扣抵種類不得為空值");
                                        }
                                        break;
                                }
                                break;
                        }
                    }
                    //#endregion
                    //#region 2.1.1.9 資料類型/課稅別
                    //檢核稅籍資料設定的申報類型
                    if (sublistFieldName === "custbody35"
                        || sublistFieldName === "custbody42"
                        || sublistFieldName === "custbody38") {
                        switch (vDeclareType) {
                            case "401":
                                //2.1.1.9.1 申報類型若為401，則此資料類型欄位須為空
                                if ($ddlDataType != "") {
                                    showMessage("訊息", "此稅編申報類型為401時，資料類型須為空值");
                                }
                                break;
                            case "403":
                                switch ($ddlDataType) {
                                    case "進口免稅貨物":
                                        //2.1.1.9.2 申報類型若為403，資料類型為「進口免稅貨物」且課稅別不為「免稅」
                                        if (getLookupCode($ddlTaxCode) != "3") {
                                            showMessage("訊息", "進口免稅貨物，課稅別須為免稅");
                                        }
                                        break;
                                    case "購買國外勞務":
                                        //2.1.1.9.3 申報類型若為403，資料類型為「購買國外勞務」且課稅別為「應稅」
                                        if (getLookupCode($ddlTaxCode) == "1") {
                                            showMessage("訊息", "購買國外勞務，課稅別不得為應稅");
                                        }
                                        break;
                                }
                                break;
                        }
                    }
                    //#endregion
                }
            }
            //#endregion

            //#endregion

            return true;
        }

        return {
            validateField: validateField
        };

    });
