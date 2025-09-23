/**
 * 布局稳定性工具函数
 * 用于防止语言切换时的滚动条抖动问题
 */

/**
 * 获取当前滚动条宽度
 */
export function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  
  // 创建一个临时元素来测量滚动条宽度
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  (outer.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

/**
 * 设置页面稳定化样式，防止滚动条导致的布局抖动
 */
export function stabilizeLayout(): void {
  if (typeof window === 'undefined') return;
  
  const scrollbarWidth = getScrollbarWidth();
  const html = document.documentElement;
  const body = document.body;
  
  // 为html元素添加稳定化样式
  html.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  html.style.setProperty('scrollbar-gutter', 'stable');
  
  // 为body元素添加补偿样式
  body.style.setProperty('padding-right', `calc(100vw - 100%)`);
  body.style.setProperty('margin-right', `calc(-1 * (100vw - 100%))`);
}

/**
 * 在语言切换期间临时禁用滚动行为
 */
export function disableScrollBehavior(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const html = document.documentElement;
  const originalScrollBehavior = html.style.scrollBehavior;
  
  html.style.scrollBehavior = 'auto';
  
  // 返回恢复函数
  return () => {
    if (originalScrollBehavior) {
      html.style.scrollBehavior = originalScrollBehavior;
    } else {
      html.style.removeProperty('scroll-behavior');
    }
  };
}

/**
 * 平滑的语言切换处理
 */
export async function smoothLanguageTransition(
  transitionFn: () => Promise<void>
): Promise<void> {
  const restoreScroll = disableScrollBehavior();
  
  try {
    // 添加过渡类
    document.body.classList.add('language-switching');
    
    // 执行切换逻辑
    await transitionFn();
    
    // 延迟移除过渡类，确保切换完成
    setTimeout(() => {
      document.body.classList.remove('language-switching');
      restoreScroll();
    }, 150);
    
  } catch (error) {
    // 确保出错时也能恢复状态
    document.body.classList.remove('language-switching');
    restoreScroll();
    throw error;
  }
}

/**
 * 页面加载时初始化布局稳定性
 */
export function initializeLayoutStability(): void {
  if (typeof window === 'undefined') return;
  
  // 等待DOM完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stabilizeLayout);
  } else {
    stabilizeLayout();
  }
  
  // 处理窗口大小变化
  let resizeTimer: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(stabilizeLayout, 100);
  });
} 