/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define( [ 'N/file', 'N/encode', 'N/record', './print_Packing', './print_Invoice', './print_Invoice_Payment', './print_10_2' ],
function(file, encode, record, packing, inv, payment, usa_10_2)
{
	function onRequest(context)
	{
		var req = context.request;
		var xmlStr = "";
		
		var rid = req.parameters.rid;
		var form_type = req.parameters.type;
		
		if ( req.method == 'GET' )
		{			
			if( !rid ) rid = context.request.parameters['custscript_rid'];
			if( !form_type ) form_type = context.request.parameters['custscript_form_type'];

			var formRec = record.load({
				type: "customrecord_export_forms", 
				id: rid 
			});
			
			var invoice_id = formRec.getValue({ fieldId: "altname" });
			var file_name = "";
			
			if( form_type == "1" ) //10+2
			{
				xmlStr = usa_10_2.doWord(formRec);
				file_name = invoice_id+"_10_2.doc";
			}
			
			if( form_type == "3" ) //packing list
			{
				xmlStr = packing.doWord(formRec);
				file_name = invoice_id+"_packing.doc";
			}
			
			if( form_type == "4" ) //commercial invoice list
			{
				xmlStr = inv.doWord(formRec);
				file_name = invoice_id+"_invoice.doc";
			}
			
			if( form_type == "4_1" ) //commercial invoice - payment
			{
				xmlStr = payment.doWord(formRec);
				file_name = invoice_id+"_payment.doc";
			}
			
			var strDocEncoded = encode.convert({
				string : xmlStr,
				inputEncoding : encode.Encoding.UTF_8,
				outputEncoding : encode.Encoding.BASE_64
			});

			var fName = file_name;
			var objDocFile = file.create({
				name : fName,
				fileType : file.Type.WORD,
				contents : strDocEncoded
			});
			
			// save file to document
			objDocFile.name = fName;
			objDocFile.folder = 10;
			
			var f = objDocFile.save();
			formRec.setValue({ fieldId: "custrecord_doc_"+form_type, value: f });
			formRec.save();

			context.response.writeFile({
				file : objDocFile
			});
		}
	}

	return {
		onRequest : onRequest
	};

});