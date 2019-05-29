import React from 'react';
import logo from '../logo.svg';

import { userService } from '../_services';

class OtpPrompt extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mfaToken: props.mfa_token,
            verification: '',
            submitted: false,
            loading: false,
            error: ''
        };
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        // clear out errors if any when users type (no need to keep the warning around)
        this.setState({ [name]: value, error: '' });
    }

    handleSubmit = (e) => {
        e.preventDefault()
        
        this.setState({ submitted: true })
        const { mfaToken, verification } = this.state
        // stop here if form is invalid
        if (!verification) {
            return
        }
        this.setState({ loading: true })
        this.setState({mfaToken: mfaToken, verification: verification})
        userService.sendOtp(mfaToken, verification).then(
                success => {
                    console.log("response ", success)
                    const { from } = this.props.location.state || { from: { pathname: "/" } }
                    this.props.history.push(from)
                },
                error => {
                    this.setState({ error, loading: false })
                }
            ).catch(
                err => {
                    console.log(err.message);
                    console.log(err.stack);
                }
            )
    }

    render() {
        const { verification, submitted, loading, error } = this.state;
        return (
              <form className="otp" name="otp" onSubmit={this.handleSubmit}>
                 <label htmlFor="verification">Two Step Verification</label>
                    { 
                        // TODO check out the classnames library 
                    }
                    <div className={'form-group' + (submitted && !verification ? ' alert-error' : '')}>
                        <input type="text" placeholder="Enter Verification Code" name="verification" value={verification} onChange={this.handleChange} />
                        { submitted && !verification &&
                            <div className="help-block">A verification code is required</div>
                        }
                    </div>
                    <div className="form-group">
                        <button className="button" disabled={loading}>Verify</button>
                    </div>
                    { error && error.body && error.body.error_description &&
                            <div className="alert-error">{error.body.error_description}</div>
                    }
              </form>
            )
    }
}
   
  

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        userService.logout();

        this.state = {
            username: '',
            password: '',
            submitted: false,
            loading: false,
            error: ''
        };
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        // clear out errors if any when users type (no need to keep the warning around)
        this.setState({ [name]: value, error: '' })
    }

    handleSubmit = (e) => {
        e.preventDefault()

        this.setState({ submitted: true })
        const { username, password } = this.state

        // stop here if form is invalid
        if (!(username && password)) {
            console.warn("Invalid form data", username, password)
            return
        }

        this.setState({ loading: true })
        userService.login(username, password)
            .then(
                user => {
                    const { from } = this.props.location.state || { from: { pathname: "/" } }
                    this.props.history.push(from)
                },
                error => {
                    this.setState({ error, loading: false })
                }
            ).catch(
                err => {
                    console.log("err.message", err.message);
                    console.log("err.stack", err.stack);
                }
            )
    }

    render() {
        const { username, password, submitted, loading, error } = this.state
        if (error && error.body && error.body.error === "mfa_required") {
            return (
                <div className="login-container">
                    <img src={logo} className="logo" alt="logo" />
                    <div className="login-header">Ittysensor</div>
                    <OtpPrompt {...this.props} mfa_token={error.body.mfa_token}/>
                </div>
            )
        } else {
            return (
                <div className="login-container">
                    <img src={logo} className="logo" alt="logo" />
                    <div className="login-header">Ittysensor</div>
                    <form className="login" name="login" onClick={this.handleSubmit}>
                        <label htmlFor="username">Username</label>
                        <div className={'form-group' + (submitted && !username ? ' alert-error' : '')}>
                            <input type="text" autoComplete="username" 
                                placeholder="Enter Username" name="username" value={username} onChange={this.handleChange} />
                            {submitted && !username &&
                                <div className="help-block">Username is required</div>
                            }
                        </div>
                        <label htmlFor="password">Password</label>
                        { 
                            // TODO check out the classnames library 
                        }
                        <div className={'form-group' + (submitted && !password ? ' alert-error' : '')}>
                            <input type="password" autoComplete="current-password" 
                                placeholder="Enter Password" name="password" value={password} onChange={this.handleChange} />
                            {submitted && !password &&
                                <div className="help-block">Password is required</div>
                            }
                        </div>
                        <div className="form-group">
                            <button className="button" disabled={loading}>Login</button>
                        </div>
                        { error && error.body && error.body.error_description &&
                            <div className="alert-error">{error.body.error_description}</div>
                        }
                    </form>
                </div>
            )
        }
    }
}

export { LoginPage };