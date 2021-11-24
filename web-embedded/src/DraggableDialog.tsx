import React, { useState } from 'react';

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

export interface AccessParam extends UrlParams {
  shuntId: string;
  uid: string;
  staffId: number;
  groupid: number;
  robotShuntSwitch: number;
  name: string;
  email: string;
  mobile: string;
  vipLevel: number;
  title?: string;
  referrer?: string;
}

export interface AccessParamProp {
  accessParam: AccessParam
  customerHost?: string;
}

interface UrlParams {
  [key: string]: string | number | boolean | undefined;
}

const addParam = (uri: string, params: UrlParams) => {
  let str = '';
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value) {
      if (str !== '') {
        str += '&';
      }
      str += `${key}=${encodeURIComponent(value)}`;
    }
  });
  return `${uri}?${str}`;
};

export default function DraggableDialog(accessParamProp: AccessParamProp) {
  const { accessParam, customerHost } = accessParamProp
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  const url = addParam(
    // 修改为服务地址
    customerHost ?? 'http://localhost:8800/chat/',
    accessParam
  );

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
          {/* ChatUI 聊天窗口 */}
          <iframe src={url} style={{ height: '550px', width: '460px', border: 'none', display: 'block'}}/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
