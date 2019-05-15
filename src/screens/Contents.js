import React, { Component } from 'react';
import CustomizedExpansionPanel from '../components/CustomizedExpansionPanel'
import CustomizedDropzone from '../components/CustomizedDropzone'
import CustomizedTable from '../components/CustomizedTable'
import CustomizedFolderTable from '../components/CustomizedFolderTable'
import firebase from "firebase";

class Contents extends Component {

  state = {
    mediaData:[],
    folderCollection:[]
  }

  componentWillMount(){
    let ref = firebase.database().ref('media');

    ref.on('value', snapshot => {
      const mediaData = [];

      snapshot.forEach(childSnapshot => {
        const item = childSnapshot.val();
        item.key = childSnapshot.key;
        
        if(item.folder === 'default')
        {
          mediaData.push({ id:item.key, name: item.name, imageUrl: item.imageUrl, created: item.created, type: item.type, size: item.size, folder: item.folder });
        }
        
      });

      this.setState({ mediaData });
    });

    let folderRef = firebase.database().ref('media_folder');

    folderRef.on('value', snapshot => {
      const folderCollection = [];

      snapshot.forEach(childSnapshot => {
        const item = childSnapshot.val();
        item.key = childSnapshot.key;
        
        folderCollection.push({ id:item.key, name: item.name, created: item.created, total: item.total });
        
      });

      this.setState({ folderCollection });
    });
  }

  renderMediaContent(){
    return <CustomizedTable 
      rows={[
        { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
        { id: 'imageUrl', numeric: false, disablePadding: false, label: 'File Thumbnail', sortable: true, thumbnail: true },
        { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
        { id: 'type', numeric: false, disablePadding: false, label: 'File Type', sortable: true },
        { id: 'size', numeric: false, disablePadding: false, label: 'File Size', sortable: true },
        { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
      ]} 
      data={this.state.mediaData}
      orderBy={'created'}
      folderCollection={this.state.folderCollection}
      preview={true}
      movefile={true}
      dataName='media'/>
  }

  renderFoldersContent(){
    return <CustomizedFolderTable 
      rows={[
        { id: 'name', numeric: false, disablePadding: false, label: 'Folder Name', sortable: true },
        { id: 'total', numeric: false, disablePadding: false, label: 'Total Files', sortable: true },
        { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
        { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
      ]} 
      data={this.state.folderCollection}
      orderBy={'created'}
      folderCollection={this.state.folderCollection}
      movefile={false}
      dataName='media_folder'/>
  }

  render() {
    return (
        <div>
          <CustomizedDropzone />
          <CustomizedExpansionPanel panel={[{ name: 'Media', content: this.renderMediaContent() }, { name: 'Folders', content: this.renderFoldersContent() }]}/>
        </div>
    );
  }
}

export default Contents;