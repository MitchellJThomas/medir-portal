import Particle from 'particle-api-js'

const particle = new Particle();

export const userService = {
    login,
    logout
};

function login(username, password) {
 
    return particle.login({username: username, password: password, tokenDuration: 60*60*2})
        .then(response => {
            // login successful if there's a user in the response
            if (response) {
                const token = response.body;
                localStorage.setItem('token', token);
            }
            return response;
        });
}


function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
}