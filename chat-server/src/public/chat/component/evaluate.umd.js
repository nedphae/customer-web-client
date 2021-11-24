(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('ChatUI')) :
    typeof define === 'function' && define.amd ? define(['react', 'ChatUI'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AlimeComponentEvaluate = factory(global.React, global.ChatUI));
  }(this, (function (React, core) { 'use strict';
  
    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }
  
    var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  
    const evaluationOptions = [
        { label: '非常满意', value: 100 },
        { label: '满意', value: 75 },
        { label: '一般', value: 50 },
        { label: '不满意', value: 25 },
        { label: '非常不满意', value: 1 },
    ];
    const userResolvedOptions = [
        { label: '已解决', value: 1 },
        { label: '未解决', value: 2 },
    ];
    function AlimeComponentEvaluate(chatUIProp) {
        const { data, ctx, msgId } = chatUIProp;
        const [evaluate, setEvaluate] = React.useState(Object.assign(Object.assign({}, data.convInfo), { evaluationType: 5, evaluation: 100, evaluationRemark: '', userResolvedStatus: 1 }));
        function setValue(val) {
            const v = Object.assign({}, evaluate, val);
            setEvaluate(v);
        }
        function submit() {
            ctx.util
                .fetchData({
                url: data.url,
                type: 'PUT',
                data: evaluate,
            })
                .then(() => {
                ctx.deleteMessage(msgId);
                ctx.appendMessage({
                    id: 'evaluate_result',
                    type: 'system',
                    content: {
                        text: '谢谢您的评价',
                    },
                });
            });
        }
        function cancle() {
            ctx.deleteMessage(msgId);
        }
        return (React__default['default'].createElement(core.Card, { size: "xl" },
            React__default['default'].createElement(core.CardTitle, null, "\u8BC4\u4EF7"),
            React__default['default'].createElement(core.CardContent, null,
                React__default['default'].createElement("div", null,
                    React__default['default'].createElement("h5", null, "\u6EE1\u610F\u5EA6 *"),
                    React__default['default'].createElement(core.RadioGroup, { value: evaluate.evaluation, options: evaluationOptions, onChange: (val) => setValue({ evaluation: val }) }),
                    React__default['default'].createElement("h5", null, "\u8BC4\u4EF7\u5185\u5BB9 "),
                    React__default['default'].createElement(core.Input, { value: evaluate.evaluationRemark, onChange: (val) => setValue({ evaluationRemark: val }), placeholder: "\u8BF7\u8F93\u5165..." }),
                    React__default['default'].createElement("h5", null, "\u89E3\u51B3\u72B6\u6001 *"),
                    React__default['default'].createElement(core.RadioGroup, { value: evaluate.userResolvedStatus, options: userResolvedOptions, onChange: (val) => setValue({ userResolvedStatus: val }) }))),
            React__default['default'].createElement(core.CardActions, null,
                React__default['default'].createElement(core.Button, { onClick: cancle }, "\u53D6\u6D88"),
                React__default['default'].createElement(core.Button, { color: "primary", onClick: submit }, "\u63D0\u4EA4"))));
    }
  
    var index = { default: AlimeComponentEvaluate };
  
    return index;
  
  })));
  