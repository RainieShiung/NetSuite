/**
 * printExportForms.js
 * @NApiVersion 2.x
 */
define(['N/url'], function(url) {

	function printInvoice(rid)
	{
		window.open( url.resolveScript({
			scriptId : 'customscript_so_excel',
			deploymentId : 'customdeploy_so_excel',
			params : {
				'so_id' : sid
			}
		}) , '_blank' );
	}
		
    return {
		printInvoice: printInvoice
    };
});
