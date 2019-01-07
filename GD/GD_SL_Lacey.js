/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/render', 'N/search', 'N/record', 'N/file'],
	function (render, search, record, file) {
		
	function Lacey()
	{
		this.lineCnt = 0;
		this.startIdx = 0;
	}
	
	Lacey.prototype.setLinCount = function(c)
	{
		this.lineCnt = c;
	}
	
	Lacey.prototype.setStartIdx = function(idx)
	{
		this.startIdx = idx;
	}
	
	Lacey.prototype.getLineSearch = function(rid)
	{
		var pageLineArr = [];
		var formObj = search.create({
			type: "customrecord_lacey",
			columns:
			[
				search.createColumn({name: "custrecord_htsus" }),
				search.createColumn({name: "custrecord_entered_value" }),
				search.createColumn({name: "custrecord_artical" }),
				search.createColumn({name: "custrecord_genus" }),    
				search.createColumn({name: "custrecord_species" }),	    
				search.createColumn({name: "custrecord_harvest" }),	    
				search.createColumn({name: "custrecord_quantity" }),
				search.createColumn({name: "custrecord_unit" }),			
				search.createColumn({name: "custrecord_recycled" })
			],
			filters: [['custrecord_lacey_form_no', 'is', rid]]
		});
		
		this.lineCnt = formObj.runPaged().count;
	
		formObj.run().each(function(result){ //line資料行
	
			var htsus = result.getValue({ name: "custrecord_htsus" });
			var entered_value = result.getValue({ name: "custrecord_entered_value" });
			var artical = result.getValue({ name: "custrecord_artical" });
			var genus = result.getValue({ name: "custrecord_genus" });
			var species = result.getValue({ name: "custrecord_species" });
			var harvest = result.getValue({ name: "custrecord_harvest" });
			var quantity = result.getValue({ name: "custrecord_quantity" });
			var unit = result.getValue({ name: "custrecord_unit" });
			var recycled = result.getValue({ name: "custrecord_recycled" });
			
			pageLineArr.push(new Array(htsus, entered_value, artical, genus, species, harvest, quantity, unit, recycled));
			return true;
		});
		return pageLineArr;
	}
	
	Lacey.prototype.getPage = function(eta,entry,cntr,bl,mid,imp_name,imp_addr,consignee_name,consignee_addr,desc,lineArr)
	{	
		var table_tr = "";
		for( var i=this.startIdx ; i<lineArr.length ; i++ )
		{
			table_tr += getLine(lineArr[i][0], lineArr[i][1], lineArr[i][2], lineArr[i][3], lineArr[i][4], lineArr[i][5], lineArr[i][6], lineArr[i][7], lineArr[i][8]);
			
			if( (i+1) % 5 == 0 )
			{
				this.startIdx = i+1;
				break;
			}
		}
		
		var table = 
			' <table style="padding-top: 60px; table-layout: fixed;" width="94%"> '+
			' <tbody> '+
			' <tr> '+
			' <td style="width: 32%;"> '+
				' <table style="padding-top: 35px;" width="100%"> '+
				' <tbody> '+
				' <tr> '+
					' <td style="height: 45px;">'+eta+'</td> '+ //1
				' </tr> '+   
				' <tr> '+    
					' <td style="height: 45px;">'+entry+'</td> '+ //2
				' </tr> '+   
				' <tr> '+    
					' <td style="height: 50px;">'+cntr+'</td> '+ //3
				' </tr> '+   
				' <tr> '+    
					' <td style="height: 45px;">'+bl+'</td> '+ //4
				' </tr> '+   
				' <tr> '+    
					' <td style="height: 45px;">'+mid+'</td> '+ //5
				' </tr> '+
				' </tbody> '+
				' </table> '+
			' </td> '+
			' <td style="width: 35%;"> '+
				' <table width="100%" style="margin-top: 192px; margin-left: 10px;"> '+
				' <tbody> '+
				' <tr> '+
					' <td style="width: 100px;">'+desc+'</td> '+ //10
				' </tr> '+
				' </tbody> '+
				' </table> '+
			' </td> '+
			' <td> '+
				' <table style="height: 100%;" width="100%"> '+
				' <tbody> '+
				' <tr> '+
				' <td style="height: 47px; word-wrap: break-word;">'+imp_name+'</td> '+ //6
				' </tr> '+
				' <tr> '+
				' <td style="height: 80px; word-wrap: break-word;">'+imp_addr+'</td> '+ //7
				' </tr> '+
				' <tr> '+
				' <td style="height: 50px; word-wrap: break-word;">'+consignee_name+'</td> '+ //8
				' </tr> '+
				' <tr> '+
				' <td style="height: 150px; word-wrap: break-word;">'+consignee_addr+'</td> '+ //9
				' </tr> '+
				' </tbody> '+
				' </table> '+
			' </td> '+
			' </tr> '+
			' </tbody> '+
			' </table> '+
			' <p>&nbsp;</p> '+
			' <p>&nbsp;</p> '+
			' <table style="width: 93%; table-layout: fixed;"> '+
			' <tbody> '+ table_tr + ' </tbody> '+
			' </table> ';
			
		return table;
	}
	
	function getLine(htsus, entered_value, artical, genus, species, harvest, quantity, unit, recycled)
	{
		return 	' <tr style="height: 33px;"> '+
				' <td style="width: 16%;">'+ htsus +'</td> '+
				' <td style="width: 7%;">'+ entered_value +'</td> '+
				' <td style="width: 24%;">'+ artical +'</td> '+
				' <td style="width: 11%;">'+ genus +'</td> '+
				' <td style="width: 11%;">'+ species +'</td> '+
				' <td style="width: 9%;">'+ harvest +'</td> '+
				' <td style="width: 10%;">'+ quantity +'</td> '+
				' <td style="width: 7%;">'+ unit +'</td> '+
				' <td>'+ recycled +'</td> '+
			' </tr> ';
	}
		
	function onRequest(options)
	{
		var request = options.request;
		var response = options.response;
		
		var wm = // watermark
			' <macrolist> ' +
			' 	<macro id="nlWatermark">' +
			'   <div style="padding-left:0mm; padding-top:0mm;"> ' +
			'   	<img src="https://i.imgur.com/wVpUDvR.jpg" width="783" height="605" /> ' +
			'   </div> ' +
			' 	</macro> ' +
			' </macrolist> ';
		
		if ( request.method == 'GET' )
		{			
			var laceyObj = new Lacey();
			
			var rid = request.parameters['custscript_lacey_rid'];
			var lineArr = laceyObj.getLineSearch(rid);
			
			// log.debug("wk_lineCnt 0:"+wk_lineCnt+" , wk_startIdx:"+wk_startIdx);
			
			var formRec = record.load({
				type: "customrecord_export_forms", 
				id: rid 
			});
			
			var eta = formRec.getValue({ fieldId: "custrecord_eta" });
			var entry = formRec.getValue({ fieldId: "custrecord_entry_number" });
			
			var pageCntrArr = [];
			var cntrStr = "";
			for( var i = 1 ; i<=6 ; i++ )
			{
				var cntr = eval("formRec.getValue({ fieldId: 'custrecord_cntr_no_"+i+"'})");
				
				if( cntr != "" )
				{
					cntrStr += cntr + "/" ;
					if( i%3 == 0 )
					{
						pageCntrArr.push(cntrStr.substring(0,cntrStr.length-1));
					}
				}
			}
			if( pageCntrArr.length == 0 )
				pageCntrArr.push(cntrStr.substring(0,cntrStr.length-1));
			
			var pageBlArr = [];
			var blStr = "";
			for( var i = 1 ; i<=6 ; i++ )
			{
				var bl = eval("formRec.getValue({ fieldId: 'custrecord_bl_no_"+i+"'})");
				
				if( bl != "" )
				{
					blStr += bl + "/" ;
					if( i%3 == 0 )
					{
						pageBlArr.push(blStr.substring(0,blStr.length-1));
					}
				}
			}
			if( pageBlArr.length == 0 )
				pageBlArr.push(blStr.substring(0,blStr.length-1));
			
			var mid = formRec.getValue({ fieldId: "custrecord_mid" });
			var imp_name = formRec.getValue({ fieldId: "custrecord_bill_name" });
			var imp_addr = formRec.getValue({ fieldId: "custrecord_bill_address" }).replace(imp_name, "");
			var consignee_name = formRec.getValue({ fieldId: "custrecord_ship_name" });
			var consignee_addr = formRec.getValue({ fieldId: "custrecord_ship_address" }).replace(consignee_name, "");
			var desc = formRec.getValue({ fieldId: "custrecord_product_name" });
			
			// for loop page
			var table = "";
			for( var i=0 ; i<pageCntrArr.length ; i++ )
			{
				table += laceyObj.getPage(eta,entry,cntrStr,blStr,mid,imp_name,imp_addr,consignee_name,consignee_addr,desc,lineArr);
			}
			
			while( laceyObj.lineCnt > (laceyObj.startIdx+1) && laceyObj.lineCnt - (laceyObj.startIdx+1) >=5 ) //還有剩餘的line
			{
				table += laceyObj.getPage(eta,entry,cntrStr,blStr,mid,imp_name,imp_addr,consignee_name,consignee_addr,desc,lineArr);
			}
			
			var xmlStr = 
				'<?xml version="1.0"?>\n '+
				'<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n '+
				'<pdf>\n '+
				"<head>\n" +
				"<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" " +
				"src=\"NetSuiteFonts/verdana.ttf\" " + 
				"src-bold=\"NetSuiteFonts/verdanab.ttf\" " +
				"src-italic=\"NetSuiteFonts/verdanai.ttf\" " + 
				"src-bolditalic=\"NetSuiteFonts/verdanabi.ttf\" " +
				"bytes=\"2\"/>\n" +
				wm +  
				"</head>\n" +
				'<body font-size="11" size="A4-landscape" background-macro="nlWatermark">\n'+ table +'</body>\n </pdf>';

			var pdfFile = render.xmlToPdf({
				xmlString: xmlStr
			});
			
			pdfFile.name = formRec.getValue({ fieldId: "altname" })+"_Lacey.pdf";
			pdfFile.folder = 10;
			
			var f = pdfFile.save();
			formRec.setValue({ fieldId: "custrecord_doc_2", value: f });
			formRec.save();

			response.writeFile(pdfFile, false);
		}

		// var bgObj = file.load({ id: 'Images/background1.jpg' });
		// log.debug("URL:"+bgObj.url);

		/* var rs = search.create({
		type: search.Type.TRANSACTION,
		columns: ['trandate', 'amount', 'entity'],
		filters: []
		}).run();

		var results = rs.getRange(0, 1000); */

		// var renderer = render.create();
		// renderer.templateContent = xmlStr;
		
		/* renderer.addSearchResults({
		templateName: 'exampleName',
		searchResults: results
		}); */

		// var newfile = renderer.renderAsPdf();
		// response.writeFile(newfile, false);
		
		// var xmlStr = '<?xml version="1.0"?>\n<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\n<pdf>\n<body font-size="18">\nHello World!\n</body>\n</pdf>';;
		
	}
	
	return {
		onRequest: onRequest
	};
});
