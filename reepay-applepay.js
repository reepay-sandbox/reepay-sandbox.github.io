// Implementation using ReepayApplePay SDK as per documentation
// https://sandbox.reepay.com/apple_embedded/docs-page/docs-page.html

const eventCode = ReepayApplePay.EVENT_CODE;
const applePayStatus = document.getElementById("apple-pay-status");
const pubkeyInput = document.getElementById("pubkey-input");
const testButton = document.getElementById("test-button");

let currentApplePayButtonRef = null;

applePayStatus.innerHTML = "Waiting for Public Key";
applePayStatus.style.background = "gray";

// TODO: test apple pay button
// 1. add "reepay-sandbox.github.io" to your apple pay agreement domains
// 2. add your pubkey to defaultPubkey
const defaultPubkey = "";

document.addEventListener("DOMContentLoaded", function () {
  if (defaultPubkey) {
    initializeApplePay(defaultPubkey);
    pubkeyInput.value = defaultPubkey;
    pubkeyInput.readOnly = true;
    testButton.remove();
  }
});

testButton.addEventListener("click", function () {
  const pubkey = pubkeyInput.value.trim();
  if (!pubkey) {
    alert("Please enter a public key");
    return;
  }
  initializeApplePay(pubkey);
});

// Subscribe to event observer to track Apple Pay availability
ReepayApplePay.eventObserver.subscribe(function (reepayEvent) {
  console.log("ReepayApplePay event received:", reepayEvent);

  switch (reepayEvent.message) {
    case eventCode.Available:
      applePayStatus.innerHTML = `Apple Pay - Available`;
      applePayStatus.style.background = "green";
      break;
    case eventCode.not_available:
    case eventCode.os_upgrade_required:
    case eventCode.browser_not_supported:
    case eventCode.device_not_supported:
      applePayStatus.innerHTML = `Apple Pay Error: ${reepayEvent.message}`;
      applePayStatus.style.background = "red";
      console.error(
        `Apple Pay is not available (ReepayApplePay): ${reepayEvent.message}`
      );
      break;
    case eventCode.Token:
      console.log("Payment token retrieved:", reepayEvent.data);
      // TODO: Handle payment token here
      break;
    case eventCode.completed:
      console.log("Payment completed successfully");
      applePayStatus.innerHTML = `Apple Pay - Completed Payment`;
      applePayStatus.style.background = "green";
      break;
    case eventCode.canceled:
      console.log("Payment was canceled");
      applePayStatus.innerHTML = `Apple Pay - Canceled`;
      applePayStatus.style.background = "red";
      break;
    default:
      console.log("Other ReepayApplePay event:", reepayEvent);
      applePayStatus.innerHTML = `Apple Pay - Other Event: ${reepayEvent.message}`;
      applePayStatus.style.background = "gray";
      break;
  }
});

function initializeApplePay(pubkey) {
  try {
    applePayStatus.innerHTML = "Initializing Apple Pay...";
    applePayStatus.style.background = "gray";

    const builder = new ReepayApplePay.ApplePayBuilder(pubkey, "Frisbii");
    createOneOffPayment(builder);
    // createRecurringPayment(builder);

    currentApplePayButtonRef = builder.createApplePayButton("apple-pay-button");
  } catch (error) {
    console.error("Error initializing ReepayApplePay:", error);
    applePayStatus.innerHTML = `Error: ${error.message}`;
    applePayStatus.style.background = "red";
  }
}

/**
 * ONE-OFF PAYMENT SETUP
 */
function createOneOffPayment(builder) {
  const buttonStyles = {
    style: "black",
    type: "buy",
    language: "en",
    height: "60px",
    width: "200px",
  };
  builder
    .setTransactionAmount(1)
    .setButtonHeight(buttonStyles.height)
    .setButtonWidth(buttonStyles.width)
    .setButtonStyle(buttonStyles.style)
    .setButtonType(buttonStyles.type)
    .setButtonLanguage(buttonStyles.language);
  return builder;
}

/**
 * RECURRING PAYMENT SETUP
 */
function createRecurringPayment(builder) {
  const recurringButtonStyles = {
    style: "black",
    type: "subscribe",
    language: "en",
    height: "60px",
    width: "250px",
  };
  const recurringPaymentRequest = {
    paymentDescription: "Frisbii Test Subscription",
    regularBilling: {
      label: "Frisbii Product - Yearly Subscription",
      amount: 1,
      paymentTiming: "recurring",
      recurringPaymentIntervalUnit: "month",
      recurringPaymentIntervalCount: 12,
    },
    managementURL: "https://frisbii.com/",
  };
  builder
    .setTransactionAmount(1)
    .setButtonHeight(recurringButtonStyles.height)
    .setButtonWidth(recurringButtonStyles.width)
    .setButtonStyle(recurringButtonStyles.style)
    .setButtonType(recurringButtonStyles.type)
    .setButtonLanguage(recurringButtonStyles.language)
    .setRecurringPaymentRequest(recurringPaymentRequest);
  return builder;
}
