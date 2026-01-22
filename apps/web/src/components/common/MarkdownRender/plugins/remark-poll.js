import { visit } from 'unist-util-visit';

/**
 * 投票插件
 * 
 * 支持语法:
 * ::poll{id="1234"}
 * 
 * 投票数据从服务端根据 ID 获取，Markdown 中只存储引用
 * 
 * 示例:
 * ::poll{id="1234"}
 * ::poll{id="poll-abc-123"}
 */

export default function remarkPoll() {
  return (tree) => {
    visit(tree, (node) => {
      // 投票使用 leafDirective（块级自闭合）
      if (node.type === 'leafDirective' && node.name === 'poll') {
        const attributes = node.attributes || {};
        
        // id 是必填项
        if (!attributes.id) {
          console.warn('Poll directive missing required "id" attribute');
          return;
        }

        // 设置 HAST 属性
        node.data = node.data || {};
        node.data.hName = 'poll';
        node.data.hProperties = {
          'data-poll-id': attributes.id,
        };
      }
    });
  };
}
