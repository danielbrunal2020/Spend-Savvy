var linkArray = document.getElementsByClassName('a-link-emphasis');
var urlToOpen;
var i;
for(i = 0; i < linkArray.length; i++) {
    if(linkArray[i].innerText.includes("Review or edit your recent orders")) {
        urlToOpen = linkArray[i].href;
        break;
    }
}
//sends url of recent orders to background script
chrome.runtime.sendMessage({from: "content_script", url: urlToOpen});

//global variables to be used throughout content script
var grandTotal;
var orderDate;
var orderNum;
var ordNumVal;
var totalSavings;
var orderNames;
var priceArr;
var newYearChecked = false;
var newMonthChecked = false;
var actualYear = getYear();
var actualMonth = getMonth();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//receives message from background script w/ order price, date, and unique number
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    grandTotal = request.g_total;
    orderDate = request.ordDate;
    orderNum = request.ordNum;
    ordNumVal = request.numVal;
    totalSavings = request.save;
    orderNames = request.ordNames;
    priceArr = request.price;
    checkNewDate();
    nYChecked();
});

function getMonth() {
    var today = new Date();
    var month = today.getMonth();
    //Test Only vvvvvv
    // var month = window.prompt("Enter month");
    return month;
}

function getYear() {
    var today = new Date();
    var year = today.getFullYear();
    //Test Only vvvvvv
    // var year = window.prompt("Year");
    return year;
}

//function to check if a new year has started
function checkNewDate() {
    chrome.storage.local.get(['cY', 'cM', 'allYears', 'allYearTotals', 'monthTotals'], function (result) {
        //this means that there is a new year
        if(actualYear != result.cY) { 
            nYUpdate(result);
            nYMonthUpdate();
            newYearChecked = true;
        }
        //this means that it's a new month
        else if(actualMonth != result.cM) {
            nMUpdate(result);
            newMonthChecked = true;        
        }
        //not a new year or new month, so don't do anything special
        else {
            newYearChecked = true;
            newMonthChecked = true;
        }
    });
}

function nYUpdate(result) {
    //aY represents array of all years
    var aY = result.allYears;    
    var lastYearTotal = 0.0;
    //yearTotals represents array of each year's total purchase prices
    var yearTotals = result.allYearTotals;
    var i;
    //calculates last year's total price to add to yearTotals
    for(i = 0; i < aY[aY.length - 1].length; i++) {
        lastYearTotal += aY[aY.length - 1][i].price;
    }
    yearTotals[yearTotals.length - 1] = lastYearTotal;
    //this means that at least one year has passed with no purchases being made
    if(actualYear - result.cY > 1) {
        //for each year of no purchases, add empty array to array of years
        for(i = 1; i <= actualYear - result.cY - 1; i++) {
            var gapYear = [];
            aY.push(gapYear);
            //add value of $0.00 for all gap years to year totals
            yearTotals.push(0.00);
        }
    } 
    //represents the current year total (obviously starts at 0)
    yearTotals.push(0.0);
    chrome.storage.local.set({'allYearTotals': yearTotals});
    //update current year in chrome storage
    chrome.storage.local.set({'cY': actualYear});   
    //add an empty array representing the new year        
    var newYear = [];
    aY.push(newYear);
    //update storage after new year added
    chrome.storage.local.set({'allYears': aY});
}

function nYMonthUpdate() {
    //now reset monthTotals array since a new year has started
    var monthTots = [];
    if(actualMonth >= 1) {
        //for each month of no purchases, add value of 0.0 to array
        for(i = 0; i < actualMonth; i++) {
            monthTots.push(0.0);
        }
    } 
    //represents current month
    monthTots.push(0.0);
    chrome.storage.local.set({'monthTotals': monthTots});
    //update current month in chrome storage
    chrome.storage.local.set({'cM': actualMonth});  
}

function nMUpdate(result) {
    //basically the same check as new year but for new month
    var aY = result.allYears;
    var lastYear = aY[aY.length - 1];
    var stringLastMonth = months[result.cM];
    var lastMonthTot = 0.0;
    var i;
    for(i = 0; i < lastYear.length; i++) {
        if(lastYear[i].date.includes(stringLastMonth)) {
            lastMonthTot += lastYear[i].price;
        }
    }
    var monthTots = result.monthTotals;
    monthTots[monthTots.length - 1] = lastMonthTot;
    if(actualMonth - result.cM > 1) {
        //for each month of no purchases, add value of 0.0 to array
        for(i = 1; i <= actualMonth - result.cM - 1; i++) {
            monthTots.push(0.0);
        }
    } 
    //represents current month
    monthTots.push(0.0);
    chrome.storage.local.set({'monthTotals': monthTots});
    //update current month in chrome storage
    chrome.storage.local.set({'cM': actualMonth});  
}

//wait for the new year check
function nYChecked() {
    if(newYearChecked || newMonthChecked) {
        addPurchase();
    }
    else {
        setTimeout(nYChecked, 250);
    }
}

//adds the current order to the 2d array of all orders
function addPurchase() {
    //creation of order object
    if(grandTotal > 0.0) {
        var indivPurch = {price: grandTotal, date: orderDate, orderNumber: orderNum, savings: totalSavings, orderNumberValue: ordNumVal, names: orderNames, prices: priceArr};
        //now grab the previous version of array w/ chrome.storage, push() indivPurch to array, and upload new array
        chrome.storage.local.get('allYears', function (result) {
            var yearsArray = result.allYears;
            var preExist = false;
            var i;
            //checks to see if order has already been added
            for(i = 0; i < yearsArray[yearsArray.length - 1].length; i++) {
                if(yearsArray[yearsArray.length - 1][i].orderNumber == indivPurch.orderNumber) {
                    preExist = true;
                }
            }
            //adds order to end of year array and resets storage with updated array
            if(!preExist) {           
                yearsArray[yearsArray.length - 1].push(indivPurch);
                chrome.storage.local.set({'allYears': yearsArray});
            }
        });
    }
}