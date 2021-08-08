var yearsArray;
var monthTotals;
var yearTotals;
var refund = 0.0;
var itemArray = [];
var orderNum;
var submitButton;
var prices = [];
var items = [];

chrome.storage.local.get(['allYears', 'allYearTotals', 'monthTotals'], function (result) {
    yearsArray = result.allYears;   
    monthTotals = result.monthTotals;
    yearTotals = result.allYearTotals;
});

waitForData();

function waitForData() {
    if(typeof yearTotals != 'undefined') {
        getData();
        waitForMoreData();
    }
    else {
        setTimeout(waitForData, 250);
    }
}

function getData() {
    var i;
    var buttons = document.getElementsByClassName('a-button-input');
    
    for(i = 0; i < buttons.length; i++) {
        if(buttons[i].nextElementSibling.innerText.includes('Cancel selected items in this order') || buttons[i].nextElementSibling.innerText.includes('Request cancellation')) {
            submitButton = buttons[i];
        }
    }

    if(typeof submitButton != 'undefined') {
        var options = document.getElementsByTagName('a');
        for(i = 0; i < options.length; i++) {
            if(options[i].href.includes('ox_ya_os_product')) {
                var quant = parseInt(options[i].parentElement.parentElement.innerText.substring(0, 1));
                items.push(quant);
                prices.push(parseFloat(options[i].parentElement.parentElement.nextElementSibling.innerText.substring(1)));
                if(options[i].innerText.length > 3 && options[i].innerText.substring(options[i].innerText.length - 3, options[i].innerText.length) == '...') {
                    items.push(options[i].innerText.substring(0, options[i].innerText.length - 3));
                }
                else {
                    items.push(options[i].innerText);
                }
            }
            else if(options[i].innerText.includes('Order Summary')) {
                orderNum = options[i].innerText.substring(options[i].innerText.indexOf('#') + 1);
            }
        }

        submitButton.addEventListener("mousedown", function onClick() {
            var inputArr = [];
            var inputs = document.getElementsByTagName('input');
            for(var j = 0; j < inputs.length; j++) {
                if(inputs[j].type == 'checkbox') {
                    inputArr.push(inputs[j]);
                }
            }

            for(j = 0; j < inputArr.length; j++) {
                if(inputArr[j].checked) {
                    itemArray.push(items[j * 2]);
                    itemArray.push(items[j * 2 + 1]);
                    refund += items[j * 2] * prices[j];
                }
            }

            if(refund > 0.0 && itemArray.length > 0) {
                submitButton.removeEventListener("mousedown", onClick);
            }
        });
    }
}  


function waitForMoreData() {
    if(refund > 0.0 && itemArray.length > 0) {
        chrome.runtime.sendMessage({from: "cancel_script", yA: yearsArray, mT: monthTotals, yT: yearTotals, rF: refund, oN: orderNum, iA: itemArray});
    }
    else {
        setTimeout(waitForMoreData, 250);
    }
}