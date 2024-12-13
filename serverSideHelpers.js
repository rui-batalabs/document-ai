import bcrypt from 'bcryptjs';
import xss from 'xss';

const exportedMethods = {
    passwordCheck(password) {
        if (!password) throw 'No password was given';
        if (typeof(password) !== 'string') throw 'password must be a valid string';
        password = password.trim();
        if (password == '') throw 'password cannot be empty';
        if (password.length < 8) throw 'Your password must be input with at least 8 characters';
        if (/\s/.test(password)) throw 'A password cannot contain spaces';
        if (!/[A-Z]/.test(password)) throw 'There are no capital letters in the provided password';
        if (!/[!@#$%^&*()+=_\/\\|\[\]{};:\'",<.>?\-]/.test(password)) throw 'There are no special characters in the provided password';
        return password;
    },

    async hashedPasswordCheck(password, hashed_password) {
        if (!password) throw 'No password was given';
        if (typeof(password) !== 'string') throw 'password must be a valid string';
        password = password.trim();
        if (password == '') throw 'password cannot be empty';
        if (!hashed_password) throw 'No hashed password was given';
        if (typeof(hashed_password) !== 'string') throw 'password must be a valid string';
        hashed_password = hashed_password.trim();
        if (hashed_password == '') throw 'password cannot be empty';
        if (!(await bcrypt.compare(password, hashed_password))) throw 'password is not the same as in the hashed password. An error has occured with the input password.';
        return hashed_password;
    },

    emailCheck(email) {
        if (!email) throw 'No email was given';
        if (typeof(email) !== 'string') throw 'email must be a valid string';
        email = email.trim();
        if (email == '') throw 'email cannot be empty';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) throw 'Please enter a proper email address';
        // Sanitizing email to prevent XSS (HTML/JS injection)
        return xss(email);
    },

    usernameCheck(user) {
        if (!user) throw 'No username was given';
        if (typeof(user) !== 'string') throw 'username must be a valid string';
        user = user.trim();
        if (user == '') throw 'username cannot be empty';
        if (user.length < 5 || user.length > 20) throw 'Your username must be input with 5 to 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(user)) throw 'usernames must have only letters, numbers, and or underscores';
        // Sanitizing username to prevent XSS (HTML/JS injection)
        return xss(user.toLowerCase());
    },

    tokenGenerator() {
        let token = '';
        while (token.length < 16) {
            token += Math.random().toString(36).substring(2);
        }
        return token.substring(0, 16);
    },

    tokenCheck(token) {
        if (!token) throw 'There is no token';
        if (typeof(token) !== 'string') throw 'this token is not a string';
        token = token.trim();
        if (token == '') throw 'This token cannot be empty';
        if (!/^[a-z0-9]{16}$/.test(token)) {
            throw 'invalid token format';
        }
        return xss(token);  // Sanitizing token to ensure no malicious content
    }
}

export default exportedMethods;
