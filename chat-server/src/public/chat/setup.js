//TODO 获取一些配置, 先使用默认配置

// step 0: 根据 配置的接待组 uuid 获取接待组信息

function getRequest(body) {
  return {
    header: { mid : uuidv4().substr(0, 8)},
    // message
    body,
  }
}

// step 1: 注册客户信息
axios.post('http://localhost:8700/access/customer/register', {
  organizationId: 9491,
  title: '测试客服系统',
  referrer: 'localhost',
  uid: 'system-test',
  shuntId: '1',
  name: '客服测试',
  email: '666@666.com',
}).then((response) => {
  // step 2: 检查是否要直接转人工
  const data = response.data
  if (data) {
    const userId = data.userId
    const interaction = data.interaction
    let staffId = data.staffId
    let queue

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
              url: 'http://localhost:8700/bot/qa',
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
      // 转人工配置
      makeSocket({ ctx }) {
        // 连接 ws (socket.io)
        const socket = io("http://localhost:8700/im/customer", 
        {
          query: {
            token: 'customer',
          },
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
            staffId = conversationView.staffId;
            queue = conversationView.queue;

            showQueue(queue);
          });

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
            }
            
            // 展示消息内容
            ctx.appendMessage(chatUIMessage);
            // TODO 调用回调通知消息收到
            // cb();
          })

          socket.on('assign', (request, cb) => {
            queue = request.body.queue.num
            //TODO: 检查分配事件，是否分配了客服，还是继续等待
            if (true) {
              // 移除排队消息
              ctx.deleteMessage(queueMsgId);
            } else {
              showQueue(queue);
            }
          });
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
              msg._id = response.body.seqId.toString();
              ctx.updateMessage(msg)
            })
          },
          close() {
            socket.close();
          },
        };
      },
    });

    bot.run();

    const ctx = bot.getCtx();
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
