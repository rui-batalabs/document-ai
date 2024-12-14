import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@latest/dist/purify.es.min.js'; 
import helper from './helpers.js'

(function ($){
    let forgotForm = $('#forgotForm');


    forgotForm.submit(function(event){
        event.preventDefault();
        let password =  $('#password').val()
        let confirmPassword =  $('#confirmPassword').val()
        
        console.log('here')
        if(password && confirmPassword){
            try{
                password = DOMPurify.sanitize(helper.passwordCheck(password));  // Sanitize password
                confirmPassword = DOMPurify.sanitize(helper.passwordCheck(confirmPassword)); 
                if (password !== confirmPassword) throw 'These passwords do not match';
                let path = window.location.pathname;
                let token = path.substring(15)
                token = DOMPurify.sanitize(helper.tokenCheck(token));

                let requestConfig = {
                    method:'POST',
                    url:`http://localhost:3000/passwordreset/${token}`,
                    contentType: 'application/json',
                    data: JSON.stringify({
                      password: password,
                      confirmPassword: confirmPassword
                    })

                }
                $.ajax(requestConfig).then(function(responseMessage){
                    if(responseMessage.update ===true){
                        alert("Password Successfully Updated! Redirecting to Login!");
                        window.location.href ='/signin'
                    }
                   else if(responseMessage.update===false){
                        alert(responseMessage.error);
                   }
                   else{
                    throw 'internal server error'
                   }


                })
            }catch(e){
                console.error('Error changing password:', e.message);
                alert(e);
            }
        }
        else{
            alert('Missing inputs')
        }



    })






})(window.jQuery);