import { visit } from 'unist-util-visit';

/**
 * 自定义 Emoji 插件
 * 
 * 支持语法:
 * :emoji[group/code]          - 完整语法，指定分组
 * :emoji[code]                - 短语法，自动匹配第一个
 * :emoji[code]{size=32}       - 自定义尺寸（像素）
 * 
 * 示例:
 * :emoji[qq/doge]       -> <emoji code="qq/doge" />
 * :emoji[doge]{size=48} -> <emoji code="doge" size="48" />
 */

export default function remarkEmoji() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'textDirective' && node.name === 'emoji') {
        // 获取 Emoji 标识符（可能是 group/code 或 code）
        const identifier = node.children?.[0]?.value?.trim() || '';
        if (!identifier) return;

        // 解析 size 属性
        const size = node.attributes?.size ? parseInt(node.attributes.size, 10) : null;

        // 设置 HAST 属性（转为自定义元素 <emoji>）
        node.data = node.data || {};
        node.data.hName = 'emoji';
        node.data.hProperties = {
          code: identifier,
          className: 'inline-emoji',
          ...(size && { size: String(size) }),
        };
        
        // 清空子节点
        node.children = [];
      }
    });
  };
}

