import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => {
        const username = localStorage.getItem('username')
        const token = localStorage.getItem('token')
        return username && token 
            ? <Component {...props} username={username}/>
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    }} />
)