var linkArray = document.getElementsByClassName('a-link-normal');
var urlToOpen;
var i;
for(i = 0; i < linkArray.length; i++) {
    if(linkArray[i].innerText.includes("View order details")) {
        urlToOpen = linkArray[i].href;
        break;
    }
}
//sends url of order details to background script
chrome.runtime.sendMessage({from: "order_details", url: urlToOpen});
