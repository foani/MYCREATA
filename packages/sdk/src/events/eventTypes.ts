import { EventType } from '../types';

/**
 * 이벤트 라이프사이클 단계
 */
export enum EventLifecycle {
  /**
   * 초기화 단계
   */
  INIT = 'init',
  
  /**
   * 연결 단계
   */
  CONNECT = 'connect',
  
  /**
   * 상태 변경 단계
   */
  CHANGE = 'change',
  
  /**
   * 오류 단계
   */
  ERROR = 'error',
  
  /**
   * 종료 단계
   */
  TERMINATE = 'terminate'
}

/**
 * 내부 로깅을 위한 추가 이벤트 타입
 */
export enum InternalEventType {
  /**
   * SDK 초기화
   */
  SDK_INIT = 'sdk:init',
  
  /**
   * SDK 오류
   */
  SDK_ERROR = 'sdk:error',
  
  /**
   * 프로바이더 초기화
   */
  PROVIDER_INIT = 'provider:init',
  
  /**
   * 프로바이더 오류
   */
  PROVIDER_ERROR = 'provider:error',
  
  /**
   * 요청 시작
   */
  REQUEST_START = 'request:start',
  
  /**
   * 요청 완료
   */
  REQUEST_COMPLETE = 'request:complete',
  
  /**
   * 요청 오류
   */
  REQUEST_ERROR = 'request:error'
}

/**
 * 모든 이벤트 타입 (공개 + 내부)
 */
export type AllEventTypes = EventType | InternalEventType;

/**
 * 이벤트 매핑
 * 각 이벤트 타입이 어떤 라이프사이클 단계에 속하는지 정의
 */
export const eventLifecycleMap: Record<EventType, EventLifecycle> = {
  [EventType.CONNECT]: EventLifecycle.CONNECT,
  [EventType.DISCONNECT]: EventLifecycle.TERMINATE,
  [EventType.ACCOUNTS_CHANGED]: EventLifecycle.CHANGE,
  [EventType.CHAIN_CHANGED]: EventLifecycle.CHANGE,
  [EventType.MESSAGE]: EventLifecycle.CHANGE
};

/**
 * 내부 이벤트 매핑
 */
export const internalEventLifecycleMap: Record<InternalEventType, EventLifecycle> = {
  [InternalEventType.SDK_INIT]: EventLifecycle.INIT,
  [InternalEventType.SDK_ERROR]: EventLifecycle.ERROR,
  [InternalEventType.PROVIDER_INIT]: EventLifecycle.INIT,
  [InternalEventType.PROVIDER_ERROR]: EventLifecycle.ERROR,
  [InternalEventType.REQUEST_START]: EventLifecycle.INIT,
  [InternalEventType.REQUEST_COMPLETE]: EventLifecycle.TERMINATE,
  [InternalEventType.REQUEST_ERROR]: EventLifecycle.ERROR
};
