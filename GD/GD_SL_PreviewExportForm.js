/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/record','N/search','N/url','N/redirect','./commonUtil'],
    function(serverWidget,record,search,url,redirect,util)
	{
		function getLaceyColumns()
		{
			return ['custrecord_lacey_form_no',
					'custrecord_htsus',		
					'custrecord_entered_value',
					'custrecord_artical',		
					'custrecord_genus_select', //下拉選單	
					'custrecord_genus',		
					'custrecord_species',		
					'custrecord_harvest',		
					'custrecord_quantity',		
					'custrecord_unit',			
					'custrecord_recycled',		
					'custrecord_category' ] ;
		}
		
		var speciesMap = {};
		function checkDup(checkStr)
		{
			var v = speciesMap[checkStr];
			if( !v )
			{
				speciesMap[checkStr] = checkStr;
				return false; //沒有重複
			}
			return true; //重複
		}
		
		function LaceyData( form_no, category, species, artical, quantity, unit, recycled, speciesName, categoryName )
		{
			this['custrecord_lacey_form_no'] = form_no;
			this['custrecord_category'] = category;
			// this['custrecord_species'] = species;
			this['custrecord_species'] = speciesName;
			this['custrecord_htsus'] = "4412995100";
			this['custrecord_genus'] = "GENUS";
			this['custrecord_entered_value'] = "0";
			this['custrecord_artical'] = artical;
			this['custrecord_harvest'] = "CTRY";
			this['custrecord_quantity'] = quantity;
			this['custrecord_unit'] = unit;
			this['custrecord_recycled'] = recycled;			
			this['speciesName'] = speciesName;
			this['categoryName'] = categoryName;
		}
		
		function PackingData( itemfulfill, packing_form_no, marks, species, desc, pkg, pcs_pkg, pcs, msf, m3, speciesName, cut, grade, seq )
		{
			this['custrecord_packing_itemfulfill'] = itemfulfill;
			this['custrecord_packing_form_no'] = packing_form_no;
			this['custrecord_packing_marks'] = marks;
			this['custrecord_species_packing'] = species;
			this['custrecord_cut_packing'] = cut;
			this['custrecord_grade_packing'] = grade;
			this['custrecord_desc'] = desc;
			this['custrecord_packing_unit'] = pkg;
			this['custrecord_pcs_unit'] = pcs_pkg;
			this['custrecord_pcs'] = pcs;
			this['custrecord_msf'] = msf;
			this['custrecord_m3'] = m3;
			this['speciesName'] = speciesName;
			this['custrecord_seq_packing'] = seq;
		}
		
		function InvoiceData( form_no, species, desc, pcs, usd_pcs, msf, usd_msf, speciesName, cut, grade, seq, ttlAmount )
		{
			this['custrecord_invoice_form_no'] = form_no;
			this['custrecord_cut_invoice'] = cut;
			this['custrecord_grade_invoice'] = grade;
			this['custrecord_species_invoice'] = species;
			this['custrecord_desc_invoice'] = desc;
			this['custrecord_pcs_invoice'] = pcs;
			this['custrecord_usd_pcs'] = usd_pcs;
			this['custrecord_msf_invoice'] = msf;
			this['custrecord_usd_msf'] = usd_msf;
			this['custrecord_ttl_amount'] = ttlAmount;
			this['speciesName'] = speciesName;
			this['custrecord_seq_invoice'] = seq;
		}
		
        function onRequest(context)
		{
			var req = context.request;
			
			if (req.method === 'GET')
			{
				// 接收母頁面傳的參數
				var type = req.parameters.type;
				var rid = req.parameters.rid; //record id
				
				var formName = "";
				var field_identifier = "";
				
				if( type == "1" ) formName = "10+2";
				if( type == "2" )
				{
					formName = "Lacey";
					field_identifier = "lacey";
				}
				if( type == "3" )
				{
					formName = "Packing List";
					field_identifier = "packing";
				}
				if( type == "4" )
				{
					formName = "Commercial Invoice";
					field_identifier = "invoice";
				}
				
				var formRec = record.load({
					type: "customrecord_export_forms", 
					id: rid,
					isDynamic: true
				});
                
				var form = serverWidget.createForm({
					title : "Preview Form : " + formName
				});

				// ============== 表頭COLUMNS ==============
				var fieldgroup_columns = form.addFieldGroup({
					id : 'custpage_fg_1',
					label : 'Columns'
				});
				
				var fulfillText = form.addField({ //for傳參數給WORD
					id: "custpage_fulfillment",
					label: "Fulfillment",
					type: serverWidget.FieldType.TEXT,
					container: "custpage_fg_1"
				});
				fulfillText.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
				
				var ridText = form.addField({ //for傳參數給WORD
					id: "custpage_rid",
					label: "Export Form Record",
					type: serverWidget.FieldType.TEXT,
					container: "custpage_fg_1"
				});
				ridText.defaultValue = rid;
				ridText.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
				
				var form_typeText = form.addField({ //for傳參數給WORD
					id: "custpage_form_type",
					label: "Export Form Type",
					type: serverWidget.FieldType.TEXT,
					container: "custpage_fg_1"
				});
				form_typeText.defaultValue = type;
				form_typeText.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
				
				var mappingObj = search.create({
					type: "customrecord_export_forms_mapping",
					columns:
					[
						search.createColumn({name: "custrecord_column_id",   label: "Column ID"}),
						search.createColumn({name: "custrecord_column_name", label: "Column Name"}),
						search.createColumn({
							name: "custrecord_form_"+type+"_seq",
							sort: search.Sort.ASC
						})
					]
				});
				
				var filters = mappingObj.filters;
				var formFilter = search.createFilter({
					name: "custrecord_export_forms_"+type,
					operator: search.Operator.IS,
					values: true 
				});
				filters.push(formFilter);
				mappingObj.filters = filters;
				
				mappingObj.run().each(function(result){
					
					var cid = result.getValue({ name: "custrecord_column_id"});
					var cname = result.getValue({ name: "custrecord_column_name"});
					
					var field = form.addField({
						id : 'custpage_'+cid,
						type : serverWidget.FieldType.TEXT,
						label : cname,
						container : 'custpage_fg_1'
					});
					
					field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
					
					var fieldValue = formRec.getValue({ fieldId: cid }); //從前一頁將值帶入
					if( cid == "custrecord_marks" )
					{
						fieldValue = fieldValue.replace(/([\r])/g, "<br>");
					}
					field.defaultValue = fieldValue;
					
					return true;
				});
				
				// 除了10+2之外，其他表單都須抓取各張item fulfillment資料行
				if( type != "1" )
				{
					var if_list = formRec.getValue({ fieldId: 'custrecord_itemfulfill' });
					var ifRecCnt = 1 ;
			
					if_list.forEach(function(v){
						var ifRec = record.load({
							type: record.Type.ITEM_FULFILLMENT,
							id: v 
						});
						fulfillText.defaultValue = fulfillText.defaultValue + "/" + v;
						
						var tranid = ifRec.getValue({ "fieldId": "tranid" });
						
						// 新增櫃號/總重/淨重輸入Field Group
						var fg_cntr = form.addFieldGroup({
							id : 'custpage_fg_cntr_'+v,
							label : '# ' + tranid + " Container Infomation"
						});
						
						var bl_no = form.addField({
							id : 'custpage_bl_no_'+v,
							type : serverWidget.FieldType.TEXT,
							label : "BL No.",
							container : 'custpage_fg_cntr_'+v
						});
						bl_no.defaultValue = eval("formRec.getValue({ fieldId : 'custrecord_bl_no_"+ifRecCnt+"'})");
						bl_no.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
						
						var cntr_no = form.addField({
							id : 'custpage_cntr_no_'+v,
							type : serverWidget.FieldType.TEXT,
							label : "Container No.",
							container : 'custpage_fg_cntr_'+v
						});
						cntr_no.defaultValue = eval("formRec.getValue({ fieldId : 'custrecord_cntr_no_"+ifRecCnt+"'})");
						cntr_no.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
						
						var cntr_type = form.addField({
							id : 'custpage_cntr_type_'+v,
							type : serverWidget.FieldType.TEXT,
							label : "Container Type",
							container : 'custpage_fg_cntr_'+v
						});
						cntr_type.defaultValue = eval("formRec.getValue({ fieldId : 'custrecord_cntr_type_"+ifRecCnt+"'})");
						cntr_type.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
						
						var ttl_weight = form.addField({
							id : 'custpage_ttl_weight_'+v,
							type : serverWidget.FieldType.TEXT,
							label : "TTL Weight",
							container : 'custpage_fg_cntr_'+v
						});
						ttl_weight.defaultValue = eval("formRec.getValue({ fieldId : 'custrecord_ttl_weight_"+ifRecCnt+"'})"); 
						ttl_weight.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
						
						var net_weight = form.addField({
							id : 'custpage_net_weight_'+v,
							type : serverWidget.FieldType.TEXT,
							label : "Net Weight",
							container : 'custpage_fg_cntr_'+v
						});
						net_weight.defaultValue = eval("formRec.getValue({ fieldId : 'custrecord_net_weight_"+ifRecCnt+"'})"); 
						net_weight.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
						
						// by各種表單，整理item加總資料行
						var numLines = ifRec.getLineCount({ sublistId: 'item' });
						
						if( type == "2" )
						{
							for(var i=0 ; i<numLines ; i++)
							{
								var species = ifRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcolgd_so_l_species',
									line: i
								});
								
								var category = ifRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcolgd_so_l_mcategory',
									line: i
								});
								
								checkDup(category+species);
							}
						}
						
						if( type == "3" || type == "4" )
						{
							for(var i=0 ; i<numLines ; i++)
							{
								var species = ifRec.getSublistValue({
									sublistId: 'item',
									fieldId: 'custcolgd_so_l_species',
									line: i
								});
								checkDup(species);
							}
						}
						
						
						var so_id = ifRec.getValue({ "fieldId": "createdfrom" });
						var soRec = record.load({
							type: record.Type.SALES_ORDER,
							id: so_id
						});
						
						for(var i=0 ; i<numLines ; i++)
						{
							var marks = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_cntr_no',
								line: i
							});
							
							var species = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_species',
								line: i
							});
							
							var speciesName = ifRec.getSublistText({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_species',
								line: i
							});
							
							var category = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_mcategory',
								line: i
							});
							
							var categoryName = ifRec.getSublistText({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_mcategory',
								line: i
							});
							
							var artical = categoryName + " MADE OF " + speciesName;
							
							if( type == "2" )
							{
								if( speciesMap[category+species] == category+species )
									speciesMap[category+species] = [];
							}
							
							if( type == "3" || type == "4" )
							{
								if( speciesMap[species] == species )
									speciesMap[species] = [];
							}
							
							var width_inch = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_width_inch',
								line: i
							});
							
							var length_inch = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_length_inch',
								line: i
							});
							
							var desc = width_inch + " x " + length_inch;
							
							var pkg = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_creates',
								line: i
							});
							
							var pcs_pkg = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_pieces_per_crt',
								line: i
							});
							
							var pcs = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_total_pcs',
								line: i
							});
							
							var msf = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_total_msf',
								line: i
							});
							
							var m3 = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_total_m3',
								line: i
							});
							
							var cut = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_cut',
								line: i
							});
							
							var grade = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'custcolgd_so_l_grade',
								line: i
							});
							
							var seq = ifRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'orderline',
								line: i
							});
							
							var unit = ifRec.getSublistText({
								sublistId: 'item',
								fieldId: 'unitsdisplay',
								line: i
							});
							
							var rate = soRec.getSublistValue({
								sublistId: 'item',
								fieldId: 'rate',
								line: (seq-1)
							});
							
							// Lacey
							if( type == "2" )
							{
								var quantity = parseFloat(msf) * 92.9;

								speciesMap[category+species].push(new LaceyData( rid, category, species, artical, util.round(quantity, 3), "m^2", "0", speciesName, categoryName));
							}
							
							// Packing List
							if( type == "3" )
							{
								speciesMap[species].push(new PackingData(v, rid, marks, species, desc, pkg, pcs_pkg, pcs, msf, m3, speciesName, cut, grade, seq));
							}
							
							// Commercial Invoice
							if( type == "4" )
							{
								// ( form_no, species, desc, pcs, usd_pcs, msf, usd_msf, speciesName, cut, seq, ttlAmount )
								var ratePCS = 0;
								var rateMSF = 0;
								var ttlAmount = 0;
								
								if( unit == "PCS" )
								{
									ratePCS = rate;
									ttlAmount = pcs * rate;
									
									rateMSF = util.round(ttlAmount / msf, 4);
								}
								else if( unit == "MSF" )
								{
									rateMSF = rate;
									ttlAmount = msf * rate;
									
									ratePCS = util.round(ttlAmount / pcs, 4);
								}
								
								speciesMap[species].push(new InvoiceData( rid, species, desc, pcs, ratePCS, msf, rateMSF, speciesName, cut, grade, seq, util.round(ttlAmount,2)));
							}
						}
						
						ifRecCnt++;
					});
					
					//============= DELETE SUBLIST RECORD =============
					delSublist(field_identifier, rid);
					
					//============= SAVE SUBLIST RECORD =============
					if( type == "2" )
					{
						saveLaceySublist(form);
					}
					
					if( type == "3" )
					{
						savePackingSublist(form, if_list, rid);
					}
					
					if( type == "4" )
					{
						saveInvoiceSublist(form);
					}
					
					fulfillText.defaultValue = fulfillText.defaultValue.replace("null/","");
				}
				
				if( type == "2" )
				{
					form.addSubmitButton({
						label: 'PDF'
					});
				}
				else
				{
					form.addSubmitButton({
						label: 'Word'
					});
				}
				
                context.response.writePage(form);

            } else { // after press button
                var delimiter = /\u0001/;
				
				var rid = req.parameters.custpage_rid;
				var form_type = req.parameters.custpage_form_type;
				
				if( form_type == "2" ) //Lacey
				{
					redirect.toSuitelet({
						scriptId: 20 ,
						deploymentId: 1,
						parameters: {
							custscript_lacey_rid: rid
						}
					});
					
					delSublist("lacey", rid);
					
					// save user keyin 樹種下拉選單
					var laceyColumns = getLaceyColumns();
					var lacey_numLines = req.getLineCount('custpage_sublist_lacey');
					
					for( var i=0 ; i<lacey_numLines ; i++ )
					{
						var detailRec = record.create({ type: "customrecord_lacey" });
						var custrecord_lacey_form_no = rid;
						var custrecord_category = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_category',
							line: i
						});
						
						var custrecord_htsus = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_htsus',
							line: i
						});
						
						var custrecord_entered_value = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_entered_value',
							line: i
						});
						
						var custrecord_artical = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_artical',
							line: i
						});
						
						var custrecord_quantity = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_quantity',
							line: i
						});
						
						var custrecord_unit = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_unit',
							line: i
						});
						
						var custrecord_recycled = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_recycled',
							line: i
						});
						
						var custrecord_genus = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_genus',
							line: i
						});
						
						var custrecord_species = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_species',
							line: i
						});
						
						var custrecord_harvest = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_harvest',
							line: i
						});

						var splitStr = req.getSublistValue({
							group: 'custpage_sublist_lacey',
							name: 'custpage_custrecord_genus_select',
							line: i
						});
						
						// log.debug("splitStr:"+splitStr);

						var genusArr = ( !splitStr ? null : splitStr.split("|") );
						
						// log.debug("genusArr:"+genusArr);
						
						for( var j=0 ; j<laceyColumns.length ; j++ )
						{
							var custfiledId = laceyColumns[j];
							if( custfiledId == "custrecord_genus_select" )
							{
								// do nothing
							}
							else if( genusArr != null && custfiledId == "custrecord_genus" )
							{
								detailRec.setValue({
									fieldId: "custrecord_genus",
									value: genusArr[0]
								});
								
								// log.debug("custrecord_genus:"+genusArr[0]);
							}
							else if( genusArr != null && custfiledId == "custrecord_species" )
							{
								detailRec.setValue({
									fieldId: "custrecord_species",
									value: genusArr[1]
								});
								// log.debug("custrecord_species:"+genusArr[1]);
							}
							else if( genusArr != null && custfiledId == "custrecord_harvest" )
							{
								detailRec.setValue({
									fieldId: "custrecord_harvest",
									value: genusArr[2]
								});
								// log.debug("custrecord_harvest:"+genusArr[2]);
							}
							else
							{
								var v = eval(custfiledId);
								// log.debug("custfiledId:"+custfiledId+" = "+v);
								detailRec.setValue({
									fieldId: custfiledId,
									value: v
								});
							}
						}
						
						detailRec.setValue({
							fieldId: "custrecord_seq_lacey",
							value: ( i+1 )
						});
						detailRec.save();
					}
					
				}
				else
				{
					redirect.toSuitelet({
						scriptId: 19 ,
						deploymentId: 1,
						parameters: {
							custscript_rid: rid,
							custscript_form_type: form_type
						}
					});
				}
				
				
            }
        }
		
		// 刪除sublist資料行
		function delSublist(field_identifier, rid)
		{
			var delObj = search.create({
				type: "customrecord_"+field_identifier
			});
			
			var filters = delObj.filters;
			var formFilter = search.createFilter({
				name: "custrecord_"+field_identifier+"_form_no",
				operator: search.Operator.IS,
				values: rid 
			});
			filters.push(formFilter);
			delObj.filters = filters;
			
			delObj.run().each(function(result){
				
				record.delete({
					type: "customrecord_"+field_identifier,
					id: result.id
				});
				return true;
			});
		}
		
		// 儲存sublist資料行
		function saveLaceySublist(form)
		{
			var objRecord = record.create({ type: "customrecord_lacey" });
			
			var sublist = form.addSublist({
				id : "custpage_sublist_lacey",
				type : serverWidget.SublistType.INLINEEDITOR,
				label : "Lacey Sublist"
			});
			
			var lineCnt = 0;
			for( var x in speciesMap ) //MAIN CATEGORY + SPECIES
			{
				var ttlQuantity = 0;
				
				for( var y in speciesMap[x] ) //資料行
				{
					ttlQuantity += speciesMap[x][y]['custrecord_quantity'];
				}
				
				var detailRec = record.create({ type: "customrecord_lacey" });
				
				var laceyColumns = getLaceyColumns();
				for( var i=0 ; i<laceyColumns.length ; i++ )
				{
					var custfiledId = laceyColumns[i];
					detailRec.setValue({
						fieldId: custfiledId,
						value: speciesMap[x][y][custfiledId]
					});
					
					var objField = detailRec.getField({ fieldId: custfiledId }); 
					
					if( lineCnt == 0 ) //第一行才需要建立line
					{
						//樹種下拉選單
						if( custfiledId == "custrecord_genus_select" )
						{
							var selectField = sublist.addField({
								id : 'custpage_'+custfiledId,
								type : serverWidget.FieldType.SELECT,
								label : "Genus / Species / Country of Harvest"
							});
							
							selectField.addSelectOption({
								value : "",
								text : ""
							});
							
							selectField.updateDisplaySize({
								height : 60,
								width : 600
							});
						}
						else if ( /* custfiledId == "custrecord_genus" || 
								  custfiledId == "custrecord_species" || 
								  custfiledId == "custrecord_harvest" || */
								  custfiledId == "custrecord_lacey_form_no" )
						{
							// do nothing
						}
						else
						{
							sublist.addField({
								id : 'custpage_'+custfiledId,
								type : serverWidget.FieldType.TEXT,
								label : objField.label.toLowerCase()
							});
						}
					}
					
					if( custfiledId == "custrecord_genus_select" )
					{
						//列出樹種對照表供挑選
						var speciesName = speciesMap[x][y]['speciesName'];
						var speciesSearchObj = search.create({
							type: "customrecord_species",
							filters:
							[
								["name","haskeywords",speciesMap[x][y]['speciesName']]
							],
							columns:
							[
								search.createColumn({name: "name", label: "Name" }),
								search.createColumn({name: "custrecord_lacey_genus", label: "Genus"}),
								search.createColumn({name: "custrecord_lacey_species", label: "Species"}),
								search.createColumn({name: "custrecord_lacey_harvest", label: "Country of Harvest"})
							]
						});
						
						speciesSearchObj.run().each(function(result){
							
							var genus   = result.getValue({ name: "custrecord_lacey_genus" });
							var species = result.getValue({ name: "custrecord_lacey_species" });
							var harvest = result.getValue({ name: "custrecord_lacey_harvest" });
							
							selectField.addSelectOption({
								value : genus+"|"+species+"|"+harvest,
								text : "["+speciesName+"] Genus : "+genus+" / Species : "+species+" / Country of harvest : "+harvest
							});
							return true;
						});
					}
					else
					{
						sublist.setSublistValue({
							id : 'custpage_'+custfiledId, //custrecord_packing_itemfulfill
							line : lineCnt,
							value : speciesMap[x][y][custfiledId] //欄位名稱
						});
					}				
					
					
				}
				lineCnt ++;
				detailRec.save();
			}
		}
		
		// 儲存sublist資料行
		function savePackingSublist(form, if_list, rid)
		{
			if_list.forEach(function(v){
					
				var ifRec = record.load({
					type: record.Type.ITEM_FULFILLMENT,
					id: v 
				});
				
				var tranid = ifRec.getValue({ "fieldId": "tranid" });
				
				// 動態產生sublist欄位
				var objRecord = record.create({ type: "customrecord_packing" });
				
				for( var x in speciesMap ) //樹種
				{
					var sublist = null;
					var lineCnt = -1;
					
					for( var y in speciesMap[x] ) //資料行
					{
						var detailRec = null;
						if( speciesMap[x][y]["custrecord_packing_itemfulfill"] == v ) //該張item fulfillment
						{
							detailRec = record.create({ type: "customrecord_packing" });
							detailRec.setValue({
								fieldId: "custrecord_packing_itemfulfill",
								value: v
							});
							
							detailRec.setValue({
								fieldId: "custrecord_packing_form_no",
								value: rid
							});
							
							if( sublist == null ) //建立sublist
							{
								sublist = form.addSublist({
									id : 'custpage_sublist_'+v+"_"+x,
									type : serverWidget.SublistType.STATICLIST,
									label : '#' + tranid + " - " + speciesMap[x][0]['speciesName']
								});
								lineCnt = 0;
							}
							
							var objFields = objRecord.getFields();
							objFields.forEach(function(fieldName){
								
								if( fieldName.indexOf("custrecord") != -1 )
								{
									var objField = objRecord.getField({ fieldId: fieldName }); 
									var custfiledId = objField.id;
									var filedLabel = objField.label.toLowerCase();
									
									if( speciesMap[x][y]["custrecord_packing_itemfulfill"] == v )
									{
										if( custfiledId.indexOf("_itemfulfill") == -1 && 
											custfiledId.indexOf("_form_no") == -1 )
										{
											if( lineCnt == 0 ) //第一行才需要建立line
											{
												sublist.addField({
													id : 'custpage_'+custfiledId,
													type : serverWidget.FieldType.TEXT,
													label : filedLabel
												});
											}

											var sValue = speciesMap[x][y][custfiledId];											
											sublist.setSublistValue({
												id : 'custpage_'+custfiledId, //custrecord_packing_itemfulfill
												line : lineCnt,
												value : ( sValue ? sValue : " " )  //欄位名稱
											});

											detailRec.setValue({
												fieldId: custfiledId,
												value: speciesMap[x][y][custfiledId]
											});
										}
									}	
								}
							});
							lineCnt ++;
							detailRec.save();
						}
					}
				}
			});
		}
		
	    function saveInvoiceSublist(form)
		{
			var objRecord = record.create({ type: "customrecord_invoice" });
					
			for( var x in speciesMap ) //樹種
			{
				var sublist = form.addSublist({
					id : "custpage_sublist_"+x,
					type : serverWidget.SublistType.STATICLIST,
					label : speciesMap[x][0]['speciesName']
				});
				
				var lineCnt = 0;
				for( var y in speciesMap[x] ) //資料行
				{
					var detailRec = record.create({ type: "customrecord_invoice" });

					var objFields = objRecord.getFields();
					objFields.forEach(function(fieldName){
						
						if( fieldName.indexOf("custrecord") != -1 )
						{
							var objField = objRecord.getField({ fieldId: fieldName }); 
							var custfiledId = objField.id;
							var filedLabel = objField.label.toLowerCase();
							
							if( lineCnt == 0 ) //第一行才需要建立line
							{
								sublist.addField({
									id : 'custpage_'+custfiledId,
									type : serverWidget.FieldType.TEXT,
									label : filedLabel
								});
							}
							
							if( custfiledId == "custrecord_seq_invoice" ) //重編seq
							{
								sublist.setSublistValue({
									id : 'custpage_'+custfiledId,
									line : lineCnt,
									value : lineCnt+1 //欄位名稱
								});
							}
							else
							{
								sublist.setSublistValue({
									id : 'custpage_'+custfiledId, //custrecord_packing_itemfulfill
									line : lineCnt,
									value : speciesMap[x][y][custfiledId] //欄位名稱
								});
							}
							
							detailRec.setValue({
								fieldId: custfiledId,
								value: speciesMap[x][y][custfiledId]
							});
						}
					});
					lineCnt ++;
					detailRec.save();
				};
			}
		}
		
        return {
            onRequest: onRequest
        };
    });