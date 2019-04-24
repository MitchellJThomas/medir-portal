import React from 'react';
import logo from '../logo.svg';

import { userService } from '../_services';

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
        this.setState({ [name]: value, error: '' });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({ submitted: true })
        const { username, password } = this.state

        // stop here if form is invalid
        if (!(username && password)) {
            return;
        }

        this.setState({ loading: true })
        userService.login(username, password)
            .then(
                user => {
                    const { from } = this.props.location.state || { from: { pathname: "/" } }
                    this.props.history.push(from)
                },
                error => this.setState({ error, loading: false })
            );
    }

    render() {
        const { username, password, submitted, loading, error } = this.state;
        return (
            <div className="login-container">
                <img src={logo} className="logo" alt="logo" />
                <div className="login-header">Ittysensor</div>
                <form className="login" name="login" onSubmit={this.handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <div className={'form-group' + (submitted && !username ? ' alert-error' : '')}>
                        <input type="text" placeholder="Enter Username" name="username" value={username} onChange={this.handleChange} />
                        {submitted && !username &&
                            <div className="help-block">Username is required</div>
                        }
                    </div>
                    <label htmlFor="password">Password</label>
                    <div className={'form-group' + (submitted && !password ? ' alert-error' : '')}>
                        <input type="password" placeholder="Enter Password" name="password" value={password} onChange={this.handleChange} />
                        {submitted && !password &&
                            <div className="help-block">Password is required</div>
                        }
                    </div>
                    <div className="form-group">
                        <button className="button" disabled={loading}>Login</button>
                    </div>
                    { error &&
                        <div className="alert-error">{error}</div>
                    }
                </form>
            </div>
        );
    }
}

export { LoginPage }; 