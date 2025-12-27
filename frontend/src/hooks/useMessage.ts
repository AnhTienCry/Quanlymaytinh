import { App } from 'antd';

/**
 * Custom hook để sử dụng Ant Design message với App context
 * Thay thế cho message trực tiếp từ antd
 */
export function useMessage() {
  const { message } = App.useApp();
  return message;
}

export default useMessage;

