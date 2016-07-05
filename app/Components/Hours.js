/**
 * Created by ysayag on 15/02/2016.
 */

var React = require('react');
var CALENDAR_ID = ''


module.exports = React.createClass({
    displayName: 'Hours',
    getInitialState: function() {
        return {
            show_list: false,
            dates : [],
            hours: [],
            total: []
        };
    },
    reduceTaxes: function(bruto,points,food_expanses){
        const LEVEL0 = 0.1;  const SALARY1 = 5220;
        const LEVEL1 = 0.14; const SALARY2 = 8920;
        const LEVEL2 = 0.21; const SALARY3 = 13860;
        const LEVEL3 = 0.31; const SALARY4 = 19800;
        const LEVEL4 = 0.34; const SALARY5 = 41410;
        const LEVEL5 = 0.48; const SALARY6 = 66960;
        const LEVEL6 = 0.5;
        var tax = [LEVEL0,LEVEL1,LEVEL2,LEVEL3,LEVEL4,LEVEL5,LEVEL6]; // tax steps precentage change to zeros
        var tax_levels = [SALARY1,SALARY2,SALARY3,SALARY4,SALARY5,SALARY6]; // tax salaries for steps
        var tax_deltas = [SALARY1,SALARY2-SALARY1,SALARY3-SALARY2,SALARY4-SALARY3,SALARY5-SALARY4,SALARY6-SALARY5];
        var bruto_for_tax = bruto+food_expanses; //add food expanses for bruto
        var point_val = 216*points;
        var max_level_index=0;
        for(i=0;i<tax_levels.length;i++) {
            if(tax_levels[i]>=bruto_for_tax){
                max_level_index=i-1;
                break;
            }
        }
        if(max_level_index===-1){ // below minimum step
            max_level_index =0;
        }
        if(bruto_for_tax>tax_levels[5])max_level_index = 5; // abov maximum step
        for(var i=0;i<tax_levels.length;i++)
        {
            if(i<max_level_index){
                tax[i]=tax[i]*tax_deltas[i];
            }
            else{
                break;
            }
        }
        if(max_level_index==0){
            tax[max_level_index]= tax[max_level_index]*bruto_for_tax;
        }
        else{ //max_level_index>0
            tax[max_level_index]= tax[max_level_index]*(bruto_for_tax-tax_levels[max_level_index]);
        }

        for(i=0;i<=max_level_index;i++)
        {
            bruto-= tax[i];
        }
        var social_and_health = this.CalcSocial_Security_Taxes(bruto,bruto_for_tax);
        $("#output").append('Social Security and Health Taxes: '+social_and_health+'\n');

        bruto -= social_and_health;
        bruto+=point_val;
        return bruto;

    },
    CalcSocial_Security_Taxes: function(bruto,bruto_for_tax) {
        var HealthTax = 0; // HealthTax = health tax
        var SocialSecTax = 0; // SocialSecTax = social security tax
        HealthTax+= Math.min(5678,bruto_for_tax)*0.031;
        SocialSecTax+= Math.min(5678,bruto_for_tax)*0.04;
        var res = bruto_for_tax-5678; // reduce avg salary
        if(res>0){
            HealthTax += res*0.05;
            SocialSecTax += res*0.07;
        }
        return HealthTax+SocialSecTax;
    },
    listHours: function(){
       $('#output')[0].innerHTML="";
        var t_dates = [];
        var t_hours = [];
        var t_total = [];
        var start_date =  new Date($("#start_date")[0].value);
        var end_date =  new Date($("#end_date")[0].value);
            end_date = new Date(end_date.getTime()+24*1000*60*60); // adjust to the END of the day (parsing from the string originally returns start of the day )
        var leasing = $("#car")[0].value;
        var nis_hr = $("#salary")[0].value;
        var daysDiff = Math.abs(end_date.getTime() - start_date.getTime());
        var days_period = Math.ceil(daysDiff / (1000 * 3600 * 24)) ; //the amount of total days in the period calculated
        var months_work = Math.ceil(days_period/31);
        var request = gapi.client.calendar.events.list({

            'calendarId': $("#calID")[0].value, // for main calender : 'primary'
            'timeMin': start_date.toJSON(),
            'timeMax': end_date.toJSON(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime'
        });

        request.execute((resp) => {
            var events = resp.items;
            if (events.length > 0 && !isNaN(nis_hr) && $("#start_date")[0].value!=="" && $("#end_date")[0].value!=="") {
                var hours_count = 0;
                var extra_hours=0;
                var extra_over_two=0;
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var when = event.start.dateTime;
                    var when2 = event.end.dateTime;
                    var start_time = new Date(when);
                    var end_time = new Date(when2);
                    var timeDiff = Math.abs(end_time.getTime() - start_time.getTime());
                    timeDiff = timeDiff / 1000 / 3600;
                    var res =0;
                    if(timeDiff>9)
                    {
                        res = timeDiff-9;
                        if(res>2)
                        {
                            extra_hours+=2;
                            extra_over_two+=(res-2);
                        }
                        else{ //res<=2
                            extra_hours+=res;
                        }
                        timeDiff=9;
                    }
                    hours_count+= timeDiff;
                    t_dates.push(start_time.getDate() +'/' + +(start_time.getMonth()+1)+'/'+start_time.getFullYear()+" :  ");
                    t_hours.push(start_time.toLocaleTimeString()+' to '+ end_time.toLocaleTimeString()+"  ");
                    t_total.push('  (Total: '+(Math.round((timeDiff+res) * 100) / 100)+')\n');
                    $("#output").append( start_time.getDate() +'/' + +(start_time.getMonth()+1)+'/'+start_time.getFullYear()+' :  '+start_time.toLocaleTimeString()+' to '+ end_time.toLocaleTimeString()  + '  (Total: '+(Math.round((timeDiff+res) * 100) / 100)+')\n') // TODO REFORMAT TO READABLE
                  //  this.setState({ dates : t_dates, hours: t_hours, total: t_total });

                }

                var food_expanses = parseInt($("#food")[0].value)*months_work;
                var points = 2.25*months_work;
                var transportation = 26.40*events.length;
                var rounded_hours = (Math.round(hours_count * 100) / 100);
                var rounded_extra_hours = (Math.round(extra_hours * 100) / 100);
                var rounded_extra_over_two = (Math.round(extra_over_two * 100) / 100);

                var sum = hours_count*nis_hr;
                var PensionAndEdFundTaxes = 0.025*sum +0.055*sum; //pension tax reduces from regular hours count only
                sum+= transportation;
                sum+= extra_hours*nis_hr*1.25 + extra_over_two*nis_hr*1.5; // count all hours
                var rounded_sum = Math.round(sum);
                var neto_sum = Math.round(this.reduceTaxes(sum,points,food_expanses) -PensionAndEdFundTaxes-leasing); //reduce leasing, taxes AND pension payments that were calculated before from neto hours_count
                $("#output").append('Hours:'+ rounded_hours+ '\n');
                $("#output").append('Extra Hours 125%:'+ rounded_extra_hours+'\n');
                $("#output").append('Extra Hours 150%:'+rounded_extra_over_two+'\n');
                $("#output").append('Bruto:'+rounded_sum+'\n');
                $("#output").append('Pension and EdFund '+PensionAndEdFundTaxes+'\n');
                $("#output").append('Total (Neto):'+neto_sum+'\n');
            }
            else {
                $("#output").append('<h3 id="head">Nothing was found</h3>');
            }
        });
    },
    loadCalendarApi: function(){
        gapi.client.load('calendar', 'v3', this.listHours);
    },
    handleClick: function(){
        this.loadCalendarApi();
        },
    componentDidMount() {
             $( "#start_date").datepicker();
             $( "#end_date").datepicker();
             var last_day = (new Date().getMonth()+1).toString()+'/31/2016';
             var first_day = (new Date().getMonth()+1).toString()+'/1/2016';
             $("#end_date")[0].value = last_day;
             $("#start_date")[0].value = first_day;
    },
    //componentWillMount() {
    //},
    render: function () {
        var out = <pre id='output'></pre>;
        return (
            <div>
                <pre>
                // TODO instructions for calendar ID
                    Calendar ID: <input id="calID" size="75" defaultValue="8qknscd1lc0r9m8042ggj61du8@group.calendar.google.com" type="text"/>
                // TODO keyword for calendar
                </pre>
                Type Start Date: <input id="start_date" type="text"/>
                Type End Date : <input id="end_date" type="text"/>
                Type hourly income: <input id="salary" defaultValue="01" type="text"/>
                 <img src="https://lh3.googleusercontent.com/O0MBDQTyqRQ5YCWzxCApxq1y1aO_p7YOipvXJJ8TMwaNVxq2uakx-SamX1eqe5CM8ytd=w300" width="30" height="30"/>
                 <img src="https://lh4.ggpht.com/XK5N1cl5nKIgCq63b2FIsovjvOPlrj3TFH43AP0Jm7aA7svQbyzeeE69BHXRkxxXOcHt=w300" width="30" height="30"/>
                Food Expanses: <input id="food" defaultValue="01" type="text"/>
                //TODO radio buttons: Company Car ( or public transportation )
                CAR Leasing: <input id="car" defaultValue="0" type="text"/>
            <input className="btn btn-success" type="button" value="Calculate!" onClick={this.handleClick.bind()}/>
                {out}
            </div>
        )
    }
});



