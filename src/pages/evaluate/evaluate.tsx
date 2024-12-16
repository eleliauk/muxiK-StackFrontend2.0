/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable import/first */
import { Button, Form, Radio, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './evaluate.scss';

import Label3 from '@/common/components/label3/label3';
import Star from '@/common/components/star/star';
import { post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';

import { features, testways } from './const';

export default function evaluate() {
  // 初始化状态，存储所有选中的 Radio 项的值
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // 处理 Radio 变化的函数
  const handleRadioChange = (value: string) => {
    const currentIndex = selectedValues.indexOf(value);
    if (currentIndex > -1) {
      // 如果值已选中，移除它
      const newSelectedValues = selectedValues.filter((v, i) => i !== currentIndex);
      setSelectedValues(newSelectedValues);
    } else {
      // 否则，添加这个值
      setSelectedValues([...selectedValues, value]);
    }
  };

  const [selectedFeatureValues, setSelectedFeatureValues] = useState<string[]>([]);

  const handleFeaturesChecked = (value: string) => {
    const currentIndex = selectedFeatureValues.indexOf(value);
    if (currentIndex > -1) {
      // 如果 id 已选中，移除它
      const newSelectedFeatureValues = selectedFeatureValues.filter(
        (v, i) => i !== currentIndex
      );
      setSelectedFeatureValues(newSelectedFeatureValues);
    } else {
      // 否则，添加这个 id
      setSelectedFeatureValues([...selectedFeatureValues, value]);
    }
  };

  const [textLength, setLength] = useState(0);
  const [comment, setComment] = useState('');

  const countContent = (e) => {
    const { value } = e.detail;
    setComment(value); // 更新状态为当前输入框的值
    const length = value.length;
    setLength(length);
  };

  // const course_id = 1; //暂时先指定一个courseId来测试使用

  // 更新 id 状态为 number 类型
  const [courseId, setId] = useState<number | null>(null);
  const [courseName, setName] = useState<string | null>('只能评价自己学过的课程哦');
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = () => {
      void postBool('/checkStatus', { name: 'kestack' }).then(
        (res: { data: { status: boolean } }) => {
          setTest(res?.data?.status);
        }
      );
      const instance = Taro.getCurrentInstance();
      // 使用可选链操作符安全访问 router 和 params
      const params = instance?.router?.params || {};

      // 确保 id 是 number 类型
      setId(params.id ? Number(params.id) : null);
      // 解码 name 参数
      setName(params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦');
    };

    getParams();
  }, [test]); // 这个 effect 仅在组件挂载时运行一次

  const postEvaluation = () => {
    if (selectedStarIndex === -1) {
      void Taro.showToast({
        title: '请为课程选择星级',
        icon: 'none',
      });
      return;
    }
    const evaluationobj = {
      star_rating: selectedStarIndex,
      content: comment,
      course_id: courseId,
      assessments: selectedValues,
      features: selectedFeatureValues,
      id: 0,
      status: 'Public',
    };
    void Taro.showLoading({
      title: '发布中',
    });
    post(`/evaluations/save`, evaluationobj)
      .then((res) => {
        if (res.code === 0) {
          // 打印成功信息，但最好使用其他日志记录方式，而不是 console.log
          // 例如：this.setState({ message: '发布课评成功' });
          // 或者使用 Taro 的日志记录方式：Taro.showToast({ title: '发布课评成功', icon: 'success' });
          // console.log('发布课评成功');
          // 使用 redirectTo 跳转
          void Taro.showToast({ title: '发布课评成功', icon: 'success' }).then(() => {
            void Taro.switchTab({
              url: '/pages/main/index', // 页面路径
            });
          });
        } else {
          // 处理其他响应代码，可能需要给用户一些反馈
          // 例如：Taro.showToast({ title: '发布课评失败', icon: 'none' });
          void Taro.showToast({ title: '发布课评失败', icon: 'none' });
        }
      })
      .catch((error) => {
        // 处理可能出现的错误情况
        // 例如：Taro.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
        void Taro.showToast({ title: '发布失败，请稍后重试', icon: 'none' });
        console.error('发布课评请求失败:', error);
      })
      .finally(() => {
        Taro.hideLoading();
      });
  };

  //星级部分的代码
  const [selectedStarIndex, setSelectedStarIndex] = useState(-1);

  const onStarClick = (index) => {
    console.log('选中的星级索引:', index);
    setSelectedStarIndex(index + 1);
    // 执行其他需要的逻辑
  };

  const onLableClick = () => {
    if (courseName == '只能评价自己学过的课程哦') {
      void Taro.navigateTo({
        url: '/pages/myclass/myclass',
      });
    }
  };

  return (
    <>
      {test ? (
        <View>因为政策原因暂不能发布课评</View>
      ) : (
        <Form className="view">
          <View className="p">
            <Text> 选择课程 : </Text>
            <Label3 handleClick={onLableClick} content={courseName}></Label3>
          </View>
          <View className="p">
            <Text>评价星级 :</Text>
            <Star onStarClick={onStarClick} />
          </View>
          <View className="p">
            <Text>考核方式 :</Text>
            <View className="ways">
              {testways.map((item) => (
                <Radio
                  key={item.value}
                  className="myradio"
                  checked={selectedValues.includes(item.value)}
                  value={item.value}
                  color="transparent"
                  onClick={() => handleRadioChange(item.value)}
                >
                  {item.text}
                </Radio>
              ))}
            </View>
          </View>
          <View className="p">
            <Text>课程特点</Text>
            <View className="fea">
              {features.map((item) => {
                return (
                  <Label3
                    key={item.value}
                    id={item.value} // 确保 Label3 组件可以访问到 id
                    content={item.content}
                    checked={selectedFeatureValues.includes(item.value)} // 判断是否包含该项的 id
                    handleChecked={() => handleFeaturesChecked(item.value)} // 传递 handleChecked 函数
                  />
                );
              })}
            </View>
          </View>
          <Textarea
            maxlength={450}
            onInput={countContent}
            placeholderStyle="font-size: 25rpx;"
            placeholder="输入课程评价"
            className="myComment"
          ></Textarea>
          <Text className="zsxz">字数限制{textLength}/450</Text>
          {/* 按钮样式采用 style 强制覆盖 */}
          <Button
            style={{ marginTop: 0, height: 30 }}
            className="h-30 w-4/5 rounded-full bg-[#FFD777]"
            onClick={postEvaluation}
          >
            发布
          </Button>
        </Form>
      )}
    </>
  );
}
