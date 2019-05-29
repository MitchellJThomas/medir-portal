import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => {
        const token = localStorage.getItem('token')
        return token
            ? <Component {...props} user={JSON.parse(token)}/>
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    }} />
)