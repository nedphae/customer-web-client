import React, { VFC } from 'react';

import { Comment } from './reactComponentLib';
// 引入样式
import '@chatui/core/dist/index.css';

export const App: VFC = () => (
  <div>
    <Comment />
  </div>
);
