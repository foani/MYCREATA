import EventEmitter from 'eventemitter3';
import { EventType, EventData } from '../types';

/**
 * CreLink 이벤트 이미터
 * 
 * SDK 내부에서 이벤트를 관리하기 위한 클래스
 */
export class CreLinkEventEmitter {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  /**
   * 이벤트 리스너 등록
   * 
   * @param eventType 이벤트 타입
   * @param listener 이벤트 리스너
   */
  public on<K extends EventType>(eventType: K, listener: (data: EventData[K]) => void): void {
    this.emitter.on(eventType, listener);
  }

  /**
   * 이벤트 리스너 한 번만 실행하도록 등록
   * 
   * @param eventType 이벤트 타입
   * @param listener 이벤트 리스너
   */
  public once<K extends EventType>(eventType: K, listener: (data: EventData[K]) => void): void {
    this.emitter.once(eventType, listener);
  }

  /**
   * 이벤트 리스너 제거
   * 
   * @param eventType 이벤트 타입
   * @param listener 이벤트 리스너
   */
  public removeListener<K extends EventType>(eventType: K, listener: (data: EventData[K]) => void): void {
    this.emitter.removeListener(eventType, listener);
  }

  /**
   * 특정 이벤트의 모든 리스너 제거
   * 
   * @param eventType 이벤트 타입
   */
  public removeAllListeners(eventType?: EventType): void {
    this.emitter.removeAllListeners(eventType);
  }

  /**
   * 이벤트 발생
   * 
   * @param eventType 이벤트 타입
   * @param data 이벤트 데이터
   */
  public emit<K extends EventType>(eventType: K, data: EventData[K]): boolean {
    return this.emitter.emit(eventType, data);
  }

  /**
   * 특정 이벤트의 리스너 개수 조회
   * 
   * @param eventType 이벤트 타입
   */
  public listenerCount(eventType: EventType): number {
    return this.emitter.listenerCount(eventType);
  }

  /**
   * 특정 이벤트의 리스너 목록 조회
   * 
   * @param eventType 이벤트 타입
   */
  public listeners(eventType: EventType): Function[] {
    return this.emitter.listeners(eventType);
  }
}
