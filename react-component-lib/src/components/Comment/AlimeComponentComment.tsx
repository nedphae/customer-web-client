import React, { useState } from 'react';

import { Card, CardTitle, CardContent, CardActions, Button, Input, toast } from 'ChatUI';

interface UserInfo {
  readonly organizationId: number;
  readonly shuntId: number;
  readonly userId: number;
  readonly uid: string,
  readonly referrer?: string,
  readonly title?: string,
}

interface DataType {
  url: string;
  getUserInfo: () => UserInfo;
}

interface CommentParam extends UserInfo {
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
    data?: any;
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
    scrollToEnd(opts?: { animated?: boolean; delay?: number; }): void;

    // 隐藏快捷短语
    hideQuickReplies(): void;

    // 显示快捷短语
    showQuickReplies(): void;
  };
  // 工具函数
  util: Util;
};

interface CommentProp {
  data: DataType;
  ctx: Ctx;
  meta: any;
  msgId: string;
}

interface CommentConfig {
  title?: string;
  nameText?: string;
  mobileText?: string;
  emailText?: string;
  messageText?: string;
  placeholder?: string;
  cancleBtnText?: string;
  submitBtnText?: string;
  successMsg?: string;
  failMsg?: string;
}

export default function AlimeComponentComment(commentProp: CommentProp) {
  const { data, ctx, msgId } = commentProp;
  // const { t } = useTranslation();
  const t = window.i18n.t; 
  const [comment, setComment] = useState<CommentParam>({
    ...data.getUserInfo(),
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
    if (comment && comment.name && (comment.mobile || comment.email) && comment.message) {
      ctx.util.fetchData({
        url: data.url,
        type: 'POST',
        data: comment,
      }).then(() => {
        ctx.deleteMessage(msgId);
        ctx.appendMessage({
          id: 'leave_comment_result',
          type: 'system',
          content: {
            text: t('Comment submitted successfully'),
          },
        });
      });
    } else {
      toast.fail(t('Name and Comment cannot be empty, Mobile/Email Please fill in at least one item'));
    }
  }

  function cancle() {
    ctx.deleteMessage(msgId);
  }

  return (
    <Card size="xl">
      <CardTitle>{t('Comment')}</CardTitle>
      <CardContent>
        <div>
          {/* 姓名 */}
          <h5>{t('Name')} *</h5>
          <Input value={comment.name} onChange={(val: string) => setValue({ name: val })} placeholder={t('Please enter...')} />
          {/* 手机 */}
          <h5>{t('Phone')} *</h5>
          <Input value={comment.mobile} onChange={(val: string) => setValue({ mobile: val })} placeholder={t('Please enter...')} />
          {/* 邮箱 */}
          <h5>{t('Email')} *</h5>
          <Input value={comment.email} onChange={(val: string) => setValue({ email: val })} placeholder={t('Please enter...')} />
          {/* 留言 */}
          <h5>{t('Comment')} *</h5>
          <Input
            rows={3}
            maxLength={120}
            value={comment.message}
            onChange={(val: string) => setValue({ message: val })}
            placeholder={t('Please enter...')}
          />
        </div>
      </CardContent>
      <CardActions>
        <Button onClick={cancle}>{t('Cancel')}</Button>
        <Button color="primary" onClick={submit}>{t('Submit')}</Button>
      </CardActions>
    </Card>
  );
}
