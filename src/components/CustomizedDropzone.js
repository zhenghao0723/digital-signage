import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import FileUploader from "react-firebase-file-uploader";
import firebase from "firebase";
import Button from '@material-ui/core/Button';
import { MovieRounded } from '@material-ui/icons';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;

const getColor = (props) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#eeeeee';
}

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box',
  justifyContent: 'center',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
  alignItems: 'center'
};

class CustomizedDropzone extends Component {

    state = {
        isUploading: false,
        uploadProgress: 0,
        filenames: [],
        downloadURLs: [],
        files:[]
    };
    
    handleUploadStart = () =>{
        this.setState({
            isUploading: true,
            uploadProgress: 0,
        })
    };

    handleUploadProgress = progress => {
        this.setState({
            uploadProgress: progress
        })
    }

    handleUploadError = error => {
        this.setState({
            isUploading: false
            // Todo: handle error
        });
        alert(error);
    };

    handleUploadSuccess = async filename => {
        const downloadURL = await firebase
            .storage()
            .ref("media")
            .child(filename)
            .getDownloadURL();

        const file = await firebase
            .storage()
            .ref("media")
            .child(filename)

        // Get metadata properties
        file.getMetadata().then(function(metadata) {

            var postData = {
            name: metadata.name,
            imageUrl: downloadURL,
            size: metadata.size,
            created: firebase.database.ServerValue.TIMESTAMP,
            type: metadata.contentType,
            fullPath: metadata.fullPath,
            folder: 'default'
            };

            // Get a key for a new Post.
            var newPostKey = firebase.database().ref().child('media').push().key;
        
            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/media/' + newPostKey] = postData;
        
            firebase.database().ref().update(updates);

        }).catch(function(error) {
            // Uh-oh, an error occurred!
        });

        this.setState(oldState => ({
            filenames: [...oldState.filenames, filename],
            downloadURLs: [...oldState.downloadURLs, downloadURL],
            uploadProgress: 100,
            isUploading: false,
            files:[]
        }));

    };

    customOnChangeHandler = (event) => {
        const { target: { files } } = event;
        const filesToStore = [];
        Array.from(files).forEach(file => filesToStore.push(file));
        this.setState({ files: filesToStore })
    }

    startUploadManually = () => {
        this.setState({ isUploading: true })
        const { files } = this.state;
        Array.from(files).forEach(file => {
            this.fileUploader.startUpload(file)
        });
    }

    onClearFileList = () => {
        this.setState({files: []})
    }

    onDrop = (files) => {
        this.setState({files})
    }

    render() {
      return (
          <div style={{ marginBottom: 20 }}>
            <FileUploader
                accept="image/png, image/jpeg, video/mp4"
                name="image-uploader-multiple"
                randomizeFilename
                storageRef={firebase.storage().ref("media")}
                onUploadStart={this.handleUploadStart}
                onUploadError={this.handleUploadError}
                onUploadSuccess={this.handleUploadSuccess}
                onProgress={this.handleUploadProgress}
                onChange={this.customOnChangeHandler} // ⇐ Call your handler
                ref={fileUploader => { this.fileUploader = fileUploader; } }  // ⇐ reference the component
                multiple
                hidden 
            />
            <Dropzone disabled={this.state.isUploading} multiple onDrop={this.onDrop} accept="image/png, image/jpeg, video/mp4" minSize={0} maxSize={45428800}>
                {({getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, rejectedFiles}) => (
                <div>
                    <Container {...getRootProps({isDragActive, isDragAccept, isDragReject, rejectedFiles})}>
                    <input {...getInputProps()} />
                    {isDragActive ? "Drop the files here" : 'Drag and drop some files here, or click to select files'}
                    </Container>
                    <aside style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap',marginTop: 16 }}>
                    {this.state.files.map(file => { 
                        if(file.type === 'video/mp4'){
                        return(
                        <div style={thumb} key={file.name}>
                            <div style={thumbInner}>
                            <MovieRounded style={{ fontSize: 50, color: "#b4b4b4" }}/>
                            </div>
                        </div>)
                        } else {
                        return(
                        <div style={thumb} key={file.name}>
                            <div style={thumbInner}>
                            <img alt={file.name}
                                src={URL.createObjectURL(file)}
                                style={{ display: 'block', width: 'auto', height: '100%' }}
                            />
                            </div>
                        </div>)
                        }
                    })}
                    </aside>
                    <div style={{ display: 'inline-flex' }}>
                    <Button onClick={this.startUploadManually} disabled={(this.state.files.length > 0 && !this.state.isUploading)? false : true } variant="outlined" color="primary">
                        Upload
                    </Button>
                    <Button onClick={this.onClearFileList} disabled={(this.state.files.length > 0 && !this.state.isUploading)? false : true } variant="outlined" color="primary" style={{ marginLeft:8 }}>
                        Clear
                    </Button>
                    {rejectedFiles.length > 0 && (<div style={{ marginTop: 8, color:'#fa3b56', fontSize: 12, marginLeft: 8, alignItems: 'bottom' }}>{rejectedFiles.length} files has been rejected.</div>)}
                    </div>
                </div>
                )}
            </Dropzone>
          </div>
      );
    }
}
  
export default CustomizedDropzone;