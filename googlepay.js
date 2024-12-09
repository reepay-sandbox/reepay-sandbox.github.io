Reepay.isGooglePayAvailable()
  .then((isAvailable) => {
    console.log("isGooglePayAvailable:", isAvailable);

    const googlePayButton = document.getElementById("google-pay-button");
    if (isAvailable) {
      googlePayButton.innerHTML = "Google Pay - Available";
      googlePayButton.style.backgroundColor = "green";
    } else {
      googlePayButton.innerHTML = "Google Pay - Unavailable";
      googlePayButton.style.backgroundColor = "red";
    }
  })
  .catch((error) => {
    const googlePayButton = document.getElementById("google-pay-button");
    googlePayButton.innerHTML = "Google Pay - Error";
    googlePayButton.style.backgroundColor = "red";

    console.error("Error checking Google Pay availability:", error);
  });
