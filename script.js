document.addEventListener('DOMContentLoaded', () => {
    const article = document.querySelector('.blog-post');
    const readingTime = document.getElementById('reading-time');
    if (article && readingTime) {
        const words = article.textContent.trim().split(/\s+/).filter(Boolean).length;
        readingTime.textContent = `Reading time: ${Math.max(1, Math.ceil(words / 200))} min`;
    }

    const toggle = document.getElementById('theme-toggle');
    const root = document.documentElement;
    if (toggle) {
        const savedTheme = localStorage.getItem('site-theme') || 'dark';
        root.dataset.theme = savedTheme;
        toggle.setAttribute('aria-pressed', String(savedTheme === 'light'));
        toggle.addEventListener('click', () => {
            const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
            root.dataset.theme = nextTheme;
            localStorage.setItem('site-theme', nextTheme);
            toggle.setAttribute('aria-pressed', String(nextTheme === 'light'));
        });
    }

    const questions = [...document.querySelectorAll('.quiz-question')];
    const feedback = document.getElementById('quiz-feedback');
    const progress = document.getElementById('quiz-progress');
    const previous = document.getElementById('quiz-prev');
    const next = document.getElementById('quiz-next');
    const dots = document.getElementById('quiz-dots');
    let currentQuestion = 0;
    let score = 0;

    if (questions.length && previous && next && dots) {
        questions.forEach((question, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'quiz-dot';
            dot.setAttribute('aria-label', `Go to question ${index + 1}`);
            dot.addEventListener('click', () => showQuestion(index));
            dots.appendChild(dot);
            question.querySelectorAll('.quiz-btn').forEach((option) => option.addEventListener('click', () => {
                if (question.dataset.answered === 'true') return;
                question.dataset.answered = 'true';
                const correct = option.dataset.correct === 'true';
                if (correct) score += 1;
                option.classList.add(correct ? 'state-success' : 'state-error');
                question.querySelectorAll('.quiz-btn').forEach((item) => { item.disabled = true; });
                feedback.className = `quiz-feedback ${correct ? 'success' : 'error'}`;
                feedback.textContent = correct ? 'Correct. Nice work.' : 'Not quite. Review the explanation above and keep going.';
            }));
        });

        function showQuestion(index) {
            currentQuestion = Math.max(0, Math.min(index, questions.length - 1));
            questions.forEach((question, questionIndex) => question.classList.toggle('hidden', questionIndex !== currentQuestion));
            [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentQuestion));
            progress.textContent = `${currentQuestion + 1} / ${questions.length}`;
            previous.disabled = currentQuestion === 0;
            next.textContent = currentQuestion === questions.length - 1 ? 'Finish' : 'Next →';
            if (questions[currentQuestion].dataset.answered !== 'true') feedback.className = 'quiz-feedback hidden';
        }

        previous.addEventListener('click', () => showQuestion(currentQuestion - 1));
        next.addEventListener('click', () => {
            if (currentQuestion < questions.length - 1) {
                showQuestion(currentQuestion + 1);
            } else {
                feedback.className = 'quiz-feedback success';
                feedback.textContent = `Quiz complete: ${score} / ${questions.length} correct. Revisit any topic where you want more practice.`;
            }
        });
        showQuestion(0);
    }

    const tooltip = document.getElementById('glossary-tooltip');
    if (tooltip && typeof aiDictionary !== 'undefined') {
        document.querySelectorAll('.glossary-term').forEach((term) => {
            term.addEventListener('mouseenter', () => {
                const definition = aiDictionary[term.dataset.term];
                if (!definition) return;
                tooltip.textContent = definition;
                tooltip.classList.remove('hidden');
                const bounds = term.getBoundingClientRect();
                const maxLeft = window.scrollX + window.innerWidth - tooltip.offsetWidth - 16;
                tooltip.style.top = `${bounds.bottom + window.scrollY + 10}px`;
                tooltip.style.left = `${Math.max(window.scrollX + 16, Math.min(bounds.left + window.scrollX, maxLeft))}px`;
            });
            term.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
        });
    }
});