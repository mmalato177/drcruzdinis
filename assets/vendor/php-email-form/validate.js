/**
* PHP Email Form Validation - v3.9 (Adaptado para Formspree)
* URL original: https://bootstrapmade.com/php-email-form/
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (e) {
    e.addEventListener('submit', function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(thisForm, 'O atributo "action" do formulário não está definido!');
        return;
      }

      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  php_email_form_submit(thisForm, action, formData);
                });
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'A API JavaScript do reCaptcha não está carregada!');
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

 function php_email_form_submit(thisForm, action, formData) {
  // Converter FormData em JSON
  const object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });

  fetch(action, {
    method: 'POST',
    body: JSON.stringify(object),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(async (response) => {
      thisForm.querySelector('.loading').classList.remove('d-block');

      if (response.ok) {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
      } else {
        const errorData = await response.json().catch(() => null);
        let errorMsg = 'Erro ao enviar o formulário.';

        if (errorData && errorData.errors) {
          errorMsg = errorData.errors.map(e => e.message).join(', ');
        } else if (response.status === 422) {
          errorMsg = 'Erro 422: verifique se o email é válido.';
        }

        throw new Error(errorMsg);
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
}


  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
