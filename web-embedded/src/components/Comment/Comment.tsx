import React, { useState } from 'react';

import { Card, CardMedia, CardTitle, CardContent, CardActions, Button, Input } from '@chatui/core';

interface Comment {
    name: string;
    mobile: string;
    email: string;
    message: string;
}
// 代码分割，单独打包
// import("./Comment").then(comment => {
//     console.log(comment);
//   });
export default function Comment({ data, ctx, meta }) {
    const [comment, setComment] = useState<Comment>({
        name: '',
        mobile: '',
        email: '',
        message: '',
    });

    function setValue(val: {}) {
        setComment(Object.assign({}, val, comment))
    }
    return (
        <Card size="xl">
            <CardMedia image="//gw.alicdn.com/tfs/TB1Xv5_vlr0gK0jSZFnXXbRRXXa-427-240.png" />
            <CardTitle>留言</CardTitle>
            <CardContent>
                <div>
                    <h3>姓名</h3>
                    <Input value={comment.name} onChange={val => setValue({name: val})} placeholder="请输入..." />
                    <h3>手机</h3>
                    <Input value={comment.mobile} onChange={val => setValue({mobile: val})} placeholder="请输入..." />
                    <h3>邮箱</h3>
                    <Input value={comment.email} onChange={val => setValue({email: val})} placeholder="请输入..." />
                    <h3>留言</h3>
                    <Input maxLength={120} value={comment.message} onChange={val => setValue({message: val})} placeholder="请输入..." />
                </div>
            </CardContent>
            <CardActions>
                <Button>Default button</Button>
                <Button color="primary">Primary button</Button>
            </CardActions>
        </Card>
    );
}