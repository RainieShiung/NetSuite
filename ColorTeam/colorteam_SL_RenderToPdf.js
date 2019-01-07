/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/render', 'N/search', 'N/record'],
	function (render, search, record) {
	function onRequest(options) {
		var request = options.request;
		var response = options.response;

		var internal_id = request.parameters.internal_id;
				
		var pjRecord = record.load({
			type: record.Type.JOB,
			id: internal_id
		});
  	    var cTitleCompanyFullName = pjRecord.getText({ fieldId: 'custentity_company_full_name' });
  	    var cTitleCompanyTel = pjRecord.getText({ fieldId: 'custentity_company_tel' });
		
		var cNameFull = pjRecord.getText({ fieldId: 'custentity_customer_name' });
		
	    var cCompanyName = pjRecord.getText({ fieldId: 'companyname' });
		var cPrintSource = pjRecord.getText({ fieldId: 'custentity_print_source_desc' });
		var cPrintSpec = pjRecord.getText({ fieldId: 'custentity_print_spec' });
		var cbindingDesc = pjRecord.getText({ fieldId: 'custentity_binding_desc' });
		var cIndexDesc = pjRecord.getText({ fieldId: 'custentity_index_desc' });
		var cPosterOutput = pjRecord.getText({ fieldId: 'custentity_poster_output' });
		var cContact = pjRecord.getText({ fieldId: 'custentity_contact' });
		var cDeliveryMethod = pjRecord.getText({ fieldId: 'custentity_delivery_method' });
		var cStartDelivery = pjRecord.getText({ fieldId: 'custentity_start_delivery' });
		if(pjRecord.getText({ fieldId: 'custentity_priority' }))
			{
				cPriority = "優先件";
			}
			else
			{
				cPriority = "";
			}

	  
		var cRemark = pjRecord.getText({ fieldId: 'custentity_remark' });
		var cShip_Address = pjRecord.getText({ fieldId: 'custentity_ship_address' });
		
		var cOrderNo = pjRecord.getText({ fieldId: 'entityid' });
		var cOrderDate = pjRecord.getText({ fieldId: 'startdate' });
		var cTax =pjRecord.getText({ fieldId: 'custentity_value_tax' });
		var cContactPhone = pjRecord.getText({ fieldId: 'custentity_contact_phone' });
		var cFromEstimate = pjRecord.getText({ fieldId: 'custentity_from_estimate' });
		var cDeptName = pjRecord.getText({ fieldId: 'custentity_process_id' });
		var cSalesrep = pjRecord.getText({ fieldId: 'custentity_salesrep' });
		
		
		
		//製程項目

		var title = "<p align='center' font-size='18pt'>"+cTitleCompanyFullName+"</p>"+
					"<p align='center' font-size='11pt'> TEL:"+cTitleCompanyTel+"</p>"+
					"<p align='center' font-size='11pt'>訂單</p>";
		
		var deptStr = "";
		for( var i=0 ; i<cDeptName.length ; i++ )
		{
			deptStr += "<tr><td class='T'>"+cDeptName[i]+"</td></tr>";
		}

		var table = "<table width='100%' class='aTable'>" +
			"<tbody>" +
			// "<tr><td class='RB' width='16mm'>訂單號碼</td><td class='RB' width='115mm'>"+cOrderNo+"</td><td class='RB' width='16mm'>訂單日期</td><td class='B' width='43mm'>"+cOrderDate+"</td></tr>" +
			"<tr><td class='RB' width='16mm'>訂單號碼</td><td class='RB' width='50mm'>"+cOrderNo+"</td><td class='RB' width='16mm'>訂單日期</td><td class='B' width='43mm'>"+cOrderDate+"</td></tr>" +
			"<tr><td class='RB'>客戶</td><td class='RB'>"+cNameFull+"</td><td class='RB'>訂購人</td><td class='B'>"+cContact+"</td></tr>" +
			"<tr><td class='RB'>加值稅</td><td class='RB'>"+cTax+"</td><td class='RB'>電話</td><td class='B'>"+cContactPhone+"</td></tr>" +
			"<tr><td  class='RB'>印件名稱</td><td class='RB'>"+cCompanyName+"</td><td class='RB'>業務</td><td class='B'>"+cSalesrep+"</td></tr>" +
			"<tr><td class='RB'>客戶原件</td><td class='RB'>"+cPrintSource+"</td><td class='RB'>&nbsp;</td><td class='B'>&nbsp;</td></tr>" +
			"<tr><td class='RB'>報價單號</td><td class='RB'>"+cFromEstimate+"</td><td class='RB'>運送方式</td><td class='B'>"+cDeliveryMethod+"</td></tr>" +
			"<tr><td class='RB'>規格</td><td class='RB'>"+cPrintSpec+"</td><td class='RB'>&nbsp;</td><td class='B'>&nbsp;</td></tr>" +
			"<tr><td class='RB'>裝訂方式</td><td class='RB'>"+cbindingDesc+"</td><td class='RB'>&nbsp;</td><td class='B'>&nbsp;</td></tr>" +
			"<tr><td class='RB'>封面</td><td class='RB'>"+cIndexDesc+"</td><td class='RB'>交件時間</td><td class='B'>"+cStartDelivery+"</td></tr>" +
			"<tr><td class='RB'>海報輸出</td><td class='RB'>"+cPosterOutput+"</td><td class='RB'>&nbsp;</td><td class='B'>"+cPriority+"</td></tr>" +
			"<tr><td class='RB'></td><td class='RB'>&nbsp;</td><td class='RB'>&nbsp;</td><td class='B'>&nbsp;</td></tr>" +
			"<tr><td class='RB'>備註</td><td class='RB'>"+cRemark+"</td><td class='RB'>&nbsp;</td><td class='B'>&nbsp;</td></tr>" +
			"<tr><td class='R'>交貨地點</td><td class='R'>"+cShip_Address+"</td><td class='R'>&nbsp;</td><td>&nbsp;</td></tr>" +
			"</tbody>" +
			"</table>" +
			"<p>&nbsp;</p>" +
			"<table class='aTable'>" +
			"<tr><td width='16mm'>部門名稱</td></tr>" +
			// "<tr><td>"+(cDeptName.length)+"</td></tr>" +
			deptStr +
			"</table>";

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
				"table.aTable td.T {"+
					"border-top: 1px solid black;"+
				"}"+
				"table.aTable td.TRB {"+
					"border-right: 1px solid black;"+
					"border-bottom: 1px solid black;"+
					"border-top: 1px solid black;"+
				"}"+
			"</style>" +
			"</head>\n" +
			"<body font-family=\"russianfont\" font-size=\"18\">\n" + title+table + "</body>\n" + "</pdf>";

		/* var rs = search.create({
		type: search.Type.TRANSACTION,
		columns: ['trandate', 'amount', 'entity'],
		filters: []
		}).run();

		var results = rs.getRange(0, 1000); */
		var renderer = render.create();
		renderer.templateContent = xmlStr;
		/* renderer.addSearchResults({
		templateName: 'exampleName',
		searchResults: results
		}); */

		var newfile = renderer.renderAsPdf();
		response.writeFile(newfile, false);
	}

	return {
		onRequest: onRequest
	};
});
