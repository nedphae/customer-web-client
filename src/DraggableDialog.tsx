import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import ForumIcon from '@material-ui/icons/Forum';
import Typography from '@material-ui/core/Typography';

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function DraggableDialog() {
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(true);

  const handleClickOpen = () => {
    setOpen(true);
    setHidden(false);
  };

  const handleClose = () => {
    if (open) {
      setHidden(true);
    }
  };

  // 使用 css in js 替换 
  return (
    <div>
      <IconButton color="primary" onClick={handleClickOpen} aria-label="add to shopping cart">
        <ForumIcon />
        <Typography variant="button" display="block" gutterBottom>
          联系客服
        </Typography>
      </IconButton>
      <Dialog
        hideBackdrop
        disableEnforceFocus
        style={{ position: 'initial' }}
        disableBackdropClick
        open={open}
        hidden={hidden}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        {/* TODO 使用 CSS-in-JS */}
        <DialogTitle style={{ cursor: 'move', width: '100%', height: '44px', position: 'absolute', padding: '0px 0px' }} id="draggable-dialog-title">
          <DialogActions style={{ width: '100%', padding: '0px 0px' }}>
          <Button onClick={handleClose} color="primary">
            关闭
          </Button>
        </DialogActions>
        </DialogTitle>
        {/* 添加 chatui 组件 */}
        <DialogContent style={{height: '550px', width: '460px', padding: '0px 0px' }}>
          {/* 样式冲突 TODO: 使用 Shadow DOM iframe */}
          <iframe src="http://localhost:8800/chat/?shuntId=c8abef94-0a9f-4ce9-97b1-679068f24f5d" style={{ height: '550px', width: '460px', border: 'none', display: 'block'}}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
