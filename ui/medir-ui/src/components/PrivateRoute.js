import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => {
        const user = localStorage.getItem('user')
        return user
            ? <Component {...props} user={JSON.parse(user)}/>
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    }} />
)