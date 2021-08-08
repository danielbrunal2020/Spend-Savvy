var yearsArray;
var monthTotals;
var yearTotals;
var refund = 0.0;
var itemArray = [];
var prices = [];
var items = [];
var submitButton;

chrome.storage.local.get(['allYears', 'allYearTotals', 'monthTotals'], function (result) {
    yearsArray = result.allYears;   
    monthTotals = result.monthTotals;
    yearTotals = result.allYearTotals;
});

waitForData();

function waitForData() {
    if(typeof yearTotals != 'undefined') {
        //getRefund();
        getItems();
    }
    else {
        setTimeout(waitForData, 250);
    }
}

function getRefund() {
    var bold = document.getElementsByClassName('a-size-base a-text-bold');
    for(var i = 0; i < bold.length; i++) {
        if(bold[i].innerText.includes('$')) {
            refund = parseFloat(bold[i].innerText.substring(1));
        }
    }
}

function getItems() {
    setTimeout(function () {
        var buttons = document.getElementsByClassName('a-button-input');
        console.log(buttons);
        for(var i = 0; i < buttons.length; i++) {
            if(buttons[i].nextElementSibling.innerText.includes('Continue')) {
                submitButton = buttons[i];
            }
        }

        var names = document.getElementsByClassName('a-size-base a-text-bold');
        for(var i = 0; i < names.length; i++) {
            console.log(names[i].innerText);
        }

        console.log(submitButton);
        submitButton.addEventListener("mousedown", function onClick() {
            var inputArr = [];
            var inputs = document.getElementsByTagName('input');
            for(var j = 0; j < inputs.length; j++) {
                if(inputs[j].type == 'checkbox') {
                    inputArr.push(inputs[j]);
                }
            }
            console.log(inputArr);
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
        chrome.runtime.sendMessage({from: "return_script", yA: yearsArray, mT: monthTotals, yT: yearTotals, rF: refund, iA: itemArray});
    }, 3000);
}