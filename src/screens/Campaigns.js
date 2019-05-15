import React, { Component } from 'react';
import CustomizedCampaignTable from '../components/CustomizedCampaignTable';
import firebase from "firebase";

class Campaigns extends Component {

    state = {
      campaignData: []
    }

    componentWillMount(){
      let ref = firebase.database().ref('campaign');

      ref.on('value', snapshot => {
        const campaignData = [];

        snapshot.forEach(childSnapshot => {
          const item = childSnapshot.val();
          item.key = childSnapshot.key;

          campaignData.push({ id:item.key, name: item.name, created: item.created, template: item.template, template_name: item.template_name });
          
        });

        this.setState({ campaignData });
      });
    }

    render() {
      return (
          <div>
           <CustomizedCampaignTable 
              rows={[
                { id: 'name', numeric: false, disablePadding: false, label: 'Folder Name', sortable: true },
                { id: 'template', numeric: false, disablePadding: false, label: 'Template', sortable: true },
                { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
                { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
              ]} 
              data={this.state.campaignData}
              orderBy={'created'}
              movefile={false}
              dataName='campaign'/>
          </div>
      );
    }
}
  
export default Campaigns;