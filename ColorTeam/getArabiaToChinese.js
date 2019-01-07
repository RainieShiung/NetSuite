/**
 * Arabia_to_Chinese.js
 * 取得中文大寫金額
 * @NApiVersion 2.x
 */

define([],

function() {
	
	function Arabia_to_Chinese(amount)
	{
		var Num = amount.toString();
		for(var i=Num.length-1;i>=0;i--)
		{
			Num = Num.replace(",","");//替換tomoney()中的“,”
			Num = Num.replace(" ","");//替換tomoney()中的空格
		}
		Num = Num.replace("￥","");//替換掉可能出現的￥字符
		if(isNaN(Num)) 
		{ //驗證輸入的字符是否為數字
			alert("請檢查小寫金額是否正確");
			return;
		}
		
		//字符處理完畢後開始轉換，采用前後兩部分分別轉換
		part = String(Num).split(".");
		newchar = ""; 
		
		//小數點前進行轉化
		for(var i=part[0].length-1;i>=0;i--)
		{
			if(part[0].length > 10)
			{
				alert("位數過大，無法計算");
				return "";
			}//若數量超過拾億單位，提示
			tmpnewchar = "";
			perchar = part[0].charAt(i);
			switch(perchar)
			{
				case "0": tmpnewchar="零" + tmpnewchar ;break;
				case "1": tmpnewchar="壹" + tmpnewchar ;break;
				case "2": tmpnewchar="貳" + tmpnewchar ;break;
				case "3": tmpnewchar="叁" + tmpnewchar ;break;
				case "4": tmpnewchar="肆" + tmpnewchar ;break;
				case "5": tmpnewchar="伍" + tmpnewchar ;break;
				case "6": tmpnewchar="陸" + tmpnewchar ;break;
				case "7": tmpnewchar="柒" + tmpnewchar ;break;
				case "8": tmpnewchar="捌" + tmpnewchar ;break;
				case "9": tmpnewchar="玖" + tmpnewchar ;break;
			}
			
			switch(part[0].length-i-1)
			{
				case 0: tmpnewchar = tmpnewchar +"元" ;break;
				case 1: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
				case 2: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
				case 3: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
				case 4: tmpnewchar= tmpnewchar +"萬" ;break;
				case 5: if(perchar!=0)tmpnewchar= tmpnewchar +"拾" ;break;
				case 6: if(perchar!=0)tmpnewchar= tmpnewchar +"佰" ;break;
				case 7: if(perchar!=0)tmpnewchar= tmpnewchar +"仟" ;break;
				case 8: tmpnewchar= tmpnewchar +"億" ;break;
				case 9: tmpnewchar= tmpnewchar +"拾" ;break;
			}
			newchar = tmpnewchar + newchar;
		}
	 
		//小數點之後進行轉化
		if(Num.indexOf(".")!=-1)
		{
			if(part[1].length > 2) 
			{
				alert("小數點之後只能保留兩位,系統將自動截斷");
				part[1] = part[1].substr(0,2);
			}
			
			for(var i=0;i<part[1].length;i++)
			{
				tmpnewchar = "";
				perchar = part[1].charAt(i);
				switch(perchar)
				{
					case "0": tmpnewchar="零" + tmpnewchar ;break;
					case "1": tmpnewchar="壹" + tmpnewchar ;break;
					case "2": tmpnewchar="貳" + tmpnewchar ;break;
					case "3": tmpnewchar="叁" + tmpnewchar ;break;
					case "4": tmpnewchar="肆" + tmpnewchar ;break;
					case "5": tmpnewchar="伍" + tmpnewchar ;break;
					case "6": tmpnewchar="陸" + tmpnewchar ;break;
					case "7": tmpnewchar="柒" + tmpnewchar ;break;
					case "8": tmpnewchar="捌" + tmpnewchar ;break;
					case "9": tmpnewchar="玖" + tmpnewchar ;break;
				}
				if(i==0)tmpnewchar =tmpnewchar + "角";
				if(i==1)tmpnewchar = tmpnewchar + "分";
				newchar = newchar + tmpnewchar;
			}
		}
		
		//替換所有無用漢字
		while( newchar.search("零零") != -1)
				newchar = newchar.replace("零零", "零");
				newchar = newchar.replace("零億", "億");
				newchar = newchar.replace("億萬", "億");
				newchar = newchar.replace("零萬", "萬");
				newchar = newchar.replace("零元", "元");
				newchar = newchar.replace("零角", "");
				newchar = newchar.replace("零分", "");
		if (newchar.charAt(newchar.length-1) == "元" || newchar.charAt(newchar.length-1) == "角")
		newchar = newchar+"整";
		return newchar;
	}
   
    return {
    	getArabiaToChinese: Arabia_to_Chinese
    };
    
});
