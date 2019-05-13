import React, { Component } from "react";
import app from "../../firebase/base";
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Redirect, Link } from 'react-router-dom'

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

class ForgotPassword extends Component {

    state = {
        email: '',
        redirect: false
    }

    handleForgotPassword = async event => {
        event.preventDefault();

        const { email } = this.state;
        
        try {
            await app.auth().sendPasswordResetEmail(email).then(()=>{
                this.setState({ redirect: true })
            })
            
        } catch (error) {
            alert(error);
        }
    };

    handleChange = event => {
        this.setState({ email: event.target.value });
    };

    render() {

        const { classes } = this.props;
        const { redirect } = this.state;

        if (redirect) {
            return <Redirect to='/digital-signage'/>;
        }

        return (
            <div style={{ display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'  }}>
                <Paper className={classes.root} elevation={1} >
                    <Typography variant="h5" className={classes.title} >Forgot Password</Typography>
                    <form onSubmit={this.handleForgotPassword}>
                        <TextField
                            fullWidth
                            autoFocus
                            margin="dense"
                            id="standard-name"
                            label="Email Address"
                            type="email"
                            className={classes.textField}
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                        <Button style={{ marginTop:20 }} variant="outlined" type="submit" disabled={this.state.email == ''? true : false}>Send</Button>
                        <Typography style={{ marginTop: 20 }} variant="caption" className={classes.title} component={Link} to={'/digital-signage'} >Back to Login Page</Typography>
                    </form>
                </Paper>
            </div>
        )
    }
}

ForgotPassword.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ForgotPassword);
