/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/first */
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './index.scss';

import { CommentInfoType, Course } from '@/common/assets/types';
import { Comment } from '@/common/components';
import AnswerToStudent from '@/common/components/AnswerToStudent';
import LineChart from '@/common/components/chart';
import Label3 from '@/common/components/label3/label3';
import ShowStar from '@/common/components/showStar/showStar';
import { get } from '@/common/utils/fetch';

const coursePropertyMap = {
  CoursePropertyGeneralCore: '通识核心课',
  CoursePropertyGeneralElective: '通识选修课',
  CoursePropertyGeneralRequired: '通识必修课',
  CoursePropertyMajorCore: '专业主干课程',
  CoursePropertyMajorElective: '个性发展课程',
};

// 编写一个函数来根据英文描述获取中文描述
function translateCourseProperty(englishDescription) {
  // 使用数组的 find 方法查找匹配的项
  const entry = Object.entries(coursePropertyMap).find(
    ([key]) => key === englishDescription
  );

  // 如果找到了匹配项，返回中文描述，否则返回未找到的消息
  return entry ? entry[1] : '未找到对应的中文描述';
}

export default function Index() {
  const [course, setCourse] = useState<Course | null>(null);

  const [courseId, setCourseId] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentInfoType[]>([]);

  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      // 使用可选链操作符安全访问 router 和 params
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []); // 这个 effect 仅在组件挂载时运行一次

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`, true).then((res) => {
          console.log(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setCourse(res.data);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData().then((r) => console.log(r));

    // eslint-disable-next-line @typescript-eslint/require-await
    const getCommentData = async () => {
      try {
        void get(
          `/evaluations/list/courses/${courseId}?cur_evaluation_id=0&limit=100`,
          true
        ).then((res) => {
          console.log(res);
          setComments(res.data as CommentInfoType[]);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCommentData();
  }, [courseId]); // 在courseId变化时运行

  if (!course) {
    return <Text>Loading...</Text>; // 数据加载中
  }

  // 检查 course.features 是否存在并且是一个数组
  const featuresList =
    course.features && Array.isArray(course.features) ? course.features : [];

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <View className="classInfo">
      <View className="theClassnme">{course?.name}</View>
      <View className="teacherName">
        {course.school} {course.teacher}
      </View>
      <View className="p">
        综合评分: <ShowStar score={course.composite_score} />
        <Text>（共{course.rater_count}人评价）</Text>
      </View>
      <View className="p">
        课程分类: <Label3 content={translateCourseProperty(course.type)} />
      </View>
      <View className="p">
        课程特点: {}
        {/* @ts-ignore*/}
        {featuresList.map((feature, keyindex) => (
          <Label3 key={keyindex} content={feature} />
        ))}
      </View>
      {/*<>*/}
      <View className="h-1/3 w-5/6 pt-1.5">
        <LineChart className="text-center"></LineChart>
      </View>
      <View>
        <View>
          <View className="line-container pt-2.5 text-center text-xl">问问同学</View>
        </View>
        <>
          <AnswerToStudent></AnswerToStudent>
          <AnswerToStudent></AnswerToStudent>
        </>
        <View
          onClick={() => {
            void Taro.navigateTo({ url: '/pages/questionInfo/index' });
          }}
          className="text-right"
        >
          全部&gt;
        </View>
      </View>

      {comments &&
        comments.map((comment) => (
          <Comment
            onClick={(props) => {
              const serializedComment = encodeURIComponent(JSON.stringify(props));
              void Taro.navigateTo({
                url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
              });
            }}
            key={comment.id} // 使用唯一key值来帮助React识别哪些元素是不同的
            {...comment} // 展开comment对象，将属性传递给Comment组件
            type="inner" // 固定属性，不需要从数组中获取
          />
        ))}
    </View>
  );
}
