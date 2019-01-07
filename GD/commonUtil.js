/**
 * commonUtil.js
 * @NApiVersion 2.x
 */
define([],
function() {
	
	function padDigits(number, digits) {
		return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
	}
	
	function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}
	
    return {
        padDigits: padDigits,
		round: round
    };
    
});
