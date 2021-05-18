//TODO 获取一些配置, 先使用默认配置

// step 0: 根据 配置的接待组 uuid 获取接待组信息

function getRequest(body) {
  return {
    header: { mid : uuidv4().substr(0, 8)},
    // message
    body,
  }
}

let ctx

// step 1: 注册客户信息
axios.post('/access/customer/register', {
  title: '测试客服系统',
  referrer: 'localhost',
  uid: 'system-test',
  shuntId: userInfo.shuntId,
  name: '客服测试',
  email: '666@666.com',
}).then((response) => {
  // step 2: 检查是否要直接转人工
  const data = response.data
  if (data && data.errorCode === undefined ) {
    const userId = data.userId
    const interaction = data.interaction
    let staffId = data.staffId
    let queue
    let lastMsgId = '0'

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
        ],
        loadMoreText: '点击加载更多',
      },
      // 机器人配置
      requests: {
        history: function () {
          return {
            url: '/message/history?lastMsgId=' + lastMsgId + '&pageSize=20',
          };
        },
        send: function (msg) {
          if (msg.type === 'text') {
            return {
              url: '/bot/qa',
              data: {
                // 用户id
                u: userId,
                b: staffId,
                q: msg.content.text,
              }
            };
          }
        }
      },

      handlers: {
        /**
         *
         * 解析请求返回的数据
         * @param {object} res - 请求返回的数据
         * @param {object} requestType - 请求类型
         * @return {array}
         */
        parseResponse: function (res, requestType) {
          // 根据 requestType 处理数据
          if (requestType === 'history' && res.body) {
            // 用 isv 消息解析器处理数据
            return isvParser({ data: res });
          }

          if (requestType === 'send' && res.body) {
            // 更新 用户 message ID
            if (lastMsgId === '0') {
              lastMsgId = res.body._id
            }
          }
    
          // 不需要处理的数据直接返回
          return res;
        },
      },
    
      // 转人工配置
      makeSocket({ ctx }) {
        // 连接 ws (socket.io)
        const socket = io("/im/customer", 
        {
          query: {
            token: 'customer',
          },
          reconnection: true,
        });
        // 排队提示消息的ID
        let queueMsgId;

        function showQueue(queue) {
          // 展示排队消息
          if (queue) {
            // 如果界面上已经有排队消息则更新
            if (queueMsgId) {
              ctx.updateMessage(queueMsgId, {
                type: 'system',
                content: {
                  text: `当前客服人数已满，您前面还有 ${queue} 人`,
                },
              });
            } else {
              // 否则插入一条排队消息
              queueMsgId = '_queue_msg_id_';
              ctx.appendMessage({
                id: queueMsgId,
                type: 'system',
                content: {
                  text: `当前客服人数已满，您前面还有 ${queue} 人`,
                },
              });
            }
          }
        }
      
        socket.on("connect", () => {
          let info
          if (interaction == 1) {
            info = {
              organizationId: data.organizationId,
              conversationId: data.conversationId,
              staffId: data.staffId,
              userId: data.userId,
            }
          } else {
            info = {
              organizationId: data.organizationId,
              userId: data.userId,
            }
          }

          const request  = getRequest(info)
          socket.emit('status/register', request, (response) => {
            const conversationView = response.body;
            queue = conversationView.queue;
            showQueue(queue);
            staffId = conversationView.staffId;
          });
        })

        // 接受消息
        socket.on('msg/sync', (request, cb) => {
          // 当收到消息时
          const message = request.body.message;
          const msgId = message.seqId.toString();
          const content = message.content;
          let chatUIMessage;
          switch(content.contentType) {
            case 'TEXT': {
              chatUIMessage = {
                _id: msgId,
                type: 'text',
                content: {
                  text: content.textContent.text,
                },
                user: {
                  avatar:
                    'https://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg',
                },
              }
              break;
            }
            case 'IMAGE': {
              //TODO
            }
            case 'SYS': {
              const msg = JSON.parse(content.textContent.text)
              showQueue(msg.queue);
              if (msg.staffId) {
                staffId = msg.staffId
                ctx.deleteMessage(queueMsgId);
                // TODO: 获取 客服信息
              }
            }
          }
          
          // 展示消息内容
          ctx.appendMessage(chatUIMessage);
          // TODO 调用回调通知消息收到
          // cb();
        })
      
        // 当结束服务的时候，提示用户
        socket.on('close',(e) => {
          console.log('wx close', e);
          ctx.appendMessage({
            type: 'system',
            content: {
              text: '连接断开 人工客服已退出服务',
            },
          });
        });
      
        return {
          // 把用户的信息发给后端
          send(msg) {
            // switch msg.content.type
            const content = {
              contentType: 'TEXT',
              textContent: {
                text: msg.content.text,
              },
            }
            const request = getRequest(
              // message
              {
              uuid: uuidv4().substr(0, 8),
              to: staffId,
              type: 1,
              creatorType: 2,
              content,
            })
            socket.emit('msg/send', request, (response) => {
              const oldId = msg._id
              msg._id = response.body.seqId.toString();
              ctx.updateMessage(oldId, msg)
            })
          },
          close() {
            socket.close();
          },
        };
      },
    });

    bot.run();

    ctx = bot.getCtx();
    if (interaction == 1) {
      // 客服会话
      ctx.appendMessage({
        type: 'cmd',
        content: {
          code: 'agent_join'
        }
      })

    } else {
      // 机器人会话
      ctx.appendMessage({
        type: 'cmd',
        content: {
          code: 'agent_entrance_display'
        }
      })
    }
  }
})
