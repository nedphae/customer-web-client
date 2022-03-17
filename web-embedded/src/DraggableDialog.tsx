import React, { useState } from 'react';

import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable, { DraggableBounds, DraggableData, DraggableEvent } from 'react-draggable';
import IconButton from '@material-ui/core/IconButton';
import ForumIcon from '@material-ui/icons/Forum';
import Typography from '@material-ui/core/Typography';
import { Popper } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    popper: {
      // marginTop: theme.spacing(8),
      display: 'block',
      // visibility: 'visible',
    },
  }));

export interface AccessParam extends UrlParams {
  sc: string;
  uid?: string;
  staffId?: number;
  groupid?: number;
  robotShuntSwitch?: number;
  name?: string;
  email?: string;
  mobile?: string;
  vipLevel?: number;
  title?: string;
  referrer?: string;
}

export interface AccessParamProp {
  accessParam: AccessParam;
  customerHost?: string;
}

export interface DraggableDialogProps extends AccessParamProp {
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

export default function DraggableDialog(accessParamProp: DraggableDialogProps) {
  const classes = useStyles();
  const { accessParam, customerHost } = accessParamProp

  const bounds: DraggableBounds = {
    left: 0,
    top: 0,
    right: document.documentElement.clientWidth - 460,
    bottom: document.documentElement.clientHeight - 550,
  };
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  const url = addParam(
    // 修改为服务地址
    customerHost ?? 'http://localhost:8080/chat/',
    accessParam
  );

  const handleClickOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    <>
      <IconButton color="primary" onClick={handleClickOpen} aria-label="add to shopping cart">
        <ForumIcon />
        <Typography variant="button" display="block" gutterBottom>
          联系客服
        </Typography>
      </IconButton>
      <Popper open={open} hidden={hidden} anchorEl={null} style={{ zIndex: 99999 }}>
        <Draggable bounds={bounds} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'} >
          <Paper>
            {/* TODO 使用 CSS-in-JS */}
            <DialogTitle style={{ cursor: 'move', width: '100%', height: '44px', position: 'absolute', padding: '0px 0px' }} id="draggable-dialog-title">
              <DialogActions style={{ width: '100%', padding: '0px 0px' }}>
                <Button onClick={handleClose} color="primary">
                  关闭
                </Button>
              </DialogActions>
            </DialogTitle>
            {/* 添加 chatui 组件 */}
            <DialogContent style={{ height: '550px', width: '460px', padding: '0px 0px' }}>
              {/* ChatUI 聊天窗口 */}
              <iframe src={url} style={{ height: '550px', width: '460px', border: 'none', display: 'block' }} />
            </DialogContent>
          </Paper>
        </Draggable>
      </Popper>
    </>

  );
}
