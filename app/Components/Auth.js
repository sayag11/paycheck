const React = require('react');

const Hours = require('./Hours');
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
const CLIENT_ID = '244916946815-v5jqb55dh9a0pgdu2ktt948t8hgsgpb6.apps.googleusercontent.com';
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

module.exports = React.createClass({
    displayName: 'Auth',
    getInitialState: function() {
        return {
                auth: false,
        };
    },

    handleAuthClick: function(event){
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            this.handleAuthResult);
        return false;
    },

    handleAuthResult: function(authResult){
        if (authResult && !authResult.error) {
            this.setState({auth:true});
        } else {
            this.setState({auth:false});
        }
    },

    render: function () {
        if (!this.state.auth) {
            return (
                <div className='auth' id="authorize-div">
                    <pre>
                        <input ref='authorize-button'
                               className="btn btn-success"
                               type='button'
                               onClick={this.handleAuthClick }
                               value='Log in using Google account'>
                        </input>
                    </pre>
                </div>
            )
        }
        else {
            return (
                <Hours/>
            )
        }

    }
});