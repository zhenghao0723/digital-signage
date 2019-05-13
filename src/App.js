import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';

//authentication
import SignIn from "./screens/authentication/SignIn";
import SignUp from "./screens/authentication/SignUp";
import ForgotPassword from "./screens/authentication/ForgotPassword";
import app from "./firebase/base";

//screens
import Dashboard from "./screens/Dashboard";
import Stations from "./screens/Stations";
import Contents from "./screens/Contents";
import Templates from "./screens/Templates";
import Campaigns from "./screens/Campaigns";
import Networks from "./screens/Networks";
import Reports from "./screens/Reports";
import Admin from "./screens/Admin";
import Error from "./screens/Error";
import Navigation from "./screens/Navigation";

class App extends Component {

  state = {
    loading: true, authenticated: false, user: null
  };

  componentWillMount() {
    app.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          authenticated: true,
          currentUser: user,
          loading: false
        });
      } else {
        this.setState({
          authenticated: false,
          currentUser: null,
          loading: false
        });
      }
    });
  }

  renderRoute(){
    return(
      <Switch>
        <Route path="/digital-signage" component={Dashboard} exact />
        <Route path="/digital-signage/stations" component={Stations} />
        <Route path="/digital-signage/contents" component={Contents} />
        <Route path="/digital-signage/templates" component={Templates} />
        <Route path="/digital-signage/campaigns" component={Campaigns} />
        <Route path="/digital-signage/networks" component={Networks} />
        <Route path="/digital-signage/reports" component={Reports} />
        <Route path="/digital-signage/admin" component={Admin} />
        <Route component={Error} />
      </Switch>
    )
  }

  render(){

    const { authenticated, loading } = this.state;

    if (loading) {
      return <div style={{ display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'  }}><CircularProgress color="primary" /></div>;
    }

    if(authenticated)
    {
      return (
        <BrowserRouter>
          <div>
            <Navigation components={this.renderRoute()}/>
          </div>
        </BrowserRouter>
      );
    } else {
      return (
        <BrowserRouter>
          <div>
            <Switch>
              <Route path="/digital-signage" component={SignIn} exact/>
              <Route path="/digital-signage/register" component={SignUp} />
              <Route path="/digital-signage/forgotpassword" component={ForgotPassword} />
              <Route component={Error} />
            </Switch>
          </div>
        </BrowserRouter>
      );
    }

  }
}

export default App;
