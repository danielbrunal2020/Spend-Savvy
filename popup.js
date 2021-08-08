var startYear;
chrome.storage.local.get('sY', function (result) {
    startYear = result.sY;   
});
var currTotalUpdated = false;
var totalReady = false;
var tots;
var totMonths;
var yearsArray;
var grandTotal = 0.0;
var monthTotal = 0.0;
var yearTotal = 0.0;
var totalDiscount = 0.0;
var con;
var con2;
var purchDiv = document.getElementById("allPurchases");
var mArray;
var yArray;
var order;
var refund = 0.0;
var itemArray = [];
var refundDone = false;
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var month = getMonth();
var year = getYear();
//saves the array of all years to a global variable
retrieveData();
//runs once the array of years has been updated
dataUpdated();

//saves the array of all years to a global variable
function retrieveData() {
    chrome.storage.local.get('allYears', function (result) {
        yearsArray = result.allYears;   
    });
}

//calculates grand total, this year's total, and this month's total. also saves all variables to actual popup
function dataUpdated(){
    if(typeof yearsArray !== "undefined"){
        //call all functions now that prevArray is assigned
        loopAllPurchases();
        displayData();
        currYAndMUpdated();
        cTUpdated();
        totalsReady();
    }
    else{
        setTimeout(dataUpdated, 250);
    }
}

function getMonth() {
    var today = new Date();
    var month = today.getMonth();
    //Test Only vvvvvv
    // var month = window.prompt("Enter month");

    //since month is a number value, grab string equivalent of month using array created at start of popup.js
    var stringMonth = months[month]; 
    return stringMonth;    
}

function getYear() {
    var today = new Date();
    var year = today.getFullYear();
    //Test Only vvvvvv
    // var year = window.prompt("Enter year");
    return year;
}

function loopAllPurchases() {
    var i;
    var j;
    //loop through all years of purchases except the last
    for(i = yearsArray.length - 1; i >= 0; i--) {
        //creates element representing the year of certain purchases
        newLine();
        var container = document.createElement("span");
        var dateNode = document.createTextNode(`${startYear + i} Orders`);
        container.appendChild(dateNode);
        container.style.color = 'white';
        container.style.fontFamily = 'bahnschrift';
        container.style.fontSize = '1.7em';
        container.style.fontWeight = 'bold';
        purchDiv.appendChild(container);
        newLine();
        //if on the current year, you have yet to make any purchases
        if(i == yearsArray.length - 1 && yearsArray[i].length == 0) {
            newLine();
            var container = document.createElement("span");
            var noneNode = document.createTextNode('You have not made any purchases this year.');
            container.appendChild(noneNode);
            container.style.color = '#095e09';
            container.style.fontFamily = 'bahnschrift';
            container.style.fontSize = '1.2em';
            purchDiv.appendChild(container);
            newLine();
            newLine();
        }
        //if on a previous year, you did not make any purchases
        else if(yearsArray[i].length == 0) {
            newLine();
            var container = document.createElement("span");
            var noneNode = document.createTextNode('You did not make any purchases this year.');
            container.appendChild(noneNode);
            container.style.color = '#095e09';
            container.style.fontFamily = 'bahnschrift';
            container.style.fontSize = '1.2em';
            purchDiv.appendChild(container);
            newLine();
            newLine();
        }
        //this means that you have at least one purchase this year
        else {
            //loop through all purchases for each year
            for(j = yearsArray[i].length - 1; j >= 0; j--) {
                //update monthly total here
                if(yearsArray[i][j].date.includes(month) && yearsArray[i][j].date.includes(year)) {
                    monthTotal += yearsArray[i][j].price;
                }      
                //update yearly total here 
                if(yearsArray[i][j].date.includes(year)) {
                    yearTotal += yearsArray[i][j].price;
                }      
                //update grand total here 
                grandTotal += yearsArray[i][j].price;
                //create html element with data of each purchase
                updateOrders(i, j);
                updateSavings(i, j); 
            } 
        }  
    }   
    newLine();
}

function updateOrders(i, j) {
    
    
    itemDate(i, j);
    itemPrice(i, j); 
    newLine();
    itemList(i, j);

    var button = document.createElement("button");
    button.innerHTML = "Update Returned Item(s)";
    button.style.marginTop = '5px';
    button.style.marginBottom = '10px';
    button.style.fontFamily = 'bahnschrift';
    button.style.border = '2px solid #095e09';
    button.style.color = 'white';
    button.style.backgroundColor = '#095e09';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    purchDiv.appendChild(button);
    button.addEventListener("mouseover", function() {
        button.style.border = '2px solid #04B304';
    });
    button.addEventListener("mouseout", function() {
        button.style.border = '2px solid #095e09';
    });
    button.addEventListener ("click", function() {
        order = {outIndex: i, inIndex: j};
        document.getElementById('returnItems').innerHTML = '';
        updateRetItems();
        document.getElementById('refundProcess').style.display = 'block';
        document.getElementById('dialogoverlay').style.display = 'block';
        document.getElementById('fullButton').style.display = 'block';
        document.getElementById('partButton').style.display = 'block';
        document.getElementById('chooseRefund').style.display = 'block';
        var fullButton = document.getElementById('fullButton');
        fullButton.addEventListener ("click", function() {
            fullRefund();
        });
        var partButton = document.getElementById('partButton');
        partButton.addEventListener ("click", function partClick() {
            document.getElementById('fullButton').style.display = 'none';
            document.getElementById('partButton').style.display = 'none';
            document.getElementById('chooseRefund').style.display = 'none';

            var orderPrice = yearsArray[order.outIndex][order.inIndex].price;
            var orderDate = yearsArray[order.outIndex][order.inIndex].date;
            document.getElementById('chooseItems').style.display = 'block';
            document.getElementById('returnItems').style.display = 'block';
            var div = document.getElementById('returnItems');
            var widthDiff = 175 - (div.offsetWidth / 2);
            div.style.marginLeft = `${widthDiff}px`;
            document.getElementById('confirmItems').style.display = 'block';
            getItemInfo(orderPrice, orderDate);
            partButton.removeEventListener('click', partClick);
        });
    });
    newLine();
}

function updateRetItems() {
    var div = document.getElementById('returnItems');
    var i;
    for(i = 1; i < yearsArray[order.outIndex][order.inIndex].names.length; i += 2) {
        if(i != 1) {
            var linebreak = document.createElement("br");
            div.appendChild(linebreak);
        }
        var x = document.createElement("INPUT");
        x.setAttribute("type", "checkbox");
        x.style.float = 'left';
        x.style.marginLeft = '60px';
        div.appendChild(x);
        x.addEventListener('click', enableButton);
        var container = document.createElement("span");
        var name = yearsArray[order.outIndex][order.inIndex].names[i];
        if(name.length > 30) {
            name = name.substring(0, 30);
            name += '...';
        }
        var itemNode = document.createTextNode(`${name}`);
        container.appendChild(itemNode);
        container.style.fontSize = '0.5em';
        container.style.color = '#095e09';
        container.style.float = 'left';
        container.style.textAlign = 'left';
        if(yearsArray[order.outIndex][order.inIndex].names[i - 1] > 1) {
            container.style.marginRight = '10px';
        }
        container.className = 'itemOptions';
        div.appendChild(container);
        if(yearsArray[order.outIndex][order.inIndex].names[i - 1] > 1) {
            var topRange = yearsArray[order.outIndex][order.inIndex].names[i - 1];
            var dropdown = document.createElement('SELECT');
            for(var j = 1; j <= topRange; j++) {
                var quantity = document.createElement("option");
                quantity.value = j;
                quantity.text = j.toString();
                dropdown.add(quantity);
            }
            dropdown.style.float = 'left';
            div.appendChild(dropdown);
        }
    }
    var numElements = yearsArray[order.outIndex][order.inIndex].names.length / 2;
    if(numElements <= 6) {
        div.style.marginTop = `${70 - numElements * 10}px`;
    }
}

function enableButton() {
    var div = document.getElementById('returnItems');
    var checked = false;
    var checkBoxes = div.getElementsByTagName('INPUT');
    for(var i = 0; i < checkBoxes.length; i++) {
        if(checkBoxes[i].checked) {
            checked = true;
            break;
        }
    }
    if(checked) {
        document.getElementById('confirmItems').disabled = false;
    }
    else {
        document.getElementById('confirmItems').disabled = true;
    }
}

function itemList(i, j) {
    var listButton = document.createElement("button");
    listButton.innerHTML = "Show item(s) purchased";
    listButton.style.fontFamily = 'bahnschrift';
    listButton.style.border = '2px solid #095e09';
    listButton.style.color = 'white';
    listButton.style.backgroundColor = '#095e09';
    listButton.style.cursor = 'pointer';
    listButton.style.marginTop = '0px';
    listButton.style.marginBottom = '3px';
    listButton.style.borderRadius = '4px';
    purchDiv.appendChild(listButton);
    newLine();
    listButton.addEventListener("mouseover", function() {
        listButton.style.border = '2px solid #04B304';
    });
    listButton.addEventListener("mouseout", function() {
        listButton.style.border = '2px solid #095e09';
    });

    var items = yearsArray[i][j].names;
    var ind;
    var itemCon = document.createElement("span");
    for(ind = 1; ind < items.length; ind += 2) {
        var itemString = items[ind].substring(0, 40).trim();
        if(items[ind].length > 40) {
            itemString += '...';
        }
        if(items[ind - 1] > 1) {
            itemString += ` (${items[ind - 1]})`;
        }
        var itemNode = document.createTextNode(`${itemString}`);
        itemCon.appendChild(itemNode);
        var linebreak = document.createElement("br");
        itemCon.appendChild(linebreak);
    }
    itemCon.style.color = '#095e09';
    itemCon.style.fontFamily = 'bahnschrift';
    itemCon.style.fontSize = '1.2em';
    itemCon.style.fontWeight = 'normal';
    itemCon.style.display = 'none';
    itemCon.style.marginTop = '10px';
    itemCon.style.marginBottom = '10px';
    listButton.addEventListener ("click", function() {
        if(itemCon.style.display == 'none') {
            itemCon.style.display = 'block';
        }
        else {
            itemCon.style.display = 'none';
        }
    });
    purchDiv.appendChild(itemCon);
}

function itemDate(i, j) {
    var sepCon = document.createElement("span");
    var sepNode = document.createTextNode('--------------------------------------------------');
    sepCon.appendChild(sepNode);
    sepCon.style.color = 'white';
    sepCon.style.fontSize = '1.2em';
    sepCon.style.fontWeight = 'bold';
    purchDiv.appendChild(sepCon);

    con = document.createElement('div');
    con.style.width = '165px';
    con.style.height = '50px';
    con.style.textAlign = 'center';
    con.style.marginTop = '10px';
    con.style.display = 'inline-block';
    var dCon = document.createElement("span");
    var dNode = document.createTextNode('Date Ordered');
    dCon.appendChild(dNode);
    dCon.style.color = 'white';
    dCon.style.fontFamily = 'bahnschrift';
    dCon.style.fontSize = '1.2em';
    dCon.style.fontWeight = 'bold';
    dCon.style.marginTop = '5px';
    con.appendChild(dCon);

    var linebreak = document.createElement('br');
    con.appendChild(linebreak);

    var dateCon = document.createElement("span");
    var dateNode = document.createTextNode(`${yearsArray[i][j].date}`);
    dateCon.appendChild(dateNode);
    dateCon.style.color = '#095e09';
    dateCon.style.fontFamily = 'bahnschrift';
    dateCon.style.fontSize = '1.2em';
    dateCon.style.fontWeight = 'normal';
    con.appendChild(dateCon);

    purchDiv.appendChild(con);
}

function itemPrice(i, j) {
    con2 = document.createElement('div');
    con2.style.width = '100px';
    con2.style.height = '50px';
    con2.style.textAlign = 'center';
    con2.style.marginTop = '10px';
    con2.style.marginLeft = '10px';
    con2.style.marginRight = '25px';
    con2.style.display = 'inline-block';

    var pCon = document.createElement("span");
    var pNode = document.createTextNode('Price');
    pCon.appendChild(pNode);
    pCon.style.color = 'white';
    pCon.style.fontFamily = 'bahnschrift';
    pCon.style.fontSize = '1.2em';
    pCon.style.fontWeight = 'bold';
    pCon.style.marginLeft = '0px';
    pCon.style.marginTop = '5px';
    pCon.style.display = 'inline-block';
    con2.appendChild(pCon);    

    var linebreak = document.createElement('br');
    con2.appendChild(linebreak);

    var priceCon = document.createElement("span");
    var priceNode = document.createTextNode(`$${yearsArray[i][j].price.toFixed(2)}`);
    priceCon.appendChild(priceNode);
    priceCon.style.color = '#095e09';
    priceCon.style.fontFamily = 'bahnschrift';
    priceCon.style.fontSize = '1.2em';
    priceCon.style.fontWeight = 'normal';
    priceCon.style.display = 'inline-block';
    con2.appendChild(priceCon);
 
    purchDiv.appendChild(con2);

    
}

//if user closes and opens refund, reset window
function resetRefund() {
    if(document.getElementById('chooseItems').style.display == 'block') {
        document.getElementById('chooseItems').style.display = 'none'
        document.getElementById('returnItems').style.display = 'none';
        document.getElementById('confirmItems').style.display = 'none';
        document.getElementById('returnItems').style.marginTop = '10px';
    }
}

function fullRefund() {
    refund = yearsArray[order.outIndex][order.inIndex].price;
    var orderDate = yearsArray[order.outIndex][order.inIndex].date;
    yearsArray[order.outIndex].splice(order.inIndex, 1);
    chrome.storage.local.set({'allYears': yearsArray});
    //if the refunded order was from this year, update the month total spending array
    if(order.outIndex == yearsArray.length - 1) {
        updateMonths(orderDate);
    }
    //always update year array
    updateYears();
    document.getElementById('fullButton').style.display = 'none';
    document.getElementById('partButton').style.display = 'none';
    document.getElementById('chooseRefund').style.display = 'none';
    document.getElementById('refundSuccess').style.display = 'block';
}

function getItemInfo(orderPrice, orderDate) {
    var button = document.getElementById('confirmItems');
    button.addEventListener("click", function onClick() {
        var div = document.getElementById('returnItems');
        var nameArray = div.getElementsByClassName('itemOptions');
        for(var i = 0; i < nameArray.length; i++) {
            if(nameArray[i].previousElementSibling.checked) {
                var quantity;
                if(nameArray[i].nextElementSibling != null && nameArray[i].nextElementSibling.tagName == 'SELECT') {
                    itemArray.push(nameArray[i].nextElementSibling.value);
                    quantity = nameArray[i].nextElementSibling.value;
                }
                else {
                    itemArray.push(1);
                    quantity = 1;
                }
                itemArray.push(yearsArray[order.outIndex][order.inIndex].names[i * 2 + 1]);
                refund += quantity * yearsArray[order.outIndex][order.inIndex].prices[i];
            }
        }
        updateItems();
        yearsArray[order.outIndex][order.inIndex].price = +(orderPrice - refund).toFixed(2);
        if(yearsArray[order.outIndex][order.inIndex].names.length == 0) {
            yearsArray[order.outIndex].splice(order.inIndex, 1);
        }
        chrome.storage.local.set({'allYears': yearsArray});
        if(order.outIndex == yearsArray.length - 1) {
            updateMonths(orderDate);
        }
        updateYears();
    });
}

function updateItems() {
    var i = 1;
    var itemsTotal = itemArray.length / 2;    
    while(i < yearsArray[order.outIndex][order.inIndex].names.length && itemsTotal > 0) {
        var fullItem = false;
        var j = 1;
        while(j < itemArray.length) {
            var found = false;
            if(yearsArray[order.outIndex][order.inIndex].names[i] == itemArray[j]) {
                if(itemArray[j - 1] == yearsArray[order.outIndex][order.inIndex].names[i - 1]) {
                    yearsArray[order.outIndex][order.inIndex].names.splice(i - 1, 2);
                    yearsArray[order.outIndex][order.inIndex].prices.splice((i - 1) / 2, 1);
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
function updateMonths(orderDate) {
    var tgtMonth = -1;
    var i;
    //find the index of the month for which order is being refunded
    for(i = 0; i < months.length; i++) {
        if(orderDate.includes(months[i])) {
            tgtMonth = i;
            break;
        }
    }
    chrome.storage.local.get('monthTotals', function (result) {
        mArray = result.monthTotals;
    });
    waitForMonths(tgtMonth);
}

//once month array is accessible, subtract refund value from target month
function waitForMonths(tgtMonth) {
    if(typeof mArray != 'undefined') {
        var diff = mArray[tgtMonth] - refund;
        mArray[tgtMonth] = +diff.toFixed(2);
        chrome.storage.local.set({'monthTotals': mArray});
    }
    else {
        setTimeout(waitForMonths, 250);
    }
}

//update year totals array after refund
function updateYears() {
    var tgtYear = order.outIndex;
    chrome.storage.local.get('allYearTotals', function (result) {
        yArray = result.allYearTotals;
    });
    waitForYears(tgtYear);
}

//once year array is accessible, subtract refund value from target year
function waitForYears(tgtYear) {
    if(typeof yArray != 'undefined') {
        var diff = yArray[tgtYear] - refund;
        yArray[tgtYear] = +diff.toFixed(2);
        chrome.storage.local.set({'allYearTotals': yArray});
        //at this point, the refund process is done, so show success message
        document.getElementById('chooseItems').style.display = 'none';
        document.getElementById('returnItems').style.display = 'none';
        document.getElementById('confirmItems').style.display = 'none';
        document.getElementById('refundSuccess').style.display = 'block';
        refundDone = true;
    }
    else {
        setTimeout(waitForYears, 250);
    }
}

function updateSavings(i, j) {
    //if there was a discount on the order, show how much money was saved
    if(typeof yearsArray[i][j].savings !== "undefined") {
        totalDiscount += yearsArray[i][j].savings;
    }
}

function displayData() {
    var monthDiv = document.getElementById("Month-Total");
    var monthNode = document.createTextNode("This Month's Spending: ");
    var monthVal = document.createTextNode(`$${monthTotal.toFixed(2)}`);
    var mContainer = document.createElement("span");
    mContainer.appendChild(monthVal);
    mContainer.style.color = '#E3B23C';
    monthDiv.appendChild(monthNode);
    monthDiv.appendChild(mContainer);
    var yearDiv = document.getElementById("Year-Total");
    var yearNode = document.createTextNode("This Year's Spending: ");
    var yearVal = document.createTextNode(`$${yearTotal.toFixed(2)}`);
    var yContainer = document.createElement("span");
    yContainer.appendChild(yearVal);
    yContainer.style.color = '#E3B23C';
    yearDiv.appendChild(yearNode);
    yearDiv.appendChild(yContainer);
    var grandDiv = document.getElementById("Grand-Total");
    var grandNode = document.createTextNode("Grand Total: ");
    var grandVal = document.createTextNode(`$${grandTotal.toFixed(2)}`);
    var gContainer = document.createElement("span");
    gContainer.appendChild(grandVal);
    gContainer.style.color = '#E3B23C';
    grandDiv.appendChild(grandNode);
    grandDiv.appendChild(document.createElement('br'));
    grandDiv.appendChild(gContainer);
    var saveDiv = document.getElementById("Savings");
    var saveNode = document.createTextNode("Total Saved: ");
    var saveVal = document.createTextNode(`$${totalDiscount.toFixed(2)}`);
    var sContainer = document.createElement("span");
    sContainer.appendChild(saveVal);
    sContainer.style.color = '#E3B23C';
    saveDiv.appendChild(saveNode);
    saveDiv.appendChild(document.createElement('br'));
    saveDiv.appendChild(sContainer);
}

function currYAndMUpdated() {
    //adds the current year and current month total to respective arrays
    chrome.storage.local.get(['allYearTotals', 'monthTotals'], function (result) {
        //uploads current year total to year totals array
        var prevYearTotals = result.allYearTotals;
        prevYearTotals[prevYearTotals.length - 1] = yearTotal;
        chrome.storage.local.set({'allYearTotals': prevYearTotals});
        //uploads current month total to month totals array
        var prevMonthTotals = result.monthTotals;
        prevMonthTotals[prevMonthTotals.length - 1] = monthTotal;
        chrome.storage.local.set({'monthTotals': prevMonthTotals});
        //this means that the current year and month totals have been added, so at this pont all values are updated.
        //so, if currTotalUpdated is true, we are ready to send all values to html
        currTotalUpdated = true;
    });
}

//waits till all data is updated to print year totals
function cTUpdated() {
    if(currTotalUpdated == true) {
        chrome.storage.local.get(['allYearTotals', 'monthTotals'], function (result) {
            tots = result.allYearTotals;  
            totMonths = result.monthTotals;
            totalReady = true;
        });
    }
    else {
        setTimeout(cTUpdated, 250);
    }
}     

//prints the total money spent on purchases each year
function totalsReady() {
    if(totalReady == true) { 
        makeAllTimeGraph();
        makeAllMonthGraph();
    }
    else {
        setTimeout(totalsReady, 250);
    }
    
}

function makeAllMonthGraph() {
    var vals = [];
    var label = [];
    var i;
    var totalSpending = 0.0;
    for(i = 0; i < totMonths.length; i++) {
        var stringMonth = months[i];
        vals.push(+totMonths[i].toFixed(2));
        label.push(stringMonth);
    }
    Chart.pluginService.register({
        beforeDraw: function(chart, easing) {
          if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
            var helpers = Chart.helpers;
            var ctx = chart.chart.ctx;
            var chartArea = chart.chartArea;
            var values = chart.data.datasets[0].data; // Added
            // var columnCount = chart.data.datasets[0].data.length;
            var rowCount = 10; // Replace by the number of rows you need
            var width = chartArea.right - chartArea.left;
            var height = chartArea.bottom - chartArea.top

            // var columnWidth = width/columnCount;
            var rowHeight = height / rowCount;
            ctx.save();
            ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
            var startPoint = chartArea.top
            while (startPoint < chartArea.bottom) {
              ctx.fillRect(chartArea.left, startPoint, width, rowHeight);
              startPoint += rowHeight * 2;
            }
            ctx.restore();
          }
        }
    });

    var config =
    {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                data: vals,
                fill: false,
                borderColor: '#07825d',
                pointBorderColor: '#000000',
                pointBackgroundColor: '#ffffff'
            }],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function(value, index, values) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }],
                xAxes: [{ 
                    offset:true,
                    ticks: {
                        fontColor: 'black'
                    },
                }]
            },
            title: {
                display: true,
                text: 'Monthly Spending', 
                fontSize: 25,
                fontFamily: 'bahnschrift',
                fontColor: '#07825d'
            },
            legend: {
                display: false
            }, 
            chartArea: {
                backgroundColor: '#87c08a93'
            },
            layout: {
                padding: {
                    left: 0,
                    right: 25,
                    top: 0,
                    bottom: 0
                }
            }
        }
    };
    var ctx = document.getElementById("monthChart").getContext("2d");
    new Chart(ctx, config);
}

function makeAllTimeGraph() {
    var vals = [];
    var label = [];
    var i;
    var totalSpending = 0.0;
    for(i = 0; i < tots.length; i++) {
        var stringYear = (startYear + i).toString();
        vals.push(+tots[i].toFixed(2));
        label.push(stringYear);
    }
    var config =
    {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                data: vals,
                fill: false,
                borderColor: '#07825d',
                pointBorderColor: '#000000',
                pointBackgroundColor: '#ffffff'
            }],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function(value, index, values) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }],
                xAxes: [{ 
                    offset:true,
                    ticks: {
                        fontColor: 'black'
                    },
                }]
            },
            title: {
                display: true,
                text: 'Yearly Spending', 
                fontSize: 25,
                fontFamily: 'bahnschrift',
                fontColor: '#07825d'
            },
            legend: {
                display: false
            }, 
            chartArea: {
                backgroundColor: '#87c08a93'
            },
            layout: {
                padding: {
                    left: 0,
                    right: 25,
                    top: 0,
                    bottom: 0
                }
            }
        }
    };
    var ctx = document.getElementById("yearChart").getContext("2d");
    new Chart(ctx, config);
}

//newLine function for html elements
function newLine() {
    var linebreak = document.createElement("br");
    purchDiv.appendChild(linebreak);
}

//show/hide order history if button is clicked
document.getElementById("historyButton").addEventListener("click", function(){
    var e = document.getElementById('allPurchases');
    e.style.display = (e.style.display == 'block') ? 'none' : 'block';
});

//show/hide allYear graph if button is clicked
document.getElementById("yGraphButton").addEventListener("click", function(){
    var e = document.getElementById('allTimeChart');
    e.style.display = (e.style.display == 'block') ? 'none' : 'block';
});

//show/hide month graph if button is clicked
document.getElementById("mGraphButton").addEventListener("click", function(){
    var e = document.getElementById('allMonthChart');
    e.style.display = (e.style.display == 'block') ? 'none' : 'block';
});

//close successful refund message if x clicked
document.getElementById("exit").addEventListener("click", function(){
    if(!refundDone) {
        document.getElementById('refundProcess').style.display = 'none';
        document.getElementById('dialogoverlay').style.display = 'none';
        resetRefund();  
    }
    else {
        window.close();
    }
});