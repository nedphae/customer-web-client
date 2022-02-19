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

function getTruePicUrl(picId) {
  return '/s3/chat/img/' + picId
}
function getTrueFileUrl(fileId) {
  return '/s3/chat/file/' + fileId
}

let ctx
let bot

let socket

// step 1: 注册客户信息
axios.post('/access/customer/register', userInfo)
  .then((response) => {
    // step 2: 检查是否要直接转人工
    const data = response.data
    if (data && data.errorCode === undefined) {
      const organizationId = data.organizationId;
      const convId = data.id;
      const userId = data.userId;
      const interaction = data.interaction;
      const shuntId = data.shuntId;
      const blockOnStaff = data.blockOnStaff;
      let staffId = data.staffId;
      let nickName = data.nickName;
      let queue;
      let lastMsgId = '';
      const config = JSON.parse(data.config);
      const historyMsg = data.historyMsg ?? [];
      if (data.commentView !== 'true') {
        // 检查是否是查看留言的链接
        historyMsg.push(...config.messages);
      }

      config.messages = historyMsg.map((msg) => {
        if (msg.type === "image") {
          msg.content.picUrl = getTruePicUrl(msg.content.picUrl);
        }
        return msg
      });
      config.quickReplies = [
        {
          name: '留言',
          type: 'card',
          card: {
            code: 'comment',
            data: {
              url: '/access/customer/comment',
              userInfo: { organizationId: organizationId, shuntId: shuntId, userId: userId, uid: userInfo.uid }
            }
          }
        },
        {
          name: '评价',
          type: 'card',
          card: {
            code: 'evaluate',
            data: {
              url: '/access/customer/evaluate',
              userInfo: { organizationId: organizationId, convId: convId }
            }
          }
        },
      ].concat(config.quickReplies ?? [])

      if (historyMsg[0]) {
        // 获取到历史消息, 更新 lastMsgId
        lastMsgId = historyMsg[0]._id;
      }

      // step 3: 生成 chatsdk
      bot = new ChatSDK({
        // 实体配置仅供测试
        config: config ?? {
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
            },
          ],
          loadMoreText: '点击加载更多',
          // 快捷短语
          quickReplies: [
            {
              name: '留言',
              type: 'card',
              card: {
                code: 'comment',
                data: {
                  url: '/access/customer/comment',
                  userInfo: { organizationId: organizationId, shuntId: shuntId, userId: userId, uid: userInfo.uid }
                }
              }
            },
            {
              name: '评价',
              type: 'card',
              card: {
                code: 'evaluate',
                data: {
                  url: '/access/customer/evaluate',
                  userInfo: { organizationId: organizationId, convId: convId }
                }
              }
            },
          ],
        },
        components: {
          'comment': '/chat/component/comment.umd.js',
          'evaluate': '/chat/component/evaluate.umd.js',
        },
        requests: {
          autoComplete: (data) => {
            if (socket) {
              let content = {
                contentType: 'SYS',
                sysCode: 'USER_TYPING',
                serviceContent: data.text,
              }

              const request = getRequest(
                // message
                {
                  uuid: uuidv4(),
                  to: staffId,
                  from: userId,
                  type: 1,
                  creatorType: 0,
                  content,
                })
              socket.emit('msg/send', request)
            }
            return undefined;
          },
          history: function () {
            return {
              url: '/access/customer/message/history?userId=' + userId + '&lastSeqId=' + lastMsgId + '&pageSize=50',
            };
          },
          send: function (msg) {
            // 机器人配置
            if (msg.type === 'text') {
              return {
                url: '/bot/qa',
                data: {
                  c: convId,
                  // 用户id
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
                    axios.post('/s3/chat/img/' + organizationId, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    }).then(res => {
                      // 发送图片消息给客服
                      ctx.postMessage({
                        type: 'image',
                        content: {
                          picUrl: {
                            mediaId: res.data[0],
                            filename: file.name,
                            picSize: file.size,
                            type: file.type,
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
            // 根据 requestType 处理数据
            if (requestType === 'history' && res) {
              lastMsgId = res.lastId;
              // 用 isv 消息解析器处理数据
              res.list = res.list.map((msg) => {
                if (msg.type === "image") {
                  msg.content.picUrl = getTruePicUrl(msg.content.picUrl);
                }
                return msg
              });
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
          socket = io("/im/customer",
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
            if (queue || queue === 0) {
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
            let info = {
              organizationId: data.organizationId,
              userId: data.userId,
              customerConfig: userInfo,
            }
            if (interaction == 1) {
              // 客服会话
              ctx.appendMessage({
                type: 'cmd',
                content: {
                  code: 'agent_join'
                }
              })
              info = Object.assign(info, {
                conversationId: convId,
                staffId: data.staffId,
              });
            }

            const request = getRequest(info)
            socket.emit('status/register', request, (response) => {
              const conversationView = response.body;
              queue = conversationView.queue;
              showQueue(queue);
              staffId = conversationView.staffId;
              if (staffId) {
                const sysMsg = {
                  type: 'system',
                  content: {
                    text: '人工客服 ' + (conversationView.nickName ?? nickName) + ' 为您服务',
                  },
                }
                ctx.appendMessage(sysMsg);
              }
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
                }
                break;
              }
              case 'IMAGE': {
                chatUIMessage = {
                  _id: msgId,
                  type: 'image',
                  content: {
                    picUrl: getTruePicUrl(content.photoContent.mediaId),
                  },
                }
                break;
              }
              case 'FILE': {
                chatUIMessage = {
                  _id: msgId,
                  type: 'card',
                  content: {
                    code: 'promotion',
                    data: {
                      array: [
                        {
                          image: "https://g.alicdn.com/DingTalkWeb/web/3.8.10/assets/webpack-img/" + content.attachments.filename.split('.').pop() + ".png",
                          action: "openWindow",
                          title: content.attachments.filename,
                          text: "点击下载文件",
                          params: {
                            url: getTrueFileUrl(content.attachments.mediaId),
                          },
                        }
                      ]
                    }
                  },
                }
                break;
              }
              case 'SYS': {
                let msg = undefined;
                if (content.serviceContent) {
                  msg = JSON.parse(content.serviceContent)
                }
                switch (content.sysCode) {
                  case 'UPDATE_QUEUE': {
                    // 更新列队 
                    showQueue(msg.queue);
                  }
                  case 'ASSIGN': {
                    // 分配客服
                    if (msg.staffId) {
                      staffId = msg.staffId
                      ctx.deleteMessage(queueMsgId);
                      nickName = msg.nickName
                      const sysMsg = {
                        type: 'system',
                        content: {
                          text: '人工客服 ' + nickName + ' 为您服务',
                        },
                      }
                      ctx.appendMessage(sysMsg);
                    }
                  }
                  case 'TRANSFER': {
                    // 转接客服
                    if (msg.staffId) {
                      staffId = msg.staffId
                      nickName = msg.nickName
                      const sysMsg = {
                        type: 'system',
                        content: {
                          text: '为您转接人工客服：' + nickName,
                        },
                      }
                      ctx.appendMessage(sysMsg);
                    }
                  }
                  case 'EVALUATION_INVITED': {
                    // ctx.deleteMessage('evaluate_from');
                    // 客服邀请评价
                    ctx.appendMessage({
                      _id: 'evaluate_from',
                      type: 'card',
                      content: {
                        code: 'evaluate', // 卡片code
                        data: { // 卡片数据
                          url: '/access/customer/evaluate',
                          userInfo: { organizationId: organizationId, convId: convId }
                        }
                      }
                    })
                  }
                  default: {

                  }
                }

              }
            }

            if (message.creatorType == 2) {
              chatUIMessage = Object.assign({
                position: 'right',
              }, chatUIMessage)
            } else if (message.creatorType == 1) {
              chatUIMessage = Object.assign({
                position: 'left', user: {
                  avatar:
                    'https://gw.alicdn.com/tfs/TB1U7FBiAT2gK0jSZPcXXcKkpXa-108-108.jpg',
                },
              }, chatUIMessage)
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
                text: '连接超时断开 人工客服已退出服务',
              },
            });
          });

          return {
            // 把用户的信息发给后端
            send(msg) {
              // switch msg.type
              let content;
              switch (msg.type) {
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
                  uuid: uuidv4(),
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

      if (config.connectIds) {
        // 获取 connectIds 关联的机器人消息
        axios.post('/bot/topic/ids', config.connectIds.join('\n')).then((response) => {
          const data = response.data
          if (data && data.errorCode === undefined) {
            ctx.appendMessage(data);
          }
        })
      }

      if (interaction == 1) {
        // 客服会话
        ctx.appendMessage({
          type: 'cmd',
          content: {
            code: 'agent_join'
          }
        })

      } else {
        if (blockOnStaff == 0) {
          // 机器人会话
          ctx.appendMessage({
            type: 'cmd',
            content: {
              code: 'agent_entrance_display'
            }
          })
        }
      }
    }
  })
