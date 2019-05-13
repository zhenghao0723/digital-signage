import React, { Component } from "react";
import app from "../../firebase/base";
import Reaptcha from 'reaptcha';
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
  },
  title: {
    fontWeight: 'bold'
  }
});

class SignIn extends Component {

  constructor(props) {
    super(props);
    this.captcha = null;
    this.state = {
      isVerified: false,
      email: '',
      password: ''
    }
  }

  onLoad = () => {
    console.log('capcha successfully loaded');
  };

  onVerify = () => {
    // Do something
    this.setState({
      isVerified: true
    });
  };

  onExpire = () => {
    // Do something
    this.setState({
      isVerified: false
    });
  };
  

  handleSignIn = async event => {
    event.preventDefault();

    if (this.state.isVerified) {
      const { email, password } = this.state;
      try {
        await app
          .auth()
          .signInWithEmailAndPassword(email, password);
      } catch (error) {
        alert(error);
      }
    } else {
      alert('Please verify that you are a human!');
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
          <Typography variant="h5" className={classes.title} >Login</Typography>
          <form noValidate autoComplete="off" onSubmit={this.handleSignIn}>
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              id="standard-name"
              label="Username"
              type="email"
              className={classes.textField}
              value={this.state.email}
              onChange={this.handleChange}
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

            <div style={{ marginTop: 20 }} >
              <Reaptcha sitekey="6Ld1gZ8UAAAAAAav2MZF1t6n77Lw4oDj3HqQYQuh" onVerify={this.onVerify} onExpire={this.onExpire}/>
            </div>
            <div style={{ marginTop: 20 }} >
              <Button variant="outlined" type="submit" disabled={!this.state.isVerified}>Log in</Button>
              <Button style={{ marginLeft: 10 }} variant="outlined" type="submit" component={Link} to={'/digital-signage/register'}>Register</Button>
            </div>

            <Typography style={{ marginTop: 20 }} variant="caption" className={classes.title} component={Link} to={'/digital-signage/forgotpassword'} >Forgot Password</Typography>
            
          </form>
        </Paper>
      </div>
    );
  }
}

SignIn.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SignIn);
