import { logger } from './logger';
import { statusCode, statusMessage } from '../enums/status';

export const noContentResponse = (res: any, data: any, message = 'No data found') => {
  logger.info('No content response', {
    endpoint: res.req?.originalUrl,
    method: res.req?.method,
    statusCode: statusCode.NO_CONTENT,
    message,
  });

  return res.status(statusCode.NO_CONTENT).json({
    message: message,
    data: data,
    status: statusMessage.NO_CONTENT,
    statusCode: statusCode.NO_CONTENT,
  });
};

export const successResponse = (res: any, data: any, message = 'Operation Successfull') => {
  logger.info('Success response', {
    endpoint: res.req?.originalUrl,
    method: res.req?.method,
    statusCode: statusCode.SUCCESS,
    message,
  });

  return res.status(statusCode.SUCCESS).json({
    message: message,
    data: data,
    status: statusMessage.SUCCESS,
    statusCode: statusCode.SUCCESS,
  });
};

export const successResponseArr = (
  res: any,
  data: any,
  paginationData = {},
  message = 'Operation Successfull'
) => {
  logger.info('Success array response', {
    endpoint: res.req?.originalUrl,
    method: res.req?.method,
    statusCode: statusCode.SUCCESS,
    dataCount: Array.isArray(data) ? data.length : 0,
    message,
  });

  return res.status(statusCode.SUCCESS).json({
    message: message,
    data: data,
    columns: data.length > 0 ? [] : [],
    paginationData: paginationData,
    status: statusMessage.SUCCESS,
    statusCode: statusCode.SUCCESS,
  });
};

export const errorResponse = (res: any, error: any, message = 'Something went wrong') => {
  logger.error('Error response', {
    endpoint: res.req?.originalUrl,
    method: res.req?.method,
    statusCode: statusCode.ERROR,
    message,
    error: error?.message || error,
    stack: error?.stack,
  });

  const response = {
    message: message,
    data: error,
    status: statusMessage.ERROR,
    statusCode: statusCode.ERROR,
  };

  return res.status(statusCode.ERROR).json(response);
};

export const badRequestResponse = (res: any, data: any, message = 'Bad request') => {
  logger.warn('Bad request response', {
    endpoint: res.req?.originalUrl,
    method: res.req?.method,
    statusCode: statusCode.BAD_REQUEST,
    message,
    data,
  });

  return res.status(statusCode.BAD_REQUEST).json({
    message: message,
    data: data,
    status: statusMessage.BAD_REQUEST,
    statusCode: statusCode.BAD_REQUEST,
  });
};

// Add Columns key to Users APIss
