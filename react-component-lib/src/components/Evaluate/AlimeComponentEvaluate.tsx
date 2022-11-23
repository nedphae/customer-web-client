import React, { useState } from 'react';

import { Card, CardTitle, CardContent, CardActions, Button, Input, RadioGroup } from 'ChatUI';

interface ConvInfo {
  readonly organizationId: number;
  readonly convId: number;
}

interface DataType {
  url: string;
  getConvInfo: () => ConvInfo;
}

interface EvaluateParam extends ConvInfo {
  evaluationType: number;
  evaluation: number;
  evaluationRemark: string;
  userResolvedStatus: number;
}

interface Util {
  // 封装 fetch 后的方法
  fetchData: (opts: { url: string; type?: string; data?: any }) => Promise<any>;

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
    scrollToEnd(opts?: { animated?: boolean; delay?: number }): void;

    // 隐藏快捷短语
    hideQuickReplies(): void;

    // 显示快捷短语
    showQuickReplies(): void;
  };
  // 工具函数
  util: Util;
};

interface ChatUIProp {
  data: DataType;
  ctx: Ctx;
  meta: any;
  msgId: string;
}

export default function AlimeComponentEvaluate(chatUIProp: ChatUIProp) {
  const { data, ctx, msgId } = chatUIProp;
  // const { t } = useTranslation();
  const t = window.i18n.t; 
  const [evaluate, setEvaluate] = useState<EvaluateParam>({
    ...data.getConvInfo(),
    evaluationType: 1,
    evaluation: 100,
    evaluationRemark: '',
    userResolvedStatus: 1,
  });

  function setValue(val: {}) {
    const v = Object.assign({}, evaluate, val);
    setEvaluate(v);
  }

  function submit() {
    ctx.util
      .fetchData({
        url: data.url,
        type: 'POST',
        data: evaluate,
      })
      .then(() => {
        ctx.deleteMessage(msgId);
        ctx.appendMessage({
          id: 'evaluate_result',
          type: 'system',
          content: {
            text: t('Thank you for your review'),
          },
        });
      });
  }

  function cancle() {
    ctx.deleteMessage(msgId);
  }

  const evaluationOptions = [
    { label: t('Very Satisfied'), value: 100 },
    { label: t('Satisfied'), value: 75 },
    { label: t('General'), value: 50 },
    { label: t('Dissatisfied'), value: 25 },
    { label: t('Very Dissatisfied'), value: 1 },
  ];

  const userResolvedOptions = [
    { label: t('Resolved'), value: 1 },
    { label: t('Not Resolved'), value: 2 },
  ];

  return (
    <Card size="xl">
      <CardTitle>{t('Evaluate')}</CardTitle>
      <CardContent>
        <div>
          <h5>{t('Satisfaction')} *</h5>
          <RadioGroup
            value={evaluate.evaluation}
            options={evaluationOptions}
            onChange={(val) => setValue({ evaluation: val })}
          />
          <h5>{t('Content of Evaluate')}</h5>
          <Input
            value={evaluate.evaluationRemark}
            onChange={(val: string) => setValue({ evaluationRemark: val })}
            placeholder={t('Please enter...')}
          />
          <h5>{t('Resolution Status')} *</h5>
          <RadioGroup
            value={evaluate.userResolvedStatus}
            options={userResolvedOptions}
            onChange={(val) => setValue({ userResolvedStatus: val })}
          />
        </div>
      </CardContent>
      <CardActions>
        <Button onClick={cancle}>{t('Cancel')}</Button>
        <Button color="primary" onClick={submit}>
          {t('Submit')}
        </Button>
      </CardActions>
    </Card>
  );
}
