//TODO 获取一些配置, 先使用默认配置

// step 0: 根据 配置的接待组 uuid 获取接待组信息
function getRequest(body) {
  return {
    header: { mid: uuidv4().substr(0, 8) },
    // message
    body,
  }
}

function generateResponse(header, body, code = 200) {
  return {
    header,
    code,
    // message
    body,
  }
}


let ctx

// step 1: 注册客户信息
axios.post('/access/customer/register', userInfo)
  .then((response) => {
    // step 2: 检查是否要直接转人工
    const data = response.data
    if (data && data.errorCode === undefined) {
      const userId = data.userId
      const interaction = data.interaction
      let staffId = data.staffId
      let queue
      let lastMsgId = '';
      let lastUpdateFile;

      // step 3: 生成 chatsdk
      const bot = new ChatSDK({
        config: {
          navbar: {
            title: '智能助理'
          },
          toolbar: [
            {
              type: 'image',
              icon: 'image',
              title: '图片',
            },
          ],
          robot: {
            avatar: 'http://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg'
          },
          agent: {
            quickReply: {
              icon: 'message',
              name: '召唤人工客服',
              isHighlight: true,
            },
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
        requests: {
          history: function () {
            return {
              url: '/access/customer/message/history?userId=' + userId + '&lastSeqId=' + lastMsgId + '&pageSize=20',
            };
          },
          send: function (msg) {
            // 机器人配置
            if (msg.type === 'text') {
              return {
                url: '/bot/qa',
                data: {
                  // 用户id
                  c: data.id,
                  u: userId,
                  b: staffId,
                  q: JSON.stringify(msg),
                }
              };
            }
          }
        },

        handlers: {
          // 点击工具栏
          onToolbarClick(item, ctx) {
            // 如果点的是“相册”
            if (item.type === 'image') {
              ctx.util.chooseImage({
                // multiple: true, // 是否可多选
                success(e) {
                  if (e.files) { // 如果有 h5 上传的图
                    const file = e.files[0];
                    // 先展示图片
                    ctx.appendMessage({
                      type: 'image',
                      content: {
                        picUrl: URL.createObjectURL(file)
                      },
                      position: 'right'
                    });
                    var formData = new FormData();
                    formData.append("file", file);
                    // 上传图片
                    axios.post('/oss/chat/img', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    }).then(res => {
                      // 发送图片消息给客服
                      ctx.postMessage({
                        type: 'image',
                        content: {
                          picUrl: {
                            contentType: 'IMAGE',
                            photoContent: {
                              mediaId: res[0],
                              filename: file.name,
                              picSize: file.picSize,
                              type: file.type,
                            },
                          },
                        },
                        quiet: true // 不展示
                      });
                    });
                  } else if (e.images) { // 如果有 app 上传的图
                    // ..与上面类似
                  }
                },
              });
            }
          },
          /**
           *
           * 解析请求返回的数据
           * @param {object} res - 请求返回的数据
           * @param {object} requestType - 请求类型
           * @return {array}
           */
          parseResponse: function (res, requestType) {
            debugger;
            // 根据 requestType 处理数据
            if (requestType === 'history' && res) {
              lastMsgId = res.lastId;
              // 用 isv 消息解析器处理数据
              return res;
            }

            if (requestType === 'send' && res.body) {
              // 更新 用户 message ID
              if (lastMsgId == '') {
                lastMsgId = res.body[0]._id
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
              transports: ['websocket'],
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
              // 客服会话
              ctx.appendMessage({
                type: 'cmd',
                content: {
                  code: 'agent_join'
                }
              })
              info = {
                organizationId: data.organizationId,
                conversationId: data.id,
                staffId: data.staffId,
                userId: data.userId,
              }
            } else {
              info = {
                organizationId: data.organizationId,
                userId: data.userId,
              }
            }

            const request = getRequest(info)
            socket.emit('status/register', request, (response) => {
              const conversationView = response.body;
              queue = conversationView.queue;
              showQueue(queue);
              staffId = conversationView.staffId;
            });
          })

          // 接受消息
          socket.on('msg/sync', (request, cb) => {
            // 调用回调通知消息收到
            cb(generateResponse(request.header, '"OK"'));
            // 当收到消息时
            const message = request.body.message;
            const msgId = message.seqId.toString();
            const content = message.content;
            let chatUIMessage;
            switch (content.contentType) {
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
                chatUIMessage = {
                  _id: msgId,
                  type: 'image',
                  content: {
                    picUrl: '/oss/chat/img/' + content.photoContent.mediaId,
                  },
                  user: {
                    avatar:
                      'https://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg',
                  },
                }
                break;
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

            if (chatUIMessage) {
              // 展示消息内容
              ctx.appendMessage(chatUIMessage);
            }
          })

          // 当结束服务的时候，提示用户
          socket.on('io/close', (request, cb) => {
            console.log('wx close', request);
            cb(generateResponse(request.header, undefined));
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
              const content;
              switch (content.contentType) {
                case 'text': {
                  content = {
                    contentType: 'TEXT',
                    textContent: {
                      text: msg.content.text,
                    },
                  }
                  break;
                }
                case 'image': {
                  content = {
                    contentType: 'IMAGE',
                    photoContent: msg.content.picUrl,
                  }
                }
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
                // 更新 用户 message ID
                if (lastMsgId == '') {
                  lastMsgId = msg._id
                }
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
