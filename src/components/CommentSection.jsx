import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function CommentSection() {
    const [comments, setComments] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }
            setComments(data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
            // setError('댓글을 불러오는데 실패했습니다.'); 
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !content.trim() || !password.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('comments')
                .insert([{ username, password, content }]);

            if (error) {
                throw error;
            }

            setContent('');
            // Keep username/password for convenience? user might want to clear them. 
            // Design usually keeps them or clears all. Let's clear content only.
            fetchComments();
            setError(null);
        } catch (err) {
            console.error('Error submitting comment:', err);
            setError('댓글 작성에 실패했습니다. (테이블이 없거나 권한 문제일 수 있습니다)');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, correctPassword) => {
        const inputPassword = prompt('댓글 삭제 비밀번호를 입력하세요:');
        if (!inputPassword) return;

        if (inputPassword !== correctPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert('삭제되었습니다.');
            fetchComments();
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('삭제에 실패했습니다.');
        }
    };

    // Helper for formatting date like "2026-02-12 02:06:08"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="w-full mx-auto mt-12 mb-20 font-sans">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                댓글 <span className="text-gray-500 text-base font-normal">({comments.length})</span>
            </h3>

            <div className="bg-gray-50 p-6 rounded-xl mb-10 border border-gray-100">
                <p className="text-xs text-gray-500 mb-4 bg-white/50 p-3 rounded border border-gray-100">
                    ⚠️ 댓글 작성 시 IP가 기록되며 사이트 이용 제한이나 요청에 따라 법적 조치가 취해질 수 있습니다.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="닉네임"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
                            maxLength={10}
                            required
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none"
                            maxLength={20}
                            required
                        />
                    </div>

                    <div className="relative">
                        <textarea
                            placeholder="주제와 무관한 댓글, 악플은 삭제될 수 있습니다."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="block p-4 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none outline-none"
                            maxLength={200}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute bottom-2 right-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
                        >
                            {loading ? '...' : '작성하기'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </form>
            </div>

            <div className="space-y-0 divide-y divide-gray-100">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">첫 번째 댓글의 주인공이 되어보세요!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="py-4">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {comment.username}
                                    </span>
                                    <span className="text-xs text-gray-400 font-light">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(comment.id, comment.password)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                        title="삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap break-all leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CommentSection;
