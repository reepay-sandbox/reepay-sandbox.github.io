// Implementation using ReepayApplePay SDK as per documentation
// https://sandbox.reepay.com/apple_embedded/docs-page/docs-page.html

var shippingMethods = {
  freeShipping: {
    label: "Free Standard Shipping",
    amount: "0.00",
    detail: "Arrives in 7-10 days",
    identifier: "standardShipping",
  },
  expressShipping: {
    label: "Express Shipping",
    amount: "1.00",
    detail: "Arrives in 2-3 days",
    identifier: "expressShipping",
  },
  denmarkShipping: {
    label: "Denmark Shipping",
    amount: "10.00",
    detail: "Arrives in 30 days",
    identifier: "denmarkShipping",
  },
  pickUpShipping: {
    label: "Pick Up Shipping",
    amount: "0.00",
    detail: "Pick up at store",
    identifier: "pickUpShipping",
  },
};

var lineItems = {
  vat: {
    label: "VAT",
    amount: "1.00",
  },
  shipping: {
    label: "Shipping",
    amount: "0.00",
  },
};

var transactionAmount = "1";

const eventCode = ReepayApplePay.EVENT_CODE;
const contactField = ReepayApplePay.CONTACT_FIELD;
const eventType = ReepayApplePay.EVENT_TYPE;

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

  if (reepayEvent.type === ReepayApplePay.EVENT_TYPE.Interact) {
    handleInteractionEvents(reepayEvent.data);
    return;
  }

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
    case eventCode.token_retrieved:
      console.log("Payment token retrieved:", reepayEvent.data);
      currentApplePayButtonRef.completePayment(true);
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

function handleInteractEventTypes(reepayEvent) {
  if (
    reepayEvent.data.responseBuilder.builderType === "ShippingMethodSelected"
  ) {
    switch (reepayEvent.message) {
      case eventCode.interaction_request:
        reepayEvent.data.responseBuilder.addNewShippingMethod({
          label: "Test",
          amount: "0.10",
          detail: "Arrives in 5-7 minutes",
          identifier: "freshShipping",
        });
        reepayEvent.data.responseBuilder.sendResponse();
        break;
      case eventCode.interaction_completed:
        console.log("Interaction completed");
        break;
      case eventCode.interaction_failed:
        console.log("Interaction failed");
        break;
      default:
        console.log("Other interaction event:", reepayEvent);
        break;
    }
  }
}

function initializeApplePay(pubkey) {
  try {
    applePayStatus.innerHTML = "Initializing Apple Pay...";
    applePayStatus.style.background = "gray";

    const builder = new ReepayApplePay.ApplePayBuilder(
      pubkey,
      "Frisbii Denmark A/S"
    );
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
    .setTransactionAmount(transactionAmount)
    .setCurrencyCode("EUR")
    .addLineItem(lineItems.vat)
    .addLineItem(lineItems.shipping)
    .setButtonHeight(buttonStyles.height)
    .setButtonWidth(buttonStyles.width)
    .setButtonStyle(buttonStyles.style)
    .setButtonType(buttonStyles.type)
    .setButtonLanguage(buttonStyles.language);

  // setupExtraData(builder);

  return builder;
}

function setupExtraData(builder) {
  var contactField = ReepayApplePay.CONTACT_FIELD;
  var shippingType = ReepayApplePay.SHIPPING_TYPE;
  builder
    .addLineItem(lineItems.vat)
    .addLineItem(lineItems.shipping)
    .addShippingMethod(shippingMethods.freeShipping)
    .addShippingMethod(shippingMethods.expressShipping)
    .setShippingType(shippingType.shipping)
    .addRequiredBillingContactField(contactField.postal_address)
    .addRequiredBillingContactField(contactField.name)
    .addRequiredBillingContactField(contactField.phonetic_name)
    .addRequiredShippingContactField(contactField.postal_address)
    .addRequiredShippingContactField(contactField.name)
    .addRequiredShippingContactField(contactField.phone)
    .addRequiredShippingContactField(contactField.email)
    .listenForPaymentMethodChanges(true)
    .listenForShippingMethodChanges(true)
    .listenForShippingContactChanges(true);
}

function handleInteractionEvents(data) {
  var resBuilder = data?.responseBuilder;
  var interactionData = data?.interactionData;

  if (resBuilder?.builderType === "ShippingMethodSelected") {
    var currentAmount = currentApplePayButtonRef.getCurrentTotal().amount;
    if (+interactionData.amount === 0) {
      currentAmount = transactionAmount;
    } else {
      currentAmount = +currentAmount + +interactionData.amount;
    }
    resBuilder.setNewTotalAmount(currentAmount);
  } else if (resBuilder?.builderType === "ShippingContactSelected") {
    if (interactionData.country === "Denmark") {
      resBuilder.addNewShippingMethod(shippingMethods.denmarkShipping);
      resBuilder.addNewShippingMethod(shippingMethods.pickUpShipping);
    }
  }
  resBuilder?.sendResponse();
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
