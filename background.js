var firstInstall = true;
//declares variables once extension is first downloaded or refreshed
chrome.runtime.onInstalled.addListener(function() {
    if(firstInstall) {
        var today = new Date();
        var startYear = today.getFullYear();
        var startMonth = today.getMonth();
        //monthTotal represents each month's total price value
        var monthTotal = [0.0];
        if(startMonth >= 1) {
            //for each month of no purchases, add value of 0.0 to array
            for(i = 0; i < startMonth; i++) {
                monthTotal.push(0.0);
            }
        } 
        chrome.storage.local.set({'allYears': [[]]});
        chrome.storage.local.set({'allYearTotals': [0.0]});
        chrome.storage.local.set({'monthTotals': monthTotal});
        //both start year and current year are set to the year user downloads extension
        chrome.storage.local.set({'sY': startYear});
        chrome.storage.local.set({'cY': startYear});
        chrome.storage.local.set({'cM': startMonth});
        firstInstall = false;
    }
});

var grandTot;
var date;
var orderNum;
var orderNumVal;
var savings;
var orderNames;
var prices;
var originalTab;

var yearsArray;
var monthTotals;
var yearTotals;
var refund;
var itemArray;
var order;
var orderDate;
var totalOrderPrice;
var orderNumber;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//listens for messages from both content and new tab scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {   
    //runs if message received from content script with url of order details  
    if(request.from == "content_script") {
        //originalTab is the tab representing the purchase thank you screen
        originalTab = sender.tab.id;
        //open a new tab with order details
        chrome.tabs.create({ url: request.url }, function(tab) {
            //inject the order detail tab with new_tab script which gathers data
            chrome.tabs.executeScript(tab.id, {'file': 'find_order_detail.js'}, function() {
                //close tab once all data has been gathered
                chrome.tabs.remove(tab.id);
            });           
        }); 
        //keep focus on originalTab rather than shifting to order details
        chrome.tabs.update(originalTab, {selected: true}); 
    } 
    if(request.from == "order_details") {  
        //open a new tab with order details
        chrome.tabs.create({ url: request.url }, function(tab) {
            //inject the order detail tab with new_tab script which gathers data
            chrome.tabs.executeScript(tab.id, {'file': 'new_tab.js'}, function() {
                //close tab once all data has been gathered
                chrome.tabs.remove(tab.id);
            });           
        }); 
        //keep focus on originalTab rather than shifting to order details
        chrome.tabs.update(originalTab, {selected: true}); 
    }
    //runs if message received from new_tab script
    if(request.from == "new_tab") {
        //updates and sends purchase value, order number, and order data to originalTab (which is being analyzed by content script)
        grandTot = request.gT;
        date = request.dT;
        orderNum = request.oN;
        orderNumVal = request.nV;
        savings = request.sG;
        orderNames = request.tA;
        prices = request.pS;
        chrome.tabs.sendMessage(originalTab, {g_total: grandTot, ordDate: date, ordNum: orderNum, save: savings, numVal: orderNumVal, ordNames: orderNames, price: prices});
    }   
    if(request.from == "cancel_script") {
        yearsArray = request.yA;
        monthTotals = request.mT;
        yearTotals = request.yT;
        refund = request.rF;
        itemArray = request.iA;
        orderNumber = request.oN;
        findOrder();
        if(order != null) {
            orderDate = yearsArray[order.outIndex][order.inIndex].date;
            totalOrderPrice = yearsArray[order.outIndex][order.inIndex].price;
            if(totalOrderPrice == refund) {
                fullRefund();
            } 
            else {
                partRefund();
            }
        }
    }
});

function findOrder() {
    var i = yearsArray.length - 1; 
    for(var j = yearsArray[i].length - 1; j >= 0; j--) {
        if(yearsArray[i][j].orderNumber == orderNumber) {
            order = {outIndex: i, inIndex: j};
            return;
        }
    }
    order = null;
}

function fullRefund() {
    yearsArray[order.outIndex].splice(order.inIndex, 1);
    chrome.storage.local.set({'allYears': yearsArray});
    //if the refunded order was from this year, update the month total spending array
    if(order.outIndex == yearsArray.length - 1) {
        updateMonths();
    }
    //always update year array
    updateYears();
}

function partRefund() { 
        updateItems();
        if(yearsArray[order.outIndex][order.inIndex].names.length == 0) {
            yearsArray[order.outIndex].splice(order.inIndex, 1);
            chrome.storage.local.set({'allYears': yearsArray});
        }
        else {
            var diff = +(totalOrderPrice - refund).toFixed(2);
            if(diff > 0.0) {
                yearsArray[order.outIndex][order.inIndex].price = diff;
                chrome.storage.local.set({'allYears': yearsArray});
            }
            else {
                yearsArray[order.outIndex].splice(order.inIndex, 1);
                chrome.storage.local.set({'allYears': yearsArray});
            }
        }
        if(order.outIndex == yearsArray.length - 1) {
            updateMonths();
        }
        updateYears();
}

function updateItems() {
    var i = 1;
    var itemsTotal = itemArray.length / 2;    
    while(i < yearsArray[order.outIndex][order.inIndex].names.length && itemsTotal > 0) {
        var fullItem = false;
        var j = 1;
        while(j < itemArray.length) {
            var found = false;
            if(yearsArray[order.outIndex][order.inIndex].names[i].includes(itemArray[j])) {
                if(itemArray[j - 1] == yearsArray[order.outIndex][order.inIndex].names[i - 1]) {
                    yearsArray[order.outIndex][order.inIndex].names.splice(i - 1, 2);
                    fullItem = true;
                    break;
                }
                else {
                    yearsArray[order.outIndex][order.inIndex].names[i - 1] -= itemArray[j - 1];
                }
                itemArray.splice(j - 1, 2);
                itemsTotal--;
                found = true;
            }
            if(!found) {
                j += 2;
            }
        }
        if(!fullItem) {
            i += 2;
        }
    }
}

//update month totals array after refund
function updateMonths() {
    var tgtMonth = -1;
    var i;
    //find the index of the month for which order is being refunded
    for(i = 0; i < months.length; i++) {
        if(orderDate.includes(months[i])) {
            tgtMonth = i;
            break;
        }
    }
    var diff = monthTotals[tgtMonth] - refund;
    if(diff > 0.0) {
        monthTotals[tgtMonth] = +diff.toFixed(2);
        chrome.storage.local.set({'monthTotals': monthTotals});
    }
    else {
        monthTotals[tgtMonth] = 0.0;
        chrome.storage.local.set({'monthTotals': monthTotals});
    }
   
}

//update year totals array after refund
function updateYears() {
    var tgtYear = order.outIndex;
    var diff = yearTotals[tgtYear] - refund;
    if(diff > 0.0) {
        yearTotals[tgtYear] = +diff.toFixed(2);
        chrome.storage.local.set({'allYearTotals': yearTotals});
    }
    else {
        yearTotals[tgtYear] = 0.0;
        chrome.storage.local.set({'allYearTotals': yearTotals});
    }
}
