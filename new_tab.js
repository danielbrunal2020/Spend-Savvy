var grandTotalArray = document.getElementsByClassName('a-color-base a-text-bold');
var i;
var price;
//sort through html of order details to find order price
for(i = 0; i < grandTotalArray.length; i++) {
    if(grandTotalArray[i].innerText.charAt(0) == "$") {
        price = grandTotalArray[i].innerText;
    }
}

//convert string version of price into a float
price = price.substring(1);
var totalPrice = parseFloat(price);

var savingsArray = document.getElementsByClassName('a-color-base');
var savings;
//sort through html of order details to find savings
for(i = 0; i < savingsArray.length; i++) {
    if(savingsArray[i].innerText.charAt(0) == "-") {
        savings = savingsArray[i].innerText;
    }
}
//convert string version of savings into a float, if there were savings
var totalSavings;
if(typeof savings !== "undefined") {
    savings = savings.substring(2);
    totalSavings = parseFloat(savings);
}

var dateArray = document.getElementsByClassName('order-date-invoice-item');
var orderNum;
var date;
//sort through html of order details to find order date and order number
for(i = 0; i < dateArray.length; i++) {
    if(dateArray[i].innerText.includes("Order#")) {
        orderNum = dateArray[i].innerText;
    }
    if(dateArray[i].innerText.includes("Ordered on")) {
        date = dateArray[i].innerText;
    }
}
orderNum = orderNum.substring(orderNum.indexOf('#') + 2);
//convert orderNum string to int
var orderNumValArr = orderNum.split('-');
var orderNumVal = '';
for(i = 0; i < orderNumValArr.length; i++) {
    orderNumVal += orderNumValArr[i];
}

//get array of all link elements on page
var allLinkArray = document.getElementsByClassName('a-link-normal');
var productArray = [];
//only the order titles and order pictures contain a certain string in their href, so narrow it down to that
for(i = 0; i < allLinkArray.length; i++) {
    if(allLinkArray[i].href.includes('/gp/product')) {
        productArray.push(allLinkArray[i]);
    }
}

var prices = [];
var pricesArray = document.getElementsByClassName("a-size-small a-color-price");
for(i = 0; i < pricesArray.length; i++) {
    prices.push(parseFloat(pricesArray[i].innerText.substring(1)));
}

var titleArray = [];
//titleArray format: [quantity, item name, quantity, item name, etc.]
for(i = 0; i < productArray.length; i++) {
    if(i % 2 == 1) {
        titleArray.push(productArray[i].innerText);
    }
    else {
        if(productArray[i].parentElement.getElementsByClassName('item-view-qty').length > 0) {
            titleArray.push(parseInt(productArray[i].parentElement.getElementsByClassName('item-view-qty')[0].innerText));
        }
        else {
            titleArray.push(1);
        }
    }
}

date = date.substring(11, date.length - 1);

//send all data back to background script
chrome.runtime.sendMessage({from: "new_tab", gT: totalPrice, dT: date, oN: orderNum, sG: totalSavings, nV: orderNumVal, tA: titleArray, pS: prices});