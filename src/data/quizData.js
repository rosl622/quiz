import { getChosung } from '../utils/chosung';

const rawQuizData = {
    영화: [
        { answer: '기생충', hint: '봉준호 감독 작품' },
        { answer: '범죄도시', hint: '마동석 주연 영화' },
        { answer: '어벤져스', hint: '마블 히어로 모음' },
        { answer: '타이타닉', hint: '침몰하는 배와 사랑' },
        { answer: '인셉션', hint: '꿈 속의 꿈' },
    ],
    드라마: [
        { answer: '오징어게임', hint: '456억원의 상금' },
        { answer: '도깨비', hint: '공유, 김고은 주연' },
        { answer: '사랑의불시착', hint: '패러글라이딩 사고' },
        { answer: '더글로리', hint: '학교폭력 복수극' },
        { answer: '응답하라', hint: '남편 찾기 시리즈' },
    ],
    음식: [
        { answer: '김치찌개', hint: '한국의 대표적인 찌개' },
        { answer: '떡볶이', hint: '매콤달콤한 분식' },
        { answer: '삼겹살', hint: '회식 메뉴 1위' },
        { answer: '치킨', hint: '맥주와 환상의 짝꿍' },
        { answer: '피자', hint: '이탈리아 유래, 둥근 도우' },
    ]
};

// Automatically generate Chosung for all items
export const quizData = Object.keys(rawQuizData).reduce((acc, category) => {
    acc[category] = rawQuizData[category].map(item => ({
        ...item,
        chosung: getChosung(item.answer)
    }));
    return acc;
}, {});
