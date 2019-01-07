/**
 * estimateToProject.js
 * @NApiVersion 2.x
 */
define(['N/url'], function(url) {

	function printExcelForSalesOrder(sid)
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
		printExcelForSalesOrder: printExcelForSalesOrder
    };
});
