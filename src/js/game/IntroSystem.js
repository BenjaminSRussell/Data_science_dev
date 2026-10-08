/**
 * IntroSystem.js
 * Handles game introduction, tutorial, and job application flow
 * First thing shown after clicking "New Career"
 */

import { logger } from '../utils/Logger.js';

export class IntroSystem {
    constructor(game) {
        this.game = game;
        this.selectedJob = null; // card the player highlighted; Enter applies it (#1317)
        this.hired = false;
    }

    /**
     * Weekly pay for the starter job picked in onboarding (#1071). Freelance
     * income swings between 50% and 150% of its base.
     */
    static weeklyPay(job, rand = Math.random) {
        const base = Math.max(0, Number(job?.salary) || 0);
        if (!base) return 0;
        if (job?.id === 'freelance') return Math.round(base * (0.5 + rand()));
        return base;
    }

    /**
     * Show intro flow (video -> text)
     */
    showIntro() {
        const videoScreen = document.getElementById('screen-intro-video');
        const video = document.getElementById('intro-video');
        const skipBtn = document.getElementById('btn-skip-video');

        if (!videoScreen || !video) {
            this.showIntroText();
            return;
        }

        // Show video screen
        videoScreen.classList.remove('hidden');

        // Respect the game's sound settings (#867)
        const audio = this.game?.audioManager;
        if (audio) {
            video.muted = audio.soundEnabled === false;
            const vol = Number(audio.soundVolume);
            if (Number.isFinite(vol)) video.volume = Math.max(0, Math.min(1, vol));
        }

        let finished = false;
        const finishVideo = () => {
            // Skip + ended (or a late play() rejection) must not show the
            // intro text twice
            if (finished) return;
            finished = true;
            video.pause();
            video.onended = null;
            if (skipBtn) skipBtn.onclick = null;
            videoScreen.classList.add('hidden');
            this.showIntroText();
        };

        // The <video> element is static, so a replayed intro would resume
        // where the last one stopped; always start from the beginning (#2000)
        try {
            video.currentTime = 0;
        } catch {
            // Some browsers throw before metadata loads; play() starts at 0 then
        }

        // Setup listeners
        video.onended = finishVideo;
        if (skipBtn) skipBtn.onclick = finishVideo;

        // Start playback
        video.play().catch(err => {
            logger.warn('Video playback failed, skipping to text:', err);
            finishVideo();
        });
    }

    /**
     * Show intro text screen
     */
    showIntroText() {
        // A job board left over from a previous run is stale (#1316)
        document.getElementById('job-application-screen')?.remove();
        this.hired = false;
        // Create intro screen if not exists
        let intro = document.getElementById('intro-screen');
        if (!intro) {
            intro = this.createIntroScreen();
            document.body.appendChild(intro);
        }

        intro.classList.add('active');
    }

    /**
     * Create intro screen HTML
     */
    createIntroScreen() {
        const screen = document.createElement('div');
        screen.id = 'intro-screen';
        screen.className = 'intro-screen';

        screen.innerHTML = `
            <div class="intro-content">
                <h1 class="intro-title">Welcome to Data City</h1>
                <p class="intro-subtitle">Your journey to becoming a data science legend begins now</p>
                
                <div class="intro-story">
                    <p>You've just arrived in <span class="intro-highlight">Data City</span> with nothing but a laptop and a dream.</p>
                    <p>You found a small apartment and a <span class="intro-highlight">roommate</span> to split the rent. It's not much, but it's a start.</p>
                    <p>The streets are filled with opportunity - tech startups, Fortune 500 companies, and eccentric millionaires looking for the next big thing.</p>
                    <p>But first, you need a <span class="intro-highlight">job</span>. Rent is due in 7 days, and your savings won't last forever.</p>
                    <p><strong>Your Journey:</strong> Start as a Data Entry Clerk, complete tasks to earn money and reputation, build relationships with NPCs, make choices that shape your story, and climb from entry-level to Chief Data Officer.</p>
                    <p><strong>The Story:</strong> Every decision matters. Your ethics, relationships, and choices create a unique narrative. Will you take the high road or cut corners? Will you build genuine connections or use people? The city responds to who you become.</p>
                    <p>Build your skills. Make connections. Rise through the ranks. Maybe even start your own empire.</p>
                    <p><span class="intro-highlight">Your story starts now.</span></p>
                </div>
                
                <div class="intro-steps">
                    <div class="intro-step">
                        <div class="intro-step-number">1</div>
                        <div class="intro-step-title">Get a Job</div>
                        <div class="intro-step-desc">Start with entry-level work to pay the bills</div>
                    </div>
                    <div class="intro-step">
                        <div class="intro-step-number">2</div>
                        <div class="intro-step-title">Build Skills</div>
                        <div class="intro-step-desc">Learn, grow, and unlock new opportunities</div>
                    </div>
                    <div class="intro-step">
                        <div class="intro-step-number">3</div>
                        <div class="intro-step-title">Rise Up</div>
                        <div class="intro-step-desc">Become the data legend you were meant to be</div>
                    </div>
                </div>
                
                <button class="intro-btn" id="btn-intro-find-job">
                    Find a Job →
                </button>
            </div>
        `;

        // Add event listener for the button
        setTimeout(() => {
            const btn = screen.querySelector('#btn-intro-find-job');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showJobApplication();
                });
            }
        }, 0);

        return screen;
    }

    /**
     * Hide intro and show job application
     */
    showJobApplication() {
        // Hide intro
        const intro = document.getElementById('intro-screen');
        if (intro) intro.classList.remove('active');

        // Create job application screen
        let jobScreen = document.getElementById('job-application-screen');
        if (!jobScreen) {
            jobScreen = this.createJobApplicationScreen();
            document.body.appendChild(jobScreen);
        }

        jobScreen.classList.add('active');
    }

    /**
     * Create job application screen
     */
    createJobApplicationScreen() {
        const screen = document.createElement('div');
        screen.id = 'job-application-screen';
        screen.className = 'job-application-screen';

        const jobs = this.getStarterJobs();

        screen.innerHTML = `
            <div class="job-app-header">
                <h2 class="job-app-title"> Job Board</h2>
                <p class="job-app-subtitle">Choose your first position - everyone has to start somewhere!</p>
            </div>
            
            <div class="job-listings" id="job-listings-container">
                ${jobs.map(job => this.renderJobCard(job)).join('')}
            </div>
        `;

        // Add event listeners after creating the screen
        setTimeout(() => {
            // Add click handlers for job cards; Enter on a selected card applies (#1317)
            screen.querySelectorAll('.job-card').forEach(card => {
                const jobId = card.dataset.jobId;
                card.addEventListener('click', () => {
                    this.selectJob(jobId);
                });
                card.addEventListener('keydown', (e) => {
                    if (e.target !== card) return; // the Apply button handles itself
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (this.selectedJob === jobId) this.applyForJob();
                        else this.selectJob(jobId);
                    }
                });
            });

            // Add click handlers for apply buttons
            screen.querySelectorAll('.job-card-apply').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const jobId = btn.closest('.job-card')?.dataset.jobId;
                    if (jobId) {
                        this.applyForJob(jobId);
                    }
                });
            });
        }, 0);

        return screen;
    }

    /**
     * Get starter job options
     */
    getStarterJobs() {
        return [
            {
                id: 'data_entry_clerk',
                title: 'Data Entry Clerk',
                company: 'DataFlow Inc.',
                salary: '$400/week',
                salaryNum: 400,
                hours: '9-5',
                difficulty: 'Easy',
                description: 'Enter data into spreadsheets. Simple but steady work.',
                skills: ['Focus', 'Attention to Detail'],
                perks: ['Flexible schedule', 'Free coffee']
            },
            {
                id: 'junior_analyst',
                title: 'Junior Data Analyst',
                company: 'Analytics Pro',
                salary: '$600/week',
                salaryNum: 600,
                hours: '9-6',
                difficulty: 'Medium',
                description: 'Analyze data and create reports. More challenging but better pay.',
                skills: ['Excel', 'Basic Statistics'],
                perks: ['Learning opportunities', 'Team lunches']
            },
            {
                id: 'freelance',
                title: 'Freelance Data Work',
                company: 'Self-Employed',
                salary: 'Variable',
                salaryNum: 300,
                hours: 'Flexible',
                difficulty: 'Variable',
                description: 'Be your own boss. Income varies with effort and luck.',
                skills: ['Self-motivation', 'Client management'],
                perks: ['Freedom', 'Work from anywhere']
            },
            {
                id: 'intern',
                title: 'Data Science Intern',
                company: 'TechCorp',
                salary: '$200/week',
                salaryNum: 200,
                hours: 'Part-time',
                difficulty: 'Easy',
                description: 'Learn from the best. Low pay but amazing experience.',
                skills: ['Eagerness to learn'],
                perks: ['Mentorship', 'Potential for full-time offer']
            }
        ];
    }

    /**
     * Render job card HTML
     */
    renderJobCard(job) {
        return `
            <div class="job-card" data-job-id="${job.id}" tabindex="0" role="button" aria-label="${job.title} at ${job.company}">
                <div class="job-card-header">
                    <div>
                        <div class="job-card-title">${job.title}</div>
                        <div class="job-card-company">${job.company}</div>
                    </div>
                </div>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem; font-size: 0.9rem;">
                    ${job.description}
                </p>
                <div class="job-card-details">
                    <div class="job-card-detail">
                        <span class="job-card-label">Salary</span>
                        <span class="job-card-value money">${job.salary}</span>
                    </div>
                    <div class="job-card-detail">
                        <span class="job-card-label">Hours</span>
                        <span class="job-card-value">${job.hours}</span>
                    </div>
                    <div class="job-card-detail">
                        <span class="job-card-label">Difficulty</span>
                        <span class="job-card-value">${job.difficulty}</span>
                    </div>
                </div>
                ${this.renderJobTags('Skills', job.skills)}
                ${this.renderJobTags('Perks', job.perks)}
                <button class="job-card-apply" data-job-id="${job.id}">
                    Apply for This Job
                </button>
            </div>
        `;
    }

    /** Skills / perks row on a job card (#1070) */
    renderJobTags(label, items) {
        if (!Array.isArray(items) || items.length === 0) return '';
        const escape = (t) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        return `
                <div class="job-card-tags">
                    <span class="job-card-label">${label}</span>
                    <span class="job-card-value">${items.map(escape).join(', ')}</span>
                </div>`;
    }

    /**
     * Select a job (highlight)
     */
    selectJob(jobId) {
        // Remove previous selection
        document.querySelectorAll('.job-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const card = document.querySelector(`.job-card[data-job-id="${jobId}"]`);
        if (card) {
            card.classList.add('selected');
            this.selectedJob = jobId;
        }
    }

    /**
     * Apply for job and start game
     */
    applyForJob(jobId = this.selectedJob) {
        // A fast double-click must not hire twice (#1999)
        if (this.hired) return;
        const jobs = this.getStarterJobs();
        const job = jobs.find(j => j.id === jobId);

        if (!job) return;
        this.hired = true;
        this.selectedJob = job.id;

        // Set job in game state; salary is paid weekly (#1071)
        this.game.gameState.currentJob = {
            id: job.id,
            title: job.title,
            company: job.company,
            salary: job.salaryNum,
            difficulty: job.difficulty,
            startDate: Date.now()
        };

        // Close job application screen
        const jobScreen = document.getElementById('job-application-screen');
        if (jobScreen) jobScreen.classList.remove('active');

        // Show welcome message
        this.showJobWelcome(job);
    }

    /**
     * Show welcome message after getting job
     */
    showJobWelcome(job) {
        // Reuse-if-present, like the sibling screens (#1999)
        if (this.welcomeOverlay?.isConnected) return;
        // Create welcome overlay
        const overlay = document.createElement('div');
        overlay.className = 'intro-screen active';
        overlay.innerHTML = `
            <div class="intro-content">
                <h1 class="intro-title"> Congratulations!</h1>
                <p class="intro-subtitle">You've been hired!</p>
                
                <div class="intro-story">
                    <p>You are now a <span class="intro-highlight">${job.title}</span> at ${job.company}.</p>
                    <p>Your salary is <span class="intro-highlight">${job.salary}</span>.</p>
                    <p>Show up on time, do good work, and who knows where this might lead?</p>
                    <p>Remember: <span class="intro-highlight">rent is due every 7 days</span>. Don't forget to save money!</p>
                </div>
                
                <button class="intro-btn" id="btn-intro-start-game">
                    Start Your New Life →
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add event listener for start button
        setTimeout(() => {
            const btn = overlay.querySelector('#btn-intro-start-game');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.startGame();
                });
            }
        }, 0);

        // Store reference to remove later
        this.welcomeOverlay = overlay;
    }

    /**
     * Start the actual game
     */
    startGame() {
        // Remove welcome overlay
        if (this.welcomeOverlay) {
            this.welcomeOverlay.remove();
        }

        this.welcomeOverlay = null;

        // Remove intro screen and the job board, so a later new game starts
        // from fresh DOM (#1316)
        const intro = document.getElementById('intro-screen');
        if (intro) intro.remove();
        document.getElementById('job-application-screen')?.remove();

        // Continue with normal game start
        this.game.finishGameStart();
    }
}

