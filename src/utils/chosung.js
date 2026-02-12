export const getChosung = (text) => {
    const CHOSUNG_LIST = [
        'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
        'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
    ];

    return text.split('').map(char => {
        const code = char.charCodeAt(0) - 44032;
        if (code < 0 || code > 11171) return char;
        return CHOSUNG_LIST[Math.floor(code / 588)];
    }).join('');
};
