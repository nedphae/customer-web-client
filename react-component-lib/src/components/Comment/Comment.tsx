import React, { useState } from 'react';

import { Card, CardTitle, CardContent, CardActions, Button, Input, toast } from '@chatui/core';

interface CommentParam {
  name: string;
  mobile: string;
  email: string;
  message: string;
}

interface Util {
  // 封装 fetch 后的方法
  fetchData: (opts: {
    url: string;
    type?: string;
    data: any;
  }) => Promise<any>;

  // 打开新窗口
  openWindow(url: string): void;

  // 关闭窗口
  popWindow(): void;
}

interface Message {
  // 类型
  type: string;
  // 内容
  content: any;
  // ID
  id?: string;
  // 创建时间
  createdAt?: number;
  // 发送者信息
  user?: {
    avatar: string;
  };
  // 显示位置
  position?: 'left' | 'right' | 'center';
  // 是否显示时间
  hasTime?: boolean;
}

type Ctx = {
  // 添加消息
  appendMessage(msg: Message): void;

  // 发送消息
  postMessage(msg: Message): void;

  // 更新消息
  updateMessage(msgId: string, msg: Message): void;

  // 删除消息
  deleteMessage(msgId: string): void;

  // 埋点方法
  log: {
    // 点击埋点
    click(params: any, logParams: any): void;

    // 曝光埋点
    expo(params: any, logParams: any): void;
  };

  // 界面相关的方法
  ui: {
    // 滚动消息列表到底部
    scrollToEnd(opts?: { animated?: boolean; delay?:  number; }): void;

    // 隐藏快捷短语
    hideQuickReplies(): void;

    // 显示快捷短语
    showQuickReplies(): void;
  };
  // 工具函数
  util: Util;
};

interface CommentProp {
  data: any;
  ctx: Ctx;
  meta: any;
}
// 代码分割，单独打包
// import("./Comment").then(comment => {
//     console.log(comment);
//   });
export default function Comment(commentProp: CommentProp) {
  // console.info(commentProp);
  // debugger;
  const { data, ctx, meta } = commentProp;
  const [comment, setComment] = useState<CommentParam>({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  function setValue(val: {}) {
    const v = Object.assign({}, comment, val);
    setComment(v);
  }

  function submit() {
    if (comment && comment.name && comment.mobile && comment.message) {
      ctx.util.fetchData({
        url: '',
        type: 'POST',
        data: comment,
      }).then(() => {
        ctx.deleteMessage('leave_comment');
        ctx.appendMessage({
          id: 'leave_comment_result',
          type: 'system',
          content: {
            text: '留言提交成功',
          },
        });
      });
    } else {
      toast.fail('姓名 手机 留言 不能为空');
    }
  }

  function cancle(){
    ctx.deleteMessage('leave_comment');
  }

  return (
    <Card size="xl">
      <CardTitle>留言</CardTitle>
      <CardContent>
        <div>
          <h5>姓名 *</h5>
          <Input value={comment.name} onChange={(val) => setValue({ name: val })} placeholder="请输入..." />
          <h5>手机 *</h5>
          <Input value={comment.mobile} onChange={(val) => setValue({ mobile: val })} placeholder="请输入..." />
          <h5>邮箱</h5>
          <Input value={comment.email} onChange={(val) => setValue({ email: val })} placeholder="请输入..." />
          <h5>留言 *</h5>
          <Input
            rows={3}
            maxLength={120}
            value={comment.message}
            onChange={(val) => setValue({ message: val })}
            placeholder="请输入..."
          />
        </div>
      </CardContent>
      <CardActions>
        <Button onClick={cancle}>取消</Button>
        <Button color="primary" onClick={submit}>提交</Button>
      </CardActions>
    </Card>
  );
}
