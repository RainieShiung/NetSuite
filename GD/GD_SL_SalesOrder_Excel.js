/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/file', 'N/encode', 'N/record', 'N/format', 'N/config', 'N/search'],
	
	function(file, encode, record, format, config, search) {
		
		var br = "&#10;";

		function onRequest(context)
		{
			var request = context.request;
			var response = context.response;
			
			var companyInfo = config.load({
				type: config.Type.COMPANY_INFORMATION
			});
			
			var companyName = companyInfo.getValue({fieldId: 'companyname'});
			var addr1 = companyInfo.getValue({fieldId: 'mainaddress_text'}).replace("<br>","");
			
			var so_id = request.parameters.so_id;
			var soRec = record.load({
				type: record.Type.SALES_ORDER,
				id: so_id 
			});
			
			if (context.request.method == 'GET') {
				
				var tranid = soRec.getValue({fieldId: 'tranid'});
				var trandate = soRec.getValue({fieldId: 'trandate'});
				var formatted_trandate = "";
				if( trandate != "" )
				{
					formatted_trandate = format.format({
						value: trandate,
						type: format.Type.DATE
					});
				}				
				var desc = soRec.getValue({fieldId: 'custbody_desc'});
				var buyer_no = soRec.getValue({fieldId: 'custbody_buyer_no'});

				var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
				xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
				xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
				xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

				xmlStr += '<Styles>'
				        + '<Style ss:ID="s0">' //標題置中
							+ '<Alignment ss:Horizontal="Center"/>'
							+ '<Font ss:Size="26" ss:Color="#000000" ss:Bold="1"/>'
						+ '</Style>' 
						+ '<Style ss:ID="s0_1">' //地址置中
							+ '<Alignment ss:Horizontal="Center"/>'
							+ '<Font ss:Size="9.5" ss:Color="#00803A" ss:Bold="1"/>'
						+ '</Style>' 
						+ '<Style ss:ID="s1">' //CONTRACT NO.
							+ '<Alignment ss:Horizontal="Center"/>'
							+ '<Font x:CharSet="204" ss:Size="12" ss:Color="#000000" ss:Bold="1" ss:Underline="Single"/>'
						+ '</Style>' 
						+ '<Style ss:ID="s2">' //淡藍底色
							+ '<Interior ss:Color="#CCFFFF" ss:Pattern="Solid"/>'
						+ '</Style>' 
						+ '<Style ss:ID="s3">' //靠上備註
							+ '<Alignment ss:Vertical="Top" ss:WrapText="1"/>'
						+ '</Style>' 
						+ '<Style ss:ID="s_warning">' //warning
							+ '<Font x:CharSet="204" ss:Color="#ff0000" ss:Underline="Single"/>'
						+ '</Style>' 
						+ '</Styles>';

				xmlStr += '<Worksheet ss:Name="Sheet1">';
				xmlStr += '<Table ss:DefaultColumnWidth="60">'
						+ '<Row>'
						+ '<Cell ss:StyleID="s0" ss:MergeAcross="17"><Data ss:Type="String"> '+companyName+'</Data></Cell>'
						+ '</Row>';

				xmlStr += '<Row>'
						+ '<Cell ss:StyleID="s0_1" ss:MergeAcross="17"><Data ss:Type="String"> '+addr1+' </Data></Cell>'
						+ '</Row>';

				xmlStr += '<Row>'
						+ '<Cell ss:MergeAcross="17" ss:StyleID="s1"><Data ss:Type="String"> CONTRACT NO. '+tranid+' </Data></Cell>'
						+ '</Row>';
				
				xmlStr += '<Row ss:Height="80">'
						+ '<Cell ss:MergeAcross="1"><Data ss:Type="String">Description(貨名): </Data></Cell>'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="12"><Data ss:Type="String"> '+linebreak(desc)+' </Data></Cell>'
						+ '<Cell ss:MergeAcross="2"><Data ss:Type="String">Date(日期): '+formatted_trandate+' </Data></Cell>'
						+ '</Row>';

				xmlStr += '<Row>'
						+ '<Cell ss:MergeAcross="1"><Data ss:Type="String">Buyer No. (客戶訂單編號): </Data></Cell>'
						+ '<Cell ss:MergeAcross="15"><Data ss:Type="String"> '+buyer_no+' </Data></Cell>'
						+ '</Row>';
				
				var numLines = soRec.getLineCount({
					sublistId: 'item'
				});
				
				var poStr = "";
				for(var i=0 ; i<numLines ; i++)
				{
					var po = soRec.getSublistText({
						sublistId: 'item',
						fieldId: 'createdpo',
						line: i
					});
					
					if( poStr.indexOf(po) == -1 ) poStr = poStr + po + ",";
				}
				
				xmlStr += '<Row>'
							+ '<Cell ss:MergeAcross="1"><Data ss:Type="String">Purchase Order No. </Data></Cell>'
							+ '<Cell ss:MergeAcross="15"><Data ss:Type="String"> '+poStr.substring(0,poStr.lastIndexOf(","))+' </Data></Cell>'
						+ '</Row>';
						
				
				xmlStr += '<Row>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Item </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Species </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Thickness (MM) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Width (Inch) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Length (Inch)</Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">FSC </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Base </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Glue </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">V. THN </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Face Grade </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Back Grade </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Crates </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Pieces per Crt </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Total(Pcs) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Total(MSF) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Total(M3) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">U.Price $/MSF </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">Total Amount </Data></Cell>'
						+ '</Row>';
				
				xmlStr += '<Row>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">料號 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">樹種 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">厚度 (公厘) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">寬度 (英吋) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">長度 (英吋)</Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">認證 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">基板 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">膠水 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">薄片厚度 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">面板等級 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">背板等級 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">箱數 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">每箱片數 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">總片數 </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">總材積(千平方英尺) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">總體積(立方公尺) </Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">單價(美金/每千平方英尺)</Data></Cell>'
							+ '<Cell ss:StyleID="s2"><Data ss:Type="String">總售價金額(美金)</Data></Cell>'
						+ '</Row>';
				
				
				var ttlCrt = 0;
				var ttlPieces = 0;
				var ttlMSF = 0;
				var ttlM3 = 0;
				var ttlAmount = 0;
				for(var i=0 ; i<numLines ; i++)
				{
					var item = soRec.getSublistText({sublistId: 'item', fieldId: 'item', line: i});
					var species = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_species', line: i});
					var thickness_mm = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_thickness_mm', line: i});
					var width_inch = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_width_inch', line: i});
					var length_inch = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_length_inch', line: i});
					var fsc = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_fsc', line: i});
					var baseboard = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_baseboard', line: i});
					var glue = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_glue', line: i});
					var thickness_face_mm = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_thickness_face_mm', line: i});
					var grade = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_grade', line: i});
					var back_grade = soRec.getSublistText({sublistId: 'item', fieldId: 'custcolgd_so_l_back_grade', line: i});
					var creates = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_creates', line: i});
					var pieces_per_crt = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_pieces_per_crt', line: i});
					var total_pcs = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_total_pcs', line: i});
					var quantity = soRec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
					var total_m3 = soRec.getSublistValue({sublistId: 'item', fieldId: 'custcolgd_so_l_total_m3', line: i});
					// var rate = soRec.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
					// var amount = soRec.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
					
					//rate和amount需抓取Purchase Order的價錢
					var rate = 0;
					var amount = 0;
					var item_id = soRec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
					var purchaseorderSearchObj = search.create({
						type: "purchaseorder",
						filters:
						[
							["type","anyof","PurchOrd"], 		 "AND", 
							["createdfrom","is",so_id],  		 "AND", 
							["item.internalid","anyof",item_id], "AND", 
							["mainline","is","F"],               "AND", 
							["taxline","is","F"]
						],
						columns:
						[
							search.createColumn({name: "quantity", label: "Quantity"}),
							search.createColumn({name: "amount", label: "Amount"})
						]
					});

					var rateOnlyOne = true;
					var searchResultCount = purchaseorderSearchObj.runPaged().count;
					if( searchResultCount > 1 ) rateOnlyOne = false;
					else
					{
						purchaseorderSearchObj.run().each(function(result){
							amount = result.getValue(result.columns[1]);
							var q = result.getValue(result.columns[0]);
							if( q ) rate = round(( amount / q ),2);
							return true;
						});
					}
					
					ttlCrt = ttlCrt + creates;
					ttlPieces = ttlPieces + total_pcs ;
					ttlMSF = ttlMSF + parseFloat(quantity) ;
					ttlM3 = ttlM3 + parseFloat(total_m3) ;
					ttlAmount = ttlAmount + parseFloat(amount) ;
					
					xmlStr += '<Row>'
						+ '<Cell><Data ss:Type="String">'+( !item ? "" : item )+' </Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !species ? "" : species )+' </Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !thickness_mm ? "String" : "Number" )+'">'+( !thickness_mm ? "" : thickness_mm )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !width_inch ? "String" : "Number" )+'">'+( !width_inch ? "" : width_inch )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !length_inch ? "String" : "Number" )+'">'+( !length_inch ? "" : length_inch )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !fsc ? "" : fsc )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !baseboard ? "" : baseboard )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !glue ? "" : glue )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !thickness_face_mm ? "String" : "Number" )+'">'+( !thickness_face_mm ? "" : thickness_face_mm )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !grade ? "" : grade )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="String">'+( !back_grade ? "" : back_grade )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !creates ? "String" : "Number" )+'">'+( !creates ? "" : creates )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !pieces_per_crt ? "String" : "Number" )+'">'+( !pieces_per_crt ? "" : pieces_per_crt )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !total_pcs ? "String" : "Number" )+'">'+( !total_pcs ? "" : total_pcs )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !quantity ? "String" : "Number" )+'">'+( !quantity ? "" : quantity )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !total_m3 ? "String" : "Number" )+'">'+( !total_m3 ? "" : total_m3 )+'</Data></Cell>'
						// + '<Cell><Data ss:Type="'+( !rate ? "String" : "Number" )+'">'+( !rate ? "" : rate )+'</Data></Cell>'
						+ '<Cell><Data '+( !rateOnlyOne ? "ss:StyleID=\"s_warning\"" : "" )+' ss:Type="'+( !rateOnlyOne ? "String" : "Number" )+'">'+( !rateOnlyOne ? "***ERROR:ITEM DUPLICATE***" : rate )+'</Data></Cell>'
						+ '<Cell><Data ss:Type="'+( !amount ? "String" : "Number" )+'">'+( !amount ? "" : amount )+'</Data></Cell>'
						+ '</Row>';
						
						 
				}
				
				// ===== total =====
				xmlStr += '<Row>'
							+ '<Cell ss:MergeAcross="9"></Cell>'
							+ '<Cell><Data ss:Type="String">Total:</Data></Cell>'
							+ '<Cell><Data ss:Type="String">'+ttlCrt+' Crts </Data></Cell>'
							+ '<Cell></Cell>'
							+ '<Cell><Data ss:Type="String">'+ttlPieces+' Pcs </Data></Cell>'
							+ '<Cell><Data ss:Type="String">'+round(ttlMSF,3)+' MSF </Data></Cell>'
							+ '<Cell><Data ss:Type="String">'+round(ttlM3,3)+' M3 </Data></Cell>'
							+ '<Cell></Cell>'
							+ '<Cell><Data ss:Type="String">US$ '+ttlAmount+'</Data></Cell>'
						+ '</Row>';
				
				// ===== 1 =====
				var req_ship_date = soRec.getValue({fieldId: 'custbody_req_ship_date'});
				var formatted_ship_date = "";
				if( req_ship_date != "" )
				{
					formatted_ship_date = format.format({
						value: req_ship_date,
						type: format.Type.DATE
					});
				}
				
				var destination = soRec.getValue({fieldId: 'custbody_destination'});
				var price_term = soRec.getValue({fieldId: 'custbody_price_term'});
				xmlStr += '<Row>'
						+ '<Cell ss:MergeAcross="5" ss:StyleID="s3"><Data ss:Type="String">Requested Shipping Date (船期要求): '+ formatted_ship_date+' </Data></Cell>'
						+ '<Cell ss:MergeAcross="5"><Data ss:Type="String">Destination (目的地): '+destination+' </Data></Cell>'
						+ '<Cell ss:MergeAcross="5"><Data ss:Type="String">Price Terms (交易條件): '+price_term+' </Data></Cell>'
						+ '</Row>';
				
				// ===== 2 =====
				var marks = soRec.getText({fieldId: 'custbody_marks'});
				var shipaddress = soRec.getValue({fieldId: 'shipaddress'});				
				xmlStr += '<Row ss:Height="80">'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="5"><Data ss:Type="String">Marks (外箱麥頭): '
						+ br + linebreak(marks)+' </Data></Cell>'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="11"><Data ss:Type="String">Ship Address: '
						+ br + shipaddress + ' </Data></Cell>'
						+ '</Row>';
				
				// ===== 3 =====
				var consignee = soRec.getValue({fieldId: 'custbody_consignee'});
				var custbody_c = soRec.getValue({fieldId: 'custbody_c'});		
				var custbody_d = soRec.getValue({fieldId: 'custbody_d'});
				var notify_party = soRec.getValue({fieldId: 'custbody_notify_party'});
				xmlStr += '<Row ss:Height="80">'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="5"><Data ss:Type="String">BL Instruction (提單要求) '
						+ br + 'Consignee :'
						+ br + linebreak(consignee)
						+ br + linebreak(custbody_c)
						+ br + linebreak(custbody_d)
						+ '</Data></Cell>'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="11"><Data ss:Type="String">Notify Party on B/L (提單通知人): '+
						+ br + linebreak(notify_party) +' </Data></Cell>'
						+ '</Row>';
				
				// ===== 4 =====
				var delivery_to = soRec.getValue({fieldId: 'custbody_delivery_to'});
				var appt = soRec.getValue({fieldId: 'custbody_appt'});
				var carrier = soRec.getValue({fieldId: 'custbody_carrier'});
				xmlStr += '<Row ss:Height="80">'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="5"><Data ss:Type="String">DELIVERY TO : '+linebreak(delivery_to)
						+ br + 'APPT. CONTRACT :' + linebreak(appt)
						+' </Data></Cell>'
						+ '<Cell ss:StyleID="s3" ss:MergeAcross="11"><Data ss:Type="String">Nominated Carrier(裝船要求) '
						+ br + linebreak(carrier)+' </Data></Cell>'
						+ '</Row>';
				
				// ===== 5 =====
				var custbody6 = soRec.getValue({fieldId: 'custbody6'});
				xmlStr += '<Row>'
						+ '<Cell ss:MergeAcross="17"><Data ss:Type="String">STATEMENT ON INVOICE / BL: '+custbody6+' </Data></Cell>'
						+ '</Row>';
				
				// ===== 6 =====
				var instruction = soRec.getValue({fieldId: 'custbody_instruction'});
				xmlStr += '<Row>'
						+ '<Cell ss:MergeAcross="1"><Data ss:Type="String">Special Instruction: </Data></Cell>'
						+ '<Cell ss:MergeAcross="15"><Data ss:Type="String"> '+instruction+' </Data></Cell>'
						+ '</Row>';
						
				xmlStr += '</Table></Worksheet></Workbook>';

				var strXmlEncoded = encode.convert({
					string : xmlStr,
					inputEncoding : encode.Encoding.UTF_8,
					outputEncoding : encode.Encoding.BASE_64
				});

				var objXlsFile = file.create({
					name : 'salesorder_'+so_id+'.xls',
					fileType : file.Type.EXCEL,
					contents : strXmlEncoded
				});
				
				context.response.writeFile({
					file : objXlsFile
				});
			}

		}
		
		//四捨五入小數後precision位
		//comma:是否加comma
		function round(value,precision,comma)
		{
			var multiplier = Math.pow(10, precision || 0);
			var roundNumber = ( Math.round(value * multiplier) / multiplier ).toFixed(precision);
			
			if( comma )
			{
				var parts = roundNumber.toString().split(".");
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				roundNumber = parts.join(".");
			}
			return roundNumber;
		}
		
		function linebreak(str)
		{
			return str.replace("\r", "&#013;").replace("\n", "&#010;");
			// log.debug(str.replace(/[r]/g, "換行"));
			// return str.replace(/[r]/g, br);
		}

		return {
			onRequest : onRequest
		};

});