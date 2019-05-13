import React, { Component } from "react";
import app from "../../firebase/base";
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { Link } from "react-router-dom";

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    width: 300,
    backgroundColor: '#F4F4F4'
  },
  textField: {
    marginTop: 10
  }
});

class SignUp extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    }
  }

  handleSignUp = async event => {
    event.preventDefault();
    const { email, password } = this.state;
    try {
      await app.auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      alert(error);
    }
  };

  handleChange = event => {
    this.setState({ email: event.target.value });
  };

  passwordhandleChange = event => {
    this.setState({ password: event.target.value });
  };

  render() {

    const { classes } = this.props;

    return (
      <div style={{ display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'  }}>
        <Paper className={classes.root} elevation={1} >
          <Typography variant="h5" >Sign Up</Typography>
          <form noValidate autoComplete="off" onSubmit={this.handleSignUp}>
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              id="standard-name"
              label="Username"
              className={classes.textField}
              value={this.state.email}
              onChange={this.handleChange}
              type="email"
            />

            <TextField
              fullWidth
              id="standard-password-input"
              label="Password"
              className={classes.textField}
              type="password"
              value={this.state.password}
              onChange={this.passwordhandleChange}
              autoComplete="current-password"
              margin="dense"
            />

            <Button style={{ marginTop: 20 }} variant="outlined" type="submit" >Sign Up</Button>
            <Typography style={{ marginTop: 20 }} variant="caption" className={classes.title} component={Link} to={'/digital-signage'} >Back to Login Page</Typography>
          </form>
        </Paper>
      </div>
    );
  }
}

SignUp.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignUp);
