

const exportedMethods = {
        passwordCheck(password){
            if(!password) throw 'No password was given';
            if(typeof(password)!=='string') throw 'password must be a valid string';
            password = password.trim();
            if(password =='') throw 'password cannot be empty';
            if(password.length <8) throw 'Your password must be input with at least 8 characters';
            if(/\s/.test(password))throw 'A password cannot contain spaces';
            if(!/[A-Z]/.test(password)) throw 'There are no capital letters in the provided password';
            if(!/[!@#$%^&*()+=_\/\\|\[\]{};:'",<.>?\-]/.test(password))throw 'There are no special characters in the provided password';
            return password;
        },
        emailCheck(email){
            if(!email) throw 'No email was given';
            if(typeof(email)!=='string') throw 'email must be a valid string';
            email = email.trim();
            if(email =='') throw 'email cannot be empty';
            if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) throw 'Please enter a proper email address';
            return email;
        },

        usernameCheck(user){
            if(!user) throw 'No username was given';
            if(typeof(iduser)!=='string') throw 'username must be a valid string';
            user = user.trim();
            if(user =='') throw 'username cannot be empty';
            if(user.length <5 || user.length>20) throw 'Your username must be input with 5 to 20 characters';
            if(!/^[a-zA-Z0-9_]$/.test(user)) throw 'usernames must have only letters, numbers, and or underscores';
            return user.toLowerCase();
        }

}

export default exportedMethods;