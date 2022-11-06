import React, { useState, useLayoutEffect } from 'react';

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

interface EvaluateConfig {
  title?: string;
  evaluationOptionsText?: string;
  evaluationOptions: {
    eval_100?: string;
    eval_75?: string;
    eval_50?: string;
    eval_25?: string;
    eval_1?: string;
  };
  userResolvedOptions: {
    status_1?: string;
    status_2?: string;
  };
  evaluationRemarkText?: string;
  userResolvedStatusText?: string;
  placeholder?: string;
  cancleBtnText?: string;
  submitBtnText?: string;
  thanks?: string;
}

const defaultConfig = {
  "title": "评价",
  "evaluationOptionsText": "满意度",
  "evaluationOptions": {
    "eval_100": "非常满意",
    "eval_75": "满意",
    "eval_50": "一般",
    "eval_25": "不满意",
    "eval_1": "非常不满意"
  },
  "userResolvedOptions": {
      "status_1": "已解决",
      "status_2": "未解决"
  },
  "evaluationRemarkText": "评价内容",
  "userResolvedStatusText": "解决状态",
  "placeholder": "请输入...",
  "cancleBtnText": "取消",
  "submitBtnText": "提交",
  "thanks": "谢谢您的评价"
}

export default function AlimeComponentEvaluate(chatUIProp: ChatUIProp) {
  const { data, ctx, msgId } = chatUIProp;
  const [evaluateConfig, setEvaluateConfig] = useState<EvaluateConfig>(defaultConfig);
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
            text: evaluateConfig.thanks ?? '谢谢您的评价',
          },
        });
      });
  }

  function cancle() {
    ctx.deleteMessage(msgId);
  }

  useLayoutEffect(() => {
    ctx.util.fetchData({
      url: `/access/customer/props/evaluate?oid=${evaluate.organizationId}`,
      type: 'GET',
    }).then((data) => {
      const json = data?.value
      if (json) {
        setEvaluateConfig(JSON.parse(json));
      }
    });
  }, []);

  const evaluationOptions = [
    { label: evaluateConfig.evaluationOptions.eval_100, value: 100 },
    { label: evaluateConfig.evaluationOptions.eval_75, value: 75 },
    { label: evaluateConfig.evaluationOptions.eval_50, value: 50 },
    { label: evaluateConfig.evaluationOptions.eval_25, value: 25 },
    { label: evaluateConfig.evaluationOptions.eval_1, value: 1 },
  ];

  const userResolvedOptions = [
    { label: evaluateConfig.userResolvedOptions.status_1, value: 1 },
    { label: evaluateConfig.userResolvedOptions.status_2, value: 2 },
  ];

  return (
    <Card size="xl">
      <CardTitle>{evaluateConfig.title}</CardTitle>
      <CardContent>
        <div>
          <h5>{evaluateConfig.evaluationOptionsText} *</h5>
          <RadioGroup
            value={evaluate.evaluation}
            options={evaluationOptions}
            onChange={(val) => setValue({ evaluation: val })}
          />
          <h5>{evaluateConfig.evaluationRemarkText}</h5>
          <Input
            value={evaluate.evaluationRemark}
            onChange={(val: string) => setValue({ evaluationRemark: val })}
            placeholder={evaluateConfig.placeholder}
          />
          <h5>{evaluateConfig.userResolvedStatusText} *</h5>
          <RadioGroup
            value={evaluate.userResolvedStatus}
            options={userResolvedOptions}
            onChange={(val) => setValue({ userResolvedStatus: val })}
          />
        </div>
      </CardContent>
      <CardActions>
        <Button onClick={cancle}>{evaluateConfig.cancleBtnText}</Button>
        <Button color="primary" onClick={submit}>
          {evaluateConfig.submitBtnText}
        </Button>
      </CardActions>
    </Card>
  );
}
