import React from 'react';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

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

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navigation />
        <Switch>
          <Route path="/" component={Dashboard} exact />
          <Route path="/stations" component={Stations} />
          <Route path="/contents" component={Contents} />
          <Route path="/templates" component={Templates} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/networks" component={Networks} />
          <Route path="/reports" component={Reports} />
          <Route path="/admin" component={Admin} />
          <Route component={Error} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
