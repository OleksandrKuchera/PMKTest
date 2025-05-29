/**
 * Сервіс для роботи з DOCX файлом
 */
class DocumentParser {
    /**
     * Завантажує та парсить DOCX файл
     * @returns {Promise<Array<{question: string, answers: string[]}>>} Масив питань
     */
    static async parseDocument() {
        try {
            const response = await fetch(CONFIG.QUESTIONS_FILE);
            const arrayBuffer = await response.arrayBuffer();
            const { value: text } = await mammoth.extractRawText({ arrayBuffer });
            console.log('[DEBUG] Текст з docx:', text.slice(0, 1000)); // показуємо перші 1000 символів

            // Розбиваємо текст на блоки питань
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            const questions = [];
            let currentQuestion = null;
            let currentAnswers = [];
            const questionPattern = /^\d{1,3}\)/;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (questionPattern.test(line)) {
                    if (currentQuestion && currentAnswers.length > 0) {
                        questions.push({
                            question: currentQuestion,
                            answers: currentAnswers
                        });
                    }
                    currentQuestion = line.replace(/^\d{1,3}\)/, '').trim();
                    currentAnswers = [];
                } else if (currentQuestion) {
                    if (line.length === 0) continue; // ігноруємо порожні рядки
                    // Якщо є ; або . — розбиваємо, інакше додаємо як є
                    if (/[;.]/.test(line)) {
                        const parts = line.split(/[;.]/).map(a => a.trim()).filter(Boolean);
                        currentAnswers.push(...parts);
                    } else {
                        currentAnswers.push(line);
                    }
                }
            }
            if (currentQuestion && currentAnswers.length > 0) {
                questions.push({
                    question: currentQuestion,
                    answers: currentAnswers
                });
            }
            console.log(`[DEBUG] Знайдено питань: ${questions.length}`);
            return questions;
        } catch (error) {
            console.error('Помилка при парсингу документа:', error);
            throw new Error('Не вдалося завантажити питання');
        }
    }
} 