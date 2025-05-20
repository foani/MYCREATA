/**
 * DOM 헬퍼 함수
 * DOM 관련 유틸리티 함수들을 제공합니다.
 */

/**
 * 스크립트를 웹페이지에 주입
 * @param scriptUrl 주입할 스크립트 URL
 */
export function injectScript(scriptUrl: string): void {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    
    // 스크립트 속성 설정
    scriptTag.src = scriptUrl;
    scriptTag.type = 'text/javascript';
    scriptTag.async = false;
    
    // 스크립트 로드 완료 이벤트
    scriptTag.onload = function() {
      // 로드 완료 후 필요하다면 스크립트 태그 제거
      // scriptTag.remove();
    };
    
    // DOM에 스크립트 추가
    container.appendChild(scriptTag);
    
    console.log(`스크립트가 주입되었습니다: ${scriptUrl}`);
  } catch (error) {
    console.error(`스크립트 주입 중 오류: ${scriptUrl}`, error);
  }
}

/**
 * 인라인 스크립트를 웹페이지에 주입
 * @param code 주입할 코드
 */
export function injectInlineScript(code: string): void {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    
    // 스크립트 속성 설정
    scriptTag.type = 'text/javascript';
    scriptTag.textContent = code;
    
    // DOM에 스크립트 추가
    container.appendChild(scriptTag);
    
    // 주입 후 스크립트 태그 제거
    scriptTag.remove();
    
    console.log('인라인 스크립트가 주입되었습니다.');
  } catch (error) {
    console.error('인라인 스크립트 주입 중 오류:', error);
  }
}

/**
 * CSS를 웹페이지에 주입
 * @param cssUrl 주입할 CSS URL
 */
export function injectCSS(cssUrl: string): void {
  try {
    const container = document.head || document.documentElement;
    const linkTag = document.createElement('link');
    
    // 링크 속성 설정
    linkTag.rel = 'stylesheet';
    linkTag.type = 'text/css';
    linkTag.href = cssUrl;
    
    // DOM에 링크 추가
    container.appendChild(linkTag);
    
    console.log(`CSS가 주입되었습니다: ${cssUrl}`);
  } catch (error) {
    console.error(`CSS 주입 중 오류: ${cssUrl}`, error);
  }
}

/**
 * 인라인 CSS를 웹페이지에 주입
 * @param css 주입할 CSS 코드
 */
export function injectInlineCSS(css: string): void {
  try {
    const container = document.head || document.documentElement;
    const styleTag = document.createElement('style');
    
    // 스타일 속성 설정
    styleTag.type = 'text/css';
    styleTag.textContent = css;
    
    // DOM에 스타일 추가
    container.appendChild(styleTag);
    
    console.log('인라인 CSS가 주입되었습니다.');
  } catch (error) {
    console.error('인라인 CSS 주입 중 오류:', error);
  }
}

/**
 * 요소가 DOM에 추가될 때까지 기다림
 * @param selector CSS 선택자
 * @param parent 부모 요소 (기본값: document)
 * @param timeout 타임아웃(ms) (기본값: 10000)
 * @returns Promise<Element>
 */
export function waitForElement(
  selector: string,
  parent: Document | Element = document,
  timeout: number = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // 이미 존재하는 요소 확인
    const element = parent.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`요소를 찾을 수 없습니다: ${selector} (타임아웃: ${timeout}ms)`));
    }, timeout);
    
    // MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      const element = parent.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });
    
    // DOM 변경 감시 시작
    observer.observe(parent, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * 특정 이벤트가 발생할 때까지 기다림
 * @param eventName 이벤트 이름
 * @param element 이벤트를 감시할 요소 (기본값: window)
 * @param timeout 타임아웃(ms) (기본값: 10000)
 * @returns Promise<Event>
 */
export function waitForEvent(
  eventName: string,
  element: EventTarget = window,
  timeout: number = 10000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    // 이벤트 리스너 설정
    const listener = (event: Event) => {
      element.removeEventListener(eventName, listener);
      clearTimeout(timeoutId);
      resolve(event);
    };
    
    // 이벤트 리스너 등록
    element.addEventListener(eventName, listener);
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      element.removeEventListener(eventName, listener);
      reject(new Error(`이벤트를 수신하지 못했습니다: ${eventName} (타임아웃: ${timeout}ms)`));
    }, timeout);
  });
}

/**
 * 웹페이지의 메타 정보 추출
 * @returns 메타 정보 객체
 */
export function extractPageMetadata(): {
  title: string;
  description: string;
  icon: string;
  url: string;
} {
  // 제목 추출
  const title = document.title || '';
  
  // 설명 추출
  let description = '';
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    description = (metaDescription as HTMLMetaElement).content || '';
  }
  
  // 아이콘 추출
  let icon = '';
  const linkIcon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (linkIcon) {
    icon = (linkIcon as HTMLLinkElement).href || '';
  }
  
  // URL 추출
  const url = window.location.href;
  
  return {
    title,
    description,
    icon,
    url
  };
}