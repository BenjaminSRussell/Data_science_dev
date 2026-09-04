/**
 * ResearchPaperNotificationSystem.js
 * Real-world research papers in notification inbox
 * Showcases AI development and world changes
 */

export class ResearchPaperNotificationSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.inbox = [];
        this.readPapers = new Set();
        this.papers = this.initializeResearchPapers();
        this.scheduledPapers = this.schedulePapers();
    }
    
    /**
     * Initialize real-world research papers
     */
    initializeResearchPapers() {
        return {
            // Pre-Attention Era (2014-2016)
            'vgg_net_2014': {
                id: 'vgg_net_2014',
                title: 'Very Deep Convolutional Networks for Large-Scale Image Recognition',
                authors: 'Simonyan & Zisserman',
                year: 2014,
                venue: 'ICLR',
                phase: 'pre_attention',
                description: 'Introduced VGG networks, showing that depth is crucial for performance. This paper demonstrated the importance of deep architectures in computer vision.',
                impact: 'Revolutionized computer vision, leading to deeper networks',
                keywords: ['CNN', 'Computer Vision', 'Deep Learning'],
                url: 'https://arxiv.org/abs/1409.1556',
                timeline: 2014,
                unlocked: false
            },
            
            'resnet_2015': {
                id: 'resnet_2015',
                title: 'Deep Residual Learning for Image Recognition',
                authors: 'He et al.',
                year: 2015,
                venue: 'CVPR',
                phase: 'pre_attention',
                description: 'Introduced residual connections, allowing training of extremely deep networks (152+ layers). Solved the vanishing gradient problem.',
                impact: 'Enabled training of much deeper networks, won ImageNet 2015',
                keywords: ['ResNet', 'Residual Networks', 'Deep Learning'],
                url: 'https://arxiv.org/abs/1512.03385',
                timeline: 2015,
                unlocked: false
            },
            
            'lstm_2015': {
                id: 'lstm_2015',
                title: 'LSTM: A Search Space Odyssey',
                authors: 'Greff et al.',
                year: 2015,
                venue: 'IEEE Transactions',
                phase: 'pre_attention',
                description: 'Comprehensive analysis of LSTM variants. Showed that most LSTM components are important, but forget gate and output activation are crucial.',
                impact: 'Clarified LSTM architecture, influenced RNN design',
                keywords: ['LSTM', 'RNN', 'Recurrent Networks'],
                url: 'https://arxiv.org/abs/1503.04069',
                timeline: 2015,
                unlocked: false
            },
            
            'batch_norm_2015': {
                id: 'batch_norm_2015',
                title: 'Batch Normalization: Accelerating Deep Network Training',
                authors: 'Ioffe & Szegedy',
                year: 2015,
                venue: 'ICML',
                phase: 'pre_attention',
                description: 'Introduced batch normalization, allowing faster training and higher learning rates. Made deep networks more stable.',
                impact: 'Became standard in almost all deep learning architectures',
                keywords: ['Batch Normalization', 'Training', 'Optimization'],
                url: 'https://arxiv.org/abs/1502.03167',
                timeline: 2015,
                unlocked: false
            },
            
            'gan_2014': {
                id: 'gan_2014',
                title: 'Generative Adversarial Networks',
                authors: 'Goodfellow et al.',
                year: 2014,
                venue: 'NIPS',
                phase: 'pre_attention',
                description: 'Introduced GANs - a framework for training generative models through adversarial training. Generator vs Discriminator.',
                impact: 'Revolutionized generative modeling, led to realistic image generation',
                keywords: ['GAN', 'Generative Models', 'Adversarial Training'],
                url: 'https://arxiv.org/abs/1406.2661',
                timeline: 2014,
                unlocked: false
            },
            
            // Attention Era (2017)
            'attention_is_all_you_need_2017': {
                id: 'attention_is_all_you_need_2017',
                title: 'Attention Is All You Need',
                authors: 'Vaswani et al.',
                year: 2017,
                venue: 'NIPS',
                phase: 'attention_era',
                description: 'THE breakthrough paper. Introduced the Transformer architecture, showing that attention mechanisms alone are sufficient for state-of-the-art results. No recurrence, no convolution - just attention.',
                impact: 'Revolutionized NLP and AI. Led to BERT, GPT, and modern LLMs',
                keywords: ['Transformer', 'Attention', 'NLP', 'Breakthrough'],
                url: 'https://arxiv.org/abs/1706.03762',
                timeline: 2017,
                unlocked: false,
                isBreakthrough: true
            },
            
            'transformer_analysis_2017': {
                id: 'transformer_analysis_2017',
                title: 'The Annotated Transformer',
                authors: 'Rush',
                year: 2017,
                venue: 'Blog Post',
                phase: 'attention_era',
                description: 'Detailed walkthrough of the Transformer architecture. Made the complex paper accessible to practitioners.',
                impact: 'Helped widespread adoption of Transformers',
                keywords: ['Transformer', 'Tutorial', 'Education'],
                url: 'http://nlp.seas.harvard.edu/annotated-transformer/',
                timeline: 2017,
                unlocked: false
            },
            
            // Post-Attention Era (2018-2019)
            'bert_2018': {
                id: 'bert_2018',
                title: 'BERT: Pre-training of Deep Bidirectional Transformers',
                authors: 'Devlin et al. (Google)',
                year: 2018,
                venue: 'NAACL',
                phase: 'post_attention',
                description: 'Introduced BERT - Bidirectional Encoder Representations from Transformers. Pre-trained on massive text, fine-tuned for tasks. Achieved SOTA on 11 NLP tasks.',
                impact: 'Became foundation for most NLP applications. Google open-sourced it.',
                keywords: ['BERT', 'NLP', 'Pre-training', 'Transformers'],
                url: 'https://arxiv.org/abs/1810.04805',
                timeline: 2018,
                unlocked: false,
                isBreakthrough: true
            },
            
            'gpt_2018': {
                id: 'gpt_2018',
                title: 'Improving Language Understanding by Generative Pre-Training',
                authors: 'Radford et al. (OpenAI)',
                year: 2018,
                venue: 'Blog Post',
                phase: 'post_attention',
                description: 'Introduced GPT - Generative Pre-trained Transformer. Showed that large-scale pre-training on diverse text improves downstream task performance.',
                impact: 'Led to GPT-2, GPT-3, GPT-4. Foundation of modern LLMs.',
                keywords: ['GPT', 'Language Models', 'Pre-training', 'OpenAI'],
                url: 'https://openai.com/research/language-unsupervised',
                timeline: 2018,
                unlocked: false,
                isBreakthrough: true
            },
            
            'gpt2_2019': {
                id: 'gpt2_2019',
                title: 'Language Models are Unsupervised Multitask Learners',
                authors: 'Radford et al. (OpenAI)',
                year: 2019,
                venue: 'Blog Post',
                phase: 'post_attention',
                description: 'GPT-2: 1.5B parameter model. Showed that scaling up language models improves performance across tasks without task-specific training.',
                impact: 'Demonstrated power of scaling. Initially withheld due to concerns.',
                keywords: ['GPT-2', 'Scaling', 'Language Models', 'OpenAI'],
                url: 'https://openai.com/research/better-language-models',
                timeline: 2019,
                unlocked: false
            },
            
            'ulmfit_2018': {
                id: 'ulmfit_2018',
                title: 'Universal Language Model Fine-tuning for Text Classification',
                authors: 'Howard & Ruder',
                year: 2018,
                venue: 'ACL',
                phase: 'post_attention',
                description: 'Introduced transfer learning for NLP. Pre-train on large corpus, fine-tune for specific tasks. Achieved SOTA with minimal data.',
                impact: 'Established transfer learning paradigm for NLP',
                keywords: ['Transfer Learning', 'NLP', 'Fine-tuning'],
                url: 'https://arxiv.org/abs/1801.06146',
                timeline: 2018,
                unlocked: false
            },
            
            'elmo_2018': {
                id: 'elmo_2018',
                title: 'Deep Contextualized Word Representations',
                authors: 'Peters et al.',
                year: 2018,
                venue: 'NAACL',
                phase: 'post_attention',
                description: 'ELMo: Embeddings from Language Models. Contextualized word representations that improve NLP performance.',
                impact: 'Precursor to BERT, showed importance of context',
                keywords: ['ELMo', 'Word Embeddings', 'NLP'],
                url: 'https://arxiv.org/abs/1802.05365',
                timeline: 2018,
                unlocked: false
            },
            
            // Additional Important Papers
            'alphago_2016': {
                id: 'alphago_2016',
                title: 'Mastering the game of Go with deep neural networks',
                authors: 'Silver et al. (DeepMind)',
                year: 2016,
                venue: 'Nature',
                phase: 'pre_attention',
                description: 'AlphaGo defeats world champion Lee Sedol. Combined deep learning with Monte Carlo tree search. Historic moment for AI.',
                impact: 'Showed AI could master complex games. Captured public imagination.',
                keywords: ['AlphaGo', 'Reinforcement Learning', 'Game AI', 'DeepMind'],
                url: 'https://www.nature.com/articles/nature16961',
                timeline: 2016,
                unlocked: false,
                isBreakthrough: true
            },
            
            'word2vec_2013': {
                id: 'word2vec_2013',
                title: 'Efficient Estimation of Word Representations in Vector Space',
                authors: 'Mikolov et al.',
                year: 2013,
                venue: 'arXiv',
                phase: 'pre_attention',
                description: 'Word2Vec: Learned word embeddings that capture semantic relationships. "King - Man + Woman = Queen"',
                impact: 'Revolutionized NLP, made word embeddings practical',
                keywords: ['Word2Vec', 'Word Embeddings', 'NLP'],
                url: 'https://arxiv.org/abs/1301.3781',
                timeline: 2013,
                unlocked: false
            },
            
            'imagenet_2012': {
                id: 'imagenet_2012',
                title: 'ImageNet Classification with Deep Convolutional Neural Networks',
                authors: 'Krizhevsky et al.',
                year: 2012,
                venue: 'NIPS',
                phase: 'pre_attention',
                description: 'AlexNet: Won ImageNet 2012, started deep learning revolution. 8 layers, GPU training, dropout.',
                impact: 'Kicked off deep learning boom. 10x error reduction.',
                keywords: ['AlexNet', 'CNN', 'ImageNet', 'Deep Learning'],
                url: 'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks',
                timeline: 2012,
                unlocked: false,
                isBreakthrough: true
            }
        };
    }
    
    /**
     * Schedule papers based on timeline
     */
    schedulePapers() {
        return [
            // Early papers (unlock early in game)
            { paperId: 'imagenet_2012', unlockDay: 5, phase: 'pre_attention' },
            { paperId: 'word2vec_2013', unlockDay: 10, phase: 'pre_attention' },
            { paperId: 'vgg_net_2014', unlockDay: 15, phase: 'pre_attention' },
            { paperId: 'gan_2014', unlockDay: 20, phase: 'pre_attention' },
            { paperId: 'batch_norm_2015', unlockDay: 25, phase: 'pre_attention' },
            { paperId: 'resnet_2015', unlockDay: 30, phase: 'pre_attention' },
            { paperId: 'lstm_2015', unlockDay: 35, phase: 'pre_attention' },
            { paperId: 'alphago_2016', unlockDay: 40, phase: 'pre_attention' },
            
            // Attention era (unlock when reaching attention phase)
            { paperId: 'attention_is_all_you_need_2017', unlockDay: 50, phase: 'attention_era', requiresPhase: true },
            { paperId: 'transformer_analysis_2017', unlockDay: 52, phase: 'attention_era', requiresPhase: true },
            
            // Post-attention era
            { paperId: 'elmo_2018', unlockDay: 60, phase: 'post_attention', requiresPhase: true },
            { paperId: 'ulmfit_2018', unlockDay: 62, phase: 'post_attention', requiresPhase: true },
            { paperId: 'bert_2018', unlockDay: 65, phase: 'post_attention', requiresPhase: true },
            { paperId: 'gpt_2018', unlockDay: 67, phase: 'post_attention', requiresPhase: true },
            { paperId: 'gpt2_2019', unlockDay: 75, phase: 'post_attention', requiresPhase: true }
        ];
    }
    
    /**
     * Check for new papers to add to inbox
     */
    checkForNewPapers() {
        if (!this.gameState || !this.gameState.timeManager) return;
        
        const currentDay = this.gameState.timeManager?.totalDays || 1;
        const currentPhase = (this.gameState.aiTrainingStoryline && this.gameState.aiTrainingStoryline?.currentPhase) 
            ? this.gameState.aiTrainingStoryline.currentPhase 
            : 'pre_attention';
        
        // Check scheduled papers
        this.scheduledPapers.forEach(schedule => {
            const paper = this.papers[schedule.paperId];
            if (!paper || paper.unlocked) return;
            
            // Check if day requirement met
            if (currentDay < schedule.unlockDay) return;
            
            // Check if phase requirement met
            if (schedule.requiresPhase && currentPhase !== schedule.phase) return;
            
            // Unlock and add to inbox
            this.unlockPaper(schedule.paperId);
        });
    }
    
    /**
     * Unlock a paper and add to inbox
     */
    unlockPaper(paperId) {
        const paper = this.papers[paperId];
        if (!paper || paper.unlocked) return;
        
        paper.unlocked = true;
        
        // Add to inbox
        this.inbox.push({
            id: `notification_${Date.now()}_${paperId}`,
            paperId: paperId,
            paper: paper,
            receivedAt: Date.now(),
            read: false,
            isBreakthrough: paper.isBreakthrough || false
        });
        
        // Show notification (only if game is initialized)
        try {
            if (window.game && window.game.showToast && typeof window.game.showToast === 'function') {
                const message = paper.isBreakthrough 
                    ? ` BREAKTHROUGH: ${paper.title} published!`
                    : ` New Research Paper: ${paper.title}`;
                window.game.showToast(message, 'info');
            }
        } catch (error) {
            console.warn('Could not show paper notification:', error);
        }
        
        return this.inbox[this.inbox.length - 1];
    }
    
    /**
     * Get inbox (unread first)
     */
    getInbox() {
        return this.inbox.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return b.receivedAt - a.receivedAt;
        });
    }
    
    /**
     * Get unread count
     */
    getUnreadCount() {
        return this.inbox.filter(item => !item.read).length;
    }
    
    /**
     * Mark paper as read
     */
    markAsRead(notificationId) {
        const notification = this.inbox.find(item => item.id === notificationId);
        if (notification) {
            notification.read = true;
            this.readPapers.add(notification.paperId);
        }
    }
    
    /**
     * Get paper by ID
     */
    getPaper(paperId) {
        return this.papers[paperId];
    }
    
    /**
     * Get papers by phase
     */
    getPapersByPhase(phase) {
        return Object.values(this.papers).filter(paper => paper.phase === phase && paper.unlocked);
    }
    
    /**
     * Get breakthrough papers
     */
    getBreakthroughPapers() {
        return Object.values(this.papers).filter(paper => paper.isBreakthrough && paper.unlocked);
    }
    
    /**
     * Serialize for save
     */
    toJSON() {
        return {
            inbox: this.inbox,
            readPapers: Array.from(this.readPapers),
            papers: Object.fromEntries(
                Object.entries(this.papers).map(([id, paper]) => [id, { unlocked: paper.unlocked }])
            )
        };
    }
    
    /**
     * Deserialize from save
     */
    fromJSON(data) {
        if (data.inbox) this.inbox = data.inbox;
        if (data.readPapers) this.readPapers = new Set(data.readPapers);
        if (data.papers) {
            Object.entries(data.papers).forEach(([id, state]) => {
                if (this.papers[id]) {
                    this.papers[id].unlocked = state.unlocked;
                }
            });
        }
    }
}

