import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'; 

class Navigation extends Component {
    render() {
      return (
        <div>
            <NavLink to="/digital-signage">Dashboard</NavLink>
            <NavLink to="/digital-signage/stations">Stations</NavLink>
            <NavLink to="/digital-signage/contents">Contents</NavLink>
            <NavLink to="/digital-signage/templates">Templates</NavLink>
            <NavLink to="/digital-signage/campaigns">Campaigns</NavLink>
            <NavLink to="/digital-signage/networks">Networks</NavLink>
            <NavLink to="/digital-signage/reports">Reports</NavLink>
            <NavLink to="/digital-signage/admin">Admin</NavLink>
        </div>
      );
    }
}
  
export default Navigation;