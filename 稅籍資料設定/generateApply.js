/**
 * taskToPurchase.js
 * @NApiVersion 2.x
 */

define(['N/record', './commonUtil'],

    function (record, util) {
        log.debug("AAA");
        var startMsg = "";

        generateYear = function (t) {
            //debugger
            console.log("Start");
            
            var reg_id = document.getElementById("reg_id").value;
            var vYear = document.getElementById("txtYear").value;

            log.debug("reg_id=" + reg_id + ";vYear=" + vYear);

            //var regRec = record.load({
            //    type: 'customrecord_ev_registrations_all',
            //    id: reg_id
            //});
            //var value = regRec.getValue({
            //    fieldId: 'name'
            //});

            //log.debug("value=" + value);

            for (var i = 1; i <= 12; i++) {

                var customRecord = record.create({
                    type: 'customrecord_ev_apply_status_all'
                });

                //稅籍編號
                customRecord.setValue({
                    fieldId: 'custrecord_22_registration_number',
                    value: reg_id,
                    ignoreFieldChange: true
                });
                //年
                customRecord.setValue({
                    fieldId: 'custrecord_22_occured_year',
                    value: vYear,
                    ignoreFieldChange: true
                });
                //月
                customRecord.setValue({
                    fieldId: 'custrecord_22_occured_month',
                    value: i,
                    ignoreFieldChange: true
                });
                //進項
                customRecord.setValue({
                    fieldId: 'custrecord_22_pay_apply_status',
                    value: 1,
                    ignoreFieldChange: true
                });
                //銷項
                customRecord.setValue({
                    fieldId: 'custrecord_22_rec_apply_status',
                    value: 1,
                    ignoreFieldChange: true
                });

                var recordId = customRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }

            startMsg.hide();
            util.showButtonMsg(vYear + "已產生完成", vYear + "已產生完成", "CONFIRMATION");
            
        }

        function generateApply(reg_id) {
            log.debug("BBB");
            startMsg = util.showButtonMsg("請輸入年度", "<div id='chkDiv'>Loading<img src='/images/setup/loading.gif' border='0' alt=''></div>", "WARNING");

            util.delayPromise(800)('').then(function (result) {
                var html =
                    "請輸入要產生的西元年 <input type='text' id='txtYear'>&nbsp&nbsp<input type='button' value='產生' onclick='javascript:generateYear(this);'><br>" +
                    "<input type='hidden' id='reg_id'  value='" + reg_id + "'>";
                log.debug("CCC");
                document.getElementById("chkDiv").innerHTML = html;
            });

            log.debug("DDD");

            /*
            var taskRecord = record.load({
                type: record.Type.PROJECT_TASK,
                id: reg_id 
            });
    
            var vendor = taskRecord.getValue({ fieldId: 'custevent_os_supplier' });
            var outsourcing = taskRecord.getValue({ fieldId: 'custevent_outsourcing' });
            if( !vendor || !outsourcing )
            {
                if( !outsourcing )
                    util.showButtonMsg("無法拋轉委外採購單","需為委外料號，才能拋轉委外採購單，請重新選擇料號","WARNING");
                else
                {
                    if( !vendor )
                        util.showButtonMsg("無法拋轉","[委外供應商]不能為空，請確認","WARNING");
                }
            }
            else
            {
                //開始拋轉採購單
                var startMsg = util.showButtonMsg("開始拋轉","委外資訊拋轉採購單中，請稍候<img src='/images/setup/loading.gif' border='0' alt=''>","WARNING");
    
                util.delayPromise(800)('').then(function(result) {
                    var poRecord = record.create({
                        type: record.Type.PURCHASE_ORDER
                    });
                	
                    var company = taskRecord.getValue({ fieldId: 'custevent_company' });
                	
                    console.log("PARAM:"+company+" , "+vendor);
                	
                    poRecord.setValue({
                        fieldId: 'class',
                        value: company
                    });
                	
                    poRecord.setValue({
                        fieldId: 'currency',
                        value: '1' //預設TWD
                    });
                                        	
                    poRecord.setValue({
                        fieldId: 'entity',
                        value: vendor
                    });
    
                    // sublist
                    var price = taskRecord.getValue({ fieldId: 'custevent_outsourcing_price' });
                    // var item  = taskRecord.getValue({ fieldId: 'custevent_item' });
                    var item  = taskRecord.getValue({ fieldId: 'custevent_os_process_id' });
                    var desc  = taskRecord.getValue({ fieldId: 'custevent_os_desc' });
                	
                    poRecord.insertLine({
                        sublistId: 'item',
                        line: 0
                    });
                	
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: 0,
                        // value: ( price ? price : 0 )
                        value: 0 // 2018.10.15 Fisa modify 拋轉採購單金額預設為0
                    });
                	
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: 0,
                        value: item
                    });
                	
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: 0,
                        value: desc
                    });
                	
                    // var pq  = taskRecord.getValue({ fieldId: 'custevent_parent_quantity' });
                    var q  = taskRecord.getValue({ fieldId: 'custevent_ori_parent_quantity' });
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: 0,
                        value: q
                    });
                	
                    // console.log("PARAM2:"+price+" , "+item+" , "+desc+" , "+(pq*q));
    
                    try{
                    var s = poRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
    
                    console.log("save:"+s);
                    }catch(e){console.log("err:"+e.message);};
                    startMsg.hide();
            	
                    util.showButtonMsg("拋轉成功","<a href='"+util.getUrl()+"/app/accounting/transactions/purchord.nl?id="+s+"' target='_blank'>檢視拋轉完成的採購訂單頁面</a>","CONFIRMATION");
                });
            }
            */
        }

        return {
            generateApply: generateApply
        };

    });