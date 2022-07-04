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
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import IconButton from '@material-ui/core/IconButton';
import ForumIcon from '@material-ui/icons/Forum';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { Popper } from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';
import useInterval from './hook/useInterval';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // customHoverFocus: {
    //   backgroundColor: "lightblue",
    //   "&:hover, &.Mui-focusVisible": { backgroundColor: "yellow" }
    // },
    button: {
      padding: theme.spacing(1),
      minWidth: "36px",
    },
    buttonText: {
      writingMode: "vertical-lr",
    },
  }));

export interface StyleDIY {
  buttonPosition?: string,
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  svgStr?: string;
}

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
  styleDIY?: StyleDIY;
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



interface DraggableOrNotProps extends PaperProps {
  handle: string;
  cancel: string
}

var isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
  isMobile = true;
}

function DraggableOrNot(props: DraggableOrNotProps) {
  const { handle, cancel, ...other } = props;
  const defaultPosition = { x: document.documentElement.clientWidth - 460 - 50, y: document.documentElement.clientHeight - 550 - 50 };
  const [position, setPosition] = useState(defaultPosition)
  const draggable = !isMobile; // 判断是否可以拖动

  const onStop = (e: DraggableEvent,
    data: DraggableData) => {// Viewport (wrapper)
      const documentElement = document.documentElement
      const wrapperHeight = (window.innerHeight || documentElement.clientHeight)
      const wrapperWidth = (window.innerWidth || documentElement.clientWidth)

      let x = data.x,y = data.y;

      if (data.y >= wrapperHeight - data.node.clientHeight) {
        y = wrapperHeight - data.node.clientHeight
      }
      if (data.y <= 0) {
        y = 0
      }
      if (data.x >= wrapperWidth - data.node.clientWidth) {
        x = wrapperWidth - data.node.clientWidth
      }
      if (data.x <= 0) {
        x = 0
      }
      const position = {
        x,
        y,
      }
      
      setPosition(position);
  };
  return (<>
    {draggable ? (<Draggable position={position} onStop={onStop} handle={handle} cancel={cancel} >
      <Paper {...other} />
    </Draggable>) : (
      <Paper {...other} />)}
  </>)
}

export default function DraggableDialog(accessParamProp: DraggableDialogProps) {
  const classes = useStyles();
  const { accessParam, customerHost, styleDIY } = accessParamProp;

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
    if (!accessParam.title) {
      accessParam.title = document.title;
    }
    Cookies.set('xiaobai_uid', accessParam.uid, { expires: 7 })
    return addParam(
      // 修改为服务地址
      customerHost ?? 'https://im.xbcs.top/chat/',
      accessParam
    );
  }, []);


  const handleClickOpen = (newWindow?: boolean) => {
    // 打开浏览器新窗口参数
    if (isMobile || newWindow) {
      // 是移动端就直接打开浏览器新窗口跳转页面
      window.open(url, '_blank');
    } else {
      setOpen(true);
      setHidden(false);
    }
  };

  const handleClose = () => {
    if (open) {
      setHidden(true);
    }
  };

  const width = `${Math.min(460, document.documentElement.clientWidth)}px`;

  window.xbWebAPI = { openChatWindow: (newWindow?: boolean) => { handleClickOpen(newWindow) } };

  useInterval(
    () => {
      // 每 2 分钟定时发送用户浏览轨迹
      if (accessParam.sc && accessParam.uid) {
        const trackUrl = 'https://im.xbcs.top/access/customer/track';
        // 统计跳转网页
        if (document.referrer) {
          const referrerUserTrack = {
            sc: accessParam.sc,
            uid: accessParam.uid,
            url: document.referrer,
            title: '外部来源',
          }
          fetch(trackUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify(referrerUserTrack)
          })
        }

        const userTrack = {
          sc: accessParam.sc,
          uid: accessParam.uid,
          url: window.location.href,
          title: document.title,
        }
        fetch(trackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify(userTrack)
        })
      }
    },
    2 * 60000,
    true
  );

  // 使用 css in js 替换 
  return (
    <>
      <Button
        variant="contained"
        className={classes.button}
        onClick={() => { handleClickOpen() }}
        size="small"
        component="div"
        style={{
          color: styleDIY?.textColor,
          backgroundColor: styleDIY?.backgroundColor,
        }}
      >
        <div>
          {styleDIY && styleDIY.svgStr ? (
            <img src={`data:image/svg+xml;utf8,${encodeURIComponent(styleDIY.svgStr)}`} />
          ) : (<ForumIcon />)}
          {styleDIY && styleDIY.text && (<div className={classes.buttonText}>
            {styleDIY.text}
          </div>)}
        </div>
      </Button>
      <Popper open={open} hidden={hidden} anchorEl={null} style={{ zIndex: 100000, height: 0, }}>
        <DraggableOrNot handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"],[class*="MuiButtonBase-root"]'} >
          {/* 使用 CSS-in-JS */}
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
