/**
 * Сервіс для управління інтерфейсом
 */
class UIManager {
    constructor() {
        this.modal = document.getElementById(CONFIG.MODAL.SETTINGS_ID);
        this.form = document.getElementById(CONFIG.MODAL.FORM_ID);
        this.startButton = document.getElementById(CONFIG.BUTTONS.START_TEST_ID);
        this.testContainer = document.getElementById('testContainer');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.mistakesSection = document.querySelector('.mistakes-section');
        this.resultsScore = document.querySelector('.results-score');
        this.restartButton = document.getElementById('restartTest');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Закриття модального вікна при кліку поза ним
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Обробник кнопки перезапуску тесту
        this.restartButton.addEventListener('click', () => {
            this.hideResults();
            this.showModal();
        });
    }

    /**
     * Показує модальне вікно
     */
    showModal() {
        this.modal.style.display = 'block';
    }

    /**
     * Приховує модальне вікно
     */
    hideModal() {
        this.modal.style.display = 'none';
    }

    /**
     * Отримує налаштування з форми
     * @returns {Object} Налаштування тесту
     */
    getSettings() {
        const shuffleQuestions = document.getElementById(CONFIG.MODAL.SHUFFLE_CHECKBOX_ID).checked;
        const startQuestion = parseInt(document.getElementById('startQuestion').value);
        const endQuestion = parseInt(document.getElementById('endQuestion').value);

        if (startQuestion < 1 || endQuestion < startQuestion) {
            throw new Error('Неправильний діапазон питань. Початкове питання має бути менше за кінцеве.');
        }

        return {
            shuffleQuestions,
            startQuestion,
            endQuestion
        };
    }

    /**
     * Показує питання
     * @param {Object} question Питання для відображення
     */
    showQuestion(question, onAnswer) {
        this.testContainer.style.display = 'block';
        this.testContainer.innerHTML = `
            <div class="question">
                <h3 class="question-text">${question.text}</h3>
                <div class="answers">
                    ${question.answers.map((answer, index) => `
                        <div class="answer-option" data-index="${index}">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Додаємо обробники подій для варіантів відповідей
        const answerOptions = this.testContainer.querySelectorAll('.answer-option');
        answerOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedIndex = parseInt(option.dataset.index);
                onAnswer(selectedIndex);
            });
        });
    }

    showAnswerResult(selectedIndex, correctIndex) {
        const answerOptions = this.testContainer.querySelectorAll('.answer-option');
        
        answerOptions.forEach((option, index) => {
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                option.classList.add('incorrect');
            }
        });
    }

    /**
     * Показує результат тесту
     * @param {number} correctAnswers Кількість правильних відповідей
     * @param {number} totalQuestions Загальна кількість питань
     */
    showResults(correctAnswers, totalQuestions, mistakes) {
        this.testContainer.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        this.resultsScore.innerHTML = `
            <p>Правильних відповідей: ${correctAnswers} з ${totalQuestions}</p>
            <p>Відсоток успішності: ${percentage}%</p>
        `;

        if (mistakes && mistakes.length > 0) {
            this.mistakesSection.innerHTML = `
                <h3>Помилки:</h3>
                ${mistakes.map(mistake => `
                    <div class="mistake-item">
                        <div class="mistake-question">${mistake.question}</div>
                        <div class="mistake-answer">ТВоя відповідь: ${mistake.userAnswer}</div>
                        <div class="correct-answer">Правильна відповідь: ${mistake.correctAnswer}</div>
                    </div>
                `).join('')}
            `;
        } else {
            this.mistakesSection.innerHTML = '<p>Харош</p>';
        }
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
} 