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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import firebase from "firebase";
import CloseIcon from '@material-ui/icons/Close';
import AppBar from '@material-ui/core/AppBar';
import Slide from '@material-ui/core/Slide';
import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

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
  const { numSelected, classes, onDeleteAllClick, movefile, onAddCampaignClick } = props;

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
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  AppBar: {
    boxShadow: 'none',
    borderBottom: '1px solid #e8e8e8',
  }
});

function TabContainer({ children, dir }) {
  return (
    <div dir={dir}>
      {children}
    </div>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

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
    folderId: '',
    folderName: '',
    dialogOption: '',
    selectedFileName: '',
    dialogFullscreen: false,
    value: 0
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

  onAddCampaignClick = () => {
    
  }

  onEditClick = (id) => {
    
  }

  onDeleteClick = (id) => {
    this.setState({
        openDialog: true,
        dialogTitle: "Remove Campaign",
        selectedId: id,
        dialogOption: 'delete',
        dialogFullscreen: false
    });
  }

  onPreviewClick = (id) => {

  }

  onDeleteAllClick = () => {
    this.setState({
        openDialog: true,
        dialogOption: 'deleteAll',
        dialogTitle: "Remove Campaign",
        dialogFullscreen: false
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
    firebase.database().ref().child('/media_folder/' + this.state.selectedId).update({ name: this.state.selectedFileName });

    this.setState({
        openDialog: false,
        selectedFolder: 'default',
        selectedFileName: '',
        selected: []
    });
  }

  handleRemoveFile = () => {

    firebase.database().ref(this.props.dataName).child(this.state.selectedId).remove()

    this.setState({
      openDialog: false,
      selectedId: '',
      selected: []
    });
    
  }

  handleRemoveAllFile = () => {

    this.state.selected.forEach(items => {
        firebase.database().ref(this.props.dataName).child(items).remove()
    })

    this.setState({
      openDialog: false,
      selected: []
    });
  }

  renderDialog = () => {

    if(this.state.dialogOption === 'delete'){
        return(
            <div>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    Are you sure you want to permanently delete these campaign?
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
                    Are you sure you want to permanently delete these campaign?
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

  }

  handleTabsChange = (event, value) => {
    this.setState({ value });
  };

  handleTabsChangeIndex = index => {
    this.setState({ value: index });
  };
  
  render() {
    const { classes, rows, data, theme } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <div className={classes.root}>
        <AppBar className={classes.AppBar} position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleTabsChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab disableRipple label="Template List" />
            <Tab disableRipple label="Create Template" />
          </Tabs>
        </AppBar>
        <Dialog
            fullScreen={this.state.dialogFullscreen}
            onClose={this.handleClose}
            aria-labelledby="customized-dialog-title"
            open={this.state.openDialog}
            maxWidth='xl'
            TransitionComponent={Transition}
          >
          {this.state.dialogFullscreen ? 
            <AppBar className={classes.appBar}>
              <Toolbar>
                <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" color="inherit" className={classes.flex}>
                  {this.state.dialogTitle}
                </Typography>
                <Button color="inherit" onClick={this.handleClose}>
                  save
                </Button>
              </Toolbar> 
            </AppBar>: 
            <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
              {this.state.dialogTitle}
            </DialogTitle> 
          }
          {this.renderDialog()}
        </Dialog>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          //onChangeIndex={this.handleTabsChangeIndex}
        >
          <TabContainer dir={theme.direction}>
            <EnhancedTableToolbar numSelected={selected.length} onDeleteAllClick={this.onDeleteAllClick} movefile={this.props.movefile} onAddCampaignClick={this.onAddCampaignClick}/>
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

                              if(value.action)
                              {
                                return(
                                  <TableCell key={value.id} align="left" padding="none" >
                                      <div className={classes.actionButtons}>
                                          <IconButton color={n.total > 0 ? "primary" : "default"} disabled={n.total > 0 ? false : true} onClick={() => this.onPreviewClick(n.id) }>
                                              <PreviewIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton onClick={() => this.onEditClick(n.id) }>
                                              <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton onClick={() => this.onDeleteClick(n.id) }>
                                              <DeleteIcon fontSize="small" />
                                          </IconButton>
                                      </div>
                                  </TableCell>
                                )
                                
                              }

                              else if(value.id === 'created')
                              {
                                return(
                                    <TableCell key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">{new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(n[value.id])}</TableCell>
                                  )
                              }

                              else if(value.id === 'template')
                              {
                                return(
                                    <TableCell  key={value.id} onClick={event => this.handleClick(event, n.id)} align="left" padding="default">{n.template_name}</TableCell>
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
          </TabContainer>
          <TabContainer dir={theme.direction}>
              
          </TabContainer>
        </SwipeableViews>
      </div>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(EnhancedTable);