// URL正则表达式 - 修复路径部分连字符问题
const URL_REGEX = /(https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?|www\.(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?|(?:[-\w.])+\.(?:com|org|net|edu|gov|mil|int|cn|jp|uk|fr|de|it|es|nl|ru|in|au|ca|br|mx|za|kr|sg|hk|tw|th|vn|my|ph|id|ae|sa|eg|tr|il|gr|se|no|dk|fi|pl|cz|hu|ro|bg|hr|si|sk|lt|lv|ee|is|mt|cy|lu|li|mc|sm|va|ad|ie|pt|be|at|ch|cl|ar|pe|co|ve|uy|py|bo|ec|gf|sr|gu|fk|bz|gt|hn|sv|ni|cr|pa|jm|ht|do|cu|bb|tt|gd|lc|vc|ag|dm|kn|bs|tc|vg|vi|pr|aw)(?::[0-9]+)?(?:\/(?:[\w\/_.-])*)?(?:\?(?:[\w&%=.~-])+)?(?:#(?:[\w.~-])+)?)/gi;

// 匹配已经被链接包围的URL的正则
const EXISTING_LINK_REGEX = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;

/**
 * 自动转换文本中的URL为可点击的超链接
 * @param html HTML字符串
 * @returns 转换后的HTML字符串
 */
const autoLinkify = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // 首先收集所有已存在的链接URL，避免重复处理
  const existingLinks = new Set<string>();
  
  // 使用传统方式获取所有匹配的链接
  let linkMatch;
  const linkRegex = new RegExp(EXISTING_LINK_REGEX.source, EXISTING_LINK_REGEX.flags);
  
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const linkText = linkMatch[2]; // 链接显示文本
    existingLinks.add(linkText);
  }

  // 查找所有URL并替换为链接（排除已存在的链接）
  return html.replace(URL_REGEX, (url) => {
    // 如果URL已经在现有链接中，不处理
    if (existingLinks.has(url)) {
      return url;
    }

    // 生成href属性
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    // 返回链接HTML
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

export { autoLinkify };