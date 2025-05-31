/**
 * Сервіс для управління тестами
 */
class TestManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.mistakes = [];
    }

    /**
     * Ініціалізує тест з заданими налаштуваннями
     * @param {Object} settings Налаштування тесту
     * @returns {Promise<void>}
     */
    async initializeTest(settings) {
        try {
            console.log('Починаємо завантаження тесту...');
            const response = await fetch(CONFIG.QUESTIONS_FILE);
            console.log('Файл завантажено:', response);
            
            const arrayBuffer = await response.arrayBuffer();
            console.log('Конвертуємо в HTML...');
            
            const result = await mammoth.convertToHtml({ arrayBuffer });
            console.log('HTML конвертовано. Перші 500 символів:', result.value.substring(0, 500));
            
            // Парсимо питання з HTML
            this.questions = this.parseQuestions(result.value);
            console.log('Знайдено питань:', this.questions.length);
            
            // Відбираємо питання з вказаного діапазону
            const startIndex = Math.max(0, settings.startQuestion - 1);
            const endIndex = Math.min(this.questions.length, settings.endQuestion);
            this.questions = this.questions.slice(startIndex, endIndex);
            
            if (settings.shuffleQuestions) {
                this.shuffleQuestions();
            }
            // Перемішуємо відповіді для кожного питання
            this.shuffleAnswersForAllQuestions();
            
            this.currentQuestionIndex = 0;
            this.mistakes = [];
            
            console.log('Тест успішно ініціалізовано');
        } catch (error) {
            console.error('Помилка при завантаженні тесту:', error);
            throw new Error('Помилка при завантаженні питань: ' + error.message);
        }
    }

    parseQuestions(html) {
        const questions = [];
        // Замінюємо <p>, <li> і ; на \n для розділення блоків
        let cleanText = html.replace(/<\/?(p|li)[^>]*>/g, '\n');
        cleanText = cleanText.replace(/;/g, '\n');
        // Видаляємо всі інші HTML теги
        cleanText = cleanText.replace(/<[^>]+>/g, '');
        // Розбиваємо на рядки
        const lines = cleanText.split(/\n/).map(l => l.trim()).filter(l => l);

        let currentQuestion = null;
        let collectingAnswers = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Якщо це питання (рядок починається з N) без пробілу після дужки)
            if (line.match(/^\d+\)[^ ]/)) {
                // Якщо вже є питання — зберігаємо його
                if (currentQuestion && currentQuestion.answers.length > 0) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    text: line.replace(/^\d+\)/, '').trim(),
                    answers: [],
                    correctAnswer: 0 // Перший варіант завжди правильний
                };
                collectingAnswers = true;
                continue;
            }
            // Якщо це відповідь (рядок починається з N) з пробілом після дужки)
            if (collectingAnswers && currentQuestion && line.match(/^\d+\) /)) {
                currentQuestion.answers.push(line.replace(/^\d+\) /, '').trim());
                continue;
            }
        }
        // Додаємо останнє питання, якщо воно не було додано
        if (currentQuestion && currentQuestion.answers.length > 0) {
            questions.push(currentQuestion);
        }
        console.log('Парсинг завершено. Всього питань:', questions.length);
        if (questions.length > 0) {
            console.log('Приклад першого питання:', questions[0]);
        }
        return questions;
    }

    /**
     * Перемішує питання
     */
    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    /**
     * Перемішує відповіді для всіх питань
     */
    shuffleAnswersForAllQuestions() {
        this.questions.forEach(question => {
            // Створюємо масив пар [відповідь, чи правильна]
            const answerPairs = question.answers.map((answer, idx) => ({
                answer,
                isCorrect: idx === question.correctAnswer
            }));
            // Перемішуємо
            for (let i = answerPairs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [answerPairs[i], answerPairs[j]] = [answerPairs[j], answerPairs[i]];
            }
            // Оновлюємо answers і correctAnswer
            question.answers = answerPairs.map(pair => pair.answer);
            question.correctAnswer = answerPairs.findIndex(pair => pair.isCorrect);
        });
    }

    /**
     * Отримує поточне питання
     * @returns {Object} Поточне питання
     */
    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        return this.questions[this.currentQuestionIndex];
    }

    /**
     * Перевіряє відповідь
     * @param {string} selectedIndex Індекс відповіді користувача
     * @returns {boolean} Результат перевірки
     */
    checkAnswer(selectedIndex) {
        const question = this.getCurrentQuestion();
        const isCorrect = selectedIndex === question.correctAnswer;

        if (!isCorrect) {
            this.mistakes.push({
                question: question.text,
                userAnswer: question.answers[selectedIndex],
                correctAnswer: question.answers[question.correctAnswer]
            });
        }

        return isCorrect;
    }

    /**
     * Переходить до наступного питання
     * @returns {boolean} Чи є ще питання
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        return this.currentQuestionIndex < this.questions.length;
    }

    getMistakes() {
        return this.mistakes;
    }
} 