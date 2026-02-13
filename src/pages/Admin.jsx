import { useState } from 'react';
import { getChosung } from '../utils/chosung';

export default function Admin({ onBack }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' or 'converter'

    // --- Prompt Generator State ---
    const [promptCategory, setPromptCategory] = useState('영화');
    const [promptCount, setPromptCount] = useState(10);
    const [promptDifficulty, setPromptDifficulty] = useState('보통 (적당히)');
    const [promptRequirements, setPromptRequirements] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    // --- Converter State ---
    const [convCategory, setConvCategory] = useState('');
    const [convAnswer, setConvAnswer] = useState('');
    const [convHint, setConvHint] = useState('');
    const [convImage, setConvImage] = useState('');
    const [bulkJson, setBulkJson] = useState('');
    const [csvData, setCsvData] = useState('');
    const [generatedItems, setGeneratedItems] = useState([]);

    // --- Common State ---
    const [copySuccess, setCopySuccess] = useState('');

    // Authentication
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    // --- Prompt Generator Logic ---
    const generatePrompt = () => {
        const difficultyMap = {
            '쉬움 (유명한 것만)': '쉬움 - 대부분의 사람들이 아는 유명한 것만',
            '보통 (적당히)': '보통 - 적당히 알려진 것들',
            '어려움 (마니아용)': '어려움 - 마니아들만 아는 것 포함'
        };

        const prompt = `${promptCategory} 카테고리의 초성 퀴즈 문제를 ${promptCount}개 만들어줘.

[요구사항]
- 난이도: ${difficultyMap[promptDifficulty]}
- 형식: JSON 배열로 작성
- 각 문제는 answer(정답), hint(힌트), image(이미지 URL, 선택) 필드 포함
- 초성은 자동 생성할 거니까 필요 없음
${promptRequirements ? `- 추가 조건: ${promptRequirements}` : ''}

[출력 형식 예시]
\`\`\`json
[
  { "answer": "기생충", "hint": "봉준호 감독, 아카데미 작품상" },
  { "answer": "범죄도시", "hint": "마동석 주연의 액션 영화" }
]
\`\`\`

위 형식으로 ${promptCount}개의 문제를 생성해줘. JSON만 출력하고 다른 설명은 생략해줘.`;
        setGeneratedPrompt(prompt);
    };

    // --- Converter Logic ---
    const addItem = (category, answer, hint) => {
        return {
            category,
            answer: answer.trim(),
            hint: hint.trim(),
            image: image || '',
            chosung: getChosung(answer.trim())
        };
    };

    const handleAddSingle = () => {
        if (!convCategory || !convAnswer) {
            alert('카테고리와 정답은 필수입니다.');
            return;
        }
        const newItem = addItem(convCategory, convAnswer, convHint, convImage);
        setGeneratedItems([newItem, ...generatedItems]);
        setConvAnswer('');
        setConvHint('');
        setConvImage('');
    };

    const handleBulkJson = () => {
        try {
            if (!bulkJson.trim()) return;
            const parsed = JSON.parse(bulkJson);
            let newItems = [];

            if (Array.isArray(parsed)) {
                if (!convCategory) {
                    alert('일괄 추가를 위해서는 카테고리를 먼저 입력해주세요.');
                    return;
                }
                newItems = parsed.map(item => addItem(convCategory, item.answer, item.hint || '', item.image || ''));
            } else if (typeof parsed === 'object') {
                Object.keys(parsed).forEach(cat => {
                    const items = parsed[cat];
                    if (Array.isArray(items)) {
                        newItems = [...newItems, ...items.map(item => addItem(cat, item.answer, item.hint || '', item.image || ''))];
                    }
                });
            }
            setGeneratedItems([...newItems, ...generatedItems]);
            setBulkJson('');
            alert(`${newItems.length}개의 문제가 추가되었습니다.`);
        } catch (e) {
            alert('JSON 파싱 오류: ' + e.message);
        }
    };

    const handleCsv = () => {
        if (!csvData.trim()) return;
        if (!convCategory) {
            alert('CSV 변환을 위해서는 카테고리를 먼저 입력해주세요.');
            return;
        }
        const lines = csvData.split('\n').filter(l => l.trim());
        const newItems = lines.map(line => {
            const [answer, hint] = line.split(',').map(s => s.trim());
            return addItem(convCategory, answer, hint || '', '');
        });
        setGeneratedItems([...newItems, ...generatedItems]);
        setCsvData('');
        alert(`${newItems.length}개의 문제가 추가되었습니다.`);
    };

    // --- Output Generator ---
    const generateOutput = () => {
        const grouped = generatedItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push({
                answer: item.answer,
                hint: item.hint,
                image: item.image,
                chosung: item.chosung
            });
            return acc;
        }, {});
        return JSON.stringify(grouped, null, 2);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess('복사되었습니다!');
        setTimeout(() => setCopySuccess(''), 2000);
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
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition-colors font-bold">로그인</button>
                        <button type="button" onClick={onBack} className="w-full text-gray-500 hover:text-gray-700 underline text-sm">돌아가기</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                    <h1 className="text-2xl font-bold">🛠️ 퀴즈 관리자</h1>
                    <button onClick={onBack} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition text-sm font-medium">돌아가기</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`flex-1 py-4 text-center font-bold ${activeTab === 'prompt' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        🤖 AI 프롬프트 생성기
                    </button>
                    <button
                        onClick={() => setActiveTab('converter')}
                        className={`flex-1 py-4 text-center font-bold ${activeTab === 'converter' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        🔄 데이터 변환기 (JSON/CSV)
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* --- TAB 1: Prompt Generator --- */}
                    {activeTab === 'prompt' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800">1. 옵션 선택</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                        <select value={promptCategory} onChange={e => setPromptCategory(e.target.value)} className="w-full p-2 border rounded">
                                            <option>영화</option>
                                            <option>드라마</option>
                                            <option>음식</option>
                                            <option>K-POP</option>
                                            <option>게임</option>
                                            <option>동물</option>
                                            <option>상식</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">문제 개수</label>
                                        <select value={promptCount} onChange={e => setPromptCount(e.target.value)} className="w-full p-2 border rounded">
                                            <option>10</option>
                                            <option>20</option>
                                            <option>30</option>
                                            <option>50</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                                        <select value={promptDifficulty} onChange={e => setPromptDifficulty(e.target.value)} className="w-full p-2 border rounded">
                                            <option>쉬움 (유명한 것만)</option>
                                            <option>보통 (적당히)</option>
                                            <option>어려움 (마니아용)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">추가 요구사항</label>
                                        <textarea
                                            value={promptRequirements}
                                            onChange={e => setPromptRequirements(e.target.value)}
                                            className="w-full p-2 border rounded h-20"
                                            placeholder="예: 2020년 이후 작품만, 한국 영화만 등"
                                        />
                                    </div>
                                    <button onClick={generatePrompt} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 transition">프롬프트 생성</button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">2. 프롬프트 복사</h2>
                                <div className="relative">
                                    <textarea
                                        readOnly
                                        value={generatedPrompt}
                                        className="w-full h-80 bg-gray-50 p-4 border rounded font-mono text-sm leading-relaxed"
                                        placeholder="옵션을 선택하고 버튼을 누르면 여기에 프롬프트가 생성됩니다."
                                    />
                                    {generatedPrompt && (
                                        <button
                                            onClick={() => copyToClipboard(generatedPrompt)}
                                            className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                                        >
                                            복사하기
                                        </button>
                                    )}
                                </div>
                                <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200">
                                    <strong>💡 사용법:</strong> 위 프롬프트를 복사해서 <strong>Claude</strong>나 <strong>ChatGPT</strong>에게 붙여넣으세요.
                                    AI가 답변으로 준 JSON 코드를 <strong>"데이터 변환기"</strong> 탭에서 변환하면 됩니다.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: Data Converter --- */}
                    {activeTab === 'converter' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800">데이터 입력</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 (필수)</label>
                                        <input
                                            value={convCategory}
                                            onChange={e => setConvCategory(e.target.value)}
                                            placeholder="예: 영화"
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Accordion-like approach or just stacked sections */}
                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">A. 하나씩 추가</h3>
                                        <div className="flex gap-2 mb-2">
                                            <input value={convAnswer} onChange={e => setConvAnswer(e.target.value)} placeholder="정답 (예: 기생충)" className="flex-1 p-2 border rounded text-sm" />
                                            <input value={convHint} onChange={e => setConvHint(e.target.value)} placeholder="힌트" className="flex-1 p-2 border rounded text-sm" />
                                        </div>
                                        <div className="mb-2">
                                            <input value={convImage} onChange={e => setConvImage(e.target.value)} placeholder="이미지 URL (선택)" className="w-full p-2 border rounded text-sm" />
                                        </div>
                                        <button onClick={handleAddSingle} className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 font-medium">추가</button>
                                    </div>

                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <h3 className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide">B. AI JSON 붙여넣기 (추천!)</h3>
                                        <textarea
                                            value={bulkJson}
                                            onChange={e => setBulkJson(e.target.value)}
                                            placeholder='[ {"answer": "답", "hint": "힌트"}, ... ]'
                                            className="w-full h-24 p-2 border rounded text-sm font-mono mb-2"
                                        />
                                        <button onClick={handleBulkJson} className="w-full bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 font-medium">변환 및 추가</button>
                                    </div>

                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <h3 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">C. CSV 붙여넣기</h3>
                                        <textarea
                                            value={csvData}
                                            onChange={e => setCsvData(e.target.value)}
                                            placeholder='정답, 힌트 (한 줄에 하나씩)'
                                            className="w-full h-24 p-2 border rounded text-sm font-mono mb-2"
                                        />
                                        <button onClick={handleCsv} className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 font-medium">변환 및 추가</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col h-full">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800">생성된 코드 (quizData.js)</h2>
                                    <button onClick={() => setGeneratedItems([])} className="text-red-500 text-sm hover:underline">초기화</button>
                                </div>
                                <div className="relative flex-grow">
                                    <textarea
                                        readOnly
                                        value={generatedItems.length === 0 ? '// 데이터가 추가되면 여기에 코드가 나타납니다.' : generateOutput()}
                                        className="w-full h-full min-h-[400px] bg-gray-900 text-green-400 p-4 rounded font-mono text-sm leading-relaxed"
                                    />
                                    {generatedItems.length > 0 && (
                                        <button
                                            onClick={() => copyToClipboard(generateOutput())}
                                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded backdrop-blur-sm border border-white/20 transition"
                                        >
                                            {copySuccess || '코드 복사'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
