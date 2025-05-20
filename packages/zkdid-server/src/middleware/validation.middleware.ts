import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationError } from 'express-validator';
import { validationResult, checkSchema } from 'express-validator';
import { logger } from '../utils/logging';

/**
 * 검증 미들웨어 생성 함수
 * express-validator의 checkSchema를 사용해 요청 데이터를 검증합니다.
 */
export const validate = (schema: Schema) => {
  return [
    checkSchema(schema),
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        // 검증 오류 로깅
        logger.debug('Validation errors:', errors.array());
        
        // 에러 응답
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
          }))
        });
      }
      
      next();
    }
  ];
};
