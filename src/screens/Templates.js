import React, { Component } from 'react';
import CustomizedTemplateTable from '../components/CustomizedTemplateTable';
import firebase from "firebase";

class Templates extends Component {

    state = {
      templateData: []
    }

    componentWillMount(){
      let ref = firebase.database().ref('template');

      ref.on('value', snapshot => {
        const templateData = [];

        snapshot.forEach(childSnapshot => {
          const item = childSnapshot.val();
          item.key = childSnapshot.key;

          templateData.push({ id:item.key, name: item.name, created: item.created, size: item.size, container: item.container });
          
        });

        this.setState({ templateData });
      });
    }

    render() {
      return (
          <div>
           <CustomizedTemplateTable 
              rows={[
                { id: 'name', numeric: false, disablePadding: false, label: 'Template Name', sortable: true },
                { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
                { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
              ]} 
              data={this.state.templateData}
              orderBy={'created'}
              movefile={false}
              dataName='template'/>
          </div>
      );
    }
}
  
export default Templates;