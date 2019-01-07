/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/record','N/email','N/runtime','N/file'], 
function (ui, record, email, runtime, file)
{
	function onRequest(context)
	{
		var request = context.request;
	    if (request.method === 'GET')
		{
			var rid = request.parameters.rid;
			if( rid )
			{
				var formRec = record.load({
					type: "customrecord_export_forms",
					id: rid 
				});
				
				var altname = formRec.getValue({ fieldId: "altname"});
				var buyer_no = formRec.getValue({ fieldId: "custrecord_buyer_no"});
				var customer = formRec.getText({ fieldId: "custrecord_customer"});
				
				var doc_1 = formRec.getValue({ fieldId: "custrecord_doc_1"});
				var doc_2 = formRec.getValue({ fieldId: "custrecord_doc_2"});
				var doc_3 = formRec.getValue({ fieldId: "custrecord_doc_3"});
				var doc_4 = formRec.getValue({ fieldId: "custrecord_doc_4"});
				
				var attachmentArray = new Array();
				for(var i = 1; i <= 4; i++)
				{
					if( eval("doc_"+i) )
					{
						eval("attachmentArray.push(doc_"+i+")");
					}
				}
				
				var fileObj = new Array();
				for(var i = 0; i < attachmentArray.length; i++)
				{
					fileObj[i] = file.load({ id: attachmentArray[i] });
				}
				
				var userObj = runtime.getCurrentUser();
				email.send({
					author: userObj.id,
					recipients: userObj.id,
					subject: 'Export Forms - '+altname+" ("+buyer_no+")",
					body: 'Customer : '+customer+', please see attachments.',
					attachments: fileObj
				});
				
				var form = ui.createForm({
					title : " Send Mail Successfully : " + userObj.email
				});
				
				context.response.writePage(form);

			}
        }
    }
	
	return {
        onRequest: onRequest
    };
});