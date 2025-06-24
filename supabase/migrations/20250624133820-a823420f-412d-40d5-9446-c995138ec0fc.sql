
-- Enhanced Content Quality Analyzer
CREATE OR REPLACE FUNCTION analyze_content_quality(content_text TEXT)
RETURNS JSON AS $$
DECLARE
    word_count INTEGER;
    sentence_count INTEGER;
    paragraph_count INTEGER;
    heading_count INTEGER;
    link_count INTEGER;
    quality_score INTEGER;
    result JSON;
BEGIN
    -- Count words
    word_count := array_length(string_to_array(regexp_replace(content_text, '[^a-zA-Z0-9\\s]', ' ', 'g'), ' '), 1);
    
    -- Count sentences  
    sentence_count := array_length(string_to_array(content_text, '.'), 1) - 1;
    IF sentence_count < 1 THEN sentence_count := 1; END IF;
    
    -- Count paragraphs
    paragraph_count := array_length(string_to_array(content_text, E'\\n\\n'), 1);
    
    -- Count headings (look for markdown headers)
    heading_count := char_length(content_text) - char_length(replace(content_text, '#', ''));
    
    -- Count links (basic markdown link detection)
    link_count := char_length(content_text) - char_length(replace(content_text, '](', ''));
    
    -- Calculate quality score
    quality_score := 0;
    IF word_count > 300 THEN quality_score := quality_score + 25; END IF;
    IF heading_count > 0 THEN quality_score := quality_score + 25; END IF;
    IF link_count > 0 THEN quality_score := quality_score + 20; END IF;
    IF sentence_count > 5 THEN quality_score := quality_score + 15; END IF;
    IF paragraph_count > 2 THEN quality_score := quality_score + 15; END IF;
    
    -- Build result JSON
    result := json_build_object(
        'word_count', word_count,
        'sentence_count', sentence_count,
        'paragraph_count', paragraph_count,
        'heading_count', heading_count,
        'link_count', link_count,
        'quality_score', quality_score,
        'reading_time_minutes', CEIL(word_count / 200.0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- AI-Friendly Content Checker
CREATE OR REPLACE FUNCTION check_ai_friendliness(content_text TEXT)
RETURNS JSON AS $$
DECLARE
    has_qa_format BOOLEAN;
    has_citations BOOLEAN;
    has_clear_structure BOOLEAN;
    has_bullet_points BOOLEAN;
    paragraph_avg_length DECIMAL;
    ai_score INTEGER := 0;
    result JSON;
BEGIN
    -- Check for Q&A format
    has_qa_format := (content_text ~* '(what|how|why|when|where)\\s+.+\\?');
    
    -- Check for citations (simple pattern)
    has_citations := (content_text ~* '\\([^)]*\\d{4}[^)]*\\)');
    
    -- Check for clear structure (headings)
    has_clear_structure := (content_text ~* '^#+\\s+.+$');
    
    -- Check for bullet points or lists
    has_bullet_points := (content_text ~* '^\\s*[\\*\\-\\+]\\s+.+$');
    
    -- Calculate average paragraph length
    SELECT AVG(char_length(para)) INTO paragraph_avg_length
    FROM unnest(string_to_array(content_text, E'\\n\\n')) AS para
    WHERE char_length(para) > 10;
    
    IF paragraph_avg_length IS NULL THEN paragraph_avg_length := 0; END IF;
    
    -- Calculate AI-friendliness score
    IF has_qa_format THEN ai_score := ai_score + 25; END IF;
    IF has_citations THEN ai_score := ai_score + 25; END IF;
    IF has_clear_structure THEN ai_score := ai_score + 20; END IF;
    IF has_bullet_points THEN ai_score := ai_score + 15; END IF;
    IF paragraph_avg_length < 500 THEN ai_score := ai_score + 15; END IF;
    
    result := json_build_object(
        'ai_score', ai_score,
        'has_qa_format', has_qa_format,
        'has_citations', has_citations,
        'has_clear_structure', has_clear_structure,
        'has_bullet_points', has_bullet_points,
        'avg_paragraph_length', paragraph_avg_length,
        'recommendations', CASE 
            WHEN ai_score < 50 THEN json_build_array(
                'Add Q&A sections',
                'Include source citations', 
                'Use clear headings',
                'Break up long paragraphs'
            )
            ELSE json_build_array('Content is AI-friendly!')
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Keyword Density Analyzer
CREATE OR REPLACE FUNCTION analyze_keywords(content_text TEXT, target_keyword TEXT)
RETURNS JSON AS $$
DECLARE
    total_words INTEGER;
    keyword_count INTEGER;
    density DECIMAL;
    first_occurrence INTEGER;
    last_occurrence INTEGER;
    result JSON;
BEGIN
    -- Clean and count total words
    total_words := array_length(
        string_to_array(
            regexp_replace(lower(content_text), '[^a-z\\s]', '', 'g'), 
            ' '
        ), 
        1
    );
    
    -- Count keyword occurrences (case insensitive)
    keyword_count := (
        char_length(lower(content_text)) - 
        char_length(replace(lower(content_text), lower(target_keyword), ''))
    ) / char_length(target_keyword);
    
    -- Calculate density as percentage
    density := ROUND((keyword_count::DECIMAL / total_words * 100), 2);
    
    -- Find first and last occurrence positions
    first_occurrence := position(lower(target_keyword) in lower(content_text));
    last_occurrence := char_length(content_text) - position(
        lower(target_keyword) in reverse(lower(content_text))
    ) + 1;
    
    result := json_build_object(
        'total_words', total_words,
        'keyword_count', keyword_count,
        'density_percent', density,
        'optimal_count', CEIL(total_words * 0.02), -- 2% target
        'first_occurrence', first_occurrence,
        'last_occurrence', last_occurrence,
        'well_distributed', (first_occurrence < total_words * 0.1 AND last_occurrence > total_words * 0.8)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
