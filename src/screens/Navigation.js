import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'; 

class Navigation extends Component {
    render() {
      return (
        <div>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/stations">Stations</NavLink>
            <NavLink to="/contents">Contents</NavLink>
            <NavLink to="/templates">Templates</NavLink>
            <NavLink to="/campaigns">Campaigns</NavLink>
            <NavLink to="/networks">Networks</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/admin">Admin</NavLink>
        </div>
      );
    }
}
  
export default Navigation;