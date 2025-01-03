/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { get } from '@/common/utils';

const getUserInfo = (userId: number): Promise<User> => {
  return get(`/users/${userId}/profile`).then((res) => {
    if (res.code === 0 && res.data) {
      return res.data;
    }
    throw new Error('User not found');
  });
};

export default getUserInfo;
