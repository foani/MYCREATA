import winston from 'winston';
import { config } from '../config/app';

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(
    ({ level, message, timestamp, ...metadata }) => {
      let metaString = '';
      if (Object.keys(metadata).length > 0) {
        metaString = JSON.stringify(metadata, null, 2);
      }
      
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    }
  )
);

// 로거 인스턴스 생성
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // 개발 환경에서는 콘솔에 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // 파일에 로그 저장
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB 
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// 프로덕션 환경이 아닐 경우 추가적인 콘솔 설정
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// HTTP 요청 로깅을 위한 스트림
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
