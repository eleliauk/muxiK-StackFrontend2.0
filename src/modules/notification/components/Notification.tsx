/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { VirtualList } from '@/common/components';
import { formatIsoDate, get, getUserInfo } from '@/common/utils';

import { MessageItem, OfficialItem } from './Items';
import TabBar from './TabBar';
import type { Message as MessageType } from './types';

const Notification: React.FC = memo(() => {
  const [tab, setTab] = useState<string>('提问');
  const [commentMessage, setCommentMessage] = useState<MessageType[]>([]);
  const [supportMessage, setSupportMessage] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const currentMessage = useMemo(() => {
    return tab === '提问' ? commentMessage : tab === '点赞' ? supportMessage : [];
  }, [tab, commentMessage, supportMessage]);
  const [ctime, setCtime] = useState<number>(0);
  const [end, setEnd] = useState(false);
  const fetchData = async () => {
    try {
      const res = await get(
        `/feed/events_list?last_time=${ctime}&direction=${'After'}&limit=${10}`
      );
      if (Array.isArray(res.data)) {
        setCtime(res.data.at(-1)?.ctime ?? 0);
      } else {
        setEnd(true);
      }
      const personalItems = async (items, itemType) => {
        return Promise.all(
          items.map(async (item) => {
            let detailRes, parentRes, user;
            if (itemType === 'Comment') {
              detailRes = await get(`/comments/${item.Ext.commentId}/detail`);
              parentRes = await get(
                `/comments/${detailRes.data.parent_comment_id}/detail`
              );
              user = await getUserInfo(item.Ext.commentator);
            } else if (itemType === 'Support') {
              detailRes =
                item.Ext.biz === 'Evaluation'
                  ? await get(`/evaluations/${item.Ext.bizId}/detail`)
                  : await get(`/answers/${item.Ext.bizId}/detail`);
              user = await getUserInfo(item.Ext.supporter);
            }

            return {
              username: user.nickname,
              avatar: user.avatar,
              eventType: itemType === 'Comment',
              description: itemType === 'Comment' && detailRes.data?.content,
              comment:
                itemType === 'Comment'
                  ? parentRes.data?.content
                  : detailRes.data?.content,
              timestamp: formatIsoDate(item.Ctime as string),
            };
          })
        );
      };

      if (tab === '提问') {
        const comments = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Comment')
              .map((item) => JSON.parse(item.content))
          : [];
        setCommentMessage([
          ...commentMessage,
          ...(await personalItems(comments, 'Comment')),
        ]);
      } else if (tab === '点赞') {
        const supports = Array.isArray(res.data)
          ? res.data
              .filter((item) => item.type === 'Support')
              .map((item) => JSON.parse(item.content))
          : [];
        setSupportMessage([
          ...supportMessage,
          ...(await personalItems(supports, 'Support')),
        ]);
      } else {
        console.log('官方');
      }
      Taro.hideLoading();
      setLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching data:', error);
    }
  };

  const handleScroll = useCallback(
    (event) => {
      if (end) return;
      if (!loading) {
        console.log('fetching', event);
        void fetchData();
      }
    },
    [loading, currentMessage.length, end]
  );

  useEffect(() => {
    void Taro.showLoading({
      title: '加载中',
    });
    setLoading(true);
    setCommentMessage([]);
    setSupportMessage([]);
    void fetchData();
  }, [tab]);

  return (
    <View className="flex h-screen w-full flex-col items-center gap-4 overflow-y-scroll pb-[13vh]">
      <TabBar tab={tab} setTab={setTab} />
      <VirtualList
        height="70%"
        width="100%"
        item={tab === '提问' || tab === '点赞' ? MessageItem : OfficialItem}
        itemData={currentMessage}
        itemCount={
          tab === '提问'
            ? commentMessage.length
            : tab === '点赞'
              ? supportMessage.length
              : 1
        }
        itemSize={tab === '提问' || tab === '点赞' ? 120 : 300}
        onScroll={handleScroll}
      />
    </View>
  );
});

export default Notification;
