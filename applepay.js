const isApplePayAvailable = Reepay.isApplePayAvailable();
const applePayButton = document.getElementById("apple-pay-button");
if (isApplePayAvailable) {
  applePayButton.innerHTML = "Apple Pay - Available";
  applePayButton.style.background = "green";
} else {
  applePayButton.innerHTML = "Apple Pay - Unavailable";
  applePayButton.style.background = "red";
}
console.log("isApplePayAvailable:", isApplePayAvailable);
