/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 * [Estimate] 從[專案]:[備註]帶入估價單之[專案備註] 
 */
define(['N/record','N/search','./getContactInfo','./colorteam_CommonUtil'],

function(record, search, g, util) {
	
	function fieldChanged(scriptContext)
	{
		var cr = scriptContext.currentRecord;
		var fieldId = scriptContext.fieldId;
		
		//更動客戶時，重新抓取主要聯絡人
		if (fieldId == 'entity')
		{
			var c_name = cr.getValue({ "fieldId": "entity" });
			var select_contact = cr.getField({ "fieldId" : "custpage_contact" });
			var defaultArr = g.getProjectSelect("insert",c_name,select_contact);
			
			cr.setValue("custpage_contact", defaultArr[2]);
		}
		return true;
	}
	
	function pageInit(scriptContext)
	{
		var cr = scriptContext.currentRecord;
    	var jobValue = cr.getValue({ "fieldId": "job" });
    	var oriProjectMemo = cr.getValue({ "fieldId": "custbody_project_memo" });

    	if( jobValue ) { //job id有值再寫入專案備註
    		var objProjectRecord = record.load({
        		type: record.Type.JOB,
    	        id: jobValue
    	    });
        	
        	var projectMemo = objProjectRecord.getValue({ "fieldId": "custentity_remark" });
        	if( oriProjectMemo != projectMemo )
        	{
        		cr.setValue("custbody_project_memo" ,projectMemo);
        	}
    	}
		
		//隱藏聯絡人
		cr.getField({ fieldId: "custbody_contact"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_title"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_phone"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_fax"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_email"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_salutation"}).isDisplay = false;
		cr.getField({ fieldId: "custbody_contact_mobile"}).isDisplay = false;
    }
	
	function saveRecord(scriptContext)
	{
		var cr = scriptContext.currentRecord;
		
		//儲存總金額中文大寫
		var totalAmount = cr.getValue({ "fieldId": "total" });
		var chineseAmount = getArabiaToChinese(totalAmount);
		
		cr.setValue("custbody_chinese_amount" ,chineseAmount);

		// var customer_id = cr.getValue({ "fieldId": "entity" }); //顧客ID
		var customer_id = cr.getValue({"fieldId":"custpage_contact"});
		cr.setValue({
			fieldId: 'custbody_contact',
			value: customer_id,
			fireSlavingSync: true
		});
		// console.log("customer_id:"+customer_id+" , "+cr.getText({"fieldId":"custpage_contact"}));
		// var contactSearch = search.load({
			// id: 'customsearch_main_contact_es'
		// });

		// var filters = contactSearch.filters;
		// var mySearchFilter = search.createFilter({
			// name: 'internalid',
			// operator: search.Operator.IS,
			// values: [customer_id] 
		// });
		// filters.push(mySearchFilter);
		// contactSearch.filters = filters;

		// contactSearch.run().each(function(result)
		// {
			// cr.setValue({
				// fieldId: 'custbody_contact_phone',
				// value: result.getValue(result.columns[3])
			// });
			// cr.setValue({
				// fieldId: 'custbody_contact_fax',
				// value: result.getValue(result.columns[1])
			// });
			// cr.setValue({
				// fieldId: 'custbody_contact',
				// value: result.getValue(result.columns[2])
			// });

			// return true;
		// });
		
		//抓取經辦人姓名
    	var salerepValue = cr.getValue({ "fieldId": "salesrep" });
    	if( salerepValue ) {
			
			search.create({
                "type": "employee",
                "filters": [['internalid', 'is', salerepValue]],
				"columns": [{name: 'firstname'}]
            })
			.run().each(function(result) {
				cr.setValue({
            	    fieldId: 'custbody_salesrep_name',
            	    value: result.getValue({ name: 'firstname' })
            	});
				return true;
			});
			
		}
		return true;
	}
  
	function getArabiaToChinese(amount)
	{
		var Num = amount.toString();
		for(var i=Num.length-1;i>=0;i--)
		{
			Num = Num.replace(",","");//替換tomoney()中的“,”
			Num = Num.replace(" ","");//替換tomoney()中的空格
		}
		//Num = Num.replace("￥","");//替換掉可能出現的￥字符
		if(isNaN(Num)) 
		{ //驗證輸入的字符是否為數字
			alert("請檢查小寫金額是否正確");
			return;
		}
		
		//字符處理完畢後開始轉換，采用前後兩部分分別轉換
		part = String(Num).split(".");
		newchar = ""; 
		
		//小數點前進行轉化
		for(var i=part[0].length-1;i>=0;i--)
		{
			if(part[0].length > 10)
			{
				alert("位數過大，無法計算");
				return "";
			}//若數量超過拾億單位，提示
			tmpnewchar = "";
			perchar = part[0].charAt(i);
			switch(perchar)
			{
				case "0": tmpnewchar="零" + tmpnewchar ;break;
				case "1": tmpnewchar="壹" + tmpnewchar ;break;
				case "2": tmpnewchar="貳" + tmpnewchar ;break;
				case "3": tmpnewchar="叁" + tmpnewchar ;break;
				case "4": tmpnewchar="肆" + tmpnewchar ;break;
				case "5": tmpnewchar="伍" + tmpnewchar ;break;
				case "6": tmpnewchar="陸" + tmpnewchar ;break;
				case "7": tmpnewchar="柒" + tmpnewchar ;break;
				case "8": tmpnewchar="捌" + tmpnewchar ;break;
				case "9": tmpnewchar="玖" + tmpnewchar ;break;
			}
			
			switch(part[0].length-i-1)
			{
				case 0: tmpnewchar = tmpnewchar +"元" ;break;
				case 1: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
				case 2: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
				case 3: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
				case 4: tmpnewchar= tmpnewchar +"萬" ;break;
				case 5: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
				case 6: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
				case 7: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
				case 8: tmpnewchar= tmpnewchar +"億" ;break;
				case 9: tmpnewchar= tmpnewchar +"拾" ;break;
			}
			newchar = tmpnewchar + newchar;
		}
	 
		//小數點之後進行轉化
		if(Num.indexOf(".")!=-1)
		{
			if(part[1].length > 2) 
			{
				alert("小數點之後只能保留兩位,系統將自動截斷");
				part[1] = part[1].substr(0,2);
			}
			
			for(var i=0;i<part[1].length;i++)
			{
				tmpnewchar = "";
				perchar = part[1].charAt(i);
				switch(perchar)
				{
					case "0": tmpnewchar="零" + tmpnewchar ;break;
					case "1": tmpnewchar="壹" + tmpnewchar ;break;
					case "2": tmpnewchar="貳" + tmpnewchar ;break;
					case "3": tmpnewchar="叁" + tmpnewchar ;break;
					case "4": tmpnewchar="肆" + tmpnewchar ;break;
					case "5": tmpnewchar="伍" + tmpnewchar ;break;
					case "6": tmpnewchar="陸" + tmpnewchar ;break;
					case "7": tmpnewchar="柒" + tmpnewchar ;break;
					case "8": tmpnewchar="捌" + tmpnewchar ;break;
					case "9": tmpnewchar="玖" + tmpnewchar ;break;
				}
				if(i==0)tmpnewchar =tmpnewchar + "角";
				if(i==1)tmpnewchar = tmpnewchar + "分";
				newchar = newchar + tmpnewchar;
			}
		}
		
		//替換所有無用漢字
		while( newchar.search("零零") != -1)
				newchar = newchar.replace("零零", "零");
				newchar = newchar.replace("零億", "億");
				newchar = newchar.replace("億萬", "億");
				newchar = newchar.replace("零萬", "萬");
				newchar = newchar.replace("零元", "元");
				newchar = newchar.replace("零角", "");
				newchar = newchar.replace("零分", "");
		if (newchar.charAt(newchar.length-1) == "元" || newchar.charAt(newchar.length-1) == "角")
		newchar = newchar+"整";
		return newchar;
	}
	
    return {
    	pageInit: pageInit,
    	saveRecord: saveRecord,
		fieldChanged: fieldChanged
    };
    
});
