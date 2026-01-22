import { visit } from 'unist-util-visit';

/**
 * 自定义表情包插件
 * 
 * 支持语法:
 * :sticker[分组/表情名.扩展名]{size="lg"}
 * :sticker[表情名]{size="md"}  (使用默认分组和 .gif 扩展名)
 * 
 * 可用属性:
 * - size: 'sm' | 'md' | 'lg' | 'xl' 或具体像素值如 '32'
 * 
 * 示例:
 * :sticker[tieba/doge.gif]           -> /stickers/tieba/doge.gif
 * :sticker[weibo/doge.jpg]{size="lg"} -> /stickers/weibo/doge.jpg (大尺寸)
 * :sticker[doge]                     -> /stickers/default/doge.gif (向后兼容)
 */

// 预设尺寸映射
const SIZE_MAP = {
  sm: 20,
  md: 28,
  lg: 40,
  xl: 64,
};

// 支持的图片扩展名
const SUPPORTED_EXTENSIONS = ['.gif', '.png', '.jpg', '.jpeg', '.webp'];

export default function remarkSticker() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'textDirective' && node.name === 'sticker') {
        // 获取表情路径（来自子节点文本）
        const stickerPath = node.children?.[0]?.value?.trim() || '';
        if (!stickerPath) return;

        // 解析路径：分组/表情名.扩展名
        let filePath = stickerPath;
        
        // 检查是否有扩展名
        const hasExtension = SUPPORTED_EXTENSIONS.some(ext => 
          stickerPath.toLowerCase().endsWith(ext)
        );
        
        // 检查是否有分组（包含 /）
        const hasGroup = stickerPath.includes('/');
        
        // 构建最终路径
        if (!hasGroup && !hasExtension) {
          // 无分组无扩展名：使用默认分组和 .gif
          filePath = `default/${stickerPath}.gif`;
        } else if (!hasGroup && hasExtension) {
          // 无分组有扩展名：使用默认分组
          filePath = `default/${stickerPath}`;
        } else if (hasGroup && !hasExtension) {
          // 有分组无扩展名：添加 .gif
          filePath = `${stickerPath}.gif`;
        }
        // else: 有分组有扩展名，直接使用原路径

        // 解析属性
        const attributes = node.attributes || {};
        const sizeAttr = attributes.size || 'md';
        
        // 计算实际尺寸
        const size = SIZE_MAP[sizeAttr] || parseInt(sizeAttr, 10) || SIZE_MAP.md;

        // 提取表情名用于 alt 和 title
        const stickerName = stickerPath.split('/').pop().replace(/\.[^.]+$/, '');

        // 设置 HAST 属性
        node.data = node.data || {};
        node.data.hName = 'img';
        node.data.hProperties = {
          src: `/stickers/${filePath}`,
          alt: `[${stickerName}]`,
          title: stickerName,
          width: size,
          height: size,
          className: 'inline-sticker',
          loading: 'lazy',
          draggable: 'false',
        };
        
        // img 是 void 元素，必须清空子节点
        node.children = [];
      }
    });
  };
}
