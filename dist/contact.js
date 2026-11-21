const inquiry = document.querySelector("#inquiry");
inquiry.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(inquiry);
  const subject = encodeURIComponent(values.get("subject"));
  const body = encodeURIComponent([
    `Name: ${values.get("name")}`,
    `Email: ${values.get("email")}`,
    `Phone: ${values.get("phone")}`,
    "",
    values.get("message"),
  ].join("\r\n"));
  window.location.href = `mailto:info@aegiscyberworks.com?subject=${subject}&body=${body}`;
});

