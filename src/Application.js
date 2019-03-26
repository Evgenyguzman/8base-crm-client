import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { WebAuth0AuthClient } from '@8base/web-auth0-auth-client';
import { EightBaseAppProvider } from '@8base/app-provider';
import { EightBaseBoostProvider, AsyncContent } from '@8base/boost';
import { ToastContainer, toast } from 'react-toastify';

import { ProtectedRoute } from 'shared/components';
import { TOAST_SUCCESS_MESSAGE } from 'shared/constants';

import { MainPlate, ContentPlate, Nav } from './components';
import { Auth } from './routes/auth';
import { Clients } from './routes/clients';
import { Client } from './routes/client';
import { Orders } from './routes/orders';
import { Order } from './routes/order';
import { Products } from './routes/products';

const { REACT_APP_8BASE_API_ENDPOINT } = process.env;

const AUTH_CLIENT_ID = 'qGHZVu5CxY5klivm28OPLjopvsYp0baD';
const AUTH_DOMAIN = 'auth.8base.com';

const auth0WebClient = new WebAuth0AuthClient({
  domain: AUTH_DOMAIN,
  clientId: AUTH_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/callback`,
  logoutRedirectUri: `${window.location.origin}/auth`,
});

class Application extends React.PureComponent {
  renderContent = ({ loading }) => (
    <AsyncContent loading={loading} stretch>
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route>
          <MainPlate>
            <Nav.Plate color="BLUE">
              <Nav.Item icon="Customers" to="/clients" label="Clients" />
              <Nav.Item icon="Table" to="/orders" label="Orders" />
              <Nav.Item icon="Table" to="/products" label="Products" />
            </Nav.Plate>
            <ContentPlate>
              <Switch>
                <ProtectedRoute exact path="/clients" component={Clients} />
                <ProtectedRoute exact path="/client/:id" component={Client} />
                <ProtectedRoute exact path="/orders" component={Orders} />
                <ProtectedRoute exact path="/order/:id" component={Order} />
                <ProtectedRoute exact path="/products" component={Products} />
                <Redirect to="/clients" />
              </Switch>
            </ContentPlate>
          </MainPlate>
        </Route>
      </Switch>
    </AsyncContent>
  );

  onRequestSuccess = ({ operation }) => {
    const message = operation.getContext()[TOAST_SUCCESS_MESSAGE];

    if (message) {
      toast.success(message);
    }
  };

  onRequestError = ({ graphQLErrors }) => {
    const hasGraphQLErrors = Array.isArray(graphQLErrors) && graphQLErrors.length > 0;

    if (hasGraphQLErrors) {
      graphQLErrors.forEach(error => {
        toast.error(error.message);
      });
    }
  };

  render() {
    return (
      <BrowserRouter>
        <EightBaseBoostProvider>
          <EightBaseAppProvider
            uri={REACT_APP_8BASE_API_ENDPOINT}
            authClient={auth0WebClient}
            onRequestSuccess={this.onRequestSuccess}
            onRequestError={this.onRequestError}
          >
            {this.renderContent}
          </EightBaseAppProvider>
          <ToastContainer position={toast.POSITION.BOTTOM_LEFT} />
        </EightBaseBoostProvider>
      </BrowserRouter>
    );
  }
}

export { Application };
