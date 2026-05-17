

  emailjs.init({
    publicKey: "dbEGOUwWdSM9TJDM9"
  });

  document.getElementById("modalForm").addEventListener("submit", function(event) {
    event.preventDefault();

    emailjs.sendForm("service_g1rhr2s", "template_31nz225", this)
      .then(function() {
        console.log("Заявка отправлена!");
      }, function(error) {
        console.log("Ошибка отправки. Попробуйте позже.");
        console.error("EmailJS error:", error);
      });
  });
