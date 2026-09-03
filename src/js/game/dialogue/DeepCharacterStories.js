/**
 * DeepCharacterStories.js
 * Rich, detailed stories for each character
 * Dialogue reveals character depth and personal arcs
 */

export const CHARACTER_STORIES = {
    professor_higgins: {
        personalStory: {
            background: "Grew up in a small farming town, first in his family to attend college. Worked three jobs to pay for his education. Lost his father to cancer when he was 20, which inspired him to use data science for medical research.",
            motivation: "Wants to ensure no student struggles like he did. Believes education should be accessible to everyone.",
            secret: "He's secretly working on a cancer detection algorithm in his spare time, named after his father. Hasn't published it yet because he's afraid it won't be good enough.",
            dream: "To create a scholarship fund for first-generation college students in data science.",
            fear: "That his research won't make a real difference, that he's wasting his time.",
            relationship: "Married for 30 years to his college sweetheart. They met in a statistics class. Has two grown children, both in tech.",
            turningPoint: "When his first student got a job at Google, he cried. That's when he knew he was making a difference.",
            philosophy: "Data science isn't about numbers - it's about people. Every dataset tells a human story."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "You know, I didn't always have it easy. I grew up on a farm, and my family didn't have much. But I was determined to learn, to understand how the world works through data."
            },
            {
                relationshipLevel: 25,
                topic: 'father',
                dialogue: "My father passed away when I was young. Cancer. That's... that's part of why I do what I do. I want to help find answers, even if I can't save everyone."
            },
            {
                relationshipLevel: 40,
                topic: 'secret_project',
                dialogue: "I've been working on something in my spare time. A cancer detection algorithm. I named it after my father. It's not ready yet, but... maybe someday it could help someone."
            },
            {
                relationshipLevel: 60,
                topic: 'dream',
                dialogue: "I want to start a scholarship fund. For students like I was - first in their family to go to college. Education shouldn't be a privilege, it should be a right."
            },
            {
                relationshipLevel: 80,
                topic: 'philosophy',
                dialogue: "After all these years, I've learned one thing: data science isn't about the numbers. It's about the people behind the numbers. Every dataset is a story waiting to be told."
            }
        ]
    },

    sarah_martinez: {
        personalStory: {
            background: "Started as a barista, taught herself Python at night. Worked her way up from data entry to senior analyst. Single mother of two, works 60-hour weeks to provide for her kids.",
            motivation: "Wants to prove that anyone can succeed with hard work. Determined to give her children opportunities she never had.",
            secret: "She's been offered a C-suite position at a startup, but turned it down because it would mean less time with her kids. She struggles with this decision daily.",
            dream: "To start her own consulting firm, work flexible hours, and be present for her children's milestones.",
            fear: "That she's not doing enough, that she's failing as both a mother and a professional.",
            relationship: "Divorced, co-parents with her ex. Her kids are 8 and 12. They're her whole world.",
            turningPoint: "When her daughter said 'Mommy, you're so smart' after seeing her present at a conference. That moment changed everything.",
            philosophy: "Balance is a myth. You make choices, and you live with them. But you can still be great at what you do."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I didn't go to an Ivy League school. I started as a barista, taught myself to code at night. But here I am. Hard work beats pedigree every time."
            },
            {
                relationshipLevel: 25,
                topic: 'kids',
                dialogue: "My kids are my motivation. Everything I do, I do for them. I want them to see that their mom can be successful, that they can be anything."
            },
            {
                relationshipLevel: 40,
                topic: 'struggle',
                dialogue: "It's hard, you know? Balancing work and being a mom. Sometimes I feel like I'm failing at both. But I keep going, because I have to."
            },
            {
                relationshipLevel: 60,
                topic: 'secret',
                dialogue: "I was offered a C-suite position. More money, more prestige. But it would mean less time with my kids. I said no. Sometimes the right choice is the hardest one."
            },
            {
                relationshipLevel: 80,
                topic: 'dream',
                dialogue: "Someday, I want to start my own firm. Work on my own terms, be there for my kids. But for now, I'm building the foundation. One day at a time."
            }
        ]
    },

    mike_johnson: {
        personalStory: {
            background: "Former athlete, injured his knee in college. Had to pivot from sports to business. Uses his competitive drive in marketing. Known for his networking skills.",
            motivation: "Wants to prove that you can reinvent yourself. Believes in the power of connections and relationships.",
            secret: "He's actually an introvert who forces himself to network. It exhausts him, but he knows it's necessary for success.",
            dream: "To retire early and write a book about networking for introverts.",
            fear: "That people will discover he's not as confident as he appears, that he's just faking it.",
            relationship: "Married, two kids. His wife is his anchor. She's the only person who sees the real him.",
            turningPoint: "When he realized that networking isn't about being the loudest person in the room - it's about listening and making genuine connections.",
            philosophy: "Everyone has a story. If you listen, you'll learn something valuable. And they'll remember you for it."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I used to be an athlete. College football. Then I blew out my knee. Had to find a new path. Marketing seemed like a good fit - still competitive, just different rules."
            },
            {
                relationshipLevel: 25,
                topic: 'networking',
                dialogue: "People think I'm a natural networker. Truth is, I'm actually pretty introverted. But I learned that networking isn't about being loud - it's about listening."
            },
            {
                relationshipLevel: 40,
                topic: 'secret',
                dialogue: "These events? They drain me. But I go because I have to. Because connections matter. But when I get home, I need quiet. My wife understands. She's my anchor."
            },
            {
                relationshipLevel: 60,
                topic: 'philosophy',
                dialogue: "I've learned that everyone has something valuable to share. If you listen instead of talking, you'll learn more. And people remember those who listen."
            },
            {
                relationshipLevel: 80,
                topic: 'dream',
                dialogue: "Someday, I want to write a book. 'Networking for Introverts.' Because you don't have to be the loudest person in the room to make connections. You just have to be genuine."
            }
        ]
    },

    lisa_wong: {
        personalStory: {
            background: "Dropped out of college to start her first company at 19. Failed twice before succeeding. Now runs a successful AI startup. Known for her intensity and drive.",
            motivation: "Wants to prove that failure is just data. Each failure taught her something valuable. Now she's unstoppable.",
            secret: "She still talks to her first failed startup's co-founder. They're best friends. That failure brought them closer than success ever could.",
            dream: "To build a company that changes the world, not just makes money. Wants to use AI for social good.",
            fear: "That she'll fail again, that this success is temporary, that she'll lose everything.",
            relationship: "Single, by choice. Says relationships are a distraction. But secretly, she's lonely. Her work is her life.",
            turningPoint: "When her third startup got its first million in funding. She didn't celebrate - she just worked harder. That's when she knew she was different.",
            philosophy: "Failure isn't the opposite of success - it's part of success. Every failure is data. Learn from it, iterate, improve."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I dropped out of college at 19. Started my first company. Failed. Started another. Failed again. But I learned. And now? Now I'm here. Failure is just data."
            },
            {
                relationshipLevel: 25,
                topic: 'intensity',
                dialogue: "People say I'm intense. They're right. But intensity gets results. I don't have time for half-measures. Either you're all in, or you're out."
            },
            {
                relationshipLevel: 40,
                topic: 'secret',
                dialogue: "My first startup's co-founder? We're still friends. Best friends, actually. That failure... it taught us more than success ever could. We learned who we really are."
            },
            {
                relationshipLevel: 60,
                topic: 'fear',
                dialogue: "I'm terrified of failing again. Every day, I wake up wondering if this is the day it all falls apart. But that fear? It drives me. It makes me better."
            },
            {
                relationshipLevel: 80,
                topic: 'dream',
                dialogue: "I don't just want to make money. I want to change the world. Use AI for good. Help people. That's the real goal. The money? That's just a byproduct."
            }
        ]
    },

    emma_bloom: {
        personalStory: {
            background: "Quiet librarian who loves books and data. Has a master's in library science and a passion for information architecture. Spends her free time reading research papers.",
            motivation: "Believes that knowledge should be accessible to everyone. Sees herself as a bridge between information and people.",
            secret: "She's actually published three research papers under a pseudonym. She's too shy to claim them publicly, but she's proud of her work.",
            dream: "To digitize rare historical documents and make them searchable using AI. Wants to preserve history for future generations.",
            fear: "That she's wasting her potential, that she should be doing more, that she's too quiet to make a real impact.",
            relationship: "Single, lives alone with her cat. Has a few close friends, but prefers books to people most of the time.",
            turningPoint: "When a student thanked her for helping them find the perfect research paper. That moment made her realize her work matters.",
            philosophy: "Information is power, but only if it's accessible. My job is to make sure everyone can find what they need."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I've always loved books. Information. Knowledge. There's something beautiful about organizing information, making it accessible. That's why I became a librarian."
            },
            {
                relationshipLevel: 25,
                topic: 'quiet',
                dialogue: "I know I'm quiet. People think that means I'm not doing anything important. But silence doesn't mean absence. I'm here, I'm working, I'm helping."
            },
            {
                relationshipLevel: 40,
                topic: 'secret',
                dialogue: "I've published research papers. Three of them. Under a pseudonym. I'm too shy to claim them publicly, but... I'm proud of the work. It matters to me."
            },
            {
                relationshipLevel: 60,
                topic: 'dream',
                dialogue: "I want to digitize historical documents. Make them searchable with AI. Preserve history for future generations. That's my real dream. Not just organizing books, but preserving knowledge."
            },
            {
                relationshipLevel: 80,
                topic: 'philosophy',
                dialogue: "Information is power, but only if people can access it. My job isn't just to organize books - it's to be a bridge. Between information and people. Between the past and the future."
            }
        ],
        phases: [
            {
                id: 'phase_1',
                title: 'The Intellectual Connection',
                trigger: { relationship: 15 },
                dialogue: "I... I have something to show you. These are some papers I've been reading. I don't usually share them.",
                options: [
                    {
                        text: "I'd love to read your research papers properly.",
                        flag: 'emma_support_academic',
                        response: "You... you would? Most people find the bibliography sections boring. I'll bring some for you next time.",
                        effects: { intelligence: 5, relationship: 5 }
                    },
                    {
                        text: "You have so much to offer, Emma. You shouldn't stay hidden.",
                        flag: 'emma_support_social',
                        response: "I feel safe here, surrounded by history. But maybe... maybe a little change wouldn't hurt.",
                        effects: { relationship: 10 }
                    },
                    {
                        text: "This library is a treasure trove. We could modernize it.",
                        flag: 'emma_support_library',
                        response: "I've always thought so. Information shouldn't be static. It should be alive.",
                        effects: { ethics: 5, relationship: 5 }
                    }
                ]
            },
            {
                id: 'phase_2',
                title: 'The Secret Revealed',
                trigger: { relationship: 35, flag: 'phase_1_complete' }, // flag check logic handled in system
                dialogue: "I have to make a choice. A journal wants to interview 'E.B.' about my latest paper. They don't know it's me.",
                options: [
                    {
                        text: "Your research is vital. Keep publishing anonymously.",
                        flag: 'emma_choice_pseudonym',
                        response: "You're right. The work is what matters, not the fame. Thank you for understanding.",
                        effects: { ethics: 5, relationship: 10 }
                    },
                    {
                        text: "It's time the world knew who 'E.B.' really is.",
                        flag: 'emma_choice_public',
                        response: "It's terrifying... but maybe you're right. Maybe it's time to step into the light.",
                        effects: { karma: 10, relationship: 5 } // karma mapped to charisma context in plan, using closest simple stat or ignoring if not present
                    },
                    {
                        text: "Let's work together. My data science, your history.",
                        flag: 'emma_choice_collab',
                        response: "A collaboration? That... that sounds wonderful. We could do so much together.",
                        effects: { intelligence: 5, relationship: 15 }
                    }
                ]
            },
            {
                id: 'phase_3',
                title: 'The Digitization Project',
                trigger: { relationship: 55, flag: 'phase_2_complete' },
                dialogue: "The project has been approved! We're starting the digitization. But I need your advice on the priority.",
                options: [
                    {
                        text: "Focus on speed and efficiency. Get it done fast.",
                        flag: 'emma_project_efficiency',
                        response: "Efficiency... yes. We have so much to get through. Scaling it up is the logical choice.",
                        effects: { logic: 5, relationship: 5 }
                    },
                    {
                        text: "Preserve the notes and human touches. The context.",
                        flag: 'emma_project_human',
                        response: "I was hoping you'd say that. The margin notes are where the real stories are.",
                        effects: { ethics: 5, relationship: 10 }
                    },
                    {
                        text: "Make it free and accessible to everyone.",
                        flag: 'emma_project_access',
                        response: "Yes! Universal access. That's the whole point of a library, isn't it?",
                        effects: { reputation: 10, relationship: 5 }
                    }
                ]
            },
            {
                id: 'phase_4',
                title: 'The Final Choice',
                trigger: { relationship: 80, flag: 'phase_3_complete' },
                dialogue: "It's done. The project is a success. And... I've been offered a position at the University. Or I could stay.",
                options: [
                    {
                        text: "Take the University job. You're a professor at heart.",
                        flag: 'emma_final_professor',
                        response: "Professor Bloom... it has a nice ring to it. I think I will. Thank you for pushing me.",
                        effects: { relationship: 10, final_outcome: 'professor' }
                    },
                    {
                        text: "Stay here. Make this library the city's info hub.",
                        flag: 'emma_final_librarian',
                        response: "You're right. My heart is here. We can transform this place into something amazing.",
                        effects: { relationship: 10, final_outcome: 'tech_librarian' }
                    },
                    {
                        text: "Whatever you do, I want to be by your side.",
                        flag: 'emma_final_partner',
                        response: "That's all I wanted to hear. Past, future... it doesn't matter as long as we're together.",
                        effects: { relationship: 20, final_outcome: 'partner' }
                    }
                ]
            }
        ]
    },

    alex_rivera: {
        personalStory: {
            background: "Former hacker turned security consultant. Got caught hacking as a teenager, but instead of jail, a judge gave him community service at a tech company. Changed his life.",
            motivation: "Wants to prove that people can change, that mistakes don't define you. Uses his skills for good now.",
            secret: "He still hacks, but legally. Does bug bounties and security audits. The thrill never left, but now he channels it productively.",
            dream: "To start a program that teaches at-risk youth to code and hack ethically. Wants to give others the second chance he got.",
            fear: "That people will always see him as a criminal, that his past will follow him forever, that he'll never fully escape it.",
            relationship: "Married to a cybersecurity lawyer. She understands his past and supports his mission. They're a perfect match.",
            turningPoint: "When he prevented a major data breach at his first job. That's when he realized he could use his skills for good, not just for himself.",
            philosophy: "Your past doesn't define you, but it shapes you. Use what you've learned to help others. That's how you truly change."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I used to hack. Got caught when I was 17. But instead of jail, a judge gave me community service at a tech company. Changed my whole life. Sometimes second chances are everything."
            },
            {
                relationshipLevel: 25,
                topic: 'change',
                dialogue: "People think you can't change. That once a hacker, always a hacker. But I did. I use my skills for good now. I help companies secure their systems. I protect people."
            },
            {
                relationshipLevel: 40,
                topic: 'secret',
                dialogue: "I still hack. Legally, of course. Bug bounties, security audits. The thrill never left. But now I channel it productively. I use it to help, not hurt."
            },
            {
                relationshipLevel: 60,
                topic: 'fear',
                dialogue: "I'm always afraid people will see me as a criminal. That my past will follow me. But I can't let that stop me. I have to prove that people can change."
            },
            {
                relationshipLevel: 80,
                topic: 'dream',
                dialogue: "I want to start a program. Teach at-risk youth to code, to hack ethically. Give them the second chance I got. Show them they can use their skills for good. That's my mission."
            }
        ]
    },

    james_wilson: {
        personalStory: {
            background: "Runs a top consulting firm. Former Ivy League, former Wall Street. Knows how to wear a suit and bill by the hour.",
            motivation: "Solving high-level problems for the world's biggest companies (and getting paid well for it).",
            secret: "He's burned out. The travel, the hotels, the PowerPoint decks... he sometimes dreams of quitting to run a quiet bookstore.",
            dream: "To retire to a vineyard in Italy. No phones. No clients. Just grapes and time.",
            fear: "Becoming irrelevant.",
            relationship: "Divorced three times. \"Married to the firm.\"",
            turningPoint: "Winning a massive government contract that saved his firm from bankruptcy.",
            philosophy: "Perception is reality. If you look like the expert, you are the expert."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I've been in boardrooms you only read about in the news. The stakes are always high."
            },
            {
                relationshipLevel: 25,
                topic: 'philosophy',
                dialogue: "It's not just about the data. It's about the narrative. Can you tell a story that justifies a billion-dollar decision?"
            },
            {
                relationshipLevel: 40,
                topic: 'burnout',
                dialogue: "Another airport lounge. Another hotel. Sometimes the glamour wears thin, you know?"
            },
            {
                relationshipLevel: 60,
                topic: 'secret_dream',
                dialogue: "Italy. A vineyard. No phones. No clients. Just grapes and time. That's the exit strategy."
            },
            {
                relationshipLevel: 80,
                topic: 'regret',
                dialogue: "I've sacrificed a lot for this career. Families. Friends. Make sure you don't lose yourself in the hustle."
            }
        ]
    },

    david_chen: {
        personalStory: {
            background: "Immigrant who came to the country with $50 in his pocket. Built a tech company from scratch, sold it for millions. Now invests in others' dreams.",
            motivation: "Wants to give others the opportunities he didn't have. Believes in paying it forward.",
            secret: "He's actually broke. Lost everything in a bad investment. But he keeps up appearances because he doesn't want to disappoint the people who believe in him.",
            dream: "To rebuild his fortune honestly, to prove he can succeed again without cutting corners.",
            fear: "That people will discover he's lost everything, that he's a fraud, that he'll never recover.",
            relationship: "Divorced. His ex-wife took everything. They don't speak. He's alone, but he won't admit it.",
            turningPoint: "When he realized that money doesn't define success - impact does. That's when he started investing in people, not just companies.",
            philosophy: "Wealth is temporary. Impact is permanent. Invest in people, not portfolios."
        },
        storyReveals: [
            {
                relationshipLevel: 15,
                topic: 'background',
                dialogue: "I came here with nothing. Fifty dollars in my pocket. No English, no connections. But I had determination. That's all you need, really."
            },
            {
                relationshipLevel: 30,
                topic: 'philosophy',
                dialogue: "Money comes and goes. But impact? Impact lasts. I'd rather invest in a person with a dream than a company with a balance sheet."
            },
            {
                relationshipLevel: 50,
                topic: 'secret',
                dialogue: "The truth? I've lost everything. Bad investment. But I can't let people know. They believe in me. I have to prove I can rebuild. I have to."
            },
            {
                relationshipLevel: 70,
                topic: 'fear',
                dialogue: "I'm terrified they'll find out. That I'm a fraud. That I'm broke. But I keep going because I have to. Because giving up isn't an option."
            },
            {
                relationshipLevel: 90,
                topic: 'dream',
                dialogue: "I want to rebuild. Honestly. Without cutting corners. To prove that I can succeed again. That failure isn't the end - it's just data for the next attempt."
            }
        ]
    },

    donna_delight: {
        personalStory: {
            background: "Former corporate executive who quit to follow her passion. Always loved baking. Opened the donut shop after her mother passed away - it was her mother's dream.",
            motivation: "Wants to honor her mother's memory. Believes in finding joy in simple things.",
            secret: "She's actually a millionaire. Inherited money from her mother. But she prefers the simple life. The donut shop is her sanctuary.",
            dream: "To open a baking school for underprivileged kids. Teach them that they can build something beautiful with their hands.",
            fear: "That she's wasting her potential, that she should be doing more, that her mother would be disappointed.",
            relationship: "Widowed. Her husband died five years ago. The donut shop keeps her going. Her regulars are her family now.",
            turningPoint: "When a child's face lit up after trying her donuts. That's when she knew she was exactly where she was meant to be.",
            philosophy: "Happiness isn't found in boardrooms. It's found in the simple moments. A perfect donut. A smile. That's what matters."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I used to work in a corporate office. Suits, meetings, stress. But I always loved baking. So I quit. Best decision I ever made."
            },
            {
                relationshipLevel: 25,
                topic: 'mother',
                dialogue: "This shop? It was my mother's dream. She passed away before she could open it. So I did it for her. Every donut is made with love, just like she would have wanted."
            },
            {
                relationshipLevel: 40,
                topic: 'husband',
                dialogue: "My husband... he's been gone five years now. But this shop? It keeps me going. The regulars, they're my family. I'm not alone here."
            },
            {
                relationshipLevel: 60,
                topic: 'secret',
                dialogue: "I have money. A lot of it. Inheritance. But I don't need it. This shop, this simple life? This is what makes me happy. Money can't buy that."
            },
            {
                relationshipLevel: 80,
                topic: 'dream',
                dialogue: "I want to open a baking school. For kids who don't have opportunities. Teach them that they can create something beautiful. That they matter. That's my real dream."
            }
        ]
    },

    brad_sterling: {
        personalStory: {
            background: "Grew up wealthy, everything handed to him. Never had to work for anything. Now he's terrified of failure because he's never experienced it.",
            motivation: "Wants to prove he's not just a trust fund kid. Desperately needs validation that he earned his success.",
            secret: "He's actually insecure. All the bravado is a mask. He's terrified that without his family's money, he'd be nothing.",
            dream: "To achieve something on his own, without his family's help. To prove he's more than his last name.",
            fear: "That he's a fraud, that he'd be nothing without his family, that everyone sees through him.",
            relationship: "Estranged from his family. They don't approve of his career choice. He's alone, but he won't admit it.",
            turningPoint: "When he realized that competition isn't about beating others - it's about becoming better than you were yesterday.",
            philosophy: "Success isn't inherited. It's earned. Every day, I have to prove I deserve it."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "Yeah, I grew up with money. So what? That doesn't mean I don't work hard. I have to prove myself every single day."
            },
            {
                relationshipLevel: 25,
                topic: 'insecurity',
                dialogue: "People think I'm arrogant. Maybe I am. But it's because I'm terrified. Terrified that without my family's name, I'd be nothing. I have to prove I'm more."
            },
            {
                relationshipLevel: 40,
                topic: 'family',
                dialogue: "My family? We don't talk. They don't approve of my career. Think I'm wasting my potential. But this is MY choice. MY path. Not theirs."
            },
            {
                relationshipLevel: 60,
                topic: 'fear',
                dialogue: "I'm scared. All the time. That I'm a fraud. That everyone sees through me. That I'd be nothing without my last name. But I keep going. I have to."
            },
            {
                relationshipLevel: 80,
                topic: 'philosophy',
                dialogue: "I've learned something. Competition isn't about beating others. It's about becoming better than you were yesterday. That's the real win. That's what matters."
            }
        ]
    },

    jordan_kim: {
        personalStory: {
            background: "Former athlete who had to retire due to injury. Found purpose in helping others achieve their fitness goals. Uses exercise as therapy.",
            motivation: "Wants to help others overcome their limitations, both physical and mental.",
            secret: "He still struggles with depression from losing his athletic career. The gym is his therapy, and helping others helps him heal.",
            dream: "To open a gym that focuses on mental health as much as physical health. Combine therapy with fitness.",
            fear: "That he'll never find purpose again, that he's just going through the motions, that he's not making a real difference.",
            relationship: "Single. Focused on his work. Hasn't dated since his injury. Too afraid to let anyone see his vulnerability.",
            turningPoint: "When a client thanked him for saving their life - not just their health, but their mental health. That's when he found his purpose.",
            philosophy: "The body and mind are connected. You can't heal one without the other. Fitness is therapy. Movement is medicine."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I used to be an athlete. Professional level. Then I got injured. Career over, just like that. But I found a new purpose. Helping others."
            },
            {
                relationshipLevel: 25,
                topic: 'struggle',
                dialogue: "Losing my career? It broke me. I still struggle with it. But the gym? It's my therapy. Helping others helps me heal. It gives me purpose."
            },
            {
                relationshipLevel: 40,
                topic: 'philosophy',
                dialogue: "People think fitness is just about the body. It's not. It's about the mind too. You can't heal one without the other. Movement is medicine."
            },
            {
                relationshipLevel: 60,
                topic: 'dream',
                dialogue: "I want to open a gym. One that focuses on mental health as much as physical. Combine therapy with fitness. Because they're connected. They always have been."
            },
            {
                relationshipLevel: 80,
                topic: 'purpose',
                dialogue: "A client once told me I saved their life. Not just their health - their mental health. That's when I knew. This is my purpose. This is why I'm here."
            }
        ]
    },

    flora_bloom: {
        personalStory: {
            background: "Former corporate lawyer who had a breakdown. Found peace in nature. Quit everything to open a flower shop. Never looked back.",
            motivation: "Wants to bring beauty and peace to people's lives. Believes in the healing power of nature.",
            secret: "She still has panic attacks. But working with plants calms her. The shop is her safe space.",
            dream: "To create a community garden where people can come to heal, to find peace, to connect with nature.",
            fear: "That she'll have another breakdown, that she's not strong enough, that she'll lose everything again.",
            relationship: "Single. Prefers plants to people. Has a few close friends, but mostly keeps to herself. Finds peace in solitude.",
            turningPoint: "When she realized that healing isn't linear. That it's okay to struggle. That plants don't judge. They just grow.",
            philosophy: "Nature doesn't rush, yet everything gets done. We should learn from that. Slow down. Breathe. Grow."
        },
        storyReveals: [
            {
                relationshipLevel: 10,
                topic: 'background',
                dialogue: "I used to be a lawyer. Corporate law. High stress, high stakes. Then I had a breakdown. Found peace in nature. Never looked back."
            },
            {
                relationshipLevel: 25,
                topic: 'healing',
                dialogue: "Plants don't judge. They don't rush. They just grow. At their own pace. I've learned to do the same. Healing isn't linear. It's okay to struggle."
            },
            {
                relationshipLevel: 40,
                topic: 'secret',
                dialogue: "I still have panic attacks. Sometimes. But working with plants? It calms me. This shop is my safe space. My sanctuary."
            },
            {
                relationshipLevel: 60,
                topic: 'dream',
                dialogue: "I want to create a community garden. A place where people can come to heal. To find peace. To connect with nature. Because nature heals. I know it does."
            },
            {
                relationshipLevel: 80,
                topic: 'philosophy',
                dialogue: "Nature doesn't rush, yet everything gets done. We should learn from that. Slow down. Breathe. Grow. At your own pace. That's the secret to peace."
            }
        ]
    }
};

/**
 * Get story reveal for character at relationship level
 */
export function getStoryReveal(npcId, relationshipLevel, topic = null) {
    const story = CHARACTER_STORIES[npcId];
    if (!story) return null;

    // Find the highest relationship level reveal that's been unlocked
    const reveals = story.storyReveals
        .filter(reveal => relationshipLevel >= reveal.relationshipLevel)
        .sort((a, b) => b.relationshipLevel - a.relationshipLevel);

    if (topic) {
        const topicReveal = reveals.find(r => r.topic === topic);
        if (topicReveal) return topicReveal;
    }

    return reveals[0] || null;
}

/**
 * Get character's personal story element
 */
export function getCharacterStory(npcId, element) {
    const story = CHARACTER_STORIES[npcId];
    if (!story || !story.personalStory) return null;

    return story.personalStory[element] || null;
}

