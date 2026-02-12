import { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { quizData } from './data/quizData';
import Admin from './pages/Admin';
import CommentSection from './components/CommentSection';

function App() {
  const [category, setCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [gameStatus, setGameStatus] = useState('menu'); // menu, playing, end, admin
  const [feedback, setFeedback] = useState(''); // correct, incorrect, timeout
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAdmin, setIsAdmin] = useState(false);

  // Game Options
  const [isRandom, setIsRandom] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [currentQuizList, setCurrentQuizList] = useState([]);

  const categories = Object.keys(quizData);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (gameStatus === 'playing' && timeLeft > 0 && feedback === '') {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && feedback === '') {
      handleTimeout();
    }
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft, feedback]);

  const handleTimeout = () => {
    setFeedback('timeout');
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handlePass = () => {
    setFeedback('pass');
    setTimeLeft(0); // Stop timer visually
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const startGame = (selectedCategory) => {
    setCategory(selectedCategory);

    // Process Quiz Data based on options
    let quizzes = [...quizData[selectedCategory]];

    if (isRandom) {
      quizzes = quizzes.sort(() => Math.random() - 0.5);
    }

    if (questionCount < quizzes.length) {
      quizzes = quizzes.slice(0, questionCount);
    }

    setCurrentQuizList(quizzes);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowHint(false);
    setUserInput('');
    setGameStatus('playing');
    setFeedback('');
    setTimeLeft(15); // Reset timer per game? Or per question. Reset in nextQuestion too.
  };

  const currentQuiz = currentQuizList[currentQuestionIndex];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() && feedback !== 'timeout' && feedback !== 'pass') return;

    if (userInput.trim() === currentQuiz.answer) {
      setScore(score + 1);
      setFeedback('correct');
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setFeedback('incorrect');
      setTimeout(() => {
        setFeedback('');
      }, 1000);
    }
  };

  const nextQuestion = () => {
    setFeedback('');
    setUserInput('');
    setShowHint(false);
    setTimeLeft(15); // Reset timer for next question

    if (currentQuestionIndex < currentQuizList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameStatus('end');
    }
  };

  const resetGame = () => {
    setGameStatus('menu');
    setCategory(null);
  };

  if (gameStatus === 'admin') {
    return <Admin onBack={resetGame} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Jay를 위한 사자성어 게임</h1>

        {gameStatus === 'menu' && (
          <div className="space-y-4">

            {/* Game Options */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">⚙️ 게임 설정</h3>

              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-600">문제 순서</label>
                <div className="flex bg-white rounded border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setIsRandom(false)}
                    className={`px-3 py-1 text-xs font-bold ${!isRandom ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    순서대로
                  </button>
                  <button
                    onClick={() => setIsRandom(true)}
                    className={`px-3 py-1 text-xs font-bold ${isRandom ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    랜덤
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">문제 개수</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="text-sm border-gray-300 rounded border p-1 focus:border-indigo-500 outline-none"
                >
                  <option value={5}>5문제</option>
                  <option value={10}>10문제</option>
                  <option value={20}>20문제</option>
                  <option value={50}>50문제</option>
                  <option value={100}>최대</option>
                </select>
              </div>
            </div>

            <p className="text-center text-gray-600 mb-6 font-medium">주제를 선택하세요</p>
            <div className="grid gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => startGame(cat)}
                  className="w-full py-4 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors font-semibold text-lg"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <button
                onClick={() => setGameStatus('admin')}
                className="text-xs text-gray-400 hover:text-indigo-500 underline transition-colors"
              >
                관리자 / 문제 생성기
              </button>
            </div>
          </div>
        )}

        {gameStatus === 'playing' && currentQuiz && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-500">{category}</span>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                  ⏰ {timeLeft}초
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {currentQuestionIndex + 1} / {currentQuizList.length}
                </span>
              </div>
            </div>

            {/* Progress Bar for Timer */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              ></div>
            </div>

            <div className="text-center mb-8">
              <div className="text-6xl font-black text-gray-800 tracking-widest mb-4">
                {currentQuiz.chosung}
              </div>

              {showHint || category === '사자성어' ? (
                <div className="text-amber-600 font-medium bg-amber-50 py-2 px-4 rounded-lg inline-block animate-fade-in">
                  💡 {category === '사자성어' ? '뜻' : '힌트'}: {currentQuiz.hint}
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  힌트 보기
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={feedback !== ''}
                className={`w-full p-4 text-center text-xl border-2 rounded-lg focus:outline-none transition-colors 
                    ${feedback === 'correct' ? 'border-green-500 bg-green-50' :
                    feedback === 'incorrect' ? 'border-red-500 bg-red-50' :
                      feedback === 'timeout' || feedback === 'pass' ? 'border-gray-500 bg-gray-100' :
                        'border-gray-200 focus:border-indigo-500'
                  }`}
                placeholder={feedback === 'timeout' ? '시간 초과!' : feedback === 'pass' ? '패스했습니다' : "정답을 입력하세요"}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={feedback !== ''}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  정답 확인
                </button>
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={feedback !== ''}
                  className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  패스
                </button>
              </div>
            </form>

            {feedback === 'correct' && (
              <div className="mt-4 text-center text-green-600 font-bold animate-bounce">
                정답입니다! 🎉
              </div>
            )}
            {feedback === 'incorrect' && (
              <div className="mt-4 text-center text-red-600 font-bold animate-shake">
                틀렸습니다. 다시 시도해보세요.
              </div>
            )}
            {feedback === 'timeout' && (
              <div className="mt-4 text-center text-gray-600 font-bold">
                시간이 다 되었습니다! 😅 <br />
                정답은 <span className="text-indigo-600 font-bold">{currentQuiz.answer}</span> 입니다.
              </div>
            )}
            {feedback === 'pass' && (
              <div className="mt-4 text-center text-gray-600 font-bold">
                문제를 건너뛰었습니다. 💨 <br />
                정답은 <span className="text-indigo-600 font-bold">{currentQuiz.answer}</span> 입니다.
              </div>
            )}
          </div>
        )}

        {gameStatus === 'end' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">게임 종료!</h2>
            <p className="text-gray-600 mb-8">
              당신의 점수는 <span className="text-indigo-600 font-bold text-2xl">{score}</span>점 입니다.
            </p>
            <button
              onClick={resetGame}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
              처음으로 돌아가기
            </button>
          </div>
        )}
      </div>

      {/* Comment Section */}
      <div className="w-full max-w-2xl mt-8">
        <CommentSection />
      </div>

      <Analytics />
    </div>
  );
}

export default App;
