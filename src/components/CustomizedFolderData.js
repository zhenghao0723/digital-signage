import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PreviewIcon from '@material-ui/icons/Visibility';
import { MovieRounded, SubdirectoryArrowLeft } from '@material-ui/icons'
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import firebase from "firebase";
import ReactPlayer from 'react-player'
import AutoFitImage from 'react-image-autofit-frame';

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, rows } = this.props;
    
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
          {rows.map(
            row => (
              <TableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false }
              >
                <Tooltip
                  title="Sort"
                  disableTouchListener={row.sortable ? false : true }
                  disableFocusListener={row.sortable ? false : true }
                  disableHoverListener={row.sortable ? false : true }
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={(orderBy === row.id && row.sortable) ? true : false }
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ),
            this,
          )}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = props => {
  const { numSelected, classes, onMoveAllClick, onDeleteAllClick, movefile } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        {numSelected > 0 ? (
          movefile ? <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Move">
                <IconButton aria-label="Move" onClick={onMoveAllClick}>
                <SubdirectoryArrowLeft />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
                <IconButton aria-label="Delete" onClick={onDeleteAllClick}>
                <DeleteIcon />
                </IconButton>
            </Tooltip> 
            </div> : 
            <Tooltip title="Delete">
                <IconButton aria-label="Delete" onClick={onDeleteAllClick}>
                <DeleteIcon />
                </IconButton>
            </Tooltip> 
        ) : (
          <div></div>
        )}
      </div>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  actionButtons: {
    display: 'flex'
  }
});

class EnhancedTable extends React.Component {

  state = {
    order: 'desc',
    orderBy: this.props.orderBy,
    selected: [],
    selectedId: '',
    page: 0,
    rowsPerPage: 5,
    openDialog: false,
    dialogTitle: 'No Title',
    dialogUrl: null,
    dialogType: null,
    dialogOption: '',
    selectedFileName: '',
    selectedFolder: this.props.selectedFolder
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState({ selected: this.props.data.map(n => n.id) })
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  bytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  onPreviewClick = (type, name, url) => {
    this.setState({
        openDialog: true,
        dialogTitle: name,
        dialogUrl: url,
        dialogType: type,
        dialogOption: 'preview'
    });
  }

  onEditClick = (id, name) => {
    this.setState({
        openDialog: true,
        dialogTitle: "Edit file",
        selectedId: id,
        dialogOption: 'edit',
        selectedFileName: name,
        selectedFolder: this.props.selectedFolder
    });
  }

  onDeleteClick = (id) => {
    this.setState({
        openDialog: true,
        dialogTitle: "Remove file",
        selectedId: id,
        dialogOption: 'delete'
    });
  }

  onDeleteAllClick = () => {
    this.setState({
        openDialog: true,
        dialogOption: 'deleteAll',
        dialogTitle: "Remove file",
    });
  }

  onMoveAllClick = () => {
    this.setState({
        openDialog: true,
        dialogOption: 'moveAll',
        dialogTitle: "Move file",
        selectedFolder: this.props.selectedFolder
    });
  }

  handleClose = () => {
    this.setState({ openDialog: false });
  };

  _handleEditFileNameChange = e => {
    this.setState({
        selectedFileName: e.target.value
    });
  }

  handleSelectionChange = event => {
    this.setState({ selectedFolder: event.target.value });
  };

  handleEditFile = () => {
    firebase.database().ref().child('/media/' + this.state.selectedId).update({ name: this.state.selectedFileName, folder: this.state.selectedFolder });

    if(this.state.selectedFolder !== this.props.selectedFolder){

      if(this.state.selectedFolder !== 'default'){
          firebase.database().ref().child('/media_folder/' + this.state.selectedFolder).child('total').transaction( total => {
          
          return total + 1;
          })
      }

      firebase.database().ref().child('/media_folder/' + this.props.selectedFolder).child('total').transaction( total => {
        
          return total - 1;
      })
    }

    this.setState({
        openDialog: false,
        selectedFolder: this.props.selectedFolder,
        selectedFileName: '',
        selected: []
    });

  }

  handleRemoveFile = () => {

    firebase.database().ref(this.props.dataName).child(this.state.selectedId).once('value', snapshot => {
      const item = snapshot.val();

      firebase.database().ref(this.props.dataName).child(this.state.selectedId).remove().then(() => {
        
        firebase.storage().ref().child(item.fullPath).delete()

      })
    })

    this.setState({
        openDialog: false,
        selectedId: '',
        selected: []
    });
    
  }

  handleRemoveAllFile = () => {
    this.state.selected.forEach(items => {
        firebase.database().ref(this.props.dataName).child(items).once('value', snapshot => {
        const item = snapshot.val();

        firebase.database().ref(this.props.dataName).child(items).remove().then(() => {
            
            firebase.storage().ref().child(item.fullPath).delete()

        })
        })
    })

    this.setState({
        openDialog: false,
        selected: []
    });
  }

  handleMoveAllFile = () => {
    
    if(this.state.selectedFolder !== this.props.selectedFolder){
      this.state.selected.forEach(items => {
        firebase.database().ref().child('/media/' + items).update({ folder: this.state.selectedFolder });
  
        if(this.state.selectedFolder !== 'default'){
          firebase.database().ref().child('/media_folder/' + this.state.selectedFolder).child('total').transaction( total => {
            
            return total + 1;
          })
        }

        firebase.database().ref().child('/media_folder/' + this.props.selectedFolder).child('total').transaction( total => {
          
          return total - 1;
        })
        
      })
    }

    this.setState({
        openDialog: false,
        selectedFolder: 'default',
        selected: []
    });

  }

  renderDialog = () => {

    if(this.state.dialogOption === 'preview'){
        return(
          <DialogContent style={{ maxWidth: 500, maxHeight: 500, marginTop: 20 }}>
              { this.state.dialogType === 'video/mp4' ? <ReactPlayer width='100%' height="100%"  playing={true} url={this.state.dialogUrl}></ReactPlayer> : <AutoFitImage frameWidth={450 + "px"} frameHeight={450 + "px"} imgSize="contain" imgSrc={this.state.dialogUrl} /> }
          </DialogContent>
        )
    } 

    else if(this.state.dialogOption === 'edit'){
        return(
            <div>
            <DialogContent>
                <TextField
                    margin="dense"
                    id="name"
                    label="File Name"
                    fullWidth
                    value={this.state.selectedFileName} 
                    onChange={this._handleEditFileNameChange}
                />
                <FormControl style={{ marginTop: 20 }} fullWidth variant="outlined" noValidate autoComplete="off" >
                    <InputLabel
                        ref={ref => {
                        this.InputLabelRef = ref;
                        }}
                        htmlFor="outlined-age-simple"
                    >
                        Folder
                    </InputLabel>
                    <Select
                        value={this.state.selectedFolder}
                        onChange={this.handleSelectionChange}
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
                        {this.props.folderCollection.map(n => {
                            return(
                                <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                            )
                        })}

                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleEditFile} color="primary">
                Submit
                </Button>
                <Button onClick={this.handleClose} color="default">
                Cancel
                </Button>
            </DialogActions>
            </div>
        )
    }

    else if(this.state.dialogOption === 'delete'){
        return(
            <div>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    Are you sure you want to permanently delete these file?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleRemoveFile} color="default">
                    Yes
                    </Button>
                    <Button color="primary" onClick={this.handleClose}>
                    No
                    </Button>
                </DialogActions>
            </div>
        )
    }

    else if(this.state.dialogOption === 'deleteAll'){
        return(
            <div>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    Are you sure you want to permanently delete these file?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleRemoveAllFile} color="default">
                    Yes
                    </Button>
                    <Button color="primary" onClick={this.handleClose}>
                    No
                    </Button>
                </DialogActions>
            </div>
        )
    }

    else if(this.state.dialogOption === 'moveAll'){
        return(
            <div>
            <DialogContent style={{ width: 200}}>
                <FormControl style={{ marginTop: 20 }} fullWidth variant="outlined" noValidate autoComplete="off">
                    <InputLabel
                    ref={ref => {
                        this.InputLabelRef = ref;
                    }}
                    htmlFor="outlined-age-simple"
                    >
                    Folder
                    </InputLabel>
                    <Select
                    value={this.state.selectedFolder}
                    onChange={this.handleSelectionChange}
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
                    {this.props.folderCollection.map(n => {
                        return(
                        <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                        )
                    })}

                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.handleMoveAllFile} color="primary">
                Yes
                </Button>
                <Button onClick={this.handleClose} color="primary" autoFocus>
                No
                </Button>
            </DialogActions>
            </div>
        )
    }
      
  }

  render() {
    const { classes, rows, data } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <div className={classes.root}>
        <Dialog
            onClose={this.handleClose}
            aria-labelledby="customized-dialog-title"
            open={this.state.openDialog}
          >
          {this.state.dialogOption  !== 'preview' ?
              <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                {this.state.dialogTitle}
              </DialogTitle> : <div></div>
            }
          {this.renderDialog()}
        </Dialog>
        <EnhancedTableToolbar numSelected={selected.length} onDeleteAllClick={this.onDeleteAllClick} onMoveAllClick={this.onMoveAllClick} movefile={this.props.movefile}/>
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              rows={rows}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                    >
                      <TableCell onClick={event => this.handleClick(event, n.id)} padding="checkbox">
                        <Checkbox checked={isSelected} />
                      </TableCell>

                      {rows.map(value => {

                          if(value.thumbnail){
                            return(
                                <TableCell key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">
                                    {(n.type === 'video/mp4') ? <div style={{ height: 50}} ><MovieRounded style={{ fontSize: 50, color: "#b4b4b4" }}/></div> : <img style={{ height: 50}} src={n.imageUrl} alt=""/>}
                                </TableCell>
                            )
                          } 
                          
                          else if(value.action)
                          {
                              if(this.props.preview)
                              {
                                return(
                                    <TableCell key={value.id} align="left" padding="none" >
                                        <div className={classes.actionButtons}>
                                            <IconButton color="primary" onClick={() => this.onPreviewClick(n.type, n.name, n.imageUrl) }>
                                                <PreviewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => this.onEditClick(n.id, n.name) }>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => this.onDeleteClick(n.id) }>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                )
                              } else {
                                return(
                                    <TableCell key={value.id} align="left" padding="none" >
                                        <div className={classes.actionButtons}>
                                            <IconButton onClick={() => this.onEditClick(n.id, n.name) }>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => this.onDeleteClick(n.id) }>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                )
                              }
                            
                          }

                          else if(value.id === 'size')
                          {
                            return(
                                <TableCell key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">{this.bytesToSize(n[value.id])}</TableCell>
                              )
                          }

                          else if(value.id === 'created')
                          {
                            return(
                                <TableCell key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">{new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(n[value.id])}</TableCell>
                              )
                          }
                          
                          else {
                            return(
                                <TableCell key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">{n[value.id]}</TableCell>
                              )
                          }
                          
                      })}
                     
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </div>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);