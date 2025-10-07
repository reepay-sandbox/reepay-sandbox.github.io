// Implementation using ReepayApplePay SDK as per documentation
// https://sandbox.reepay.com/apple_embedded/docs-page/docs-page.html

const eventCode = ReepayApplePay.EVENT_CODE;
const applePayButton = document.getElementById("apple-pay-button");

// Set initial state
applePayButton.innerHTML = "Checking Apple Pay availability...";
applePayButton.style.background = "gray";

// Subscribe to event observer to track Apple Pay availability
ReepayApplePay.eventObserver.subscribe(function(reepayEvent) {
    console.log("ReepayApplePay event received:", reepayEvent);
    
    switch(reepayEvent.message) {
        case eventCode.Available:
            applePayButton.innerHTML = "Apple Pay - Available (Reepay)";
            applePayButton.style.background = "green";
            console.log("Apple Pay is available (ReepayApplePay)");
            break;
        case eventCode.not_available:
        case eventCode.os_upgrade_required:
        case eventCode.browser_not_supported:
        case eventCode.device_not_supported:
            applePayButton.innerHTML = "Apple Pay - Unavailable (Reepay)";
            applePayButton.style.background = "red";
            console.log("Apple Pay is not available (ReepayApplePay):", reepayEvent.message);
            break;
        case eventCode.Token:
            console.log("Payment token retrieved:", reepayEvent.data);
            // Handle payment token here
            break;
        case eventCode.completed:
            console.log("Payment completed successfully");
            break;
        case eventCode.canceled:
            console.log("Payment was canceled");
            break;
        default:
            console.log("Other ReepayApplePay event:", reepayEvent);
    }
});

// Try to create a simple Apple Pay button to trigger availability check
// Note: You'll need actual pubKey and shopName for this to work properly
try {
    // For demonstration purposes - you would need real credentials
    const builder = new ReepayApplePay.ApplePayBuilder('', 'Frisbii'); // TODO: add your pubkey

    builder.setTransactionAmount(1.00);
    
    // This will trigger the availability check
    // For now, we'll just log that we're attempting to check
    console.log("Attempting to check Apple Pay availability with ReepayApplePay SDK");
} catch (error) {
    console.log("Error initializing ReepayApplePay:", error);
    applePayButton.innerHTML = "Apple Pay - Error checking availability";
    applePayButton.style.background = "orange";
}
