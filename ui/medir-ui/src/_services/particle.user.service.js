import Particle from 'particle-api-js'

const particle = new Particle();

export const userService = {
    login,
    sendOtp,
    logout
};

export const sensorType = {
    OUTLET_DEVICE: "outlet",
    SENSOR_DEVICE: "sensor"
}

export const sensorService = {
    getSensors,
    sensorType
}

function login(username, password) {
    localStorage.setItem('username', username);
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
    const token = localStorage.getItem('token')
    if (token && token.access_token) {
        particle.deleteCurrentAccessToken({auth: token.access_token})
        .then(response=> {
            console.info("Deleted token", token.access_token, response)
        },
        err => {
            console.warn("Had some problems", err)
        }
        )
        .catch(
            err => {
                console.log(err.message);
                console.log(err.stack);
            }
        )
    }

    localStorage.removeItem('token');
    localStorage.removeItem('username');
}

function getSensors() {
    const token = JSON.parse(localStorage.getItem('token'))
    const productId = "9582"
    return particle.listDevices({product: productId, auth: token.access_token})
        .then(response => {
                return response.body.devices.reduce((sensors, sensor) => { 
                        sensors[sensor.id] = sensor
                        return sensors
                    }, {})
            }, 
            err => {
                console.warn("Had some problems listing devices " + err, err)
            })
        .then(sensors => {
            const sensorVals = Object.values(sensors)
            return Promise.all(sensorVals.map(sensor => {
                return particle.getDevice({deviceId: sensor.id, product: sensor.product_id, auth: token.access_token})
            }))
            .then(responses => {
                return responses.map(response => {
                    const sensor = sensors[response.body.id]
                    if (response.body.variables && response.body.variables.datums) {
                        sensor.type = sensorType.SENSOR_DEVICE
                        // sensor.temp = 0
                        // sensor.humi = 0
                    } else {
                        sensor.type = sensorType.OUTLET_DEVICE
                        sensor.plug_state = ["off", "on", "off", "on"]
                    }
                    const lastHeard = new Date(response.body.last_heard)
                    sensor.ts = lastHeard.toLocaleDateString() + " " + lastHeard.toLocaleTimeString()
                    sensor.detail = response.body
                    return sensor
                })
            })
        })
        .then(sensorsWithDetails => {
            console.log("bling", sensorsWithDetails)
            return sensorsWithDetails
        })
}