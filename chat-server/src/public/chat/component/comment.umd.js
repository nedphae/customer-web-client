(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('ChatUI')) :
    typeof define === 'function' && define.amd ? define(['react', 'ChatUI'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AlimeComponentComment = factory(global.React, global.ChatUI));
  }(this, (function (React, core) { 'use strict';
  
    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }
  
    var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  
    function AlimeComponentComment(commentProp) {
        const { data, ctx, msgId } = commentProp;
        const [comment, setComment] = React.useState(Object.assign(Object.assign({}, data.userInfo), { name: '', mobile: '', email: '', message: '' }));
        function setValue(val) {
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
                            text: '留言提交成功',
                        },
                    });
                });
            }
            else {
                core.toast.fail('姓名 留言 不能为空, 手机/邮箱 请至少填写一项');
            }
        }
        function cancle() {
            ctx.deleteMessage(msgId);
        }
        return (React__default['default'].createElement(core.Card, { size: "xl" },
            React__default['default'].createElement(core.CardTitle, null, "\u7559\u8A00"),
            React__default['default'].createElement(core.CardContent, null,
                React__default['default'].createElement("div", null,
                    React__default['default'].createElement("h5", null, "\u59D3\u540D *"),
                    React__default['default'].createElement(core.Input, { value: comment.name, onChange: (val) => setValue({ name: val }), placeholder: "\u8BF7\u8F93\u5165..." }),
                    React__default['default'].createElement("h5", null, "\u624B\u673A *"),
                    React__default['default'].createElement(core.Input, { value: comment.mobile, onChange: (val) => setValue({ mobile: val }), placeholder: "\u8BF7\u8F93\u5165..." }),
                    React__default['default'].createElement("h5", null, "\u90AE\u7BB1 *"),
                    React__default['default'].createElement(core.Input, { value: comment.email, onChange: (val) => setValue({ email: val }), placeholder: "\u8BF7\u8F93\u5165..." }),
                    React__default['default'].createElement("h5", null, "\u7559\u8A00 *"),
                    React__default['default'].createElement(core.Input, { rows: 3, maxLength: 120, value: comment.message, onChange: (val) => setValue({ message: val }), placeholder: "\u8BF7\u8F93\u5165..." }))),
            React__default['default'].createElement(core.CardActions, null,
                React__default['default'].createElement(core.Button, { onClick: cancle }, "\u53D6\u6D88"),
                React__default['default'].createElement(core.Button, { color: "primary", onClick: submit }, "\u63D0\u4EA4"))));
    }
  
    var index = { default: AlimeComponentComment };
  
    return index;
  
  })));
  