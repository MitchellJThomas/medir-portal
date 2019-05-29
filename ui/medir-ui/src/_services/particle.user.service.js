import Particle from 'particle-api-js'

const particle = new Particle();

export const userService = {
    login,
    sendOtp,
    logout
};


function login(username, password) {
    return particle.login({username: username, password: password, tokenDuration: 60*60*2})
        .then(response => {
            // login successful if there's a user in the response
            console.log("login ", response)
            if (response) {
                const token = response.body;
                console.log("with token ", token)
                localStorage.setItem('token', JSON.stringify(token));
            }
            return response;
        })
        //  One time password's (OTP) take the error path here
}

function sendOtp(mfaToken, otp) {
    return particle.sendOtp({'mfaToken': mfaToken, 'otp': otp})
        .then(response => {
            if (response) {
                localStorage.setItem('token', JSON.stringify(response.body));
            }
            return response; 
        })
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
}