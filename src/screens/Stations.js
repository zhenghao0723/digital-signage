import React, { Component } from 'react';
import CustomizedStationTable from '../components/CustomizedStationTable';
import firebase from "firebase";

class Templates extends Component {

    state = {
      stationData: []
    }

    componentWillMount(){
      let ref = firebase.database().ref('station');

      ref.on('value', snapshot => {
        const stationData = [];

        snapshot.forEach(childSnapshot => {
          const item = childSnapshot.val();
          item.key = childSnapshot.key;

          stationData.push({ id:item.key, name: item.name, created: item.created });
          
        });

        this.setState({ stationData });
      });
    }

    render() {
      return (
          <div>
           <CustomizedStationTable 
              rows={[
                { id: 'name', numeric: false, disablePadding: false, label: 'Station Name', sortable: true },
                { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
                { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
              ]} 
              data={this.state.stationData}
              orderBy={'created'}
              movefile={false}
              dataName='station'/>
          </div>
      );
    }
}
  
export default Templates;