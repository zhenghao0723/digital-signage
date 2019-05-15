import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import firebase from "firebase";
import Button from '@material-ui/core/Button';
import {sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CustomizedTable from './CustomizedTable'
import Paper from '@material-ui/core/Paper';
import AutoFitImage from 'react-image-autofit-frame';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    root: {
        width: '100%',
    }
});

const windowHeight = window.innerHeight - 115

const SortableItem = sortableElement(({value, index, handleToggle, checked, mediaCollection}) => 
{
  return mediaCollection.map(val => {
    if(val.id === value){
      return(
        <ListItem key={index} style={{ backgroundColor: '#fafafa'}} divider dense button onClick={handleToggle(val.id)}>
          <Checkbox
          checked={checked.indexOf(val.id) !== -1}
          tabIndex={-1}
          />
          <Avatar src={val.imageUrl}>
          </Avatar>
          <ListItemText primary={val.name} />
        </ListItem>
      )
    }
  })
})

const SortableContainer = sortableContainer(({children}) => {
  return <List>{children}</List>;
});

class CustomizedAddCampaign extends Component {

    state = {
        selectedTemplate: 'default',
        templateCollection: [],
        contents: [[]],
        allContainer: [''],
        openDialog: false,
        dialogOption: '',
        dialogTitle: '',
        mediaData:[],
        folderCollection: [],
        currentContainer: 0,
        checked: [],
        campaignName: '',
        mediaCollection: []
    }

    componentWillMount(){

      let ref = firebase.database().ref('media');

      ref.on('value', snapshot => {
          const mediaCollection = [];

          snapshot.forEach(childSnapshot => {
            const item = childSnapshot.val();
            item.key = childSnapshot.key;
            
            mediaCollection.push({id:item.key, name: item.name, imageUrl: item.imageUrl, created: item.created, type: item.type, size: item.size, folder: item.folder });
            
          });

          this.setState({ mediaCollection });
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

        let templateRef = firebase.database().ref('template');

        templateRef.on('value', snapshot => {
            const templateCollection = [];

            snapshot.forEach(childSnapshot => {
                const item = childSnapshot.val();
                item.key = childSnapshot.key;
                templateCollection.push({ id:item.key, name: item.name, created: item.created, container: item.container });
            });

            this.setState({ templateCollection });
        });
    }

    handleTemplateChange = event => {
        const contents = []
        const allContainer = []
        if(event.target.value !== 'default')
        {
          this.state.templateCollection.map(value => { 
            if(event.target.value === value.id){
              value.container.map(value => { 
                contents.push([])
                allContainer.push('')
              })
            }
          })
        } else {
          contents.push([])
          allContainer.push('')
        }

        this.setState({ selectedTemplate: event.target.value, contents, allContainer, currentContainer: 0 })
    }

    handleToggle = value => () => {
      
        const { checked } = this.state;
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
    
        this.setState({
          checked: newChecked,
        });
    };

    onSortEnd = ({oldIndex, newIndex}) => {

        var itemsArray = [[]]
        var finalItemsArray = [[]]
  
        finalItemsArray = this.state.contents
        itemsArray = arrayMove(this.state.contents[this.state.currentContainer], oldIndex, newIndex)
        
        finalItemsArray.map((value, index) => {
          if(index == this.state.currentContainer){
            finalItemsArray[index] = itemsArray
          }
        })
        
        this.setState({ contents: finalItemsArray });
    };
  
    onSortStart = ({node, index, collection, isKeySorting}) => {
    
        const allContainer = this.state.allContainer.map((value, num) => {
            
            if(num == this.state.currentContainer)
            {
            return this.state.contents[this.state.currentContainer][index]
            } else {
            return this.state.allContainer[num]
            }
        })

        this.setState({ allContainer })
    }

    handleClose = () => {
        this.setState({ openDialog: false });
    };

    renderSortableItem = () => {
     if(this.state.contents[this.state.currentContainer])
     {
      return this.state.contents[this.state.currentContainer].map((val,index)=>{
          return(
            <SortableItem key={`item-${index}`} index={index} value={val} handleToggle={this.handleToggle} checked={this.state.checked} mediaCollection={this.state.mediaCollection}/>
          )
        })
     } else {
        return(
          <div></div>
        )
     }
    }

    renderSortable = () => {
        return (
            <SortableContainer lockAxis="y" onSortEnd={this.onSortEnd} onSortStart={this.onSortStart}>
                <Divider/>
                {this.renderSortableItem()}
            </SortableContainer>
        )
    }

    renderTemplate = () => {

      if(this.state.selectedTemplate !== 'default'){
        
        const templateData = [];
        this.state.templateCollection.map((value, index) => {
          if(value.id === this.state.selectedTemplate)
          {
            value.container.map((val, index) => {
              templateData.push({ id:val.id, width: val.width, height: val.height })
            })
            
          }
        })

        const mediaData = [];
        
        this.state.allContainer.map((value, index) => { 
          
          if(this.state.allContainer[index] !== '')
          {

            this.state.mediaCollection.map((value, mediaIndex) => {
              if(value.id === this.state.allContainer[index])
              {
                mediaData.push({ id: value.id, name: value.name, imageUrl: value.imageUrl })
              }
            })

          } else {
            mediaData.push({ id: '', name: '', imageUrl: '' })
          }
          
        })

       
        
        return templateData.map((value, index) => 
          <Grid key={value.id} onClick={()=> { 
            
              if(this.state.currentContainer != index)
              {
                this.setState({ currentContainer: index, checked: [] }) 
              }
            
            }} item>
            <Paper square 
              style={{height: value.height/4, width:value.width/4}}
            >
              <AutoFitImage imgSize="contain" frameWidth={value.width/4 + "px"} frameHeight={value.height/4 + "px"} imgSrc={mediaData[index] ? mediaData[index].imageUrl : ''} style={{/*..your style here..*/}}/>
            </Paper>
          </Grid>)

      } else {

        const mediaData = [];
        
        this.state.allContainer.map((value, index) => { 
          
          if(this.state.allContainer[index] && this.state.allContainer[index] !== '')
          {
            
            this.state.mediaCollection.map((val, mediaindex) => {
              if(val.id === this.state.allContainer[index])
              {
                mediaData.push({ id: val.id, name: val.name, imageUrl: val.imageUrl })
              }
            })
          } else {
            mediaData.push({ id: '', name: '', imageUrl: '' })
          }
          
        })
       
        return (
          <Grid item>
            <Paper square
              style={{ height: 1920/4, width:1080/4 }}
            >
              <AutoFitImage imgSize="contain" frameWidth={1080/4 + "px"} frameHeight={1920/4 + "px"} imgSrc={mediaData[0] ? mediaData[0].imageUrl : ''} style={{/*..your style here..*/}}/>
            </Paper>
          </Grid>)
      }
      
    }

    renderDialog = () => {
        if(this.state.dialogOption === 'addMedia'){
            return(
                <div>
                    <DialogContent>
                    <CustomizedTable 
                        rows={[
                            { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
                            { id: 'imageUrl', numeric: false, disablePadding: false, label: 'File Thumbnail', sortable: true, thumbnail: true },
                            { id: 'created', numeric: false, disablePadding: false, label: 'Created by', sortable: true },
                            { id: 'type', numeric: false, disablePadding: false, label: 'File Type', sortable: true },
                            { id: 'size', numeric: false, disablePadding: false, label: 'File Size', sortable: true },
                            { id: 'action', numeric: false, disablePadding: false, sortable: false, action: true },
                        ]} 
                        orderBy={'created'}
                        folderCollection={this.state.folderCollection}
                        preview={true}
                        movefile={true}
                        select={true}
                        dataName='media'
                        folderSelection={true}
                        onAddMediaClick={this.onAddMediaClick}/>
                    </DialogContent>
                </div>
            )
        }
    }

    onAddMediaClick = selected => {

      const contents = this.state.contents
      selected.map((value, index) => {
        contents[this.state.currentContainer].push(value)
      })

      if(this.state.selectedTemplate !== 'default'){
        const allContainer = []
        this.state.templateCollection.map((value, index) => {
          if(value.id === this.state.selectedTemplate)
          {
            value.container.map((val, index) => {
              if(this.state.allContainer[index] == '' && index == this.state.currentContainer)
              {
                allContainer.push(contents[this.state.currentContainer][0])
              } else {
                allContainer.push(this.state.allContainer[index])
              }
            })
            
          }
        })

        this.setState({ contents, openDialog: false, allContainer })
      } else {
        const allContainer = []
        allContainer.push(contents[this.state.currentContainer][0])

        this.setState({ contents, openDialog: false, allContainer })
      }
    }

    handleCampaignNameChange = event => {
      this.setState({ campaignName: event.target.value });
    };  

    handleSaveCampaign = () => {
      
      if(this.state.selectedTemplate !== 'default' )
      {
        let templateRef = firebase.database().ref('template/' + this.state.selectedTemplate);

        templateRef.once('value', snapshot => {
          const item = snapshot.val();
  
          var postData = {
            name: this.state.campaignName == ''? 'default' : this.state.campaignName,
            created: firebase.database.ServerValue.TIMESTAMP,
            content: this.state.contents,
            template: this.state.selectedTemplate,
            template_name: item.name
          };
      
          // Get a key for a new Post.
          var newPostKey = firebase.database().ref().child('campaign').push().key;
      
          // Write the new post's data simultaneously in the posts list and the user's post list.
          var updates = {};
          updates['/campaign/' + newPostKey] = postData;
        
          firebase.database().ref().update(updates);
            
        });
      } else {
        var postData = {
          name: this.state.campaignName == ''? 'default' : this.state.campaignName,
          created: firebase.database.ServerValue.TIMESTAMP,
          content: this.state.contents,
          template: this.state.selectedTemplate,
          template_name: 'default'
        };
    
        // Get a key for a new Post.
        var newPostKey = firebase.database().ref().child('campaign').push().key;
    
        // Write the new post's data simultaneously in the posts list and the user's post list.
        var updates = {};
        updates['/campaign/' + newPostKey] = postData;
      
        firebase.database().ref().update(updates);
      }
      this.props.handleTabsChangeIndex(0)
      
      this.setState({ selectedTemplate:'default', contents: [[]], campaignName: '', allContainer: [], currentContainer: 0 })
    }

    render() {
        const { classes } = this.props;

        return (
          <div className={classes.root}>
            <Dialog
                onClose={this.handleClose}
                aria-labelledby="customized-dialog-title"
                open={this.state.openDialog}
                maxWidth='xl'
            >
            <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                {this.state.dialogTitle}
            </DialogTitle> 
            {this.renderDialog()}
            </Dialog>
            <Grid style={{ minHeight:windowHeight }} container>
                <Grid style={{ height: windowHeight, padding: 10 }} item xs={3}>
                    <FormControl style={{ marginTop: 10 }} fullWidth variant="outlined" >
                        <InputLabel
                            ref={ref => {
                            this.InputLabelRef = ref;
                            }}
                            htmlFor="outlined-age-simple"
                        >
                            Template
                        </InputLabel>
                        <Select
                            value={this.state.selectedTemplate}
                            onChange={this.handleTemplateChange}
                            input={
                            <OutlinedInput
                                labelWidth={100}
                                name="folder"
                                id="outlined-age-simple"
                            />
                            }
                        >
                            
                            <MenuItem value="default">
                            <em>Default</em>
                            </MenuItem>
                            {this.state.templateCollection.map(n => {
                            return(
                                <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                            )
                            })}

                        </Select>
                    </FormControl>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="primary" onClick={()=> this.setState({ openDialog: true, dialogOption: 'addMedia', dialogTitle: 'Add Media' }) }>
                        Add File
                        </Button>
                    </div>
                    <Grid style={{ position: 'relative', overflow: 'auto' }} item xs={12}>
                        {this.renderSortable()}
                    </Grid>
                </Grid>
                <Grid container alignItems="center" justify="center" style={{ backgroundColor: '#efefef' , height: windowHeight, padding: 10}} item xs={6}>
                    <Grid container spacing={0} direction="column" alignItems="center" justify="flex-start" style={{ height: 1920/4, width: 1080/4, backgroundColor: '#262626'}} >
                      {this.renderTemplate()}
                    </Grid>
                </Grid>
                <Grid style={{ height: windowHeight, padding: 10 }} item xs={3}>
                  <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="primary" onClick={()=> this.handleSaveCampaign()}>
                  Save
                  </Button>
                  <TextField
                    fullWidth
                    autoFocus
                    margin="dense"
                    id="standard-name"
                    label="Campaign Name"
                    value={this.state.campaignName}
                    onChange={this.handleCampaignNameChange}
                  />
                </Grid>
            </Grid>
          </div>
        );
    }
}

CustomizedAddCampaign.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(CustomizedAddCampaign);
  