var React = require('react');

var Hours = require('./Hours');
// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '244916946815-v5jqb55dh9a0pgdu2ktt948t8hgsgpb6.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

module.exports = React.createClass({
    displayName: 'Auth',
    getInitialState: function() {
        return {
                auth: false,
                show:false
        };
    },
    handleAuthClick: function(event){
        //CALENDAR_ID = $("#calID")[0].value
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            this.handleAuthResult);
        return false;
    },
    mountHours: function(){
        this.setState({show:true});
    },
    handleAuthResult: function(authResult){
        if (authResult && !authResult.error) {
            this.setState({auth:true});
        } else {
            this.setState({auth:false});
        }
    },


    render: function () {
        var showList =   <Hours/>  ;
        if (!this.state.auth) {
            return (
                <div className='auth' id="authorize-div">
                    <pre>Authorize access to Google Calendar API
                    </pre>
                    <pre>

                                    <input ref='authorize-button' type='button' onClick={this.handleAuthClick }
                                           value='Authorize'></input>
                    </pre>

                </div>
            )
        }
        else {
            return (
                <div>
                    {showList}
                </div>
            )
        }

    }
});