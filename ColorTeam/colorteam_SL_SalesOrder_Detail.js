/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/render', 'N/search', 'N/record', 'N/format','./colorteam_CommonUtil', 'N/runtime'],
	function (render, search, record, format, util, runtime) {
		
	var pdf = function (soRec)
 	{
 		this.soRec = soRec;
		this.ttlsubAmount = 0;
 	};
	
	pdf.prototype.getItemLines = function()
	{
		var soRecord = this.soRec;
		var numLines = soRecord.getLineCount({
			sublistId: 'item'
		});
		
		var itemName, parent_quantity, kit_unit, memo;
		
		var itemLines = "";
		for(var i=0 ; i<numLines ; i++)
		{
			var itemType = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'itemtype',
				line: i
			});
			
			var itemName = "";
			if( itemType == "Group" )
			{
				itemName = soRecord.getSublistText({
					sublistId: 'item',
					fieldId: 'item',
					line: i
				});
				
				var autoIdx = itemName.indexOf("[auto:");
				if( autoIdx > 0 )
					itemName = itemName.substring(0,itemName.indexOf("[auto:")); //移除[auto:
			}
			else
			{
				itemName = soRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'description',
					line: i
				});
			}

			var parent_quantity = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: i
			});
			
			var kit_unit = soRecord.getSublistText({
				sublistId: 'item',
				fieldId: 'custcol_kit_unit',
				line: i
			});
			
			var memo = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_line_memo',
				line: i
			});
			
			var rate = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'rate',
				line: i
			});
			
			var amount = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'amount',
				line: i
			});

			if( itemType == "EndGroup" )
			{
				this.setTotalAmount(amount);
			}
			else
			{
				itemLines += 
					"<tr>"+
					"	<td class='R' colspan='5'>"+itemName+"</td>"+
					"	<td class='R' align='right'>"+util.formatPrice(parent_quantity)+"</td> "+ //數量
					"	<td class='R' align='center'>"+kit_unit+"</td> "+ //單位
					// "	<td class='R' align='right'>"+( itemType == "Group" ? "" : util.formatPrice(util.round((amount/parent_quantity),3)) )+"</td>"+ //單價
					"	<td class='R' align='right'>"+( itemType == "Group" ? "" : util.formatPrice(util.round(rate,3)) )+"</td>"+ //單價
					"	<td class='R' align='right'>"+util.formatPrice(amount)+"</td>"+ //小計
					"	<td colspan='2'>"+memo+"</td>"+
					"</tr>";
			}
		}
		return itemLines;
	}
	
	pdf.prototype.setTotalAmount = function(a)
 	{
		this.ttlsubAmount = this.ttlsubAmount + a;
 	};
	
	pdf.prototype.getAmount = function(a)
 	{
		return this.ttlsubAmount;
 	};
		
	function onRequest(options) {
		var request = options.request;
		var response = options.response;
		
		var internal_id = request.parameters.internal_id;

		// sales order
		var soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: internal_id
		});
		
		var pdfObj = new pdf(soRecord);
		
		var cNameFull = soRecord.getText({ fieldId: 'entity' });
		var cName = cNameFull.substring(0,cNameFull.indexOf(" : "));
		var billAddr = soRecord.getValue({ fieldId: 'billaddress' });
		var billAddrArr = billAddr.split("\n");
		for( var i=0 ; i<billAddrArr.length ; i++ ) //抓不到billAddr1，改用[號]判斷
		{
			if( billAddrArr[i].indexOf("號") != -1 )
				billAddr = billAddrArr[i];
		}
		var shipAddr = soRecord.getValue({ fieldId: 'shipaddress' });
		var shipAddrArr = shipAddr.split("\n");
		for( var i=0 ; i<shipAddrArr.length ; i++ ) //抓不到billAddr1，改用[號]判斷
		{
			if( shipAddrArr[i].indexOf("號") != -1 )
				shipAddr = shipAddrArr[i];
		}
		var so_number = soRecord.getValue({ fieldId: 'tranid' });
		var ev_number = soRecord.getValue({ fieldId: 'custbody25' });
		
		var trandate = soRecord.getValue({ fieldId: 'trandate' });
		var formatted_trandate = format.format({
			value: trandate,
			type: format.Type.DATE
		});
		var shipmethod = soRecord.getText({ fieldId: 'shipmethod' });
		var start_delivery = soRecord.getValue({ fieldId: 'custbody_start_delivery' });
		var formatted_delivery;
		if( start_delivery )
		{
			formatted_delivery = format.format({
				value: start_delivery,
				type: format.Type.DATE
			});
		}
		
		var contactNameFull = soRecord.getText({ fieldId: 'custbody_contact' });
		var salutation = soRecord.getValue({ fieldId: 'custbody_contact_salutation' });
		var contactName = contactNameFull.substring(contactNameFull.indexOf(":")+1);
		var contact_phone = soRecord.getValue({ fieldId: 'custbody_contact_phone' });
		var contact_mobile = soRecord.getValue({ fieldId: 'custbody_contact_mobile' });
		
		// 客戶統編
		var customerId = soRecord.getValue({ fieldId: 'entity' });
		var customerRecord = record.load({
			type: record.Type.CUSTOMER,
			id: customerId
		});
		var regNumber = customerRecord.getValue({ fieldId: 'vatregnumber' });
		
		var classImage = soRecord.getValue({ fieldId: 'class' });
		if( classImage == 2 )
			imgUrl = "https://checkout.na3.netsuite.com/core/media/media.nl%3Fid=383%26c=4972443%26h=35f7c10f40bd1676af41";
		else if( classImage == 3 )
			imgUrl = "https://checkout.na3.netsuite.com/core/media/media.nl%3Fid=400%26c=4972443%26h=ba5669999715efdb5c69";


		var macro = 
			"<macrolist>"+
			"	<macro id='nlheader'>"+
			"		<table width='100%' style='font-size: 10pt;'>"+
			"		<tr>"+
			"			<td colspan='2' rowspan='3'><img src='"+imgUrl+"'/></td>"+
			"			<td width='90mm' class='header'>公司名稱 : "+cName+"</td>"+
			"		</tr>"+
			"		<tr>"+
			"			<td class='header'>發票地址 : "+billAddr+"</td>"+
			"		</tr>"+
			"		<tr>"+
			"			<td class='header'>送貨地址 : "+shipAddr+"</td>"+
			"		</tr>"+
			"		<tr>"+
			"			<td>訂單單號 : #"+so_number+"</td>"+
			"			<td width='50px'>發票號碼 : "+ev_number+"</td>"+
			"			<td class='header'>統一編號 : "+regNumber+"</td>"+
			"		</tr>"+
			"		<tr>"+
			"			<td>銷貨日期 : "+formatted_trandate+"</td>"+
			"			<td>運送方式 : "+shipmethod+"</td>"+
			"			<td class='header'>交貨時間 : "+formatted_delivery+"</td>"+
			"		</tr>"+
			"		<tr>"+
			"			<td>頁數 : <pagenumber/> / <totalpages/></td>"+
			"			<td>聯絡人   : "+contactName+" "+salutation+"</td>"+
			"			<td class='header'>電話 : "+contact_phone+"   手機 : "+contact_mobile+"</td>"+
			"		</tr>"+
			"		</table>"+
			"	  <br />"+
			"	</macro>"+
			"	<macro id='nlWatermark'>"+
			"	<div style='padding-left:95mm; padding-top:18mm;'>"+
			"		<span style='font-size:26px;'><strong>銷售單</strong></span>"+
			"	</div>"+
			"	</macro>"+
			"</macrolist>";
		
		var job = soRecord.getText({ fieldId: 'job' });		
		var pMemo = soRecord.getValue({ fieldId: 'custbody_project_memo' });
		var plan_no = soRecord.getValue({ fieldId: 'custbody26' }); //計畫編號
		// var pUser = soRecord.getValue({ fieldId: 'custbody_process_user' });
		var emplyeeId = runtime.getCurrentUser().id;
		var empRecord = record.load({
			type: record.Type.EMPLOYEE,
			id: emplyeeId
		});
		var pUser = empRecord.getValue({ fieldId: 'firstname' });
		
		var lines = pdfObj.getItemLines();

		var subtotal = soRecord.getValue({ fieldId: 'subtotal' });
		var amount = soRecord.getValue({ fieldId: 'total' });
		var taxAmount = soRecord.getValue({ fieldId: 'taxtotal' });
			
		var item = 
			"<table class='aTable' style='width: 100%;'>"+
			"<tr>"+
			"	<td class='RB' align='center'>印件名稱</td>"+
			"	<td class='B' colspan='10'>"+job+"</td>"+
			"</tr>"+
			"<tr>"+
			"	<td class='RB' align='center' colspan='5'>品名</td>"+
			"	<td class='RB' align='center'>數量</td>"+
			"	<td class='RB' align='center'>單位</td>"+
			"	<td class='RB' align='center'>單價</td>"+
			"	<td class='RB' align='center'>小計</td>"+
			"	<td class='B' align='center' colspan='2'>備註</td>"+
			"</tr>"+
			lines+
			"<tr>"+
				"<td class='RT' colspan='6' rowspan='4'>備註 "+pMemo+"</td>"+
				"<td class='RT' colspan='3' rowspan='3'>客戶簽收</td>"+
				"<td class='TRB'>合計</td>"+
				"<td class='TB'>"+util.formatPrice(subtotal)+"</td>"+
			"</tr>"+
			"<tr>"+
				"<td class='RB'>營業稅</td>"+
				"<td class='B'>"+util.formatPrice(taxAmount)+"</td>"+
			"</tr>"+
			"<tr>"+
				"<td class='RB'>總 計</td>"+
				"<td class='B'>"+util.formatPrice(amount)+"</td>"+
			"</tr>"+
			"<tr>"+
			    "<td class='R' colspan='3'>計畫編號: "+plan_no+"</td>"+
				"<td class='R'>經 辦</td>"+
				"<td>"+pUser+"</td>"+
			"</tr>"+
			"</table>";
		
		var xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
			"<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
			"<pdf lang='zh=TW' xml:lang=\"zh-TW\">\n" + 
			"<head>\n" +
			"<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" " +
			"src=\"NetSuiteFonts/verdana.ttf\" " + "src-bold=\"NetSuiteFonts/verdanab.ttf\" " +
			"src-italic=\"NetSuiteFonts/verdanai.ttf\" " + "src-bolditalic=\"NetSuiteFonts/verdanabi.ttf\" " +
			"bytes=\"2\"/>\n" +
			"<style>" +
				"td.header {" +
					"padding-left: 40mm;"+
				"}"+
				"table.aTable {"+
					"font-size: 11pt;"+
					"table-layout: fixed;"+
					"border: 1px solid black;"+
					"border-collapse: collapse;"+
				"}"+
				"table.aTable td.R {"+
					"border-right: 1px solid black;"+
				"}"+
				"table.aTable td.B {"+
					"border-bottom: 1px solid black;"+
				"}"+
				"table.aTable td.RT {"+
					"border-right: 1px solid black;"+
					"border-top: 1px solid black;"+
				"}"+
				"table.aTable td.RB {"+
					"border-right: 1px solid black;"+
					"border-bottom: 1px solid black;"+
				"}"+
				"table.aTable td.TB {"+
					"border-top: 1px solid black;"+
					"border-bottom: 1px solid black;"+
				"}"+
				"table.aTable td.TRB {"+
					"border-right: 1px solid black;"+
					"border-bottom: 1px solid black;"+
					"border-top: 1px solid black;"+
				"}"+
			"</style>" +
			macro +
			"</head>\n" +
			"<body header=\"nlheader\" header-height=\"35mm\" padding=\"0.1in 0.1in 0.1in 0.1in\" width=\"214mm\" height=\"140mm\" background-macro=\"nlWatermark\">\n" + item + "</body>\n" + "</pdf>";

		var renderer = render.create();
		renderer.templateContent = xmlStr;

		var newfile = renderer.renderAsPdf();
		response.writeFile(newfile, false);
	}
	
	return {
		onRequest: onRequest
	};
});