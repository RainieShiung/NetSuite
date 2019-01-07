/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record'],

function(record) {
	
	function onRequest(context)
	{
		var req = context.request;
		
		var rt = req.parameters.rt; //record type
		var from_seq = parseInt(req.parameters.from_seq);
		var to_seq = parseInt(req.parameters.to_seq);
		
		// https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=2358&deploy=1&rt=customrecord_ev_upload_log&from_seq=5090&to_seq=5390
		// https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=2358&deploy=1&rt=customrecord_ev_upload_log&from_seq=5090&to_seq=5390

		for( var i=from_seq ; i<=to_seq ; i++ )
		{
			try
			{
				if( rt.indexOf("customrecord") != -1 )
				{
					record.delete({ type: rt, id: i });
				}
				else
				{
					eval("record.delete({ type: record.Type."+rt+", id: "+i+" })"); //SALES_ORDER
				}
			}
			catch(e)
			{
				log.debug({
					title: 'Delete Record Err:', 
					details: e
				});
			}
		}
		context.response.write("done");
		
	}
	
    return {
        onRequest: onRequest
    };
    
});
