/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/render', 'N/search', 'N/record','N/config','N/format'],
	function (render, search, record, config, format) {
	function onRequest(options) {
		var request = options.request;
		var response = options.response;

		var recId = request.parameters.rid;
				
		var expRecord = record.load({
			type: "customrecord_export_forms",
			id: recId
		});
		
		var docNo = expRecord.getText({ fieldId: 'name' });
		var created = expRecord.getText({ fieldId: 'created' });
		var formatted_created = format.format({
			value: created,
			type: format.Type.DATE
		});

		var customer = expRecord.getText({ fieldId: 'custrecord_customer' });
		var ifLists = expRecord.getValue({ fieldId: 'custrecord_itemfulfill' });
		var vslvoy = expRecord.getValue({ fieldId: 'custrecord_vslvoy' });
		var ori_ctry = expRecord.getValue({ fieldId: 'custrecord_ori_ctry' });
		var exp_port = expRecord.getValue({ fieldId: 'custrecord_exp_port' });
		var imp_port = expRecord.getValue({ fieldId: 'custrecord_imp_port' });
		var incoterms = expRecord.getText({ fieldId: 'custrecord_incoterms' });
		var port = expRecord.getValue({ fieldId: 'custrecord_port' });
		var bill_address = expRecord.getValue({ fieldId: 'custrecord_bill_address' });
		var ttlAmount = expRecord.getValue({ fieldId: 'custrecord_say_total_amount' });
		var ttlquantity = expRecord.getValue({ fieldId: 'custrecord_say_total_quantity' });
		var marks = expRecord.getValue({ fieldId: 'custrecord_marks' });
		var payment_by = expRecord.getValue({ fieldId: 'custrecord_payment_by' });
		var manufacture = expRecord.getValue({ fieldId: 'custrecord_manufacture' });
		var cntrLoad = expRecord.getValue({ fieldId: 'custrecord_container_loaded' });
		var others = expRecord.getValue({ fieldId: 'custrecord_others' });
		
		var companyInfo = config.load({
			type: config.Type.COMPANY_INFORMATION
		});
		
		var companyName = companyInfo.getValue({fieldId: 'companyname'});
		
		// itemfulfillment
		var listStr = "";
		for(var i=0 ; i<ifLists.length ; i++)
		{
			var fulfillmentRecord = record.load({
				type: record.Type.ITEM_FULFILLMENT,
				id: ifLists[i]
			});
			
			var numLines = fulfillmentRecord.getLineCount({
				sublistId: 'item'
			});
			
			for(var j=0 ; j<numLines ; j++)
			{
				var item = fulfillmentRecord.getSublistText({
					sublistId: 'item',
					fieldId: 'item',
					line: j
				});
				
				var desc = fulfillmentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'description',
					line: j
				});
				
				var q = fulfillmentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'quantity',
					line: j
				});
				
				listStr += 
					"<tr>" +
						"<td>"+ item +"</td>" + 
						"<td>"+ desc +"</td>" + 
						"<td>"+ q +"</td>" + 
						"<td></td>" + 
						"<td class='no_border'></td>" +
					"</tr>";
			}
			
		}
		
		var title = "<p align='center' font-size='22pt'>"+companyName+"</p>"+
					"<p align='center' font-size='18pt'>COMMERCIAL INVOICE</p>";
				
		var table = "<table width='100%' class='hTable'>" +
			"<tbody>" +
			"<tr>" + 
				"<td width='125'>NO.</td>" + 
				"<td width='200' class='underline'>"+docNo+"</td>" + 
				"<td width='50' align='right'>DATE.</td>" + 
				"<td class='underline'>"+formatted_created+"</td>" + 
			"</tr>" +
			"<tr>" + 
				"<td>INVOICE OF</td>" + 
				"<td colspan='3' class='underline'>VENEERED PANELS</td>" + 
			"</tr>" +
			"<tr>" + 
				"<td>SHIPPED PER</td>" + 
				"<td class='underline'>"+vslvoy+"</td>" + 
				"<td align='right'>TO</td>" + 
				"<td class='underline'>"+imp_port+"</td>" + 
			"</tr>" +
			"<tr>" + 
				"<td>FOR ACCOUNT OF</td>" + 
				"<td colspan='3' class='underline'>"+ bill_address +"</td>" + 
			"</tr>" +
			"</tbody>" +
			"</table>" ;
			
		var lists = "<table width='100%' class='iTable'>" +
			"<thead>" +
			"<tr>" + 
				"<th width='55'>SHIPPING MARK</th>" + 
				"<th width='200'>DESCRIPTION</th>" + 
				"<th>QUANTITY</th>" + 
				"<th>PRICE</th>" + 
				"<th class='no_border'>AMOUNT</th>" + 
			"</tr>" +
			"</thead>" +
			"<tbody>" +
				listStr +
			"</tbody>" +
			"</table>" ;

		var xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
			"<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n" +
			"<pdf lang='zh=TW' xml:lang=\"zh-TW\">\n" + "<head>\n" +
			"<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" " +
			"src=\"NetSuiteFonts/verdana.ttf\" " + "src-bold=\"NetSuiteFonts/verdanab.ttf\" " +
			"src-italic=\"NetSuiteFonts/verdanai.ttf\" " + "src-bolditalic=\"NetSuiteFonts/verdanabi.ttf\" " +
			"bytes=\"2\"/>\n" +
			"<style>" +
				"td.header {" +
					"padding-left: 40mm;"+
				"}"+
				"table.aTable {"+
					"font-size: 10pt;"+
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
				"table.hTable {"+
					"font-size: 10pt;"+
					"table-layout: fixed;"+
					// "border: 1px solid black;"+
					"border-collapse: collapse;"+
				"}"+
				"table.hTable td {"+
					"padding: 7px;"+
				"}"+
				"table.hTable td.underline {"+
					"border-bottom: 1px solid black;"+
				"}"+
				"table.iTable {"+
					"font-size: 10pt;"+
					"margin-top: 20px;"+
					"border: 1px solid black;"+
					"border-collapse: collapse;"+
				"}"+
				"table.iTable th {"+
					"font-weight: bold;"+
					"border-bottom: 1px solid black;"+
					"border-top: 1px solid black;"+
					"border-right: 1px solid black;"+
				"}"+

			"</style>" +
			"</head>\n" +
			"<body font-family=\"russianfont\" font-size=\"18\">\n" + title + table + lists + "</body>\n" + "</pdf>";


		var renderer = render.create();
		renderer.templateContent = xmlStr;

		var newfile = renderer.renderAsPdf();
		response.writeFile(newfile, false);
	}

	return {
		onRequest: onRequest
	};
});
