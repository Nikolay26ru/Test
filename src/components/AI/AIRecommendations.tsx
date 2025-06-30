import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { getAIRecommendations, buildUserContext } from '../../lib/gigachat';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AIRecommendationsProps {
  className?: string;
  onRecommendationClick?: (recommendation: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  className = '',
  onRecommendationClick
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Проверяем кэш
      const { data: cached } = await supabase
        .from('ai_recommendations')
        .select('recommendations_text, expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        setRecommendations(cached.recommendations_text);
        setLoading(false);
        return;
      }

      // Получаем новые рекомендации
      const context = await buildUserContext(user.id, supabase);
      const response = await getAIRecommendations({ context });

      if (response.error && !response.fallback) {
        setError(response.error);
      } else {
        setRecommendations(response.reply);
        
        // Сохраняем в кэш
        const contextHash = btoa(context).substring(0, 50);
        await supabase
          .from('ai_recommendations')
          .upsert({
            user_id: user.id,
            recommendations_text: response.reply,
            context_hash: contextHash,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
      }
    } catch (err) {
      console.error('AI recommendations error:', err);
      setError('Не удалось получить рекомендации. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const parseRecommendations = (text: string) => {
    return text
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•-]\s*/, '').trim())
      .filter(Boolean);
  };

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-teal-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            AI-рекомендации
          </h3>
        </div>
        
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {loading ? 'Загрузка...' : 'Обновить'}
          </span>
        </button>
      </div>

      {!recommendations && !loading && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Получите персонализированные рекомендации на основе ваших интересов
          </p>
          <button
            onClick={fetchRecommendations}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Получить рекомендации
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {recommendations && (
        <div className="space-y-3">
          {parseRecommendations(recommendations).map((rec, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer"
              onClick={() => onRecommendationClick?.(rec)}
            >
              <p className="text-gray-800 text-sm leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
          
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              💡 Нажмите на рекомендацию, чтобы добавить в список желаний
            </p>
          </div>
        </div>
      )}
    </div>
  );
};