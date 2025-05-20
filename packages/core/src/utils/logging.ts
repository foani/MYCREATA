/**
 * @file logging.ts
 * @description 로깅 유틸리티 모듈
 */

/**
 * 로그 레벨 열거형
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none'
}

/**
 * 로그 레벨 우선순위
 */
const LOG_LEVEL_PRIORITY: { [key in LogLevel]: number } = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.NONE]: 4
};

/**
 * 로거 인터페이스
 */
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * 로거 설정 옵션
 */
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  timestamps?: boolean;
  console?: Console;
}

/**
 * 콘솔 로거 구현
 */
export class ConsoleLogger implements ILogger {
  private level: LogLevel;
  private prefix: string;
  private timestamps: boolean;
  private console: Console;
  
  /**
   * ConsoleLogger 인스턴스를 생성합니다.
   * 
   * @param options 로거 옵션
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level || LogLevel.INFO;
    this.prefix = options.prefix || '';
    this.timestamps = options.timestamps !== undefined ? options.timestamps : true;
    this.console = options.console || console;
  }
  
  /**
   * 로그 메시지를 포맷팅합니다.
   * 
   * @param level 로그 레벨
   * @param message 로그 메시지
   * @returns 포맷팅된 메시지
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];
    
    // 타임스탬프 추가
    if (this.timestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    // 로그 레벨 추가
    parts.push(`[${level.toUpperCase()}]`);
    
    // 접두사 추가
    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }
    
    // 메시지 추가
    parts.push(message);
    
    return parts.join(' ');
  }
  
  /**
   * 현재 로그 레벨이 지정된 레벨보다 낮거나 같은지 확인합니다.
   * 
   * @param level 확인할 로그 레벨
   * @returns 로깅 가능 여부 (true/false)
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }
  
  /**
   * DEBUG 레벨 로그를 출력합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.console.debug(this.formatMessage(LogLevel.DEBUG, message), ...args);
    }
  }
  
  /**
   * INFO 레벨 로그를 출력합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.console.info(this.formatMessage(LogLevel.INFO, message), ...args);
    }
  }
  
  /**
   * WARN 레벨 로그를 출력합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.console.warn(this.formatMessage(LogLevel.WARN, message), ...args);
    }
  }
  
  /**
   * ERROR 레벨 로그를 출력합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.console.error(this.formatMessage(LogLevel.ERROR, message), ...args);
    }
  }
  
  /**
   * 로그 레벨을 설정합니다.
   * 
   * @param level 로그 레벨
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * 현재 로그 레벨을 반환합니다.
   * 
   * @returns 현재 로그 레벨
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

/**
 * 기본 로거 인스턴스
 */
export const defaultLogger = new ConsoleLogger();

/**
 * 모듈별 로거를 생성합니다.
 * 
 * @param prefix 모듈 접두사
 * @param options 로거 옵션
 * @returns 로거 인스턴스
 */
export function createLogger(prefix: string, options: Omit<LoggerOptions, 'prefix'> = {}): ILogger {
  return new ConsoleLogger({ ...options, prefix });
}

/**
 * 에러 객체에서 상세 정보를 추출합니다.
 * 
 * @param error 에러 객체
 * @returns 에러 상세 정보
 */
export function extractErrorDetails(error: any): { message: string; stack?: string; code?: string; data?: any } {
  if (!error) {
    return { message: 'Unknown error' };
  }
  
  // 문자열 에러
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // 에러 객체
  return {
    message: error.message || 'Unknown error',
    stack: error.stack,
    code: error.code,
    data: error.data
  };
}

/**
 * 모든 로그 메시지를 수집하는 메모리 로거
 */
export class MemoryLogger implements ILogger {
  private level: LogLevel;
  private logs: Array<{ level: LogLevel; message: string; timestamp: Date; args: any[] }> = [];
  
  /**
   * MemoryLogger 인스턴스를 생성합니다.
   * 
   * @param options 로거 옵션
   */
  constructor(options: Pick<LoggerOptions, 'level'> = {}) {
    this.level = options.level || LogLevel.DEBUG;
  }
  
  /**
   * 현재 로그 레벨이 지정된 레벨보다 낮거나 같은지 확인합니다.
   * 
   * @param level 확인할 로그 레벨
   * @returns 로깅 가능 여부 (true/false)
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }
  
  /**
   * 로그를 저장합니다.
   * 
   * @param level 로그 레벨
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  private log(level: LogLevel, message: string, args: any[]): void {
    if (this.shouldLog(level)) {
      this.logs.push({
        level,
        message,
        timestamp: new Date(),
        args
      });
    }
  }
  
  /**
   * DEBUG 레벨 로그를 저장합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }
  
  /**
   * INFO 레벨 로그를 저장합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, args);
  }
  
  /**
   * WARN 레벨 로그를 저장합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, args);
  }
  
  /**
   * ERROR 레벨 로그를 저장합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, args);
  }
  
  /**
   * 로그 레벨을 설정합니다.
   * 
   * @param level 로그 레벨
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * 현재 로그 레벨을 반환합니다.
   * 
   * @returns 현재 로그 레벨
   */
  getLevel(): LogLevel {
    return this.level;
  }
  
  /**
   * 저장된 모든 로그를 반환합니다.
   * 
   * @returns 로그 배열
   */
  getLogs(): Array<{ level: LogLevel; message: string; timestamp: Date; args: any[] }> {
    return [...this.logs];
  }
  
  /**
   * 특정 레벨의 로그만 필터링하여 반환합니다.
   * 
   * @param level 필터링할 로그 레벨
   * @returns 필터링된 로그 배열
   */
  getLogsByLevel(level: LogLevel): Array<{ level: LogLevel; message: string; timestamp: Date; args: any[] }> {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * 저장된 모든 로그를 지웁니다.
   */
  clear(): void {
    this.logs = [];
  }
  
  /**
   * 저장된 로그를 문자열로 변환합니다.
   * 
   * @returns 로그 문자열
   */
  toString(): string {
    return this.logs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
  }
}

/**
 * 다중 로거 (여러 로거에 동시에 로그 전송)
 */
export class MultiLogger implements ILogger {
  private loggers: ILogger[];
  
  /**
   * MultiLogger 인스턴스를 생성합니다.
   * 
   * @param loggers 로거 인스턴스 배열
   */
  constructor(loggers: ILogger[]) {
    this.loggers = loggers;
  }
  
  /**
   * DEBUG 레벨 로그를 모든 로거에 전송합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  debug(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.debug(message, ...args));
  }
  
  /**
   * INFO 레벨 로그를 모든 로거에 전송합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  info(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.info(message, ...args));
  }
  
  /**
   * WARN 레벨 로그를 모든 로거에 전송합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  warn(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.warn(message, ...args));
  }
  
  /**
   * ERROR 레벨 로그를 모든 로거에 전송합니다.
   * 
   * @param message 로그 메시지
   * @param args 추가 인자
   */
  error(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.error(message, ...args));
  }
  
  /**
   * 모든 로거의 로그 레벨을 설정합니다.
   * 
   * @param level 로그 레벨
   */
  setLevel(level: LogLevel): void {
    this.loggers.forEach(logger => logger.setLevel(level));
  }
  
  /**
   * 가장 낮은 로그 레벨을 반환합니다.
   * 
   * @returns 로그 레벨
   */
  getLevel(): LogLevel {
    if (this.loggers.length === 0) {
      return LogLevel.INFO;
    }
    
    const levels = this.loggers.map(logger => LOG_LEVEL_PRIORITY[logger.getLevel()]);
    const minPriority = Math.min(...levels);
    
    for (const [level, priority] of Object.entries(LOG_LEVEL_PRIORITY)) {
      if (priority === minPriority) {
        return level as LogLevel;
      }
    }
    
    return LogLevel.INFO;
  }
  
  /**
   * 로거를 추가합니다.
   * 
   * @param logger 추가할 로거
   */
  addLogger(logger: ILogger): void {
    this.loggers.push(logger);
  }
  
  /**
   * 로거를 제거합니다.
   * 
   * @param logger 제거할 로거
   * @returns 제거 성공 여부 (true/false)
   */
  removeLogger(logger: ILogger): boolean {
    const index = this.loggers.indexOf(logger);
    
    if (index !== -1) {
      this.loggers.splice(index, 1);
      return true;
    }
    
    return false;
  }
}

/**
 * 안전한 방식으로 에러를 로깅합니다.
 * 
 * @param logger 로거 인스턴스
 * @param error 에러 객체
 * @param prefix 로그 메시지 접두사
 */
export function safeLogError(logger: ILogger, error: any, prefix: string = 'Error:'): void {
  const details = extractErrorDetails(error);
  
  logger.error(`${prefix} ${details.message}`);
  
  if (details.stack) {
    logger.debug(`Error stack: ${details.stack}`);
  }
  
  if (details.code) {
    logger.debug(`Error code: ${details.code}`);
  }
  
  if (details.data) {
    logger.debug('Error data:', details.data);
  }
}
