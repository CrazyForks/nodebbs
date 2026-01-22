import { visit } from 'unist-util-visit';

export default function remarkMedia() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (node.name !== 'video' && node.name !== 'audio') return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        
        // Ensure src exists
        if (!attributes.src && !attributes.url) return;

        // 解构分离 src/url，避免剩余属性覆盖
        const { src, url, ...restAttributes } = attributes;
        
        data.hName = node.name; // 'video' or 'audio'
        data.hProperties = {
          src: src || url,
          controls: true,
          ...restAttributes,
        };
      }
    });
  };
}
