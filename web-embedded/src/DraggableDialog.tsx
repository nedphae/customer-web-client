import React, { useState, useMemo } from 'react';

import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie'
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import Draggable, { DraggableBounds, DraggableData, DraggableEvent } from 'react-draggable';
import IconButton from '@material-ui/core/IconButton';
import ForumIcon from '@material-ui/icons/Forum';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Typography from '@material-ui/core/Typography';
import { Popper } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    customHoverFocus: {
      backgroundColor: "lightblue",
      "&:hover, &.Mui-focusVisible": { backgroundColor: "yellow" }
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

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

interface DraggableOrNotProps extends PaperProps {
  bounds: DraggableBounds;
  handle: string;
  cancel: string
}

function DraggableOrNot(props: DraggableOrNotProps) {
  const { bounds, handle, cancel, ...other } = props;
  const draggable = 460 < document.documentElement.clientWidth;
  return (<>
    {draggable ? (<Draggable bounds={bounds} handle={handle} cancel={cancel} >
      <Paper {...other} />
    </Draggable>) : (
      <Paper {...other} />)}
  </>)
}

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

  const url = useMemo(() => {
    if (!accessParam.uid) {
      // 无 uid 生成一个，防止客服系统生成的cookie有跨域问题
      let uid = Cookies.get('xiaobai_uid')
      if (!uid) {
        uid = uuidv4().substring(0, 8);
      }
      accessParam.uid = uid;
    }
    Cookies.set('xiaobai_uid', accessParam.uid, { expires: 7 })
    return addParam(
      // 修改为服务地址
      customerHost ?? 'https://im.xbcs.top/chat/',
      accessParam
    );
  }, []);


  const handleClickOpen = () => {
    setOpen(true);
    setHidden(false);
  };

  const handleClose = () => {
    if (open) {
      setHidden(true);
    }
  };

  const width = `${Math.min(460, document.documentElement.clientWidth)}px`;

  // 使用 css in js 替换 
  return (
    <>
      <Button
        onClick={handleClickOpen}
        variant="contained"
        startIcon={<ForumIcon />}
        size="small"
      >
        客服
      </Button>
      <Popper open={open} hidden={hidden} anchorEl={null} style={{ zIndex: 100000 }}>
        <DraggableOrNot bounds={bounds} handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'} >
          {/* TODO 使用 CSS-in-JS */}
          <DialogTitle style={{ cursor: 'move', width: '100%', height: '44px', position: 'absolute', padding: '0px 0px', zIndex: 100001 }} id="draggable-dialog-title">
            <DialogActions>
              <IconButton onClick={handleClose} aria-label="delete" size="small">
                <ArrowDownwardIcon fontSize="inherit" />
              </IconButton>
            </DialogActions>
          </DialogTitle>
          {/* 添加 chatui 组件 */}
          <DialogContent style={{ height: '550px', width: width, padding: '0px 0px' }}>
            {/* ChatUI 聊天窗口 */}
            <iframe src={url} style={{ height: '550px', width: width, border: 'none', display: 'block' }} />
          </DialogContent>

        </DraggableOrNot>
      </Popper>
    </>
  );
}
