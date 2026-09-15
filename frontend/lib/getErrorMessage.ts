import {
  ApiError,
} from "./errors";

export function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof ApiError
  ) {
    if (
      error.status === 404
    ) {
      return "请求的数据不存在。";
    }

    if (
      error.status === 422
    ) {
      return "提交的数据格式不正确，请检查输入。";
    }

    if (
      error.status >= 500
    ) {
      return "服务器暂时出现问题，请稍后再试。";
    }

    return error.message;
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "发生未知错误。";
}