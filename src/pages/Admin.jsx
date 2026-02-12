import { useState } from 'react';
import { getChosung } from '../utils/chosung';

export default function Admin({ onBack }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [category, setCategory] = useState('');
    const [answer, setAnswer] = useState('');
    const [hint, setHint] = useState('');
    const [generatedItems, setGeneratedItems] = useState([]);
    const [bulkJson, setBulkJson] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '1234') { // Simple password
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">관리자 로그인</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition-colors font-bold"
                        >
                            로그인
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full text-gray-500 hover:text-gray-700 underline text-sm"
                        >
                            돌아가기
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const handleAddSingle = () => {
        if (!category || !answer) {
            alert('카테고리와 정답은 필수입니다.');
            return;
        }
        const newItem = {
            category,
            answer,
            hint,
            chosung: getChosung(answer)
        };
        setGeneratedItems([newItem, ...generatedItems]);
        setAnswer('');
        setHint('');
    };

    const handleBulkProcess = () => {
        try {
            if (!bulkJson.trim()) return;

            const parsed = JSON.parse(bulkJson);
            let newItems = [];

            // Case 1: Array of objects [{answer: "...", hint: "..."}] -> need category
            if (Array.isArray(parsed)) {
                if (!category) {
                    alert('일괄 추가를 위해서는 카테고리를 먼저 입력해주세요.');
                    return;
                }
                newItems = parsed.map(item => ({
                    category,
                    answer: item.answer,
                    hint: item.hint || '',
                    chosung: getChosung(item.answer)
                }));
            }
            // Case 2: Object with categories {"영화": [...], "드라마": [...]}
            else if (typeof parsed === 'object') {
                Object.keys(parsed).forEach(cat => {
                    const items = parsed[cat];
                    if (Array.isArray(items)) {
                        const catItems = items.map(item => ({
                            category: cat,
                            answer: item.answer,
                            hint: item.hint || '',
                            chosung: getChosung(item.answer)
                        }));
                        newItems = [...newItems, ...catItems];
                    }
                });
            } else {
                alert('올바른 JSON 형식이 아닙니다.');
                return;
            }

            setGeneratedItems([...newItems, ...generatedItems]);
            setBulkJson('');
            alert(`${newItems.length}개의 문제가 추가되었습니다.`);
        } catch (e) {
            alert('JSON 파싱 오류: ' + e.message);
        }
    };

    const generateOutput = () => {
        const grouped = generatedItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push({
                answer: item.answer,
                hint: item.hint,
                chosung: item.chosung
            });
            return acc;
        }, {});

        return JSON.stringify(grouped, null, 2);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateOutput());
        setCopySuccess('복사되었습니다!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleClear = () => {
        if (confirm('모든 생성된 퀴즈 데이터를 삭제하시겠습니까?')) {
            setGeneratedItems([]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-indigo-600">🛠️ 퀴즈 데이터 생성기</h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium transition-colors"
                    >
                        게임으로 돌아가기
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-8">
                        {/* Single Input */}
                        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                            <h2 className="text-xl font-bold mb-4 text-indigo-900">✏️ 하나씩 추가하기</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                    <input
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        placeholder="예: 영화"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">정답</label>
                                    <input
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        placeholder="예: 기생충"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">힌트</label>
                                    <input
                                        value={hint}
                                        onChange={e => setHint(e.target.value)}
                                        placeholder="예: 봉준호 감독"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddSingle}
                                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-bold"
                                >
                                    추가하기
                                </button>
                            </div>
                        </div>

                        {/* Bulk Input */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                            <h2 className="text-xl font-bold mb-4 text-green-900">🤖 AI JSON 붙여넣기</h2>
                            <p className="text-sm text-gray-600 mb-2">
                                Claude나 ChatGPT가 만들어준 JSON을 여기에 붙여넣으세요.<br />
                                (배열인 경우 위에서 카테고리를 먼저 입력해야 합니다)
                            </p>
                            <textarea
                                value={bulkJson}
                                onChange={e => setBulkJson(e.target.value)}
                                className="w-full h-32 p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm"
                                placeholder='[
  {"answer": "기생충", "hint": "봉준호 감독"},
  {"answer": "범죄도시", "hint": "마동석"}
]'
                            />
                            <button
                                onClick={handleBulkProcess}
                                className="w-full mt-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-bold"
                            >
                                변환 및 추가하기
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">📋 결과 (quizData.js에 복사)</h2>
                            <div className="space-x-2">
                                <button
                                    onClick={handleClear}
                                    className="text-sm text-red-500 hover:text-red-700 underline"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>

                        <div className="relative flex-grow">
                            <pre className="w-full h-[500px] bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto font-mono text-sm leading-relaxed border border-gray-700 shadow-inner">
                                {generatedItems.length === 0 ? '// 아직 생성된 데이터가 없습니다.' : generateOutput()}
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded backdrop-blur-sm border border-white/20 transition-all"
                            >
                                {copySuccess || '복사하기'}
                            </button>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200 text-sm text-yellow-800">
                            💡 <strong>사용법:</strong> 위 코드를 복사해서 프로젝트의 <code>src/data/quizData.js</code> 파일 내용을 교체하세요. (import 문은 유지)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
