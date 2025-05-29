/**
 * Головний файл додатку
 */
class App {
    constructor() {
        this.testManager = new TestManager();
        this.uiManager = new UIManager();
        this.correctAnswers = 0;
        
        this.initializeEventListeners();
    }

    /**
     * Ініціалізує обробники подій
     */
    initializeEventListeners() {
        // Обробник кнопки "Розпочати тест"
        this.uiManager.startButton.addEventListener('click', () => {
            this.uiManager.showModal();
        });

        // Обробник форми налаштувань
        this.uiManager.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const settings = this.uiManager.getSettings();
                await this.startTest(settings);
            } catch (error) {
                alert(error.message);
            }
        });
    }

    /**
     * Починає тест
     * @param {Object} settings Налаштування тесту
     */
    async startTest(settings) {
        try {
            await this.testManager.initializeTest(settings);
            this.uiManager.hideModal();
            this.correctAnswers = 0;
            this.showNextQuestion();
        } catch (error) {
            alert('Помилка при завантаженні тесту: ' + error.message);
        }
    }

    /**
     * Показує наступне питання
     */
    showNextQuestion() {
        const question = this.testManager.getCurrentQuestion();
        
        if (question) {
            this.uiManager.showQuestion(question, (selectedIndex) => {
                const isCorrect = this.testManager.checkAnswer(selectedIndex);
                this.uiManager.showAnswerResult(selectedIndex, question.correctAnswer);
                
                if (isCorrect) {
                    this.correctAnswers++;
                }

                // Затримка перед наступним питанням
                setTimeout(() => {
                    if (this.testManager.nextQuestion()) {
                        this.showNextQuestion();
                    } else {
                        this.finishTest();
                    }
                }, 1500);
            });
        } else {
            this.finishTest();
        }
    }

    /**
     * Завершує тест
     */
    finishTest() {
        const totalQuestions = this.testManager.questions.length;
        const mistakes = this.testManager.getMistakes();
        this.uiManager.showResults(this.correctAnswers, totalQuestions, mistakes);
    }
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 