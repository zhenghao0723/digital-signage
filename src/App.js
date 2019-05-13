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
      </div>
    </BrowserRouter>
  );
}

export default App;
