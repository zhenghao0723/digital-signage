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
import Fade from '@material-ui/core/Fade';
import Zoom from '@material-ui/core/Zoom';
import Grow from '@material-ui/core/Grow';
import { compose } from "recompose";
import ReactTimeout from 'react-timeout'
import { MovieRounded } from '@material-ui/icons';
import ReactPlayer from 'react-player'

const styles = theme => ({
    root: {
        width: '100%',
    },
    container: {
      border: '5px solid #f50057'
    },
    mediaContainer: {
      position: 'absolute',
    }
});

const windowHeight = window.innerHeight - 115

const SortableItem = sortableElement(({value, index, handleToggle, checked, mediaCollection, allContainer, currentContainer}) => 
{
  return mediaCollection.map(val => {
    if(val.id === value.content){

      if(val.type === "video/mp4"){
        return(
          <ListItem key={index} selected={allContainer[currentContainer] === value.content ? true : false } divider dense button onClick={handleToggle(val.id)}>
            <Checkbox
            checked={checked.indexOf(val.id) !== -1}
            tabIndex={-1}
            />
            <MovieRounded style={{ fontSize: 30, marginLeft:5, marginRight: 5, color: "#b4b4b4" }}/>
            <ListItemText primary={val.name} />
          </ListItem>
        )
      } else {
        return(
          <ListItem key={index} selected={allContainer[currentContainer] === value.content ? true : false } divider dense button onClick={handleToggle(val.id)}>
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
      
    }
  })
})

const SortableContainer = sortableContainer(({children}) => {
  return <List>{children}</List>;
});

var timeout = [];

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
        mediaCollection: [],
        contentDuration: 0,
        transitionSelected: 'fade',
        dialogTitleVisible: true,
        currentSlideIndex: [0]
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
        const currentSlideIndex = []
        if(event.target.value !== 'default')
        {
          this.state.templateCollection.map(value => { 
            if(event.target.value === value.id){
              value.container.map(value => { 
                contents.push([])
                allContainer.push('')
                currentSlideIndex.push(0)
              })
            }
          })
        } else {
          contents.push([])
          allContainer.push('')
          currentSlideIndex.push(0)
        }

        this.setState({ selectedTemplate: event.target.value, contents, allContainer, currentContainer: 0, contentDuration: 0, transitionSelected: 'fade', currentSlideIndex })
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
          if(index === this.state.currentContainer){
            finalItemsArray[index] = itemsArray
          }
        })
        
        this.setState({ contents: finalItemsArray });
    };
  
    onSortStart = ({node, index, collection, isKeySorting}) => {
    
        const allContainer = this.state.allContainer.map((value, num) => {
            
            if(num == this.state.currentContainer)
            {
            return this.state.contents[this.state.currentContainer][index].content
            } else {
            return this.state.allContainer[num]
            }
        })

        if(this.state.contents[this.state.currentContainer][index].type === 'video/mp4')
        {
          this.setState({ allContainer, contentDuration: null, transitionSelected: this.state.contents[this.state.currentContainer][index].transition })
        } else {
          this.setState({ allContainer, contentDuration: this.state.contents[this.state.currentContainer][index].duration, transitionSelected: this.state.contents[this.state.currentContainer][index].transition })
        }
        
    }

    handleClose = () => {
        
      const currentSlideIndex = []
      if(this.state.selectedTemplate !== 'default'){
        const currentIndex = this.state.templateCollection.map(val => { return val.id }).indexOf(this.state.selectedTemplate)
        this.state.templateCollection[currentIndex].container.map((val, index) => {
          clearTimeout(timeout[index])
          timeout[index] = null
          currentSlideIndex.push(0)
        })
      } else {
          clearTimeout(timeout[0])
          timeout[0] = null
          currentSlideIndex.push(0)
      }
        

        this.setState({ openDialog: false, currentSlideIndex });
    };

    renderSortableItem = () => {
     if(this.state.contents[this.state.currentContainer])
     {
      return this.state.contents[this.state.currentContainer].map((val,index)=>{
          return(
            <SortableItem key={`item-${index}`} index={index} value={val} handleToggle={this.handleToggle} checked={this.state.checked} mediaCollection={this.state.mediaCollection} currentContainer={this.state.currentContainer} allContainer={this.state.allContainer}/>
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
                mediaData.push({ id: value.id, name: value.name, imageUrl: value.imageUrl, type: value.type })
              }
            })

          } else {
            mediaData.push({ id: '', name: '', imageUrl: '' })
          }
          
        })
        
        return templateData.map((value, index) => {

          if(mediaData[index].type === "video/mp4")
          {
            return (
              <Grid key={value.id} style={{height: value.height/4, width:value.width/4}} onClick={()=> { 
    
                  if(this.state.currentContainer !== index)
                  {
                    const currentContent = this.state.allContainer[index]
                    const currenIndex = this.state.contents[index].map(val => { return val.content }).indexOf(currentContent)
                    
                    if(currenIndex !== -1){
                      this.setState({ currentContainer: index, checked: [], transitionSelected: this.state.contents[index][currenIndex].transition, contentDuration: this.state.contents[index][currenIndex].duration });
                    } else {
                      this.setState({ currentContainer: index, checked: [] }) 
                    }
    
                  }
                  
                }} item>
                <Paper className={ this.state.currentContainer === index ? this.props.classes.container : null } square style={{height: '100%', width:'100%', display: 'flex', justifyContent: 'center'}} >
                  <video style={{ width: '100%' }}  autoPlay src={mediaData[index] ? mediaData[index].imageUrl : ''} type="video/mp4"></video>
                </Paper>
              </Grid> )
          } else {
            return (
              <Grid key={value.id} style={{height: value.height/4, width:value.width/4}} onClick={()=> { 
    
                  if(this.state.currentContainer !== index)
                  {
                    const currentContent = this.state.allContainer[index]
                    const currenIndex = this.state.contents[index].map(val => { return val.content }).indexOf(currentContent)
                    
                    if(currenIndex !== -1){
                      this.setState({ currentContainer: index, checked: [], transitionSelected: this.state.contents[index][currenIndex].transition, contentDuration: this.state.contents[index][currenIndex].duration });
                    } else {
                      this.setState({ currentContainer: index, checked: [] }) 
                    }
    
                  }
                  
                }} item>
                <Paper className={ this.state.currentContainer === index ? this.props.classes.container : null } square style={{height: '100%', width:'100%'}} >
                  <AutoFitImage imgSize="contain" imgSrc={mediaData[index] ? mediaData[index].imageUrl : ''} style={{/*..your style here..*/}}/>
                </Paper>
              </Grid> )
          }
        })

      } else {

        const mediaData = [];
        
        this.state.allContainer.map((value, index) => { 
          
          if(this.state.allContainer[index] && this.state.allContainer[index] !== '')
          {
            
            this.state.mediaCollection.map((val, mediaindex) => {
              if(val.id === this.state.allContainer[index])
              {
                mediaData.push({ id: val.id, name: val.name, imageUrl: val.imageUrl, type: val.type })
              }
            })
          } else {
            mediaData.push({ id: '', name: '', imageUrl: '' })
          }
          
        })
       
        if(mediaData[0] && mediaData[0].type === "video/mp4")
        {
          return (
            <Grid item>
              <Paper square
                style={{ height: 1920/4, width:1080/4, display: 'flex', justifyContent: 'center' }}
              >
                <video style={{ width: '100%' }}  autoPlay src={mediaData[0] ? mediaData[0].imageUrl : ''} type="video/mp4"></video>
              </Paper>
            </Grid>)
        } else {
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
        } else if (this.state.dialogOption === 'preview'){

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

            return(
              <DialogContent style={{ backgroundColor: '#efefef', paddingTop: 25 }}>
                {templateData.map((value, index) => {
                  return (
                      <Grid key={value.id} style={{height: value.height/4, width:value.width/4}} item>
                        {this.renderListAllCarouselItem( index, value.width/4, value.height/4 )}
                      </Grid>
                    )
                })}
              </DialogContent>
            )
            
          } else {
            return (
              <DialogContent style={{ backgroundColor: '#efefef', paddingTop: 25 }}>
                <Grid style={{height: 1920/4, width: 1080/4}} item>
                  {this.renderListAllCarouselItem(0, 1080/4, 1920/4)}
                </Grid>
              </DialogContent>)
          }

        }
    }

    renderListAllCarouselItem = (cIndex, itemWidth, itemHeight) => {
        return this.state.contents[cIndex].map((value, index) => { 

          const currentIndex = this.state.mediaCollection.map(val => { return val.id }).indexOf(value.content)

          if(value.transition === 'none'){
            return <Fade key={index} timeout={0} in={this.state.currentSlideIndex[cIndex] === index ? true : false} >
              <Paper square className={this.props.classes.mediaContainer} style={{ height: itemHeight, width:itemWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {this.state.mediaCollection[currentIndex].type === "video/mp4" ? <ReactPlayer width='100%' height="100%" loop={this.state.contents[cIndex].length > 1 ? false : true} playing={this.state.currentSlideIndex[cIndex] === index ? true : false} url={this.state.mediaCollection[currentIndex].imageUrl} onEnded={()=> this.toggleNextSlide(cIndex)}/>:<AutoFitImage imgSize="contain" imgSrc={this.state.mediaCollection[currentIndex].imageUrl}/>}
              </Paper>
            </Fade>
          } else if(value.transition === 'fade'){
            return <Fade key={index} timeout={1000} in={this.state.currentSlideIndex[cIndex] === index ? true : false} >
              <Paper square className={this.props.classes.mediaContainer} style={{ height: itemHeight, width:itemWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {this.state.mediaCollection[currentIndex].type === "video/mp4" ? <ReactPlayer width='100%' height="100%" loop={this.state.contents[cIndex].length > 1 ? false : true} playing={this.state.currentSlideIndex[cIndex] === index ? true : false} url={this.state.mediaCollection[currentIndex].imageUrl} onEnded={()=> this.toggleNextSlide(cIndex)}/>:<AutoFitImage imgSize="contain" imgSrc={this.state.mediaCollection[currentIndex].imageUrl}/>}
              </Paper>
            </Fade>
          } else if(value.transition === 'zoom'){
            return <Zoom key={index} timeout={1000} in={this.state.currentSlideIndex[cIndex] === index ? true : false} >
              <Paper square className={this.props.classes.mediaContainer} style={{ height: itemHeight, width:itemWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {this.state.mediaCollection[currentIndex].type === "video/mp4" ? <ReactPlayer width='100%' height="100%" loop={this.state.contents[cIndex].length > 1 ? false : true} playing={this.state.currentSlideIndex[cIndex] === index ? true : false} url={this.state.mediaCollection[currentIndex].imageUrl} onEnded={()=> this.toggleNextSlide(cIndex)}/>:<AutoFitImage imgSize="contain" imgSrc={this.state.mediaCollection[currentIndex].imageUrl}/>}
              </Paper>
            </Zoom>
          } else if(value.transition === 'grow'){
            return <Grow key={index} timeout={1000} in={this.state.currentSlideIndex[cIndex] === index ? true : false} >
              <Paper square className={this.props.classes.mediaContainer} style={{ height: itemHeight, width:itemWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              {this.state.mediaCollection[currentIndex].type === "video/mp4" ? <ReactPlayer width='100%' height="100%" loop={this.state.contents[cIndex].length > 1 ? false : true} playing={this.state.currentSlideIndex[cIndex] === index ? true : false} url={this.state.mediaCollection[currentIndex].imageUrl} onEnded={()=> this.toggleNextSlide(cIndex)}/>:<AutoFitImage imgSize="contain" imgSrc={this.state.mediaCollection[currentIndex].imageUrl}/>}
              </Paper>
            </Grow >
          }


         
        })
    }

    onAddMediaClick = selected => {

      const newContents = [...this.state.contents]
      selected.map((value, index) => {
        const currentIndex = newContents[this.state.currentContainer].map(val => { return val.content }).indexOf(value)
        const currentMediaIndex = this.state.mediaCollection.map(val => { return val.id }).indexOf(value)
        if(currentIndex === -1)
        {
          if(this.state.mediaCollection[currentMediaIndex].type === 'video/mp4')
          {
            newContents[this.state.currentContainer].push({ duration: null, transition: 'fade', content: value, type: this.state.mediaCollection[currentMediaIndex].type })
          } else {
            newContents[this.state.currentContainer].push({ duration: 10, transition: 'fade', content: value, type: this.state.mediaCollection[currentMediaIndex].type })
          }
         
        }
      })

      if(this.state.selectedTemplate !== 'default'){
        const allContainer = []
        this.state.templateCollection.map((value, index) => {
          if(value.id === this.state.selectedTemplate)
          {
            value.container.map((val, index) => {
              if(this.state.allContainer[index] == '' && index == this.state.currentContainer)
              {
                allContainer.push(newContents[this.state.currentContainer][0].content)
              } else {
                allContainer.push(this.state.allContainer[index])
              }
            })
            
          }
        })

        this.setState({ contents: newContents, openDialog: false, allContainer, contentDuration: newContents[this.state.currentContainer][0].duration, transitionSelected: newContents[this.state.currentContainer][0].transition })
      } else {
        const allContainer = []
        allContainer.push(newContents[this.state.currentContainer][0].content)

        this.setState({ contents: newContents, openDialog: false, allContainer, contentDuration: newContents[this.state.currentContainer][0].duration, transitionSelected: newContents[this.state.currentContainer][0].transition })
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
      
      this.setState({ selectedTemplate:'default', contents: [[]], campaignName: '', allContainer: [], currentContainer: 0, transitionSelected: 'fade', contentDuration: 0, currentSlideIndex: [0] })
    }

    onRemoveSortableListItem = () => {
      const { checked } = this.state;
      const newAllContainer = [...this.state.allContainer];
      const newContents = [...this.state.contents];

      checked.map(value => {

        const currentIndex = newContents[this.state.currentContainer].map(val => { return val.content }).indexOf(value)

        if (currentIndex !== -1) {
          newContents[this.state.currentContainer].splice(currentIndex, 1);
        } 

        if(newAllContainer[this.state.currentContainer] === value){
          newAllContainer[this.state.currentContainer] = ''
        }

      })

      this.setState({ contents: newContents, checked: [], allContainer: newAllContainer })
    }

    handleContentDurationChange = name => event => {

      const currentContent = this.state.allContainer[this.state.currentContainer]
      const currenIndex = this.state.contents[this.state.currentContainer].map(val => { return val.content }).indexOf(currentContent)

      if(currenIndex !== -1){
        if(event.target.value >= 0 ){
          this.state.contents[this.state.currentContainer][currenIndex].duration = event.target.value
          this.setState({ [name]: event.target.value });
        } else {
          this.state.contents[this.state.currentContainer][currenIndex].duration = 0
          this.setState({ [name]: 0 });
        }
      } else {
        if(event.target.value >= 0 ){
          this.setState({ [name]: event.target.value });
        } else {
          this.setState({ [name]: 0 });
        }
      }
      
    }

    handleTransitionChange = event => {
      const currentContent = this.state.allContainer[this.state.currentContainer]
      const currenIndex = this.state.contents[this.state.currentContainer].map(val => { return val.content }).indexOf(currentContent)
      
      if(currenIndex !== -1){
        this.state.contents[this.state.currentContainer][currenIndex].transition = event.target.value
        this.setState({ transitionSelected: event.target.value });
      } else {
        this.setState({ transitionSelected: event.target.value });
      }

    }
    
    renderTransition(){
      return(
        <Grid container>
          <Grid item xs={3} style={{ paddingRight: 5 }}>
            <TextField
              disabled={this.state.contents[this.state.currentContainer].length > 0 && this.state.contentDuration !== null? false:true}
              fullWidth 
              id="outlined-number"
              label="Duration"
              value={this.state.contentDuration === null ? 0 : this.state.contentDuration}
              InputProps={{ inputProps: { min: 0, max: 3600 } }}
              onChange={this.handleContentDurationChange('contentDuration')}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={9} style={{ paddingLeft: 5 }}>
            <form autoComplete="off">
              <FormControl margin="normal" fullWidth variant="outlined" >
                <InputLabel
                  htmlFor="outlined-age-simple"
                >
                  Transition
                </InputLabel>
                <Select
                  disabled={this.state.contents[this.state.currentContainer].length > 0 ? false:true}
                  value={this.state.transitionSelected}
                  onChange={this.handleTransitionChange}
                  input={
                    <OutlinedInput
                      fullWidth
                      labelWidth={100}
                      name="age"
                      id="outlined-age-simple"
                    />
                  }
                >
                  <MenuItem value="none">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="fade">Fade</MenuItem>
                  <MenuItem value="zoom">Zoom</MenuItem>
                  <MenuItem value="grow">Grow</MenuItem>
                </Select>
              </FormControl>
            </form>
          </Grid>
        </Grid>
      )
    }

    onPreviewClick = () => {
      this.setState({ 
        openDialog: true, 
        dialogOption: 'preview', 
        dialogTitle: 'Preview',
        dialogTitleVisible: false
      })
      
      this.shiftSlide()
    }

    toggleSlide = (index) => event =>{
      
      
      if(this.state.currentSlideIndex[index] < this.state.contents[index].length - 1){
        const newCurrentSlide = [...this.state.currentSlideIndex]
        newCurrentSlide[index] = newCurrentSlide[index] + 1
        this.setState({ currentSlideIndex: newCurrentSlide })

        const nextSlideIndex = newCurrentSlide[index]
        if(this.state.contents[index][nextSlideIndex].type !== 'video/mp4' ){
          this.loopSlide(index)
        }
      } else {
        const newCurrentSlide = [...this.state.currentSlideIndex]
        newCurrentSlide[index] = 0
        this.setState({ currentSlideIndex: newCurrentSlide })

        const nextSlideIndex = newCurrentSlide[index]
        if(this.state.contents[index][nextSlideIndex].type !== 'video/mp4' ){
          this.loopSlide(index)
        }
      }
     
    } 

    toggleNextSlide = (index) => {
      
      
      if(this.state.currentSlideIndex[index] < this.state.contents[index].length - 1){
        const newCurrentSlide = [...this.state.currentSlideIndex]
        newCurrentSlide[index] = newCurrentSlide[index] + 1
        this.setState({ currentSlideIndex: newCurrentSlide })

        const nextSlideIndex = newCurrentSlide[index]
        if(this.state.contents[index][nextSlideIndex].type !== 'video/mp4' ){
          this.loopNextSlide(index, nextSlideIndex)
        }
      } else {
        const newCurrentSlide = [...this.state.currentSlideIndex]
        newCurrentSlide[index] = 0
        this.setState({ currentSlideIndex: newCurrentSlide })

        const nextSlideIndex = newCurrentSlide[index]
        if(this.state.contents[index][nextSlideIndex].type !== 'video/mp4' ){
          this.loopNextSlide(index, nextSlideIndex)
        }
      }
     
    } 

    loopNextSlide = (index, nextSlideIndex) => {
      timeout[index] = this.props.setTimeout(this.toggleSlide(index, this.state.contents[index].length), this.state.contents[index][nextSlideIndex].duration * 1000)
    }

    loopSlide = (index) => {
      timeout[index] = this.props.setTimeout(this.toggleSlide(index, this.state.contents[index].length), this.state.contents[index][this.state.currentSlideIndex[index]].duration * 1000)
    }

    shiftSlide = () => {

      if(this.state.selectedTemplate !== 'default')
      {
        const currentIndex = this.state.templateCollection.map(val => { return val.id }).indexOf(this.state.selectedTemplate)
        this.state.templateCollection[currentIndex].container.map((val, index) => {
          if(this.state.contents[index].length > 1){
            if(this.state.contents[index][0].type !== 'video/mp4')
            {
              timeout[index] = this.props.setTimeout(this.toggleSlide(index), this.state.contents[index][this.state.currentSlideIndex[index]].duration * 1000)
            } 
          }
        })

      } else {
        if( this.state.contents[0].length > 1 && this.state.contents[0][0].type !== 'video/mp4'){
          timeout[0] = this.props.setTimeout(this.toggleSlide(0), this.state.contents[0][this.state.currentSlideIndex[0]].duration * 1000)
        }
      }
      
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
            >{this.state.dialogTitleVisible ? 
            <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                {this.state.dialogTitle}
            </DialogTitle> : <div></div>}
            
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
                    <Grid container>
                      {this.state.checked.length > 0 ? 
                        <Grid container>
                          <Grid item xs={9} style={{ paddingRight: 5 }}>
                            <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="primary" onClick={()=> this.setState({ openDialog: true, dialogOption: 'addMedia', dialogTitle: 'Add Media', dialogTitleVisible: true }) }>
                            Add File
                            </Button>
                          </Grid>
                          <Grid item xs={3} style={{ paddingLeft: 5 }}>
                            <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="secondary" onClick={()=> this.onRemoveSortableListItem() }>
                            Delete
                            </Button>
                          </Grid>
                          {this.renderTransition()}
                        </Grid>
                        : 
                        <Grid container>
                          <Grid item xs={12}>
                            <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="primary" onClick={()=> this.setState({ openDialog: true, dialogOption: 'addMedia', dialogTitle: 'Add Media', dialogTitleVisible: true }) }>
                            Add File
                            </Button>
                          </Grid>
                          {this.renderTransition()}
                        </Grid>
                        }
                    </Grid>
                    <Grid style={{ height:windowHeight - 205, position: 'relative', overflow: 'auto' }} item xs={12}>
                        {this.renderSortable()}
                    </Grid>
                </Grid>
                <Grid container alignItems="center" justify="center" style={{ backgroundColor: '#efefef' , height: windowHeight, padding: 10}} item xs={6}>
                    <Grid container spacing={0} direction="column" alignItems="center" justify="flex-start" style={{ height: 1920/4, width: 1080/4, backgroundColor: '#262626'}} >
                      {this.renderTemplate()}
                    </Grid>
                </Grid>
                <Grid style={{ height: windowHeight, padding: 10 }} item xs={3}>
                  <Grid container>
                    <Grid style={{ paddingRight: 5 }} item xs={6}>
                      <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="secondary" onClick={()=> this.handleSaveCampaign()}>
                      Save
                      </Button>
                    </Grid>
                    <Grid style={{ paddingLeft: 5 }} item xs={6}>
                      <Button fullWidth style={{ marginTop: 10 }} variant="outlined" color="default" onClick={()=> this.onPreviewClick()}>
                      Preview
                      </Button>
                    </Grid>
                  </Grid>
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
  
export default compose(
  withStyles(styles),
  ReactTimeout
)(CustomizedAddCampaign);
  