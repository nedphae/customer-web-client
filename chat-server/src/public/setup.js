//TODO 获取一些配置, 先使用默认配置

// step 1: 注册客户信息
axios.post('/access/customer/register', {
  organizationId: 9491,
  title: '测试客服系统',
  referrer: 'localhost',
  uid: 'system-test',
  shuntId: '1',
  name: '客服测试',
  email: '666@666.com',
}).then((response) => {
  // step 2: 检查是否要直接转人工
  if (response) {
    const userId = response.userId
    const interaction = response.interaction
    if (interaction == 1) {
      // 机器人会话
    } else {
      // 客服会话

    }
  }
})


// step 3: 生成 chatsdk
const bot = new ChatSDK({
  config: {
    navbar: {
      title: '智能助理'
    },
    robot: {
      avatar: 'http://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg'
    },
    messages: [
      {
        type: 'text',
        content: {
          text: '智能助理为您服务，请问有什么可以帮您？'
        }
      }
    ]
  },
  // 机器人配置
  requests: {
    send: function (msg) {
      if (msg.type === 'text') {
        return {
          url: 'http://localhost:8707/bot/qa',
          data: {
            // 用户id
            u: 1,
            b: 1,
            q: msg.content.text,
          }
        };
      }
    }
  },
  // 转人工配置
  makeSocket({ ctx }) {
    // 连接 ws (socket.io)
    const ws = io("https://localhost:8700/socket.io/im/customer");
    // 排队提示消息的ID
    let queueMsgId;

    // 当收到消息时
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // 展示排队消息
      if (data.num) {
        // 如果界面上已经有排队消息则更新
        if (queueMsgId) {
          ctx.updateMessage(queueMsgId, {
            type: 'system',
            content: {
              text: `当前客服人数已满，您前面还有 ${data.num} 人`,
            },
          });
        } else {
          // 否则插入一条排队消息
          queueMsgId = '_queue_msg_id_';
          ctx.appendMessage({
            id: queueMsgId,
            type: 'system',
            content: {
              text: `当前客服人数已满，您前面还有 ${data.num} 人`,
            },
          });
        }
        return;
      }

      // 移除排队消息
      ctx.deleteMessage(queueMsgId);

      // 展示消息内容
      ctx.appendMessage({
        type: 'text',
        content: {
          text: data.text,
        },
        user: {
          avatar:
            'https://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg',
        },
      });
    };

    // 当结束服务的时候，提示用户
    ws.onclose = (e) => {
      console.log('wx close', e);
      ctx.appendMessage({
        type: 'system',
        content: {
          text: '人工客服已退出服务',
        },
      });
    };

    return {
      // 把用户的信息发给后端
      send(msg) {
        ws.send(JSON.stringify(msg));
      },
      close() {
        ws.close();
      },
    };
  },
});

bot.run();

const ctx = bot.getCtx();