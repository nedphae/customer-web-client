import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';

import root from 'react-shadow/styled-components';
// css for chatui
const styles = require('!!raw-loader!@chatui/core/dist/index.css');

import ChatUI from './ChatUI';

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function DraggableDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fuckAli = String(styles.default).replaceAll(':root', ':host')

  return (
    <div>
      <IconButton color="primary" onClick={handleClickOpen} aria-label="add to shopping cart">
        <AddShoppingCartIcon />
      </IconButton>
      <Dialog
        hideBackdrop
        disableEnforceFocus
        style={{ position: 'initial' }}
        disableBackdropClick
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          机器人标题
        </DialogTitle>
        {/* 添加 chatui 组件 */}
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
          {/* 样式冲突 TODO: 使用 Shadow DOM */}
          <root.div className="quote">
            <ChatUI /> 
            <style type="text/css">{fuckAli}</style>
          </root.div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
